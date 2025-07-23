const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/, // only letters, numbers, and underscores
  },
  email: { type: String, required: true, unique: true },  // <-- Add this
  password: {
    type: String,
    required: true,
  },
  referralCode: { type: String, unique: true },
  referredBy: { type: String }, // store the referral code used
  referrals: [{ type: String }], // usernames or IDs

  tribeQueenWallet: {
    balance: { type: Number, default: 0 },
    earnings: [
      {
        from: String, // user ID or username of buyer
        amount: Number,
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    bankCode: String
  },
  isVerified: {
    type: Boolean,
    default: true, // since we're not verifying emails anymore
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  hasAccess: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
