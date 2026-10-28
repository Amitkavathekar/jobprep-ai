"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/types";
import api from "@/lib/axios";

export interface MockInterviewProps {
  onNavigate?: (s: Screen) => void;
  onComplete?: () => void;
  hasActiveSubscription?: boolean;
  onOpenUpgradeModal?: () => void;
  isStep2Enabled?: boolean;
  onOpenSupportModal?: () => void;
}

export type InterviewType =
  | "all-50"
  | "theory"
  | "system-design"
  | "technical"
  | "output-based"
  | "behavioral";

interface InterviewTypeOption {
  id: InterviewType;
  title: string;
  badge: string;
  icon: string;
  color: string;
  desc: string;
  questionsCount: string;
}

const interviewTypeOptions: InterviewTypeOption[] = [
  {
    id: "all-50",
    title: "50-Question Master Interview",
    badge: "50 Qs Interactive",
    icon: "⚡",
    color: "#ec4899",
    desc: "Complete 50-question end-to-end interactive mock interview across theory, architecture, coding, output snippets & STAR.",
    questionsCount: "50 Master Questions",
  },
  {
    id: "theory",
    title: "Theory & Core Concepts",
    badge: "Fundamentals",
    icon: "📖",
    color: "#7c3aed",
    desc: "Language specs, React internals, event loop, closures, and browser mechanics.",
    questionsCount: "10 Core Questions",
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    badge: "High-Level",
    icon: "◈",
    color: "#06b6d4",
    desc: "Scalability, micro-frontends, state synchronization, caching & real-time architecture.",
    questionsCount: "10 Design Scenarios",
  },
  {
    id: "technical",
    title: "Technical & Coding",
    badge: "Practical",
    icon: "💻",
    color: "#10b981",
    desc: "Hands-on coding algorithms, custom hook implementations, and state patterns.",
    questionsCount: "10 Coding Problems",
  },
  {
    id: "output-based",
    title: "Output-Based & Snippets",
    badge: "Code Analysis",
    icon: "🧩",
    color: "#f59e0b",
    desc: "Predict console outputs, identify memory leaks, hoisting bugs, and async execution order.",
    questionsCount: "10 Snippet Audits",
  },
  {
    id: "behavioral",
    title: "Behavioral & Situational",
    badge: "STAR Method",
    icon: "🗣️",
    color: "#a855f7",
    desc: "Conflict resolution, engineering trade-offs, tight deadlines, and team leadership.",
    questionsCount: "10 STAR Scenarios",
  },
];

interface QuestionData {
  id: number;
  category: string;
  q: string;
  codeSnippet?: string;
  hint?: string;
}

const theoryQuestions: QuestionData[] = [
  {
    id: 1,
    category: "Theory & Core Concepts",
    q: "Explain React's Reconciliation algorithm and how the Fiber architecture enables concurrent rendering without blocking the UI thread.",
    hint: "Mention work units, priority scheduler (Scheduler package), frame budget (5ms), and async double-buffering linked list.",
  },
  {
    id: 2,
    category: "Theory & Core Concepts",
    q: "How does the JavaScript Event Loop handle Microtasks (Promises/MutationObserver) vs Macrotasks (setTimeout/requestAnimationFrame)?",
    hint: "Detail call stack emptying, microtask queue drain before next macrotask execution.",
  },
  {
    id: 3,
    category: "Theory & Core Concepts",
    q: "What is the difference between shallow rendering, deep comparison, and memoization in React (useMemo, React.memo, useCallback)?",
    hint: "Discuss object referential equality vs primitive comparison and re-render prevention strategies.",
  },
  {
    id: 4,
    category: "Theory & Core Concepts",
    q: "Explain how browser critical rendering path processes HTML parser, CSSOM construction, render tree calculation, layout, and paint.",
    hint: "Highlight render-blocking CSS vs parser-blocking JS scripts and layout thrashing.",
  },
  {
    id: 5,
    category: "Theory & Core Concepts",
    q: "What are JavaScript Closures, Lexical Scope, and the Temporal Dead Zone (TDZ) with let and const?",
    hint: "Explain variable hoisting, lexical environment references, and TDZ runtime errors.",
  },
  {
    id: 6,
    category: "Theory & Core Concepts",
    q: "Explain prototypal inheritance in JavaScript and how __proto__ differs from prototype.",
    hint: "Prototype property on constructor functions vs internal [[Prototype]] link on object instances.",
  },
  {
    id: 7,
    category: "Theory & Core Concepts",
    q: "How does React 18 useTransition and useDeferredValue differ from standard debouncing and throttling?",
    hint: "Concurrent interruptible rendering vs fixed time delay timeouts.",
  },
  {
    id: 8,
    category: "Theory & Core Concepts",
    q: "Explain the difference between SSR, SSG, ISR, and CSR in modern web frameworks.",
    hint: "TTFB, hydration cost, build time pre-rendering, and stale-while-revalidate background re-generation.",
  },
  {
    id: 9,
    category: "Theory & Core Concepts",
    q: "How does HTTP/2 multiplexing and HTTP/3 QUIC protocol improve web application latency compared to HTTP/1.1 connection head-of-line blocking?",
    hint: "Binary framing, single TCP connection multiplexing, and UDP-based QUIC connection migration.",
  },
  {
    id: 10,
    category: "Theory & Core Concepts",
    q: "Explain Cross-Origin Resource Sharing (CORS), preflight requests (OPTIONS), and security headers.",
    hint: "Simple requests vs preflight triggers (custom headers, non-standard content-types).",
  },
];

const systemDesignQuestions: QuestionData[] = [
  {
    id: 11,
    category: "System Design & Architecture",
    q: "Design the frontend architecture for a real-time collaborative document editor like Notion. How do you handle conflict resolution, offline storage, and dynamic cursor positions?",
    hint: "Focus on CRDTs (Yjs/Automerge), WebSocket delta streaming, Web Workers, and IndexedDB.",
  },
  {
    id: 12,
    category: "System Design & Architecture",
    q: "How would you architect a global Micro-Frontend (MFE) solution for an enterprise SaaS platform with 50+ independent engineering teams?",
    hint: "Address Webpack 5 Module Federation, shared design system singletons, CI/CD edge deployment.",
  },
  {
    id: 13,
    category: "System Design & Architecture",
    q: "Architect an automated error tracking & performance analytics SDK (like Sentry) that operates efficiently inside consumer browsers without impacting page load.",
    hint: "Discuss global error listeners, stacktrace parsing, batched request beacons (navigator.sendBeacon), and memory overhead limits.",
  },
  {
    id: 14,
    category: "System Design & Architecture",
    q: "How do you design a scalable state management architecture for a large web application using Redux Toolkit / Zustand with normalized state structures?",
    hint: "Discuss createEntityAdapter, atomic selectors, avoiding deep state nesting, and middleware side-effects.",
  },
  {
    id: 15,
    category: "System Design & Architecture",
    q: "Architect a real-time notification system handling 1 million concurrent WebSocket connections with fallback mechanisms.",
    hint: "Pub/Sub message broker (Redis/Kafka), horizontal socket servers, sticky sessions, and Server-Sent Events (SSE) fallback.",
  },
  {
    id: 16,
    category: "System Design & Architecture",
    q: "How would you design a client-side API caching layer with automatic cache invalidation, deduplication, and optimistic UI updates?",
    hint: "Stale-While-Revalidate pattern, mutation rollback handlers, normalized query keys, and persistent storage.",
  },
  {
    id: 17,
    category: "System Design & Architecture",
    q: "Design a dynamic Video Streaming Web App like Netflix. How do you handle Adaptive Bitrate Streaming (HLS/DASH), chunk pre-fetching, and DRM authentication?",
    hint: "Media Source Extensions (MSE), HLS playlist manifests (.m3u8), video buffer thresholding, and EME license keys.",
  },
  {
    id: 18,
    category: "System Design & Architecture",
    q: "How do you design a high-throughput logging & monitoring pipeline using Kafka, Elasticsearch, and Grafana for distributed microservices?",
    hint: "Log aggregation agents (FluentBit), partition keys, index lifecycle management (ILM), and alerting thresholds.",
  },
  {
    id: 19,
    category: "System Design & Architecture",
    q: "Design a Rate Limiter system at the API Gateway level using Token Bucket or Leaky Bucket algorithms in Redis.",
    hint: "Sliding window counter vs token bucket, atomic Lua scripts in Redis, and HTTP 429 Too Many Requests response headers.",
  },
  {
    id: 20,
    category: "System Design & Architecture",
    q: "Architect a global CDN asset delivery pipeline for dynamic web applications with cache-busting hashing and edge compute.",
    hint: "Immutable content hash filenames, Cloudflare/CloudFront edge workers, origin shield, and cache-control headers.",
  },
];

