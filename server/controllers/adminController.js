const User = require('../models/User')
const Deposit = require('../models/Deposit')
const Redemption = require('../models/Redemption')
const Transaction = require('../models/Transaction')

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    // Run all queries in parallel — Promise.all is faster than awaiting one by one
    const [
      totalUsers,
      totalDeposits,
      validatedDeposits,
      pendingDeposits,
      totalRedemptions,
      pendingRedemptions,
      totalPointsAwarded,
      recentActivity,
      depositsPerDay,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Deposit.countDocuments(),
      Deposit.countDocuments({ status: 'validated' }),
      Deposit.countDocuments({ status: 'pending' }),
      Redemption.countDocuments(),
      Redemption.countDocuments({ status: 'pending' }),

      // Sum all points ever awarded
      Deposit.aggregate([
        { $match: { status: 'validated' } },
        { $group: { _id: null, total: { $sum: '$pointsAwarded' } } },
      ]),

      // Last 5 transactions across all users
      Transaction.find()
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .limit(5),

      // Deposits per day for the last 7 days
      Deposit.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    res.json({
      totalUsers,
      totalDeposits,
      validatedDeposits,
      pendingDeposits,
      totalRedemptions,
      pendingRedemptions,
      totalPointsAwarded: totalPointsAwarded[0]?.total ?? 0,
      recentActivity,
      depositsPerDay,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// append these exports to the same file

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query

    const filter = { role: 'user' }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await User.countDocuments(filter)

    res.json({ users, total })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/admin/users/:id/status  — freeze or reactivate
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || user.role === 'admin') {
      return res.status(404).json({ message: 'User not found' })
    }
    user.isActive = !user.isActive
    await user.save()
    res.json({ isActive: user.isActive })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/admin/users/:id/points  — manually adjust points
const adjustPoints = async (req, res) => {
  try {
    const { amount, reason } = req.body
    if (!amount || amount === 0) {
      return res.status(400).json({ message: 'Amount is required and cannot be zero' })
    }

    const user = await User.findById(req.params.id)
    if (!user || user.role === 'admin') {
      return res.status(404).json({ message: 'User not found' })
    }

    // Prevent going below zero
    if (user.points + amount < 0) {
      return res.status(400).json({ message: 'Cannot reduce points below zero' })
    }

    user.points += amount
    await user.save()

    await Transaction.create({
      userId: user._id,
      type: amount > 0 ? 'earn' : 'spend',
      points: Math.abs(amount),
      reason: reason || `Manual adjustment by admin`,
    })

    res.json({ points: user.points })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getStats, getUsers, toggleUserStatus, adjustPoints }