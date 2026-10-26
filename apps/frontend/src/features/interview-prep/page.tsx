"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Sparkles, RefreshCw } from "lucide-react";
import api from "@/lib/axios";
import { Screen } from "@/types";
import LockedBlurOverlay from "@/components/LockedBlurOverlay";

export interface InterviewPrepProps {
  onNavigate?: (s: Screen) => void;
  hasActiveSubscription?: boolean;
  onOpenUpgradeModal?: () => void;
}

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

export default function InterviewPrep({
  onNavigate,
  hasActiveSubscription: propHasSub,
  onOpenUpgradeModal,
}: InterviewPrepProps = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleTitle, setRoleTitle] = useState("Target Role");
  const [questionBanks, setQuestionBanks] = useState<QuestionBankCategory[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  const [expandedBank, setExpandedBank] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(() => {
    if (Boolean(propHasSub)) return true;
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        if (u?.hasActiveSubscription || u?.isSubscribed || u?.plan) return true;
      } catch {}
    }
    return false;
  });

  const totalQuestionsCount = useMemo(() => {
    return questionBanks.reduce(
      (acc, b) => acc + (b.count || b.questions?.length || 0),
      0
    );
  }, [questionBanks]);

  const effectivePlan = useMemo(() => {
    if (
      Array.isArray(studyPlan) &&
      studyPlan.length > 0 &&
      studyPlan.length === questionBanks.length &&
      !studyPlan.some(
        (s) =>
          s.focus === "React Fiber & Core Internals" &&
          !questionBanks.some((q) => q.category.includes("React Fiber"))
      )
    ) {
      return studyPlan;
    }

    if (Array.isArray(questionBanks) && questionBanks.length > 0) {
      return questionBanks.map((cat, idx) => ({
        day: `Day ${idx + 1}`,
        focus: cat.category,
        items: cat.count || cat.questions?.length || 0,
        status: (idx === 0 ? "done" : idx === 1 ? "in-progress" : "upcoming") as "done" | "in-progress" | "upcoming",
        categoryTitle: cat.category,
        categoryIcon: cat.icon || "◈",
        categoryColor: cat.color || "#7c3aed",
        keyQuestions: (cat.questions || []).slice(0, 3).map((q) => q.q),
      }));
    }

    return [];
  }, [studyPlan, questionBanks]);

  useEffect(() => {
    async function loadInterviewPrep() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/interview-prep");
        if (res.data?.success && res.data.data) {
          const { jobTitle, questionBanks, studyPlan, hasActiveSubscription } = res.data.data;
          setRoleTitle(jobTitle || "Target Role");
          setQuestionBanks(questionBanks || []);
          setStudyPlan(studyPlan || []);
          if (questionBanks && questionBanks.length > 0) {
            setExpandedBank(questionBanks[0].category);
          }
          if (typeof propHasSub === "boolean") {
            setHasSubscription(propHasSub);
          } else {
            setHasSubscription(Boolean(hasActiveSubscription));
          }
        } else {
          setError(res.data?.message || "No interview prep found.");
        }
      } catch (err: any) {
        console.error("Failed to fetch interview prep:", err);
        const msg =
          err?.response?.data?.message ||
          "Please complete Step 2: Validate Data & Proceed to AI Analysis first to generate tailored interview questions.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadInterviewPrep();
  }, [propHasSub]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await api.post("/interview-prep/generate");
      if (res.data?.success && res.data.data) {
        const { jobTitle, questionBanks, studyPlan } = res.data.data;
        setRoleTitle(jobTitle || "Target Role");
        setQuestionBanks(questionBanks || []);
        setStudyPlan(studyPlan || []);
        if (questionBanks && questionBanks.length > 0) {
          setExpandedBank(questionBanks[0].category);
        }
      }
    } catch (err: any) {
      console.error("Regeneration failed:", err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleSelectStudyDay = (day: StudyPlanItem) => {
    if (day.categoryTitle && day.categoryTitle !== "Mock Simulation (All Categories)") {
      setExpandedBank(day.categoryTitle);
      const safeId = `bank-${day.categoryTitle.replace(/[^a-zA-Z0-9]/g, "-")}`;
      const el = document.getElementById(safeId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

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

  const handleNavigate = (s: Screen) => {
    if (onNavigate) {
      onNavigate(s);
    } else {
      const route = s === "job-resume" ? "/user/resume" : `/user/${s}`;
      router.push(route);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="size-9 animate-spin text-violet-400" />
        <p className="text-base font-semibold text-white">
          Loading Interview Preparation Kit...
        </p>
        <p className="text-xs text-slate-400">
          Fetching tailored questions, answers, and study plan
        </p>
      </div>
    );
  }

  if (error || questionBanks.length === 0) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-slate-300">
        <div className="mb-3 flex size-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
          <FileText className="size-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Interview Questions Not Generated Yet</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400 leading-6">
          {error ||
            "Please complete Step 2: Validate Data & Proceed to AI Analysis by uploading your resume and target job description to generate AI-curated interview questions."}
        </p>
        <button
          type="button"
          className="btn-primary mt-6 px-6 py-2.5 text-sm font-semibold"
          onClick={() => handleNavigate("job-resume")}
        >
          Go to Step 2: Validate Data &amp; Proceed →
        </button>
      </div>
    );
  }

  const totalVisibleCount = hasSubscription
    ? questionBanks.reduce((acc, b) => acc + (b.count || b.questions.length), 0)
    : 64;

  return (
    <div className="fade-in page-container" style={{ height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div
        className="stack-on-mobile"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
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
            Interview <span className="gradient-text">Prep &amp; Question Bank</span>
          </h1>
          <p style={{ color: "rgba(148,163,184,0.6)", fontSize: 14, margin: "6px 0 0" }}>
            AI-curated question bank tailored to your Job Description ({roleTitle}) &amp; Resume with
            model answers.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "nowrap",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Generate fresh questions for this JD"
          >
            <RefreshCw className={`size-3.5 ${regenerating ? "animate-spin" : ""}`} />
            <span>{regenerating ? "Regenerating..." : "Regenerate Q&As"}</span>
          </button>

          {!hasSubscription && (
            <button
              className="btn-primary"
              style={{
                padding: "9px 18px",
                fontSize: 13,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              onClick={handleUpgradeClick}
            >
              ⚡ Upgrade Plan to Unlock All Questions
            </button>
          )}
        </div>
      </div>

      <div className="grid-responsive-sidebar">
        {/* Question banks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              marginBottom: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Tailored JD Question Bank</span>
            <span style={{ fontSize: 12, color: "#06b6d4", fontFamily: "JetBrains Mono" }}>
              {hasSubscription
                ? `${totalVisibleCount} Questions Total (Unlocked)`
                : "2 Questions Visible Per Category"}
            </span>
          </div>

          {questionBanks.map((bank) => {
            const isExpanded = expandedBank === bank.category;
            const safeId = `bank-${bank.category.replace(/[^a-zA-Z0-9]/g, "-")}`;
            return (
              <div
                key={bank.category}
                id={safeId}
                className="glass"
                style={{
                  overflow: "hidden",
                  border: isExpanded
                    ? `1px solid ${bank.color || "#7c3aed"}50`
                    : "1px solid rgba(255,255,255,0.06)",
                  transition: "border 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: isExpanded
                    ? `0 0 20px -5px ${bank.color || "#7c3aed"}25`
                    : undefined,
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    background: isExpanded ? "rgba(124,58,237,0.06)" : undefined,
                  }}
                  onClick={() => setExpandedBank(isExpanded ? null : bank.category)}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: `${bank.color}20`,
                      border: `1px solid ${bank.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {bank.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "white",
                        marginBottom: 2,
                      }}
                    >
                      {bank.category}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)" }}>
                      {bank.count} questions tailored for {roleTitle}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 18,
                      color: "rgba(148,163,184,0.4)",
                      transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(90deg)" : "none",
                    }}
                  >
                    ›
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {/* Visible Questions (Q1 & Q2) */}
                      {bank.questions.slice(0, 2).map((item, i) => (
                        <div
                          key={item.id}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 12,
                            padding: 16,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "flex-start",
                              marginBottom: 12,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontFamily: "JetBrains Mono",
                                color: bank.color,
                                fontWeight: 700,
                                marginTop: 2,
                                flexShrink: 0,
                                background: `${bank.color}15`,
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              {"Q" + (i + 1)}
                            </span>
                            <div
                              style={{
                                flex: 1,
                                fontSize: 14,
                                fontWeight: 600,
                                color: "white",
                                lineHeight: 1.4,
                              }}
                            >
                              {item.q}
                            </div>
                          </div>

                          {/* Model Answer Box */}
                          <div
                            style={{
                              marginTop: 12,
                              paddingTop: 12,
                              borderTop: "1px dashed rgba(255,255,255,0.1)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontFamily: "JetBrains Mono",
                                color: "#10b981",
                                marginBottom: 6,
                                fontWeight: 700,
                              }}
                            >
                              ✓ RECOMMENDED MODEL ANSWER:
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "rgba(226,232,240,0.85)",
                                lineHeight: 1.6,
                                marginBottom: 12,
                                background: "rgba(16,185,129,0.04)",
                                padding: 12,
                                borderRadius: 8,
                                border: "1px solid rgba(16,185,129,0.15)",
                              }}
                            >
                              {item.answer}
                            </div>

                            {item.keyPoints && item.keyPoints.length > 0 && (
                              <>
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontFamily: "JetBrains Mono",
                                    color: "rgba(148,163,184,0.6)",
                                    marginBottom: 6,
                                  }}
                                >
                                  KEY POINTS TO MENTION:
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {item.keyPoints.map((kp, idx) => (
                                    <span
                                      key={idx}
                                      style={{
                                        fontSize: 11,
                                        background: "rgba(124,58,237,0.15)",
                                        color: "#a78bfa",
                                        padding: "3px 8px",
                                        borderRadius: 6,
                                        border: "1px solid rgba(124,58,237,0.3)",
                                      }}
                                    >
                                      • {kp}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Locked/Unlocked Questions */}
                      {bank.questions.length > 2 && (
                        <LockedBlurOverlay
                          isLocked={!hasSubscription}
                          onOpenUpgradeModal={handleUpgradeClick}
                          customText="to view remaining questions & model answers"
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {bank.questions.slice(2).map((item, i) => (
                              <div
                                key={item.id}
                                style={{
                                  background: "rgba(255,255,255,0.02)",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                  borderRadius: 12,
                                  padding: 16,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "flex-start",
                                    marginBottom: 12,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontFamily: "JetBrains Mono",
                                      color: bank.color,
                                      fontWeight: 700,
                                      marginTop: 2,
                                      flexShrink: 0,
                                      background: `${bank.color}15`,
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                    }}
                                  >
                                    {"Q" + (i + 3)}
                                  </span>
                                  <div
                                    style={{
                                      flex: 1,
                                      fontSize: 14,
                                      fontWeight: 600,
                                      color: "white",
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {item.q}
                                  </div>
                                </div>

                                <div
                                  style={{
                                    marginTop: 12,
                                    paddingTop: 12,
                                    borderTop: "1px dashed rgba(255,255,255,0.1)",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontFamily: "JetBrains Mono",
                                      color: "#10b981",
                                      marginBottom: 6,
                                      fontWeight: 700,
                                    }}
                                  >
                                    ✓ RECOMMENDED MODEL ANSWER:
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      color: "rgba(226,232,240,0.85)",
                                      lineHeight: 1.6,
                                      marginBottom: 12,
                                      background: "rgba(16,185,129,0.04)",
                                      padding: 12,
                                      borderRadius: 8,
                                      border: "1px solid rgba(16,185,129,0.15)",
                                    }}
                                  >
                                    {item.answer}
                                  </div>

                                  {item.keyPoints && item.keyPoints.length > 0 && (
                                    <>
                                      <div
                                        style={{
                                          fontSize: 11,
                                          fontFamily: "JetBrains Mono",
                                          color: "rgba(148,163,184,0.6)",
                                          marginBottom: 6,
                                        }}
                                      >
                                        KEY POINTS TO MENTION:
                                      </div>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {item.keyPoints.map((kp, idx) => (
                                          <span
                                            key={idx}
                                            style={{
                                              fontSize: 11,
                                              background: "rgba(124,58,237,0.15)",
                                              color: "#a78bfa",
                                              padding: "3px 8px",
                                              borderRadius: 6,
                                              border: "1px solid rgba(124,58,237,0.3)",
                                            }}
                                          >
                                            • {kp}
                                          </span>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </LockedBlurOverlay>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Study plan */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass" style={{ padding: "20px 22px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.01em",
                }}
              >
                {effectivePlan.length > 0 ? `${effectivePlan.length}-Day Study Plan` : "Personalized Study Plan"}
              </div>
            </div>

            <div
              style={{
                fontSize: 13,
                color: "rgba(148,163,184,0.7)",
                marginBottom: 20,
                lineHeight: 1.4,
              }}
            >
              According to your questions, this plan is generated ({totalQuestionsCount} questions across {questionBanks.length} categories)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {effectivePlan.map((day, idx, arr) => {
                const statusColors = {
                  done: "#10b981",
                  "in-progress": "#7c3aed",
                  upcoming: "rgba(148,163,184,0.35)",
                };
                const c = statusColors[day.status as keyof typeof statusColors] || "#7c3aed";
                const isSelected =
                  Boolean(day.categoryTitle) && expandedBank === day.categoryTitle;

                return (
                  <div
                    key={day.day || idx}
                    onClick={() => handleSelectStudyDay(day)}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: isSelected
                        ? "rgba(124, 58, 237, 0.08)"
                        : "rgba(255, 255, 255, 0.015)",
                      border: isSelected
                        ? "1px solid rgba(124, 58, 237, 0.4)"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                      cursor: day.categoryTitle ? "pointer" : "default",
                      transition: "all 0.2s ease",
                    }}
                    className="hover:border-white/20 transition-all"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: 2,
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background:
                            day.status === "done"
                              ? "#10b981"
                              : day.status === "in-progress"
                              ? "#7c3aed"
                              : "rgba(255,255,255,0.06)",
                          border: `2px solid ${c}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {day.status === "done" ? "✓" : day.status === "in-progress" ? "●" : "○"}
                      </div>
                      {idx < arr.length - 1 && (
                        <div
                          style={{
                            width: 1,
                            flex: 1,
                            background: c,
                            opacity: 0.25,
                            marginTop: 4,
                            minHeight: 26,
                          }}
                        />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: "JetBrains Mono",
                          color: c,
                          fontWeight: 700,
                          marginBottom: 2,
                        }}
                      >
                        {day.day}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color:
                            day.status === "upcoming"
                              ? "rgba(226,232,240,0.7)"
                              : "rgba(255,255,255,0.95)",
                          marginBottom: 3,
                          lineHeight: 1.35,
                        }}
                      >
                        {day.focus}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(148,163,184,0.6)",
                          fontFamily: "JetBrains Mono",
                        }}
                      >
                        {day.items} questions
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
