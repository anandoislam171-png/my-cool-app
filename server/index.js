import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import Redis from "ioredis";
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import passport from 'passport';
import './config/passport.js';

import connectDB from "./config/db.js";
import User from "./models/User.js";
import userRoutes from './routes/user.js';
import postRoutes from "./routes/posts.js";
import messageRoutes from "./routes/messages.js";
import storyRoute from "./routes/stories.js";
import reelRoutes from "./routes/reels.js";
import profileRoutes from "./routes/profile.js";
import groupRoutes from "./routes/group.js";
import marketRoutes from "./routes/market.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from './routes/authRoutes.js';
import { getNeuralFeed } from "./controllers/feedController.js";

// --- ১. ডেটাবেজ কানেকশন ---
connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);

// --- ২. Redis (Performance Layer) ---
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
redis.on("error", (err) => console.log("Redis Error: ", err));

// --- ৩. কাস্টম JWT মিডলওয়্যার (সংশোধিত) ---
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      return next(); // 'return' যোগ করা হয়েছে যাতে ফাংশন এখানেই শেষ হয়
    } catch (error) {
      return res.status(401).json({ error: "Neural Link Severed", message: "Invalid Token" });
    }
  }
  
  if (!token) {
    return res.status(401).json({ error: "Access Denied", message: "No Token Provided" });
  }
};

// --- ৪. ক্লাউডিনারি কনফিগারেশন ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- ৫. CORS (Neural Shield) ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://onyx-drift.com",
  "https://www.onyx-drift.com",
  "https://onyx-drift-app-final.vercel.app",
  "https://my-cool-app-cvm7.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Neural Network Access Denied'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(passport.initialize());

// Static Folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// --- ৬. রাউটস (Public & Protected) ---

app.get("/", (req, res) => res.send("🚀 OnyxDrift Neural Core Online!"));

// Auth রাউটস
app.use('/api/auth', authRoutes);

// ফিড রাউট
app.get("/api/feed", protect, getNeuralFeed); // রাউটটি ক্লিন করা হয়েছে

// ইউজার প্রোফাইল রুট
app.get("/api/users/profile/:username", protect, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ 
      $or: [{ username: username }, { email: username }] 
    }).populate('followers following', 'firstName lastName avatar username');

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      ...user._doc,
      isMe: user._id.toString() === req.user._id.toString(),
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Grid Failure: " + err.message });
  }
});

// অন্যান্য মডিউল
app.use("/api/users", protect, userRoutes);
app.use("/api/profile", protect, profileRoutes);
app.use("/api/posts", protect, postRoutes);
app.use("/api/reels", protect, reelRoutes);
app.use("/api/stories", protect, storyRoute);
app.use("/api/groups", protect, groupRoutes);
app.use("/api/market", protect, marketRoutes);
app.use("/api/admin", protect, adminRoutes);
app.use("/api/messages", protect, messageRoutes);

// --- ৭. Socket.io ---
const io = new Server(server, { 
  cors: { origin: allowedOrigins } 
});

io.on("connection", (socket) => {
  console.log("A user connected to Neural Net:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected"));
});

// --- ৮. গ্লোবাল এরর হ্যান্ডলার ---
app.use((err, req, res, next) => {
  console.error("🔥 System Error:", err.message);
  res.status(err.status || 500).json({ 
    error: "Grid Breakdown", 
    message: err.message || "Internal Server Error" 
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ONYX CORE ACTIVE ON PORT: ${PORT}`);
});
// Global Error Handler (Add this at the end of server.js)
app.use((err, req, res, next) => {
  console.error("❌ NEURAL_ERROR_DETECTED:");
  console.error("------------------------");
  console.error(err.stack); // এটি আপনাকে বলবে কোন ফাইলের কত নাম্বার লাইনে এরর হয়েছে
  console.error("------------------------");
  
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message // এটি ফ্রন্টএন্ডে আসল সমস্যাটি পাঠাবে
  });
});