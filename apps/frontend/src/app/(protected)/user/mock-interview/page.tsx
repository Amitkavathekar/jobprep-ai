"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Mic } from "lucide-react"

export default function MockInterviewPage() {
  const router = useRouter()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user")
      let userId = ""
      if (raw) {
        const u = JSON.parse(raw)
        userId = u?.id || u?._id || ""
      }
      const unlocked = userId
        ? localStorage.getItem(`jobprep_analysis_unlocked_${userId}`) === "true" ||
          Boolean(localStorage.getItem(`jobprep_latest_analysis_${userId}`))
        : false
      setIsUnlocked(Boolean(unlocked))
    } catch {
      setIsUnlocked(false)
    } finally {
      setChecking(false)
    }
  }, [])

  if (checking) return null

  if (!isUnlocked) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-slate-300">
        <div className="mb-3 flex size-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
          <Mic className="size-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Mock Interview Locked</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400 leading-6">
          Complete Step 2 by uploading your resume and target job description to generate AI-curated interview questions and unlock voice mock interviews.
        </p>
        <button
          type="button"
          className="btn-primary mt-6 px-6 py-2.5 text-sm font-semibold"
          onClick={() => router.push("/user/resume")}
        >
          Go to Step 1: Upload Resume &amp; JD →
        </button>
      </div>
    )
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-white">Mock Interview</h1>
    </main>
  )
}
