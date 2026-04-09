import fs from 'fs';
import path from 'path';
import { pool, redisClient } from '../config/db.js';

/* ==========================================================
    ১. পোস্ট তৈরি (Create Post with Local Media)
========================================================== */
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    const authorId = req.user?.id || req.user?._id;

    if (!authorId) {
      return res.status(401).json({ msg: "Neural Identity missing!" });
    }

    let mediaUrl = "";
    let mediaType = "text";

    // লোকাল ফাইল আপলোড লজিক (ফেসবুকের মতো নিজস্ব স্টোরেজ)
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    // PostgreSQL এ ডাটা সেভ করা
    const result = await pool.query(
      `INSERT INTO posts (authorId, text, mediaUrl, mediaType) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [authorId, text, mediaUrl, mediaType]
    );

    // নতুন পোস্ট হলে ক্যাশ ক্লিয়ার করা যাতে ফিডে নতুন পোস্ট আসে
    await redisClient.del('neural_feed');

    res.status(201).json({
      ...result.rows[0],
      message: "Neural Post Synchronized!"
    });

  } catch (err) {
    console.error("❌ Neural Upload Error:", err);
    res.status(500).json({ msg: "Transmission Failed", error: err.message });
  }
};

/* ==========================================================
    ২. হোম ফিড ফেচ (Get Neural Feed with Redis Caching)
========================================================== */
export const getNeuralFeed = async (req, res) => {
  try {
    // ১. প্রথমে Redis ক্যাশ চেক করো
    const cachedPosts = await redisClient.get('neural_feed');
    if (cachedPosts) {
      console.log("⚡ Serving from Redis Cache");
      return res.json(JSON.parse(cachedPosts));
    }

    // ২. যদি ক্যাশ না থাকে, তবে PostgreSQL থেকে আনো (JOIN ব্যবহার করে অথর ডাটা আনা)
    const result = await pool.query(`
      SELECT 
        p.*, 
        u.fullName as "authorName", 
        u.profilePic as "authorProfilePic",
        u.username as "authorUsername",
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as "likesCount"
      FROM posts p
      JOIN users u ON p.authorId = u.id
      ORDER BY p.createdAt DESC 
      LIMIT 30
    `);

    // ৩. ৫ মিনিটের জন্য Redis-এ সেভ করে রাখো
    await redisClient.setEx('neural_feed', 300, JSON.stringify(result.rows));

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Feed Error:", err);
    res.status(500).json({ msg: "Neural grid connection failed" });
  }
};

/* ==========================================================
    ৩. রিলস ফেচিং (Get Reels Only)
========================================================== */
export const getReels = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.fullName, u.profilePic 
       FROM posts p 
       JOIN users u ON p.authorId = u.id 
       WHERE mediaType = 'video' 
       ORDER BY createdAt DESC LIMIT 20`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Reels fetch failed" });
  }
};

/* ==========================================================
    ৪. লাইক/আনলাইক লজিক (Atomic SQL Update)
========================================================== */
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // চেক করা ইউজার আগে লাইক দিয়েছে কি না
    const checkLike = await pool.query(
      'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (checkLike.rows.length === 0) {
      // লাইক দেওয়া
      await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
      await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [postId]);
    } else {
      // আনলাইক করা
      await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
      await pool.query('UPDATE posts SET likes = likes - 1 WHERE id = $1', [postId]);
    }

    res.status(200).json({ message: "Pulse Updated" });
  } catch (err) {
    res.status(500).json({ msg: "Pulse Error" });
  }
};

/* ==========================================================
    ৫. পালস (ভিউ) আপডেট
========================================================== */
export const updateReelPulse = async (req, res) => {
  try {
    await pool.query('UPDATE posts SET views = views + 1 WHERE id = $1', [req.params.id]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Pulse sync failed" });
  }
};