"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Download, Eye, FileText, X } from "lucide-react";
import api from "@/lib/axios";

interface AnalysisItem {
  id: string | number;
  role: string;
  company: string;
  date: string;
  score: number;
  ats: number;
  matched: string[];
  missing: string[];
  tips: string[];
}

interface InterviewItem {
  id: string | number;
  type: string;
  role: string;
  date: string;
  score: number;
  duration: string;
  questions: number;
  techAcc: number;
  commClarity: number;
  probSolve: number;
  feedback: { q: string; score: string; note: string }[];
}

const initialSummaryStats = [
  {
    label: "Total ATS Analyses",
    value: "0",
    color: "#a78bfa",
    subtitle: "Resumes & JD Scans",
  },
  {
    label: "Avg Match Score",
    value: "0%",
    color: "#22d3ee",
    subtitle: "Top Candidate Percentile",
  },
  {
    label: "Mock Interviews",
    value: "0",
    color: "#34d399",
    subtitle: "AI Voice Sessions",
  },
];

function downloadTextFile(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getScoreColor(score: number) {
  if (score >= 80) return "#34d399";
  if (score >= 65) return "#fbbf24";
  return "#f87171";
}

function formatDate(dateInput: string | Date | undefined) {
  if (!dateInput) return "Recent";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

const tableHeaderStyle = {
  color: "rgba(148,163,184,0.48)",
  fontFamily: "monospace",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textAlign: "center" as const,
};

const cellStyle = {
  color: "rgba(203,213,225,0.72)",
  fontSize: 13,
  textAlign: "center" as const,
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"analysis" | "interviews">("analysis");
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);

  const [analysisHistory, setAnalysisHistory] = useState<AnalysisItem[]>([]);
  const [interviewHistory, setInterviewHistory] = useState<InterviewItem[]>([]);
  const [summaryStats, setSummaryStats] = useState(initialSummaryStats);

  // Sync data dynamically with backend if user has real records
  useEffect(() => {
    async function fetchUserReports() {
      try {
        // Fetch stats
        const statsRes = await api.get("/reports/stats").catch(() => null);
        if (statsRes?.data?.success && statsRes.data.data) {
          const s = statsRes.data.data;
          setSummaryStats([
            {
              label: "Total ATS Analyses",
              value: String(s.totalScans || 0),
              color: "#a78bfa",
              subtitle: "Resumes & JD Scans",
            },
            {
              label: "Avg Match Score",
              value: `${s.avgMatchScore || 0}%`,
              color: "#22d3ee",
              subtitle: "Top Candidate Percentile",
            },
            {
              label: "Mock Interviews",
              value: String(s.totalInterviews || 0),
              color: "#34d399",
              subtitle: "AI Voice Sessions",
            },
          ]);
        }

        // Fetch ATS reports
        const atsRes = await api.get("/reports/ats", { params: { limit: 50 } }).catch(() => null);
        if (atsRes?.data?.success && atsRes.data.data?.items?.length > 0) {
          interface RawBackendATS {
            _id: string;
            target_job_role: string;
            company?: string;
            created_at: string;
            overall_match_score: number;
            ats_parse_score: number;
            matched_skills?: string[];
            missing_keywords?: string[];
            recommendations?: string[];
          }
          const items: AnalysisItem[] = atsRes.data.data.items.map((item: RawBackendATS) => ({
            id: item._id,
            role: item.target_job_role,
            company: item.company || "Target Role Application",
            date: formatDate(item.created_at),
            score: item.overall_match_score,
            ats: item.ats_parse_score,
            matched: item.matched_skills || [],
            missing: item.missing_keywords || [],
            tips: item.recommendations || [],
          }));
          setAnalysisHistory(items);
        } else {
          // Check if current user has an analysis saved locally
          let userAnalysis: AnalysisItem[] = [];
          try {
            const raw = localStorage.getItem("user");
            let userId = "";
            if (raw) {
              const u = JSON.parse(raw);
              userId = u?.id || u?._id || "";
            }
            if (userId) {
              const localA = localStorage.getItem(`jobprep_latest_analysis_${userId}`);
              if (localA) {
                const parsed = JSON.parse(localA);
                if (parsed?.resumeFileName || parsed?.score) {
                  userAnalysis = [
                    {
                      id: "latest-scan",
                      role: parsed.jobTitle || parsed.resumeFileName || "Target Role Application",
                      company: "Target Job",
                      date: parsed.createdAt ? formatDate(parsed.createdAt) : "Recent",
                      score: parsed.score || 0,
                      ats: parsed.score || 0,
                      matched: parsed.matchedKeywords || [],
                      missing: parsed.missingKeywords || [],
                      tips: parsed.suggestions || [],
                    },
                  ];
                }
              }
            }
          } catch {}
          setAnalysisHistory(userAnalysis);
        }

        // Fetch Interview reports
        const intRes = await api.get("/reports/interviews", { params: { limit: 50 } }).catch(() => null);
        if (intRes?.data?.success && intRes.data.data?.items?.length > 0) {
          interface RawBackendInt {
            _id: string;
            interview_type: string;
            role: string;
            created_at: string;
            score: number;
            duration_minutes: number;
            attempted_questions: number;
            tech_accuracy: number;
            communication: number;
            problem_solving: number;
            question_feedback?: { q: string; score: string; note: string }[];
          }
          const items: InterviewItem[] = intRes.data.data.items.map((item: RawBackendInt) => ({
            id: item._id,
            type: item.interview_type || "Mock Interview",
            role: item.role,
            date: formatDate(item.created_at),
            score: item.score,
            duration: `${item.duration_minutes || 30} min`,
            questions: item.attempted_questions || 3,
            techAcc: item.tech_accuracy || 75,
            commClarity: item.communication || 80,
            probSolve: item.problem_solving || 75,
            feedback: item.question_feedback || [],
          }));
          setInterviewHistory(items);
        } else {
          setInterviewHistory([]);
        }
      } catch {
        setAnalysisHistory([]);
        setInterviewHistory([]);
      }
    }

    fetchUserReports();
  }, []);

  function exportSummary() {
    const content = [
      "JobPrep AI Report - Candidate Summary",
      "",
      "Analysis History:",
      ...analysisHistory.map(
        (item) => `${item.role} @ ${item.company} — Match: ${item.score}%, ATS: ${item.ats}%`,
      ),
      "",
      "Interview History:",
      ...interviewHistory.map(
        (item) => `${item.type} (${item.role}) — Score: ${item.score}/100`,
      ),
    ].join("\n");
    downloadTextFile("JobPrep_AI_Performance_Report.txt", content);
  }

  return (
    <main className="mx-auto w-full max-w-7xl pb-8 pt-2 text-white">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">
            Reports & <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">History</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-400/70">
            Complete history of analyses, interviews, and candidate progress.
          </p>
        </div>
        <button
          type="button"
          onClick={exportSummary}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110"
        >
          <Download size={15} aria-hidden="true" />
          Export Report Summary
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryStats.map((stat) => (
          <section
            key={stat.label}
            className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] px-5 py-5 text-center transition hover:border-violet-400/20 hover:bg-white/[0.05]"
          >
            <div className="mb-1.5 text-[11px] uppercase tracking-wider text-slate-400/60">
              {stat.label}
            </div>
            <div className="mb-1 text-[32px] font-extrabold tracking-tight" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs text-slate-400/70">{stat.subtitle}</div>
          </section>
        ))}
      </div>

      <div
        className="mb-5 inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-white/[0.04] bg-white/[0.035] p-1"
        role="tablist"
        aria-label="Report history"
      >
        {([
          ["analysis", "ATS Analysis History"],
          ["interviews", "Interview History"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-[13px] font-semibold transition sm:px-5 ${
              activeTab === id
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-950/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "analysis" ? (
        <section
          role="tabpanel"
          aria-label="ATS analysis history"
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]"
        >
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[minmax(220px,1fr)_140px_100px_90px] gap-4 border-b border-white/[0.06] px-5 py-4">
                <div style={{ ...tableHeaderStyle, textAlign: "left" }}>NAME</div>
                <div style={tableHeaderStyle}>DATE</div>
                <div style={tableHeaderStyle}>ATS</div>
                <div style={tableHeaderStyle}>VIEW</div>
              </div>
              {analysisHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                    <FileText className="size-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No ATS Analyses Yet</h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-400">
                    Upload your resume and target job description in Step 1 to generate your ATS analysis reports.
                  </p>
                </div>
              ) : (
                analysisHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[minmax(220px,1fr)_140px_100px_90px] items-center gap-4 px-5 py-4 transition hover:bg-white/[0.035] ${
                      index < analysisHistory.length - 1 ? "border-b border-white/[0.04]" : ""
                    }`}
                  >
                    <div className="text-sm font-semibold text-white">{item.role}</div>
                    <div style={{ ...cellStyle, fontFamily: "monospace" }}>{item.date}</div>
                    <div className="text-center font-mono text-[15px] font-bold" style={{ color: getScoreColor(item.ats) }}>
                      {item.ats}%
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setSelectedAnalysis(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/35 px-3 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-400/10"
                      >
                        <Eye size={14} aria-hidden="true" />
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      ) : (
        <section
          role="tabpanel"
          aria-label="Interview history"
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]"
        >
          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              <div className="grid grid-cols-[minmax(190px,1fr)_110px_100px_145px_80px_90px] gap-3 border-b border-white/[0.06] px-5 py-4">
                {["Type & Role", "Date", "Duration", "Attempted Questions", "Score", "View"].map((heading, index) => (
                  <div key={heading} style={{ ...tableHeaderStyle, textAlign: index === 0 ? "left" : "center" }}>
                    {heading.toUpperCase()}
                  </div>
                ))}
              </div>
              {interviewHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                    <ClipboardList className="size-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No Mock Interviews Yet</h3>
                  <p className="mt-1 max-w-sm text-xs text-slate-400">
                    Complete your first mock interview to track questions, scores, and detailed AI feedback.
                  </p>
                </div>
              ) : (
                interviewHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[minmax(190px,1fr)_110px_100px_145px_80px_90px] items-center gap-3 px-5 py-4 transition hover:bg-white/[0.035] ${
                      index < interviewHistory.length - 1 ? "border-b border-white/[0.04]" : ""
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{item.type}</div>
                      <div className="mt-0.5 text-xs text-slate-400/70">{item.role}</div>
                    </div>
                    <div style={{ ...cellStyle, fontFamily: "monospace" }}>{item.date}</div>
                    <div style={cellStyle}>{item.duration}</div>
                    <div style={{ ...cellStyle, fontFamily: "monospace" }}>{item.questions} Q</div>
                    <div className="text-center font-mono text-[15px] font-bold" style={{ color: getScoreColor(item.score) }}>
                      {item.score}/100
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setSelectedInterview(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/35 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
                      >
                        <ClipboardList size={14} aria-hidden="true" />
                        Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {selectedAnalysis && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050512]/85 p-4 backdrop-blur-md sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedAnalysis(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="analysis-dialog-title"
            className="max-h-[88vh] w-full max-w-[680px] overflow-y-auto rounded-2xl border border-white/15 bg-[#0d0d2b] p-5 text-white shadow-2xl shadow-violet-950/30 sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="analysis-dialog-title" className="text-xl font-extrabold">
                  Analysis Report
                </h2>
                <p className="mt-1 text-sm font-semibold text-violet-300">
                  {selectedAnalysis.role} @ {selectedAnalysis.company}
                  <span className="font-normal text-slate-400"> · {selectedAnalysis.date}</span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close analysis report"
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-full border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <ScoreCard label="Overall JD Match" score={selectedAnalysis.score} color={getScoreColor(selectedAnalysis.score)} />
              <ScoreCard label="ATS Parse Score" score={selectedAnalysis.ats} color={selectedAnalysis.ats >= 80 ? "#34d399" : "#22d3ee"} />
            </div>

            <SkillList title="Matched Key Skills" items={selectedAnalysis.matched} color="green" />
            <SkillList title="Missing Keywords" items={selectedAnalysis.missing} color="red" />

            <div className="mb-6 rounded-xl border border-violet-400/25 bg-violet-500/[0.08] p-4">
              <h3 className="mb-2 text-xs font-bold text-violet-300">Key Recommendations</h3>
              <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-slate-200/90">
                {selectedAnalysis.tips.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </div>

            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => downloadTextFile(
                  `Analysis_${selectedAnalysis.company}_${selectedAnalysis.role.replace(/\s+/g, "_")}.txt`,
                  `Analysis Report\nRole: ${selectedAnalysis.role}\nCompany: ${selectedAnalysis.company}\nDate: ${selectedAnalysis.date}\nMatch Score: ${selectedAnalysis.score}%\nATS Score: ${selectedAnalysis.ats}%\nMatched: ${selectedAnalysis.matched.join(", ")}\nMissing: ${selectedAnalysis.missing.join(", ")}\nRecommendations: ${selectedAnalysis.tips.join("; ")}`,
                )}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.06]"
              >
                <FileText size={14} aria-hidden="true" />
                Download Full Report
              </button>
              <button
                type="button"
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2 text-xs font-semibold text-white transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedInterview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050512]/85 p-4 backdrop-blur-md sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedInterview(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-dialog-title"
            className="max-h-[88vh] w-full max-w-[720px] overflow-y-auto rounded-2xl border border-white/15 bg-[#0d0d2b] p-5 text-white shadow-2xl shadow-cyan-950/30 sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="interview-dialog-title" className="text-xl font-extrabold">
                  {selectedInterview.type} Scorecard
                </h2>
                <p className="mt-1 text-sm font-semibold text-cyan-300">
                  {selectedInterview.role}
                  <span className="font-normal text-slate-400"> · {selectedInterview.date} ({selectedInterview.duration})</span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close interview scorecard"
                onClick={() => setSelectedInterview(null)}
                className="rounded-full border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-cyan-400/25 bg-cyan-500/[0.07] p-5 sm:flex-row sm:items-center">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Overall Interview Score</div>
                <div className="mt-1 text-4xl font-extrabold leading-none text-emerald-400">
                  {selectedInterview.score} <span className="text-base font-medium text-slate-400">/ 100</span>
                </div>
              </div>
              <span className="w-fit rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-[13px] font-bold text-emerald-300">
                Grade: B+ (Strong Candidate)
              </span>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MetricCard label="Tech Accuracy" value={selectedInterview.techAcc} color="#a78bfa" />
              <MetricCard label="Communication" value={selectedInterview.commClarity} color="#22d3ee" />
              <MetricCard label="Problem Solving" value={selectedInterview.probSolve} color="#34d399" />
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-[13px] font-bold text-white">
                Question-by-Question Feedback ({selectedInterview.feedback.length} Questions)
              </h3>
              <div className="flex flex-col gap-3">
                {selectedInterview.feedback.map((feedback, index) => (
                  <div key={feedback.q} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                    <div className="mb-1.5 flex items-start justify-between gap-3">
                      <div className="text-[13px] font-bold text-slate-200">
                        Q{index + 1}: {feedback.q}
                      </div>
                      <span className="shrink-0 font-mono text-[11px] font-bold text-emerald-400">
                        {feedback.score}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">{feedback.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => downloadTextFile(
                  `Interview_Scorecard_${selectedInterview.role.replace(/\s+/g, "_")}.txt`,
                  `Interview Review Scorecard\nType: ${selectedInterview.type}\nRole: ${selectedInterview.role}\nScore: ${selectedInterview.score}/100\nDuration: ${selectedInterview.duration}\nAccuracy: ${selectedInterview.techAcc}%\nCommunication: ${selectedInterview.commClarity}%\nProblem Solving: ${selectedInterview.probSolve}%\n\nFeedback:\n${selectedInterview.feedback.map((feedback, index) => `Q${index + 1}: ${feedback.q} (${feedback.score})\nNote: ${feedback.note}`).join("\n\n")}`,
                )}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.06]"
              >
                <Download size={14} aria-hidden="true" />
                Download Scorecard
              </button>
              <button
                type="button"
                onClick={() => setSelectedInterview(null)}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2 text-xs font-semibold text-white transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-400/70">{label}</div>
      <div className="mt-1 text-[32px] font-extrabold" style={{ color }}>{score}%</div>
    </div>
  );
}

function SkillList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "green" | "red";
}) {
  const isPositive = color === "green";
  return (
    <section className="mb-5">
      <h3 className={`mb-2 text-xs font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
        {isPositive ? "✓" : "⚠"} {title} ({items.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
              isPositive
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                : "border-red-400/25 bg-red-400/10 text-red-300"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3 text-center">
      <div className="text-[11px] text-slate-400/70">{label}</div>
      <div className="mt-0.5 text-xl font-extrabold" style={{ color }}>{value}%</div>
    </div>
  );
}
