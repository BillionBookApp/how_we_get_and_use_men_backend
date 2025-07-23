const express = require('express');
const router = express.Router();

const {
  getBook,
  uploadBook,
  checkBookUnlocked,
} = require('../controllers/bookController');

const protect = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// ✅ GET the full book with metadata and chapters
router.get('/', getBook); // Public or `protect` if you want to restrict access

// ✅ Upload or update the full book (admin only)
router.post('/', protect, adminOnly, uploadBook);

// ✅ Check if the current user has unlocked the book (paid)
router.get('/unlocked', protect, checkBookUnlocked);

module.exports = router;
