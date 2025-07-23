const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const communityController = require('../controllers/communityController');

// ✅ Get group name + member count
router.get('/info', protect, communityController.getCommunityInfo);

// ✅ Get all messages
router.get('/messages', protect, communityController.getMessages);

// ✅ Send a message
router.post('/messages', protect, communityController.postMessage);

// ✅ React to a message
router.post('/messages/:messageId/react', protect, communityController.reactToMessage);

// ✅ (Optional) Unreact to a message
router.post('/messages/:messageId/unreact', protect, communityController.unreactToMessage);

// ✅ Mark a message as read
router.patch('/messages/:messageId/read', protect, communityController.markAsRead);

module.exports = router;
