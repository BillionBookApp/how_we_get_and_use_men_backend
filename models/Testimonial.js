const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: String,
  quote: String,
  videoUrl: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
