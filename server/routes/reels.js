import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Post from "../models/Post.js"; 
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================================
    ☁️ Cloudinary Storage Configuration
========================================================== */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "onyx_reels",
    resource_type: "video", 
    allowed_formats: ["mp4", "mov", "webm", "quicktime"],
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // ৫০ এমবি লিমিট (ভিডিওর জন্য)
});

/* ==========================================================
    📺 GET NEURAL FEED (Optimized for ReelsFeed.jsx)
========================================================== */
// এখানে "/all" এর বদলে "/neural-feed" করা হয়েছে যাতে আপনার ফ্রন্টএন্ডের সাথে মিলে যায়
router.get("/neural-feed", async (req, res) => {
  try {
    const reels = await Post.find({ 
        $or: [
          { postType: "reels" },
          { mediaType: "video" }
        ] 
    })
    .sort({ createdAt: -1 })
    .limit(20) 
    .populate("authorId", "fullName firstName lastName avatar") // ইউজারের লেটেস্ট ডাটা পাওয়ার জন্য
    .lean();
    
    if (!reels || reels.length === 0) return res.status(200).json([]);

    // ডাটা ফরম্যাটিং যাতে ফ্রন্টএন্ডে resolveDrifter() ঠিকমতো কাজ করে
    const safeReels = reels.map(reel => ({
        ...reel,
        _id: reel._id.toString(),
        likes: Array.isArray(reel.likes) ? reel.likes : [],
        commentsCount: reel.comments?.length || 0,
        author: reel.authorId || {
            fullName: reel.authorName || "Unknown Drifter",
            profilePic: reel.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel._id}`
        }
    }));

    res.status(200).json(safeReels);
  } catch (err) {
    console.error("Neural Feed Fetch Error:", err);
    res.status(500).json({ error: "Neural Link Offline" });
  }
});

/* ==========================================================
    🚀 REEL UPLOAD (Secured with Neural Auth)
========================================================== */
router.post("/upload", protect, upload.single("video"), async (req, res) => {
  try {
    const user = req.user; 
    
    if (!req.file) {
      return res.status(400).json({ error: "Neural Core Data (Video) missing." });
    }

    const newReel = new Post({
      authorId: user._id,
      authorName: user.fullName || `${user.firstName} ${user.lastName}`,
      authorAvatar: user.avatar || "",
      text: req.body.caption || "",
      mediaUrl: req.file.path, // mediaUrl হিসেবে ক্লাউডিনারি পাথ সেভ হচ্ছে
      mediaType: "video",
      postType: "reels",
      likes: [],
      comments: [],
      createdAt: new Date()
    });

    await newReel.save();
    res.status(201).json({ msg: "Neural Upload Successful", data: newReel });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(400).json({ error: "Neural Sync Failed", details: err.message });
  }
});

/* ==========================================================
    ❤️ LIKE REEL (For Interaction Sync)
========================================================== */
router.post("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post Not Found" });

    // লাইক চেক এবং টগল
    const isLiked = post.likes.includes(req.user._id);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ msg: "Like Sync Error" });
  }
});

export default router;