"use client";

import React from "react";
import { AdminScreen } from "@/types";

interface AdminNavItem {
  id: AdminScreen;
  icon: string;
  label: string;
  tag?: string;
}

interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

const adminSections: AdminNavSection[] = [
  {
    label: "Overview",
    items: [
      { id: "admin-dashboard", icon: "⊞", label: "Admin Dashboard" },
    ],
  },
  {
    label: "Monetization",
    items: [
      { id: "admin-membership", icon: "💳", label: "Membership Plans", tag: "PLANS" },
      { id: "admin-coupons", icon: "🏷", label: "Coupons" },
    ],
  },
  {
    label: "Users",
    items: [
      { id: "admin-users", icon: "👥", label: "User Directory" },
      { id: "admin-support", icon: "🎧", label: "Support Tickets", tag: "TICKETS" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "admin-ai-models", icon: "🤖", label: "AI Tokens & Models" },
      { id: "admin-notifications", icon: "🔔", label: "Notifications Settings" },
      { id: "admin-activity-log", icon: "📜", label: "Activity Log" },
    ],
  },
];

interface AdminSidebarProps {
  active: AdminScreen;
  onNavigate: (s: AdminScreen) => void;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({
  active,
  onNavigate,
  onLogout,
  isOpen,
  onToggle,
}: AdminSidebarProps) {
  const width = isOpen ? 238 : 64;

  return (
    <aside
      style={{
        width,
        minWidth: width,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(10, 10, 28, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        padding: isOpen ? "20px 12px" : "20px 8px",
        gap: 4,
        overflowY: "auto",
        overflowX: "hidden",
        transition: "width 0.25s ease, min-width 0.25s ease, padding 0.25s ease",
        position: "relative",
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Admin Badge Header + Toggle Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 16,
          paddingLeft: isOpen ? 4 : 0,
          gap: 8,
          justifyContent: isOpen ? "flex-start" : "center",
        }}
      >
        {isOpen ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: "white",
                boxShadow: "0 0 12px rgba(236, 72, 153, 0.4)",
                flexShrink: 0,
              }}
            >
              SA
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "white", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Admin Portal
              </div>
              <div style={{ fontSize: 10, color: "#ec4899", fontFamily: "JetBrains Mono", fontWeight: 700 }}>

              </div>
            </div>
          </div>
        ) : (
          <div
            title="Super Admin Portal"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "white",
            }}
          >
            SA
          </div>
        )}
        <button
          onClick={onToggle}
          title={isOpen ? "Collapse admin sidebar" : "Expand admin sidebar"}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(148,163,184,0.8)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          {isOpen ? "‹" : "›"}
        </button>
      </div>

      {/* Admin Nav Sections */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {adminSections.map((section) => (
          <div key={section.label}>
            {isOpen && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "rgba(236,72,153,0.7)",
                  padding: "8px 12px 4px",
                  textTransform: "uppercase",
                  fontFamily: "JetBrains Mono",
                  whiteSpace: "nowrap",
                }}
              >
                {section.label}
              </div>
            )}
            {!isOpen && <div style={{ height: 6 }} />}

            {section.items.map((item) => {
              const isActive = active === item.id;
              return (
                <div
                  key={item.id}
                  className={`nav-item${isActive ? " active" : ""}`}
                  style={{
                    justifyContent: isOpen ? "flex-start" : "center",
                    padding: isOpen ? "9px 12px" : "9px 0",
                    position: "relative",
                    background: isActive ? "rgba(236, 72, 153, 0.15)" : undefined,
                    borderLeft: isActive ? "3px solid #ec4899" : "3px solid transparent",
                    borderRadius: isOpen ? "0 8px 8px 0" : "8px",
                  }}
                  onClick={() => onNavigate(item.id)}
                  title={!isOpen ? item.label : undefined}
                >
                  <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {isOpen && (
                    <>
                      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13, fontWeight: isActive ? 700 : 500 }}>
                        {item.label}
                      </span>
                      {item.tag && (
                        <span
                          style={{
                            fontSize: 9,
                            fontFamily: "JetBrains Mono",
                            color: "#ec4899",
                            background: "rgba(236, 72, 153, 0.15)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontWeight: 700,
                          }}
                        >
                          {item.tag}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Version String at Sidebar Bottom */}
      {isOpen ? (
        <div style={{ padding: "10px 12px", fontSize: 10, color: "#94a3b8", fontFamily: "JetBrains Mono", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>v2.4.0</span>
          <span style={{ color: "#34d399", fontWeight: 700 }}>● LIVE</span>
        </div>
      ) : (
        <div style={{ textAlign: "center", fontSize: 9, color: "#34d399", fontFamily: "JetBrains Mono", padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }} title="System Version 2.4.0 • Live">
          v2.4
        </div>
      )}

      {/* Footer - Sign Out */}
      <div style={{ paddingTop: 6 }}>
        {isOpen ? (
          <button
            className="btn-ghost"
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 12,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              borderRadius: 8,
              cursor: "pointer",
            }}
            onClick={onLogout}
          >
            <span>⎋</span>
            <span style={{ fontWeight: 600 }}>Sign Out Admin</span>
          </button>
        ) : (
          <button
            className="btn-ghost"
            style={{
              width: 36,
              height: 36,
              padding: 0,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#f87171",
              borderRadius: 8,
              cursor: "pointer",
            }}
            title="Sign Out Admin"
            onClick={onLogout}
          >
            ⎋
          </button>
        )}
      </div>
    </aside>
  );
}

export { AdminSidebar };
