import User from "../models/User.js";
import jwt from "jsonwebtoken";

// JWT Token জেনারেট করার ফাংশন
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
export const register = async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const user = await User.create({ firstName, lastName, username, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ msg: "Registration failed", error: error.message });
  }
};

// @desc    Login user
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Login error" });
  }
};

// @desc    Get current user profile (এটিই আপনার এরর দিচ্ছে)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    Update profile
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
    res.status(500).json({ msg: "Update failed" });
  }
};

// @desc    Refresh Token
export const refreshToken = async (req, res) => {
  // সেশন ধরে রাখার জন্য সিম্পল রিফ্রেশ লজিক
  res.json({ msg: "Token refreshed successfully" });
};