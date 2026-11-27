import api from "@/lib/axios";
import { ActivityLogItem } from "@/types";

// In-memory cache without using localStorage
let inMemoryActivityLogs: ActivityLogItem[] = [];

export function getStoredActivityLogs(): ActivityLogItem[] {
  return inMemoryActivityLogs;
}

export function saveStoredActivityLogs(logs: ActivityLogItem[]): void {
  inMemoryActivityLogs = logs;
}

export function logAdminActivity(item: {
  action: string;
  target: string;
  type: "Pricing" | "User Action" | "Coupon" | "Settings" | "Content" | string;
  adminName?: string;
}): ActivityLogItem {
  const newLog: ActivityLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    adminName: item.adminName || "Super Admin",
    action: item.action,
    target: item.target,
    type: item.type,
    timestamp: new Date().toLocaleString(),
  };

  inMemoryActivityLogs = [newLog, ...inMemoryActivityLogs];

  // Broadcast real-time event for UI reactivity
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("admin_activity_logged", { detail: newLog }));
  }

  // Persist directly in MongoDB database
  api.post("/admin/activity-logs", newLog).catch((err) => {
    console.warn("Could not save activity log to database:", err?.message);
  });

  return newLog;
}

export async function fetchActivityLogsApi(): Promise<ActivityLogItem[]> {
  try {
    const res = await api.get("/admin/activity-logs");
    if (res.data?.success && Array.isArray(res.data.data)) {
      inMemoryActivityLogs = res.data.data;
      return res.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch activity logs from database:", err);
  }
  return inMemoryActivityLogs;
}
