import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { pool, redisClient } from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';

dotenv.config();
const router = express.Router();

// --- ১. Gemini AI Config ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- ২. Multer Storage ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `onyx-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage, 
    limits: { fileSize: 150 * 1024 * 1024 } 
});

/* ==========================================================
    🎥 ৩. PRO VIDEO RENDERING ENGINE (FFmpeg)
========================================================== */
router.post("/process", protect, upload.single("media"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No Media detected." });

    let instructions;
    try {
        instructions = typeof req.body.editInstructions === 'string' 
            ? JSON.parse(req.body.editInstructions) 
            : req.body.editInstructions;
    } catch (e) {
        return res.status(400).json({ error: "Invalid Edit Instructions." });
    }

    const videoPath = req.file.path;
    const outputFilename = `processed-${Date.now()}.mp4`;
    const outputPath = path.join('uploads/', outputFilename);

    let command = ffmpeg(videoPath);

    // Filters Calculation
    const b = (instructions.filters?.brightness - 100) / 100 || 0;
    const c = instructions.filters?.contrast / 100 || 1;
    const s = instructions.filters?.saturate / 100 || 1;
    let filters = [`eq=brightness=${b}:contrast=${c}:saturation=${s}`];

    if (instructions.playbackSpeed && instructions.playbackSpeed !== 1) {
        filters.push(`setpts=${1 / instructions.playbackSpeed}*PTS`);
    }

    command
        .videoFilters(filters)
        .on('end', async () => {
            try {
                const result = await pool.query(
                    `INSERT INTO posts (authorId, text, mediaUrl, mediaType, isAiGenerated) 
                     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                    [req.user.id, instructions.caption || "", `/uploads/${outputFilename}`, "video", false]
                );

                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
                try { await redisClient.del('neural_feed'); } catch (e) {} 

                res.status(201).json(result.rows[0]);
            } catch (err) {
                res.status(500).json({ error: "DB Sync Failed" });
            }
        })
        .on('error', (err) => {
            console.error("FFmpeg Error:", err);
            res.status(500).json({ error: "Rendering Grid Offline" });
        })
        .save(outputPath);
});

/* ==========================================================
    🧠 ৪. NEURAL FEED (PostgreSQL + Redis Resonance)
========================================================== */
router.get("/neural-feed", async (req, res) => {
    try {
        // ১. Redis ক্যাশ চেক (Safety First)
        try {
            const cachedData = await redisClient.get('neural_feed');
            if (cachedData) return res.json(JSON.parse(cachedData));
        } catch (redisErr) {
            console.warn("⚠️ Redis Offline, fetching from SQL...");
        }

        // ২. SQL Query (Resonance Score)
        const result = await pool.query(`
            SELECT p.*, u.fullName as "authorName", u.profilePic as "authorAvatar",
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) * 5 as "resonanceScore"
            FROM posts p
            JOIN users u ON p.authorId = u.id
            ORDER BY p.createdAt DESC LIMIT 50
        `);

        // ৩. ক্যাশ সেভ (৫ মিনিট)
        try {
            await redisClient.setEx('neural_feed', 300, JSON.stringify(result.rows));
        } catch (e) {}

        res.json(result.rows);
    } catch (err) {
        console.error("Feed Error:", err);
        res.status(500).json({ msg: "Neural Grid Offline" });
    }
});

/* ==========================================================
    🤖 ৫. AI ANALYZE (Gemini)
========================================================== */
router.post("/ai-analyze", async (req, res) => {
    const { text, authorName } = req.body;
    if (!text) return res.status(400).json({ analysis: "No neural input." });

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
    🚀 ৬. CREATE SIMPLE POST
========================================================== */
router.post("/", protect, upload.single("media"), async (req, res) => {
    try {
        const mediaUrl = req.file ? `/uploads/${req.file.filename}` : "";
        let mediaType = "text";
        if (req.file) {
            mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
        }

        const result = await pool.query(
            `INSERT INTO posts (authorId, text, mediaUrl, mediaType) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.id, req.body.text || "", mediaUrl, mediaType]
        );

        try { await redisClient.del('neural_feed'); } catch (e) {}
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ msg: "Neural Breakdown." });
    }
});
/* ==========================================================
    ❤️ ৭. LIKE & 💬 COMMENT (SQL Logic)
========================================================== */
router.post("/:id/like", protect, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const check = await pool.query('SELECT * FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        
        if (check.rows.length === 0) {
            await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
        } else {
            await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        }

        await redisClient.del('neural_feed');
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Heart sync error." }); }
});

router.post("/:id/comment", protect, async (req, res) => {
    try {
        const { text } = req.body;
        await pool.query(
            'INSERT INTO comments (post_id, user_id, text) VALUES ($1, $2, $3)',
            [req.params.id, req.user.id, text]
        );
        res.json({ msg: "Comment Linked" });
    } catch (err) { res.status(500).json({ msg: "Comm link failure." }); }
});

/* ==========================================================
    🗑️ ৮. DELETE & PROFILE
========================================================== */
router.delete("/:id", protect, async (req, res) => {
    try {
        const check = await pool.query('SELECT * FROM posts WHERE id = $1 AND authorId = $2', [req.params.id, req.user.id]);
        if (check.rows.length === 0) return res.status(403).send("Denied.");

        await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
        await redisClient.del('neural_feed');
        res.json({ msg: "Terminated" });
    } catch (err) { res.status(500).json({ msg: "Failed." }); }
});

export default router;