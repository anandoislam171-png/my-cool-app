import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import upload from "../middleware/multer.js";

const router = express.Router();

/* ==========================================================
    🔐 HELPER: AUTO CREATE/GET USER (GLOBAL FIX)
========================================================== */
const ensureUserExists = async (authPayload) => {
  const auth0Id = authPayload?.sub;
  if (!auth0Id) return null;

  let user = await User.findOne({ auth0Id });

  if (!user) {
    user = new User({
      auth0Id,
      displayName: authPayload.name || "Drifter", // model এ displayName থাকলে এটি ব্যবহার করুন
      username: authPayload.nickname || "drifter_" + Math.floor(Math.random() * 10000),
      avatar: authPayload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth0Id}`,
      email: authPayload.email || "",
    });

    await user.save();
    console.log("✅ New OnyxDrift identity initialized");
  }

  return user;
};

/* ==========================================================
    1️⃣ GET CURRENT USER (/api/users/me)
========================================================== */
router.get("/me", async (req, res) => {
  try {
    const user = await ensureUserExists(req.auth?.payload);
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
    2️⃣ GET USER PROFILE (FIXED)
========================================================== */
router.get("/:id", async (req, res) => {
  try {
    const targetId = decodeURIComponent(req.params.id);
    const myId = req.auth?.payload?.sub;

    const user = await User.findOne({
      $or: [{ auth0Id: targetId }, { username: targetId }, { nickname: targetId }],
    }).populate('followers following', 'username avatar displayName');

    if (!user) {
      return res.status(404).json({ msg: "Subject not found in network" });
    }

    const data = user.toObject();
    data.followersCount = user.followers?.length || 0;
    data.followingCount = user.following?.length || 0;
    data.isMe = user.auth0Id === myId;
    data.isFollowing = user.followers?.some(f => f.auth0Id === myId || f === myId);

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
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const myId = req.auth?.payload?.sub;
      if (!myId) return res.status(401).json({ msg: "Unauthorized" });

      const updateFields = { ...req.body };

      // Cloudinary বা Multer এর পাথ হ্যান্ডলিング
      if (req.files?.avatar) {
        updateFields.avatar = req.files.avatar[0].path;
      }
      if (req.files?.coverImg) {
        updateFields.coverImg = req.files.coverImg[0].path;
      }

      const user = await User.findOneAndUpdate(
        { auth0Id: myId },
        { $set: updateFields },
        { new: true }
      );

      res.json(user);
    } catch (err) {
      res.status(500).json({ msg: "Neural update failed" });
    }
  }
);

/* ==========================================================
    4️⃣ FOLLOW / UNFOLLOW (OPTIMIZED)
========================================================== */
router.post("/:targetId/follow", async (req, res) => {
  try {
    const myId = req.auth?.payload?.sub;
    const targetId = decodeURIComponent(req.params.targetId);

    if (!myId) return res.status(401).json({ msg: "Unauthorized" });
    if (myId === targetId) return res.status(400).json({ msg: "Self-sync not allowed" });

    const [me, targetUser] = await Promise.all([
      User.findOne({ auth0Id: myId }),
      User.findOne({ auth0Id: targetId })
    ]);

    if (!targetUser || !me) return res.status(404).json({ msg: "Target not found" });

    const isFollowing = targetUser.followers.includes(myId);

    if (isFollowing) {
      // Unfollow Logic
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $pull: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $pull: { followers: myId } })
      ]);
      return res.json({ isFollowing: false });
    } else {
      // Follow Logic
      await Promise.all([
        User.updateOne({ auth0Id: myId }, { $addToSet: { following: targetId } }),
        User.updateOne({ auth0Id: targetId }, { $addToSet: { followers: myId } })
      ]);
      return res.json({ isFollowing: true });
    }
  } catch (err) {
    res.status(500).json({ msg: "Follow/Unfollow failed" });
  }
});

/* ==========================================================
    5️⃣ GET USER POSTS (FIXED)
========================================================== */
router.get("/:userId/posts", async (req, res) => {
  try {
    const userId = decodeURIComponent(req.params.userId);

    // ইউজারকে খুঁজে তার অবজেক্ট আইডি বের করা (যদি প্রয়োজন হয়)
    const targetUser = await User.findOne({ 
      $or: [{ auth0Id: userId }, { username: userId }] 
    });

    if (!targetUser) return res.status(404).json({ msg: "User posts not found" });

    const posts = await Post.find({
      $or: [
        { authorAuth0Id: targetUser.auth0Id }, 
        { author: targetUser._id }
      ],
    })
    .sort({ createdAt: -1 })
    .lean();

    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Posts fetch error" });
  }
});

export default router;