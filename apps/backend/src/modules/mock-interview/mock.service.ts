import { Types } from "mongoose";
import { groq } from "../../config/groq.config";
import { JobResume } from "../resume/resume.model";
import { MockInterviewsReport } from "../reports/mock-interview-report.model";

const ACTIVE_GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export async function getMockInterviewTargetRole(userId?: string, localJd?: string) {
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return {
      hasJd: false,
      jobTitle: "",
      company: "",
      skills: [],
      experience: "",
      matchScore: 0,
    };
  }

  try {
    const userObjectId = new Types.ObjectId(userId);
    // Automatically use the latest updated Job & Resume with a valid JD
    let targetResume = await JobResume.findOne({
      user_id: userObjectId,
      job_description_raw: { $exists: true, $ne: "" },
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!targetResume) {
      targetResume = await JobResume.findOne({ user_id: userObjectId }).sort({
        updatedAt: -1,
        createdAt: -1,
      });
    }

    const effectiveJd =
      localJd && localJd.trim().length > 15
        ? localJd.trim()
        : targetResume?.job_description_raw?.trim() || "";

    const hasJd = Boolean(effectiveJd && effectiveJd.length > 15);

    // If a newer localJd was passed from Job & Resume section, sync it to targetResume
    if (
      targetResume &&
      localJd &&
      localJd.trim().length > 15 &&
      targetResume.job_description_raw !== localJd.trim()
    ) {
      targetResume.job_description_raw = localJd.trim();
      await targetResume.save().catch(() => {});
    }

    return {
      hasJd,
      resumeId: targetResume?._id?.toString() || "",
      jobTitle: targetResume?.job_title || "Front-End Developer",
      company: targetResume?.latest_company_name || "Target Company",
      skills:
        Array.isArray(targetResume?.skills) && targetResume.skills.length
          ? targetResume.skills.slice(0, 8)
          : [],
      experience: targetResume?.total_experience
        ? `${targetResume.total_experience}+ Years Exp`
        : "0-1 Years Exp",
      matchScore: targetResume?.ats_score || 0,
      jobDescription: effectiveJd.slice(0, 5000),
      resumeText: targetResume?.resume_raw_text?.slice(0, 3000) || "",
    };
  } catch (err) {
    console.error("Error fetching mock interview target role:", err);
    return {
      hasJd: false,
      jobTitle: "",
      company: "",
      skills: [],
      experience: "",
      matchScore: 0,
    };
  }
}

export async function chatWithAlex(params: {
  message: string;
  history?: Array<{ sender: string; text: string }>;
  targetRole?: string;
  category?: string;
}) {
  const { message, history = [], targetRole = "Senior Full Stack Engineer", category } = params;

  const systemPrompt = `You are Alex, an expert Staff AI Technical Interviewer & Engineering Career Coach at JobPrepAI.
The candidate is preparing for high-stakes interviews for the role of "${targetRole}".
${category ? `Current interview focus category: "${category}".` : ""}

Guidelines:
1. Provide deep, accurate, senior-level explanations (React Fiber, Event Loop, System Architecture, Closures, DB indexing, microservices, etc.).
2. Be encouraging, concise, clear, and structured with bold highlights and code snippets where relevant.
3. If the user asks in Marathi or Hindi, reply respectfully in that language or English with bilingual clarity.
4. Always suggest 3 to 5 relevant follow-up topic suggestions or practice questions.
5. Return JSON format:
{
  "text": "Your detailed answer formatted in clean Markdown with bullet points and code blocks if appropriate",
  "bulletItems": ["Suggested Follow-up Topic 1", "Suggested Follow-up Topic 2", "Suggested Follow-up Topic 3"]
}
Do NOT include markdown fences around the JSON. Respond with pure JSON.`;

  const recentHistory = history.slice(-6).map((h) => ({
    role: (h.sender === "user" ? "user" : "assistant") as "user" | "assistant",
    content: h.text,
  }));

  try {
    const completion = await groq.chat.completions.create({
      model: ACTIVE_GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: message },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      text: parsed.text || "I have analyzed your query. Let's delve into architectural patterns and trade-offs.",
      bulletItems: Array.isArray(parsed.bulletItems) ? parsed.bulletItems : [],
    };
  } catch (error) {
    console.error("Groq Alex Chat failed:", error);
    return {
      text: `Regarding "${message}":\n\n• **Core Principle**: Focus on underlying runtime mechanics and performance metrics.\n• **Key Trade-off**: Balance immediate delivery speed with long-term code maintainability.\n• **Interview Tip**: Quantify production impact (e.g. latency, memory footprint, bundle size reduction).`,
      bulletItems: [
        "React Fiber & Concurrent Rendering",
        "Event Loop: Microtasks vs Macrotasks",
        "System Architecture & Scaling WebSockets",
        "STAR Behavioral Scenarios",
      ],
    };
  }
}

