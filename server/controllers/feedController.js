import Post from '../models/Post.js';
import User from '../models/User.js';

// @desc    Get Neural Feed based on user's active mode
// @route   GET /api/feed
// @access  Private (Needs 'protect' middleware)
export const getNeuralFeed = async (req, res) => {
  try {
    // ১. মিডলওয়্যার থেকে ইউজার আইডি নেওয়া (req.user._id সাধারণত protect মিডলওয়্যার থেকে আসে)
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "NEURAL_IDENTITY_NOT_FOUND" });
    }

    // প্যাগিনেশন সেটিংস
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // ২. মোড অনুযায়ী ফিল্টারিং কন্ডিশন সেট করা
    let query = {};
    const mode = user.activeMode || 'minimal';

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
      .populate('author', 'firstName lastName activeMode avatar');

    const total = await Post.countDocuments(query);

    // ৪. রেসপন্স পাঠানো
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
    console.error("Feed Sync Error:", error);
    res.status(500).json({ 
      message: "FEED_DESYNC_ERROR", 
      error: error.message 
    });
  }
};