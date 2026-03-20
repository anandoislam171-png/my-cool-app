import express from "express";
const router = express.Router();
import { auth } from "express-oauth2-jwt-bearer";
import mongoose from "mongoose";

// Models
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// ✅ Auth Middleware
const checkJwt = auth({
  audience: "https://onyx-drift-api",
  issuerBaseURL: "https://my-cool-app-cvm7.onrender.com",
  tokenSigningAlg: "RS256",
});

/* ==========================================================
    🔍 SEARCH USERS
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
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

/* ==========================================================
    📥 GET CONVERSATIONS
========================================================== */
router.get("/conversations", checkJwt, async (req, res) => {
  try {
    const userId = req.auth?.payload?.sub;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const conversations = await Conversation.find({
      members: { $in: [userId] },
    })
      .sort({ updatedAt: -1 })
      .lean();

    const result = await Promise.all(
      conversations.map(async (conv) => {
        if (!conv.isGroup) {
          const otherId = conv.members.find((m) => m !== userId);

          const userDetails = await User.findOne({
            auth0Id: otherId,
          })
            .select("name nickname avatar auth0Id")
            .lean();

          return { ...conv, userDetails };
        }
        return conv;
      })
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/* ==========================================================
    📤 SEND MESSAGE
========================================================== */
router.post("/message", checkJwt, async (req, res) => {
  try {
    const senderId = req.auth?.payload?.sub;

    const { conversationId, text, media, mediaType } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [senderId] },
    });

    if (!conversation) {
      return res.status(403).json({ error: "Access denied" });
    }

    const newMessage = new Message({
      conversationId,
      senderId,
      text,
      media,
      mediaType,
    });

    const saved = await newMessage.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: { text: text || "Media", senderId },
      updatedAt: new Date(),
    });

    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Send failed" });
  }
});

/* ==========================================================
    📜 GET MESSAGES
========================================================== */
router.get("/:conversationId", checkJwt, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.auth?.payload?.sub;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] },
    });

    if (!conversation) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

export default router;