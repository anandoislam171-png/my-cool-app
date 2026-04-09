import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// কন্ট্রোলার থেকে ফাংশনগুলো ইমপোর্ট করা
import { 
  register, 
  login, 
  refreshToken, 
  getMe, 
  updateProfile,
  googleLogin,
  forgotPassword, // নতুন ইমপোর্ট
  resetPassword  // নতুন ইমপোর্ট
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================
    🔐 ১. স্ট্যান্ডার্ড অথেন্টিকেশন রাউটস (Email/Password)
========================================================= */

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
    🛰️ ২. পাসওয়ার্ড রিকভারি রাউটস (Recovery Protocol)
========================================================== */

// পাসওয়ার্ড রিসেট লিঙ্ক পাঠানোর রিকোয়েস্ট
router.post('/forgot-password', forgotPassword);

// নতুন পাসওয়ার্ড সেট করা (টোকেন সহ)
router.post('/reset-password/:token', resetPassword);


/* ==========================================================
    🌐 ৩. গুগল OAuth2 রাউটস (Social Login)
========================================================== */

/**
 * @route   POST /api/auth/google
 * @desc    ফ্রন্টএন্ড থেকে আসা গুগল টোকেন ভেরিফাই করে লগইন করা
 * @access  Public
 */
router.post('/google', googleLogin); 


/** * ৪. পাসপোর্ট জেএস (Redirect Method) - ঐচ্ছিক
 */

// গুগলের সাইন-ইন পেজে নিয়ে যাবে
router.get('/google/redirect', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account' 
}));

// গুগল থেকে ফিরে আসার পর এই রাউট কাজ করবে (Callback)
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    try {
      // টোকেন জেনারেট করা
      const token = jwt.sign(
        { id: req.user._id.toString() }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
      );

      // প্রোডাকশন ইউআরএল (OnyxDrift Domain)
      const frontendURL = process.env.NODE_ENV === 'production' 
        ? "https://onyx-drift.com" 
        : "http://localhost:5173";

      // সাকসেস হলে ফ্রন্টএন্ডে টোকেনসহ রিডাইরেক্ট
      res.redirect(`${frontendURL}/login-success?token=${token}`);
    } catch (error) {
      console.error("🔥 Google Auth Redirect Error:", error);
      const frontendURL = process.env.NODE_ENV === 'production' ? "https://onyx-drift.com" : "http://localhost:5173";
      res.redirect(`${frontendURL}/login?error=auth_failed`);
    }
  }
);

export default router;