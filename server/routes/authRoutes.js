import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// আপনার কন্ট্রোলার থেকে ফাংশনগুলো ইমপোর্ট করা
import { 
  register, 
  login, 
  refreshToken, 
  getMe, 
  updateProfile,
  googleLogin // এটি অবশ্যই কন্ট্রোলারে থাকতে হবে (নিচে বুঝিয়ে দিচ্ছি)
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================
    🔐 ১. স্ট্যান্ডার্ড অথেন্টিকেশন রাউটস (Email/Password)
========================================================== */

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


/* ==========================================================
    🌐 ২. গুগল OAuth2 রাউটস (Social Login)
========================================================== */

/**
 * @route   POST /api/auth/google
 * @desc    ফ্রন্টএন্ড থেকে আসা গুগল টোকেন ভেরিফাই করে লগইন করা
 * @access  Public
 */
router.post('/google', googleLogin); // এই রাউটটিই আপনার ফ্রন্টএন্ড কল করছে


/** * নিচের রাউটগুলো পাসপোর্ট জেএস (Redirect Method) এর জন্য। 
 * আপনি যদি সরাসরি ফ্রন্টএন্ডে গুগল বাটন ইউজ করেন তবে এগুলো ঐচ্ছিক।
 */

// গুগলের সাইন-ইন পেজে নিয়ে যাবে (Passport Method)
router.get('/google/redirect', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account' 
}));

// গুগল থেকে ফিরে আসার পর এই রাউট কাজ করবে
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
      );

      const frontendURL = process.env.NODE_ENV === 'production' 
        ? "https://onyx-drift-app-final.vercel.app" 
        : "http://localhost:5173";

      res.redirect(`${frontendURL}/login?token=${token}`);
    } catch (error) {
      console.error("Google Auth Redirect Error:", error);
      res.redirect(`${frontendURL}/login?error=auth_failed`);
    }
  }
);

export default router;