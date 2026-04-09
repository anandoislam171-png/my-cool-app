import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Neural Auth Protection Middleware (OnyxDrift Optimized)
 * @access  Private
 */
export const protect = async (req, res, next) => {
  let token;

  // ১. হেডার থেকে Bearer Token চেক করা
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // টোকেন আলাদা করা
      token = req.headers.authorization.split(" ")[1];

      // টোকেন যদি নাল বা আনডিফাইন্ড স্ট্রিং হিসেবে আসে (ফ্রন্টএন্ড সেফটি)
      if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({ 
          error: "Neural Link Missing", 
          message: "Invalid Token Format: Neural connection not established." 
        });
      }

      // ২. টোকেন ভেরিফাই করা
      // আপনার .env-এর JWT_SECRET সরাসরি ব্যবহার করা হয়েছে, না থাকলে ফলব্যাক।
      const secret = process.env.JWT_SECRET || "onyx_drift_super_secret_key_2026";
      
      const decoded = jwt.verify(token, secret);

      // ৩. ডাটাবেজ থেকে ইউজার রিট্রিভ করা (.lean() পারফরম্যান্স বাড়ায়)
      const user = await User.findById(decoded.id).select("-password").lean();

      if (!user) {
        return res.status(401).json({ 
          error: "Identity Lost", 
          message: "User no longer exists in the Neural Grid." 
        });
      }

      // ৪. ইউজার ডাটা রিকোয়েস্ট অবজেক্টে সেট করা (ID কন্সিস্টেন্সি নিশ্চিত করা হয়েছে)
      req.user = {
        ...user,
        id: user._id.toString() 
      };

      return next();

    } catch (error) {
      console.error("🔒 Auth Error:", error.message);
      
      let errorMessage = "Unauthorized Access";
      let errorType = "Neural Link Severed";

      // নির্দিষ্ট এরর টাইপ চেক করা
      if (error.name === "TokenExpiredError") {
        errorType = "Neural Session Expired";
        errorMessage = "Your session has timed out. Please Re-sync.";
      } else if (error.name === "JsonWebTokenError") {
        errorMessage = "Invalid signature. Neural link tampered or secret mismatch.";
      }

      return res.status(401).json({ 
        error: errorType, 
        message: errorMessage 
      });
    }
  }

  // ৫. যদি হেডারেই টোকেন না থাকে বা ফরমেট ভুল হয়
  if (!token) {
    return res.status(401).json({ 
      error: "No Neural Credentials", 
      message: "Access Denied: Please login to enter the drift." 
    });
  }
};