const Deposit = require('../models/Deposit')
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const generateCode = require('../utils/generateCode')

const POINTS_PER_DEPOSIT = 15 // one constant to rule them all

// ─── ADMIN: generate one or more codes ───────────────────────────────────────
// POST /api/admin/deposits/generate
const generateDeposits = async (req, res) => {
  try {
    const { quantity = 1, centerId } = req.body

    if (quantity < 1 || quantity > 50) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 50' })
    }

    const deposits = []

    for (let i = 0; i < quantity; i++) {
      let code
      let exists = true

      // Keep generating until we get a unique code (collision is extremely rare but we handle it)
      while (exists) {
        code = generateCode()
        exists = await Deposit.findOne({ code })
      }

      deposits.push({
        code,
        centerId: centerId || null,
        generatedBy: req.user.userId,
        status: 'pending',
      })
    }

    const created = await Deposit.insertMany(deposits)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── ADMIN: list all deposits with filters ───────────────────────────────────
// GET /api/admin/deposits
const listDeposits = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    const filter = {}
    if (status) filter.status = status

    const deposits = await Deposit.find(filter)
      .populate('userId', 'name email')       // replace userId ObjectId with name+email
      .populate('centerId', 'name city')
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 })               // newest first
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Deposit.countDocuments(filter)

    res.json({ deposits, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── USER: redeem a code and earn points ─────────────────────────────────────
// POST /api/user/deposits/redeem
const redeemDeposit = async (req, res) => {
  try {
    const { code } = req.body

    if (!code) return res.status(400).json({ message: 'Code is required' })

    // 1. Find the code
    const deposit = await Deposit.findOne({ code: code.toUpperCase().trim() })

    if (!deposit) {
      return res.status(404).json({ message: 'Code not found' })
    }

    // 2. Check it hasn't been used
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'This code has already been used' })
    }

    // 3. Mark deposit as validated and link it to this user
    deposit.status = 'validated'
    deposit.userId = req.user.userId
    deposit.pointsAwarded = POINTS_PER_DEPOSIT
    deposit.usedAt = new Date()
    await deposit.save()

    // 4. Add points to the user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $inc: { points: POINTS_PER_DEPOSIT } }, // $inc increments atomically
      { new: true }                              // return the updated doc
    )

    // 5. Create a transaction record for the history log
    await Transaction.create({
      userId: req.user.userId,
      type: 'earn',
      points: POINTS_PER_DEPOSIT,
      reason: `Diaper deposit – code ${deposit.code}`,
      refModel: 'Deposit',
      refId: deposit._id,
    })

    res.json({
      message: `You earned ${POINTS_PER_DEPOSIT} points!`,
      pointsEarned: POINTS_PER_DEPOSIT,
      totalPoints: user.points,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── USER: get own transaction history ───────────────────────────────────────
// GET /api/user/transactions
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50)

    res.json(transactions)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── ADMIN: manually validate a pending deposit ──────────────────────────────
// PUT /api/admin/deposits/:id/validate
const validateDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id)
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' })
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit is not pending' })
    }

    deposit.status = 'validated'
    deposit.pointsAwarded = POINTS_PER_DEPOSIT
    await deposit.save()

    res.json(deposit)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── ADMIN: reject a pending deposit ─────────────────────────────────────────
// PUT /api/admin/deposits/:id/reject
const rejectDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id)
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' })
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit is not pending' })
    }

    deposit.status = 'rejected'
    await deposit.save()

    res.json(deposit)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  generateDeposits,
  listDeposits,
  redeemDeposit,
  getMyTransactions,
  validateDeposit,
  rejectDeposit,
}