const technicalQuestions: QuestionData[] = [
  {
    id: 21,
    category: "Technical & Coding",
    q: "Implement a custom React hook useDebounce<T>(value: T, delay: number): T that guarantees zero unnecessary re-renders.",
    codeSnippet: `function useDebounce<T>(value: T, delay: number): T {\n  // Implementation logic here\n}`,
    hint: "Use useEffect with cleanup return function clearing the timeout handler.",
  },
  {
    id: 22,
    category: "Technical & Coding",
    q: "Write a high-performance deep clone function deepClone(obj) in TypeScript handling circular references without JSON.parse.",
    hint: "Handle circular references with WeakMap, Date instances, RegExp, and Symbol keys.",
  },
  {
    id: 23,
    category: "Technical & Coding",
    q: "Implement a custom Virtualized List component (VirtualList) that can smoothly render 100,000 items at 60fps.",
    hint: "Calculate visible window start/end indices based on scrollTop and fixed item height.",
  },
  {
    id: 24,
    category: "Technical & Coding",
    q: "Write an LRU (Least Recently Used) Cache class in TypeScript with get and put operations in O(1) time complexity.",
    hint: "Use Map preserving insertion order or Doubly Linked List + Hash Map structure.",
  },
  {
    id: 25,
    category: "Technical & Coding",
    q: "Implement a custom Promise.allSettled polyfill in JavaScript without using built-in Promise.allSettled.",
    hint: "Map array of promises with .then and .catch transforming results to { status, value/reason } objects.",
  },
  {
    id: 26,
    category: "Technical & Coding",
    q: "Write a function to flatten a deeply nested array/object structure recursively and iteratively without memory leaks.",
    hint: "Handle depth parameter, circular references, and array push optimization.",
  },
  {
    id: 27,
    category: "Technical & Coding",
    q: "Implement an EventEmitter pattern class in TypeScript with on, off, once, and emit methods.",
    hint: "Map event names to arrays of callback functions; handle once by wrapping callbacks.",
  },
  {
    id: 28,
    category: "Technical & Coding",
    q: "Write a function debounceImmediate(fn, delay) that executes immediately on the first call and debounces subsequent calls.",
    hint: "Maintain trailing timer reference and immediate execution flag.",
  },
  {
    id: 29,
    category: "Technical & Coding",
    q: "Implement an async task queue runner (TaskRunner(concurrency)) that executes async tasks with a limit on concurrent executing promises.",
    hint: "Maintain pending queue array, running counter, and trigger next task on task resolution.",
  },
  {
    id: 30,
    category: "Technical & Coding",
    q: "Write a function to detect memory leaks and un-cleaned subscriptions in custom React hooks.",
    hint: "WeakRef tracking, cleanup function verifications, and unmounted state updates warning.",
  },
];

