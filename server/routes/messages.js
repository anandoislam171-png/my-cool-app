import express from "express";
const router = express.Router();
import { auth } from "express-oauth2-jwt-bearer";
import mongoose from "mongoose";

// Models (নিশ্চিত করুন আপনার এই মডেলগুলো সঠিক ফোল্ডারে আছে)
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// ✅ Auth Middleware
const checkJwt = auth({
  audience: "https://onyx-drift-api",
  issuerBaseURL: "https://my-cool-app-cvm7.onrender.com", // আপনার Auth0 ডোমেইন চেক করুন
  tokenSigningAlg: "RS256",
});

/* ==========================================================
    🔍 SEARCH USERS (নতুন চ্যাট শুরু করার জন্য)
========================================================== */
router.get("/search-users/:query", checkJwt, async (req, res) => {
  try {
    const { query } = req.params;
    const currentUserId = req.auth?.payload?.sub;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Query too short" });
    }

    const users = await User.find({
      auth0Id: { $ne: currentUserId },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { nickname: { $regex: query, $options: "i" } },
      ],
    })
      .limit(8)
      .select("name nickname avatar auth0Id")
      .lean();

    res.json(users);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

/* ==========================================================
    📥 GET CONVERSATIONS (ইউজারের সব চ্যাট লিস্ট)
========================================================== */
router.get("/conversations", checkJwt, async (req, res) => {
  try {
    const userId = req.auth?.payload?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // ইউজারের মেম্বারশিপ অনুযায়ী কনভারসেশন খোঁজা
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    })
      .sort({ updatedAt: -1 })
      .lean();

    // প্রতি চ্যাটের বিপরীতে অপর ইউজারের ডিটেইলস যোগ করা
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.members.find((m) => m !== userId);
        const userDetails = await User.findOne({ auth0Id: otherId })
          .select("name nickname avatar auth0Id")
          .lean();

        return { ...conv, userDetails };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Fetch Conv Error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/* ==========================================================
    📤 SEND MESSAGE (মেসেজ এবং ইমেজ সেভ করা)
========================================================== */
router.post("/message", checkJwt, async (req, res) => {
  try {
    const senderId = req.auth?.payload?.sub;
    const { conversationId, text, image } = req.body; // ফ্রন্টএন্ড থেকে image আসছে

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid Conversation ID" });
    }

    // নতুন মেসেজ অবজেক্ট তৈরি
    const newMessage = new Message({
      conversationId,
      senderId,
      text: text || "",
      image: image || null, // Cloudinary URL থাকলে এখানে সেভ হবে
    });

    const savedMessage = await newMessage.save();

    // কনভারসেশন টেবিলের 'lastMessage' আপডেট করা
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: { 
        text: image ? "📷 Image" : (text || "Sent a message"), 
        senderId 
      },
      updatedAt: new Date(),
    });

    res.json(savedMessage);
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ error: "Send failed" });
  }
});

/* ==========================================================
    📜 GET MESSAGES (নির্দিষ্ট চ্যাটের হিস্ট্রি)
========================================================== */
router.get("/:conversationId", checkJwt, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.auth?.payload?.sub;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    // নিরাপত্তা চেক: ইউজার এই চ্যাটের মেম্বার কি না
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] },
    });

    if (!conversation) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100) // ৫০ থেকে বাড়িয়ে ১০০ করা হলো
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

export default router;
