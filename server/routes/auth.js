import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// --- Redis Client Setup ---
// রেন্ডার-এ Redis URL থাকলে সেটা নিবে, না থাকলে কানেকশন ইগনোর করবে (প্রোডাকশন সেফটি)
let redisClient;
if (process.env.REDIS_URL) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.connect().catch(() => console.log("⚠️ Redis not connected, falling back to DB"));
}

// টোকেন জেনারেটর হেল্পার
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- ১. রেজিস্ট্রেশন রাউট ---
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Neural ID already exists." });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password, // নিশ্চিত করুন User Model এ password hashing middleware আছে
            activeMode: 'minimal'
        });

        if (user) {
            const token = generateToken(user._id);
            
            // ক্যাশে সেভ করা (ঐচ্ছিক)
            if (redisClient?.isOpen) {
                await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user));
            }

            res.status(201).json({
                accessToken: token, // ফ্রন্টএন্ডের সাথে মিল রেখে accessToken পাঠানো হচ্ছে
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    activeMode: user.activeMode
                },
                message: "Neural Link Established"
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Initialization Failed: " + error.message });
    }
});

// --- ২. লগইন রাউট ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = null;

        // ১. ক্যাশে চেক (যদি Redis থাকে)
        if (redisClient?.isOpen) {
            const cachedUser = await redisClient.get(`user_mail:${email}`);
            if (cachedUser) {
                user = JSON.parse(cachedUser);
                console.log("⚡ Data served from Redis Cache");
            }
        }

        // ২. ক্যাশে না থাকলে ডাটাবেজে যাও
        if (!user) {
            user = await User.findOne({ email });
            if (user && redisClient?.isOpen) {
                await redisClient.setEx(`user_mail:${email}`, 3600, JSON.stringify(user));
            }
        }

        // ৩. পাসওয়ার্ড চেক (matchPassword আপনার মডেলে থাকতে হবে)
        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);

            res.json({
                accessToken: token,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    email: user.email,
                    activeMode: user.activeMode || 'minimal'
                },
                message: "Grid Access Granted"
            });
        } else {
            res.status(401).json({ message: "Invalid Neural Credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: "Access Denied: " + error.message });
    }
});

// --- ৩. গেট মি (AuthContext এর রিফ্রেশ ইস্যু ফিক্স করার জন্য) ---
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Not authorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: "Session Expired" });
    }
});

export default router;