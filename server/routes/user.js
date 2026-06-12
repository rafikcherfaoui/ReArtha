const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { redeemDeposit, getMyTransactions } = require('../controllers/depositController')
const { redeemReward, getMyRedemptions } = require('../controllers/rewardController')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

router.use(authMiddleware)

router.post('/deposits/redeem', redeemDeposit)
router.get('/transactions', getMyTransactions)
router.post('/rewards/:id/redeem', redeemReward)
router.get('/redemptions', getMyRedemptions)

// PUT /api/user/profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.userId)

    if (name) user.name = name
    if (phone) user.phone = phone

    // Password change is optional — only process if both fields provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' })
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' })
      }
      user.password = await bcrypt.hash(newPassword, 10)
    }

    await user.save()
    const updated = await User.findById(user._id).select('-password')
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router