import { Types } from "mongoose";
import { groq, GROQ_MODEL, GROQ_MAX_TOKENS } from "../../config/groq.config";
import { extractResumeText } from "../../services/pdf-parser.service";
import { AiAnalysis } from "./ai-analysis.model";
import { MatchLevel } from "./match-level.model";
import { Severity } from "./severity.model";
import { Priority } from "./priority.model";
import { JdGap } from "./jd-gap.model";
import { JdSuggestion } from "./jd-suggestion.model";
import { JobResume } from "../resume/resume.model";
import { AtsAnalysesCombinedReport } from "../reports/ats-analysis-combined-report.model";

export interface AIAnalysisOutput {
  id: string;
  jobResumeId?: string;
  score: number;
  matchLevel: string;
  workingPoints: string[];
  keywords: {
    matched: string[];
    partial: string[];
    missing: string[];
  };
  gaps: Array<{
    area: string;
    severity: "high" | "medium" | "low";
    detail: string;
  }>;
  suggestions: Array<{
    id: number;
    text: string;
    impact: "high" | "medium" | "low";
    category: string;
  }>;
  resumeSections: Array<{
    title: string;
    isHeader?: boolean;
    content: string;
    highlights?: string[];
  }>;
  parsedResume?: any;
  resumeFileName: string;
  jobDescription?: string;
  createdAt: string;
}

function repairTruncatedJSON(jsonStr: string): string {
  let str = jsonStr.trim();
  if (str.endsWith("\\")) str = str.slice(0, -1);

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

  if (inString) str += '"';
  str = str.replace(/,\s*$/, "");
  str = str.replace(/,\s*("[^"]*"\s*:\s*)?$/, "");

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
    if (open === "{") str += "}";
    else if (open === "[") str += "]";
  }

  return str;
}

export function formatSectionContentWithBullets(lines: string[]): string {
  const result: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Remove any existing bullet or list characters: •, -, *, o, ▪, ▫, –, —, >
    const cleanLine = line.replace(/^[•\-\*o▪▫–—>]\s*/, "").trim();
    if (!cleanLine) continue;

    // Check if line contains multiple sentences (e.g. ended with . ! ? followed by space and capital letter or number)
    const sentences = cleanLine
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/g)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length > 1) {
      for (const sentence of sentences) {
        result.push(`• ${sentence}`);
      }
    } else {
      result.push(`• ${cleanLine}`);
    }
  }

  return result.join("\n");
}

