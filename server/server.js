const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const publicRoutes = require('./routes/public')
const userRoutes = require('./routes/user')
const adminRoutes = require('./routes/admin')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api', publicRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    )
  })
  .catch((err) => console.error(err))