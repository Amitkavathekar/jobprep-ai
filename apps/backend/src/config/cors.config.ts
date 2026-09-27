import { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [env.CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
