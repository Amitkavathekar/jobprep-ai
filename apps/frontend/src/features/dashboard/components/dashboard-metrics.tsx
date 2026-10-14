const metrics = [
  {
    label: "ATS Match",
    value: "74",
    unit: "%",
    description: "Senior FE Engineer",
    color: "text-cyan-400",
  },
  {
    label: "Interviews Completed",
    value: "12",
    description: "This month",
    color: "text-emerald-400",
  },
  {
    label: "Total Resumes",
    value: "5",
    unit: "",
    description: "5 active resumes",
    color: "text-amber-400",
  },
]

export function DashboardMetrics() {
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
