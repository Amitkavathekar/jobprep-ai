"use client"

import {
  Download,
  FilePenLine,
  FileText,
  Pin,
  Trash2,
  X
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"

interface Resume {
  id: number
  name: string
  company: string
  score: string
  createdAt: string
  lastEdit: string
  title: string
}

const initialResumes: Resume[] = [
  {
    id: 1,
    name: "Data Analyst - TechCorp",
    company: "TechCorp",
    score: "90%",
    createdAt: "Sep 3, 2026",
    lastEdit: "1 day ago",
    title: "Senior Data Analyst",
  },
  {
    id: 2,
    name: "Data Visualization & Reporting Engineer",
    company: "Toyota Automation",
    score: "89%",
    createdAt: "Sep 3, 2026",
    lastEdit: "1 day ago",
    title: "Data Visualization Engineer",
  },
  {
    id: 3,
    name: "Data Engineer - Orinova Innovations",
    company: "Orinova Innovations",
    score: "99%",
    createdAt: "Sep 3, 2026",
    lastEdit: "2 days ago",
    title: "Data Engineer",
  },
  {
    id: 4,
    name: "Frontend Engineer - Google Prep",
    company: "Google",
    score: "92%",
    createdAt: "Sep 3, 2026",
    lastEdit: "2 days ago",
    title: "Senior Frontend Engineer",
  },
  {
    id: 5,
    name: "Data Analyst - Deloitte",
    company: "Deloitte",
    score: "88%",
    createdAt: "Aug 27, 2026",
    lastEdit: "4 days ago",
    title: "Analytics Consultant",
  },
  {
    id: 6,
    name: "Senior Full Stack Dev - Stripe",
    company: "Stripe",
    score: "94%",
    createdAt: "Aug 20, 2026",
    lastEdit: "5 days ago",
    title: "Full Stack Engineer",
  },
  {
    id: 7,
    name: "Backend Engineer - Amazon",
    company: "Amazon",
    score: "87%",
    createdAt: "Aug 15, 2026",
    lastEdit: "1 week ago",
    title: "Backend Engineer",
  },
  {
    id: 8,
    name: "UI/UX Developer - Notion",
    company: "Notion",
    score: "91%",
    createdAt: "Aug 10, 2026",
    lastEdit: "2 weeks ago",
    title: "Frontend Architect",
  },
]

const itemsPerPage = 3

export function ResumeTable() {
  const [resumes, setResumes] = useState(initialResumes)
  const [pinnedIds, setPinnedIds] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null)
  const totalPages = Math.ceil(resumes.length / itemsPerPage)
  const page = Math.min(currentPage, Math.max(totalPages, 1))
  const startIndex = (page - 1) * itemsPerPage
  const visibleResumes = resumes.slice(startIndex, startIndex + itemsPerPage)

  function downloadResume(resume: Resume) {
    const content = [
      resume.name,
      `Target role: ${resume.title}`,
      `Company: ${resume.company}`,
      `ATS match: ${resume.score}`,
    ].join("\n")
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${resume.name.replace(/[^a-z0-9]+/gi, "_")}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function confirmDelete() {
    if (!resumeToDelete) return
    setResumes((current) =>
      current.filter((resume) => resume.id !== resumeToDelete.id)
    )
    setPinnedIds((current) =>
      current.filter((id) => id !== resumeToDelete.id)
    )
    setCurrentPage((current) =>
      Math.min(current, Math.max(Math.ceil((resumes.length - 1) / itemsPerPage), 1))
    )
    setResumeToDelete(null)
  }

  return (
    <>
      <section
        aria-labelledby="dashboard-resumes-heading"
        className="flex min-h-[395px] flex-col rounded-2xl border border-white/10 bg-linear-to-br from-violet-300/10 via-slate-900/60 to-cyan-300/5 p-5 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            className="text-xl font-bold tracking-tight text-white"
            id="dashboard-resumes-heading"
          >
            Resumes
          </h2>

        </div>

        <div className="min-h-0 flex-1 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 text-[13px] font-semibold text-slate-200/80">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Created at</th>
                <th className="px-3 py-3">
                  Last edit <span aria-hidden="true">↓</span>
                </th>
                <th className="w-40 px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleResumes.map((resume) => (
                <tr
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                  key={resume.id}
                >
                  <td className="max-w-[250px] px-3 py-3.5 text-[13px] font-medium text-white">
                    <button
                      className="flex max-w-full items-center gap-2 text-left text-violet-300 hover:text-violet-200 hover:underline"
                      onClick={() => setSelectedResume(resume)}
                      title={`Preview ${resume.name}`}
                      type="button"
                    >
                      <FileText
                        aria-hidden="true"
                        className="size-4 shrink-0 text-slate-300/80"
                      />
                      <span className="truncate">{resume.name}</span>
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-mono text-xs text-slate-400">
                    {resume.createdAt}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs text-slate-400">
                    {resume.lastEdit}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        aria-label={`Edit ${resume.name}`}
                        className="text-slate-300 hover:text-cyan-300"
                        nativeButton={false}
                        render={<Link href="/user/resume" />}
                        size="icon-xs"
                        title="Edit resume"
                        variant="ghost"
                      >
                        <FilePenLine aria-hidden="true" />
                      </Button>
                      <Button
                        aria-label={`Download ${resume.name}`}
                        className="text-slate-300 hover:text-sky-300"
                        onClick={() => downloadResume(resume)}
                        size="icon-xs"
                        title="Download resume"
                        variant="ghost"
                      >
                        <Download aria-hidden="true" />
                      </Button>
                      <Button
                        aria-label={
                          pinnedIds.includes(resume.id)
                            ? `Unpin ${resume.name}`
                            : `Pin ${resume.name}`
                        }
                        className={
                          pinnedIds.includes(resume.id)
                            ? "text-amber-400 hover:text-amber-300"
                            : "text-slate-300 hover:text-amber-300"
                        }
                        onClick={() =>
                          setPinnedIds((current) =>
                            current.includes(resume.id)
                              ? current.filter((id) => id !== resume.id)
                              : [...current, resume.id]
                          )
                        }
                        size="icon-xs"
                        title={
                          pinnedIds.includes(resume.id)
                            ? "Unpin resume"
                            : "Pin resume"
                        }
                        variant="ghost"
                      >
                        <Pin
                          aria-hidden="true"
                          className={
                            pinnedIds.includes(resume.id) ? "fill-current" : ""
                          }
                        />
                      </Button>
                      <Button
                        aria-label={`Delete ${resume.name}`}
                        className="text-slate-300 hover:text-red-400"
                        onClick={() => setResumeToDelete(resume)}
                        size="icon-xs"
                        title="Delete resume"
                        variant="ghost"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleResumes.length === 0 && (
                <tr>
                  <td className="py-12 text-center" colSpan={4}>
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="mb-3 flex size-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                        <FileText aria-hidden="true" className="size-5" />
                      </span>
                      <p className="text-sm font-medium text-slate-200">
                        No resumes yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Create a resume to see it listed here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <p className="text-xs text-slate-400/70">
              Showing{" "}
              <span className="font-semibold text-white">{startIndex + 1}</span>{" "}
              to{" "}
              <span className="font-semibold text-white">
                {Math.min(startIndex + itemsPerPage, resumes.length)}
              </span>{" "}
              of <span className="font-semibold text-white">{resumes.length}</span>{" "}
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

      {selectedResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07071a]/70 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedResume(null)
          }}
        >
          <section
            aria-labelledby="resume-preview-title"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#10102d] p-6 shadow-2xl shadow-black/50"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
                  Resume preview
                </p>
                <h2
                  className="mt-2 text-xl font-bold text-white"
                  id="resume-preview-title"
                >
                  {selectedResume.name}
                </h2>
              </div>
              <Button
                aria-label="Close resume preview"
                className="text-slate-300"
                onClick={() => setSelectedResume(null)}
                size="icon"
                variant="ghost"
              >
                <X aria-hidden="true" />
              </Button>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Target company</dt>
                <dd className="mt-1 font-medium text-slate-100">
                  {selectedResume.company}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Target role</dt>
                <dd className="mt-1 font-medium text-slate-100">
                  {selectedResume.title}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">ATS match</dt>
                <dd className="mt-1 font-semibold text-emerald-400">
                  {selectedResume.score}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Last edited</dt>
                <dd className="mt-1 font-medium text-slate-100">
                  {selectedResume.lastEdit}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                className="border-white/10 text-slate-200"
                onClick={() => setSelectedResume(null)}
                variant="outline"
              >
                Close
              </Button>
              <Button
                className="border-0 bg-linear-to-r from-violet-600 to-cyan-600 text-white"
                nativeButton={false}
                render={<Link href="/user/resume" />}
              >
                <FilePenLine aria-hidden="true" />
                Open resume workspace
              </Button>
            </div>
          </section>
        </div>
      )}

      {resumeToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07071a]/75 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) setResumeToDelete(null)
          }}
        >
          <section
            aria-labelledby="delete-resume-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-red-400/25 bg-[#10102d] p-6 shadow-2xl shadow-black/50"
            role="alertdialog"
          >
            <h2
              className="text-lg font-bold text-white"
              id="delete-resume-title"
            >
              Delete resume?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-violet-300">
                “{resumeToDelete.name}”
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                className="border-white/10 text-slate-200"
                onClick={() => setResumeToDelete(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={confirmDelete}
              >
                <Trash2 aria-hidden="true" />
                Delete resume
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
