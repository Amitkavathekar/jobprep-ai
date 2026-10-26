import { Types } from "mongoose";
import { groq, GROQ_MODEL, GROQ_MAX_TOKENS } from "../../config/groq.config";
import { JobResume } from "../resume/resume.model";
import { QuestionCategory } from "./question-category.model";
import { Question } from "./question.model";
import { StudyPlan } from "./study-plan.model";
import { SubscriptionModel } from "../subscriptions/subscription.model";

export interface QuestionItem {
  id: string;
  q: string;
  answer: string;
  keyPoints: string[];
}

export interface QuestionBankCategory {
  category: string;
  count: number;
  icon: string;
  color: string;
  questions: QuestionItem[];
}

export interface StudyPlanItem {
  id?: string;
  day: string;
  focus: string;
  items: number;
  status: "done" | "in-progress" | "upcoming";
  questionBankId?: string;
  categoryTitle?: string;
  categoryIcon?: string;
  categoryColor?: string;
  keyQuestions?: string[];
}

export interface InterviewPrepData {
  jobTitle: string;
  questionBanks: QuestionBankCategory[];
  studyPlan: StudyPlanItem[];
  hasActiveSubscription: boolean;
  totalQuestions: number;
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

export async function getExistingInterviewPrep(
  userId: string
): Promise<InterviewPrepData | null> {
  const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;
  if (!userObjectId) return null;

  // 1. Find user's latest uploaded Job & Resume record
  const latestJobResume = await JobResume.findOne({ user_id: userObjectId }).sort({ createdAt: -1 });
  if (!latestJobResume || !latestJobResume.job_description_raw) {
    return null;
  }

  // 2. Check if user has an active subscription
  let hasActiveSubscription = false;
  try {
    const activeSub = await SubscriptionModel.findOne({
      userId: userObjectId,
      expiryDate: { $gte: new Date() },
    });
    hasActiveSubscription = Boolean(activeSub);
  } catch (err) {
    console.warn("Could not check subscription status:", err);
  }

  // 3. Check if QuestionCategories exist in MongoDB
  const existingCategories = await QuestionCategory.find({
    job_resume_id: latestJobResume._id,
  });

  if (existingCategories.length === 0) {
    return null;
  }

  const categoryIds = existingCategories.map((c) => c._id);
  const allQuestions = await Question.find({ category_id: { $in: categoryIds } });
  const existingStudyPlan = await StudyPlan.find({ job_resume_id: latestJobResume._id }).sort({
    day: 1,
  });

  const questionBanks: QuestionBankCategory[] = existingCategories.map((cat) => {
    const catQuestions = allQuestions
      .filter((q) => q.category_id.toString() === cat._id.toString())
      .map((q) => ({
        id: q._id.toString(),
        q: q.question,
        answer: q.answer,
        keyPoints: Array.isArray(q.tags) ? q.tags : [],
      }));

    return {
      category: cat.category_title,
      count: cat.count || catQuestions.length * 3 + 2,
      icon: cat.icon || "◈",
      color: cat.color || "#7c3aed",
      questions: catQuestions,
    };
  });

  let studyPlan: StudyPlanItem[] = [];

  // Check if existing study plan needs upgrade with category links & question mappings
  const needsUpgrade =
    existingStudyPlan.length !== questionBanks.length ||
    existingStudyPlan.some(
      (sp) =>
        !sp.category_title ||
        sp.focus === "React Fiber & Core Internals" ||
        sp.focus === "Frontend Security & PCI-DSS"
    );

  if (needsUpgrade) {
    const generatedPlan = buildStudyPlanFromCategories(
      latestJobResume.job_title || "Target Role",
      questionBanks,
      existingCategories
    );

    await StudyPlan.deleteMany({ job_resume_id: latestJobResume._id });
    for (const sp of generatedPlan) {
      const createdSp = await StudyPlan.create({
        user_id: userObjectId,
        job_resume_id: latestJobResume._id,
        question_bank_id: sp.questionBankId ? new Types.ObjectId(sp.questionBankId) : undefined,
        day: sp.day,
        topic: sp.focus,
        focus: sp.focus,
        total_questions: sp.items,
        items: sp.items,
        status: sp.status,
        category_title: sp.categoryTitle,
        category_icon: sp.categoryIcon,
        category_color: sp.categoryColor,
        key_questions: sp.keyQuestions || [],
      });
      sp.id = createdSp._id.toString();
    }
    studyPlan = generatedPlan;
  } else {
    studyPlan = existingStudyPlan.map((sp) => ({
      id: sp._id.toString(),
      day: sp.day,
      focus: sp.focus || sp.topic,
      items: sp.items || sp.total_questions || 10,
      status: (sp.status as any) || "upcoming",
      questionBankId: sp.question_bank_id ? sp.question_bank_id.toString() : undefined,
      categoryTitle: sp.category_title || undefined,
      categoryIcon: sp.category_icon || undefined,
      categoryColor: sp.category_color || undefined,
      keyQuestions: Array.isArray(sp.key_questions) ? sp.key_questions : [],
    }));
  }

  const totalQuestions = questionBanks.reduce((acc, b) => acc + (b.count || b.questions.length), 0);

  return {
    jobTitle: latestJobResume.job_title || "Target Role",
    questionBanks,
    studyPlan,
    hasActiveSubscription,
    totalQuestions,
  };
}

export async function generateInterviewPrep(
  userId: string
): Promise<InterviewPrepData | null> {
  const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;
  if (!userObjectId) return null;

  // 1. Find user's latest uploaded Job & Resume record
  const latestJobResume = await JobResume.findOne({ user_id: userObjectId }).sort({ createdAt: -1 });
  if (!latestJobResume || !latestJobResume.job_description_raw) {
    return null;
  }

  // 2. Check if user has an active subscription
  let hasActiveSubscription = false;
  try {
    const activeSub = await SubscriptionModel.findOne({
      userId: userObjectId,
      expiryDate: { $gte: new Date() },
    });
    hasActiveSubscription = Boolean(activeSub);
  } catch (err) {
    console.warn("Could not check subscription status:", err);
  }

  // 3. Generate with Groq based on candidate's real Job Description
  const jdText = latestJobResume.job_description_raw.slice(0, 15000);
  const targetJobTitle = latestJobResume.job_title || "Professional";

  const prompt = `
You are an expert technical hiring manager and interview coach.
Analyze the target JOB DESCRIPTION below and create a comprehensive Interview Preparation Kit tailored specifically to this exact role and its required tech stack/domain.

TARGET ROLE: "${targetJobTitle}"

JOB DESCRIPTION:
"""
${jdText}
"""

Instructions:
1. Determine the target role domain (e.g. Full Stack Developer, Frontend Engineer, Backend Developer, Data Analyst, UI/UX Designer, DevOps Engineer, Mobile Developer, QA Engineer, etc.).
2. You MUST generate EXACTLY 4 tailored Question Categories:
   - Category 1: "Behavioral (STAR Method)" (icon: "◷", color: "#7c3aed", count: 14)
   - Category 2: Deep Technical Architecture or Core Domain based on the JD (icon: "◈", color: "#06b6d4", count: 16)
   - Category 3: Technology Deep Dive (the specific frameworks, languages, or tools mentioned in the JD) (icon: "◎", color: "#10b981", count: 20)
   - Category 4: Role & Project Practical Application (real-world scenarios, testing, scaling, or case studies from the JD) (icon: "◉", color: "#f59e0b", count: 12)
3. Under each of the 4 categories, write 4 in-depth interview questions.
   - For each question provide:
     - "q": A realistic, high-signal interview question asked by top tech companies.
     - "answer": A concise yet comprehensive senior model answer (2 to 4 impactful sentences).
     - "keyPoints": Array of 3 concise takeaway bullets.
4. Generate a 7-Day Study Plan ("Day 1" to "Day 7") where each day directly maps to and prepares for the questions generated in the 4 categories:
   - Day 1: Behavioral & STAR Method Questions (Category 1)
   - Day 2: System Architecture & Core Domain Questions (Category 2 Part 1)
   - Day 3: Infrastructure, Caching & Scaling Questions (Category 2 Part 2)
   - Day 4: Core Framework Internals & Language Depth (Category 3 Part 1)
   - Day 5: State, APIs, Databases & Testing (Category 3 Part 2)
   - Day 6: Real-World Scenarios & Edge Cases (Category 4)
   - Day 7: Full Mock Simulation synthesizing questions across all 4 categories

Return strict, valid JSON matching this schema:
{
  "roleIdentified": "<e.g. Senior Full Stack Engineer>",
  "categories": [
    {
      "category": "<Category Name>",
      "count": <integer, e.g. 14>,
      "icon": "<icon character, e.g. ◷ or ◈ or ◎ or ◉>",
      "color": "<hex color e.g. #7c3aed or #06b6d4 or #10b981 or #f59e0b>",
      "questions": [
        {
          "id": "q1",
          "q": "<Question text>",
          "answer": "<Model answer text>",
          "keyPoints": ["<bullet 1>", "<bullet 2>", "<bullet 3>"]
        }
      ]
    }
  ],
  "studyPlan": [
    {
      "day": "Day 1",
      "focus": "<Focus topic>",
      "items": 14,
      "status": "done"
    }
  ]
}

No markdown code fences, pure valid JSON.
`;

  let parsed: any = null;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert interview evaluator. Always return pure JSON matching the requested structure without markdown fences. You must include all 4 categories and all 7 days of the study plan.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = JSON.parse(repairTruncatedJSON(raw));
    }
  } catch (aiErr) {
    console.error("Groq AI question generation failed:", aiErr);
    return null;
  }

  if (!parsed || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
    return null;
  }

  // 4. Clean up any existing records for this job resume before creating new ones
  const oldCategories = await QuestionCategory.find({ job_resume_id: latestJobResume._id });
  const oldCatIds = oldCategories.map((c) => c._id);
  await Question.deleteMany({ category_id: { $in: oldCatIds } });
  await QuestionCategory.deleteMany({ job_resume_id: latestJobResume._id });
  await StudyPlan.deleteMany({ job_resume_id: latestJobResume._id });

  // 6. Persist to MongoDB
  const formattedQuestionBanks: QuestionBankCategory[] = [];
  const createdCatDocs: any[] = [];

  for (let catIdx = 0; catIdx < parsed.categories.length; catIdx++) {
    const cat = parsed.categories[catIdx];
    const categoryTitle = String(cat.category || `Category ${catIdx + 1}`);
    const icon = String(cat.icon || ["◷", "◈", "◎", "◉"][catIdx % 4]);
    const color = String(cat.color || ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"][catIdx % 4]);
    const count = typeof cat.count === "number" ? cat.count : 14;

    const catDoc = await QuestionCategory.create({
      user_id: userObjectId,
      job_resume_id: latestJobResume._id,
      category_title: categoryTitle,
      category_description: `Tailored interview questions for ${targetJobTitle}`,
      icon,
      color,
      count,
    });
    createdCatDocs.push(catDoc);

    const questionsList: QuestionItem[] = [];
    const rawQuestions = Array.isArray(cat.questions) ? cat.questions : [];

    for (let qIdx = 0; qIdx < rawQuestions.length; qIdx++) {
      const q = rawQuestions[qIdx];
      const qText = String(q.q || "Interview Question");
      const answerText = String(q.answer || "Model Answer");
      const keyPoints = Array.isArray(q.keyPoints)
        ? q.keyPoints.filter((kp: any) => typeof kp === "string")
        : [];

      const qDoc = await Question.create({
        user_id: userObjectId,
        category_id: catDoc._id,
        question: qText,
        answer: answerText,
        tags: keyPoints,
      });

      questionsList.push({
        id: qDoc._id.toString(),
        q: qText,
        answer: answerText,
        keyPoints,
      });
    }

    formattedQuestionBanks.push({
      category: categoryTitle,
      count,
      icon,
      color,
      questions: questionsList,
    });
  }

  // 7. Persist 7-Day Study Plan to MongoDB directly according to left-side question categories & questions
  const generatedStudyPlan = buildStudyPlanFromCategories(
    targetJobTitle,
    formattedQuestionBanks,
    createdCatDocs
  );

  const formattedStudyPlan: StudyPlanItem[] = [];

  for (const sp of generatedStudyPlan) {
    const createdSp = await StudyPlan.create({
      user_id: userObjectId,
      job_resume_id: latestJobResume._id,
      question_bank_id: sp.questionBankId ? new Types.ObjectId(sp.questionBankId) : undefined,
      day: sp.day,
      topic: sp.focus,
      focus: sp.focus,
      total_questions: sp.items,
      items: sp.items,
      status: sp.status,
      category_title: sp.categoryTitle,
      category_icon: sp.categoryIcon,
      category_color: sp.categoryColor,
      key_questions: sp.keyQuestions || [],
    });

    formattedStudyPlan.push({
      ...sp,
      id: createdSp._id.toString(),
    });
  }

  const totalQuestions = formattedQuestionBanks.reduce(
    (acc, b) => acc + (b.count || b.questions.length),
    0
  );

  return {
    jobTitle: targetJobTitle,
    questionBanks: formattedQuestionBanks,
    studyPlan: formattedStudyPlan,
    hasActiveSubscription,
    totalQuestions,
  };
}

