import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// JWT Token জেনারেট করার ফাংশন
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* ==========================================================
    🌐 ১. গুগল লগইন লজিক (Social Sync)
========================================================== */
export const googleLogin = async (req, res) => {
  const { googleToken } = req.body;

  try {
    if (!googleToken) {
      return res.status(400).json({ msg: "No Google token provided" });
    }

    // ১. গুগলের টোকেন ভেরিফাই করা
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name, picture, sub } = ticket.getPayload();

    // ২. চেক করা ইউজার আগে থেকে আছে কি না
    let user = await User.findOne({ email });

    if (!user) {
      // যদি নতুন ইউজার হয়, তবে ডাটাবেজে নতুন Identity তৈরি করা
      user = await User.create({
        firstName: given_name,
        lastName: family_name || "",
        email: email,
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        password: sub + process.env.JWT_SECRET, 
        avatar: picture,
      });
      console.log("🆕 New User Created via Google:", user.username);
    }

    // ৩. টোকেন জেনারেট করে রেসপন্স পাঠানো
    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error("🔥 Google Auth Error:", error.message);
    res.status(500).json({ msg: "Google Neural Link Failed", error: error.message });
  }
};

/* ==========================================================
    🔐 ২. স্ট্যান্ডার্ড অথেন্টিকেশন (Email/Password)
========================================================== */

// @desc    Register new user
export const register = async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;
  
  try {
    // ডাটা ভ্যালিডেশন চেক
    if (!firstName || !username || !email || !password) {
      return res.status(400).json({ msg: "Please fill all required fields" });
    }

    // ইমেইল বা ইউজারনেম আগে থেকে আছে কি না চেক
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      const field = userExists.email === email ? "Email" : "Username";
      console.log(`⚠️ Registration Failed: ${field} already exists`);
      return res.status(400).json({ msg: `${field} already taken` });
    }

    const user = await User.create({ firstName, lastName, username, email, password });
    
    if (user) {
      console.log("✅ New User Registered:", username);
      res.status(201).json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username
        }
      });
    }
  } catch (error) {
    console.error("🔥 Registration Error:", error.message);
    // ডাটাবেজ লেভেলের এরর ফ্রন্টএন্ডে পাঠানো (যেমন: ValidationError)
    res.status(400).json({ msg: error.message });
  }
};

// @desc    Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ Login Failed: User not found");
      return res.status(401).json({ msg: "No user found with this email" });
    }

    const isMatch = await user.matchPassword(password);
    
    if (isMatch) {
      console.log("✅ Login Successful:", user.username);
      res.json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } else {
      console.log("🚫 Login Failed: Incorrect password");
      res.status(401).json({ msg: "Incorrect password" });
    }
  } catch (error) {
    console.error("🔥 Login Error:", error.message);
    res.status(500).json({ msg: "Login error", error: error.message });
  }
};

/* ==========================================================
    👤 ৩. প্রোফাইল ম্যানেজমেন্ট
========================================================== */

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.bio = req.body.bio || user.bio;
      user.avatar = req.body.avatar || user.avatar;
      
      const updatedUser = await user.save();
      res.json(updatedUser);
    }
  } catch (error) {
    res.status(500).json({ msg: "Update failed", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  res.json({ msg: "Token refreshed successfully" });
};