export function parseResumeSectionsFromRawText(
  rawText: string,
  fallbackFileName: string,
  matchedKeywords: string[] = [],
): Array<{ title: string; isHeader?: boolean; content: string; highlights?: string[] }> {
  const sections: Array<{
    title: string;
    isHeader?: boolean;
    content: string;
    highlights?: string[];
  }> = [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [
      {
        title: fallbackFileName.replace(/\.[^/.]+$/, ""),
        isHeader: true,
        content: "Email and contact details extracted from uploaded document.",
      },
    ];
  }

  // Section Heading matchers
  const SECTION_HEADINGS_DEF = [
    {
      regex: /^(?:PROFESSIONAL\s+|EXECUTIVE\s+|CAREER\s+)?(?:SUMMARY|PROFILE|OBJECTIVE|BIO|ABOUT\s+ME|OVERVIEW)$/i,
      title: "Summary",
    },
    {
      regex: /^(?:TECHNICAL\s+|CORE\s+|KEY\s+|IT\s+)?(?:SKILLS|COMPETENCIES|TECHNOLOGIES|TECH\s+STACK|EXPERTISE|TOOLING|TOOLS|AREAS\s+OF\s+EXPERTISE)$/i,
      title: "Technical Skills",
    },
    {
      regex: /^(?:WORK\s+|PROFESSIONAL\s+|EMPLOYMENT\s+|CAREER\s+|RELEVANT\s+)?(?:EXPERIENCE|HISTORY|BACKGROUND|INTERNSHIPS?)$/i,
      title: "Work Experience",
    },
    {
      regex: /^(?:KEY\s+|ACADEMIC\s+|FEATURED\s+|TECHNICAL\s+|SELECTED\s+|CAPSTONE\s+)?PROJECTS?$/i,
      title: "Projects",
    },
    {
      regex: /^(?:EDUCATION|ACADEMIC\s+BACKGROUND|EDUCATIONAL\s+QUALIFICATIONS|ACADEMIC\s+QUALIFICATIONS|QUALIFICATIONS|ACADEMICS|EDUCATION\s+&\s+TRAINING)$/i,
      title: "Education",
    },
    {
      regex: /^(?:CERTIFICATIONS?|CERTIFICATES?|LICENSES?\s+&\s+CERTIFICATIONS?|COURSES?|TRAINING|CREDENTIALS)$/i,
      title: "Certifications",
    },
    {
      regex: /^(?:HONORS?\s+&\s+)?(?:AWARDS?|ACHIEVEMENTS?|ACCOMPLISHMENTS?|KEY\s+HIGHLIGHTS|RECOGNITIONS?)$/i,
      title: "Achievements & Awards",
    },
    {
      regex: /^(?:PUBLICATIONS?|RESEARCH\s+PAPERS?|PATENTS?|CONFERENCES?)$/i,
      title: "Publications & Research",
    },
    {
      regex: /^(?:LANGUAGES?|KNOWN\s+LANGUAGES?|LANGUAGE\s+PROFICIENCIES?)$/i,
      title: "Languages",
    },
    {
      regex: /^(?:EXTRACURRICULAR\s+ACTIVITIES?|VOLUNTEER(?:ING)?|LEADERSHIP|ACTIVITIES|INTERESTS?|HOBBIES?|DECLARATION|ADDITIONAL\s+INFORMATION)$/i,
      title: "Additional Information",
    },
  ];

  function detectHeading(line: string): string | null {
    const clean = line.replace(/[:\-–—\s]+$/, "").trim();
    if (!clean || clean.length > 55) return null;
    if (clean.includes("@") || clean.includes("http") || clean.includes(".com")) return null;

    // 1. Exact or keyword match from definitions
    for (const def of SECTION_HEADINGS_DEF) {
      if (def.regex.test(clean)) return def.title;
    }

    // 2. Contains major heading words
    if (/^(?=.*(?:skills?|technolog)).*$/i.test(clean)) return "Technical Skills";
    if (/^(?=.*(?:experience|employment|work\s*history)).*$/i.test(clean)) return "Work Experience";
    if (/^(?=.*projects?).*$/i.test(clean)) return "Projects";
    if (/^(?=.*(?:education|academic|qualifications)).*$/i.test(clean)) return "Education";
    if (/^(?=.*(?:certificat|license|courses?)).*$/i.test(clean)) return "Certifications";
    if (/^(?=.*(?:awards?|achievements?|honors?)).*$/i.test(clean)) return "Achievements & Awards";

    // 3. Short standalone ALL CAPS line that looks like a custom heading (e.g., "RESPONSIBILITIES", "STRENGTHS", "EXTRA-CURRICULAR")
    if (
      clean.length >= 3 &&
      clean.length <= 40 &&
      clean === clean.toUpperCase() &&
      /^[A-Z0-9\s&/\-]+$/.test(clean) &&
      clean.split(/\s+/).length <= 4 &&
      !clean.match(/\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|\d{4})\b/)
    ) {
      return clean;
    }

    return null;
  }

  // 1. Find the first section heading line
  let firstHeadingIdx = -1;
  let firstHeadingTitle = "";
  for (let i = 0; i < lines.length; i++) {
    const h = detectHeading(lines[i]);
    if (h) {
      firstHeadingIdx = i;
      firstHeadingTitle = h;
      break;
    }
  }

  // If no heading was found anywhere in the resume, treat line 0 as header, and rest as Experience & Details
  const headerLinesCount = firstHeadingIdx !== -1 ? firstHeadingIdx : Math.min(3, lines.length);
  const headerLines = lines.slice(0, headerLinesCount);

  // Extract Candidate Name from header lines
  let candidateName = "";
  for (const line of headerLines) {
    if (
      !line.includes("@") &&
      !line.includes("http") &&
      !line.includes(".com") &&
      !line.match(/\d{4,}/) &&
      line.length >= 2 &&
      line.length < 50
    ) {
      candidateName = line.replace(/^[•\-\s|]+/, "").trim();
      break;
    }
  }

  if (!candidateName) {
    candidateName = fallbackFileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .trim();
  }

  // Remaining header lines form contact info
  const contactLines = headerLines.filter((l) => l !== candidateName);
  const contactInfo =
    contactLines.length > 0
      ? contactLines.join(" · ")
      : "Contact details extracted from uploaded resume.";

  sections.push({
    title: candidateName,
    isHeader: true,
    content: contactInfo,
  });

  // 2. Parse all subsequent sections without losing ANY lines
  const startIdx = firstHeadingIdx !== -1 ? firstHeadingIdx : headerLinesCount;
  let currentTitle = firstHeadingTitle || "Overview";
  let currentLines: string[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];

    // If we're at the exact first heading line itself, skip heading text and collect lines
    if (i === firstHeadingIdx) {
      continue;
    }

    const heading = detectHeading(line);
    if (heading) {
      // Save previous section if it has lines
      if (currentLines.length > 0) {
        sections.push({
          title: currentTitle,
          content: formatSectionContentWithBullets(currentLines),
          highlights: matchedKeywords,
        });
        currentLines = [];
      }
      currentTitle = heading;
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    sections.push({
      title: currentTitle,
      content: formatSectionContentWithBullets(currentLines),
      highlights: matchedKeywords,
    });
  }

  return sections;
}

