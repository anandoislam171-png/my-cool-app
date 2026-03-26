import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

// কাস্টম মিডলওয়্যার ইমপোর্ট (নিশ্চিত করুন এই ফাইলটি আপনার middleware ফোল্ডারে আছে)
import { protect } from '../middleware/authMiddleware.js'; 

dotenv.config();
const router = express.Router();

// --- ১. অপশনাল অথেন্টিকেশন (ফিড দেখার জন্য) ---
const optionalAuth = async (req, res, next) => {
  // যদি টোকেন থাকে তবে ভেরিফাই করবে, না থাকলে স্কিপ করবে
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return protect(req, res, next);
  }
  next();
};

/* ==========================================================
    ☁️ Cloudinary & Gemini Config
========================================================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ==========================================================
    📦 2. Multer & Media Storage
========================================================== */
const localTempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/temp/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `raw-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "onyx_drift_posts",
    resource_type: "auto", 
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "webm"],
  },
});

const uploadLocal = multer({ storage: localTempStorage, limits: { fileSize: 150 * 1024 * 1024 } });
const uploadCloud = multer({ storage: cloudStorage });

/* ==========================================================
    🎥 PRO VIDEO RENDERING ENGINE
========================================================== */
router.post("/process", protect, uploadLocal.single("media"), async (req, res) => {
  const user = req.user; // protect middleware থেকে পাওয়া ইউজার
  
  if (!req.file) return res.status(400).json({ error: "No Neural Core Data (File) found." });

  const instructions = JSON.parse(req.body.editInstructions);
  const videoPath = req.file.path;
  const outputFilename = `processed-${Date.now()}.mp4`;
  const outputPath = path.join('uploads/', outputFilename);

  let command = ffmpeg(videoPath);

  const b = (instructions.filters.brightness - 100) / 100;
  const c = instructions.filters.contrast / 100;
  const s = instructions.filters.saturate / 100;
  let filters = [`eq=brightness=${b}:contrast=${c}:saturation=${s}`];

  if (instructions.playbackSpeed !== 1) {
    filters.push(`setpts=${1 / instructions.playbackSpeed}*PTS`);
  }

  instructions.layers.forEach(layer => {
    if (layer.type === 'text') {
      filters.push({
        filter: 'drawtext',
        options: {
          text: layer.content,
          fontcolor: 'cyan',
          fontsize: 36,
          x: '(w-text_w)/2',
          y: '(h-text_h)/2',
          shadowcolor: 'black', shadowx: 2, shadowy: 2
        }
      });
    }
  });

  command
    .videoFilters(filters)
    .on('end', async () => {
      try {
        const result = await cloudinary.uploader.upload(outputPath, {
          resource_type: "video",
          folder: "onyx_reels"
        });

        const post = await Post.create({
          authorId: user._id,
          authorName: `${user.firstName} ${user.lastName}`,
          authorAvatar: user.avatar || "",
          text: instructions.caption || "",
          media: result.secure_url,
          mediaType: "video",
          isAiGenerated: false,
          editMetadata: instructions,
          createdAt: new Date()
        });

        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

        res.status(201).json(post);
      } catch (err) {
        res.status(500).json({ error: "Cloud Sync Failed" });
      }
    })
    .on('error', (err) => {
      console.error("FFmpeg Error:", err);
      res.status(500).json({ error: "Rendering Grid Offline" });
    })
    .save(outputPath);
});

/* ==========================================================
    🧠 NEURAL FEED
========================================================== */
router.get("/neural-feed", optionalAuth, async (req, res) => {
  try {
    const currentUserId = req.user?._id;
    const posts = await Post.find().sort({ createdAt: -1 }).limit(100).lean();
    if (!posts || posts.length === 0) return res.status(200).json([]);

    const optimizedPosts = posts.map(post => {
      let resonanceScore = 0;
      resonanceScore += (post.likes?.length || 0) * 5;
      resonanceScore += (post.comments?.length || 0) * 10;
      if (post.isAiGenerated) resonanceScore += 40;
      if (post.authorId?.toString() === currentUserId?.toString()) resonanceScore += 20;

      return {
        ...post,
        resonanceScore,
        neuralSync: true,
        authorName: post.authorName || "Unknown Drifter",
        authorAvatar: post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName || 'D'}&background=random`
      };
    });
    optimizedPosts.sort((a, b) => b.resonanceScore - a.resonanceScore);
    res.json(optimizedPosts.slice(0, 50));
  } catch (err) {
    res.status(500).json({ msg: "Neural Grid Offline" });
  }
});

/* ==========================================================
    🤖 AI ANALYZE
========================================================== */
router.post("/ai-analyze", async (req, res) => {
  const { text, authorName } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Act as a Cyberpunk AI. Analyze this neural post by "${authorName || 'Drifter'}": "${text}". Max 20 words.`;
    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text() });
  } catch (error) {
    res.status(500).json({ analysis: "AI Node Disconnected." });
  }
});

/* ==========================================================
    🚀 CREATE POST
========================================================== */
router.post("/", protect, uploadCloud.single("media"), async (req, res) => {
  try {
    const user = req.user;
    let mediaUrl = req.file ? req.file.path : "";
    let detectedType = req.file?.mimetype?.startsWith("video") ? "video" : "image";

    const post = await Post.create({
      authorId: user._id,
      authorName: `${user.firstName} ${user.lastName}`,
      authorAvatar: user.avatar || "",
      text: req.body.text || "",
      media: mediaUrl,
      mediaType: req.file ? detectedType : "text",
      createdAt: new Date()
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ msg: "Neural Breakdown." });
  }
});

/* ==========================================================
    ❤️ LIKE & 💬 COMMENT
========================================================== */
router.post("/:id/like", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const post = await Post.findById(req.params.id);
    const isLiked = post.likes.includes(userId);
    const update = isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updatedPost);
  } catch (err) { res.status(500).json({ error: "Heart sync error." }); }
});

router.post("/:id/comment", protect, async (req, res) => {
  try {
    const user = req.user;
    const comment = {
      text: req.body.text,
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.avatar || "",
      createdAt: new Date()
    };
    const post = await Post.findByIdAndUpdate(req.params.id, { $push: { comments: comment } }, { new: true });
    res.json(post);
  } catch (err) { res.status(500).json({ msg: "Comm link failure." }); }
});

/* ==========================================================
    🗑️ DELETE & PROFILE POSTS
========================================================== */
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.authorId.toString() !== req.user._id.toString()) return res.status(403).send("Denied.");
    await post.deleteOne();
    res.json({ msg: "Terminated", postId: req.params.id });
  } catch (err) { res.status(500).json({ msg: "Failed." }); }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const userPosts = await Post.find({ authorId: req.params.userId }).sort({ createdAt: -1 }).lean();
    res.json(userPosts || []);
  } catch (err) { res.status(500).json({ msg: "Lost signal." }); }
});

export default router;