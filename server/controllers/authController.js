const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Helper — creates and returns a signed JWT
const signToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // 1. Check if email is already taken
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    // 2. Hash the password — never store plain text
    const hashedPassword = await bcrypt.hash(password, 10)
    // The "10" is the salt rounds — higher = more secure but slower

    // 3. Save the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    // 4. Sign a token and respond
    const token = signToken(user._id, user.role)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Find the user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // 2. Compare password against the hash
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // 3. Check account isn't frozen
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is suspended' })
    }

    // 4. Sign and return token
    const token = signToken(user._id, user.role)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    // req.user was injected by authMiddleware
    const user = await User.findById(req.user.userId).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { register, login, getMe }