"use client"

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  FileText,
  Info,
  Loader2,
  RotateCcw,
  Upload,
} from "lucide-react"
import api from "@/lib/axios"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"]

type ResumeFile = {
  name: string
  size: number
}

function formatFileSize(size: number) {
  return size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`
}

function getStoredUserId(): string {
  if (typeof window === "undefined") return ""
  try {
    const raw = localStorage.getItem("user")
    if (!raw) return ""
    const parsed = JSON.parse(raw)
    return parsed?.id || parsed?._id || ""
  } catch {
    return ""
  }
}

export default function ResumePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [resumeFile, setResumeFile] = useState<ResumeFile | null>(null)
  const [uploadedRawFile, setUploadedRawFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState("")
  const [analysisError, setAnalysisError] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const uid = getStoredUserId()
    setUserId(uid)

    // 1. Restore Job Description from localStorage
    const savedJd =
      (uid ? localStorage.getItem(`jobprep_jd_${uid}`) : null) ||
      localStorage.getItem("jobprep_jd") ||
      ""
    if (savedJd) {
      setJobDescription(savedJd)
    }

    // 2. Restore Resume Metadata from localStorage
    const savedResumeMeta =
      (uid ? localStorage.getItem(`jobprep_resume_meta_${uid}`) : null) ||
      localStorage.getItem("jobprep_resume_meta")
    if (savedResumeMeta) {
      try {
        const meta = JSON.parse(savedResumeMeta)
        if (meta && typeof meta.name === "string") {
          setResumeFile(meta)
        }
      } catch {}
    }

    // 3. Try to restore cached raw file from sessionStorage
    try {
      const cachedData =
        (uid ? sessionStorage.getItem(`jobprep_uploaded_resume_data_${uid}`) : null) ||
        sessionStorage.getItem("jobprep_uploaded_resume_data")
      const cachedName =
        (uid ? sessionStorage.getItem(`jobprep_uploaded_resume_name_${uid}`) : null) ||
        sessionStorage.getItem("jobprep_uploaded_resume_name")
      const cachedType =
        (uid ? sessionStorage.getItem(`jobprep_uploaded_resume_type_${uid}`) : null) ||
        sessionStorage.getItem("jobprep_uploaded_resume_type")

      if (cachedData && cachedName) {
        fetch(cachedData)
          .then((res) => res.blob())
          .then((blob) => {
            const reconstructed = new File([blob], cachedName, {
              type: cachedType || blob.type || "application/pdf",
            })
            setUploadedRawFile(reconstructed)
          })
          .catch(() => {})
      }
    } catch {}

    // 4. Fallback check: if JD or resume still empty, check latest analysis
    const existingAnalysisRaw =
      (uid ? localStorage.getItem(`jobprep_latest_analysis_${uid}`) : null) ||
      localStorage.getItem("jobprep_latest_analysis")
    if (existingAnalysisRaw) {
      try {
        const analysis = JSON.parse(existingAnalysisRaw)
        if (!savedJd && analysis?.jobDescription) {
          setJobDescription(analysis.jobDescription)
        }
        if (!savedResumeMeta && analysis?.resumeFileName) {
          setResumeFile({ name: analysis.resumeFileName, size: 0 })
        }
      } catch {}
    } else {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token) {
        api.get("/ai-analysis/latest")
          .then((res) => {
            if (res.data?.success && res.data?.data) {
              const d = res.data.data
              if (!savedJd && d.jobDescription) {
                setJobDescription(d.jobDescription)
              }
              if (!savedResumeMeta && d.resumeFileName) {
                setResumeFile({ name: d.resumeFileName, size: 0 })
              }
            }
          })
          .catch(() => {})
      }
    }
  }, [])

  const isJobDescriptionValid = jobDescription.trim().length >= 10
  const canContinue =
    isJobDescriptionValid &&
    (uploadedRawFile !== null || resumeFile !== null) &&
    !isAnalyzing

  const handleJobDescriptionChange = (val: string) => {
    setJobDescription(val)
    try {
      const uid = userId || getStoredUserId()
      if (uid) {
        localStorage.setItem(`jobprep_jd_${uid}`, val)
      }
      localStorage.setItem("jobprep_jd", val)
    } catch {}
  }

  const selectFile = (file?: File) => {
    if (!file) return

    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFileError("Choose a PDF, DOCX, or TXT file.")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Your file is larger than the 5MB limit.")
      return
    }
    if (file.size === 0) {
      setFileError("This file is empty. Choose a different resume.")
      return
    }

    const meta: ResumeFile = { name: file.name, size: file.size }
    setResumeFile(meta)
    setUploadedRawFile(file)
    setFileError("")
    setAnalysisError("")

    try {
      const uid = userId || getStoredUserId()
      if (uid) {
        localStorage.setItem(`jobprep_resume_meta_${uid}`, JSON.stringify(meta))
      }
      localStorage.setItem("jobprep_resume_meta", JSON.stringify(meta))

      const reader = new FileReader()
      reader.onload = () => {
        try {
          const base64 = reader.result as string
          if (uid) {
            sessionStorage.setItem(`jobprep_uploaded_resume_data_${uid}`, base64)
            sessionStorage.setItem(`jobprep_uploaded_resume_name_${uid}`, file.name)
            sessionStorage.setItem(`jobprep_uploaded_resume_type_${uid}`, file.type)
          }
          sessionStorage.setItem("jobprep_uploaded_resume_data", base64)
          sessionStorage.setItem("jobprep_uploaded_resume_name", file.name)
          sessionStorage.setItem("jobprep_uploaded_resume_type", file.type)
        } catch (e) {
          console.warn("Could not cache file data in sessionStorage:", e)
        }
      }
      reader.readAsDataURL(file)
    } catch {}
  }

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.currentTarget.files?.[0])
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files?.[0])
  }

  const continueToAnalysis = async () => {
    if (!canContinue || isAnalyzing) return
    setIsAnalyzing(true)
    setAnalysisError("")
    setFileError("")

    const uid = userId || getStoredUserId()

    // Always preserve JD and Resume immediately
    try {
      if (uid) {
        localStorage.setItem(`jobprep_jd_${uid}`, jobDescription.trim())
        if (resumeFile) {
          localStorage.setItem(`jobprep_resume_meta_${uid}`, JSON.stringify(resumeFile))
        }
      }
      localStorage.setItem("jobprep_jd", jobDescription.trim())
      if (resumeFile) {
        localStorage.setItem("jobprep_resume_meta", JSON.stringify(resumeFile))
      }
    } catch {}

    try {
      if (uploadedRawFile) {
        const formData = new FormData()
        formData.append("resume", uploadedRawFile)
        formData.append("jobDescription", jobDescription.trim())

        const res = await api.post("/ai-analysis/analyze", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (res.data?.success && res.data?.data) {
          const analysisData = res.data.data
          if (!analysisData.jobDescription) {
            analysisData.jobDescription = jobDescription.trim()
          }

          if (uid) {
            localStorage.setItem(
              `jobprep_latest_analysis_${uid}`,
              JSON.stringify(analysisData)
            )
            localStorage.setItem(`jobprep_analysis_unlocked_${uid}`, "true")
          }

          // Always store fallback keys
          localStorage.setItem(
            "jobprep_latest_analysis",
            JSON.stringify(analysisData)
          )
          localStorage.setItem("jobprep_analysis_unlocked", "true")

          window.dispatchEvent(new Event("jobprep_unlocked"))
          window.dispatchEvent(new Event("storage"))
          router.push("/user/ai-analysis")
          return
        } else {
          throw new Error(res.data?.message || "Failed to analyze resume.")
        }
      } else {
        // Check if we already have an existing analysis to proceed to
        const existingStored =
          (uid ? localStorage.getItem(`jobprep_latest_analysis_${uid}`) : null) ||
          localStorage.getItem("jobprep_latest_analysis")

        if (existingStored) {
          try {
            await api.post("/interview-prep/generate")
          } catch (e) {
            console.warn("Could not generate interview prep on Step 2 reuse:", e)
          }
          router.push("/user/ai-analysis")
          return
        }

        setFileError("Please choose your resume file to run AI analysis.")
      }
    } catch (err: any) {
      console.error("AI Analysis error:", err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to connect to AI analysis service. Please try again."
      setAnalysisError(msg)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl pb-8">
      <header className="mb-7">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-200">
            Step 1 of 2
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[26px]">
          Step 1:{" "}
          <span className="bg-linear-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
            Job Description &amp; Resume
          </span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Paste the target job description and upload your resume to unlock Step 2 AI analysis.
        </p>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="sr-only"
        onChange={handleFileSelect}
        aria-label="Choose a resume file"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(3,2,20,0.18)] sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <label
              htmlFor="job-description"
              className="text-[15px] font-bold text-white"
            >
              Job Description <span className="text-rose-400">*</span>
            </label>
            {isJobDescriptionValid ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                <Check className="size-3" />
                Filled
              </span>
            ) : (
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                * Required
              </span>
            )}
          </div>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) => handleJobDescriptionChange(event.target.value)}
            placeholder={`Paste target job description here...\n\nExample:\nSenior Frontend Engineer at Stripe\nWe are looking for a Senior Frontend Engineer to build scalable React & TypeScript web applications...`}
            className={`min-h-[280px] w-full resize-y rounded-xl border bg-[#0c0b20]/70 p-4 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/15 ${
              jobDescription.length > 0 && !isJobDescriptionValid
                ? "border-amber-400/40"
                : "border-white/10"
            }`}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs text-slate-500">
              {jobDescription.length} chars ·{" "}
              {jobDescription.split(/\s+/).filter(Boolean).length} words
            </span>
            {isJobDescriptionValid ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                ✓ Ready
              </span>
            ) : jobDescription.length > 0 ? (
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                Min 10 chars
              </span>
            ) : (
              <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                Required
              </span>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
            <div className="mb-1 flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-bold text-white">
                Upload Resume <span className="text-rose-400">*</span>
              </h2>
              {resumeFile ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  <Check className="size-3" />
                  Uploaded
                </span>
              ) : (
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                  * Required
                </span>
              )}
            </div>
            <p className="mb-4 text-xs leading-5 text-slate-400">
              PDF, DOCX, or TXT · Max 5MB · Upload the resume you want to analyze.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${
                isDragging
                  ? "border-violet-400/70 bg-violet-500/10"
                  : resumeFile
                    ? "border-emerald-400/35 bg-emerald-400/[0.045]"
                    : "border-white/15 bg-white/[0.015] hover:border-violet-400/45 hover:bg-violet-500/[0.04]"
              }`}
              aria-label={
                resumeFile
                  ? "Choose a different resume file"
                  : "Drop your resume here or click to browse"
              }
            >
              {resumeFile ? (
                <>
                  <span className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                    <FileText className="size-6" />
                  </span>
                  <span className="max-w-full break-all text-sm font-semibold text-emerald-300">
                    {resumeFile.name}
                  </span>
                  <span className="mt-1 text-xs text-slate-400">
                    {formatFileSize(resumeFile.size)} · Ready for analysis
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <RotateCcw className="size-3" />
                    Click or drop to replace
                  </span>
                </>
              ) : (
                <>
                  <span className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-200">
                    <Upload className="size-6" />
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Drop your resume here
                  </span>
                  <span className="mt-1 text-xs text-slate-400">
                    or click to browse files
                  </span>
                  <span className="mt-3 flex gap-1.5">
                    {["PDF", "DOCX", "TXT"].map((type) => (
                      <span
                        key={type}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300"
                      >
                        {type}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </button>

            {fileError && (
              <p
                className="mt-3 flex items-start gap-2 text-xs leading-5 text-rose-300"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {fileError}
              </p>
            )}
          </section>

          {analysisError && (
            <div
              className="flex items-start gap-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs leading-5 text-rose-300"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-400" />
              <span>{analysisError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={!canContinue}
            onClick={continueToAnalysis}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
              canContinue
                ? "border-white/20 bg-linear-to-r from-violet-600 to-cyan-500 text-white shadow-[0_8px_24px_rgba(124,58,237,0.28)] hover:brightness-110"
                : "cursor-not-allowed border-white/10 bg-white/[0.07] text-slate-500"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="size-4 animate-spin text-white" />
                Validating Data &amp; Generating AI Analysis &amp; Interview Q&amp;A...
              </>
            ) : (
              <>
                Step 2: Validate Data &amp; Proceed to AI Analysis
                <ArrowRight className="size-4 shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-violet-300/10 bg-violet-400/[0.055] px-4 py-3.5 sm:items-center">
        <Info className="mt-0.5 size-5 shrink-0 text-violet-300 sm:mt-0" />
        <p className="text-xs leading-5 text-slate-300">
          <span className="font-semibold text-white">Pro tip: </span>
          Both the Job Description and Resume are required. Once both are provided, the Step 2 button will be enabled.
        </p>
      </aside>
    </main>
  )
}