export async function getOrGenerateInterviewPrep(
  userId: string,
  regenerate = false
): Promise<InterviewPrepData | null> {
  if (!regenerate) {
    const existing = await getExistingInterviewPrep(userId);
    if (existing) return existing;
  }
  return generateInterviewPrep(userId);
}

export function buildStudyPlanFromCategories(
  role: string,
  categories: QuestionBankCategory[],
  categoryDocs?: { _id: any; category_title?: string }[]
): StudyPlanItem[] {
  if (!categories || categories.length === 0) {
    return [];
  }

  return categories.map((cat, idx) => {
    const catDocId =
      categoryDocs && categoryDocs[idx]
        ? categoryDocs[idx]._id.toString()
        : undefined;

    const count =
      typeof cat.count === "number" && cat.count > 0
        ? cat.count
        : cat.questions?.length || 10;

    const keyQuestions = (cat.questions || [])
      .slice(0, 3)
      .map((q) => {
        const text = q.q.trim();
        return text.length > 85 ? text.slice(0, 82) + "..." : text;
      });

    return {
      day: `Day ${idx + 1}`,
      focus: cat.category,
      items: count,
      status: (idx === 0 ? "done" : idx === 1 ? "in-progress" : "upcoming") as "done" | "in-progress" | "upcoming",
      questionBankId: catDocId,
      categoryTitle: cat.category,
      categoryIcon: cat.icon || ["◷", "◈", "◎", "◉"][idx % 4],
      categoryColor: cat.color || ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"][idx % 4],
      keyQuestions,
    };
  });
}
