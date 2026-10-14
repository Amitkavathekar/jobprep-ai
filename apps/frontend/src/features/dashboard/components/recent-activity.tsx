import {
  BriefcaseBusiness,
  Clock3,
  FileDown,
  FilePenLine,
  ScanSearch,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

const activities = [
  {
    icon: Sparkles,
    text: "AI Analysis run for Stripe SWE role",
    time: "2h ago",
    color: "text-violet-300",
    background: "bg-violet-400/10",
    border: "border-violet-400/25",
  },
  {
    icon: FilePenLine,
    text: "Resume v7 saved with 3 AI suggestions",
    time: "5h ago",
    color: "text-cyan-300",
    background: "bg-cyan-400/10",
    border: "border-cyan-400/25",
  },
  {
    icon: TrendingUp,
    text: "ATS Score improved to 74% (+11)",
    time: "Yesterday",
    color: "text-emerald-300",
    background: "bg-emerald-400/10",
    border: "border-emerald-400/25",
  },
  {
    icon: Clock3,
    text: "Mock interview: System Design (78/100)",
    time: "2 days ago",
    color: "text-amber-300",
    background: "bg-amber-400/10",
    border: "border-amber-400/25",
  },
  {
    icon: BriefcaseBusiness,
    text: "New job description added: Notion PM",
    time: "3 days ago",
    color: "text-violet-300",
    background: "bg-violet-400/10",
    border: "border-violet-400/25",
  },
  {
    icon: ScanSearch,
    text: "ATS Scan executed for Tech Lead role",
    time: "4 days ago",
    color: "text-pink-300",
    background: "bg-pink-400/10",
    border: "border-pink-400/25",
  },
  {
    icon: FileDown,
    text: "Exported Data Analyst Resume (PDF)",
    time: "5 days ago",
    color: "text-blue-300",
    background: "bg-blue-400/10",
    border: "border-blue-400/25",
  },
  {
    icon: Target,
    text: "Completed AI Mock Interview: Frontend Lead",
    time: "1 week ago",
    color: "text-emerald-300",
    background: "bg-emerald-400/10",
    border: "border-emerald-400/25",
  },
]

export function RecentActivity() {
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
          ({ icon: Icon, text, time, color, background, border }) => (
            <article
              className="flex gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.05]"
              key={text}
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
      </div>
    </section>
  )
}
