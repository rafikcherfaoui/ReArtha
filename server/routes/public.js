const express = require('express')
const router = express.Router()
const { getCenters } = require('../controllers/centerController')
const { getRewards } = require('../controllers/rewardController')
const Deposit = require('../models/Deposit')
const User = require('../models/User')

router.get('/centers', getCenters)
router.get('/rewards', getRewards)

// Public stats — only exposes aggregate numbers, no sensitive data
router.get('/stats/public', async (req, res) => {
  try {
    const [validatedDeposits, totalUsers, totalPointsAwarded] = await Promise.all([
      Deposit.countDocuments({ status: 'validated' }),
      User.countDocuments({ role: 'user' }),
      Deposit.aggregate([
        { $match: { status: 'validated' } },
        { $group: { _id: null, total: { $sum: '$pointsAwarded' } } },
      ]),
    ])
    res.json({
      validatedDeposits,
      totalUsers,
      totalPointsAwarded: totalPointsAwarded[0]?.total ?? 0,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router