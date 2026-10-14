import Link from "next/link"
import { FileText, PencilLine } from "lucide-react"

export default function ResumeEditorPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
        <PencilLine aria-hidden="true" className="size-6" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-white">Resume editor</h1>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
        The resume editor is not available yet. You can still view your resume
        workspace while this feature is being completed.
      </p>
      <Link
        href="/user/resume"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
      >
        <FileText aria-hidden="true" className="size-4" />
        Go to resumes
      </Link>
    </main>
  )
}