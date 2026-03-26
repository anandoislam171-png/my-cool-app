const Post = require('../models/Post');
const User = require('../models/User');

exports.getNeuralFeed = async (req, res) => {
  try {
    // ১. OAuth2 মিডলওয়্যার (protect) থেকে ইউজার ডাটা নেওয়া
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "NEURAL_IDENTITY_NOT_FOUND" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // ২. মোড অনুযায়ী কন্ডিশন সেট করা
    let query = {};
    const mode = user.activeMode;

    if (mode === 'video') {
      query.contentType = 'video';
    } else if (mode === 'chat') {
      query.isConversation = true;
    } else if (mode === 'knowledge') {
      query.category = { $in: ['tech', 'archive', 'science'] };
    }
    // 'minimal' মোডে সব ধরণের কন্টেন্ট আসবে (Default)

    // ৩. ডাটাবেস থেকে পোস্ট রিট্রিভ করা
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName activeMode');

    const total = await Post.countDocuments(query);

    res.json({
      status: "SYNC_COMPLETE",
      mode_active: mode,
      data: posts,
      meta: {
        total,
        page,
        hasMore: total > skip + posts.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: "FEED_DESYNC_ERROR", error: error.message });
  }
};