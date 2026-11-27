import {
  AtsRulesDictionaryModel,
  InterviewTypeCatalogModel,
} from "./ats-interview-config.model";

export const DEFAULT_ACTION_VERBS = [
  "built", "developed", "designed", "implemented", "optimized", "engineered",
  "deployed", "created", "led", "managed", "enhanced", "resolved", "architected",
  "integrated", "automated", "tested", "delivered", "collaborated", "spearheaded",
  "scaled", "maintained", "refactored", "analyzed", "orchestrated", "executed",
];

export const DEFAULT_SOFT_SKILLS = [
  "leadership", "communication", "teamwork", "problem solving", "collaboration",
  "adaptability", "critical thinking", "ownership", "agile", "scrum", "mentoring",
  "time management", "decision making", "presentation", "analytical", "creativity",
];

export const DEFAULT_INDUSTRY_TERMS = [
  "api", "rest", "restful", "ci/cd", "git", "github", "database", "sql", "nosql",
  "cloud", "docker", "microservices", "testing", "unit testing", "responsive",
  "performance", "security", "scalability", "full stack", "frontend", "backend",
  "mvc", "component", "state management", "production", "cross-platform",
];

export const DEFAULT_INTERVIEW_TYPES = [
  {
    typeId: "all-50",
    title: "50-Question Master Interview",
    badge: "50 Qs Interactive",
    icon: "⚡",
    color: "#ec4899",
    desc: "Complete 50-question end-to-end interactive mock interview across theory, architecture, coding, output snippets & STAR.",
    questionsCount: "50 Master Questions",
  },
  {
    typeId: "theory",
    title: "Theory & Core Concepts",
    badge: "Fundamentals",
    icon: "📖",
    color: "#7c3aed",
    desc: "Language specs, React internals, event loop, closures, and browser mechanics.",
    questionsCount: "10 Core Questions",
  },
  {
    typeId: "system-design",
    title: "System Design & Architecture",
    badge: "High-Level",
    icon: "◈",
    color: "#06b6d4",
    desc: "Scalability, micro-frontends, state synchronization, caching & real-time architecture.",
    questionsCount: "8 Architecture Questions",
  },
  {
    typeId: "technical",
    title: "Technical & Coding",
    badge: "Code & DSA",
    icon: "⚙",
    color: "#10b981",
    desc: "Data structures, algorithms, DOM manipulation, custom hooks, and state logic.",
    questionsCount: "12 Coding Questions",
  },
  {
    typeId: "output-based",
    title: "Output-Based & Tricky",
    badge: "JS Quirks",
    icon: "▶",
    color: "#f59e0b",
    desc: "Predict output, hoisting, prototype chain, async/await order, and edge cases.",
    questionsCount: "10 Code Snippets",
  },
  {
    typeId: "behavioral",
    title: "STAR Behavioral & Leadership",
    badge: "Culture Fit",
    icon: "💬",
    color: "#8b5cf6",
    desc: "Conflict resolution, production incidents, prioritization, and teamwork under pressure.",
    questionsCount: "10 Scenario Questions",
  },
];

export async function getAtsConfigService() {
  let dict = await AtsRulesDictionaryModel.findOne({ dictionaryId: "ats-rules-global" });

  if (!dict) {
    dict = await AtsRulesDictionaryModel.create({
      dictionaryId: "ats-rules-global",
      actionVerbs: DEFAULT_ACTION_VERBS,
      softSkills: DEFAULT_SOFT_SKILLS,
      industryTerms: DEFAULT_INDUSTRY_TERMS,
    });
  }

  return {
    actionVerbs: dict.actionVerbs,
    softSkills: dict.softSkills,
    industryTerms: dict.industryTerms,
  };
}

export async function getInterviewTypesService() {
  let types = await InterviewTypeCatalogModel.find().sort({ createdAt: 1 });

  if (types.length === 0) {
    types = (await InterviewTypeCatalogModel.insertMany(DEFAULT_INTERVIEW_TYPES as any)) as any;
  }

  return types.map((t) => ({
    id: t.typeId || (t as any).id || (t._id ? t._id.toString() : ""),
    title: t.title,
    badge: t.badge,
    icon: t.icon,
    color: t.color,
    desc: t.desc,
    questionsCount: t.questionsCount,
  }));
}
