import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import upload from "../middleware/multer.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================================
    1️⃣ GET CURRENT USER (/api/users/me)
========================================================== */
router.get("/me", protect, async (req, res) => {
  try {
    // protect middleware সরাসরি req.user এ ইউজার অবজেক্ট দিয়ে দেয়
    const user = req.user;
    if (!user) return res.status(401).json({ msg: "Neural link not found" });

    const data = user.toObject();
    data.followersCount = user.followers?.length || 0;
    data.followingCount = user.following?.length || 0;
    data.isMe = true;

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Neural core error" });
  }
});

/* ==========================================================
    2️⃣ GET USER PROFILE (By ID or Username)
========================================================== */
router.get("/profile/:id", protect, async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user._id.toString();

    // ID অথবা Username দিয়ে খোঁজা
    const user = await User.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(targetId) ? targetId : null }, 
        { username: targetId }
      ],
    }).populate('followers following', 'username avatar firstName lastName');

    if (!user) {
      return res.status(404).json({ msg: "Subject not found in network" });
    }

    const data = user.toObject();
    data.followersCount = user.followers?.length || 0;
    data.followingCount = user.following?.length || 0;
    
    // চেক করা হচ্ছে ইউজারটি কি আমি নিজেই কি না
    data.isMe = user._id.toString() === myId;
    
    // আমি কি তাকে ফলো করছি?
    data.isFollowing = user.followers?.some(f => f._id.toString() === myId);

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Profile decryption failed" });
  }
});

/* ==========================================================
    3️⃣ UPDATE PROFILE
========================================================== */
router.put(
  "/update",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const myId = req.user._id;
      const updateFields = { ...req.body };

      // ইমেজ ফাইল থাকলে ক্লাউডিনারি পাথ সেট করা
      if (req.files?.avatar) {
        updateFields.avatar = req.files.avatar[0].path;
      }
      if (req.files?.coverImg) {
        updateFields.coverImg = req.files.coverImg[0].path;
      }

      const user = await User.findByIdAndUpdate(
        myId,
        { $set: updateFields },
        { new: true }
      ).select("-password");

      res.json(user);
    } catch (err) {
      res.status(500).json({ msg: "Neural update failed" });
    }
  }
);

/* ==========================================================
    4️⃣ FOLLOW / UNFOLLOW (OPTIMIZED)
========================================================== */
router.post("/follow/:targetId", protect, async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const targetId = req.params.targetId;

    if (myId === targetId) return res.status(400).json({ msg: "Self-sync not allowed" });

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ msg: "Target not found" });

    const isFollowing = targetUser.followers.includes(myId);

    if (isFollowing) {
      // Unfollow Logic
      await Promise.all([
        User.findByIdAndUpdate(myId, { $pull: { following: targetId } }),
        User.findByIdAndUpdate(targetId, { $pull: { followers: myId } })
      ]);
      return res.json({ isFollowing: false });
    } else {
      // Follow Logic
      await Promise.all([
        User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } }),
        User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } })
      ]);
      return res.json({ isFollowing: true });
    }
  } catch (err) {
    res.status(500).json({ msg: "Follow/Unfollow failed" });
  }
});

/* ==========================================================
    5️⃣ GET USER POSTS
========================================================== */
router.get("/posts/:userId", protect, async (req, res) => {
  try {
    const userId = req.params.userId;

    const posts = await Post.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Posts fetch error" });
  }
});

export default router;