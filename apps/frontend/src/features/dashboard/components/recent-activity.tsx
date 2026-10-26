"use client"

import { useEffect, useState } from "react"
import {
  Clock3,
  FileText,
  Sparkles,
} from "lucide-react"
import api from "@/lib/axios"

interface UserActivity {
  id: string
  icon: any
  text: string
  time: string
  color: string
  background: string
  border: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<UserActivity[]>([])

  useEffect(() => {
    try {
      const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
      let userId = ""
      if (rawUser) {
        const u = JSON.parse(rawUser)
        userId = u?.id || u?._id || ""
      }
      if (!userId) return

      const userActivities: UserActivity[] = []

      // 1. Check user's latest analysis
      const userStored = localStorage.getItem(`jobprep_latest_analysis_${userId}`)
      if (userStored) {
        try {
          const parsed = JSON.parse(userStored)
          if (parsed?.resumeFileName || parsed?.score) {
            userActivities.push({
              id: "analysis-local",
              icon: Sparkles,
              text: `AI Analysis: ${parsed.resumeFileName || "Uploaded Resume"} (${parsed.score || 0}% Match)`,
              time: "Latest",
              color: "text-violet-300",
              background: "bg-violet-400/10",
              border: "border-violet-400/25",
            })
          }
        } catch {}
      }

      // 2. Fetch latest analysis from backend
      api.get("/ai-analysis/latest")
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            const data = res.data.data
            const fileName = data.resumeFileName || "Uploaded Resume"
            const scoreText = typeof data.score === "number" ? ` (${data.score}% Match)` : ""
            setActivities((prev) => {
              if (prev.some((a) => a.id === "analysis-backend" || a.id === "analysis-local")) {
                return prev
              }
              return [
                {
                  id: "analysis-backend",
                  icon: Sparkles,
                  text: `AI Analysis completed for ${fileName}${scoreText}`,
                  time: "Recent",
                  color: "text-cyan-300",
                  background: "bg-cyan-400/10",
                  border: "border-cyan-400/25",
                },
                ...prev,
              ]
            })
          }
        })
        .catch(() => {})

      setActivities(userActivities)
    } catch (e) {
      console.error(e)
    }
  }, [])

  return (
    <section
      aria-labelledby="dashboard-activity-heading"
      className="flex h-[395px] min-h-[350px] flex-col rounded-2xl border border-white/10 bg-linear-to-br from-violet-300/10 via-slate-900/70 to-slate-900/60 p-5"
    >
      <h2
        className="mb-4 text-base font-bold tracking-tight text-white"
        id="dashboard-activity-heading"
      >
        Recent Activity
      </h2>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
        {activities.map(
          ({ id, icon: Icon, text, time, color, background, border }) => (
            <article
              className="flex gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.05]"
              key={id}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${background} ${border} ${color}`}
              >
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-snug text-slate-200/90">
                  {text}
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-400/60">
                  {time}
                </p>
              </div>
            </article>
          )
        )}

        {activities.length === 0 && (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
              <Clock3 aria-hidden="true" className="size-5 opacity-60" />
            </span>
            <p className="text-sm font-medium text-slate-200">No recent activity</p>
            <p className="mt-1 max-w-[220px] text-xs text-slate-500">
              Activities will appear here when you run AI analysis or prepare for interviews.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