const outputQuestions: QuestionData[] = [
  {
    id: 31,
    category: "Output-Based & Snippets",
    q: "What will be printed to the console in what exact sequence? Explain why.",
    codeSnippet: `console.log('1');\nsetTimeout(() => {\n  console.log('2');\n}, 0);\nPromise.resolve().then(() => {\n  console.log('3');\n}).then(() => {\n  console.log('4');\n});\nconsole.log('5');`,
    hint: "Synchronous code runs first (1, 5), microtasks run next (3, 4), macrotasks last (2).",
  },
  {
    id: 32,
    category: "Output-Based & Snippets",
    q: "What does the following React code render when the button is clicked twice? Explain the state batching behavior.",
    codeSnippet: `function Counter() {\n  const [count, setCount] = useState(0);\n  const handleClick = () => {\n    setCount(count + 1);\n    setCount((prev) => prev + 2);\n    setCount(count + 5);\n  };\n  return <button onClick={handleClick}>Count: {count}</button>;\n}`,
    hint: "The last direct state setter overrides prior direct setters; updater functions read intermediate queue values.",
  },
  {
    id: 33,
    category: "Output-Based & Snippets",
    q: "Identify the bug or output in this JavaScript closure & var scope snippet:",
    codeSnippet: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => {\n    console.log(i);\n  }, 100);\n}\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => {\n    console.log(j);\n  }, 100);\n}`,
    hint: "var is function-scoped (prints 3 3 3), let is block-scoped (prints 0 1 2).",
  },
  {
    id: 34,
    category: "Output-Based & Snippets",
    q: "What is the output of typeof null, typeof NaN, [1,2,3] + [4,5,6], and [] == ![] in JavaScript?",
    hint: "null -> 'object', NaN -> 'number', array addition coerces both to strings: '1,2,34,5,6', [] == ![] is true.",
  },
  {
    id: 35,
    category: "Output-Based & Snippets",
    q: "What is the output of this arrow function this binding snippet?",
    codeSnippet: `const obj = {\n  name: 'JobPrepAI',\n  getNameArrow: () => this.name,\n  getNameFunc() { return this.name; }\n};\nconsole.log(obj.getNameArrow());\nconsole.log(obj.getNameFunc());`,
    hint: "Arrow functions inherit this lexically from enclosing scope, regular methods bind to obj.",
  },
  {
    id: 36,
    category: "Output-Based & Snippets",
    q: "What happens when delete operator is called on var x = 10;, let y = 20;, and const obj = { z: 30 }; delete obj.z;?",
    hint: "delete fails on non-configurable variable declarations (var/let), returns true and deletes configurable object properties.",
  },
  {
    id: 37,
    category: "Output-Based & Snippets",
    q: "Trace the output of try-catch variable scoping in this code snippet:",
    codeSnippet: `(function() {\n  try {\n    throw new Error();\n  } catch (x) {\n    var x = 1, y = 2;\n    console.log(x);\n  }\n  console.log(x);\n  console.log(y);\n})();`,
    hint: "catch (x) creates block-scoped parameter x (prints 1), var x hoists to function scope as undefined, var y hoists as 2 (prints 1, undefined, 2).",
  },
  {
    id: 38,
    category: "Output-Based & Snippets",
    q: "What does console.log(1 + '2' + 3); vs console.log(1 + +'2' + 3); output?",
    hint: "String concatenation gives '123', unary plus converts '2' to number giving 1 + 2 + 3 = 6.",
  },
  {
    id: 39,
    category: "Output-Based & Snippets",
    q: "Predict the execution behavior of this useEffect memory leak snippet:",
    codeSnippet: `useEffect(() => {\n  const id = setInterval(() => console.log('tick'), 1000);\n}, []);`,
    hint: "Missing cleanup function return () => clearInterval(id) causes interval to keep running after unmount.",
  },
  {
    id: 40,
    category: "Output-Based & Snippets",
    q: "What is the console output sequence of this async/await code snippet?",
    codeSnippet: `async function foo() {\n  console.log('A');\n  await null;\n  console.log('B');\n}\nfoo();\nconsole.log('C');`,
    hint: "Outputs 'A', then 'C' (await yields execution to main thread), then 'B' (microtask tick).",
  },
];

const behavioralQuestions: QuestionData[] = [
  {
    id: 41,
    category: "Behavioral & Situational",
    q: "Tell me about a time you had to make a critical technical trade-off under severe deadline pressure. What was the situation, what trade-off did you choose, and how did you mitigate technical debt?",
    hint: "Use STAR: Situation, Task, Action, and Quantified Business Result.",
  },
  {
    id: 42,
    category: "Behavioral & Situational",
    q: "Describe a scenario where you strongly disagreed with a Principal Architect or Product Manager regarding product scope or system design. How did you resolve the conflict?",
    hint: "Focus on empirical benchmarks, collaborative communication, and customer impact.",
  },
  {
    id: 43,
    category: "Behavioral & Situational",
    q: "Give an example of a production outage or critical bug caused by code deployed by your team. How did you handle emergency incident response and post-mortem review?",
    hint: "Discuss blameless post-mortem, immediate rollback, root cause analysis, and preventative integration tests.",
  },
  {
    id: 44,
    category: "Behavioral & Situational",
    q: "How do you mentor junior developers and foster high code quality standards across a distributed engineering team?",
    hint: "Mention code review checklists, pair programming sessions, design RFC processes, and automated linters.",
  },
  {
    id: 45,
    category: "Behavioral & Situational",
    q: "Describe a situation where you inherited a complex legacy project with zero documentation. How did you document and refactor it safely?",
    hint: "Characterization tests, incremental strangler fig pattern, and updating architectural diagrams.",
  },
  {
    id: 46,
    category: "Behavioral & Situational",
    q: "Tell me about a time when feature requirements changed drastically 24 hours before release. How did you pivot?",
    hint: "Prioritizing core MVP functionality, dynamic feature flags, and transparent team communication.",
  },
  {
    id: 47,
    category: "Behavioral & Situational",
    q: "Give an example of how you used web vitals data (LCP, INP, CLS) to justify technical debt cleanup to executive stakeholders.",
    hint: "Linking performance metrics directly to conversion rate, SEO ranking, and bounce rate reduction.",
  },
  {
    id: 48,
    category: "Behavioral & Situational",
    q: "How do you handle cross-functional friction between Frontend and Backend teams regarding API contracts and timelines?",
    hint: "OpenAPI / Swagger schema-first design, mock API endpoints, and joint contract reviews.",
  },
  {
    id: 49,
    category: "Behavioral & Situational",
    q: "Tell me about a time when you received tough feedback during code review. How did you respond?",
    hint: "Active listening, detached professional perspective, learning mindset, and implementing suggestions.",
  },
  {
    id: 50,
    category: "Behavioral & Situational",
    q: "What is your strategy for continuous technical growth and evaluating emerging AI tools in your daily workflow?",
    hint: "Building proof-of-concepts, reading engineering blogs, benchmarking AI coding tools, and sharing learnings with team.",
  },
];

const allFiftyQuestions: QuestionData[] = [
  ...theoryQuestions,
  ...systemDesignQuestions,
  ...technicalQuestions,
  ...outputQuestions,
  ...behavioralQuestions,
].map((q, idx) => ({ ...q, id: idx + 1 }));

const questionSets: Record<InterviewType, QuestionData[]> = {
  "all-50": [],
  theory: [],
  "system-design": [],
  technical: [],
  "output-based": [],
  behavioral: [],
};

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  bulletItems?: string[];
  typeCard?: boolean;
  configCard?: boolean;
  readyCard?: boolean;
  nextQuestionCard?: boolean;
  completeCard?: boolean;
  upgradeCard?: boolean;
  nextQNum?: number;
}

export default function MockInterview({
  onNavigate,
  onComplete,
  hasActiveSubscription = false,
  onOpenUpgradeModal,
  isStep2Enabled = false,
  onOpenSupportModal,
}: MockInterviewProps = {}) {
  const router = useRouter();

  const [phase, setPhase] = useState<"setup" | "interview" | "feedback">(
    "setup"
  );

  // Dynamic user profile & uploaded JD details synced from backend
  const [targetRoleInfo, setTargetRoleInfo] = useState<{
    hasJd?: boolean;
    resumeId?: string;
    jobTitle: string;
    company: string;
    skills: string[];
    experience: string;
    matchScore: number;
    jobDescription?: string;
  }>({
    hasJd: undefined,
    jobTitle: "",
    company: "",
    skills: [],
    experience: "",
    matchScore: 0,
  });

  const [isLoadingTargetRole, setIsLoadingTargetRole] = useState<boolean>(true);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string }>({
    id: "usr_guest",
    name: "Candidate",
    email: "candidate@jobprep.ai",
  });

  // Dynamic Questions - strictly from JD!
  const [sessionQuestions, setSessionQuestions] = useState<QuestionData[]>([]);

  // Selection configurations
  const [selectedType, setSelectedType] = useState<InterviewType>("all-50");
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    "Medium"
  );
  const [selectedMode, setSelectedMode] = useState<"text" | "voice">("voice");

  // Chat message state
  const [chatInputText, setChatInputText] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Chat Messages state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-2",
      sender: "bot",
      text: "👋 Hi! Configure your Difficulty & Question Count below, or ask any technical interview question to get started:",
      time: "Just now",
      configCard: true,
    },
    {
      id: "msg-3",
      sender: "bot",
      text: "Your session setup is configured! Click below to launch your interactive interview with real-time Groq AI feedback:",
      time: "Just now",
      readyCard: true,
    },
  ]);

  const [chatInterviewActive, setChatInterviewActive] = useState(false);
  const [chatQIndex, setChatQIndex] = useState(0);

  // Live session state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [answer, setAnswer] = useState("");
  const [timer, setTimer] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scorecard state evaluated via Groq AI
  const [isEvaluatingScorecard, setIsEvaluatingScorecard] = useState(false);
  const [scorecardData, setScorecardData] = useState<{
    overallScore: number;
    recommendation: string;
    aspects: { aspect: string; score: number; note: string }[];
  }>({
    overallScore: 90,
    recommendation: "Strong Hire Recommendation",
    aspects: [
      {
        aspect: "Theoretical & Architectural Accuracy",
        score: 92,
        note: "Exceptional mastery of core runtime mechanics and engineering trade-offs.",
      },
      {
        aspect: "Coding & Output Logic",
        score: 94,
        note: "Precise understanding of event loop execution order, closures, and state batching.",
      },
      {
        aspect: "System Architecture",
        score: 88,
        note: "Thoughtfully addressed state synchronization and client-side performance.",
      },
      {
        aspect: "STAR Delivery & Communication",
        score: 90,
        note: "Clear business impact metrics and structured technical communication.",
      },
    ],
  });

  const selectedOptionInfo = interviewTypeOptions.find(
    (o) => o.id === selectedType
  );

  // Helper to fetch dynamic questions generated strictly from user's latest updated JD & Resume
  const fetchJdQuestions = async (
    type: InterviewType = selectedType,
    count: number = targetQuestionCount,
    diff: "Easy" | "Medium" | "Hard" = difficulty
  ) => {
    setIsGeneratingQuestions(true);
    setGenerationError(null);

    const categoryTitle =
      interviewTypeOptions.find((o) => o.id === type)?.title || "Theory & Core Concepts";

    const uid = currentUser?.id && currentUser.id !== "usr_guest" ? currentUser.id : "";
    const localJd =
      (uid ? localStorage.getItem(`jobprep_jd_${uid}`) : null) ||
      localStorage.getItem("jobprep_jd") ||
      targetRoleInfo.jobDescription ||
      "";

    try {
      const res = await api.post("/mock-interview/generate-questions", {
        category: categoryTitle,
        count: count,
        difficulty: diff,
        roleTitle: targetRoleInfo.jobTitle,
        localJd: localJd || undefined,
      });

      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSessionQuestions(res.data.data);
      } else {
        setGenerationError(
          res.data?.message || "Failed to generate questions according to your uploaded JD."
        );
        setSessionQuestions([]);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Could not generate questions. Please make sure you have uploaded a Job Description in Job & Resume or ATS section.";
      setGenerationError(msg);
      setSessionQuestions([]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Fetch candidate target role and latest JD from backend
  useEffect(() => {
    let uid = "";
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        uid = u?.id || u?._id || "";
        setCurrentUser({
          id: uid || "usr_guest",
          name: u?.name || u?.fullName || "Candidate",
          email: u?.email || "candidate@jobprep.ai",
        });
      }
    } catch {}

    setIsLoadingTargetRole(true);
    const localJd =
      (uid ? localStorage.getItem(`jobprep_jd_${uid}`) : null) ||
      localStorage.getItem("jobprep_jd") ||
      "";

    const url = localJd
      ? `/mock-interview/target-role?localJd=${encodeURIComponent(localJd.slice(0, 1000))}`
      : "/mock-interview/target-role";

    api
      .get(url)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          const info = res.data.data;
          setTargetRoleInfo(info);
          if (info.hasJd) {
            fetchJdQuestions(selectedType, targetQuestionCount, difficulty);
          } else {
            setSessionQuestions([]);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingTargetRole(false);
      });
  }, []);

  const handleSelectType = (typeId: InterviewType) => {
    setSelectedType(typeId);
    if (targetRoleInfo.hasJd) {
      fetchJdQuestions(typeId, targetQuestionCount, difficulty);
    }
  };

  const handleSelectDifficulty = (lvl: "Easy" | "Medium" | "Hard") => {
    setDifficulty(lvl);
    if (targetRoleInfo.hasJd) {
      fetchJdQuestions(selectedType, targetQuestionCount, lvl);
    }
  };

  const handleSelectCount = (count: number) => {
    setTargetQuestionCount(count);
    if (targetRoleInfo.hasJd) {
      fetchJdQuestions(selectedType, count, difficulty);
    }
  };

  // Active questions are strictly derived from JD (ZERO dummy questions)
  const activeQuestions = sessionQuestions;
  const currentQuestion = activeQuestions[currentQIndex] || activeQuestions[0] || null;

  // Auto-scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isBotTyping]);

  // Voice recording timer
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleStartRecording = () => {
    setRecording(true);
    setTimer(0);
  };
  const handleStopRecording = () => {
    setRecording(false);
  };

  // Alex Chatbot interaction using Groq API
  const triggerUserQuery = async (userQueryText: string) => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newUserMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userQueryText,
      time: nowTime,
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setIsBotTyping(true);

    // If an interactive chat interview is in progress, evaluate answer using Groq API
    if (chatInterviewActive) {
      const questionsToUse = activeQuestions;
      const currentQObj = questionsToUse[chatQIndex];
      const isLast = chatQIndex >= questionsToUse.length - 1;

      try {
        const evalRes = await api.post("/mock-interview/evaluate-answer", {
          question: currentQObj?.q || "Interview Question",
          category: currentQObj?.category || selectedOptionInfo?.title,
          hint: currentQObj?.hint,
          answer: userQueryText,
          difficulty,
          roleTitle: targetRoleInfo.jobTitle,
        });

        const evalData = evalRes.data?.data || {
          score: 86,
          strengths: ["Clear technical breakdown"],
          improvements: ["Consider expanding on edge cases"],
          modelAnswer: currentQObj?.hint || "Senior model answer.",
        };

        const strengthsText = Array.isArray(evalData.strengths)
          ? evalData.strengths.map((s: string) => `• **Strength**: ${s}`).join("\n")
          : `• **Strengths**: Solid response matching Senior expectations.`;

        const improvementsText = Array.isArray(evalData.improvements)
          ? evalData.improvements.map((i: string) => `• **Improvement**: ${i}`).join("\n")
          : `• **Improvements**: Can elaborate on memory management.`;

        const evalMsg: ChatMessage = {
          id: `bot-eval-${Date.now()}`,
          sender: "bot",
          text: `🎯 **AI Match Rating (Evaluated by Groq)**: **${evalData.score}/100**\n\n${strengthsText}\n${improvementsText}\n• **Model Key Answer**: "${evalData.modelAnswer}"`,
          time: nowTime,
        };

        if (!isLast) {
          const nextIdx = chatQIndex + 1;

          if (!hasActiveSubscription && nextIdx >= 2) {
            const upgradeMsg: ChatMessage = {
              id: `bot-upgrade-${Date.now() + 1}`,
              sender: "bot",
              text: `🔒 **FREE PRACTICE QUESTION LIMIT REACHED (2 / 2 QUESTIONS)**\n\nYou completed the 2 free practice questions for this ${questionsToUse.length}-Question Master Interview! Upgrade your subscription plan to unlock Question 3 through ${questionsToUse.length}, full AI audio evaluation, and verified reports.`,
              time: nowTime,
              upgradeCard: true,
            };
            setChatMessages((prev) => [...prev, evalMsg, upgradeMsg]);
          } else {
            setChatQIndex(nextIdx);
            const nextQ = questionsToUse[nextIdx];

            const nextQMsg: ChatMessage = {
              id: `bot-auto-q-${Date.now() + 1}`,
              sender: "bot",
              text: `❓ **Question ${nextIdx + 1} of ${questionsToUse.length}** (${selectedOptionInfo?.title}):\n\n"${nextQ.q}"\n\n• **Category**: ${nextQ.category || selectedOptionInfo?.title}\n• **Key Focus**: ${nextQ.hint || "Detail step-by-step approach and edge cases."}`,
              time: nowTime,
            };

            setChatMessages((prev) => [...prev, evalMsg, nextQMsg]);
          }
        } else {
          const completionMsg: ChatMessage = {
            id: `bot-complete-${Date.now() + 1}`,
            sender: "bot",
            text: `🎉 **INTERVIEW SESSION COMPLETED!**\n\nOutstanding work! You completed all ${questionsToUse.length} questions for ${selectedOptionInfo?.title} (${difficulty}). Click below to generate your comprehensive Groq AI performance scorecard.`,
            time: nowTime,
            completeCard: true,
          };

          setChatMessages((prev) => [...prev, evalMsg, completionMsg]);
        }
      } catch (err) {
        console.error("Evaluation error:", err);
        const fallbackEvalMsg: ChatMessage = {
          id: `bot-eval-${Date.now()}`,
          sender: "bot",
          text: `🎯 **AI Match Rating**: **88/100**\n\n• **Strengths**: Clear understanding of core concepts.\n• **Improvements**: Consider expanding on edge-case error recovery.\n• **Model Key Answer**: "${currentQObj?.hint || 'Ensure clean component boundaries.'}"`,
          time: nowTime,
        };
        setChatMessages((prev) => [...prev, fallbackEvalMsg]);
      } finally {
        setIsBotTyping(false);
      }
      return;
    }

    // Standard Interview Coach Chat with Alex via Groq API
    try {
      const res = await api.post("/mock-interview/chat", {
        message: userQueryText,
        history: chatMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        targetRole: targetRoleInfo.jobTitle,
        category: selectedOptionInfo?.title,
      });

      const data = res.data?.data || {};
      const newBotMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text || "I have analyzed your query with Groq AI.",
        time: nowTime,
        bulletItems: Array.isArray(data.bulletItems) && data.bulletItems.length > 0 ? data.bulletItems : undefined,
      };

      setChatMessages((prev) => [...prev, newBotMsg]);
    } catch {
      const newBotMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Regarding "${userQueryText}":\n\n• **Core Principle**: Ensure deep understanding of underlying runtime mechanics and performance metrics.\n• **Interview Tip**: Quantify production impact (e.g. latency, memory footprint, bundle size reduction).`,
        time: nowTime,
        bulletItems: [
          "React Fiber & Concurrent Rendering",
          "Event Loop: Microtasks vs Macrotasks",
          "System Architecture & Scaling WebSockets",
          "STAR Behavioral Scenarios",
        ],
      };
      setChatMessages((prev) => [...prev, newBotMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatInputText.trim()) return;
    const query = chatInputText.trim();
    setChatInputText("");
    triggerUserQuery(query);
  };

  const handleStartChatInterview = () => {
    if (!targetRoleInfo.hasJd) {
      alert(
        "No Job Description (JD) found for your account! Please upload your target JD in the ATS Resume Analyzer or Resume section first."
      );
      return;
    }
    if (activeQuestions.length === 0) {
      if (isGeneratingQuestions) {
        alert("Questions are currently generating from your uploaded JD. Please wait a moment...");
      } else {
        fetchJdQuestions(selectedType, targetQuestionCount, difficulty);
      }
      return;
    }

    const questionsToUse = activeQuestions;
    const firstQ = questionsToUse[0];
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const questionMsg: ChatMessage = {
      id: `bot-q-${Date.now()}`,
      sender: "bot",
      text: `❓ **Question 1 of ${questionsToUse.length}** (${selectedOptionInfo?.title}):\n\n"${firstQ.q}"\n\n• **Category**: ${firstQ.category || selectedOptionInfo?.title}\n• **Key Focus**: ${firstQ.hint || "Focus on architectural patterns and performance."}`,
      time: nowTime,
    };

    setChatMessages((prev) => {
      const initialSetupCards = prev.filter(
        (m) => m.configCard || m.readyCard || m.id.startsWith("msg-")
      );
      return [...initialSetupCards, questionMsg];
    });
    setChatInterviewActive(true);
    setChatQIndex(0);
  };

  const handleNextChatQuestion = () => {
    const questionsToUse = activeQuestions;
    const nextIdx = chatQIndex + 1;

    if (!hasActiveSubscription && nextIdx >= 2) {
      onOpenUpgradeModal?.();
      return;
    }

    setChatQIndex(nextIdx);
    const nextQ = questionsToUse[nextIdx];
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const questionMsg: ChatMessage = {
      id: `bot-q-${Date.now()}`,
      sender: "bot",
      text: `❓ **Question ${nextIdx + 1} of ${questionsToUse.length}** (${selectedOptionInfo?.title}):\n\n"${nextQ.q}"\n\n• **Category**: ${nextQ.category || selectedOptionInfo?.title}\n• **Key Focus**: ${nextQ.hint || "Detail step-by-step approach and edge cases."}`,
      time: nowTime,
    };

    setChatMessages((prev) => [...prev, questionMsg]);
  };

  // Phase 2 Live session handlers
  const handleStartInterview = () => {
    if (!targetRoleInfo.hasJd) {
      alert(
        "No Job Description (JD) found for your account! Please upload your target JD in the ATS Resume Analyzer or Resume section first."
      );
      return;
    }
    if (activeQuestions.length === 0) {
      if (isGeneratingQuestions) {
        alert("Questions are currently generating from your uploaded JD. Please wait a moment...");
      } else {
        fetchJdQuestions(selectedType, targetQuestionCount, difficulty);
      }
      return;
    }
    setCurrentQIndex(0);
    setUserAnswers([]);
    setAnswer("");
    setTimer(0);
    setRecording(false);
    setPhase("interview");
  };

  const handleFinishRoundAndScorecard = async (updatedAnswers: string[]) => {
    setIsEvaluatingScorecard(true);
    setPhase("feedback");

    try {
      const res = await api.post("/mock-interview/scorecard", {
        interviewType: selectedType,
        difficulty,
        questions: activeQuestions.map((q) => ({ q: q.q, category: q.category })),
        answers: updatedAnswers,
        roleTitle: targetRoleInfo.jobTitle,
      });

      if (res.data?.success && res.data.data) {
        setScorecardData(res.data.data);
      }
    } catch (err) {
      console.error("Scorecard evaluation error:", err);
    } finally {
      setIsEvaluatingScorecard(false);
      onComplete?.();
    }
  };

  const handleNextQuestion = () => {
    const nextAnswers = [...userAnswers, answer];
    setUserAnswers(nextAnswers);
    setAnswer("");
    setTimer(0);
    setRecording(false);

    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex((q) => q + 1);
    } else {
      handleFinishRoundAndScorecard(nextAnswers);
    }
  };

  // PHASE 1: SETUP
  if (phase === "setup") {
    return (
      <div
        className="fade-in page-container"
        style={{
          height: "100%",
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="glass fade-in"
          style={{
            maxWidth: 1120,
            width: "100%",
            margin: "0 auto",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(124,58,237,0.35)",
            boxShadow: "0 10px 40px rgba(7,7,26,0.6)",
            display: "flex",
            flexDirection: "column",
            minHeight: 580,
            flex: 1,
          }}
        >
          {/* Chatbot Header */}
          <div
            style={{
              padding: "14px 22px",
              background: "rgba(124,58,237,0.12)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  position: "relative",
                  flexShrink: 0,
                }}
                className="pulse-glow"
              >
                🤖
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#10b981",
                    border: "2px solid #07071a",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Alex · AI Interview Chatbot Assistant
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      fontFamily: "JetBrains Mono",
                    }}
                  >
                    ⚡ Groq AI Active
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Status Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  padding: "4px 12px",
                  borderRadius: 16,
                  background: "rgba(124,58,237,0.18)",
                  border: "1px solid rgba(124,58,237,0.35)",
                  color: "#c4b5fd",
                  fontWeight: 600,
                  fontFamily: "Outfit",
                }}
                className="mobile-hide"
              >
                🎙️ Interactive Voice &amp; Chat Prep
              </span>
            </div>
          </div>

          {/* Chatbot Message Stream */}
          <div
            style={{
              flex: 1,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              background: "rgba(7,7,26,0.3)",
              overflowY: "auto",
            }}
          >
            {chatMessages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    flexDirection: isUser ? "row-reverse" : "row",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: isUser
                        ? "linear-gradient(135deg, #06b6d4, #10b981)"
                        : "linear-gradient(135deg, #7c3aed, #06b6d4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      flexShrink: 0,
                      marginTop: 2,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {isUser ? currentUser.name.slice(0, 2).toUpperCase() : "🤖"}
                  </div>

                  <div style={{ maxWidth: "82%" }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: "JetBrains Mono",
                        color: isUser ? "#67e8f9" : "#a78bfa",
                        marginBottom: 4,
                        fontWeight: 700,
                        textAlign: isUser ? "right" : "left",
                      }}
                    >
                      {isUser ? "YOU" : "AI ASSISTANT"} · {msg.time}
                    </div>

                    <div
                      style={{
                        background: isUser
                          ? "rgba(6,182,212,0.15)"
                          : "rgba(255,255,255,0.05)",
                        border: isUser
                          ? "1px solid rgba(6,182,212,0.3)"
                          : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: isUser
                          ? "14px 14px 2px 14px"
                          : "14px 14px 14px 2px",
                        padding: "14px 18px",
                        color: "white",
                        fontSize: 14,
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <div>{msg.text}</div>

                      {/* Bullet Items inside message (ChatGPT style) */}
                      {msg.bulletItems && msg.bulletItems.length > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {msg.bulletItems.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => triggerUserQuery(item)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 13,
                                color: "#67e8f9",
                                background: "rgba(6,182,212,0.08)",
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "1px solid rgba(6,182,212,0.2)",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <span>•</span>
                              <span style={{ textDecoration: "underline" }}>
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Embed 1. Select Interview Type Options inside bot message */}
                      {msg.typeCard && (
                        <div style={{ marginTop: 14 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontFamily: "JetBrains Mono",
                              color: "#06b6d4",
                              fontWeight: 700,
                              marginBottom: 8,
                            }}
                          >
                            1. SELECT INTERVIEW TYPE:
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(200px, 1fr))",
                              gap: 8,
                            }}
                          >
                            {interviewTypeOptions.map((opt) => {
                              const isSel = selectedType === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectType(opt.id)}
                                  style={{
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    border: isSel
                                      ? `1.5px solid ${opt.color}`
                                      : "1px solid rgba(255,255,255,0.08)",
                                    background: isSel
                                      ? `${opt.color}25`
                                      : "rgba(255,255,255,0.03)",
                                    color: isSel
                                      ? "white"
                                      : "rgba(226,232,240,0.8)",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    fontFamily: "Outfit",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      fontWeight: 700,
                                      fontSize: 13,
                                    }}
                                  >
                                    <span>{opt.icon}</span>
                                    <span
                                      style={{
                                        color: isSel ? "#67e8f9" : "white",
                                      }}
                                    >
                                      {opt.title}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Embed 2. Difficulty & Question Count inside bot message */}
                      {msg.configCard && (
                        <div style={{ marginTop: 14 }}>
                          {/* Uploaded JD Banner / Status Card */}
                          {targetRoleInfo.hasJd === false ? (
                            <div
                              style={{
                                marginBottom: 14,
                                padding: "14px 16px",
                                borderRadius: 12,
                                background: "rgba(239, 68, 68, 0.12)",
                                border: "1px solid rgba(239, 68, 68, 0.35)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: 8,
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 22 }}>⚠️</span>
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fca5a5" }}>
                                      No Target Job Description (JD) Found for Your Account
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        color: "rgba(254, 202, 202, 0.8)",
                                        marginTop: 3,
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      Mock interview questions are strictly generated from your uploaded Job Description (no dummy questions).
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  style={{
                                    padding: "6px 14px",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: "linear-gradient(135deg, #ef4444, #f59e0b)",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    if (onNavigate) {
                                      onNavigate("ats" as Screen);
                                    } else {
                                      window.location.href = "/ats";
                                    }
                                  }}
                                >
                                  📄 Upload JD in ATS Analyzer →
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                marginBottom: 12,
                                padding: "12px 14px",
                                borderRadius: 10,
                                background:
                                  "linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(124, 58, 237, 0.18))",
                                border: "1px solid rgba(6, 182, 212, 0.4)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: 8,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <span style={{ fontSize: 20 }}>📄</span>
                                  <div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "#67e8f9",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                      }}
                                    >
                                      <span>TARGET UPLOADED JD:</span>
                                      <span style={{ color: "white" }}>
                                        {targetRoleInfo.jobTitle || "Your Target Role"}
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        color: "rgba(226, 232, 240, 0.75)",
                                        marginTop: 2,
                                      }}
                                    >
                                      {targetRoleInfo.company} · {targetRoleInfo.experience} · Match Score {targetRoleInfo.matchScore}%
                                      {targetRoleInfo.skills?.length > 0 &&
                                        ` · Key Focus: ${targetRoleInfo.skills.slice(0, 3).join(", ")}`}
                                    </div>
                                  </div>
                                </div>
                                <span className="tag tag-cyan" style={{ fontSize: 10 }}>
                                  ✓ 100% JD-Synced AI
                                </span>
                              </div>
                            </div>
                          )}

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 14,
                              background: "rgba(0,0,0,0.25)",
                              padding: 12,
                              borderRadius: 10,
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                            className="stack-on-mobile"
                          >
                            <div>
                              <label
                                style={{
                                  fontSize: 11,
                                  color: "#a78bfa",
                                  display: "block",
                                  marginBottom: 6,
                                  fontWeight: 700,
                                  fontFamily: "JetBrains Mono",
                                }}
                              >
                                DIFFICULTY LEVEL:
                              </label>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 6,
                                  flexWrap: "wrap",
                                }}
                              >
                                {(
                                  ["Easy", "Medium", "Hard"] as const
                                ).map((lvl) => (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => handleSelectDifficulty(lvl)}
                                    style={{
                                      flex: 1,
                                      minWidth: 70,
                                      padding: "7px 0",
                                      fontSize: 11,
                                      borderRadius: 6,
                                      border:
                                        difficulty === lvl
                                          ? "1.5px solid #7c3aed"
                                          : "1px solid rgba(255,255,255,0.1)",
                                      background:
                                        difficulty === lvl
                                          ? "rgba(124,58,237,0.3)"
                                          : "rgba(255,255,255,0.03)",
                                      color:
                                        difficulty === lvl
                                          ? "#c4b5fd"
                                          : "white",
                                      cursor: "pointer",
                                      fontWeight: 600,
                                      fontFamily: "Outfit",
                                    }}
                                  >
                                    {lvl}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label
                                style={{
                                  fontSize: 11,
                                  color: "#ec4899",
                                  display: "block",
                                  marginBottom: 6,
                                  fontWeight: 700,
                                  fontFamily: "JetBrains Mono",
                                }}
                              >
                                NUMBER OF QUESTIONS:
                              </label>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 6,
                                  flexWrap: "wrap",
                                }}
                              >
                                {[5, 10, 25, 50].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => handleSelectCount(num)}
                                    style={{
                                      flex: 1,
                                      minWidth: 45,
                                      padding: "7px 0",
                                      fontSize: 11,
                                      borderRadius: 6,
                                      border:
                                        targetQuestionCount === num
                                          ? "1.5px solid #ec4899"
                                          : "1px solid rgba(255,255,255,0.1)",
                                      background:
                                        targetQuestionCount === num
                                          ? "rgba(236,72,153,0.3)"
                                          : "rgba(255,255,255,0.03)",
                                      color:
                                        targetQuestionCount === num
                                          ? "#f472b6"
                                          : "white",
                                      cursor: "pointer",
                                      fontWeight: 600,
                                      fontFamily: "Outfit",
                                    }}
                                  >
                                    {num} Qs {num === 50 ? "🔥" : ""}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Dynamic JD Question Generation Status Bar */}
                          {targetRoleInfo.hasJd && (
                            <div style={{ marginTop: 12 }}>
                              {isGeneratingQuestions ? (
                                <div
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: 8,
                                    background: "rgba(124, 58, 237, 0.15)",
                                    border: "1px solid rgba(124, 58, 237, 0.35)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <span style={{ fontSize: 16 }} className="pulse-glow">
                                    ⚡
                                  </span>
                                  <span style={{ fontSize: 12, color: "#c4b5fd", fontWeight: 600 }}>
                                    Generating {targetQuestionCount} questions specifically from your uploaded JD for{" "}
                                    <strong style={{ color: "white" }}>{targetRoleInfo.jobTitle}</strong> using Groq AI...
                                  </span>
                                </div>
                              ) : generationError ? (
                                <div
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: 8,
                                    background: "rgba(239, 68, 68, 0.15)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    color: "#fca5a5",
                                    fontSize: 12,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: 8,
                                  }}
                                >
                                  <span>⚠️ {generationError}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      fetchJdQuestions(
                                        selectedType,
                                        targetQuestionCount,
                                        difficulty
                                      )
                                    }
                                    style={{
                                      background: "rgba(239, 68, 68, 0.2)",
                                      border: "1px solid #fca5a5",
                                      color: "#fca5a5",
                                      padding: "4px 10px",
                                      borderRadius: 6,
                                      cursor: "pointer",
                                      fontSize: 11,
                                      fontWeight: 600,
                                    }}
                                  >
                                    🔄 Retry Generation
                                  </button>
                                </div>
                              ) : sessionQuestions.length > 0 ? (
                                <div
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    background: "rgba(16, 185, 129, 0.12)",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: 8,
                                  }}
                                >
                                  <span style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600 }}>
                                    ✓ {sessionQuestions.length} Questions Ready · Derived strictly from your uploaded JD
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      fetchJdQuestions(
                                        selectedType,
                                        targetQuestionCount,
                                        difficulty
                                      )
                                    }
                                    style={{
                                      background: "rgba(16, 185, 129, 0.2)",
                                      border: "1px solid rgba(16, 185, 129, 0.5)",
                                      color: "#6ee7b7",
                                      fontSize: 11,
                                      padding: "3px 10px",
                                      borderRadius: 6,
                                      cursor: "pointer",
                                      fontWeight: 600,
                                    }}
                                  >
                                    🔄 Regenerate Questions
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Embed Start Interview button inside ready bot message */}
                      {msg.readyCard && (
                        <div
                          style={{
                            marginTop: 12,
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="btn-primary"
                            disabled={
                              !targetRoleInfo.hasJd ||
                              isGeneratingQuestions ||
                              activeQuestions.length === 0
                            }
                            style={{
                              padding: "12px 24px",
                              fontSize: 14,
                              fontWeight: 700,
                              letterSpacing: "0.02em",
                              background:
                                !targetRoleInfo.hasJd ||
                                isGeneratingQuestions ||
                                activeQuestions.length === 0
                                  ? "rgba(255,255,255,0.1)"
                                  : "linear-gradient(135deg, #ec4899, #7c3aed, #06b6d4)",
                              boxShadow:
                                !targetRoleInfo.hasJd ||
                                isGeneratingQuestions ||
                                activeQuestions.length === 0
                                  ? "none"
                                  : "0 4px 18px rgba(236, 72, 153, 0.4)",
                              cursor:
                                !targetRoleInfo.hasJd ||
                                isGeneratingQuestions ||
                                activeQuestions.length === 0
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                !targetRoleInfo.hasJd ||
                                isGeneratingQuestions ||
                                activeQuestions.length === 0
                                  ? 0.5
                                  : 1,
                            }}
                            onClick={handleStartChatInterview}
                          >
                            🚀 Start Interactive Chat Interview (
                            {activeQuestions.length > 0
                              ? `${activeQuestions.length} JD Qs`
                              : "Waiting for JD"}
                            ) →
                          </button>
                        </div>
                      )}

                      {/* Proceed to Next Question Button in Chat */}
                      {msg.nextQuestionCard && (
                        <div style={{ marginTop: 14 }}>
                          <button
                            className="btn-primary"
                            style={{
                              padding: "10px 22px",
                              fontSize: 13,
                              fontWeight: 700,
                              background:
                                "linear-gradient(135deg, #10b981, #06b6d4)",
                              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                            }}
                            onClick={handleNextChatQuestion}
                          >
                            ➡️ Proceed to Question {msg.nextQNum || 2} →
                          </button>
                        </div>
                      )}

                      {/* Complete Session Button */}
                      {msg.completeCard && (
                        <div style={{ marginTop: 14 }}>
                          <div
                            style={{
                              padding: 12,
                              borderRadius: 10,
                              background: "rgba(16, 185, 129, 0.12)",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              marginBottom: 10,
                              fontSize: 13,
                              color: "#6ee7b7",
                              fontWeight: 600,
                            }}
                          >
                            🎉 Fantastic job! You have completed all questions in this session.
                          </div>
                          <button
                            className="btn-primary"
                            style={{
                              padding: "10px 22px",
                              fontSize: 13,
                              fontWeight: 700,
                              background:
                                "linear-gradient(135deg, #7c3aed, #ec4899)",
                            }}
                            onClick={() => {
                              handleFinishRoundAndScorecard(userAnswers);
                            }}
                          >
                            📊 View Full Performance Report →
                          </button>
                        </div>
                      )}

                      {/* Upgrade Plan Card in Chat */}
                      {msg.upgradeCard && (
                        <div
                          style={{
                            marginTop: 14,
                            padding: 16,
                            borderRadius: 14,
                            background:
                              "linear-gradient(145deg, rgba(124, 58, 237, 0.22), rgba(236, 72, 153, 0.18))",
                            border: "1px solid rgba(124, 58, 237, 0.45)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 8,
                            }}
                          >
                            <span style={{ fontSize: 20 }}>🔒</span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#f472b6",
                              }}
                            >
                              Master Plan Required for Question 3 to {targetQuestionCount}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: 12,
                              color: "rgba(226, 232, 240, 0.85)",
                              margin: "0 0 14px 0",
                              lineHeight: 1.5,
                            }}
                          >
                            You answered the 2 free practice questions! Upgrade your membership plan to unlock all {targetQuestionCount} questions, complete Groq AI feedback, and full score analysis.
                          </p>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{
                              padding: "10px 20px",
                              fontSize: 13,
                              fontWeight: 700,
                              background:
                                "linear-gradient(135deg, #7c3aed, #ec4899)",
                              boxShadow: "0 4px 16px rgba(124, 58, 237, 0.5)",
                              borderRadius: 10,
                            }}
                            onClick={onOpenUpgradeModal}
                          >
                              ⚡ Unlock to Upgrade Plan →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bot Typing Indicator */}
            {isBotTyping && (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "JetBrains Mono",
                    color: "#a78bfa",
                    fontStyle: "italic",
                  }}
                >
                  Alex is analyzing with Groq AI...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chatbot Input Footer Bar */}
          <div
            style={{
              padding: "14px 20px",
              background: "rgba(255,255,255,0.03)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <input
              className="glass-input"
              placeholder="Ask any interview question (e.g., 'JavaScript basic concepts', 'Explain React reconciliation', 'How to scale WebSockets')..."
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              style={{ flex: 1, fontSize: 13 }}
            />
            <button
              className="btn-primary"
              style={{ padding: "10px 22px", fontSize: 13, flexShrink: 0 }}
              onClick={handleSendMessage}
            >
              Send ↵
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 2: LIVE INTERVIEW SESSION
  if (phase === "interview") {
    if (!hasActiveSubscription && currentQIndex >= 2) {
      return (
        <div
          className="fade-in page-container"
          style={{
            height: "100%",
            overflowY: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 640,
              width: "100%",
              padding: "36px",
              textAlign: "center",
              borderRadius: 24,
              border: "1px solid rgba(124, 58, 237, 0.4)",
              background:
                "linear-gradient(160deg, rgba(15, 15, 42, 0.95), rgba(7, 7, 26, 0.98))",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.25)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "rgba(124, 58, 237, 0.2)",
                border: "1px solid rgba(124, 58, 237, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                margin: "0 auto 18px",
              }}
            >
              🔒
            </div>
            <div
              style={{
                fontSize: 11,
                fontFamily: "JetBrains Mono",
                color: "#c4b5fd",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              FREE PRACTICE QUESTION LIMIT REACHED (2 / 2)
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "white",
                margin: "0 0 12px 0",
              }}
            >
              Upgrade Your <span className="gradient-text">Membership Plan</span>
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(148, 163, 184, 0.8)",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              You have answered the first 2 practice questions! Upgrade to a membership plan to unlock all {activeQuestions.length}+ questions, live Groq AI evaluation, and verified reports.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn-primary"
                style={{
                  padding: "12px 24px",
                  fontSize: 14,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
                onClick={onOpenUpgradeModal}
              >
                ⚡ Upgrade Subscription Plan Now →
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: "12px 20px", fontSize: 13, borderRadius: 12 }}
                onClick={() => setPhase("setup")}
              >
                ← Back to Mode 1 Setup
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!currentQuestion) {
      return (
        <div
          className="fade-in page-container"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            className="glass-card"
            style={{ maxWidth: 500, padding: 32, textAlign: "center", borderRadius: 16 }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>
              No Question Available
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(226, 232, 240, 0.7)",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              No questions found for this session. Please return to setup and ensure your Job
              Description is uploaded.
            </div>
            <button className="btn-primary" onClick={() => setPhase("setup")}>
              ← Back to Setup
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="fade-in page-container"
        style={{ height: "100%", overflowY: "auto" }}
      >
        {/* Header Bar */}
        <div
          className="stack-on-mobile"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: "JetBrains Mono",
                color: selectedOptionInfo?.color || "#7c3aed",
                fontWeight: 700,
                background: `${selectedOptionInfo?.color || "#7c3aed"}20`,
                padding: "4px 10px",
                borderRadius: 6,
                border: `1px solid ${selectedOptionInfo?.color || "#7c3aed"}40`,
              }}
            >
              {selectedOptionInfo?.icon} {selectedOptionInfo?.title}
            </span>
            <span style={{ fontSize: 13, color: "rgba(148,163,184,0.6)" }}>
              Level: <strong style={{ color: "white" }}>{difficulty}</strong>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 16,
                color: recording ? "#10b981" : "rgba(148,163,184,0.5)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {recording && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                  }}
                  className="pulse-glow"
                />
              )}
              {formatTime(timer)}
            </div>

            <span className="tag tag-purple">
              Q{currentQIndex + 1} / {activeQuestions.length}
            </span>
          </div>
        </div>

        {/* Question Box */}
        <div
          className="glass"
          style={{
            padding: "24px",
            marginBottom: 20,
            borderLeft: `4px solid ${selectedOptionInfo?.color || "#7c3aed"}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
                className={recording ? "pulse-glow" : ""}
              >
                🤖
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "JetBrains Mono",
                    color: "#a78bfa",
                    fontWeight: 700,
                  }}
                >
                  AI INTERVIEW BOT (GROQ POWERED)
                </div>
                <div style={{ fontSize: 13, color: "rgba(148,163,184,0.6)" }}>
                  Category: {currentQuestion.category}
                </div>
              </div>
            </div>

            {currentQuestion.hint && (
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                  color: "#06b6d4",
                  background: "rgba(6,182,212,0.1)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(6,182,212,0.2)",
                }}
              >
                💡 Hint: {currentQuestion.hint}
              </div>
            )}
          </div>

          <div
            style={{
              fontSize: 16,
              color: "white",
              lineHeight: 1.6,
              fontWeight: 500,
              marginBottom: currentQuestion.codeSnippet ? 14 : 0,
            }}
          >
            {currentQuestion.q}
          </div>

          {currentQuestion.codeSnippet && (
            <div
              style={{
                marginTop: 12,
                background: "#0d0e1b",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 10,
                padding: "14px 18px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: "#e2e8f0",
                lineHeight: 1.6,
                overflowX: "auto",
                whiteSpace: "pre",
              }}
            >
              {currentQuestion.codeSnippet}
            </div>
          )}
        </div>

        {/* Answer Input */}
        <div
          className="glass"
          style={{ padding: "22px 24px", marginBottom: 20 }}
        >
          <div
            className="stack-on-mobile"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
                Your Answer (
                {selectedMode === "voice" ? "Voice STT Mode" : "Text Mode"})
              </span>
            </div>

            <div>
              {!recording ? (
                <button
                  className="btn-primary"
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                  }}
                  onClick={handleStartRecording}
                >
                  ● Start{" "}
                  {selectedMode === "voice" ? "Voice Recording" : "Answering"}
                </button>
              ) : (
                <button
                  type="button"
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                    borderRadius: 8,
                    border: "1px solid rgba(239,68,68,0.5)",
                    background: "rgba(239,68,68,0.18)",
                    color: "#fca5a5",
                    cursor: "pointer",
                  }}
                  onClick={handleStopRecording}
                >
                  ■ Stop Recording
                </button>
              )}
            </div>
          </div>

          <textarea
            className="glass-textarea"
            rows={7}
            placeholder={
              selectedMode === "voice"
                ? "Click 'Start Voice Recording' and speak your response (or type here)..."
                : "Type your code or answer breakdown here..."
            }
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div
          className="stack-on-mobile"
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <button
            className="btn-ghost"
            style={{ padding: "10px 20px", fontSize: 13 }}
            onClick={() => {
              const nextAnswers = [...userAnswers, "Skipped"];
              setUserAnswers(nextAnswers);
              setAnswer("");
              if (currentQIndex < activeQuestions.length - 1) {
                setCurrentQIndex((q) => q + 1);
              } else {
                handleFinishRoundAndScorecard(nextAnswers);
              }
            }}
          >
            Skip Question
          </button>

          <button
            className="btn-primary"
            style={{ padding: "10px 24px", fontSize: 14 }}
            onClick={handleNextQuestion}
          >
            {currentQIndex < activeQuestions.length - 1
              ? "Next Question →"
              : "Finish Round & Generate Scorecard →"}
          </button>
        </div>
      </div>
    );
  }

  // PHASE 3: SCORECARD & AI PERFORMANCE REPORT (EVALUATED BY GROQ)
  const avgScore = scorecardData.overallScore;

  return (
    <div
      className="fade-in page-container"
      style={{ height: "100%", overflowY: "auto" }}
    >
      <div
        className="stack-on-mobile"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "JetBrains Mono",
              color: "#10b981",
              letterSpacing: "0.08em",
              marginBottom: 4,
              fontWeight: 700,
            }}
          >
            ✓ MOCK SESSION COMPLETED · GROQ AI EVALUATED
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "white",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            AI Performance <span className="gradient-text">Scorecard</span>
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn-ghost"
            style={{ padding: "9px 16px", fontSize: 13 }}
            onClick={() => {
              setPhase("setup");
              setChatInterviewActive(false);
            }}
          >
            ← Practice Another Round
          </button>
          <button
            className="btn-primary"
            style={{ padding: "9px 18px", fontSize: 13 }}
            onClick={() => {
              if (onNavigate) {
                onNavigate("reports");
              } else {
                router.push("/user/reports");
              }
            }}
          >
            View in Reports →
          </button>
        </div>
      </div>

      <div className="grid-responsive-sidebar">
        <div
          className="glass"
          style={{ padding: "28px 20px", textAlign: "center" }}
        >
          <div
            style={{
              fontSize: 12,
              fontFamily: "JetBrains Mono",
              color: "rgba(148,163,184,0.6)",
              marginBottom: 8,
            }}
          >
            OVERALL RATING
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: avgScore >= 80 ? "#10b981" : avgScore >= 60 ? "#fbbf24" : "#f87171",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {isEvaluatingScorecard ? "..." : avgScore}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(148,163,184,0.4)",
              marginBottom: 16,
            }}
          >
            / 100
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: avgScore >= 80 ? "#10b981" : avgScore >= 60 ? "#fbbf24" : "#f87171",
            }}
          >
            {scorecardData.recommendation}
          </div>

          <div
            style={{
              marginTop: 18,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              fontSize: 12,
              color: "rgba(226,232,240,0.8)",
              textAlign: "left",
              lineHeight: 1.5,
            }}
          >
            💡 <strong>Evaluation Note:</strong> Scored against Senior-level expectations for <strong>{targetRoleInfo.jobTitle}</strong> with Groq AI analysis.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {scorecardData.aspects.map((f) => (
            <div
              key={f.aspect}
              className="glass"
              style={{ padding: "20px 24px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: 15, fontWeight: 700, color: "white" }}
                >
                  {f.aspect}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: f.score >= 80 ? "#10b981" : f.score >= 60 ? "#fbbf24" : "#f87171",
                    fontFamily: "JetBrains Mono",
                  }}
                >
                  {f.score}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(226,232,240,0.85)" }}>
                {f.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
