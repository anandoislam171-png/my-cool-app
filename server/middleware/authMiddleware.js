import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // হেডার থেকে টোকেন আলাদা করা
      token = req.headers.authorization.split(" ")[1];

      // টোকেন ভেরিফাই করা
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ডাটাবেজ থেকে ইউজারকে খুঁজে বের করে রিকোয়েস্টে সেট করা
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ msg: "User not found in Neural Grid" });
      }

      next();
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ msg: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ msg: "Not authorized, no token" });
  }
};