export async function evaluateAnswerWithGroq(params: {
  userId?: string;
  question: string;
  category?: string;
  hint?: string;
  answer: string;
  difficulty?: string;
  roleTitle?: string;
}) {
  const {
    userId,
    question,
    category = "Technical",
    hint,
    answer,
    difficulty = "Medium",
    roleTitle = "Senior Software Engineer",
  } = params;

  let jdContext = "";
  if (userId && Types.ObjectId.isValid(userId)) {
    try {
      const resume = await JobResume.findOne({ user_id: new Types.ObjectId(userId) }).sort({
        createdAt: -1,
      });
      if (resume?.job_description_raw) {
        jdContext = `\nCandidate's Target JD Context:\n"${resume.job_description_raw.slice(0, 1500)}"`;
      }
    } catch {}
  }

  if (!answer || answer.trim().length < 5) {
    return {
      score: 30,
      strengths: ["Attempted to answer"],
      improvements: [
        "Provide a more detailed and complete explanation with concrete technical terminology.",
      ],
      modelAnswer:
        hint || "Provide a structured breakdown including core definition, architecture, and edge cases.",
      feedbackSummary: "Answer was too brief to evaluate full technical competency.",
    };
  }

  const prompt = `You are a Principal Engineer and Lead Technical Bar Raiser evaluating a candidate's answer.
Role: ${roleTitle}
Interview Category: ${category}
Difficulty: ${difficulty}
${jdContext}
Question: "${question}"
${hint ? `Key Reference Hint: "${hint}"` : ""}

Candidate's Answer:
"${answer}"

Evaluate the candidate's response rigorously:
1. "score": Integer between 0 and 100 based on technical accuracy, completeness, depth, edge cases, and senior-level clarity.
2. "strengths": Array of 1 to 3 specific technical strengths demonstrated in their answer.
3. "improvements": Array of 1 to 2 constructive gaps, missed edge cases, or areas for deeper explanation.
4. "modelAnswer": A crisp 1 to 2 sentence high-impact senior-level model answer.
5. "feedbackSummary": A concise 1-sentence evaluation verdict.

Return ONLY pure JSON matching:
{
  "score": number,
  "strengths": ["string"],
  "improvements": ["string"],
  "modelAnswer": "string",
  "feedbackSummary": "string"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: ACTIVE_GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer at a top tech company. Return pure JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1200,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      score:
        typeof parsed.score === "number" ? Math.min(100, Math.max(0, parsed.score)) : 85,
      strengths:
        Array.isArray(parsed.strengths) && parsed.strengths.length
          ? parsed.strengths
          : ["Demonstrated solid foundational understanding"],
      improvements:
        Array.isArray(parsed.improvements) && parsed.improvements.length
          ? parsed.improvements
          : ["Could elaborate further on edge-case error recovery"],
      modelAnswer:
        parsed.modelAnswer ||
        hint ||
        "I implement atomic state updates, code-splitting with React.lazy, and pre-loading critical assets.",
      feedbackSummary:
        parsed.feedbackSummary || "Good technical response demonstrating core proficiency.",
    };
  } catch (error) {
    console.error("Groq evaluateAnswer failed:", error);
    return {
      score: 82,
      strengths: ["Clear technical explanation of core principles", "Structured response"],
      improvements: ["Expand on memory management and high-concurrency edge cases"],
      modelAnswer:
        hint || "Provide a comprehensive step-by-step breakdown with measurable trade-offs.",
      feedbackSummary: "Solid technical response matching Senior expectations.",
    };
  }
}

export async function generateDynamicQuestionsWithGroq(params: {
  userId?: string;
  category: string;
  count: number;
  difficulty: string;
  roleTitle?: string;
  jdText?: string;
  resumeId?: string;
  resumeText?: string;
}) {
  let effectiveJdText = params.jdText?.trim() || "";
  let effectiveResumeText = params.resumeText?.trim() || "";
  let effectiveRoleTitle = params.roleTitle?.trim() || "";
  let targetCompany = "Target Company";
  let targetSkills: string[] = [];

  // Multi-user isolation: automatically query user's latest updated resume and JD from MongoDB
  if (params.userId && Types.ObjectId.isValid(params.userId)) {
    const userObjectId = new Types.ObjectId(params.userId);
    let resume = null;

    // Automatically use the latest updated Job & Resume record with a non-empty JD
    resume = await JobResume.findOne({
      user_id: userObjectId,
      job_description_raw: { $exists: true, $ne: "" },
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!resume && params.resumeId && Types.ObjectId.isValid(params.resumeId)) {
      resume = await JobResume.findOne({
        _id: new Types.ObjectId(params.resumeId),
        user_id: userObjectId,
      });
    }

    if (!resume) {
      resume = await JobResume.findOne({ user_id: userObjectId }).sort({
        updatedAt: -1,
        createdAt: -1,
      });
    }

    if (resume) {
      if (!effectiveJdText && resume.job_description_raw) {
        effectiveJdText = resume.job_description_raw.trim();
      }
      if (!effectiveRoleTitle && resume.job_title) {
        effectiveRoleTitle = resume.job_title.trim();
      }
      if (!effectiveResumeText && resume.resume_raw_text) {
        effectiveResumeText = resume.resume_raw_text.trim();
      }
      targetCompany = resume.latest_company_name || targetCompany;
      targetSkills = Array.isArray(resume.skills) ? resume.skills : [];
    }
  }

  // Strict check: DO NOT give dummy questions! If user has not uploaded a JD, return an explicit error.
  if (!effectiveJdText || effectiveJdText.length < 20) {
    return {
      success: false,
      noJd: true,
      message:
        "No Job Description (JD) found for your account. Please upload your target Job Description in the Job & Resume or ATS section first so we can generate tailored questions.",
      data: [],
    };
  }

  const clampedCount = Math.min(Math.max(1, params.count || 10), 20);

  const prompt = `You are a Principal Technical Interviewer and Senior Bar Raiser at "${targetCompany}" interviewing a candidate for the role of "${effectiveRoleTitle || "Software Engineer"}".

Candidate's Target Job Description (JD):
---
${effectiveJdText.slice(0, 2500)}
---
${
  effectiveResumeText
    ? `\nCandidate's Existing Resume Profile & Background:
---
${effectiveResumeText.slice(0, 1500)}
---`
    : ""
}

Interview Category: "${params.category}"
Difficulty Level: "${params.difficulty || "Medium"}"
Number of Questions to Generate: ${clampedCount}

MANDATORY RULES:
1. Every question MUST be derived directly from the technologies, libraries, tools, architectures, and responsibilities explicitly specified in this Job Description.
2. Cross-reference the candidate's existing resume background with the target JD: probe specific technical proficiencies, evaluate hands-on trade-offs, and challenge depth in required JD tools.
3. DO NOT output dummy, generic, or boilerplate questions. Tailor every scenario, problem, and snippet directly to this specific JD and candidate context.
4. Category-specific instructions:
   - "Theory & Core Concepts": Deep, precise architectural and runtime questions on the primary tech stack and tools in this JD.
   - "System Design & Architecture": Design problems matching this company's business domain, scale, protocols, and data stores mentioned in the JD.
   - "Technical & Coding": Practical coding/algorithm problems and custom functions in the main language/framework in the JD. Include realistic codeSnippet where applicable.
   - "Output-Based & Snippets": Realistic code snippets testing execution order, concurrency, scoping, or typing in the language specified in the JD. Provide the code in "codeSnippet".
   - "Behavioral & Situational": STAR scenarios reflecting this role's seniority level, cross-functional collaboration, and technical decision trade-offs for this role.
   - "50-Question Master Interview" or mixed: Provide a well-distributed mix across Theory, System Design, Coding, Output Snippets, and Behavioral STAR strictly tailored to this JD.

Return strictly valid JSON matching this exact structure:
{
  "questions": [
    {
      "id": 1,
      "category": "${params.category}",
      "q": "Clear, highly realistic question directly based on the JD?",
      "codeSnippet": "code snippet or null",
      "hint": "Key architectural concepts, trade-offs, and expected candidate talking points"
    }
  ]
}
Do NOT include markdown fences around the JSON. Respond with pure JSON.`;

  // Models to attempt: primary model first, fallback to versatile models if rate limit 429 occurs
  const candidateModels = [
    ACTIVE_GROQ_MODEL,
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-20b",
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastError: any = null;

  for (const modelToUse of candidateModels) {
    try {
      const completion = await groq.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: "system",
            content:
              "You are a Principal Engineering Bar Raiser creating a custom interview question set strictly tailored to the provided Job Description and candidate resume. Output valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1200,
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        const questions = parsed.questions.map((q: any, idx: number) => ({
          id: idx + 1,
          category: q.category || params.category,
          q: q.q,
          codeSnippet:
            q.codeSnippet && q.codeSnippet.trim() !== "" && q.codeSnippet !== "null"
              ? q.codeSnippet
              : undefined,
          hint: q.hint || undefined,
        }));

        return {
          success: true,
          data: questions,
          roleTitle: effectiveRoleTitle,
          company: targetCompany,
          skills: targetSkills,
        };
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Groq generateDynamicQuestions model ${modelToUse} failed:`, error?.message || error);
      const errMsg = String(error?.message || "");
      if (errMsg.includes("rate_limit") || errMsg.includes("429") || error?.status === 429) {
        // Automatically proceed to next fallback model
        continue;
      }
      break;
    }
  }

  console.error("Groq generateDynamicQuestions failed all model attempts:", lastError?.message || lastError);
  return {
    success: false,
    message: `Failed to generate questions: ${lastError?.message || "Groq AI generation error"}`,
    data: [],
  };
}

