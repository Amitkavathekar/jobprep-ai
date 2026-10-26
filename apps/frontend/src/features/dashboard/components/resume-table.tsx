"use client"

import {
  Copy,
  Download,
  FilePenLine,
  FileText,
  Loader2,
  Pin,
  Search,
  Sparkles,
  Trash2,
  X,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"

export interface WorkExperienceItem {
  company: string
  position: string
  duration: string
  description: string
}

export interface EducationItem {
  degree: string
  institution: string
  year: string
}

export interface ProjectItem {
  name: string
  description: string
  technologies: string
}

export interface ResumeSectionItem {
  title: string
  content: string
  isHeader?: boolean
  highlights?: string[]
}

export interface ResumeData {
  _id: string
  resume_title: string
  candidate_name?: string
  contact_info?: string
  job_title?: string
  latest_company_name?: string
  total_experience?: number
  resume_summary?: string
  skills?: string[]
  work_experience?: WorkExperienceItem[]
  education?: EducationItem[]
  projects?: ProjectItem[]
  resume_sections?: ResumeSectionItem[]
  job_description_raw?: string
  resume_raw_text?: string
  ats_score?: number
  is_pinned?: boolean
  file_name?: string
  createdAt?: string
  updatedAt?: string
}

const itemsPerPage = 4

export function ResumeTable() {
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Modals state
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null)
  const [resumeToEdit, setResumeToEdit] = useState<ResumeData | null>(null)
  const [resumeToDelete, setResumeToDelete] = useState<ResumeData | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotification({ type, text })
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr))
    }, 4000)
  }

  const fetchResumes = async () => {
    try {
      setLoading(true)
      const res = await api.get("/resume")
      if (res.data?.success && Array.isArray(res.data.data)) {
        setResumes(res.data.data)
      } else {
        setResumes([])
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err)
      setResumes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  // Filtered resumes based on search query
  const filteredResumes = useMemo(() => {
    if (!searchQuery.trim()) return resumes
    const query = searchQuery.toLowerCase().trim()
    return resumes.filter((r) => {
      const title = (r.resume_title || "").toLowerCase()
      const job = (r.job_title || "").toLowerCase()
      const candidate = (r.candidate_name || "").toLowerCase()
      const company = (r.latest_company_name || "").toLowerCase()
      const skillsStr = (r.skills || []).join(" ").toLowerCase()
      return (
        title.includes(query) ||
        job.includes(query) ||
        candidate.includes(query) ||
        company.includes(query) ||
        skillsStr.includes(query)
      )
    })
  }, [resumes, searchQuery])

  const totalPages = Math.ceil(filteredResumes.length / itemsPerPage)
  const page = Math.min(currentPage, Math.max(totalPages, 1))
  const startIndex = (page - 1) * itemsPerPage
  const visibleResumes = filteredResumes.slice(startIndex, startIndex + itemsPerPage)

  const notifyResumesUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("jobprep_resumes_updated"))
    }
  }

  // Toggle pin
  const handleTogglePin = async (resume: ResumeData) => {
    try {
      const res = await api.patch(`/resume/${resume._id}/pin`)
      if (res.data?.success && res.data.data) {
        setResumes((current) =>
          current
            .map((r) => (r._id === resume._id ? { ...r, is_pinned: res.data.data.is_pinned } : r))
            .sort((a, b) => {
              if (a.is_pinned && !b.is_pinned) return -1
              if (!a.is_pinned && b.is_pinned) return 1
              return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
            })
        )
        showToast(
          res.data.data.is_pinned
            ? `Pinned "${resume.resume_title}"`
            : `Unpinned "${resume.resume_title}"`
        )
      }
    } catch {
      showToast("Failed to update pin status", "error")
    }
  }

  // Duplicate resume
  const handleDuplicate = async (resume: ResumeData) => {
    try {
      setActionLoading(true)
      const res = await api.post(`/resume/${resume._id}/duplicate`)
      if (res.data?.success && res.data.data) {
        setResumes((current) => [res.data.data, ...current])
        notifyResumesUpdated()
        showToast(`Created copy of "${resume.resume_title}"`)
      }
    } catch {
      showToast("Failed to duplicate resume", "error")
    } finally {
      setActionLoading(false)
    }
  }

  // Delete resume
  const confirmDelete = async () => {
    if (!resumeToDelete) return
    try {
      setActionLoading(true)
      const res = await api.delete(`/resume/${resumeToDelete._id}`)
      if (res.data?.success) {
        setResumes((current) => current.filter((r) => r._id !== resumeToDelete._id))
        notifyResumesUpdated()
        showToast(`Deleted "${resumeToDelete.resume_title}"`)
        setResumeToDelete(null)
      } else {
        showToast(res.data?.message || "Failed to delete resume", "error")
      }
    } catch {
      showToast("Failed to delete resume", "error")
    } finally {
      setActionLoading(false)
    }
  }

  // Download resume as formatted document
  const downloadResume = (resume: ResumeData) => {
    const lines: string[] = []

    lines.push("=".repeat(50))
    lines.push(resume.candidate_name || resume.resume_title)
    if (resume.job_title) lines.push(`Target Role: ${resume.job_title}`)
    if (resume.contact_info) lines.push(`Contact: ${resume.contact_info}`)
    if (resume.latest_company_name && resume.latest_company_name !== "N/A") {
      lines.push(`Company: ${resume.latest_company_name}`)
    }
    if (resume.total_experience) {
      lines.push(`Experience: ${resume.total_experience} years`)
    }
    lines.push("=".repeat(50))
    lines.push("")

    if (resume.resume_summary) {
      lines.push("--- PROFESSIONAL SUMMARY ---")
      lines.push(resume.resume_summary)
      lines.push("")
    }

    if (resume.skills && resume.skills.length > 0) {
      lines.push("--- KEY SKILLS ---")
      lines.push(resume.skills.join(", "))
      lines.push("")
    }

    if (resume.work_experience && resume.work_experience.length > 0) {
      lines.push("--- WORK EXPERIENCE ---")
      resume.work_experience.forEach((exp) => {
        lines.push(`${exp.position} - ${exp.company} (${exp.duration || "Present"})`)
        if (exp.description) lines.push(exp.description)
        lines.push("")
      })
    }

    if (resume.projects && resume.projects.length > 0) {
      lines.push("--- PROJECTS ---")
      resume.projects.forEach((proj) => {
        lines.push(proj.name)
        if (proj.technologies) lines.push(`Tech: ${proj.technologies}`)
        if (proj.description) lines.push(proj.description)
        lines.push("")
      })
    }

    if (resume.education && resume.education.length > 0) {
      lines.push("--- EDUCATION ---")
      resume.education.forEach((edu) => {
        lines.push(`${edu.degree} - ${edu.institution} (${edu.year || ""})`)
      })
      lines.push("")
    }

    if (
      (!resume.work_experience || resume.work_experience.length === 0) &&
      resume.resume_sections &&
      resume.resume_sections.length > 0
    ) {
      resume.resume_sections.forEach((sec) => {
        if (!sec.isHeader) {
          lines.push(`--- ${sec.title.toUpperCase()} ---`)
          lines.push(sec.content)
          lines.push("")
        }
      })
    }

    const content = lines.join("\n")
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    const safeTitle = (resume.resume_title || "Resume").replace(/[^a-z0-9_-]+/gi, "_")
    anchor.href = url
    anchor.download = `${safeTitle}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-md transition-all ${
            notification.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-200 shadow-emerald-900/30"
              : "border-red-500/40 bg-red-950/80 text-red-200 shadow-red-900/30"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="size-4 text-emerald-400" />
          ) : (
            <X className="size-4 text-red-400" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <section
        aria-labelledby="dashboard-resumes-heading"
        className="flex min-h-[395px] flex-col rounded-2xl border border-white/10 bg-linear-to-br from-violet-300/10 via-slate-900/60 to-cyan-300/5 p-5 sm:p-6"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2
              className="text-xl font-bold tracking-tight text-white"
              id="dashboard-resumes-heading"
            >
              Resumes
            </h2>
            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
              {resumes.length} saved
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 w-44 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-2.5 text-xs text-white placeholder-slate-400 outline-none transition focus:border-violet-400 focus:bg-[#0c0b20] sm:w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex h-56 flex-col items-center justify-center gap-3">
              <Loader2 className="size-6 animate-spin text-violet-400" />
              <p className="text-xs text-slate-400">Loading your saved resumes...</p>
            </div>
          ) : (
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-[13px] font-semibold text-slate-200/80">
                  <th className="px-3 py-3">Resume Name</th>
                  <th className="px-3 py-3">Role / Target</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">
                    Last edit <span aria-hidden="true">↓</span>
                  </th>
                  <th className="w-44 px-3 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleResumes.map((resume) => {
                  const createdDate = resume.createdAt
                    ? new Date(resume.createdAt).toLocaleDateString()
                    : "Recent"
                  const updatedDate = resume.updatedAt
                    ? new Date(resume.updatedAt).toLocaleDateString()
                    : "Latest"

                  return (
                    <tr
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                      key={resume._id}
                    >
                      <td className="max-w-[240px] px-3 py-3.5 text-[13px] font-medium text-white">
                        <button
                          className="flex max-w-full items-center gap-2 text-left text-violet-300 hover:text-violet-200 hover:underline"
                          onClick={() => setSelectedResume(resume)}
                          title={`Preview ${resume.resume_title}`}
                          type="button"
                        >
                          <FileText
                            aria-hidden="true"
                            className="size-4 shrink-0 text-slate-300/80"
                          />
                          <span className="truncate">{resume.resume_title || "Untitled Resume"}</span>
                          {resume.is_pinned && (
                            <Pin className="size-3 shrink-0 fill-amber-400 text-amber-400" />
                          )}
                        </button>
                      </td>

                      <td className="max-w-[160px] truncate px-3 py-3.5 text-xs text-slate-300">
                        {resume.job_title || "Candidate"}
                        {resume.ats_score ? (
                          <span className="ml-1.5 inline-block rounded-md border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                            {resume.ats_score}% ATS
                          </span>
                        ) : null}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3.5 font-mono text-xs text-slate-400">
                        {createdDate}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-slate-400">
                        {updatedDate}
                      </td>

                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit Button */}
                          <Button
                            aria-label={`Edit ${resume.resume_title}`}
                            className="text-slate-300 hover:text-cyan-300"
                            onClick={() => setResumeToEdit(resume)}
                            size="icon-xs"
                            title="Edit resume details"
                            variant="ghost"
                          >
                            <FilePenLine aria-hidden="true" className="size-3.5" />
                          </Button>

                          {/* Download Button */}
                          <Button
                            aria-label={`Download ${resume.resume_title}`}
                            className="text-slate-300 hover:text-sky-300"
                            onClick={() => downloadResume(resume)}
                            size="icon-xs"
                            title="Download resume"
                            variant="ghost"
                          >
                            <Download aria-hidden="true" className="size-3.5" />
                          </Button>

                          {/* Duplicate Button */}
                          <Button
                            aria-label={`Duplicate ${resume.resume_title}`}
                            className="text-slate-300 hover:text-emerald-300"
                            onClick={() => handleDuplicate(resume)}
                            disabled={actionLoading}
                            size="icon-xs"
                            title="Duplicate resume"
                            variant="ghost"
                          >
                            <Copy aria-hidden="true" className="size-3.5" />
                          </Button>

                          {/* Pin Button */}
                          <Button
                            aria-label={
                              resume.is_pinned
                                ? `Unpin ${resume.resume_title}`
                                : `Pin ${resume.resume_title}`
                            }
                            className={
                              resume.is_pinned
                                ? "text-amber-400 hover:text-amber-300"
                                : "text-slate-300 hover:text-amber-300"
                            }
                            onClick={() => handleTogglePin(resume)}
                            size="icon-xs"
                            title={resume.is_pinned ? "Unpin resume" : "Pin resume to top"}
                            variant="ghost"
                          >
                            <Pin
                              aria-hidden="true"
                              className={`size-3.5 ${resume.is_pinned ? "fill-current" : ""}`}
                            />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            aria-label={`Delete ${resume.resume_title}`}
                            className="text-slate-300 hover:text-red-400"
                            onClick={() => setResumeToDelete(resume)}
                            size="icon-xs"
                            title="Delete resume"
                            variant="ghost"
                          >
                            <Trash2 aria-hidden="true" className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {visibleResumes.length === 0 && (
                  <tr>
                    <td className="py-12 text-center" colSpan={5}>
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <span className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300 shadow-lg shadow-violet-500/10">
                          <FileText aria-hidden="true" className="size-6" />
                        </span>
                        <p className="text-base font-semibold text-white">
                          {searchQuery ? "No matching resumes found" : "No resumes saved yet"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {searchQuery
                            ? `Try clearing your search term "${searchQuery}"`
                            : "Your analyzed and saved resumes will appear here automatically."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <p className="text-xs text-slate-400/70">
              Showing{" "}
              <span className="font-semibold text-white">{startIndex + 1}</span>{" "}
              to{" "}
              <span className="font-semibold text-white">
                {Math.min(startIndex + itemsPerPage, filteredResumes.length)}
              </span>{" "}
              of <span className="font-semibold text-white">{filteredResumes.length}</span>{" "}
              resumes
            </p>
            <nav aria-label="Resume pages" className="flex items-center gap-1.5">
              <Button
                className="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/10"
                disabled={page === 1}
                onClick={() => setCurrentPage((current) => current - 1)}
                size="sm"
                variant="outline"
              >
                ← Prev
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Button
                    aria-current={pageNumber === page ? "page" : undefined}
                    aria-label={`Page ${pageNumber}`}
                    className={
                      pageNumber === page
                        ? "border-0 bg-linear-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20"
                        : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/10"
                    }
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    size="icon"
                    variant="outline"
                  >
                    {pageNumber}
                  </Button>
                )
              )}
              <Button
                className="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/10"
                disabled={page === totalPages}
                onClick={() => setCurrentPage((current) => current + 1)}
                size="sm"
                variant="outline"
              >
                Next →
              </Button>
            </nav>
          </div>
        )}
      </section>

      {/* ========================================================
          RESUME PREVIEW MODAL
      ======================================================== */}
      {selectedResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07071a]/80 p-4 backdrop-blur-md overflow-y-auto"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedResume(null)
          }}
        >
          <section
            aria-labelledby="resume-preview-title"
            aria-modal="true"
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/15 bg-[#0f0e26] p-6 shadow-2xl shadow-black/60 overflow-hidden"
            role="dialog"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-violet-300">
                  <Sparkles className="size-3" /> Resume Preview
                </span>
                <h2
                  className="mt-2 text-xl font-bold text-white"
                  id="resume-preview-title"
                >
                  {selectedResume.resume_title}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedResume.candidate_name || "Candidate"} ·{" "}
                  {selectedResume.job_title || "Target Role"}
                </p>
              </div>
              <Button
                aria-label="Close resume preview"
                className="text-slate-300 hover:text-white"
                onClick={() => setSelectedResume(null)}
                size="icon"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Quick Details Bar */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                <div>
                  <dt className="text-slate-400">Target Role</dt>
                  <dd className="mt-0.5 font-medium text-slate-100 truncate">
                    {selectedResume.job_title || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Latest Company</dt>
                  <dd className="mt-0.5 font-medium text-slate-100 truncate">
                    {selectedResume.latest_company_name || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Total Experience</dt>
                  <dd className="mt-0.5 font-medium text-cyan-300">
                    {selectedResume.total_experience ? `${selectedResume.total_experience} Years` : "Fresher"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Contact</dt>
                  <dd className="mt-0.5 font-medium text-slate-100 truncate" title={selectedResume.contact_info}>
                    {selectedResume.contact_info || "Not set"}
                  </dd>
                </div>
              </dl>

              {/* Summary */}
              {selectedResume.resume_summary && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Summary
                  </h3>
                  <p className="rounded-xl border border-white/5 bg-[#090819] p-3 text-xs text-slate-200 leading-relaxed">
                    {selectedResume.resume_summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedResume.skills && selectedResume.skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Skills &amp; Technologies
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResume.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {selectedResume.work_experience && selectedResume.work_experience.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <Briefcase className="size-3.5 text-violet-400" /> Work Experience
                  </h3>
                  <div className="space-y-2.5">
                    {selectedResume.work_experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/5 bg-[#090819] p-3 text-xs"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-semibold text-white">{exp.position}</p>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {exp.duration}
                          </span>
                        </div>
                        <p className="text-violet-300 font-medium mt-0.5">{exp.company}</p>
                        {exp.description && (
                          <p className="mt-2 text-slate-300 whitespace-pre-line leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {selectedResume.projects && selectedResume.projects.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <FolderGit2 className="size-3.5 text-cyan-400" /> Projects
                  </h3>
                  <div className="space-y-2.5">
                    {selectedResume.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/5 bg-[#090819] p-3 text-xs"
                      >
                        <p className="font-semibold text-white">{proj.name}</p>
                        {proj.technologies && (
                          <p className="text-[11px] text-cyan-300 mt-0.5">
                            Tech: {proj.technologies}
                          </p>
                        )}
                        {proj.description && (
                          <p className="mt-1.5 text-slate-300 leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedResume.education && selectedResume.education.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <GraduationCap className="size-3.5 text-amber-400" /> Education
                  </h3>
                  <div className="space-y-2">
                    {selectedResume.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center rounded-xl border border-white/5 bg-[#090819] p-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white">{edu.degree}</p>
                          <p className="text-slate-400">{edu.institution}</p>
                        </div>
                        {edu.year && (
                          <span className="text-[11px] font-mono text-slate-400">
                            {edu.year}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume Sections fallback (if created via AI Analysis) */}
              {(!selectedResume.work_experience || selectedResume.work_experience.length === 0) &&
                selectedResume.resume_sections &&
                selectedResume.resume_sections.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Parsed Resume Sections
                    </h3>
                    <div className="space-y-3">
                      {selectedResume.resume_sections.map((sec, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/5 bg-[#090819] p-3 text-xs"
                        >
                          <p className="font-semibold text-violet-300 mb-1">{sec.title}</p>
                          <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                            {sec.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
              <Button
                className="border-white/10 text-slate-200"
                onClick={() => setSelectedResume(null)}
                variant="outline"
              >
                Close
              </Button>
              <Button
                className="border-white/10 text-slate-200 hover:text-white"
                onClick={() => downloadResume(selectedResume)}
                variant="outline"
              >
                <Download className="mr-1.5 size-3.5" />
                Download
              </Button>
              <Button
                className="border-0 bg-linear-to-r from-violet-600 to-cyan-600 text-white"
                onClick={() => {
                  const r = selectedResume
                  setSelectedResume(null)
                  setResumeToEdit(r)
                }}
              >
                <FilePenLine className="mr-1.5 size-3.5" />
                Edit Resume
              </Button>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================
          EDIT RESUME MODAL
      ======================================================== */}
      {resumeToEdit && (
        <ResumeFormModal
          initialData={resumeToEdit}
          isOpen={Boolean(resumeToEdit)}
          onClose={() => setResumeToEdit(null)}
          onSuccess={(updatedResume) => {
            setResumes((current) =>
              current.map((r) => (r._id === updatedResume._id ? updatedResume : r))
            )
            notifyResumesUpdated()
            showToast(`Resume "${updatedResume.resume_title}" updated successfully!`)
            setResumeToEdit(null)
          }}
        />
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
      ======================================================== */}
      {resumeToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07071a]/80 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget && !actionLoading) setResumeToDelete(null)
          }}
        >
          <section
            aria-labelledby="delete-resume-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-red-500/25 bg-[#0f0e26] p-6 shadow-2xl shadow-black/60"
            role="alertdialog"
          >
            <h2
              className="text-lg font-bold text-white flex items-center gap-2"
              id="delete-resume-title"
            >
              <Trash2 className="size-5 text-red-400" /> Delete resume?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-violet-300">
                “{resumeToDelete.resume_title}”
              </span>
              ? This resume will be permanently removed from your account.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                className="border-white/10 text-slate-200"
                disabled={actionLoading}
                onClick={() => setResumeToDelete(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600 font-semibold"
                disabled={actionLoading}
                onClick={confirmDelete}
              >
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="mr-1.5 size-4" />
                    Delete resume
                  </>
                )}
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

// ========================================================================
// RESUME FORM MODAL (For Editing Resume Details)
// ========================================================================
interface ResumeFormModalProps {
  isOpen: boolean
  initialData?: ResumeData
  onClose: () => void
  onSuccess: (resume: ResumeData) => void
}

function ResumeFormModal({ initialData, isOpen, onClose, onSuccess }: ResumeFormModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "experience" | "education" | "projects">("basic")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Form Fields
  const [resumeTitle, setResumeTitle] = useState(initialData?.resume_title || "")
  const [candidateName, setCandidateName] = useState(initialData?.candidate_name || "")
  const [contactInfo, setContactInfo] = useState(initialData?.contact_info || "")
  const [jobTitle, setJobTitle] = useState(initialData?.job_title || "")
  const [companyName, setCompanyName] = useState(initialData?.latest_company_name || "")
  const [totalExperience, setTotalExperience] = useState(String(initialData?.total_experience ?? 0))
  const [summary, setSummary] = useState(initialData?.resume_summary || "")
  const [skillsText, setSkillsText] = useState((initialData?.skills || []).join(", "))

  // Dynamic lists
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceItem[]>(
    initialData?.work_experience && initialData.work_experience.length > 0
      ? initialData.work_experience
      : [
          {
            company: initialData?.latest_company_name || "",
            position: initialData?.job_title || "",
            duration: "",
            description: "",
          },
        ]
  )

  const [educations, setEducations] = useState<EducationItem[]>(
    initialData?.education && initialData.education.length > 0
      ? initialData.education
      : [{ degree: "", institution: "", year: "" }]
  )

  const [projects, setProjects] = useState<ProjectItem[]>(
    initialData?.projects && initialData.projects.length > 0
      ? initialData.projects
      : [{ name: "", description: "", technologies: "" }]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeTitle.trim()) {
      setFormError("Resume title is required.")
      setActiveTab("basic")
      return
    }

    setSubmitting(true)
    setFormError("")

    try {
      const skillsArray = skillsText
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)

      const payload = {
        resume_title: resumeTitle.trim(),
        candidate_name: candidateName.trim(),
        contact_info: contactInfo.trim(),
        job_title: jobTitle.trim() || "Candidate",
        latest_company_name: companyName.trim() || "N/A",
        total_experience: parseFloat(totalExperience) || 0,
        resume_summary: summary.trim(),
        skills: skillsArray,
        work_experience: workExperiences.filter((w) => w.company.trim() || w.position.trim()),
        education: educations.filter((edu) => edu.degree.trim() || edu.institution.trim()),
        projects: projects.filter((p) => p.name.trim()),
      }

      const res = await api.put(`/resume/${initialData?._id}`, payload)

      if (res.data?.success && res.data.data) {
        onSuccess(res.data.data)
      } else {
        setFormError(res.data?.message || "Failed to save resume.")
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "An error occurred while saving.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07071a]/80 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <section
        aria-labelledby="resume-form-title"
        aria-modal="true"
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-white/15 bg-[#0f0e26] p-6 shadow-2xl shadow-black/60 overflow-hidden"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2" id="resume-form-title">
              <FilePenLine className="size-4 text-violet-400" />
              Edit: {initialData?.resume_title}
            </h2>
            <p className="text-xs text-slate-400">
              Update details, skills, experience, or projects for this resume.
            </p>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10 pt-3 pb-2 text-xs">
          {[
            { id: "basic", label: "Basic & Summary", icon: Wrench },
            { id: "experience", label: "Work Experience", icon: Briefcase },
            { id: "education", label: "Education", icon: GraduationCap },
            { id: "projects", label: "Projects", icon: FolderGit2 },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                  active
                    ? "bg-violet-600/30 text-violet-200 border border-violet-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {formError && (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
            {formError}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
            {/* Tab: Basic & Summary */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Resume Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Full Stack Developer"
                      value={resumeTitle}
                      onChange={(e) => setResumeTitle(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#090819] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Target Role</label>
                    <input
                      type="text"
                      placeholder="e.g. React Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#090819] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Candidate Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#090819] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Latest / Current Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#090819] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Total Experience (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="e.g. 3.5"
                      value={totalExperience}
                      onChange={(e) => setTotalExperience(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#090819] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">
                    Contact Info (Email, Phone, Location, Portfolio, LinkedIn)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. john@example.com · +1 234 567 8900 · New York, NY · linkedin.com/in/john"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#090819] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Next.js, Node.js, Express, MongoDB, Tailwind CSS, Git"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#090819] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">
                    Professional Summary
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Results-oriented Full Stack Developer with 3+ years of experience crafting high-performance web applications..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#090819] p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-400 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Tab: Work Experience */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-300">Work Experience Entries</p>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkExperiences([
                        ...workExperiences,
                        { company: "", position: "", duration: "", description: "" },
                      ])
                    }
                    className="flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    + Add Experience
                  </button>
                </div>

                {workExperiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-[#090819] p-3.5 space-y-3 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider">
                        Role #{idx + 1}
                      </span>
                      {workExperiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setWorkExperiences(workExperiences.filter((_, i) => i !== idx))
                          }
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400">Position / Title</label>
                        <input
                          type="text"
                          placeholder="Software Engineer"
                          value={exp.position}
                          onChange={(e) => {
                            const updated = [...workExperiences]
                            updated[idx].position = e.target.value
                            setWorkExperiences(updated)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Company</label>
                        <input
                          type="text"
                          placeholder="Google / Startup"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...workExperiences]
                            updated[idx].company = e.target.value
                            setWorkExperiences(updated)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Duration</label>
                        <input
                          type="text"
                          placeholder="Jan 2023 - Present"
                          value={exp.duration}
                          onChange={(e) => {
                            const updated = [...workExperiences]
                            updated[idx].duration = e.target.value
                            setWorkExperiences(updated)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400">Responsibilities &amp; Achievements</label>
                      <textarea
                        rows={3}
                        placeholder="• Architected and developed key features...&#10;• Reduced load time by 35% using Next.js..."
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...workExperiences]
                          updated[idx].description = e.target.value
                          setWorkExperiences(updated)
                        }}
                        className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] p-2.5 text-xs text-white outline-none focus:border-violet-400 leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Education */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-300">Education Details</p>
                  <button
                    type="button"
                    onClick={() =>
                      setEducations([...educations, { degree: "", institution: "", year: "" }])
                    }
                    className="flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    + Add Education
                  </button>
                </div>

                {educations.map((edu, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-[#090819] p-3.5 space-y-3 relative"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                        Degree #{idx + 1}
                      </span>
                      {educations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEducations(educations.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400">Degree / Certificate</label>
                        <input
                          type="text"
                          placeholder="B.S. in Computer Science"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...educations]
                            updated[idx].degree = e.target.value
                            setEducations(updated)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">University / College</label>
                        <input
                          type="text"
                          placeholder="Stanford University"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...educations]
                            updated[idx].institution = e.target.value
                            setEducations(updated)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Graduation Year</label>
                        <input
                          type="text"
                          placeholder="2024"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...educations]
                            updated[idx].year = e.target.value
                            setEducations(updated)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Projects */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-300">Featured Projects</p>
                  <button
                    type="button"
                    onClick={() =>
                      setProjects([
                        ...projects,
                        { name: "", description: "", technologies: "" },
                      ])
                    }
                    className="flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    + Add Project
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-[#090819] p-3.5 space-y-3 relative"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                        Project #{idx + 1}
                      </span>
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400">Project Name</label>
                        <input
                          type="text"
                          placeholder="AI Job Platform"
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...projects]
                            updated[idx].name = e.target.value
                            setProjects(updated)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Tech Stack</label>
                        <input
                          type="text"
                          placeholder="Next.js, TypeScript, Express, MongoDB"
                          value={proj.technologies}
                          onChange={(e) => {
                            const updated = [...projects]
                            updated[idx].technologies = e.target.value
                            setProjects(updated)
                          }}
                          className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white outline-none focus:border-violet-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400">Project Description</label>
                      <textarea
                        rows={2}
                        placeholder="Brief overview of project goals, features, and key metrics..."
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...projects]
                          updated[idx].description = e.target.value
                          setProjects(updated)
                        }}
                        className="mt-0.5 w-full rounded-lg border border-white/10 bg-white/[0.02] p-2 text-xs text-white outline-none focus:border-violet-400 leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex gap-1.5">
              {activeTab !== "basic" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (activeTab === "projects") setActiveTab("education")
                    else if (activeTab === "education") setActiveTab("experience")
                    else if (activeTab === "experience") setActiveTab("basic")
                  }}
                  className="border-white/10 text-xs text-slate-300"
                >
                  ← Back
                </Button>
              )}
              {activeTab !== "projects" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (activeTab === "basic") setActiveTab("experience")
                    else if (activeTab === "experience") setActiveTab("education")
                    else if (activeTab === "education") setActiveTab("projects")
                  }}
                  className="border-white/10 text-xs text-slate-300"
                >
                  Next Tab →
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={onClose}
                className="border-white/10 text-xs text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="border-0 bg-linear-to-r from-violet-600 to-cyan-600 text-xs font-semibold text-white shadow-md shadow-violet-500/20 hover:brightness-110"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 size-3.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
