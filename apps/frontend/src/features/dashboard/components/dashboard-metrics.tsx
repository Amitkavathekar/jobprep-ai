"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"

export function DashboardMetrics() {
  const [atsScore, setAtsScore] = useState<number | null>(null)
  const [targetRole, setTargetRole] = useState<string>("")
  const [resumesCount, setResumesCount] = useState<number>(0)
  const [interviewsCount, setInterviewsCount] = useState<number>(0)

  useEffect(() => {
    try {
      const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
      let userId = ""
      if (rawUser) {
        const u = JSON.parse(rawUser)
        userId = u?.id || u?._id || ""
      }
      if (!userId) return

      // 1. Check user-scoped local storage for latest analysis
      const userStored = localStorage.getItem(`jobprep_latest_analysis_${userId}`)
      if (userStored) {
        try {
          const parsed = JSON.parse(userStored)
          if (typeof parsed?.score === "number") {
            setAtsScore(parsed.score)
            setTargetRole(parsed.matchLevel || "Latest scan")
            setResumesCount(1)
          }
        } catch {}
      }

      // 2. Fetch latest analysis from backend for real user data
      api.get("/ai-analysis/latest")
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            const data = res.data.data
            if (typeof data.score === "number" && data.score > 0) {
              setAtsScore(data.score)
              setTargetRole(data.matchLevel || "Latest scan")
              setResumesCount(1)
            }
          }
        })
        .catch(() => {})

      // 3. Fetch user mock interview count
      api.get("/mock-interview")
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setInterviewsCount(res.data.data.length)
          }
        })
        .catch(() => {})

      // 4. Fetch user resumes count directly from database
      const fetchResumesCount = () => {
        api.get("/resume")
          .then((res) => {
            if (res.data?.success && Array.isArray(res.data.data)) {
              setResumesCount(res.data.data.length)
            }
          })
          .catch(() => {})
      }
      fetchResumesCount()

      window.addEventListener("jobprep_resumes_updated", fetchResumesCount)
      return () => {
        window.removeEventListener("jobprep_resumes_updated", fetchResumesCount)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const metrics = [
    {
      label: "ATS Match",
      value: atsScore !== null ? String(atsScore) : "0",
      unit: "%",
      description: atsScore !== null ? targetRole || "Match Score" : "No scan yet",
      color: "text-cyan-400",
    },
    {
      label: "Interviews Completed",
      value: String(interviewsCount),
      description: interviewsCount > 0 ? `${interviewsCount} completed` : "No interviews yet",
      color: "text-emerald-400",
    },
    {
      label: "Total Resumes",
      value: String(resumesCount),
      unit: "",
      description: resumesCount > 0 ? `${resumesCount} active resume` : "No resumes uploaded",
      color: "text-amber-400",
    },
  ]

  return (
    <section
      aria-label="Dashboard metrics"
      className="grid gap-4 sm:grid-cols-3"
    >
      {metrics.map(({ label, value, unit, description, color }) => (
        <article
          className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br from-violet-300/10 to-slate-900/70 px-5 py-5 text-center shadow-lg shadow-black/10 transition hover:border-white/15 hover:from-violet-300/15"
          key={label}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400/70">
            {label}
          </div>
          <p className={`mt-3 text-4xl font-extrabold tracking-tight ${color}`}>
            {value}
            <span className="ml-0.5 text-base font-medium text-slate-400/70">
              {unit}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-400/70">
            {description}
          </p>
        </article>
      ))}
    </section>
  )
}
