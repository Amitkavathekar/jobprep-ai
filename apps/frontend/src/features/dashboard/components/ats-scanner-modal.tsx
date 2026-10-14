"use client"

import { useState, type ChangeEvent } from "react"
import { Dialog } from "@base-ui/react/dialog"
import {
  AlertCircle,
  Check,
  Download,
  FileText,
  LoaderCircle,
  Sparkles,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getApiBaseUrl } from "@/lib/axios"

interface ATSAnalysisResult {
  targetJobRole: string
  score: number
  summary: string
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
}

interface ATSApiResponse {
  success: boolean
  message?: string
  data?: ATSAnalysisResult
}

interface AtsScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialJobRole: string
}

const API_URL = getApiBaseUrl()

export function AtsScannerModal({
  open,
  onOpenChange,
  initialJobRole,
}: AtsScannerModalProps) {
  const [resume, setResume] = useState<File | null>(null)
  const [targetJobRole, setTargetJobRole] = useState(initialJobRole)
  const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    setError("")
    setAnalysis(null)

    if (!file) {
      setResume(null)
      return
    }

    const allowedExtensions = [".pdf", ".docx"]
    const validExtension = allowedExtensions.some((extension) =>
      file.name.toLowerCase().endsWith(extension),
    )

    if (!validExtension) {
      setResume(null)
      event.target.value = ""
      setError("Please select a PDF or DOCX resume.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setResume(null)
      event.target.value = ""
      setError("Your resume must be 5 MB or smaller.")
      return
    }

    setResume(file)
  }

  async function handleScan() {
    setError("")
    setAnalysis(null)

    if (!resume) {
      setError("Please upload your resume first.")
      return
    }

    if (!targetJobRole.trim()) {
      setError("Please enter your target job role.")
      return
    }

    const formData = new FormData()
    formData.append("resume", resume)
    formData.append("targetJobRole", targetJobRole.trim())

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/ats/analyze`, {
        method: "POST",
        body: formData,
      })
      const result = (await response.json()) as ATSApiResponse

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || "Unable to analyze your resume. Please try again.",
        )
      }

      setAnalysis(result.data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  function downloadReport() {
    if (!analysis || !resume) return

    const report = [
      "ATS Score Audit Report",
      `File: ${resume.name}`,
      `Job: ${analysis.targetJobRole}`,
      `Score: ${analysis.score}%`,
      "",
      analysis.summary,
      "",
      `Matched skills: ${analysis.matchedSkills.join(", ") || "None identified"}`,
      `Missing skills: ${analysis.missingSkills.join(", ") || "None identified"}`,
      "",
      "Recommendations:",
      ...analysis.recommendations.map((recommendation) => `- ${recommendation}`),
    ].join("\n")

    const url = URL.createObjectURL(new Blob([report], { type: "text/plain" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `ATS_Audit_${resume.name.replace(/\.[^/.]+$/, "")}.txt`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#07071a]/75 backdrop-blur-md data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-[580px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/15 bg-[#0d0d2b] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_30px_rgba(124,58,237,0.25)] outline-none sm:p-6">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span aria-hidden="true" className="text-xl">
                  🎯
                </span>
                <Dialog.Title className="text-lg font-extrabold tracking-tight sm:text-xl">
                  In-Dashboard ATS Score Scanner
                </Dialog.Title>
              </div>
              <Dialog.Description className="mt-1 text-xs leading-5 text-slate-400">
                Upload a resume to analyze it against your target job role.
              </Dialog.Description>
            </div>
            <Dialog.Close
              render={
                <Button
                  aria-label="Close ATS scanner"
                  className="size-8 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  size="icon"
                  variant="ghost"
                />
              }
            >
              <X aria-hidden="true" />
            </Dialog.Close>
          </header>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-center">
              <div className="mb-1.5 text-xs text-slate-400">Resume File</div>
              <div className="flex min-w-0 items-center justify-center gap-1.5 text-sm font-semibold text-cyan-400">
                <FileText aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">{resume?.name || "No file selected"}</span>
              </div>
              <label
                className="mt-2 inline-block cursor-pointer text-xs text-violet-300 underline underline-offset-2 hover:text-violet-200"
                htmlFor="ats-modal-resume"
              >
                {resume ? "Change File" : "Choose File"}
              </label>
              <input
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                id="ats-modal-resume"
                onChange={handleFileChange}
                type="file"
              />
              <p className="mt-1 text-[11px] text-slate-500">PDF or DOCX · Max 5 MB</p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
              <label
                className="mb-1.5 block text-xs text-slate-400"
                htmlFor="ats-modal-job-role"
              >
                Target Job Role
              </label>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                id="ats-modal-job-role"
                maxLength={100}
                onChange={(event) => setTargetJobRole(event.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                value={targetJobRole}
              />
            </div>
          </div>

          {error && (
            <div
              className="mb-4 flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
              role="alert"
            >
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            className="mb-5 h-10 w-full border-0 bg-linear-to-r from-violet-600 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-110"
            disabled={loading}
            onClick={handleScan}
            type="button"
          >
            {loading ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <Sparkles aria-hidden="true" />
            )}
            {loading ? "Analyzing Resume..." : "Run ATS Diagnostic Scan"}
          </Button>

          {loading && (
            <p
              aria-live="polite"
              className="mb-5 -mt-2 text-center text-xs text-cyan-300"
            >
              Analyzing your resume against the target role...
            </p>
          )}

          {analysis && (
            <section
              aria-label="ATS analysis results"
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Overall ATS Match Score
                  </p>
                  <p className="mt-1 text-4xl font-extrabold leading-none text-emerald-400">
                    {analysis.score}
                    <span className="ml-1 text-sm font-medium text-slate-500">
                      / 100
                    </span>
                  </p>
                </div>
                <div className="max-w-[45%] text-right">
                  <p className="text-xs text-slate-400">Analyzed for</p>
                  <p className="mt-1 text-sm font-semibold text-cyan-400">
                    {analysis.targetJobRole}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {analysis.summary}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-bold text-emerald-400">
                    <Check aria-hidden="true" className="mr-1 inline size-3.5" />
                    Matched Skills ({analysis.matchedSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedSkills.length ? (
                      analysis.matchedSkills.map((skill) => (
                        <span
                          className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-300"
                          key={skill}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        No matched skills identified.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-bold text-red-400">
                    <AlertCircle
                      aria-hidden="true"
                      className="mr-1 inline size-3.5"
                    />
                    Missing Skills ({analysis.missingSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingSkills.length ? (
                      analysis.missingSkills.map((skill) => (
                        <span
                          className="rounded-md border border-red-400/25 bg-red-400/10 px-2 py-1 text-[11px] text-red-300"
                          key={skill}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        No missing skills identified.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {analysis.recommendations.length > 0 && (
                <div className="mt-4 rounded-xl border border-violet-400/25 bg-violet-500/10 p-3.5">
                  <h3 className="mb-2 text-xs font-bold text-violet-300">
                    <Sparkles
                      aria-hidden="true"
                      className="mr-1 inline size-3.5"
                    />
                    AI Score Booster Tips
                  </h3>
                  <ul className="space-y-1.5 pl-4 text-xs leading-5 text-slate-300">
                    {analysis.recommendations.map((recommendation) => (
                      <li className="list-disc" key={recommendation}>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button
                  className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                  onClick={downloadReport}
                  variant="outline"
                >
                  <Download aria-hidden="true" />
                  Download Audit Report
                </Button>
                <Dialog.Close
                  render={
                    <Button className="border-0 bg-linear-to-r from-violet-600 to-cyan-500 text-white hover:brightness-110" />
                  }
                >
                  Done &amp; Close
                </Dialog.Close>
              </div>
              <p className="mt-3 text-[11px] leading-4 text-slate-500">
                This is an AI-based estimate, not a guaranteed score from a
                specific employer&apos;s ATS.
              </p>
            </section>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
