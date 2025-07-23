const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  memberCount: { type: Number, default: 3559910 }, // default community base count
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Community', communitySchema);