export async function analyzeJdAndResume(
  file: Express.Multer.File,
  jobDescription: string,
  userId?: string,
): Promise<AIAnalysisOutput> {
  const resumeText = await extractResumeText(file);

  const prompt = `
You are an expert ATS & AI Resume Analyst.
Analyze the candidate's real resume against the target job description and extract detailed structured sections for live preview.

TARGET JOB DESCRIPTION:
"""
${jobDescription.slice(0, 15000)}
"""

CANDIDATE RESUME TEXT:
"""
${resumeText.slice(0, 20000)}
"""

Return a valid JSON object matching this EXACT schema:
{
  "match_score": <integer from 0 to 100 based on exact skills match and requirement depth>,
  "match_level": "<High Match if score >= 75, Moderate Match if score >= 50 and < 75, Low Match if score < 50>",
  "working_points": [
    "<3 to 4 strong bullet points highlighting specific resume strengths that match the JD requirements>"
  ],
  "keywords": {
    "matched": ["<specific skills, tools, frameworks found in BOTH resume and JD>"],
    "partial": ["<skills implied or related but not fully matching JD depth>"],
    "missing": ["<skills or tools required in the JD but absent in the resume>"]
  },
  "gaps": [
    {
      "area": "<skill area, e.g. Cloud Infrastructure, System Design, Backend Depth, Observability>",
      "severity": "<high | medium | low>",
      "detail": "<explanation of gap relative to the JD>"
    }
  ],
  "suggestions": [
    {
      "id": 1,
      "text": "<quantified, actionable resume bullet recommendation with exact metrics to add>",
      "impact": "<high | medium | low>",
      "category": "<Impact | Keywords | Gaps | Leadership>"
    }
  ],
  "parsedResume": {
    "candidateName": "<candidate's actual full name extracted from the resume>",
    "jobTitle": "<candidate's current or target job title, e.g. Senior Frontend Engineer>",
    "latestCompanyName": "<candidate's most recent company or employer name, or Freelance>",
    "totalExperienceYears": <estimated number of total professional experience years, e.g. 2.3>,
    "contactInfo": "<email · phone · location · linkedin/portfolio extracted from resume>",
    "summary": "<candidate summary/bio found in the resume, or 2-3 sentence overview>",
    "skills": "<comma-separated list of technical skills found in resume>",
    "experiences": [
      {
        "title": "Work Experience",
        "content": "<Role @ Company (Dates)\\n• Achievement 1\\n• Achievement 2>",
        "highlights": ["<key skill keywords found in this experience block>"]
      }
    ],
    "projects": [
      {
        "title": "Projects",
        "content": "<Project Name\\n• Description of project and outcomes>",
        "highlights": ["<technologies used>"]
      }
    ],
    "education": [
      {
        "title": "Education",
        "content": "<Degree · Institution · Graduation Year\\nDetails/GPA if mentioned>",
        "highlights": []
      }
    ]
  }
}

Important:
- Extract candidate's REAL name, real contact info, real summary, real skills, real experience with ALL bullet points, and real education from the resume text.
- Do NOT abbreviate or truncate the candidate's experience or projects.
- Return ONLY the JSON object without markdown fences.
`;

  let parsed: any = {};

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional ATS and AI resume reviewer. Always respond with strict, valid JSON without Markdown code fences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";

    try {
      const cleaned = rawContent
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const repaired = repairTruncatedJSON(rawContent);
      parsed = JSON.parse(repaired);
    }
  } catch (err) {
    console.error("Groq AI analysis error:", err);
    parsed = {};
  }

  const score =
    typeof parsed.match_score === "number"
      ? Math.max(0, Math.min(100, Math.round(parsed.match_score)))
      : 75;

  const matchLevelStr =
    parsed.match_level ||
    (score >= 75 ? "High Match" : score >= 50 ? "Moderate Match" : "Low Match");

  const workingPoints: string[] = Array.isArray(parsed.working_points) && parsed.working_points.length > 0
    ? parsed.working_points.filter((p: any) => typeof p === "string" && p.trim())
    : [
        "Technical competencies match core responsibilities described in JD.",
        "Demonstrated practical domain experience aligning with project needs.",
      ];

  const keywords = {
    matched: Array.isArray(parsed.keywords?.matched)
      ? parsed.keywords.matched.filter((k: any) => typeof k === "string")
      : [],
    partial: Array.isArray(parsed.keywords?.partial)
      ? parsed.keywords.partial.filter((k: any) => typeof k === "string")
      : [],
    missing: Array.isArray(parsed.keywords?.missing)
      ? parsed.keywords.missing.filter((k: any) => typeof k === "string")
      : [],
  };

  const rawGaps: any[] = Array.isArray(parsed.gaps) ? parsed.gaps : [];
  const gaps = rawGaps.map((g) => ({
    area: String(g.area || "Skill Gap"),
    severity: (["high", "medium", "low"].includes(String(g.severity).toLowerCase())
      ? String(g.severity).toLowerCase()
      : "medium") as "high" | "medium" | "low",
    detail: String(g.detail || ""),
  }));

  const rawSuggestions: any[] = Array.isArray(parsed.suggestions)
    ? parsed.suggestions
    : [];
  const suggestions = rawSuggestions.map((s, idx) => ({
    id: typeof s.id === "number" ? s.id : idx + 1,
    text: String(s.text || ""),
    impact: (["high", "medium", "low"].includes(String(s.impact).toLowerCase())
      ? String(s.impact).toLowerCase()
      : "medium") as "high" | "medium" | "low",
    category: String(s.category || "Impact"),
  }));

  // Build Real Resume Preview Sections - 100% Faithful to Uploaded Resume
  const pr = parsed.parsedResume || {};
  const deterministicSections = parseResumeSectionsFromRawText(
    resumeText,
    file.originalname,
    keywords.matched
  );

  const headerSection = deterministicSections.find((s) => s.isHeader);
  const candidateName =
    pr.candidateName && pr.candidateName.length > 2 && !pr.candidateName.includes(".pdf")
      ? pr.candidateName
      : headerSection?.title || file.originalname.replace(/\.[^/.]+$/, "");

  const contactInfo =
    pr.contactInfo && pr.contactInfo.length > 10 && !pr.contactInfo.includes("extracted from")
      ? pr.contactInfo
      : headerSection?.content || "Contact details extracted from uploaded resume.";

  // Use the FULL real sections from the uploaded resume with bullet points and matched highlights
  const resumeSections = deterministicSections.map((sec) => {
    if (sec.isHeader) {
      return {
        ...sec,
        title: candidateName,
        content: contactInfo,
      };
    }
    return {
      ...sec,
      highlights: Array.from(new Set([...(sec.highlights || []), ...keywords.matched])),
    };
  });


  const summaryContent =
    deterministicSections.find((s) => s.title.toLowerCase().includes("summary"))?.content ||
    pr.summary ||
    "Candidate resume summary";

  // Persist to MongoDB matching the updated schema
  let analysisDocId = "";
  let jobResumeId = "";

  try {
    const userObjectId =
      userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined;

    // 1. Create or update JOB_RESUME (stores candidate full resume data)
    const jobResumeDoc = await JobResume.create({
      user_id: userObjectId,
      job_description_raw: jobDescription,
      resume_title: `${candidateName} - ${pr.jobTitle || "Resume"}`,
      resume_summary: summaryContent || "Candidate resume summary",
      total_experience:
        typeof pr.totalExperienceYears === "number"
          ? pr.totalExperienceYears
          : parseFloat(String(pr.totalExperienceYears || "2.3")) || 2.3,
      job_title: pr.jobTitle || "Full Stack Developer",
      latest_company_name: pr.latestCompanyName || "Professional",
      candidate_name: candidateName,
      contact_info: contactInfo,
      resume_raw_text: resumeText,
      resume_sections: resumeSections,
      skills: Array.isArray(pr.skills)
        ? pr.skills
        : typeof pr.skills === "string"
        ? pr.skills.split(",").map((s: string) => s.trim())
        : [],
      projects: pr.projects || [],
      education: pr.education || [],
    });
    jobResumeId = jobResumeDoc._id.toString();

    // 2. Persist full resume preview data in AiAnalysis
    const aiAnalysis = await AiAnalysis.create({
      user_id: userObjectId,
      job_resume_id: jobResumeDoc._id,
      match_score: score,
      match_level: matchLevelStr,
      working_points: workingPoints,
      matched_keywords: keywords.matched,
      missing_keywords: keywords.missing,
      partial_keywords: keywords.partial,
      gaps,
      suggestions,
      parsed_resume: {
        candidateName,
        contactInfo,
        sections: resumeSections,
        rawText: resumeText,
      },
      job_description: jobDescription,
      resume_file_name: file.originalname,
    });

    analysisDocId = aiAnalysis._id.toString();
  } catch (err) {
    console.error("Failed to persist resume preview to MongoDB:", err);
  }

  return {
    id: analysisDocId,
    jobResumeId,
    score,
    matchLevel: matchLevelStr,
    workingPoints,
    keywords,
    gaps,
    suggestions,
    resumeSections,
    resumeFileName: file.originalname,
    jobDescription,
    createdAt: new Date().toISOString(),
  };
}

