"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Screen } from "@/types";
import LockedBlurOverlay from "@/components/LockedBlurOverlay";
import api from "@/lib/axios";

export interface ResumeEditorProps {
  onNavigate?: (s: Screen) => void;
  hasActiveSubscription?: boolean;
  onOpenUpgradeModal?: () => void;
}

export interface ResumeSectionItem {
  title: string;
  isHeader?: boolean;
  content: string;
}

export type Status = "pending" | "accepted" | "rejected";

export interface Suggestion {
  id: number;
  section: string;
  type: "Quantify" | "Impact" | "Action Verbs" | "Keywords" | "Alignment" | "Detail" | (string & {});
  status: Status;
  original: string;
  suggested: string;
  impact: "high" | "medium" | "low";
}

/**
 * Dynamically analyzes the REAL resume sections from the Resume Preview
 * and generates targeted, AI-powered suggestions for:
 * - Content & Quantification (metrics, scale, outcomes)
 * - Grammar & Action Verbs (replacing passive/weak verbs)
 * - Skills & ATS Keywords (adding missing in-demand skills from JD / role)
 * - Summary & Role Alignment
 * - Project / Experience technical depth
 */
export function generateSuggestionsFromResume(
  sections: ResumeSectionItem[],
  analysisData?: any
): Suggestion[] {
  if (!sections || sections.length === 0) return [];

  const suggestions: Suggestion[] = [];
  let nextId = 1;

  const missingKeywords: string[] = Array.isArray(analysisData?.keywords?.missing)
    ? analysisData.keywords.missing
    : [];
  const aiRawSuggestions = Array.isArray(analysisData?.suggestions)
    ? analysisData.suggestions
    : [];

  // Identify sections from the user's real resume
  const expSection = sections.find(
    (s) => !s.isHeader && s.title.toLowerCase().match(/experience|work|employment|career|history/)
  );
  const projSection = sections.find(
    (s) => !s.isHeader && s.title.toLowerCase().match(/project|portfolio|work/)
  );
  const skillsSection = sections.find(
    (s) => !s.isHeader && s.title.toLowerCase().match(/skill|technolog|competenc|tool/)
  );
  const summarySection = sections.find(
    (s) => !s.isHeader && s.title.toLowerCase().match(/summary|profile|about|objective|overview/)
  );

  const extractLines = (content: string) => {
    if (!content) return [];
    return content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length >= 15 && !l.match(/^https?:\/\//i) && !l.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i));
  };

  const expLines = expSection ? extractLines(expSection.content) : [];
  const projLines = projSection ? extractLines(projSection.content) : [];

  // 1. CONTENT / QUANTIFY (Identify real bullets lacking numbers, metrics or quantifiable outcomes)
  const nonMetricLines = [...expLines, ...projLines].filter((line) => {
    const clean = line.replace(/^[•\-\*▪▫]\s*/, "");
    return clean.length >= 20 && !clean.match(/\b\d+[%kKmM]?\b/);
  });

  if (nonMetricLines.length > 0) {
    const rawLine = nonMetricLines[0];
    const cleanLine = rawLine.replace(/^[•\-\*▪▫]\s*/, "").replace(/\.+$/, "");
    const cleanAction = cleanLine.replace(/^(responsible for|worked on|developed|built|handled|managed|created|assisted in|participated in)\s*/i, "");

    const suggested = `Optimized and scaled ${cleanAction}, achieving a 38% increase in system efficiency and reducing turnaround time by 42%.`;

    suggestions.push({
      id: nextId++,
      section: expSection ? expSection.title : "Experience",
      type: "Quantify",
      status: "pending",
      original: rawLine.replace(/^[•\-\*▪▫]\s*/, ""),
      suggested,
      impact: "high",
    });
  }

  // 2. SKILLS & ATS KEYWORDS (Inspect actual skills list and incorporate missing/recommended keywords)
  if (skillsSection && skillsSection.content.trim().length > 3) {
    const originalSkills = skillsSection.content
      .split(/\r?\n/)[0]
      .replace(/^[•\-\*▪▫]\s*/, "")
      .trim();

    let targetAdditions: string[] = [];
    if (missingKeywords.length > 0) {
      targetAdditions = missingKeywords
        .filter((k) => k && typeof k === "string" && !originalSkills.toLowerCase().includes(k.toLowerCase()))
        .slice(0, 4);
    }

    if (targetAdditions.length === 0) {
      const candidates = ["TypeScript", "RESTful APIs", "CI/CD", "Docker", "Unit Testing", "Cloud Platforms (AWS/GCP)"];
      targetAdditions = candidates
        .filter((c) => !originalSkills.toLowerCase().includes(c.toLowerCase()))
        .slice(0, 3);
    }

    if (targetAdditions.length > 0) {
      suggestions.push({
        id: nextId++,
        section: skillsSection.title,
        type: "Keywords",
        status: "pending",
        original: originalSkills,
        suggested: `${originalSkills}, ${targetAdditions.join(", ")}`,
        impact: "high",
      });
    }
  }

  // 3. GRAMMAR & STRONG ACTION VERBS (Detect passive or weak phrasing in real resume text)
  const passivePatterns = [
    { regex: /\b(was responsible for|responsible for|tasked with)\b/i, rep: "Orchestrated and delivered" },
    { regex: /\b(worked on|worked with)\b/i, rep: "Spearheaded the development and deployment of" },
    { regex: /\b(helped with|assisted with|assisted in)\b/i, rep: "Partnered cross-functionally to engineer" },
    { regex: /\b(handled)\b/i, rep: "Managed, monitored, and scaled" },
    { regex: /\b(made|created)\b/i, rep: "Architected and delivered" },
  ];

  let grammarAdded = false;
  for (const line of [...expLines, ...projLines]) {
    const clean = line.replace(/^[•\-\*▪▫]\s*/, "").trim();
    for (const pat of passivePatterns) {
      if (pat.regex.test(clean) && !suggestions.some((s) => s.original === clean)) {
        const enhanced = clean.replace(pat.regex, pat.rep);
        suggestions.push({
          id: nextId++,
          section: expSection ? expSection.title : "Experience",
          type: "Action Verbs",
          status: "pending",
          original: clean,
          suggested: enhanced,
          impact: "medium",
        });
        grammarAdded = true;
        break;
      }
    }
    if (grammarAdded) break;
  }

  if (!grammarAdded && nonMetricLines.length > 1) {
    const rawLine = nonMetricLines[1];
    const cleanLine = rawLine.replace(/^[•\-\*▪▫]\s*/, "").replace(/\.+$/, "");
    suggestions.push({
      id: nextId++,
      section: expSection ? expSection.title : "Experience",
      type: "Action Verbs",
      status: "pending",
      original: rawLine.replace(/^[•\-\*▪▫]\s*/, ""),
      suggested: `Spearheaded ${cleanLine.replace(/^(responsible for|worked on|developed|built|handled)\s*/i, "")}, upholding strict code quality benchmarks and architectural standards.`,
      impact: "medium",
    });
  }

  // 4. SUMMARY & ROLE ALIGNMENT (Improve candidate summary based on actual summary and target role)
  if (summarySection && summarySection.content.trim().length > 15) {
    const origSummary = summarySection.content.split(/\r?\n/)[0].replace(/^[•\-\*▪▫]\s*/, "").trim();
    const candidateJobTitle = analysisData?.parsedResume?.jobTitle || "Software Engineer";
    const years = analysisData?.parsedResume?.totalExperienceYears
      ? `${analysisData.parsedResume.totalExperienceYears}+ years of experience`
      : "proven industry experience";

    const enhancedSummary = `Results-driven ${candidateJobTitle} with ${years} engineering resilient, scalable solutions. Expert in high-performance system design, modern architectures, and delivering measurable business impact.`;

    suggestions.push({
      id: nextId++,
      section: summarySection.title,
      type: "Alignment",
      status: "pending",
      original: origSummary,
      suggested: enhancedSummary,
      impact: "medium",
    });
  }

  // 5. PROJECTS / IMPACT & DEPTH
  if (projLines.length > 0) {
    const projLine = projLines[0].replace(/^[•\-\*▪▫]\s*/, "");
    if (!suggestions.some((s) => s.original === projLine)) {
      suggestions.push({
        id: nextId++,
        section: projSection ? projSection.title : "Projects",
        type: "Impact",
        status: "pending",
        original: projLine,
        suggested: `Architected and deployed ${projLine}, incorporating automated testing, CI/CD pipelines, and high-availability design principles.`,
        impact: "high",
      });
    }
  } else if (expLines.length > 2) {
    const extraLine = expLines[2].replace(/^[•\-\*▪▫]\s*/, "");
    if (!suggestions.some((s) => s.original === extraLine)) {
      suggestions.push({
        id: nextId++,
        section: expSection ? expSection.title : "Experience",
        type: "Impact",
        status: "pending",
        original: extraLine,
        suggested: `Engineered ${extraLine}, reducing production incidents by 34% and accelerating release turnaround across sprint cycles.`,
        impact: "high",
      });
    }
  }

  // 6. Incorporate raw AI analysis suggestions from Step 2 if fewer than 5
  if (suggestions.length < 5 && aiRawSuggestions.length > 0) {
    for (const ai of aiRawSuggestions) {
      if (suggestions.length >= 5) break;
      if (!suggestions.some((s) => s.suggested === ai.text)) {
        const targetSec =
          sections.find((s) => !s.isHeader && (s.title.toLowerCase().includes("experience") || s.title.toLowerCase().includes("project"))) ||
          sections.find((s) => !s.isHeader) ||
          sections[0];

        const targetLines = extractLines(targetSec?.content || "");
        const unusedLine = targetLines.find(
          (l) => !suggestions.some((s) => s.original === l.replace(/^[•\-\*▪▫]\s*/, ""))
        );

        const origText = unusedLine
          ? unusedLine.replace(/^[•\-\*▪▫]\s*/, "")
          : targetSec?.content.slice(0, 65) || "Current resume point";

        suggestions.push({
          id: nextId++,
          section: targetSec ? targetSec.title : "Experience",
          type: (ai.category as any) || "Impact",
          status: "pending",
          original: origText,
          suggested: ai.text,
          impact: (ai.impact as any) || "high",
        });
      }
    }
  }

  return suggestions;
}

export function getSectionMeta(title: string, isHeader?: boolean) {
  if (isHeader) {
    return { label: "Personal Information & Header", icon: "👤", color: "#67e8f9" };
  }
  const t = (title || "").toLowerCase();
  if (t.includes("summary") || t.includes("profile") || t.includes("objective") || t.includes("about")) {
    return { label: "Professional Summary", icon: "🎯", color: "#a78bfa" };
  }
  if (t.includes("experience") || t.includes("employment") || t.includes("work") || t.includes("career")) {
    return { label: "Work Experience", icon: "💼", color: "#60a5fa" };
  }
  if (t.includes("project")) {
    return { label: "Projects & Portfolios", icon: "🚀", color: "#34d399" };
  }
  if (t.includes("skill") || t.includes("technolog") || t.includes("competenc") || t.includes("tool")) {
    return { label: "Technical Skills", icon: "⚡", color: "#f472b6" };
  }
  if (t.includes("education") || t.includes("academic") || t.includes("degree") || t.includes("university")) {
    return { label: "Education & Academics", icon: "🎓", color: "#fbbf24" };
  }
  if (t.includes("certif") || t.includes("license") || t.includes("course") || t.includes("award")) {
    return { label: "Certifications & Credentials", icon: "🏆", color: "#c084fc" };
  }
  return { label: "Resume Section", icon: "📄", color: "#94a3b8" };
}

export default function ResumeEditor({
  onNavigate,
  hasActiveSubscription = false,
  onOpenUpgradeModal,
}: ResumeEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editorSections, setEditorSections] = useState<ResumeSectionItem[]>([]);
  const [baseSections, setBaseSections] = useState<ResumeSectionItem[]>([]);
  const [originalAiSections, setOriginalAiSections] = useState<ResumeSectionItem[]>([]);
  const [rawAnalysisData, setRawAnalysisData] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [version, setVersion] = useState(1);
  const [saved, setSaved] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "docx" | "txt">("pdf");
  const [resumeFileName, setResumeFileName] = useState("My_Resume.pdf");
  const [candidateName, setCandidateName] = useState("Candidate");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(() => {
    if (Boolean(hasActiveSubscription)) return true;
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        if (u?.hasActiveSubscription || u?.isSubscribed || u?.plan) return true;
      } catch { }
    }
    return false;
  });

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
      } catch { }
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

  // Load real resume sections and analysis from previous steps
  useEffect(() => {
    async function loadRealResume() {
      try {
        let userId = "";
        try {
          const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
          if (userRaw) {
            const u = JSON.parse(userRaw);
            userId = u?.id || u?._id || "";
          }
        } catch { }

        // 1. Fetch saved analysis from backend as the primary single source of truth
        let activeData: any = null;
        try {
          const res = await api.get("/ai-analysis/latest");
          if (res?.data?.success && res.data?.data) {
            activeData = res.data.data;
          }
        } catch (e) {
          console.warn("Backend /ai-analysis/latest fetch skipped:", e);
        }

        // 2. Fall back to local storage if backend call is empty or offline
        if (!activeData || !activeData.resumeSections || activeData.resumeSections.length === 0) {
          const userStored =
            (userId ? localStorage.getItem(`jobprep_latest_analysis_${userId}`) : null) ||
            (typeof window !== "undefined" ? localStorage.getItem("jobprep_latest_analysis") : null);
          if (userStored) {
            try {
              activeData = JSON.parse(userStored);
            } catch { }
          }
        }

        // 3. Extract the real AI-analyzed sections
        const aiSections: ResumeSectionItem[] =
          activeData?.resumeSections && Array.isArray(activeData.resumeSections) && activeData.resumeSections.length > 0
            ? activeData.resumeSections.map((s: any) => ({
              title: s.title || "Section",
              isHeader: Boolean(s.isHeader),
              content: s.content || "",
            }))
            : [];

        if (aiSections.length > 0) {
          setOriginalAiSections(aiSections);
          setRawAnalysisData(activeData);

          const analysisId = activeData?.id || activeData?._id || activeData?.createdAt || "latest";
          const savedAnalysisId = userId
            ? localStorage.getItem(`jobprep_final_analysis_id_${userId}`)
            : localStorage.getItem("jobprep_final_analysis_id");

          let sectionsToUse = aiSections;

          // Only keep previously edited draft if it belongs to this exact analysis instance
          if (savedAnalysisId === analysisId) {
            const savedFinalRaw =
              (userId ? localStorage.getItem(`jobprep_final_resume_sections_${userId}`) : null) ||
              (typeof window !== "undefined" ? localStorage.getItem("jobprep_final_resume_sections") : null);
            if (savedFinalRaw) {
              try {
                const parsed = JSON.parse(savedFinalRaw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  sectionsToUse = parsed;
                }
              } catch { }
            }
          } else {
            // New AI analysis detected: clear old outdated sections and set current analysis ID
            if (userId) {
              localStorage.setItem(`jobprep_final_analysis_id_${userId}`, analysisId);
              localStorage.removeItem(`jobprep_final_resume_sections_${userId}`);
              localStorage.removeItem(`jobprep_editor_suggestion_statuses_${userId}`);
            }
            localStorage.setItem("jobprep_final_analysis_id", analysisId);
            localStorage.removeItem("jobprep_final_resume_sections");
            localStorage.removeItem("jobprep_editor_suggestion_statuses");
          }

          setBaseSections(sectionsToUse);
          setEditorSections(sectionsToUse);

          // Extract candidate name from header section or parsed resume
          const header = sectionsToUse.find((s) => s.isHeader);
          const cName =
            activeData?.parsedResume?.candidateName ||
            header?.title ||
            "Candidate";
          setCandidateName(cName);

          const rName =
            activeData?.resumeFileName ||
            (userId ? localStorage.getItem(`jobprep_uploaded_resume_name_${userId}`) : null) ||
            localStorage.getItem("jobprep_uploaded_resume_name") ||
            `${cName.replace(/\s+/g, "_")}_Resume.pdf`;
          setResumeFileName(rName);

          // Generate dynamic, AI-powered suggestions based on the original AI resume sections
          const dynamicSuggestions = generateSuggestionsFromResume(aiSections.length > 0 ? aiSections : sectionsToUse, activeData);

          // Restore saved suggestion statuses from localStorage
          let savedStatusesMap: Record<string, { status: Status; customSuggested?: string }> = {};
          if (savedAnalysisId === analysisId) {
            try {
              const rawStatuses =
                (userId ? localStorage.getItem(`jobprep_editor_suggestion_statuses_${userId}`) : null) ||
                localStorage.getItem("jobprep_editor_suggestion_statuses");
              if (rawStatuses) {
                savedStatusesMap = JSON.parse(rawStatuses);
              }
            } catch { }
          }

          const restoredSuggestions = dynamicSuggestions.map((s) => {
            const contentKey = `${s.section}:::${s.original.trim()}`;
            const idKey = `id_${s.id}`;
            const saved = savedStatusesMap[contentKey] || savedStatusesMap[idKey];
            if (saved) {
              return {
                ...s,
                status: saved.status,
                suggested: saved.customSuggested || s.suggested,
              };
            }
            return s;
          });

          setSuggestions(restoredSuggestions);
        } else {
          setBaseSections([]);
          setEditorSections([]);
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Failed to load real resume data for editor:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRealResume();
  }, []);

  // Sync final edited resume to localStorage whenever editorSections changes
  useEffect(() => {
    if (!editorSections || editorSections.length === 0) return;
    try {
      let userId = "";
      try {
        const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (userRaw) {
          const u = JSON.parse(userRaw);
          userId = u?.id || u?._id || "";
        }
      } catch { }

      const fullText = editorSections
        .map((sec) => `${sec.title.toUpperCase()}\n${sec.content}`)
        .join("\n\n");

      const now = String(Date.now());
      if (userId) {
        localStorage.setItem(`jobprep_final_resume_sections_${userId}`, JSON.stringify(editorSections));
        localStorage.setItem(`jobprep_final_resume_text_${userId}`, fullText);
        localStorage.setItem(`jobprep_final_resume_updated_at_${userId}`, now);
      }
      localStorage.setItem("jobprep_final_resume_sections", JSON.stringify(editorSections));
      localStorage.setItem("jobprep_final_resume_text", fullText);
      localStorage.setItem("jobprep_final_resume_updated_at", now);
      localStorage.setItem("jobprep_needs_ats_scan", "true");
    } catch (e) {
      console.warn("Could not sync final resume to localStorage:", e);
    }
  }, [editorSections]);

  const persistSuggestionStatuses = (updatedSuggestions: Suggestion[]) => {
    try {
      let userId = "";
      try {
        const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (userRaw) {
          const u = JSON.parse(userRaw);
          userId = u?.id || u?._id || "";
        }
      } catch { }

      const mapToSave: Record<string, { status: Status; customSuggested?: string }> = {};
      updatedSuggestions.forEach((s) => {
        const contentKey = `${s.section}:::${s.original.trim()}`;
        const idKey = `id_${s.id}`;
        const data = { status: s.status, customSuggested: s.suggested };
        mapToSave[contentKey] = data;
        mapToSave[idKey] = data;
      });

      if (userId) {
        localStorage.setItem(`jobprep_editor_suggestion_statuses_${userId}`, JSON.stringify(mapToSave));
      }
      localStorage.setItem("jobprep_editor_suggestion_statuses", JSON.stringify(mapToSave));
    } catch (e) {
      console.warn("Failed to persist suggestion statuses:", e);
    }
  };

  const applySuggestionsToSections = (currentSuggestions: Suggestion[]) => {
    const sourceSections = originalAiSections.length > 0 ? originalAiSections : baseSections;
    let updatedSecs = sourceSections.map((sec) => ({ ...sec }));

    currentSuggestions.forEach((s) => {
      if (s.status === "accepted") {
        let applied = false;

        updatedSecs = updatedSecs.map((sec) => {
          if (sec.content.includes(s.suggested)) {
            applied = true;
            return sec;
          }
          if (sec.content.includes(s.original)) {
            applied = true;
            return {
              ...sec,
              content: sec.content.replace(s.original, s.suggested),
            };
          }
          return sec;
        });

        // Fallback: If exact substring was not found, append suggestion bullet into matching section
        if (!applied) {
          const matchSec = updatedSecs.find((sec) =>
            sec.title.toLowerCase().includes(s.section.toLowerCase())
          );
          if (matchSec && !matchSec.content.includes(s.suggested)) {
            matchSec.content = `${matchSec.content}\n• ${s.suggested}`;
          }
        }
      }
    });

    setEditorSections(updatedSecs);
  };

  const updateStatus = (id: number, status: Status) => {
    const updated = suggestions.map((s) => (s.id === id ? { ...s, status } : s));
    setSuggestions(updated);
    applySuggestionsToSections(updated);
    persistSuggestionStatuses(updated);
  };

  const startEdit = (s: Suggestion) => {
    setEditing(s.id);
    setEditText(s.suggested);
  };

  const saveEdit = (id: number) => {
    const updated = suggestions.map((s) =>
      s.id === id ? { ...s, suggested: editText, status: "accepted" as Status } : s
    );
    setSuggestions(updated);
    applySuggestionsToSections(updated);
    persistSuggestionStatuses(updated);
    setEditing(null);
  };

  const handleSectionContentChange = (index: number, newContent: string) => {
    setEditorSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], content: newContent };
      return next;
    });
    setBaseSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], content: newContent };
      return next;
    });
    setOriginalAiSections((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], content: newContent };
      }
      return next;
    });
  };

  const handleSectionTitleChange = (index: number, newTitle: string) => {
    setEditorSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], title: newTitle };
      return next;
    });
    setBaseSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], title: newTitle };
      return next;
    });
    setOriginalAiSections((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], title: newTitle };
      }
      return next;
    });
    if (editorSections[index]?.isHeader) {
      setCandidateName(newTitle);
    }
  };

  const handleAddBulletToSection = (index: number) => {
    setEditorSections((prev) => {
      const next = [...prev];
      const cur = next[index]?.content || "";
      next[index] = { ...next[index], content: cur ? `${cur}\n• ` : "• " };
      return next;
    });
    setBaseSections((prev) => {
      const next = [...prev];
      const cur = next[index]?.content || "";
      next[index] = { ...next[index], content: cur ? `${cur}\n• ` : "• " };
      return next;
    });
  };

  const handleAddSection = () => {
    const newSec: ResumeSectionItem = {
      title: "ADDITIONAL SECTION",
      content: "• Highlight key accomplishments, leadership, or specialized competencies",
    };
    setEditorSections((prev) => [...prev, newSec]);
    setBaseSections((prev) => [...prev, newSec]);
  };

  const handleRemoveSection = (index: number) => {
    if (editorSections[index]?.isHeader) {
      alert("The personal contact header cannot be removed.");
      return;
    }
    setEditorSections((prev) => prev.filter((_, i) => i !== index));
    setBaseSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 1 || targetIndex >= editorSections.length) return;
    setEditorSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setBaseSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleResetToAiAnalysis = () => {
    if (originalAiSections.length > 0) {
      setBaseSections(originalAiSections.map((s) => ({ ...s })));
      setEditorSections(originalAiSections.map((s) => ({ ...s })));
      const dynamicSuggestions = generateSuggestionsFromResume(originalAiSections, rawAnalysisData);
      setSuggestions(dynamicSuggestions);
      const header = originalAiSections.find((s) => s.isHeader);
      if (header?.title) setCandidateName(header.title);
    }
  };

  const pendingSuggestionsCount = suggestions.filter((s) => s.status === "pending").length;
  const acceptedSuggestionsCount = suggestions.filter((s) => s.status === "accepted").length;

  const handleDownload = () => {
    setSaved(true);
    setVersion((v) => v + 1);

    const nextVer = version + 1;
    const cleanBaseName = candidateName.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
    const fileName = `${cleanBaseName || "Resume"}_v${nextVer}`;

    if (exportFormat === "txt") {
      const fullText = editorSections
        .map((sec) => `${sec.title.toUpperCase()}\n${sec.content}`)
        .join("\n\n----------------------------------------\n\n");
      const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === "docx") {
      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${fileName}</title></head>
        <body style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111827; padding: 20px;">
          ${editorSections
          .map(
            (sec) =>
              `<h2 style="color: #4f46e5; border-bottom: 2px solid #6366f1; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px;">${sec.title}</h2><p style="white-space: pre-wrap; margin-bottom: 12px;">${sec.content}</p>`
          )
          .join("")}
        </body>
        </html>
      `;
      const blob = new Blob([docHtml], { type: "application/msword;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // PDF print / save window
      const printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${fileName}</title>
            <style>
              body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
              h1 { color: #0f172a; margin-bottom: 4px; font-size: 26px; font-weight: 800; }
              .sub-header { font-size: 12px; color: #64748b; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; }
              .section-title { font-size: 13px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 20px; margin-bottom: 6px; }
              .section-content { font-size: 13px; color: #334155; white-space: pre-wrap; margin-bottom: 14px; }
            </style>
          </head>
          <body>
            ${editorSections
            .map((sec) =>
              sec.isHeader
                ? `<h1>${sec.title}</h1><div class="sub-header">${sec.content}</div>`
                : `<div class="section-title">${sec.title}</div><div class="section-content">${sec.content}</div>`
            )
            .join("")}
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
          </html>
        `);
        printWin.document.close();
      }
    }

    setTimeout(() => setSaved(false), 2500);
  };

  const formatOptions = [
    {
      id: "pdf" as const,
      label: "PDF Document",
      ext: ".pdf",
      icon: "📄",
      color: "#ef4444",
      desc: "Print-ready vector PDF file",
    },
    {
      id: "docx" as const,
      label: "Microsoft Word",
      ext: ".docx",
      icon: "📘",
      color: "#3b82f6",
      desc: "Editable DOCX file for Word",
    },
    {
      id: "txt" as const,
      label: "Plain Text",
      ext: ".txt",
      icon: "📃",
      color: "#a78bfa",
      desc: "Clean text for ATS software",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full min-h-[450px] flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="size-8 animate-spin text-violet-400" />
        <p className="text-sm font-medium">Loading Real Resume &amp; AI Suggestions...</p>
      </div>
    );
  }

  return (
    <div
      className="fade-in page-container"
      style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div
        className="stack-on-mobile"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
          flexShrink: 0,
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "white",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Step 3: Resume <span className="gradient-text">Editor &amp; Refactor</span>
          </h1>
          <p style={{ color: "rgba(148,163,184,0.6)", fontSize: 14, margin: "6px 0 0" }}>
            Refactor and tailor your existing resume with AI-driven suggestions and live real-time editing.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            style={{ padding: "9px 18px", fontSize: 13 }}
            onClick={() => {
              try {
                let userId = "";
                const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
                if (userRaw) {
                  const u = JSON.parse(userRaw);
                  userId = u?.id || u?._id || "";
                }
                const fullText = editorSections
                  .map((sec) => `${sec.title.toUpperCase()}\n${sec.content}`)
                  .join("\n\n");
                if (userId) {
                  localStorage.setItem(`jobprep_final_resume_sections_${userId}`, JSON.stringify(editorSections));
                  localStorage.setItem(`jobprep_final_resume_text_${userId}`, fullText);
                }
                localStorage.setItem("jobprep_final_resume_sections", JSON.stringify(editorSections));
                localStorage.setItem("jobprep_final_resume_text", fullText);
                localStorage.setItem("jobprep_needs_ats_scan", "true");
              } catch { }
              handleNav("ats-analysis");
            }}
          >
            Step 4: Check ATS Score →
          </button>

          {/* Custom Glassmorphic Split Dropdown for Save & Download */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "rgba(13, 13, 40, 0.88)",
                border: "1px solid rgba(124, 58, 237, 0.45)",
                borderRadius: 12,
                padding: "4px",
                boxShadow:
                  "0 8px 24px rgba(0, 0, 0, 0.45), 0 0 20px rgba(124, 58, 237, 0.25)",
                backdropFilter: "blur(12px)",
                gap: 6,
              }}
            >
              {/* Format Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255, 255, 255, 0.07)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 8,
                  padding: "7px 12px",
                  color: "#e2e8f0",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: 14 }}>
                  {formatOptions.find((f) => f.id === exportFormat)?.icon}
                </span>
                <span style={{ color: "#c4b5fd", fontFamily: "JetBrains Mono" }}>
                  {exportFormat.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(148, 163, 184, 0.7)",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Save & Export Button */}
              <button
                type="button"
                className="btn-primary"
                style={{
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 8,
                  boxShadow: "0 0 16px rgba(124, 58, 237, 0.5)",
                }}
                onClick={handleDownload}
                disabled={editorSections.length === 0}
              >
                <span>💾</span>
                <span>
                  {saved ? `✓ Saved v${version}!` : `Save & Export (${exportFormat.toUpperCase()})`}
                </span>
              </button>
            </div>

            {/* Floating Glass Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 99,
                  }}
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  className="fade-in glass"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 100,
                    width: 250,
                    background: "#0d0d2b",
                    border: "1px solid rgba(124, 58, 237, 0.5)",
                    borderRadius: 14,
                    padding: 8,
                    boxShadow:
                      "0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(124, 58, 237, 0.4)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(148, 163, 184, 0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      padding: "6px 10px 4px",
                      fontFamily: "JetBrains Mono",
                    }}
                  >
                    Select Export Format
                  </div>

                  {formatOptions.map((opt) => {
                    const isSelected = exportFormat === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setExportFormat(opt.id);
                          setDropdownOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 10,
                          cursor: "pointer",
                          background: isSelected ? "rgba(124, 58, 237, 0.22)" : "transparent",
                          border: isSelected
                            ? "1px solid rgba(124, 58, 237, 0.4)"
                            : "1px solid transparent",
                          transition: "all 0.15s ease",
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: `${opt.color}20`,
                            border: `1px solid ${opt.color}40`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            flexShrink: 0,
                          }}
                        >
                          {opt.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                              {opt.label}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                color: opt.color,
                                fontFamily: "JetBrains Mono",
                                fontWeight: 600,
                              }}
                            >
                              {opt.ext}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(148, 163, 184, 0.7)" }}>
                            {opt.desc}
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ color: "#10b981", fontSize: 14, fontWeight: 800 }}>✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {editorSections.length === 0 ? (
        <div
          className="glass"
          style={{
            padding: "50px 30px",
            textAlign: "center",
            maxWidth: 620,
            margin: "40px auto",
            borderRadius: 20,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 10 }}>
            No Resume Found to Edit
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "rgba(148,163,184,0.75)",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Please complete Step 1 by uploading your resume and target job description. The AI will then extract your real resume sections and generate customized suggestions.
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: "11px 24px", fontSize: 14 }}
            onClick={() => handleNav("job-resume")}
          >
            ← Go to Step 1: Upload Job &amp; Resume
          </button>
        </div>
      ) : (
        <div
          className="grid-responsive-2col analysis-grid-layout"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            height: "calc(100vh - 170px)",
            maxHeight: "calc(100vh - 170px)",
            alignItems: "stretch",
          }}
        >
          {/* LEFT — AI Suggestions & Smart Refactor */}
          <div
            className="custom-scrollbar analysis-col"
            style={{
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              paddingRight: 8,
              height: "calc(100vh - 170px)",
              maxHeight: "calc(100vh - 170px)",
            }}
          >
            {/* Sticky Header with Title & Sync AI Resume Button */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "10px 14px",
                background: "rgba(10, 10, 30, 0.95)",
                backdropFilter: "blur(16px)",
                borderRadius: 14,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid rgba(124, 58, 237, 0.55)",
                    background:
                      "linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(6, 182, 212, 0.2))",
                    color: "#fff",
                  }}
                >
                  <span>✨ AI Suggestions</span>
                  {pendingSuggestionsCount > 0 ? (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "1px 7px",
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      {pendingSuggestionsCount} pending
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "1px 7px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "rgba(226, 232, 240, 0.65)",
                      }}
                    >
                      {suggestions.length}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetToAiAnalysis}
                title="Revert all manual edits to the original AI analysis"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "rgba(226, 232, 240, 0.8)",
                  transition: "all 0.2s",
                }}
              >
                <span>🔄</span>
                <span>Sync AI Resume</span>
              </button>
            </div>

            {/* AI Suggestions List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {suggestions.length === 0 ? (
                <div
                  className="glass"
                  style={{ padding: "30px 20px", textAlign: "center", color: "rgba(148,163,184,0.7)" }}
                >
                  <p style={{ fontSize: 14 }}>
                    Analyzing resume preview for tailored grammar, skills, and impact suggestions...
                  </p>
                </div>
              ) : (
                suggestions.map((s, idx) => {
                  const isLocked = !hasSubscription && idx >= 2;
                  const statusStyle =
                    s.status === "accepted"
                      ? {
                        borderColor: "rgba(16,185,129,0.35)",
                        background: "rgba(16,185,129,0.05)",
                      }
                      : s.status === "rejected"
                        ? {
                          borderColor: "rgba(239,68,68,0.25)",
                          background: "rgba(239,68,68,0.04)",
                          opacity: 0.65,
                        }
                        : {};

                  return (
                    <LockedBlurOverlay
                      key={s.id}
                      isLocked={isLocked}
                      onOpenUpgradeModal={onOpenUpgradeModal}
                      customText="to unlock suggestion"
                    >
                      <div
                        className="glass"
                        style={{
                          padding: "20px 22px",
                          transition: "all 0.2s",
                          ...statusStyle,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 14,
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span className="tag tag-purple" style={{ padding: "4px 10px", fontSize: 11 }}>
                              {s.section}
                            </span>
                            <span
                              className={`tag ${s.impact === "high"
                                ? "tag-green"
                                : s.impact === "medium"
                                  ? "tag-amber"
                                  : "tag-cyan"
                                }`}
                              style={{ padding: "4px 10px", fontSize: 11 }}
                            >
                              {s.impact} impact
                            </span>
                            <span className="tag tag-cyan" style={{ padding: "4px 10px", fontSize: 11 }}>
                              {s.type}
                            </span>
                          </div>
                          {s.status !== "pending" && (
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <span
                                className={`tag ${s.status === "accepted" ? "tag-green" : "tag-red"}`}
                                style={{ padding: "4px 10px", fontSize: 11 }}
                              >
                                {s.status === "accepted"
                                  ? "✓ Applied to Resume"
                                  : "✗ Rejected"}
                              </span>
                              <button
                                type="button"
                                className="btn-ghost"
                                style={{
                                  padding: "3px 8px",
                                  fontSize: 11,
                                  borderColor: "rgba(239, 68, 68, 0.4)",
                                  color: "#fca5a5",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                                onClick={() => updateStatus(s.id, "pending")}
                                title="Undo and revert this suggestion"
                              >
                                ↩ Undo
                              </button>
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                          <div
                            style={{
                              padding: "12px 14px",
                              borderRadius: 10,
                              background: "rgba(239,68,68,0.08)",
                              border: "1px solid rgba(239,68,68,0.15)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: "rgba(239,68,68,0.8)",
                                fontFamily: "JetBrains Mono",
                                marginBottom: 6,
                                fontWeight: 700,
                              }}
                            >
                              BEFORE (CURRENT RESUME TEXT)
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "rgba(226,232,240,0.75)",
                                lineHeight: 1.5,
                              }}
                            >
                              {s.original}
                            </div>
                          </div>
                          <div
                            style={{
                              padding: "12px 14px",
                              borderRadius: 10,
                              background: "rgba(16,185,129,0.08)",
                              border: "1px solid rgba(16,185,129,0.2)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: "rgba(16,185,129,0.85)",
                                fontFamily: "JetBrains Mono",
                                marginBottom: 6,
                                fontWeight: 700,
                              }}
                            >
                              AI SUGGESTION (ENHANCED &amp; QUANTIFIED)
                            </div>
                            {editing === s.id ? (
                              <textarea
                                className="glass-textarea"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                                style={{
                                  fontSize: 13,
                                  background: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(124,58,237,0.4)",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "rgba(226,232,240,0.9)",
                                  lineHeight: 1.5,
                                }}
                              >
                                {s.suggested}
                              </div>
                            )}
                          </div>
                        </div>

                        {!isLocked && s.status === "pending" && (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {editing === s.id ? (
                              <>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  style={{ padding: "7px 16px", fontSize: 13 }}
                                  onClick={() => saveEdit(s.id)}
                                >
                                  Save Edit &amp; Apply
                                </button>
                                <button
                                  type="button"
                                  className="btn-ghost"
                                  style={{ padding: "7px 16px", fontSize: 13 }}
                                  onClick={() => setEditing(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  style={{
                                    padding: "7px 16px",
                                    fontSize: 13,
                                    background: "linear-gradient(135deg, #10b981, #059669)",
                                  }}
                                  onClick={() => updateStatus(s.id, "accepted")}
                                >
                                  ✓ Apply
                                </button>
                                <button
                                  type="button"
                                  className="btn-ghost"
                                  style={{
                                    padding: "7px 16px",
                                    fontSize: 13,
                                    borderColor: "rgba(239,68,68,0.4)",
                                    color: "#fca5a5",
                                  }}
                                  onClick={() => updateStatus(s.id, "rejected")}
                                >
                                  ✗ Reject
                                </button>
                                <button
                                  type="button"
                                  className="btn-ghost"
                                  style={{ padding: "7px 16px", fontSize: 13 }}
                                  onClick={() => startEdit(s)}
                                >
                                  ✎ Edit
                                </button>
                              </>
                            )}
                          </div>
                        )}
                        {!isLocked && s.status !== "pending" && (
                          <button
                            type="button"
                            className="btn-ghost"
                            style={{ padding: "6px 14px", fontSize: 12 }}
                            onClick={() => updateStatus(s.id, "pending")}
                          >
                            Undo
                          </button>
                        )}
                      </div>
                    </LockedBlurOverlay>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT — Real Resume Preview with Interactive Editor Icons */}
          <div
            className="glass resume-preview-card analysis-col"
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              height: "calc(100vh - 170px)",
              maxHeight: "calc(100vh - 170px)",
            }}
          >
            <div
              style={{
                padding: "16px 20px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Resume Preview
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "JetBrains Mono",
                    color: "rgba(148,163,184,0.5)",
                    marginTop: 2,
                  }}
                >
                  {resumeFileName}
                </div>
              </div>
              <span
                className="tag tag-purple"
                style={{
                  position: "absolute",
                  right: 20,
                  fontSize: 10,
                  cursor: "default",
                }}
              >
                ✎ Click text to edit
              </span>
            </div>

            <div
              className="resume-preview-body custom-scrollbar"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: "16px 18px",
              }}
            >
              {editorSections.map((section, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  {section.isHeader ? (
                    <div
                      style={{
                        marginBottom: 14,
                        paddingBottom: 10,
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        className="editable-text"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const val = e.currentTarget.innerText;
                          setCandidateName(val);
                          setEditorSections((prev) => {
                            const next = [...prev];
                            next[i] = { ...next[i], title: val };
                            return next;
                          });
                          setBaseSections((prev) => {
                            const next = [...prev];
                            next[i] = { ...next[i], title: val };
                            return next;
                          });
                        }}
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "white",
                          marginBottom: 4,
                          outline: "none",
                          cursor: "text",
                        }}
                      >
                        {section.title}
                      </div>
                      <div
                        className="editable-text"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleSectionContentChange(i, e.currentTarget.innerText)}
                        style={{
                          fontSize: 11,
                          color: "rgba(148,163,184,0.6)",
                          lineHeight: 1.6,
                          outline: "none",
                          cursor: "text",
                        }}
                      >
                        {section.content}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Section Header: Title on Left, Uploaded Buttons on Right */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 6,
                          gap: 8,
                        }}
                      >
                        <div
                          className="editable-text"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.currentTarget.innerText;
                            setEditorSections((prev) => {
                              const next = [...prev];
                              next[i] = { ...next[i], title: val };
                              return next;
                            });
                            setBaseSections((prev) => {
                              const next = [...prev];
                              next[i] = { ...next[i], title: val };
                              return next;
                            });
                          }}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "rgba(124,58,237,0.85)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            fontFamily: "JetBrains Mono",
                            outline: "none",
                            cursor: "text",
                          }}
                        >
                          {section.title}
                        </div>

                        {/* Uploaded Buttons: Up, Down, Remove */}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <button
                            type="button"
                            title="Move Section Up"
                            disabled={i <= 1}
                            onClick={() => handleMoveSection(i, "up")}
                            style={{
                              width: 26,
                              height: 26,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 6,
                              fontSize: 12,
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              background: "rgba(255, 255, 255, 0.03)",
                              color: i <= 1 ? "rgba(148, 163, 184, 0.2)" : "rgba(226, 232, 240, 0.8)",
                              cursor: i <= 1 ? "not-allowed" : "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (i > 1) {
                                e.currentTarget.style.background = "rgba(124, 58, 237, 0.25)";
                                e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.55)";
                                e.currentTarget.style.color = "#fff";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                              e.currentTarget.style.color =
                                i <= 1 ? "rgba(148, 163, 184, 0.2)" : "rgba(226, 232, 240, 0.8)";
                            }}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            title="Move Section Down"
                            disabled={i >= editorSections.length - 1}
                            onClick={() => handleMoveSection(i, "down")}
                            style={{
                              width: 26,
                              height: 26,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 6,
                              fontSize: 12,
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              background: "rgba(255, 255, 255, 0.03)",
                              color:
                                i >= editorSections.length - 1
                                  ? "rgba(148, 163, 184, 0.2)"
                                  : "rgba(226, 232, 240, 0.8)",
                              cursor: i >= editorSections.length - 1 ? "not-allowed" : "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (i < editorSections.length - 1) {
                                e.currentTarget.style.background = "rgba(124, 58, 237, 0.25)";
                                e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.55)";
                                e.currentTarget.style.color = "#fff";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                              e.currentTarget.style.color =
                                i >= editorSections.length - 1
                                  ? "rgba(148, 163, 184, 0.2)"
                                  : "rgba(226, 232, 240, 0.8)";
                            }}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            title="Remove Section"
                            onClick={() => {
                              if (confirm(`Remove "${section.title}" section?`)) {
                                handleRemoveSection(i);
                              }
                            }}
                            style={{
                              width: 26,
                              height: 26,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 6,
                              fontSize: 12,
                              border: "1px solid rgba(239, 68, 68, 0.35)",
                              background: "rgba(239, 68, 68, 0.08)",
                              color: "rgba(248, 113, 113, 0.95)",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.65)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.35)";
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div
                        className="editable-text"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleSectionContentChange(i, e.currentTarget.innerText)}
                        style={{
                          fontSize: 12,
                          color: "rgba(226,232,240,0.85)",
                          lineHeight: 1.8,
                          whiteSpace: "pre-line",
                          outline: "none",
                          cursor: "text",
                        }}
                      >
                        {section.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Bottom: Add New Resume Section Button */}
              <button
                type="button"
                onClick={handleAddSection}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 18px",
                  borderRadius: 10,
                  border: "1px dashed rgba(124, 58, 237, 0.45)",
                  background: "rgba(124, 58, 237, 0.05)",
                  color: "#c4b5fd",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginTop: 10,
                  marginBottom: 16,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(124, 58, 237, 0.14)";
                  e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.75)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(124, 58, 237, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.45)";
                }}
              >
                <span style={{ fontSize: 16 }}>+</span>
                <span>Add New Resume Section</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
