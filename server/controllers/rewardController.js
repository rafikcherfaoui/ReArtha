const Reward = require('../models/Reward')
const Redemption = require('../models/Redemption')
const Transaction = require('../models/Transaction')
const User = require('../models/User')

// ─── PUBLIC: list active rewards ─────────────────────────────────────────────
// GET /api/rewards
const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true }).sort({ pointsCost: 1 })
    res.json(rewards)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── ADMIN: create a reward ───────────────────────────────────────────────────
// POST /api/admin/rewards
const createReward = async (req, res) => {
  try {
    const { title, description, pointsCost, type, stock, imageUrl } = req.body

    if (!title || !pointsCost) {
      return res.status(400).json({ message: 'Title and pointsCost are required' })
    }

    const reward = await Reward.create({
      title,
      description,
      pointsCost,
      type: type || 'physical',
      stock: stock ?? -1,
      imageUrl: imageUrl || '',
    })

    res.status(201).json(reward)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── ADMIN: update a reward ───────────────────────────────────────────────────
// PUT /api/admin/rewards/:id
const updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!reward) return res.status(404).json({ message: 'Reward not found' })
    res.json(reward)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── ADMIN: delete (soft) a reward ───────────────────────────────────────────
// DELETE /api/admin/rewards/:id
const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.deleteOne({ _id: req.params.id })
    if (!reward) return res.status(404).json({ message: 'Reward not found' })
    res.json({ message: 'Reward removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── ADMIN: list all redemptions ──────────────────────────────────────────────
// GET /api/admin/redemptions
const listRedemptions = async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}

    const redemptions = await Redemption.find(filter)
      .populate('userId', 'name email')
      .populate('rewardId', 'title pointsCost')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json(redemptions)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── ADMIN: mark a redemption as fulfilled ────────────────────────────────────
// PUT /api/admin/redemptions/:id/fulfill
const fulfillRedemption = async (req, res) => {
  try {
    const redemption = await Redemption.findByIdAndUpdate(
      req.params.id,
      { status: 'fulfilled' },
      { new: true }
    )
    if (!redemption) return res.status(404).json({ message: 'Redemption not found' })
    res.json(redemption)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── USER: redeem a reward ────────────────────────────────────────────────────
// POST /api/user/rewards/:id/redeem
const redeemReward = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id)

    if (!reward || !reward.isActive) {
      return res.status(404).json({ message: 'Reward not found or unavailable' })
    }

    // Check stock — -1 means unlimited
    if (reward.stock !== -1 && reward.stock < 1) {
      return res.status(400).json({ message: 'This reward is out of stock' })
    }

    // Check user has enough points
    const user = await User.findById(req.user.userId)
    if (user.points < reward.pointsCost) {
      return res.status(400).json({
        message: `Not enough points. You have ${user.points}, need ${reward.pointsCost}`,
      })
    }

    // Deduct points atomically — $inc with a negative value
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { points: -reward.pointsCost },
    })

    // Decrement stock if not unlimited
    if (reward.stock !== -1) {
      await Reward.findByIdAndUpdate(req.params.id, {
        $inc: { stock: -1 },
      })
    }

    // Create redemption record
    const redemption = await Redemption.create({
      userId: req.user.userId,
      rewardId: reward._id,
      pointsSpent: reward.pointsCost,
      status: 'pending',
    })

    // Create transaction record for the history log
    await Transaction.create({
      userId: req.user.userId,
      type: 'spend',
      points: reward.pointsCost,
      reason: `Redeemed reward: ${reward.title}`,
      refModel: 'Redemption',
      refId: redemption._id,
    })

    // Return fresh points balance
    const updatedUser = await User.findById(req.user.userId)

    res.json({
      message: `Successfully redeemed "${reward.title}"!`,
      pointsSpent: reward.pointsCost,
      remainingPoints: updatedUser.points,
      redemption,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── USER: get own redemption history ────────────────────────────────────────
// GET /api/user/redemptions
const getMyRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ userId: req.user.userId })
      .populate('rewardId', 'title pointsCost type imageUrl')
      .sort({ createdAt: -1 })

    res.json(redemptions)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  listRedemptions,
  fulfillRedemption,
  redeemReward,
  getMyRedemptions,
}