"use client";

import React, { useState, useEffect } from "react";
import { Modal, LoadingSpinner } from "@/components/common";
import {
  fetchNotificationSettingsApi,
  updateNotificationSettingApi,
  createNotificationSettingApi,
  NotificationSettingItem,
} from "@/services/notificationService";

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettingItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "monetization" | "support" | "system"
  >("all");
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New setting modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<
    "monetization" | "support" | "system" | "interview"
  >("system");
  const [newChannel, setNewChannel] = useState<"email" | "website">("email");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Load from database on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchNotificationSettingsApi();
        if (mounted) {
          setSettings(data);
        }
      } catch (err) {
        console.error("Error loading notification settings from database:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleSetting = async (item: NotificationSettingItem) => {
    const targetId = item.id || item._id || item.notificationId || "";
    const newStatus = !item.enabled;

    // Optimistic UI update
    setSettings((prev) =>
      prev.map((s) =>
        (s.id === targetId || s._id === targetId || s.notificationId === targetId)
          ? { ...s, enabled: newStatus }
          : s
      )
    );

    try {
      await updateNotificationSettingApi(targetId, { enabled: newStatus });
      showToast(`Notification setting updated in database!`);
    } catch (err) {
      console.error("Failed to update notification setting in database:", err);
      showToast("Error updating notification setting");
    }
  };

  const handleChannelChange = async (
    item: NotificationSettingItem,
    newChannel: "email" | "website"
  ) => {
    const targetId = item.id || item._id || item.notificationId || "";

    setSettings((prev) =>
      prev.map((s) =>
        (s.id === targetId || s._id === targetId || s.notificationId === targetId)
          ? { ...s, channel: newChannel }
          : s
      )
    );

    try {
      await updateNotificationSettingApi(targetId, { channel: newChannel });
      showToast(`Notification channel updated in database!`);
    } catch (err) {
      console.error("Failed to update notification channel in database:", err);
      showToast("Error updating notification channel");
    }
  };

  const handleCreateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createNotificationSettingApi({
        title: newTitle,
        description: newDesc,
        category: newCategory,
        channel: newChannel,
        enabled: true,
      });

      setSettings((prev) => [...prev, created]);
      setIsModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      showToast("New notification rule saved to database!");
    } catch (err) {
      console.error("Failed to create notification setting:", err);
      showToast("Error saving notification rule");
    }
  };

  const filteredSettings =
    activeTab === "all"
      ? settings
      : settings.filter((s) => s.category === activeTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px 32px" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 1100,
            background: "rgba(16, 185, 129, 0.9)",
            border: "1px solid #10b981",
            color: "white",
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}
        >
          ✓ {toastMsg}
        </div>
      )}

      {/* Screen Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "white" }}>
            🔔 Notifications Settings
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Automated notifications, alerts and triggers configured and persisted in MongoDB database.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: "linear-gradient(135deg, #ec4899, #7c3aed)",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(236,72,153,0.3)",
          }}
        >
          + Add Notification Rule
        </button>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {[
          { id: "all", label: "All Notifications", icon: "⚡" },
          { id: "monetization", label: "Subscription & Billing", icon: "💳" },
          { id: "support", label: "Support Tickets", icon: "🎧" },
          { id: "system", label: "System & Security", icon: "🛡" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                background: isActive
                  ? "rgba(236, 72, 153, 0.2)"
                  : "rgba(255,255,255,0.04)",
                border: isActive
                  ? "1px solid #ec4899"
                  : "1px solid rgba(255,255,255,0.08)",
                color: isActive ? "#f472b6" : "#cbd5e1",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <LoadingSpinner
          text="Loading notification settings from database..."
          minHeight={160}
        />
      )}

      {/* NOTIFICATION RULES LIST */}
      {!loading && (
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredSettings.map((item) => {
              const targetId = item.id || item._id || item.notificationId || "";
              return (
                <div
                  key={targetId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 14,
                    borderRadius: 10,
                    background: item.enabled
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(255,255,255,0.01)",
                    border: item.enabled
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "1px solid rgba(255,255,255,0.04)",
                    opacity: item.enabled ? 1 : 0.6,
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => handleToggleSetting(item)}
                      style={{
                        marginTop: 4,
                        width: 16,
                        height: 16,
                        accentColor: "#ec4899",
                        cursor: "pointer",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>{item.title}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "JetBrains Mono",
                            padding: "2px 6px",
                            borderRadius: 4,
                            textTransform: "uppercase",
                            fontWeight: 700,
                            background:
                              item.category === "monetization"
                                ? "rgba(234, 179, 8, 0.15)"
                                : item.category === "support"
                                ? "rgba(6, 182, 212, 0.15)"
                                : "rgba(168, 85, 247, 0.15)",
                            color:
                              item.category === "monetization"
                                ? "#fde047"
                                : item.category === "support"
                                ? "#67e8f9"
                                : "#c084fc",
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 12,
                          color: "#94a3b8",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Channel Selector */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "#64748b" }}>Channel:</span>
                    <select
                      value={item.channel}
                      onChange={(e) =>
                        handleChannelChange(item, e.target.value as "email" | "website")
                      }
                      style={{
                        background: "#0d0d2b",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <option value="email">📧 Email</option>
                      <option value="website">🌐 Website Notification</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Notification Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Notification Rule"
        maxWidth={480}
      >
        <form onSubmit={handleCreateSetting} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
              Title:
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Plan Expiration Reminder"
              className="glass-input"
              style={{ width: "100%", marginTop: 4, padding: "8px 12px", fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
              Description:
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Details of the trigger..."
              className="glass-input"
              style={{ width: "100%", marginTop: 4, padding: "8px 12px", fontSize: 13, height: 70 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                Category:
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <option value="system">System & Security</option>
                <option value="monetization">Subscription & Billing</option>
                <option value="support">Support Tickets</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                Channel:
              </label>
              <select
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value as any)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <option value="email">Email</option>
                <option value="website">Website Notification</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-ghost"
              style={{ padding: "8px 16px", fontSize: 12, borderRadius: 8 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: "8px 18px",
                fontSize: 12,
                borderRadius: 8,
                background: "linear-gradient(135deg, #ec4899, #7c3aed)",
              }}
            >
              Save to Database
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