export async function getLatestAnalysis(userId?: string): Promise<AIAnalysisOutput | null> {
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return null;
  }
  const query = { user_id: new Types.ObjectId(userId) };
  const doc: any = await AiAnalysis.findOne(query)
    .sort({ created_at: -1 })
    .populate("match_level_id");

  if (!doc) return null;

  let sections = doc.parsed_resume?.sections || [];
  const matchedKeywords = Array.isArray(doc.matched_keywords) ? doc.matched_keywords : [];
  const rawText = doc.parsed_resume?.rawText || "";

  if (rawText && rawText.length > 50) {
    const fullSections = parseResumeSectionsFromRawText(
      rawText,
      doc.resume_file_name || "Resume.pdf",
      matchedKeywords
    );
    if (fullSections.length >= sections.length) {
      sections = fullSections;
    }
  } else if (doc.job_resume_id) {
    const jr: any = await JobResume.findById(doc.job_resume_id);
    if (jr?.resume_raw_text && jr.resume_raw_text.length > 50) {
      const fullSections = parseResumeSectionsFromRawText(
        jr.resume_raw_text,
        doc.resume_file_name || "Resume.pdf",
        matchedKeywords
      );
      if (fullSections.length >= sections.length) {
        sections = fullSections;
      }
    } else if (jr?.resume_sections && Array.isArray(jr.resume_sections) && jr.resume_sections.length > sections.length) {
      sections = jr.resume_sections;
    }
  }

  return {
    id: doc._id.toString(),
    jobResumeId: doc.job_resume_id?.toString(),
    score: typeof doc.match_score === "number" ? doc.match_score : 0,
    matchLevel:
      doc.match_level ||
      doc.match_level_id?.name ||
      (doc.match_score >= 80 ? "High Match" : doc.match_score >= 60 ? "Good Match" : "Moderate Match"),
    workingPoints: Array.isArray(doc.working_points) ? doc.working_points : [],
    keywords: {
      matched: Array.isArray(doc.matched_keywords) ? doc.matched_keywords : [],
      partial: Array.isArray(doc.partial_keywords) ? doc.partial_keywords : [],
      missing: Array.isArray(doc.missing_keywords) ? doc.missing_keywords : [],
    },
    gaps: Array.isArray(doc.gaps) ? doc.gaps : [],
    suggestions: Array.isArray(doc.suggestions) ? doc.suggestions : [],
    parsedResume: doc.parsed_resume || null,
    resumeSections: sections,
    resumeFileName: doc.resume_file_name || "Resume_Analyzed.pdf",
    jobDescription: doc.job_description || "",
    createdAt: doc.created_at?.toISOString() || new Date().toISOString(),
  };
}
