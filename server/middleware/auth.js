import { auth } from 'express-oauth2-jwt-bearer';
import User from "../models/User.js"; 

/**
 * 🔐 OAuth2 JWT Validation Configuration
 * এখানে আপনার Google বা অন্য OAuth2 প্রোভাইডারের ডাটা বসবে।
 */
const checkJwt = auth({
  // ১. আপনার Google Client ID বা API Identifier এখানে বসবে
  audience: process.env.OAUTH2_AUDIENCE || 'YOUR_OAUTH2_CLIENT_ID', 
  
  // ২. আপনার OAuth2 প্রোভাইডারের বেস ইউআরএল (যেমন Google-এর জন্য https://accounts.google.com)
  issuerBaseURL: process.env.OAUTH2_ISSUER || 'https://accounts.google.com', 
  
  tokenSigningAlg: 'RS256'
});

/**
 * 🧠 Smart Auth Middleware with Database Sync
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ১. টোকেন না থাকলে গেস্ট মোড
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = { isGuest: true, id: null };
    return next();
  }

  // ২. OAuth2 টোকেন ভেরিফিকেশন
  checkJwt(req, res, async (err) => {
    if (err) {
      console.warn("⚠️ Neural Sync Interrupted (Invalid OAuth2 Token):", err.message);
      
      // শুধুমাত্র ডাটা পরিবর্তন করার রিকোয়েস্টে (POST/PUT/DELETE) এরর দাও
      if (req.method !== "GET") {
        return res.status(401).json({ 
          error: "Neural Grid Breakdown",
          message: "Invalid or expired session. Please login again." 
        });
      }
      
      req.user = { isGuest: true, id: null };
      return next();
    }
    
    // ৩. টোকেন ভ্যালিড হলে ডাটাবেসে সিঙ্ক (Upsert)
    try {
      if (req.auth && req.auth.payload) {
        const payload = req.auth.payload;
        const oauthId = payload.sub; // ইউনিক আইডি (OAuth2 Standard)

        // ডাইনামিক ডাটা অবজেক্ট (আপনার মডেল অনুযায়ী)
        const updateData = {
          oauthId: oauthId,
          firstName: payload.given_name || payload.name?.split(' ')[0] || "Drifter",
          lastName: payload.family_name || payload.name?.split(' ')[1] || "",
          email: payload.email,
          avatar: payload.picture || "",
          username: payload.nickname || payload.preferred_username || `drifter_${oauthId.slice(-5)}`
        };

        // MongoDB-তে ইউজার সিঙ্ক করা
        const user = await User.findOneAndUpdate(
          { $or: [{ oauthId: oauthId }, { email: payload.email }] },
          { $set: updateData },
          { 
            upsert: true, 
            new: true, 
            setDefaultsOnInsert: true,
            runValidators: false 
          }
        );

        // রিকোয়েস্ট অবজেক্টে ডাটা সেট করা যাতে সব কন্ট্রোলার এটি পায়
        req.user = {
          id: user._id.toString(), // MongoDB ObjectId
          oauthId: oauthId,
          isGuest: false,
          username: user.username,
          activeMode: user.activeMode || 'minimal'
        };
        
        next();
      } else {
        req.user = { isGuest: true, id: null };
        next();
      }
    } catch (dbErr) {
      console.error("❌ Neural Database Sync Error:", dbErr.message);
      req.user = { isGuest: false, dbError: true };
      next();
    }
  });
};

export default authMiddleware;