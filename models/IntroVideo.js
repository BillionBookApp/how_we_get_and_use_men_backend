const mongoose = require('mongoose');

const introVideoSchema = new mongoose.Schema({
  title: { type: String, required: false },
  url: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('IntroVideo', introVideoSchema);
