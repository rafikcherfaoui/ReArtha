const mongoose = require('mongoose')

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    pointsCost: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ['physical', 'digital'],
      default: 'physical',
    },
    stock: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Reward', rewardSchema)