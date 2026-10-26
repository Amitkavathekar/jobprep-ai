"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { Screen, AIAnalysisProps, ResumeSection, AnalysisData } from "./types";
import LockedBlurOverlay from "./components/LockedBlurOverlay";
import UserMembershipModal from "@/components/UserMembershipModal";
import { defaultPlans, PlanData } from "@/components/admin/PlanModal";

export default function AIAnalysis({
  onNavigate,
  onComplete,
  hasActiveSubscription = false,
  onOpenUpgradeModal,
}: AIAnalysisProps = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<"score" | "keywords" | "gaps" | "suggestions">("score");
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<Set<number>>(new Set());
  const [previewSections, setPreviewSections] = useState<ResumeSection[]>([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState<boolean>(() => {
    if (hasActiveSubscription) return true;
    if (typeof window !== "undefined") {
      try {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
          const u = JSON.parse(userRaw);
          return Boolean(u?.hasActiveSubscription || u?.isSubscribed || u?.plan);
        }
      } catch {}
    }
    return false;
  });

  useEffect(() => {
    const syncSub = () => {
      try {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
          const u = JSON.parse(userRaw);
          if (u?.hasActiveSubscription || u?.isSubscribed || u?.plan) {
            setHasSubscription(true);
          }
        }
      } catch {}
    };
    syncSub();
    window.addEventListener("subscription-updated", syncSub);
    return () => window.removeEventListener("subscription-updated", syncSub);
  }, []);

  const handleOpenUpgrade = () => {
    if (onOpenUpgradeModal) {
      onOpenUpgradeModal();
    } else {
      setIsUpgradeModalOpen(true);
    }
  };

  const handleModalSubscribe = (plan: PlanData) => {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : {};
      u.hasActiveSubscription = true;
      u.isSubscribed = true;
      u.plan = plan.name;
      u.planId = plan.id;
      localStorage.setItem("user", JSON.stringify(u));
    } catch {}
    setHasSubscription(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("subscription-updated", { detail: { plan } }));
    }
  };

  useEffect(() => {
    async function loadAnalysis() {
      try {
        let userId = "";
        try {
          const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
          if (userRaw) {
            const u = JSON.parse(userRaw);
            userId = u?.id || u?._id || "";
          }
        } catch {}

        // 1. Fetch saved analysis from backend
        const res = await api.get("/ai-analysis/latest").catch(() => null);
        const backendData = res?.data?.data || null;
        const backendSections = backendData?.resumeSections || [];

        // 2. Load analysis data for this signed-in user or fallback key
        let userStored = userId
          ? localStorage.getItem(`jobprep_latest_analysis_${userId}`)
          : null;
        if (!userStored && typeof window !== "undefined") {
          userStored = localStorage.getItem("jobprep_latest_analysis");
        }

        let localAnalysis: AnalysisData | null = null;
        if (userStored) {
          try {
            const parsed = JSON.parse(userStored);
            if (parsed && typeof parsed.score === "number") {
              localAnalysis = parsed;
            }
          } catch {}
        }

        const activeAnalysis = localAnalysis || backendData;

        if (activeAnalysis) {
          setAnalysisData(activeAnalysis);
          setPreviewSections(
            backendSections.length > 0 ? backendSections : (activeAnalysis.resumeSections || [])
          );
          if (activeAnalysis.jobDescription) {
            try {
              if (userId) {
                localStorage.setItem(`jobprep_jd_${userId}`, activeAnalysis.jobDescription);
              }
              localStorage.setItem("jobprep_jd", activeAnalysis.jobDescription);
            } catch {}
          }
        } else {
          setAnalysisData(null);
          setPreviewSections([]);
        }
      } catch (err) {  
        console.error("Failed to load analysis:", err);
        setAnalysisData(null);
        setPreviewSections([]);
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, []);

  useEffect(() => {
    if (!loading && !analysisData) {
      router.replace("/user/resume");
    }
  }, [loading, analysisData, router]);

  const handleNavigate = (s: Screen) => {
    if (onNavigate) {
      onNavigate(s);
    } else {
      const route = s === "job-resume" ? "/user/resume" : `/user/${s}`;
      router.push(route);
    }
  };

  const handleApplySuggestion = (s: AnalysisData["suggestions"][0]) => {
    setAppliedSuggestionIds((prev) => new Set([...prev, s.id]));

    setPreviewSections((prev) => {
      let modified = false;

      // 1. Try to add to Skills if category is Keywords
      if (s.category.toLowerCase().includes("keyword")) {
        const skillsIndex = prev.findIndex((sec) => sec.title.toLowerCase().includes("skill"));
        if (skillsIndex !== -1) {
          modified = true;
          return prev.map((sec, idx) => {
            if (idx === skillsIndex) {
              return {
                ...sec,
                content: `${sec.content}, ${s.text}`,
                highlights: [...(sec.highlights || []), s.text],
              };
            }
            return sec;
          });
        }
      }

      // 2. Try to add to Experience section
      const expIndex = prev.findIndex((sec) => sec.title.toLowerCase().includes("experience"));
      if (expIndex !== -1) {
        modified = true;
        return prev.map((sec, idx) => {
          if (idx === expIndex) {
            return {
              ...sec,
              content: `${sec.content}\n• ${s.text}`,
              highlights: [...(sec.highlights || []), s.text],
            };
          }
          return sec;
        });
      }

      // 3. Fallback: add to first non-header section
      if (!modified && prev.length > 1) {
        return prev.map((sec, idx) => {
          if (idx === 1) {
            return {
              ...sec,
              content: `${sec.content}\n• ${s.text}`,
              highlights: [...(sec.highlights || []), s.text],
            };
          }
          return sec;
        });
      }

      return prev;
    });
  };

  const handleUndoSuggestion = (s: AnalysisData["suggestions"][0]) => {
    setAppliedSuggestionIds((prev) => {
      const next = new Set(prev);
      next.delete(s.id);
      return next;
    });

    setPreviewSections((prev) =>
      prev.map((sec) => {
        const withoutText = sec.content
          .replace(`\n• ${s.text}`, "")
          .replace(`, ${s.text}`, "");
        const withoutHighlight = (sec.highlights || []).filter((h) => h !== s.text);
        return {
          ...sec,
          content: withoutText,
          highlights: withoutHighlight,
        };
      })
    );
  };

  const ScoreArc = ({ value }: { value: number }) => {
    const color = value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444";
    return (
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(value / 100) * 251.3} 251.3`}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
        <text x="90" y="85" textAnchor="middle" fill="white" fontSize="28" fontWeight="800" fontFamily="Outfit">{value}</text>
        <text x="90" y="100" textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="11" fontFamily="JetBrains Mono">/ 100</text>
      </svg>
    );
  };

  const tabs = [
    { id: "score", label: "JD Match Score" },
    { id: "keywords", label: "JD Keyword Match" },
    { id: "gaps", label: "JD Gaps" },
    { id: "suggestions", label: "JD Suggestions" },
  ] as const;

  const formatBulletContent = (content: string) => {
    if (!content) return "";
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const result: string[] = [];

    for (const line of lines) {
      // Remove any existing bullet or list characters: •, -, *, o, ▪, ▫, –, —, >
      const cleanLine = line.replace(/^[•\-\*o▪▫–—>]\s*/, "").trim();
      if (!cleanLine) continue;

      // Check if line contains multiple sentences (e.g. ended with . ! ? followed by space and capital letter or number)
      const sentences = cleanLine
        .split(/(?<=[.!?])\s+(?=[A-Z0-9])/g)
        .map((s) => s.trim())
        .filter(Boolean);

      if (sentences.length > 1) {
        for (const s of sentences) {
          result.push(`• ${s}`);
        }
      } else {
        result.push(`• ${cleanLine}`);
      }
    }

    return result.join("\n");
  };

  const getSectionHighlights = (sectionHighlights?: string[]) => {
    const list = new Set<string>();
    // Always include matched keywords
    if (analysisData?.keywords?.matched) {
      analysisData.keywords.matched.forEach((k) => {
        if (k && typeof k === "string" && k.trim().length > 1) {
          list.add(k.trim());
        }
      });
    }
    // If on gaps tab, also include missing/partial keywords
    if (activeTab === "gaps") {
      if (analysisData?.keywords?.missing) {
        analysisData.keywords.missing.forEach((k) => k && list.add(k.trim()));
      }
      if (analysisData?.keywords?.partial) {
        analysisData.keywords.partial.forEach((k) => k && list.add(k.trim()));
      }
    }
    // Section specific highlights
    if (sectionHighlights && Array.isArray(sectionHighlights)) {
      sectionHighlights.forEach((k) => k && typeof k === "string" && list.add(k.trim()));
    }
    return Array.from(list);
  };

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights.length || !text) return <span>{text}</span>;
    const escaped = highlights
      .filter((h) => typeof h === "string" && h.trim().length > 1)
      .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!escaped.length) return <span>{text}</span>;

    const regex = new RegExp(`(${escaped.join("|")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
            <mark
              key={i}
              style={{
                background: "rgba(124,58,237,0.35)",
                color: "#c4b5fd",
                borderRadius: 4,
                padding: "1px 4px",
                fontWeight: 600,
                border: "1px solid rgba(124,58,237,0.4)",
              }}
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (onComplete) {
      onComplete();
    }
  };


  if (loading || !analysisData) {
    return (
      <div className="flex h-full min-h-[450px] flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="size-8 animate-spin text-violet-400" />
        <p className="text-sm font-medium">Loading AI Analysis...</p>
      </div>
    );
  }

  const { score, matchLevel, workingPoints, keywords, gaps, suggestions, resumeFileName } = analysisData;

  return (
    <div className="fade-in page-container" style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="stack-on-mobile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.02em" }}>
            Step 2: AI <span className="gradient-text">Analysis</span>
          </h1>
          <p style={{ color: "rgba(148,163,184,0.6)", fontSize: 14, margin: "6px 0 0" }}>
            Review real-time AI match score, detected keywords, skill gaps, and suggestions tailored to your target job.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-ghost" style={{ padding: "9px 18px", fontSize: 13 }} onClick={() => handleNavigate("job-resume")}>← Re-upload</button>
          <button className="btn-primary" style={{ padding: "9px 18px", fontSize: 13 }} onClick={() => handleNavigate("resume-editor")}>Step 3: Apply Suggestions →</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12, flexShrink: 0, overflowX: "auto" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: activeTab === t.id ? "1px solid rgba(124,58,237,0.5)" : "1px solid transparent",
              background: activeTab === t.id ? "rgba(124,58,237,0.15)" : "transparent",
              color: activeTab === t.id ? "#c4b5fd" : "rgba(148,163,184,0.7)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Two-column layout: AI Analysis (left) | Resume (right 50%) */}
      <div className="grid-responsive-2col analysis-grid-layout" style={{ flex: 1, minHeight: 0, overflow: "hidden", height: "calc(100vh - 210px)", maxHeight: "calc(100vh - 210px)", alignItems: "stretch" }}>
        {/* LEFT — AI Analysis content */}
        <div className="custom-scrollbar analysis-col" style={{ overflowY: "auto", paddingRight: 8, height: "calc(100vh - 210px)", maxHeight: "calc(100vh - 210px)" }}>
          {activeTab === "score" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "start" }}>
                <div className="glass" style={{ padding: "24px", textAlign: "center", height: 250, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                  <ScoreArc value={score} />
                  <div style={{ fontSize: 14, color: "rgba(148,163,184,0.6)", marginTop: 8 }}>Match Probability</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444",
                      marginTop: 4,
                    }}
                  >
                    {matchLevel}
                  </div>
                </div>
                <div className="glass" style={{ padding: "20px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>What's Working</span>
                    {!hasSubscription && workingPoints.length > 2 && (
                      <span style={{ fontSize: 11, color: "#c4b5fd", fontFamily: "JetBrains Mono" }}>
                        2/{workingPoints.length} Points Visible
                      </span>
                    )}
                  </div>
                  {/* Top 2 Visible Points */}
                  {workingPoints.slice(0, 2).map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 10 }}>
                      <span style={{ color: "#10b981", fontSize: 14, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 13, color: "rgba(226,232,240,0.85)" }}>
                        {item}
                      </span>
                    </div>
                  ))}

                  {/* Locked/Unlocked Remaining Points */}
                  {workingPoints.length > 2 && (
                    <LockedBlurOverlay
                      isLocked={!hasSubscription}
                      onOpenUpgradeModal={handleOpenUpgrade}
                      customText="to view remaining points"
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {workingPoints.slice(2).map((item, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                            <span style={{ color: "#10b981", fontSize: 14, marginTop: 1 }}>✓</span>
                            <span style={{ fontSize: 13, color: "rgba(226,232,240,0.85)" }}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </LockedBlurOverlay>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "keywords" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { title: "Matched Keywords", items: keywords.matched, tagClass: "tag-green", icon: "✓" },
                { title: "Partially Matched", items: keywords.partial, tagClass: "tag-amber", icon: "≈" },
                { title: "Missing Keywords", items: keywords.missing, tagClass: "tag-red", icon: "✗" },
              ].map((section) => (
                <div key={section.title} className="glass" style={{ padding: "20px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{section.title}</span>
                    {!hasSubscription && section.items.length > 2 && (
                      <span style={{ fontSize: 11, color: "#c4b5fd", fontFamily: "JetBrains Mono" }}>Top 2 Visible</span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    {/* Visible Keywords (Top 2) */}
                    {section.items.slice(0, 2).map((item) => (
                      <span
                        key={item}
                        className={`tag ${section.tagClass}`}
                        style={{ fontSize: 13, padding: "5px 12px" }}
                      >
                        {section.icon} {item}
                      </span>
                    ))}

                    {/* Locked/Unlocked Keywords */}
                    {section.items.length > 2 && (
                      <LockedBlurOverlay
                        isLocked={!hasSubscription}
                        onOpenUpgradeModal={handleOpenUpgrade}
                        customText="to view remaining keywords"
                        style={{ display: "inline-flex" }}
                      >
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "2px 4px" }}>
                          {section.items.slice(2).map((item) => (
                            <span
                              key={item}
                              className={`tag ${section.tagClass}`}
                              style={{ fontSize: 13, padding: "5px 12px" }}
                            >
                              {section.icon} {item}
                            </span>
                          ))}
                        </div>
                      </LockedBlurOverlay>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "gaps" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Visible Gaps (Top 2) */}
              {gaps.slice(0, 2).map((g, i) => {
                const colors = { high: "#ef4444", medium: "#f59e0b", low: "#06b6d4" };
                const c = colors[g.severity as keyof typeof colors] || "#f59e0b";
                return (
                  <div
                    key={i}
                    className="glass"
                    style={{
                      padding: "18px 22px",
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c}20`, border: `1px solid ${c}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {g.severity === "high" ? "🔴" : g.severity === "medium" ? "🟡" : "🔵"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{g.area}</span>
                        <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: c, background: `${c}18`, padding: "2px 8px", borderRadius: 4 }}>{g.severity.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "rgba(148,163,184,0.7)" }}>{g.detail}</div>
                    </div>
                  </div>
                );
              })}

              {/* Locked/Unlocked Gaps */}
              {gaps.length > 2 && (
                <LockedBlurOverlay
                  isLocked={!hasSubscription}
                  onOpenUpgradeModal={handleOpenUpgrade}
                  customText="to view remaining skill gaps & recommendations"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {gaps.slice(2).map((g, i) => {
                      const colors = { high: "#ef4444", medium: "#f59e0b", low: "#06b6d4" };
                      const c = colors[g.severity as keyof typeof colors] || "#f59e0b";
                      return (
                        <div
                          key={i}
                          className="glass"
                          style={{
                            padding: "18px 22px",
                            display: "flex",
                            gap: 16,
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c}20`, border: `1px solid ${c}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                            {g.severity === "high" ? "🔴" : g.severity === "medium" ? "🟡" : "🔵"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{g.area}</span>
                              <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: c, background: `${c}18`, padding: "2px 8px", borderRadius: 4 }}>{g.severity.toUpperCase()}</span>
                            </div>
                            <div style={{ fontSize: 13, color: "rgba(148,163,184,0.7)" }}>{g.detail}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </LockedBlurOverlay>
              )}
            </div>
          )}

          {activeTab === "suggestions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Visible Suggestions (Top 2) */}
              {suggestions.slice(0, 2).map((s) => {
                const isApplied = appliedSuggestionIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    className="glass"
                    style={{
                      padding: "18px 22px",
                      border: isApplied ? "1px solid rgba(16, 185, 129, 0.4)" : undefined,
                      background: isApplied ? "rgba(16, 185, 129, 0.05)" : undefined,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: s.impact === "high" ? "rgba(16,185,129,0.2)" : s.impact === "medium" ? "rgba(245,158,11,0.2)" : "rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: s.impact === "high" ? "#10b981" : s.impact === "medium" ? "#f59e0b" : "#06b6d4", fontFamily: "JetBrains Mono", flexShrink: 0 }}>{s.id}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                          <span className={`tag ${s.impact === "high" ? "tag-green" : s.impact === "medium" ? "tag-amber" : "tag-cyan"}`}>{s.impact} impact</span>
                          <span className="tag tag-purple">{s.category}</span>
                        </div>
                        <div style={{ fontSize: 14, color: "rgba(226,232,240,0.85)", lineHeight: 1.5 }}>{s.text}</div>
                      </div>
                      {isApplied ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn-ghost"
                            style={{
                              padding: "7px 12px",
                              fontSize: 12,
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#10b981",
                              border: "1px solid rgba(16, 185, 129, 0.4)",
                              fontWeight: 600,
                              cursor: "default",
                            }}
                          >
                            ✓ Applied
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            style={{
                              padding: "7px 12px",
                              fontSize: 12,
                              borderColor: "rgba(239, 68, 68, 0.4)",
                              color: "#fca5a5",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            onClick={() => handleUndoSuggestion(s)}
                            title="Undo and revert this suggestion from live resume preview"
                          >
                            ↩ Undo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-primary"
                          style={{
                            padding: "7px 16px",
                            fontSize: 12,
                            flexShrink: 0,
                            fontWeight: 600,
                          }}
                          onClick={() => handleApplySuggestion(s)}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Locked/Unlocked Suggestions */}
              {suggestions.length > 2 && (
                <LockedBlurOverlay
                  isLocked={!hasSubscription}
                  onOpenUpgradeModal={handleOpenUpgrade}
                  customText="to view remaining AI suggestions"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {suggestions.slice(2).map((s) => (
                      <div
                        key={s.id}
                        className="glass"
                        style={{
                          padding: "18px 22px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: s.impact === "high" ? "rgba(16,185,129,0.2)" : s.impact === "medium" ? "rgba(245,158,11,0.2)" : "rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: s.impact === "high" ? "#10b981" : s.impact === "medium" ? "#f59e0b" : "#06b6d4", fontFamily: "JetBrains Mono", flexShrink: 0 }}>{s.id}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                              <span className={`tag ${s.impact === "high" ? "tag-green" : s.impact === "medium" ? "tag-amber" : "tag-cyan"}`}>{s.impact} impact</span>
                              <span className="tag tag-purple">{s.category}</span>
                            </div>
                            <div style={{ fontSize: 14, color: "rgba(226,232,240,0.85)", lineHeight: 1.5 }}>{s.text}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </LockedBlurOverlay>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Real Resume preview */}
        <div
          className="glass resume-preview-card analysis-col"
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "calc(100vh - 210px)",
            maxHeight: "calc(100vh - 210px)",
          }}
        >
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.01em" }}>Resume Preview</div>
              <div style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "rgba(148,163,184,0.5)", marginTop: 2 }}>
                {resumeFileName}
              </div>
            </div>
            <span className="tag tag-purple" style={{ position: "absolute", right: 20, fontSize: 10, cursor: "default" }} title="Click any text in preview to edit directly">
              ✎ Click text to edit
            </span>
          </div>
          <div className="resume-preview-body custom-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 18px" }}>
            {activeTab !== "score" && (
              <div style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "rgba(124,58,237,0.7)", marginBottom: 12, letterSpacing: "0.06em" }}>
                {activeTab === "keywords" ? "↑ MATCHED KEYWORDS HIGHLIGHTED" : activeTab === "gaps" ? "↑ GAP AREAS MARKED" : "↑ SUGGESTED CHANGES MARKED"}
              </div>
            )}
            {previewSections.map((section, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                {section.isHeader ? (
                  <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="editable-text" contentEditable suppressContentEditableWarning style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 4 }}>{section.title}</div>
                    <div className="editable-text" contentEditable suppressContentEditableWarning style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", lineHeight: 1.6 }}>{section.content}</div>
                  </div>
                ) : (
                  <div>
                    <div className="editable-text" contentEditable suppressContentEditableWarning style={{ fontSize: 11, fontWeight: 700, color: "rgba(124,58,237,0.8)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5, fontFamily: "JetBrains Mono" }}>{section.title}</div>
                    <div className="editable-text" contentEditable suppressContentEditableWarning style={{ fontSize: 12, color: "rgba(226,232,240,0.85)", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                      {(() => {
                        const bulleted = formatBulletContent(section.content);
                        const highlights = getSectionHighlights(section.highlights);
                        return highlights.length > 0 ? highlightText(bulleted, highlights) : bulleted;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <UserMembershipModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        plans={defaultPlans}
        onSubscribe={handleModalSubscribe}
      />
    </div>
  );
}

