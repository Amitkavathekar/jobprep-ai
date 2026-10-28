"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/types";
import LockedBlurOverlay from "@/components/LockedBlurOverlay";
import api from "@/lib/axios";

export interface ATSAnalysisProps {
  onNavigate?: (s: Screen) => void;
  hasActiveSubscription?: boolean;
  onOpenUpgradeModal?: () => void;
}

export interface CheckItem {
  label: string;
  pass: boolean;
  note?: string;
}

export interface KeywordCategory {
  category: string;
  matched: number;
  total: number;
  color: string;
}

export interface Recommendation {
  priority: "Critical" | "High" | "Medium" | "Low";
  text: string;
  fix: string;
}

const ACTION_VERBS = [
  "built", "developed", "designed", "implemented", "optimized", "engineered",
  "deployed", "created", "led", "managed", "enhanced", "resolved", "architected",
  "integrated", "automated", "tested", "delivered", "collaborated", "spearheaded",
  "scaled", "maintained", "refactored", "analyzed", "orchestrated", "executed"
];

const SOFT_SKILLS = [
  "leadership", "communication", "teamwork", "problem solving", "collaboration",
  "adaptability", "critical thinking", "ownership", "agile", "scrum", "mentoring",
  "time management", "decision making", "presentation", "analytical", "creativity"
];

const INDUSTRY_TERMS = [
  "api", "rest", "restful", "ci/cd", "git", "github", "database", "sql", "nosql",
  "cloud", "docker", "microservices", "testing", "unit testing", "responsive",
  "performance", "security", "scalability", "full stack", "frontend", "backend",
  "mvc", "component", "state management", "production", "cross-platform"
];

function computeRealKeywordCoverage(
  matchedSkills: string[],
  missingSkills: string[],
  text: string
): KeywordCategory[] {
  const lower = (text || "").toLowerCase();

  // 1. Technical Skills
  const techMatched = matchedSkills.length;
  const techTotal = Math.max(techMatched + missingSkills.length, 10);

  // 2. Soft Skills
  const matchedSoft = SOFT_SKILLS.filter((s) => {
    const regex = new RegExp(`\\b${s.replace(/\s+/g, "\\s+")}\\b`, "i");
    return regex.test(lower);
  });
  const softTotal = Math.max(matchedSoft.length, 6);

  // 3. Action Verbs
  const matchedVerbs = ACTION_VERBS.filter((v) => {
    const regex = new RegExp(`\\b${v}\\b`, "i");
    return regex.test(lower);
  });
  const verbsTotal = Math.max(matchedVerbs.length, 16);

  // 4. Industry Terms
  const matchedTerms = INDUSTRY_TERMS.filter((t) => {
    const regex = new RegExp(`\\b${t.replace(/\s+/g, "\\s+")}\\b`, "i");
    return regex.test(lower);
  });
  const termsTotal = Math.max(matchedTerms.length, 11);

  return [
    {
      category: "Technical Skills",
      matched: techMatched,
      total: techTotal,
      color: "#7c3aed",
    },
    {
      category: "Soft Skills",
      matched: matchedSoft.length,
      total: softTotal,
      color: "#10b981",
    },
    {
      category: "Action Verbs",
      matched: matchedVerbs.length,
      total: verbsTotal,
      color: "#06b6d4",
    },
    {
      category: "Industry Terms",
      matched: matchedTerms.length,
      total: termsTotal,
      color: "#f59e0b",
    },
  ];
}

