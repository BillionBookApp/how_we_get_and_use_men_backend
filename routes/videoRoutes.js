const express = require('express');
const router = express.Router();

const {
  getIntroVideo,
  uploadIntroVideo
} = require('../controllers/videoController');

const protect = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Multer for file upload

// 📽️ Public: Get the intro video
router.get('/', getIntroVideo);

// 🔐 Admin Only: Upload or update the video (with Bunny upload)
router.post(
  '/',
  protect,
  adminOnly,
  upload.single('videoFile'), // Accepts form-data with videoFile
  uploadIntroVideo
);

module.exports = router;
