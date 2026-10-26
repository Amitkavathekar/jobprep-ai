import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT || "5001",
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  GROQ_MAX_TOKENS: Number(process.env.GROQ_MAX_TOKENS) || 1000,
};