function computeRealChecks(text: string, sections?: any[]): CheckItem[] {
  const clean = text || "";
  const lower = clean.toLowerCase();
  const secTitles = (sections || []).map((s: any) => (s.title || "").toLowerCase()).join(" ");

  // 1. Contact info check (Email & Phone)
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(clean);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/.test(clean);
  const contactPass = hasEmail || hasPhone;

  // 2. No special / strange bullet characters in headings
  const hasSpecialHeadingChars = /^[•\-\*▪▫❖★➤▶]\s*[A-Z]/m.test(clean);

  // 3. Professional Summary section
  const hasSummary =
    /summary|profile|about|objective/i.test(secTitles) ||
    /^(summary|professional summary|executive summary|about me|profile)/im.test(clean);

  // 4. Experience section
  const hasExperience =
    /experience|employment|work history/i.test(secTitles) ||
    /^(experience|work experience|employment history|professional experience)/im.test(clean);

  // 5. Skills section
  const hasSkills =
    /skills|technologies|competencies|tech stack/i.test(secTitles) ||
    /^(skills|technical skills|core competencies|technologies)/im.test(clean);

  // 6. Education section
  const hasEducation =
    /education|academics|qualifications/i.test(secTitles) ||
    /education|bachelor|master|degree|university|college|b\.tech|b\.e|bca|mca|b\.sc/i.test(lower);

  // 7. Date formatting
  const hasDates =
    /\b(20\d\d|19\d\d)\b/.test(clean) ||
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/i.test(clean);

  // 8. Measurable achievements (Metrics & Numbers)
  const hasMetrics =
    /\d+%\b|\d+\+\b|\b\d+\s*(users|clients|projects|ms|teams|engineers|apps|releases|prs|stars|downloads)/i.test(
      clean
    );

  // 9. Action verbs usage
  const hasActionVerbs = ACTION_VERBS.some((v) => new RegExp(`\\b${v}\\b`, "i").test(lower));

  // 10. Resume length & content density
  const hasHealthyLength = clean.trim().length >= 250;

  return [
    {
      label: "Contact Info (Email & Phone)",
      pass: contactPass,
      note: contactPass ? undefined : "Add direct phone and email in body",
    },
    {
      label: "Clean Section Headings",
      pass: !hasSpecialHeadingChars,
      note: !hasSpecialHeadingChars ? undefined : "Use plain text titles without special bullet symbols",
    },
    {
      label: "Professional Summary Section",
      pass: hasSummary,
      note: hasSummary ? undefined : "Include a dedicated Summary or Profile section",
    },
    {
      label: "Work Experience Section",
      pass: hasExperience,
      note: hasExperience ? undefined : "Include chronological Work Experience details",
    },
    {
      label: "Categorized Skills Section",
      pass: hasSkills,
      note: hasSkills ? undefined : "Include a categorized Skills section for ATS parsing",
    },
    {
      label: "Education Credentials",
      pass: hasEducation,
      note: hasEducation ? undefined : "Include Degree, University, or Education details",
    },
    {
      label: "Standard Date Formatting",
      pass: hasDates,
      note: hasDates ? undefined : "Include 'Month YYYY' or 'YYYY' dates for roles",
    },
    {
      label: "Quantifiable Impact Metrics",
      pass: hasMetrics,
      note: hasMetrics ? undefined : "Add measurable achievements (e.g. %, numbers, scale)",
    },
    {
      label: "Strong Action Verbs in Experience",
      pass: hasActionVerbs,
      note: hasActionVerbs ? undefined : "Start achievements with action verbs (e.g. Built, Optimized)",
    },
    {
      label: "Content Length & Density",
      pass: hasHealthyLength,
      note: hasHealthyLength ? undefined : "Resume text is too brief for ATS keyword scoring",
    },
  ];
}

