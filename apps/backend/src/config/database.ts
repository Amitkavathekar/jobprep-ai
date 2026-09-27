import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';
import { logger } from './logger.js';

// Force Node.js DNS resolution to IPv4 first to prevent querySrv ECONNREFUSED issues on Windows
dns.setDefaultResultOrder('ipv4first');

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`🍃 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
    logger.warn(
      `⚠️ Tip: If using MongoDB Atlas (mongodb+srv://), ensure:\n` +
      `   1. Your current IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0 for dev).\n` +
      `   2. Check internet connection / DNS settings.\n` +
      `   3. Or set MONGODB_URI=mongodb://127.0.0.1:27017/jobprep-ai in .env for local MongoDB.`
    );
  }
};
