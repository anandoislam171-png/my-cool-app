import Post from '../models/Post.js';
import User from '../models/User.js';

/**
 * @desc    Get Neural Feed based on user's active mode
 * @route   GET /api/feed
 * @access  Private (Needs 'protect' middleware)
 */
export const getNeuralFeed = async (req, res) => {
  try {
    // ১. ইউজার আইডি নিশ্চিত করা (Protect middleware থেকে আসা)
    const userId = req.user.id || req.user._id;
    
    // পারফরম্যান্সের জন্য শুধু activeMode ফিল্ডটি সিলেক্ট করা হয়েছে
    const user = await User.findById(userId).select('activeMode');

    if (!user) {
      return res.status(404).json({ 
        status: "DESYNC",
        message: "NEURAL_IDENTITY_NOT_FOUND" 
      });
    }

    // ২. প্যাগিনেশন সেটিংস
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ৩. মোড অনুযায়ী ডাইনামিক ফিল্টারিং (Neural Mode Logic)
    let query = {};
    const mode = user.activeMode || 'minimal';

    switch (mode) {
      case 'video':
        query.contentType = 'video';
        break;
      case 'chat':
        query.isConversation = true;
        break;
      case 'knowledge':
        query.category = { $in: ['tech', 'archive', 'science'] };
        break;
      case 'minimal':
      default:
        // ডিফল্ট মোডে সব কন্টেন্ট দেখা যাবে
        break;
    }

    // ৪. ডাটাবেস অপারেশন (Parallel Execution for speed)
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName username activeMode avatar'), // 'username' যোগ করা হয়েছে
      Post.countDocuments(query)
    ]);

    // ৫. সাকসেস রেসপন্স পাঠানো
    res.status(200).json({
      status: "SYNC_COMPLETE",
      mode_active: mode,
      data: posts,
      meta: {
        total,
        page,
        limit,
        hasMore: total > skip + posts.length,
        sync_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("🔥 Neural Feed Sync Error:", error);
    res.status(500).json({ 
      status: "CORE_FAILURE",
      message: "FEED_DESYNC_ERROR", 
      error: error.message 
    });
  }
};