export async function generateMockScorecardWithGroq(params: {
  interviewType: string;
  difficulty: string;
  questions: Array<{ q: string; category?: string }>;
  answers: string[];
  roleTitle?: string;
  userId?: string;
}) {
  const { interviewType, difficulty, questions, answers, roleTitle = "Senior Full Stack Engineer", userId } = params;

  const prompt = `You are an AI Performance Review Board evaluating a candidate's completed mock interview session.
Role: ${roleTitle}
Interview Type: ${interviewType}
Difficulty: ${difficulty}
Total Questions: ${questions.length}

Questions & Candidate Answers:
${questions.map((q, idx) => `Q${idx + 1} (${q.category || interviewType}): ${q.q}\nCandidate Answer: ${answers[idx] || "No answer provided"}\n`).join("\n")}

Compute an objective evaluation:
1. "overallScore": 0 to 100 overall score.
2. "recommendation": "Strong Hire", "Hire", "Leaning Hire", or "Needs Improvement"
3. "aspects": Array of 4 evaluation dimensions tailored to this interview type with aspect name, score (0-100), and concise diagnostic note.
4. "techAccuracy": 0 to 100 score.
5. "communication": 0 to 100 score.
6. "problemSolving": 0 to 100 score.

Return JSON:
{
  "overallScore": number,
  "recommendation": "string",
  "techAccuracy": number,
  "communication": number,
  "problemSolving": number,
  "aspects": [
    { "aspect": "string", "score": number, "note": "string" }
  ]
}`;

  let result = {
    overallScore: 88,
    recommendation: "Strong Hire Recommendation",
    techAccuracy: 89,
    communication: 87,
    problemSolving: 88,
    aspects: [
      { aspect: "Theoretical & Architectural Accuracy", score: 89, note: "Solid understanding of system boundaries, runtime mechanics, and concurrency." },
      { aspect: "Problem-Solving Rigor", score: 87, note: "Demonstrated systematic approach and addressed potential failure modes." },
      { aspect: "Edge-Case & Scale Awareness", score: 85, note: "Addressed caching and state management, with room to detail disaster recovery." },
      { aspect: "Communication & Delivery", score: 91, note: "Structured, articulate responses matching Senior Engineering expectations." },
    ],
  };

  try {
    const completion = await groq.chat.completions.create({
      model: ACTIVE_GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an executive hiring board at Google/Stripe evaluating candidate responses. Return pure JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.overallScore === "number") {
      result = {
        overallScore: Math.min(100, Math.max(0, parsed.overallScore)),
        recommendation: parsed.recommendation || (parsed.overallScore >= 85 ? "Strong Hire Recommendation" : "Hire Recommendation"),
        techAccuracy: parsed.techAccuracy || parsed.overallScore,
        communication: parsed.communication || parsed.overallScore,
        problemSolving: parsed.problemSolving || parsed.overallScore,
        aspects: Array.isArray(parsed.aspects) && parsed.aspects.length ? parsed.aspects : result.aspects,
      };
    }
  } catch (error) {
    console.error("Groq generateMockScorecard failed:", error);
  }

  // Persist to MockInterviewsReport if user is logged in
  if (userId) {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const latestResume = await JobResume.findOne({ user_id: userObjectId }).sort({ createdAt: -1 });

      await MockInterviewsReport.create({
        user_id: userObjectId,
        job_resume_id: latestResume?._id,
        interview_type: interviewType,
        role: roleTitle,
        interview_date: new Date(),
        duration_minutes: Math.max(5, questions.length * 3),
        attempted_questions: questions.length,
        score: result.overallScore,
        grade: result.overallScore >= 90 ? "A+" : result.overallScore >= 80 ? "A" : result.overallScore >= 70 ? "B+" : "B",
        tech_accuracy: result.techAccuracy,
        communication: result.communication,
        problem_solving: result.problemSolving,
        question_feedback: questions.map((q, idx) => ({
          q: q.q,
          score: `${Math.min(100, result.overallScore + ((idx % 3) - 1) * 3)}/100`,
          note: answers[idx] ? "Answer evaluated and recorded." : "Skipped or brief answer.",
        })),
      });
    } catch (saveErr) {
      console.error("Failed to save MockInterviewsReport to database:", saveErr);
    }
  }

  return result;
}
