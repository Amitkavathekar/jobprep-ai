"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  FileText,
  Sparkles,
  CheckCircle2,
  Mic,
  BookOpen,
} from "lucide-react";
import api from "@/lib/axios";

interface UserActivity {
  id: string;
  icon: any;
  text: string;
  description?: string;
  time: string;
  color: string;
  background: string;
  border: string;
}

function formatRelativeTime(dateString?: string | Date): string {
  if (!dateString) return "Recent";
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  if (isNaN(diffMs) || diffMs < 0) return "Just now";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getActivityMeta(type: string) {
  switch (type) {
    case "ats_scan":
      return {
        icon: CheckCircle2,
        color: "text-emerald-300",
        background: "bg-emerald-400/10",
        border: "border-emerald-400/25",
      };
    case "ai_analysis":
      return {
        icon: Sparkles,
        color: "text-violet-300",
        background: "bg-violet-400/10",
        border: "border-violet-400/25",
      };
    case "mock_interview":
      return {
        icon: Mic,
        color: "text-amber-300",
        background: "bg-amber-400/10",
        border: "border-amber-400/25",
      };
    case "interview_prep":
      return {
        icon: BookOpen,
        color: "text-indigo-300",
        background: "bg-indigo-400/10",
        border: "border-indigo-400/25",
      };
    case "resume_edit":
    case "resume_upload":
    default:
      return {
        icon: FileText,
        color: "text-cyan-300",
        background: "bg-cyan-400/10",
        border: "border-cyan-400/25",
      };
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      // 1. Fetch user-specific activities strictly from MongoDB
      const res = await api.get("/users/activities?limit=10").catch(() => null);

      if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: UserActivity[] = res.data.data.map((item: any) => {
          const style = getActivityMeta(item.type);
          return {
            id: item._id || item.id || `act-${Math.random()}`,
            icon: style.icon,
            text: item.title || "User activity recorded",
            description: item.description,
            time: formatRelativeTime(item.createdAt),
            color: style.color,
            background: style.background,
            border: style.border,
          };
        });

        setActivities(mapped);
        setLoading(false);
        return;
      }

      // 2. Fallback to local stored analysis if offline or fresh session
      const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      let userId = "";
      if (rawUser) {
        try {
          const u = JSON.parse(rawUser);
          userId = u?.id || u?._id || "";
        } catch {}
      }

      const localItems: UserActivity[] = [];
      if (userId) {
        const userStored = localStorage.getItem(`jobprep_latest_analysis_${userId}`);
        if (userStored) {
          try {
            const parsed = JSON.parse(userStored);
            if (parsed?.resumeFileName || parsed?.score) {
              localItems.push({
                id: "analysis-local",
                icon: Sparkles,
                text: `AI Analysis: ${parsed.resumeFileName || "Uploaded Resume"} (${parsed.score || 0}% Match)`,
                time: "Latest",
                color: "text-violet-300",
                background: "bg-violet-400/10",
                border: "border-violet-400/25",
              });
            }
          } catch {}
        }
      }

      setActivities(localItems);
    } catch (e) {
      console.error("Error loading recent activities:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    const handleUpdate = () => {
      fetchActivities();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("activity-updated", handleUpdate);
      return () => window.removeEventListener("activity-updated", handleUpdate);
    }
  }, []);

  return (
    <section
      aria-labelledby="dashboard-activity-heading"
      className="flex h-[395px] min-h-[350px] flex-col rounded-2xl border border-white/10 bg-linear-to-br from-violet-300/10 via-slate-900/70 to-slate-900/60 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="text-base font-bold tracking-tight text-white"
          id="dashboard-activity-heading"
        >
          Recent Activity
        </h2>
        <span className="font-mono text-[10px] text-slate-500">Live MongoDB</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1 custom-scrollbar">
        {activities.map(
          ({ id, icon: Icon, text, description, time, color, background, border }) => (
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
                {description && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400/70">
                    {description}
                  </p>
                )}
                <p className="mt-1 font-mono text-[11px] text-slate-400/60">
                  {time}
                </p>
              </div>
            </article>
          )
        )}

        {activities.length === 0 && !loading && (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
              <Clock3 aria-hidden="true" className="size-5 opacity-60" />
            </span>
            <p className="text-sm font-medium text-slate-200">No recent activity</p>
            <p className="mt-1 max-w-[220px] text-xs text-slate-500">
              Activities will appear here when you run AI analysis, ATS scans, or mock interviews.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
