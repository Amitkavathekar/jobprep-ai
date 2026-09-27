import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env.js';
import { logger } from './logger.js';

let genAI: GoogleGenerativeAI | null = null;

export const getGeminiClient = (): GoogleGenerativeAI | null => {
  if (!genAI) {
    if (!env.GEMINI_API_KEY) {
      logger.warn('⚠️ GEMINI_API_KEY is not set in environment variables.');
      return null;
    }
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI;
};