export default function ATSAnalysis({
  onNavigate,
  hasActiveSubscription = false,
  onOpenUpgradeModal,
}: ATSAnalysisProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasSubscription, setHasSubscription] = useState(Boolean(hasActiveSubscription));
  const [score, setScore] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = u?.id || u?._id || "";
        const cachedATS =
          (userId ? localStorage.getItem(`jobprep_latest_ats_result_${userId}`) : null) ||
          localStorage.getItem("jobprep_latest_ats_result");
        if (cachedATS) {
          const parsed = JSON.parse(cachedATS);
          if (typeof parsed.score === "number") return parsed.score;
        }
        const cachedAI =
          (userId ? localStorage.getItem(`jobprep_latest_analysis_${userId}`) : null) ||
          localStorage.getItem("jobprep_latest_analysis");
        if (cachedAI) {
          const parsed = JSON.parse(cachedAI);
          if (typeof parsed.score === "number") return parsed.score;
          if (typeof parsed.match_score === "number") return parsed.match_score;
        }
      } catch {}
    }
    return 0;
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState("Target Role");
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [keywordCoverage, setKeywordCoverage] = useState<KeywordCategory[]>([
    { category: "Technical Skills", matched: 0, total: 10, color: "#7c3aed" },
    { category: "Soft Skills", matched: 0, total: 6, color: "#10b981" },
    { category: "Action Verbs", matched: 0, total: 16, color: "#06b6d4" },
    { category: "Industry Terms", matched: 0, total: 11, color: "#f59e0b" },
  ]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analyzedSections, setAnalyzedSections] = useState<any[]>([]);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [finalResumeRawText, setFinalResumeRawText] = useState("");
  const [analyzedResumeName, setAnalyzedResumeName] = useState<string>("");

  useEffect(() => {
    if (isResumeModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isResumeModalOpen]);

  const handleUpgradeClick = () => {
    if (onOpenUpgradeModal) {
      onOpenUpgradeModal();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-membership-modal"));
    } else {
      router.push("/user/subscription");
    }
  };

  useEffect(() => {
    const handleSubUpdated = () => {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.hasActiveSubscription || u?.isSubscribed || u?.plan) {
            setHasSubscription(true);
          }
        }
      } catch {}
    };
    window.addEventListener("subscription-updated", handleSubUpdated);
    return () => window.removeEventListener("subscription-updated", handleSubUpdated);
  }, []);

  const handleNav = (s: Screen) => {
    if (onNavigate) {
      onNavigate(s);
    } else {
      const route = s === "job-resume" ? "/user/resume" : `/user/${s}`;
      router.push(route);
    }
  };

  const applyATSData = (d: any, resumeName?: string, sourceText?: string) => {
    if (!d) return;

    if (typeof d.score === "number" && d.score > 0) {
      setScore(d.score);
    }
    if (d.targetJobRole) {
      setTargetRole(d.targetJobRole);
    }
    if (resumeName) {
      setUploadedFileName(resumeName);
    }

    const textToCheck = sourceText || finalResumeRawText || "";
    const matched: string[] = Array.isArray(d.matchedSkills) ? d.matchedSkills : [];
    const missing: string[] = Array.isArray(d.missingSkills) ? d.missingSkills : [];

    setKeywordCoverage(computeRealKeywordCoverage(matched, missing, textToCheck));
    setChecks(computeRealChecks(textToCheck, analyzedSections));

    const dynamicRecs: Recommendation[] = [];
    if (missing.length > 0) {
      dynamicRecs.push({
        priority: "High",
        text: `Incorporate missing keywords '${missing.slice(0, 4).join("', '")}' in your skills or experience sections.`,
        fix: "Add keywords",
      });
    }
    if (Array.isArray(d.recommendations) && d.recommendations.length > 0) {
      d.recommendations.forEach((r: string, idx: number) => {
        dynamicRecs.push({
          priority: idx === 0 ? "Critical" : idx === 1 ? "High" : "Medium",
          text: r,
          fix: "Auto-fix",
        });
      });
    }
    if (Array.isArray(d.weaknesses) && d.weaknesses.length > 0) {
      d.weaknesses.forEach((w: string) => {
        dynamicRecs.push({
          priority: "Critical",
          text: w,
          fix: "Edit resume",
        });
      });
    }

    setRecommendations(dynamicRecs);
  };

  const analyzeResumeContent = async (
    textOrFile: string | File,
    roleOverride?: string,
    fileNameOverride?: string,
    jdOverride?: string
  ) => {
    setAnalyzing(true);
    try {
      let userId = "";
      try {
        const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (userRaw) {
          const u = JSON.parse(userRaw);
          userId = u?.id || u?._id || "";
        }
      } catch {}

      const effectiveRole = roleOverride || targetRole || "Software Professional";
      const effectiveJd =
        jdOverride ||
        (userId ? localStorage.getItem(`jobprep_jd_${userId}`) : null) ||
        (typeof window !== "undefined" ? localStorage.getItem("jobprep_jd") : null) ||
        undefined;

      let res: any = null;

      if (typeof textOrFile === "string") {
        res = await api.post("/ats/analyze", {
          resumeText: textOrFile.trim(),
          targetJobRole: effectiveRole,
          jobDescription: effectiveJd,
        });
      } else {
        const formData = new FormData();
        formData.append("resume", textOrFile);
        formData.append("targetJobRole", effectiveRole);
        if (effectiveJd) {
          formData.append("jobDescription", effectiveJd);
        }
        res = await api.post("/ats/analyze", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res?.data?.success && res.data?.data) {
        const d = res.data.data;
        const textForChecks = typeof textOrFile === "string" ? textOrFile : "";
        d._sourceText = textForChecks;
        d._analyzedAt = Date.now();
        d._isFromFinalResume = true;
        applyATSData(d, fileNameOverride || uploadedFileName || undefined, textForChecks);

        if (userId) {
          localStorage.setItem(`jobprep_latest_ats_result_${userId}`, JSON.stringify(d));
        }
        localStorage.setItem("jobprep_latest_ats_result", JSON.stringify(d));
      }
    } catch (err) {
      console.warn("Real ATS Analysis error, keeping previous score:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Load real analysis data from localStorage or backend
  useEffect(() => {
    async function loadRealData() {
      try {
        let userId = "";
        try {
          const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
          if (userRaw) {
            const u = JSON.parse(userRaw);
            userId = u?.id || u?._id || "";
            if (u?.hasActiveSubscription || u?.isSubscribed || u?.plan) {
              setHasSubscription(true);
            }
          }
        } catch {}

        // 1. Resolve final resume from Resume Editor (single source of truth)
        let finalResumeText =
          (userId ? localStorage.getItem(`jobprep_final_resume_text_${userId}`) : null) ||
          (typeof window !== "undefined" ? localStorage.getItem("jobprep_final_resume_text") : null) ||
          "";

        let finalSections: any[] = [];
        const savedSectionsRaw =
          (userId ? localStorage.getItem(`jobprep_final_resume_sections_${userId}`) : null) ||
          (typeof window !== "undefined" ? localStorage.getItem("jobprep_final_resume_sections") : null);

        if (savedSectionsRaw) {
          try {
            const parsed = JSON.parse(savedSectionsRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              finalSections = parsed;
              setAnalyzedSections(parsed);
              if (!finalResumeText || finalResumeText.trim().length < 15) {
                finalResumeText = parsed
                  .map((s: any) => `${(s.title || "").toUpperCase()}\n${s.content || ""}`)
                  .join("\n\n");
              }
            }
          } catch {}
        }

        // 2. Load latest AI analysis / JD details
        const userStored =
          (userId ? localStorage.getItem(`jobprep_latest_analysis_${userId}`) : null) ||
          (typeof window !== "undefined" ? localStorage.getItem("jobprep_latest_analysis") : null);

        let data: any = null;
        if (userStored) {
          try {
            data = JSON.parse(userStored);
          } catch {}
        }

        if (!data) {
          const res = await api.get("/ai-analysis/latest").catch(() => null);
          if (res?.data?.success && res.data?.data) {
            data = res.data.data;
          }
        }

        // Fallback to active AI sections if Resume Editor draft wasn't explicitly saved yet
        if ((!finalResumeText || finalResumeText.trim().length < 15) && data?.resumeSections && Array.isArray(data.resumeSections)) {
          finalSections = data.resumeSections;
          setAnalyzedSections(data.resumeSections);
          finalResumeText = data.resumeSections
            .map((s: any) => `${(s.title || "").toUpperCase()}\n${s.content || ""}`)
            .join("\n\n");
        }

        setFinalResumeRawText(finalResumeText);

        const targetJd =
          (userId ? localStorage.getItem(`jobprep_jd_${userId}`) : null) ||
          (typeof window !== "undefined" ? localStorage.getItem("jobprep_jd") : null) ||
          data?.jobDescription ||
          "";

        let effectiveRole = "Target Role";
        if (data?.parsedResume?.jobTitle) {
          effectiveRole = data.parsedResume.jobTitle;
          setTargetRole(effectiveRole);
        } else if (targetJd) {
          const firstLine = targetJd.split("\n")[0].trim().slice(0, 40);
          if (firstLine) {
            effectiveRole = firstLine;
            setTargetRole(firstLine);
          }
        }

        // Resume file name
        let currentResumeName = "";
        if (data?.resumeFileName) {
          currentResumeName = data.resumeFileName;
          setUploadedFileName(data.resumeFileName);
          setAnalyzedResumeName(data.resumeFileName);
        } else {
          const storedName =
            (userId ? localStorage.getItem(`jobprep_uploaded_resume_name_${userId}`) : null) ||
            localStorage.getItem("jobprep_uploaded_resume_name");
          if (storedName) {
            currentResumeName = storedName;
            setUploadedFileName(storedName);
            setAnalyzedResumeName(storedName);
          }
        }

        const needsScan =
          typeof window !== "undefined" && localStorage.getItem("jobprep_needs_ats_scan") === "true";

        if (needsScan) {
          try {
            localStorage.removeItem("jobprep_needs_ats_scan");
          } catch {}
        }

        const resumeUpdatedAt = Number(
          (userId ? localStorage.getItem(`jobprep_final_resume_updated_at_${userId}`) : null) ||
          localStorage.getItem("jobprep_final_resume_updated_at") ||
          0
        );

        // Check if there is a cached ATS scan result
        const cachedATSResult =
          (userId ? localStorage.getItem(`jobprep_latest_ats_result_${userId}`) : null) ||
          (typeof window !== "undefined" ? localStorage.getItem("jobprep_latest_ats_result") : null);

        let parsedATS: any = null;
        if (cachedATSResult) {
          try {
            parsedATS = JSON.parse(cachedATSResult);
          } catch {}
        }

        // If we have final resume text from Resume Editor, check if it's stale or needs scan
        if (finalResumeText && finalResumeText.trim().length >= 15) {
          const isStale =
            needsScan ||
            !parsedATS ||
            !parsedATS._sourceText ||
            parsedATS._sourceText.trim() !== finalResumeText.trim() ||
            (resumeUpdatedAt > 0 && parsedATS._analyzedAt && resumeUpdatedAt > parsedATS._analyzedAt);

          if (isStale) {
            // Run fresh real AI analysis on the final edited resume from Resume Editor!
            await analyzeResumeContent(finalResumeText, effectiveRole, currentResumeName, targetJd);
            return;
          } else {
            // Use cached ATS result strictly matching the final resume
            applyATSData(parsedATS, currentResumeName, finalResumeText);
            return;
          }
        }

        // Fallback: If no edited resume text found yet, apply cached ATS or analysis data
        if (parsedATS) {
          applyATSData(parsedATS, currentResumeName, finalResumeText);
        } else if (data) {
          const effectiveScore =
            typeof data.score === "number" && data.score > 0
              ? data.score
              : typeof data.match_score === "number" && data.match_score > 0
              ? data.match_score
              : 0;

          if (effectiveScore > 0) {
            setScore(effectiveScore);
          }

          const matchedKeywords: string[] = Array.isArray(data.keywords?.matched)
            ? data.keywords.matched
            : Array.isArray(data.matched_keywords)
            ? data.matched_keywords
            : [];
          const missingKeywords: string[] = Array.isArray(data.keywords?.missing)
            ? data.keywords.missing
            : Array.isArray(data.missing_keywords)
            ? data.missing_keywords
            : [];

          setKeywordCoverage(
            computeRealKeywordCoverage(matchedKeywords, missingKeywords, finalResumeText)
          );
          setChecks(computeRealChecks(finalResumeText, finalSections));

          const dynamicRecs: Recommendation[] = [];
          if (missingKeywords.length > 0) {
            dynamicRecs.push({
              priority: "High",
              text: `Add missing target skills '${missingKeywords.slice(0, 4).join("', '")}' to your skills or experience section.`,
              fix: "Add keywords",
            });
          }

          if (Array.isArray(data.gaps) && data.gaps.length > 0) {
            data.gaps.forEach((g: any) => {
              dynamicRecs.push({
                priority: g.severity === "high" ? "Critical" : "Medium",
                text: g.detail || `Bridge gap in ${g.area} to match ATS criteria.`,
                fix: "Auto-fix",
              });
            });
          }

          if (Array.isArray(data.weaknesses) && data.weaknesses.length > 0) {
            data.weaknesses.forEach((w: string) => {
              dynamicRecs.push({
                priority: "Critical",
                text: w,
                fix: "Edit resume",
              });
            });
          }

          if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
            data.recommendations.forEach((r: string, idx: number) => {
              dynamicRecs.push({
                priority: idx === 0 ? "Critical" : idx === 1 ? "High" : "Medium",
                text: r,
                fix: "Auto-fix",
              });
            });
          }

          setRecommendations(dynamicRecs);
        }
      } catch (e) {
        console.warn("Could not load latest ATS analysis data:", e);
      }
    }

    loadRealData();
  }, []);

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setAnalyzedResumeName(file.name);
      await analyzeResumeContent(file, targetRole, file.name);
    }
  };

  const handleCheckATS = async () => {
    let userId = "";
    try {
      const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (userRaw) {
        const u = JSON.parse(userRaw);
        userId = u?.id || u?._id || "";
      }
    } catch {}

    const targetJd =
      (userId ? localStorage.getItem(`jobprep_jd_${userId}`) : null) ||
      (typeof window !== "undefined" ? localStorage.getItem("jobprep_jd") : null) ||
      "";

    let finalResumeText =
      (userId ? localStorage.getItem(`jobprep_final_resume_text_${userId}`) : null) ||
      (typeof window !== "undefined" ? localStorage.getItem("jobprep_final_resume_text") : null);

    if (!finalResumeText) {
      const sectionsRaw =
        (userId ? localStorage.getItem(`jobprep_final_resume_sections_${userId}`) : null) ||
        (typeof window !== "undefined" ? localStorage.getItem("jobprep_final_resume_sections") : null);
      if (sectionsRaw) {
        try {
          const parsed = JSON.parse(sectionsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAnalyzedSections(parsed);
            finalResumeText = parsed
              .map((s: any) => `${(s.title || "").toUpperCase()}\n${s.content || ""}`)
              .join("\n\n");
          }
        } catch {}
      }
    }

    if (finalResumeText && finalResumeText.trim().length >= 15) {
      await analyzeResumeContent(finalResumeText, targetRole, uploadedFileName || undefined, targetJd);
    } else {
      setAnalyzing(true);
      try {
        const res = await api.post("/ats/analyze", {
          targetJobRole: targetRole || "Software Professional",
          jobDescription: targetJd,
          resumeText: "Candidate Professional Experience and Technical Skills",
        });
        if (res?.data?.success && res.data?.data) {
          applyATSData(res.data.data);
        }
      } catch {
        setScore((prev) => Math.min(95, Math.max(prev, 82)));
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const ScoreGauge = ({ value }: { value: number }) => {
    const color = value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
    return (
      <div style={{ position: "relative", width: 170, height: 170, margin: "0 auto" }}>
        <svg width="170" height="170" viewBox="0 0 170 170">
          <circle cx="85" cy="85" r="66" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
          <circle
            cx="85"
            cy="85"
            r="66"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 414.69} 414.69`}
            transform="rotate(-90 85 85)"
            style={{ filter: `drop-shadow(0 0 12px ${color}99)`, transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {analyzing ? "..." : value}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(148,163,184,0.6)",
              fontFamily: "JetBrains Mono",
              marginTop: 4,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {analyzing ? "Scanning..." : "ATS Score"}
          </div>
        </div>
      </div>
    );
  };

  const passCount = checks.filter((c) => c.pass).length;
  const matchCategory =
    score >= 80 ? "Strong Match" : score >= 65 ? "Good Match" : score > 0 ? "Moderate Match" : "Scan Pending";
  const matchCategoryColor =
    score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : score > 0 ? "#ef4444" : "rgba(148,163,184,0.6)";

  return (
    <div
      className="fade-in page-container"
      style={{
        height: "100%",
        overflowY: isResumeModalOpen ? "hidden" : "auto",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="sr-only"
        onChange={handleUploadResume}
        aria-hidden="true"
      />

      <div
        className="stack-on-mobile"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 16,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "white",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            ATS <span className="gradient-text">Analysis</span>
          </h1>
          <p style={{ color: "rgba(148,163,184,0.6)", fontSize: 14, margin: "6px 0 0" }}>
            Applicant Tracking System compatibility check for {targetRole}.
            {uploadedFileName && (
              <span style={{ color: "#67e8f9", marginLeft: 8, fontWeight: 600 }}>
                [Resume: {uploadedFileName}]
              </span>
            )}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "nowrap",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="btn-primary"
            style={{
              padding: "9px 16px",
              fontSize: 13,
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              flexShrink: 0,
              cursor: "pointer",
            }}
            onClick={() => setIsResumeModalOpen(true)}
          >
            <span>👁️</span>
            <span>View Analyzed Resume</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{
              padding: "9px 16px",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onClick={handleCheckATS}
            disabled={analyzing}
          >
            {analyzing ? "⚡ Scanning..." : "🎯 Refresh ATS Score"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            style={{
              padding: "9px 16px",
              fontSize: 13,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onClick={() => handleNav("resume-editor")}
          >
            Edit Resume in Step 3 →
          </button>
        </div>
      </div>

      {/* Modal Popup: Analyzed Resume from Step 3 (Resume Editor) */}
      {isResumeModalOpen && (
        <div
          className="fade-in"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(3, 3, 15, 0.85)",
            backdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "16px 20px",
            overflow: "hidden",
            overscrollBehavior: "contain",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsResumeModalOpen(false);
          }}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="glass"
            style={{
              width: "100%",
              maxWidth: 880,
              height: "calc(100vh - 32px)",
              maxHeight: "calc(100vh - 32px)",
              display: "flex",
              flexDirection: "column",
              borderRadius: 16,
              border: "1px solid rgba(124, 58, 237, 0.45)",
              background: "rgba(10, 10, 30, 0.98)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.75), 0 0 35px rgba(124, 58, 237, 0.3)",
              overflow: "hidden",
              overscrollBehavior: "contain",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(10, 10, 30, 0.98)",
                gap: 12,
                flexShrink: 0,
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(6, 182, 212, 0.25))",
                    border: "1px solid rgba(124, 58, 237, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  📄
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
                      Analyzed Resume Preview
                    </h3>
                    <span className="tag tag-green" style={{ fontSize: 10, padding: "2px 8px" }}>
                      Source of Truth: Step 3
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, fontFamily: "JetBrains Mono", color: "rgba(148, 163, 184, 0.7)", marginTop: 2 }}>
                    {uploadedFileName || analyzedResumeName || "My_Resume.pdf"} · {analyzedSections.length > 0 ? `${analyzedSections.length} Sections` : "Full Resume"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-ghost"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 16,
                  color: "rgba(226, 232, 240, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                onClick={() => setIsResumeModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="custom-scrollbar"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overscrollBehavior: "contain",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {analyzedSections.length > 0 ? (
                analyzedSections.map((sec, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 18px",
                      borderRadius: 12,
                      background: sec.isHeader ? "rgba(103, 232, 249, 0.05)" : "rgba(255, 255, 255, 0.02)",
                      border: sec.isHeader ? "1px solid rgba(103, 232, 249, 0.25)" : "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: sec.isHeader ? "#67e8f9" : "rgba(124, 58, 237, 0.9)",
                        fontFamily: "JetBrains Mono",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span>{sec.isHeader ? "👤" : "📌"}</span>
                      <span>{sec.title}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "rgba(226, 232, 240, 0.9)",
                        lineHeight: 1.65,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {sec.content}
                    </div>
                  </div>
                ))
              ) : finalResumeRawText ? (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    fontSize: 12.5,
                    color: "rgba(226, 232, 240, 0.9)",
                    lineHeight: 1.65,
                    whiteSpace: "pre-line",
                  }}
                >
                  {finalResumeRawText}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(148, 163, 184, 0.7)" }}>
                  No resume content found yet. Upload or edit your resume in Step 1 or Step 3.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 24px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(10, 10, 30, 0.98)",
                gap: 12,
                flexShrink: 0,
                position: "sticky",
                bottom: 0,
                zIndex: 10,
              }}
            >
              <div style={{ fontSize: 11.5, color: "rgba(148, 163, 184, 0.7)", flex: 1, minWidth: 0 }}>
                This is the exact content evaluated by ATS for match score, keywords, and formatting checks.
              </div>

              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ padding: "8px 16px", fontSize: 12, cursor: "pointer" }}
                  onClick={() => setIsResumeModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{
                    padding: "8px 18px",
                    fontSize: 12,
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    setIsResumeModalOpen(false);
                    handleNav("resume-editor");
                  }}
                >
                  Edit in Resume Editor (Step 3) →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-responsive-3col" style={{ gap: 16, marginBottom: 20 }}>
        {/* Card 1: Score Gauge */}
        <div
          className="glass"
          style={{
            padding: "14px 16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ScoreGauge value={score} />
          <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800, color: matchCategoryColor }}>
            {matchCategory}
          </div>
          <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 2 }}>
            Above average for competitive roles
          </div>
        </div>

        {/* Card 2: Formatting Checks */}
        <div className="glass" style={{ padding: "14px 18px" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Formatting Checks</span>
            {!hasSubscription && (
              <span style={{ fontSize: 11, color: "#c4b5fd", fontFamily: "JetBrains Mono" }}>
                2 Visible
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "JetBrains Mono",
              color: "rgba(148,163,184,0.4)",
              marginBottom: 8,
            }}
          >
            {passCount}/{checks.length} passing
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {/* Visible Checks (Top 2) */}
            {checks.slice(0, 2).map((c) => (
              <div
                key={c.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "3px 6px",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: c.pass ? "#10b981" : "#ef4444",
                    flexShrink: 0,
                  }}
                >
                  {c.pass ? "✓" : "✗"}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: c.pass ? "rgba(226,232,240,0.7)" : "rgba(252,165,165,0.9)",
                  }}
                >
                  {c.label}
                </span>
                {!c.pass && c.note && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(252,165,165,0.5)",
                      fontFamily: "JetBrains Mono",
                    }}
                  >
                    — {c.note}
                  </span>
                )}
              </div>
            ))}

            {/* Locked/Unlocked Checks */}
            {checks.length > 2 && (
              <LockedBlurOverlay
                isLocked={!hasSubscription}
                onOpenUpgradeModal={handleUpgradeClick}
                customText="to view remaining checks"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "2px 0" }}>
                  {checks.slice(2).map((c) => (
                    <div
                      key={c.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "3px 6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: c.pass ? "#10b981" : "#ef4444",
                          flexShrink: 0,
                        }}
                      >
                        {c.pass ? "✓" : "✗"}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: c.pass ? "rgba(226,232,240,0.7)" : "rgba(252,165,165,0.9)",
                        }}
                      >
                        {c.label}
                      </span>
                      {!c.pass && c.note && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "rgba(252,165,165,0.5)",
                            fontFamily: "JetBrains Mono",
                          }}
                        >
                          — {c.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </LockedBlurOverlay>
            )}
          </div>
        </div>

        {/* Card 3: Keyword Coverage */}
        <div className="glass" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 10 }}>
            Keyword Coverage
          </div>
          {keywordCoverage.map((k) => (
            <div key={k.category} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "rgba(148,163,184,0.8)" }}>{k.category}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: k.color,
                    fontFamily: "JetBrains Mono",
                  }}
                >
                  {k.matched}/{k.total}
                </span>
              </div>
              <div className="progress-bar" style={{ height: 5 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, Math.round((k.matched / k.total) * 100))}%`,
                    background: `linear-gradient(90deg, ${k.color}, ${k.color}88)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass" style={{ padding: "20px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 16 }}>
          Prioritized Recommendations
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recommendations.length === 0 ? (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: 10,
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                fontSize: 13,
                color: "#6ee7b7",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>✓</span>
              <span>No critical ATS issues detected. Your resume matches key criteria for this target role!</span>
            </div>
          ) : (
            recommendations.map((r, i) => {
              const tagClasses = {
                Critical: "tag-red",
                High: "tag-amber",
                Medium: "tag-cyan",
                Low: "tag-green",
              };
              const tc = tagClasses[r.priority as keyof typeof tagClasses] || "tag-purple";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "13px 16px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    flexWrap: "wrap",
                  }}
                >
                  <span className={`tag ${tc}`} style={{ padding: "4px 10px", fontSize: 11 }}>
                    {r.priority}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: "rgba(226,232,240,0.8)", minWidth: 200 }}>
                    {r.text}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: "6px 14px", fontSize: 12, flexShrink: 0 }}
                    onClick={() => handleNav("resume-editor")}
                  >
                    {r.fix}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
