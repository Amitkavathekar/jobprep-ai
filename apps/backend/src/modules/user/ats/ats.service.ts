
import { groq, GROQ_MODEL, GROQ_MAX_TOKENS } from "../../../config/groq.config";
import { extractResumeText } from "../../../services/pdf-parser.service";
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

// Convert AI response into our expected structure
function parseAIResponse(content: string): ATSAnalysisResult {
  let data: Record<string, unknown>;

  try {
    const parsed: unknown = JSON.parse(content);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid JSON object");
    }

    data = parsed as Record<string, unknown>;
  } catch {
    throw new Error(
      "AI returned invalid or incomplete JSON. Increase GROQ_MAX_TOKENS."
    );
  }

  const getString = (value: unknown): string =>
    typeof value === "string" ? value : "";

  const getArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];

  return {
    targetJobRole: getString(data.targetJobRole),
    score:
      typeof data.score === "number" && Number.isFinite(data.score)
        ? Math.max(0, Math.min(100, Math.round(data.score)))
        : 70,
    summary: getString(data.summary) || "ATS analysis completed.",
    matchedSkills: getArray(data.matchedSkills),
    missingSkills: getArray(data.missingSkills),
    strengths: getArray(data.strengths),
    weaknesses: getArray(data.weaknesses),
    recommendations: getArray(data.recommendations),
    keywordSuggestions: getArray(data.keywordSuggestions),
  };
}

// Main ATS analysis function
export async function analyzeResume(
  fileOrText: Express.Multer.File | string,
  requestedRole: unknown,
  jobDescription?: string,
): Promise<ATSAnalysisResult> {

  // 1. Validate job role
  const targetJobRole = validateATSRequest(requestedRole);

  // 2. Extract resume text
  const resumeText =
    typeof fileOrText === "string"
      ? fileOrText.trim()
      : await extractResumeText(fileOrText);

  // 3. Validate resume content
  if (!resumeText || resumeText.length < 15) {
    throw new Error("Resume content is empty or too short.");
  }

  // 4. Prepare job description
  const jdContext = jobDescription?.trim()
    ? `JOB DESCRIPTION:\n${jobDescription.trim().slice(0, 1500)}`
    : "No job description provided.";

  // 5. Create AI prompt
  const prompt = `
You are an experienced ATS resume analyzer.

Analyze the following resume for the target job role.

TARGET ROLE:
${targetJobRole}

${jdContext}

RESUME:
${resumeText.slice(0, 4500)}

Analyze:
1. ATS score from 0 to 100.
2. Matched skills.
3. Missing skills.
4. Resume strengths.
5. Resume weaknesses.
6. Recommendations.
7. Suggested keywords.

Only consider skills actually mentioned in the resume as matched.
Give realistic results.
Keep each array concise, with maximum 5 items.

Return ONLY valid JSON in this format:

{
  "targetJobRole": "${targetJobRole}",
  "score": 80,
  "summary": "Resume assessment",
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "keywordSuggestions": []
}
`;

  // 6. Call Groq AI
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.2,
    max_tokens: Math.max(400, GROQ_MAX_TOKENS),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are an ATS analyzer. Return complete valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // 7. Get AI response
  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response.");
  }

  // 8. Parse AI response
  const analysis = parseAIResponse(content);

  // 9. Set validated job role
  analysis.targetJobRole = targetJobRole;

  return analysis;
}
