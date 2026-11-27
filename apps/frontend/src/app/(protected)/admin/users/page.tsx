"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { logAdminActivity } from "@/services/activityLogService";
import {
  SearchInput,
  FilterDropdown,
  StatusBadge,
  EmptyState,
} from "@/components/common";

interface UserItem {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  email: string;
  role?: string;
  status?: "Active" | "Suspended";
  createdAt?: string;
}

const STORAGE_KEY = "jobprep_admin_users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await api.get("/users/getUsers");
        if (res.data?.success && Array.isArray(res.data.data)) {
          const list = res.data.data.map((u: any) => ({
            id: u._id || u.id,
            name: u.fullName || u.name || "JobPrep Candidate",
            email: u.email,
            role: u.role || "User",
            status: u.status || "Active",
            createdAt: u.createdAt,
          }));
          setUsers(list);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          return;
        }
      } catch {}

      // Fallback to storage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          setUsers(JSON.parse(raw));
        }
      } catch {}
    }
    loadUsers();
  }, []);

  const handleToggleStatus = (user: UserItem) => {
    const newStatus = user.status === "Suspended" ? "Active" : "Suspended";
    const updated = users.map((u) =>
      u.email === user.email ? { ...u, status: newStatus as "Active" | "Suspended" } : u
    );
    setUsers(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Auto-sync admin action to activity log
    logAdminActivity({
      action: `${newStatus === "Suspended" ? "Suspended" : "Activated"} candidate account ${user.email}`,
      target: `User: ${user.email}`,
      type: "User Action",
    });

    showToast(`User ${user.email} status changed to ${newStatus}`);
  };

  const filteredUsers = users.filter((u) => {
    const matchesStatus = statusFilter === "All" || (u.status || "Active") === statusFilter;
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: "28px 32px", minHeight: "100%", background: "#0a0a1a", color: "#f8fafc" }}>
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "rgba(16, 185, 129, 0.95)",
            color: "white",
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 13,
            zIndex: 9999,
          }}
        >
          ✅ {toastMessage}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "white" }}>
          👥 Candidate & User Directory
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
          Manage registered candidate accounts and security privileges. Account actions are auto-logged.
        </p>
      </div>

      {/* Filters Bar */}
      <div
        className="glass-card"
        style={{ padding: "16px 20px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <SearchInput
            placeholder="Search candidate by name or email..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <FilterDropdown
          label="Status:"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "All Users", value: "All" },
            { label: "Active", value: "Active" },
            { label: "Suspended", value: "Suspended" },
          ]}
        />
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 22 }}>
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No candidate users found"
            description="Registered platform candidates will appear here."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                  <th style={{ padding: 12 }}>Candidate Name</th>
                  <th style={{ padding: 12 }}>Email Address</th>
                  <th style={{ padding: 12 }}>Role</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.email} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: 12, fontWeight: 700, color: "white" }}>
                      {u.name || "Candidate"}
                    </td>
                    <td style={{ padding: 12, color: "#94a3b8", fontFamily: "JetBrains Mono" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: 12 }}>
                      <StatusBadge
                        label={u.role || "User"}
                        variant="purple"
                        style={{ padding: "2px 8px", fontSize: 10, borderRadius: 4 }}
                      />
                    </td>
                    <td style={{ padding: 12 }}>
                      <StatusBadge
                        status={u.status || "Active"}
                        style={{ padding: "2px 8px", fontSize: 10, borderRadius: 4 }}
                      />
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="btn-ghost"
                        style={{
                          padding: "4px 10px",
                          fontSize: 11,
                          color: u.status === "Suspended" ? "#34d399" : "#f87171",
                          borderColor:
                            u.status === "Suspended"
                              ? "rgba(16, 185, 129, 0.3)"
                              : "rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        {u.status === "Suspended" ? "Reactivate" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
