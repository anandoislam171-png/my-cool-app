import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { 
  register, 
  login, 
  refreshToken, 
  getMe, 
  updateProfile 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- ১. স্ট্যান্ডার্ড অথেন্টিকেশন রাউটস (Email/Password) ---

// নতুন ইউজার রেজিস্ট্রেশন
router.post('/register', register);

// ইউজার লগইন
router.post('/login', login);

// টোকেন রিফ্রেশ (সেশন দীর্ঘস্থায়ী করার জন্য)
router.post('/refresh', refreshToken);

// নিজের প্রোফাইল ডাটা দেখা (Protected)
router.get('/me', protect, getMe);

// প্রোফাইল আপডেট করা (Protected)
router.put('/profile', protect, updateProfile);


// --- ২. গুগল OAuth2 রাউটস (Social Login) ---

// গুগলের সাইন-ইন পেজে নিয়ে যাবে
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// গুগল থেকে ফিরে আসার পর এই রাউট কাজ করবে
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    try {
      // গুগল থেকে আসা ইউজারের জন্য নতুন JWT টোকেন তৈরি
      const token = jwt.sign(
        { id: req.user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
      );

      // টোকেনটি নিয়ে ফ্রন্টএন্ডে রিডাইরেক্ট (Vercel URL অনুযায়ী পরিবর্তন করুন)
      // আমরা কুয়েরি প্যারামিটার হিসেবে টোকেন পাঠাচ্ছি যাতে ফ্রন্টএন্ড সেটি ধরতে পারে
      const frontendURL = process.env.NODE_ENV === 'production' 
        ? "https://onyx-drift-app-final.vercel.app" 
        : "http://localhost:5173";

      res.redirect(`${frontendURL}/login?token=${token}`);
    } catch (error) {
      console.error("Google Auth Redirect Error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

export default router;