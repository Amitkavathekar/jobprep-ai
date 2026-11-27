"use client";

import React, { useState, useEffect } from "react";
import ActivityLogScreen from "@/components/admin/ActivityLogScreen";
import { ActivityLogItem } from "@/types";
import { fetchActivityLogsApi, getStoredActivityLogs } from "@/services/activityLogService";

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);

  const refreshLogs = async () => {
    try {
      const data = await fetchActivityLogsApi();
      setLogs(data);
    } catch {
      setLogs(getStoredActivityLogs());
    }
  };

  useEffect(() => {
    refreshLogs();

    // Listen to real-time events triggered from anywhere in the admin dashboard
    const handleActivityLogged = () => {
      refreshLogs();
    };

    window.addEventListener("admin_activity_logged", handleActivityLogged);
    window.addEventListener("storage", handleActivityLogged);

    return () => {
      window.removeEventListener("admin_activity_logged", handleActivityLogged);
      window.removeEventListener("storage", handleActivityLogged);
    };
  }, []);

  return (
    <div style={{ padding: "28px 32px", minHeight: "100%", background: "#0a0a1a", color: "#f8fafc" }}>
      <ActivityLogScreen logs={logs} />
    </div>
  );
}
