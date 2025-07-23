const IntroVideo = require('../models/IntroVideo');
const uploadVideo = require('../utils/youtubeUploader');
const fs = require('fs');
const path = require('path');

// @desc    Get the current intro video
// @route   GET /api/video
// @access  Public
exports.getIntroVideo = async (req, res) => {
  try {
    const video = await IntroVideo.findOne();
    if (!video) {
      return res.status(404).json({ message: 'No intro video found' });
    }
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Upload or update the intro video
// @route   POST /api/video
// @access  Admin
exports.uploadIntroVideo = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    // Upload to YouTube
    const youtubeLink = await uploadVideo(req.file.path, title || 'Intro Video');

    // Remove temp file
    fs.unlinkSync(req.file.path);

    let video = await IntroVideo.findOne();
    if (video) {
      video.title = title || video.title;
      video.url = youtubeLink || video.url;
      await video.save();
      return res.json({ message: 'Intro video updated successfully', video });
    }

    video = await IntroVideo.create({ title, url: youtubeLink });
    res.status(201).json({ message: 'Intro video uploaded successfully', video });

  } catch (err) {
    console.error('Intro video upload error:', err);
    res.status(500).json({ message: 'Failed to upload video', error: err.message });
  }
};
