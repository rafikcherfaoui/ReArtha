const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
require('dotenv').config()

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)

  const existing = await User.findOne({ email: 'admin@reartha.com' })
  if (existing) {
    console.log('Admin already exists')
    process.exit()
  }

  const hashed = await bcrypt.hash('admin123', 10)
  await User.create({
    name: 'Admin',
    email: 'admin@reartha.com',
    password: hashed,
    role: 'admin',
  })

  console.log('Admin created: admin@reartha.com / admin123')
  process.exit()
}

seed()