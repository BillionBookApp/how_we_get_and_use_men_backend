const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: { type: String, required: true },

  // Reply support
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },

  // Emoji reactions support (1 reaction per user per emoji)
  emojiReactions: [
    {
      emoji: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  ],

  // Read status (✓✓)
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
