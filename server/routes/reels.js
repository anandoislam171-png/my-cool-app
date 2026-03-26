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

const upload = multer({ storage: storage });

/* ==========================================================
    📺 GET ALL REELS (Optimized for Speed)
========================================================== */
router.get("/all", async (req, res) => {
  try {
    // Reels বা Video টাইপের পোস্টগুলো খোঁজা
    const reels = await Post.find({ 
        $or: [
          { postType: "reels" },
          { mediaType: "video" }
        ] 
    })
    .sort({ createdAt: -1 })
    .limit(20) 
    .lean();
    
    if (!reels || reels.length === 0) return res.status(200).json([]);

    // ডাটা সেফটি চেক (যাতে ফ্রন্টএন্ডে ম্যাপ করার সময় এরর না আসে)
    const safeReels = reels.map(reel => ({
        ...reel,
        likes: Array.isArray(reel.likes) ? reel.likes : [],
        comments: Array.isArray(reel.comments) ? reel.comments : [],
        authorName: reel.authorName || "Unknown Drifter",
        authorAvatar: reel.authorAvatar || `https://ui-avatars.com/api/?name=${reel.authorName || 'D'}&background=random`
    }));

    res.status(200).json(safeReels);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch reels" });
  }
});

/* ==========================================================
    🚀 REEL UPLOAD (Secured with Custom Auth)
========================================================== */
router.post("/upload", protect, upload.single("video"), async (req, res) => {
  try {
    const user = req.user; // protect middleware থেকে সরাসরি ইউজার অবজেক্ট
    
    if (!req.file) {
      return res.status(400).json({ error: "Neural Core Data (Video) not found." });
    }

    const newReel = new Post({
      authorId: user._id, // Auth0 sub এর বদলে মঙ্গোডিবি ID
      authorName: `${user.firstName} ${user.lastName}`,
      authorAvatar: user.avatar || "",
      text: req.body.caption || "",
      media: req.file.path, // ক্লাউডিনারি ভিডিও ইউআরএল
      mediaType: "video",
      postType: "reels",
      likes: [],
      comments: [],
      createdAt: new Date()
    });

    await newReel.save();
    res.status(201).json(newReel);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(400).json({ error: "Neural Sync Failed", details: err.message });
  }
});

export default router;