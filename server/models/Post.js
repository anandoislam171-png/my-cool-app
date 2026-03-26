import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // authorId ফিল্ডটি যোগ করা হলো যাতে আপনার আগের রাউটগুলোর (user.js/reels.js) সাথে মিল থাকে
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: String,
  authorAvatar: String,
  content: {
    type: String,
    required: [true, "Post content cannot be empty"],
    trim: true
  },
  // text ফিল্ডটি রাখা হলো আপনার আগের routes/user.js এর সাথে সিঙ্ক করার জন্য
  text: String, 
  contentType: {
    type: String,
    enum: ['text', 'image', 'video', 'link'],
    default: 'text'
  },
  // media ফিল্ডটি আপনার reels/user রাউটে ব্যবহার হয়েছে, তাই এটি যোগ করা হলো
  media: String,
  mediaUrl: {
    type: String, 
    default: null
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'none'],
    default: 'none'
  },
  postType: {
    type: String,
    enum: ['post', 'reels'],
    default: 'post'
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
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    userName: String,
    createdAt: { type: Date, default: Date.now }
  }],
  stats: {
    syncs: { type: Number, default: 0 },
    links: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// মঙ্গুজ মডেল তৈরি
const Post = mongoose.model('Post', postSchema);

// এটিই আপনার আগের এরর সমাধান করবে (Export Default)
export default Post;