const mongoose = require('mongoose')

const depositSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means the code hasn't been used yet
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'validated', 'rejected'],
      default: 'pending',
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // the admin who created it
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Deposit', depositSchema)