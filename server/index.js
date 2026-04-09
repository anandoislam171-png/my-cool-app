import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectAllDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';

const app = express();
const server = http.createServer(app);

// মিডলওয়্যার
app.use(cors({ origin: ["http://localhost:5173", "https://onyx-drift.com"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// রাউটস
app.use('/api/auth', authRoutes);

// Socket.io সেটআপ
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("📡 Node Connected:", socket.id);
});

// সার্ভার স্টার্ট
const startApp = async () => {
  await connectAllDB();
  const PORT = process.env.PORT || 10000;
  server.listen(PORT, () => {
    console.log(`🚀 ONYX CORE ACTIVE ON PORT ${PORT}`);
  });
};

startApp();