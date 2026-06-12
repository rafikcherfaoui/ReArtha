const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['earn', 'spend'],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true, // e.g. "Diaper deposit – code AB12CD34"
    },
    // Polymorphic reference — points to either a Deposit or Redemption doc
    refModel: {
      type: String,
      enum: ['Deposit', 'Redemption'],
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Transaction', transactionSchema)