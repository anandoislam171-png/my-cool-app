import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Models
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// কাস্টম মিডলওয়্যার ইমপোর্ট (নিশ্চিত করুন এই ফাইলটি middleware ফোল্ডারে আছে)
import { protect } from '../middleware/authMiddleware.js'; 

dotenv.config();
const router = express.Router();

/* ==========================================================
    🔍 SEARCH USERS (নতুন চ্যাট শুরু করার জন্য)
========================================================== */
router.get("/search-users/:query", protect, async (req, res) => {
  try {
    const { query } = req.params;
    const currentUserId = req.user._id; // protect মিডলওয়্যার থেকে পাওয়া

    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Query too short" });
    }

    // নিজের আইডি বাদে অন্যদের খোঁজা
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    })
      .limit(8)
      .select("firstName lastName username avatar")
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
router.get("/conversations", protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // ইউজারের মেম্বারশিপ অনুযায়ী কনভারসেশন খোঁজা
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    })
      .sort({ updatedAt: -1 })
      .lean();

    // প্রতি চ্যাটের বিপরীতে অপর ইউজারের ডিটেইলস যোগ করা
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.members.find((m) => m !== userId);
        const userDetails = await User.findById(otherId)
          .select("firstName lastName username avatar")
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
router.post("/message", protect, async (req, res) => {
  try {
    const senderId = req.user._id.toString();
    const { conversationId, text, image } = req.body;

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
router.get("/history/:conversationId", protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    // নিরাপত্তা চেক: ইউজার এই চ্যাটের মেম্বার কি না
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] },
    });

    if (!conversation) {
      return res.status(403).json({ error: "Access denied to this Neural Link" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

export default router;