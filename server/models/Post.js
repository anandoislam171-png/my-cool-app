const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, "Post content cannot be empty"],
    trim: true
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'video', 'link'],
    default: 'text'
  },
  mediaUrl: {
    type: String, // ইমেজ বা ভিডিওর ইউআরএল
    default: null
  },
  category: {
    type: String,
    enum: ['general', 'tech', 'archive', 'science', 'creative'],
    default: 'general'
  },
  isConversation: {
    type: Boolean,
    default: false
  },
  stats: {
    syncs: { type: Number, default: 0 },
    links: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);