const express = require('express');
const router = express.Router();

const {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');

const protect = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // ⬅️ Multer middleware for file upload

// 📢 Public: Get all testimonials
router.get('/', getTestimonials);

// 🔐 Admin-only: Add, Update, Delete (with video upload)
router.post('/', protect, adminOnly, upload.single('videoFile'), addTestimonial);
router.put('/:id', protect, adminOnly, upload.single('videoFile'), updateTestimonial);
router.delete('/:id', protect, adminOnly, deleteTestimonial);

module.exports = router;
