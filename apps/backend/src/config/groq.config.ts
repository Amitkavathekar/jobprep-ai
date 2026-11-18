
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is missing from backend environment variables");
}

export const groq = new Groq({
  apiKey,
});

export const GROQ_MODEL =
  process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export const GROQ_MAX_TOKENS = parseInt(
  process.env.GROQ_MAX_TOKENS || "1000",
  10,
);

