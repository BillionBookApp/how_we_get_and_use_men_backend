const Community = require('../models/Community');
const Message = require('../models/Message');
const initDefaultCommunity = require('../utils/initDefaultCommunity');
const User = require('../models/User');

const BASE_MEMBER_COUNT = 3559910;

// 🔐 Ensure default community exists
initDefaultCommunity();

// ✅ GET /api/community/info
exports.getCommunityInfo = async (req, res) => {
  try {
    const community = await Community.findOne();
    const actualUsers = await User.countDocuments({ hasAccess: true });

    res.json({
      name: community?.name || 'Community',
      description: community?.description || '',
      memberCount: BASE_MEMBER_COUNT + actualUsers,
    });
  } catch (err) {
    console.error('❌ Failed to fetch community info:', err);
    res.status(500).json({ error: 'Failed to fetch community info' });
  }
};

// ✅ GET /api/community/messages
exports.getMessages = async (req, res) => {
  if (!req.user?.hasAccess) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  try {
    const community = await Community.findOne();

    const messages = await Message.find({ communityId: community._id })
      .sort({ createdAt: 1 })
      .populate('userId', 'username')
      .populate({
        path: 'replyTo',
        populate: { path: 'userId', select: 'username' },
      });

    res.json(messages);
  } catch (err) {
    console.error('❌ Failed to fetch messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// ✅ POST /api/community/messages
exports.postMessage = async (req, res) => {
  if (!req.user?.hasAccess) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  try {
    const { content, replyTo } = req.body;
    const community = await Community.findOne();

    const message = new Message({
      communityId: community._id,
      userId: req.user._id,
      content,
      replyTo: replyTo || null,
    });

    await message.save();
    res.json({ success: true, message });
  } catch (err) {
    console.error('❌ Failed to post message:', err);
    res.status(500).json({ error: 'Failed to post message' });
  }
};

// ✅ POST /api/community/messages/:messageId/react
exports.reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const alreadyReacted = message.emojiReactions.find(
      (r) => r.userId.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (!alreadyReacted) {
      message.emojiReactions.push({ emoji, userId: req.user._id });
      await message.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to react to message:', err);
    res.status(500).json({ error: 'Failed to react to message' });
  }
};

// ✅ POST /api/community/messages/:messageId/unreact
exports.unreactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) return res.status(404).json({ error: 'Message not found' });

    message.emojiReactions = message.emojiReactions.filter(
      (r) =>
        !(
          r.userId.toString() === req.user._id.toString() &&
          r.emoji === emoji
        )
    );

    await message.save();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to unreact to message:', err);
    res.status(500).json({ error: 'Failed to unreact to message' });
  }
};

// ✅ PATCH /api/community/messages/:messageId/read
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    if (!message.readBy) message.readBy = [];

    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to mark as read:', err);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};
