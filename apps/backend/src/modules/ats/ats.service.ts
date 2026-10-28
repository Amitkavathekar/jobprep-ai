
import { groq, GROQ_MODEL, GROQ_MAX_TOKENS } from "../../config/groq.config";
import { extractResumeText } from "../../services/pdf-parser.service";
import { validateATSRequest } from "./ats.validation";

export interface ATSAnalysisResult {
  targetJobRole: string;
  score: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordSuggestions: string[];
}

function repairTruncatedJSON(jsonStr: string): string {
  let str = jsonStr.trim();

  if (str.endsWith("\\")) {
    str = str.slice(0, -1);
  }

  // Detect and close unclosed string quotes
  let inString = false;
  let quoteEscaped = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "\\" && inString) {
      quoteEscaped = !quoteEscaped;
    } else if (char === '"' && !quoteEscaped) {
      inString = !inString;
    } else {
      quoteEscaped = false;
    }
  }

  if (inString) {
    str += '"';
  }

  // Clean trailing commas or hanging key definitions like `"key":`
  str = str.replace(/,\s*$/, "");
  str = str.replace(/,\s*("[^"]*"\s*:\s*)?$/, "");

  // Track and balance open brackets and braces
  const stack: string[] = [];
  inString = false;
  quoteEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "\\" && inString) {
      quoteEscaped = !quoteEscaped;
    } else if (char === '"' && !quoteEscaped) {
      inString = !inString;
    } else if (!inString) {
      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}" && stack[stack.length - 1] === "{") {
        stack.pop();
      } else if (char === "]" && stack[stack.length - 1] === "[") {
        stack.pop();
      }
    } else {
      quoteEscaped = false;
    }
  }

  while (stack.length > 0) {
    const open = stack.pop();
    str = str.replace(/,\s*$/, "");
    if (open === "{") {
      str += "}";
    } else if (open === "[") {
      str += "]";
    }
  }

  return str;
}

function parseAIResponse(content: string): ATSAnalysisResult {
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let result: unknown;

  try {
    result = JSON.parse(cleaned);
  } catch {
    try {
      const repaired = repairTruncatedJSON(cleaned);
      result = JSON.parse(repaired);
    } catch {
      throw new Error(
        "AI response was truncated or returned malformed JSON. Try increasing GROQ_MAX_TOKENS in your backend .env.",
      );
    }
  }

  if (!result || typeof result !== "object") {
    throw new Error("AI returned an invalid analysis response.");
  }

  const data = result as Record<string, unknown>;

  const asString = (value: unknown, fallback = ""): string =>
    typeof value === "string" ? value : fallback;

  const asStringArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];

  const score =
    typeof data.score === "number" && Number.isFinite(data.score)
      ? Math.max(0, Math.min(100, Math.round(data.score)))
      : 70;

  return {
    targetJobRole: asString(data.targetJobRole),
    score,
    summary: asString(data.summary, "ATS scan completed successfully."),
    matchedSkills: asStringArray(data.matchedSkills),
    missingSkills: asStringArray(data.missingSkills),
    strengths: asStringArray(data.strengths),
    weaknesses: asStringArray(data.weaknesses),
    recommendations: asStringArray(data.recommendations),
    keywordSuggestions: asStringArray(data.keywordSuggestions),
  };
}

export async function analyzeResume(
  fileOrText: Express.Multer.File | string,
  requestedRole: unknown,
  jobDescription?: string,
): Promise<ATSAnalysisResult> {
  const targetJobRole = validateATSRequest(requestedRole);
  const resumeText =
    typeof fileOrText === "string"
      ? fileOrText.trim()
      : await extractResumeText(fileOrText);

  if (!resumeText || resumeText.length < 15) {
    throw new Error("Resume content is empty or too short to analyze.");
  }

  const tokenBudget = Math.max(400, GROQ_MAX_TOKENS);
  const maxItemsPerList = tokenBudget <= 650 ? 3 : tokenBudget <= 1000 ? 5 : 8;
  const summaryGuidance =
    tokenBudget <= 650
      ? "Provide a concise summary in 1-2 brief sentences."
      : "Provide a clear summary in 2-3 sentences.";

  const jdContext =
    jobDescription && typeof jobDescription === "string" && jobDescription.trim().length > 10
      ? `\nTARGET JOB DESCRIPTION:\n"""\n${jobDescription.trim().slice(0, 1500)}\n"""\n`
      : "";

  const prompt = `
You are an experienced resume reviewer and ATS (Applicant Tracking System) analyst.

Analyze the resume (which is the user's latest edited resume) against the target job role and job description provided below.

TARGET JOB ROLE:
${targetJobRole}
${jdContext}
RESUME TEXT:
"""
${resumeText.slice(0, 4500)}
"""

RULES & BUDGET:
1. Evaluate actual resume content strictly against the target job role and job description.
2. Only mark a skill as matched if evidenced in the resume text.
3. Mark skills and keywords required by the target job role/description but missing in the resume as missingSkills.
4. Give a realistic ATS compatibility score from 0 to 100 based on keyword match, structure, and qualifications.
5. STRICT TOKEN BUDGET (${tokenBudget} tokens):
   - You MUST complete the entire JSON response strictly within ${tokenBudget} tokens.
   - ${summaryGuidance}
   - Limit each array to at most ${maxItemsPerList} concise items (2-6 words per item).
   - Never leave JSON unclosed.

Return ONLY valid JSON in this exact shape:
{
  "targetJobRole": "string",
  "score": 0,
  "summary": "Short assessment",
  "matchedSkills": ["skill"],
  "missingSkills": ["skill"],
  "strengths": ["strength"],
  "weaknesses": ["weakness"],
  "recommendations": ["recommendation"],
  "keywordSuggestions": ["keyword"]
}

Return no markdown formatting and no extra text outside the JSON.
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.2,
    max_tokens: tokenBudget,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an ATS analyzer. You always return valid, complete, and compact JSON within the exact token budget.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("The AI service returned an empty response.");
  }

  const analysis = parseAIResponse(content);

  // Use the user's validated role as the authoritative display value.
  analysis.targetJobRole = targetJobRole;

  return analysis;
}

