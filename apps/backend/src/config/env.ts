import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT || "5001",
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://amit:NHOctORoHnITUbIw@ac-gzog6ib-shard-00-00.uujmrd6.mongodb.net:27017,ac-gzog6ib-shard-00-01.uujmrd6.mongodb.net:27017,ac-gzog6ib-shard-00-02.uujmrd6.mongodb.net:27017/?ssl=true&replicaSet=atlas-lvwapq-shard-0&authSource=admin",
  JWT_SECRET: process.env.JWT_SECRET || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  GROQ_MODEL: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  GROQ_MAX_TOKENS: Number(process.env.GROQ_MAX_TOKENS) || 1000,
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER || "amitkavathekar123@gmail.com",
  SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "mtaj fbsx enas rmkv",
  EMAIL_FROM: process.env.EMAIL_FROM || `JobPrep AI <${process.env.SMTP_USER || "amitkavathekar123@gmail.com"}>`,
};
