const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const adminGuard = require('../middleware/adminGuard')
const { createCenter, updateCenter, deleteCenter } = require('../controllers/centerController')
const { generateDeposits, listDeposits, validateDeposit, rejectDeposit } = require('../controllers/depositController')
const { createReward, updateReward, deleteReward, listRedemptions, fulfillRedemption } = require('../controllers/rewardController')
const { getStats, getUsers, toggleUserStatus, adjustPoints } = require('../controllers/adminController')

router.use(authMiddleware, adminGuard)

// Stats
router.get('/stats', getStats)

// Users
router.get('/users', getUsers)
router.put('/users/:id/status', toggleUserStatus)
router.put('/users/:id/points', adjustPoints)

// Centers
router.post('/centers', createCenter)
router.put('/centers/:id', updateCenter)
router.delete('/centers/:id', deleteCenter)

// Deposits
router.post('/deposits/generate', generateDeposits)
router.get('/deposits', listDeposits)
router.put('/deposits/:id/validate', validateDeposit)
router.put('/deposits/:id/reject', rejectDeposit)

// Rewards
router.post('/rewards', createReward)
router.put('/rewards/:id', updateReward)
router.delete('/rewards/:id', deleteReward)

// Redemptions
router.get('/redemptions', listRedemptions)
router.put('/redemptions/:id/fulfill', fulfillRedemption)

module.exports = router