import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { 
  createPost, 
  likePost, 
  getReels, 
  addComment, 
  updateReelPulse,
  getNeuralFeed // এটি যোগ করা হয়েছে Home Feed এর জন্য
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================
    ☁️ Cloudinary Configuration (For Video/Image)
========================================================== */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.includes("video");
    return {
      folder: "onyx_posts",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: ["jpg", "png", "mp4", "mov", "webm"],
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // ৫০ এমবি লিমিট
});

/* ==========================================================
    🛰️ Neural Transmission Routes (Post/Feed)
========================================================== */

// ১. পোস্ট তৈরি (Media সহ)
// এন্ডপয়েন্ট: POST /api/posts/create
router.post('/create', protect, upload.single('media'), createPost);

// ২. হোম ফিড (যা আপনি PremiumHomeFeed এ ব্যবহার করছেন)
// এন্ডপয়েন্ট: GET /api/posts/neural-feed
router.get('/neural-feed', protect, getNeuralFeed);

// ৩. লাইক/এনার্জি টগল
// এন্ডপয়েন্ট: POST /api/posts/:id/like
router.post('/:id/like', protect, likePost);

// ৪. কমেন্ট সেকশন
// এন্ডপয়েন্ট: POST /api/posts/:id/comment
router.post('/:id/comment', protect, addComment);


/* ==========================================================
    📺 Reels & Interaction Routes
========================================================== */

// ৫. রিলস ফিড (Vertical Scroll এর জন্য)
// এন্ডপয়েন্ট: GET /api/posts/reels
router.get('/reels', protect, getReels);
router.get("/neural-feed", getReels); // public


// ৬. রিলস পালস আপডেট (Interaction Tracking)
router.patch('/:id/pulse', protect, updateReelPulse);

export default router;