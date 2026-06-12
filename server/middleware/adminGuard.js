const adminGuard = (req, res, next) => {
  // authMiddleware must run before this — req.user already exists
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

module.exports = adminGuard