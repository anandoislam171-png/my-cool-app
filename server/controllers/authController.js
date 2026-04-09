import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessKey = (id) => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshKey = (id) => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessKey(user._id);
      const refreshToken = generateRefreshKey(user._id);

      res.cookie('onyx_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      res.json({ token: accessToken, user: { _id: user._id, username: user.username, avatar: user.avatar } });
    } else {
      res.status(401).json({ msg: "Invalid credentials." });
    }
  } catch (error) {
    res.status(500).json({ msg: "Neural Login failed." });
  }
};

export const refreshToken = async (req, res) => {
  const incomingToken = req.cookies.onyx_refresh_token;
  if (!incomingToken) return res.status(401).json({ msg: "No Refresh Token" });

  try {
    const decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessKey(decoded.id);
    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(403).json({ msg: "Invalid Refresh Token" });
  }
};

// ... (register, googleLogin, logout functions here)