const mongoose = require('mongoose');

const payoutRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: {
    type: String, // Optional rejection reason or admin note
  },
  bankDetailsSnapshot: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    bankCode: String,
  },
  processedAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('PayoutRequest', payoutRequestSchema);
