import mongoose from "mongoose";
import pkg from 'pg';
const { Pool } = pkg;
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// ১. MongoDB কানেকশন
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected (Storage Ready)`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
  }
};

// ২. PostgreSQL কানেকশন (Optimized for 127.0.0.1)
export const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || '127.0.0.1',
  database: process.env.PG_DB || 'onyxdrift',
  password: process.env.PG_PASSWORD || '62146214',
  port: process.env.PG_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
});

export const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected (Neural Core Ready)');
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL Connection Failed:', err.message);
  }
};

// ৩. Redis কানেকশন
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("⚡ Redis Connected (Cache Engine Ready)");
    }
  } catch (err) {
    console.error("❌ Redis Connection Error:", err.message);
  }
};

const connectAllDB = async () => {
  await Promise.all([connectMongoDB(), connectPostgres(), connectRedis()]);
};

export default connectAllDB;