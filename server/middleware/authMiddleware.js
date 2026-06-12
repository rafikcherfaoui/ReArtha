const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  // Read the Authorization header
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' })
  }

  const token = authHeader.split(' ')[1] // grab the part after "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { userId, role, iat, exp }
    next() // pass control to the next function (the route handler)
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' })
  }
}

module.exports = authMiddleware