import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/Post.js';
import User from '../models/User.js';
import fs from 'fs';

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const createPost = async (req, res) => {
  try {
    const { text, type } = req.body;
    const currentUserId = req.user?._id || req.user?.id || req.user?.sub;

    if (!currentUserId) {
      return res.status(401).json({ msg: "Neural Identity missing!" });
    }

    let mediaUrl = "";
    let publicId = "";

    // মিডিয়া আপলোড লজিক
    if (req.file) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "auto", // অটোমেটিক ইমেজ বা ভিডিও ডিটেক্ট করবে
          folder: "onyx_drift_posts",
        });
        mediaUrl = uploadRes.secure_url;
        publicId = uploadRes.public_id;

        // আপলোড হয়ে গেলে লোকাল ফাইল ডিলিট করে দেওয়া (সার্ভার ক্লিন রাখতে)
        fs.unlinkSync(req.file.path);
      } catch (uploadErr) {
        console.error("Cloudinary Error:", uploadErr);
        return res.status(500).json({ msg: "Media Server Unreachable" });
      }
    }

    // ইউজার ডাটা ফেচ
    const user = await User.findById(currentUserId);

    const newPost = new Post({
      author: currentUserId,
      authorName: user?.name || user?.username || "Unknown Drifter",
      authorProfilePic: user?.profilePic || user?.avatar || "",
      text: text,
      mediaUrl: mediaUrl,
      mediaType: req.file?.mimetype?.startsWith('video') ? 'video' : 'image',
      publicId: publicId,
      likes: [],
      comments: []
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);

  } catch (err) {
    console.error("❌ Neural Upload Error:", err);
    res.status(500).json({ msg: "Transmission Failed", error: err.message });
  }
};

// লাইক লজিক (Simplified)
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user?._id || req.user?.id;

    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      const updatedPost = await Post.findById(req.params.id);
      res.status(200).json(updatedPost);
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      const updatedPost = await Post.findById(req.params.id);
      res.status(200).json(updatedPost);
    }
  } catch (err) {
    res.status(500).json({ msg: "Pulse Error" });
  }
};

// রিলস ফেচিং
export const getReels = async (req, res) => {
  try {
    const reels = await Post.find({ mediaType: 'video' })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(reels);
  } catch (err) {
    res.status(500).json({ msg: "Reels fetch failed" });
  }
};

// পালস (ভিউ) আপডেট
export const updateReelPulse = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: "Pulse sync failed" });
    }
};

// কমেন্ট অ্যাড
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.user._id);

    const comment = {
      userId: user._id,
      text,
      userName: user.name,
      userAvatar: user.profilePic,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ msg: "Comment failed" });
  }
};