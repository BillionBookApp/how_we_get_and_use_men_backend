const Testimonial = require('../models/Testimonial');
const uploadVideo = require('../utils/youtubeUploader'); // Bunny upload util
const fs = require('fs');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch testimonials', error: err.message });
  }
};

// @desc    Add a new testimonial
// @route   POST /api/testimonials
// @access  Admin
exports.addTestimonial = async (req, res) => {
  try {
    const { name, content } = req.body;

    let videoUrl = null;

    if (req.file) {
      videoUrl = await uploadVideo(req.file.path, 'testimonials/');
      fs.unlinkSync(req.file.path); // delete local temp file
    }

    const newTestimonial = await Testimonial.create({
      name,
      content,
      videoUrl,
    });

    res.status(201).json({ message: 'Testimonial added', testimonial: newTestimonial });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add testimonial', error: err.message });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Admin
exports.updateTestimonial = async (req, res) => {
  try {
    const { name, content } = req.body;
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // If new file uploaded, replace video
    if (req.file) {
      const newVideoUrl = await uploadVideo(req.file.path, 'testimonials/');
      fs.unlinkSync(req.file.path);
      testimonial.videoUrl = newVideoUrl;
    }

    testimonial.name = name || testimonial.name;
    testimonial.content = content || testimonial.content;

    await testimonial.save();

    res.json({ message: 'Testimonial updated', testimonial });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Admin
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await testimonial.remove();
    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Deletion failed', error: err.message });
  }
};
