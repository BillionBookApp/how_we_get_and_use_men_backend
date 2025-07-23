const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  bookPriceUSD: {
    type: Number,
    default: 3.5,
  },
  referralPercentage: {
    type: Number,
    default: 0.3, // 30%
  },
}, { timestamps: true });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
