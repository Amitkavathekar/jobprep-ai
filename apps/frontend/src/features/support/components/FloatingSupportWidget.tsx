"use client";

import React, { useState, useEffect } from "react";
import {
  createNewTicketApi,
  fetchMySupportTicketsApi,
} from "@/services/supportTickets";
import { SupportTicket } from "@/types";

export default function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"raise" | "history">("raise");
  const [category, setCategory] = useState("Technical Issue");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load current candidate info
  const loadUser = () => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (raw) {
        const u = JSON.parse(raw);
        setCandidateName(u.fullName || u.name || "Candidate");
        setCandidateEmail(u.email || "");
        setCandidateId(u.id || u._id || "");
      }
    } catch {}
  };

  useEffect(() => {
    loadUser();

    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open_support_modal", handleOpen);
    window.addEventListener("user-profile-updated", loadUser);

    return () => {
      window.removeEventListener("open_support_modal", handleOpen);
      window.removeEventListener("user-profile-updated", loadUser);
    };
  }, []);

  const loadMyTickets = async () => {
    setLoadingHistory(true);
    try {
      const list = await fetchMySupportTicketsApi(candidateEmail, candidateId);
      setMyTickets(list);
    } catch {
      setMyTickets([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "history") {
      loadMyTickets();
    }
  }, [isOpen, activeTab, candidateEmail, candidateId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const openSupport = () => {
    loadUser();
    setIsOpen(true);
  };

  const closeSupport = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast("Please fill in both Subject and Description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = {
        id: candidateId || "usr-anon",
        name: candidateName.trim() || "Candidate",
        email: candidateEmail.trim(),
      };

      const newTicket = await createNewTicketApi(user, {
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });

      showToast(`Support query submitted! Ticket ID: ${newTicket.id}`);
      setSubject("");
      setDescription("");
      setPriority("Medium");
      setCategory("Technical Issue");

      // Switch to history tab to show the new ticket
      setTimeout(() => {
        setActiveTab("history");
        loadMyTickets();
      }, 500);
    } catch (err) {
      console.error("Failed to submit support ticket:", err);
      showToast("Could not submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return { color: "#fbbf24", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)" };
      case "In Progress":
        return { color: "#38bdf8", bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.3)" };
      case "Resolved":
        return { color: "#34d399", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)" };
      case "Closed":
        return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", border: "rgba(148, 163, 184, 0.3)" };
      default:
        return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", border: "rgba(148, 163, 184, 0.3)" };
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 24,
            zIndex: 10001,
            padding: "12px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.45)",
          }}
        >
          ✓ {toastMsg}
        </div>
      )}

      {/* Floating Support Button across all user routes */}
      <button
        type="button"
        onClick={openSupport}
        aria-label="Open Help and Support"
        title="Help & Support"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "none",
          background: "#3b82f6",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(59, 130, 246, 0.45)",
          zIndex: 999,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.06)";
          e.currentTarget.style.boxShadow = "0 10px 28px rgba(59, 130, 246, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(59, 130, 246, 0.45)";
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
          <path d="M18 19c0 1.1-.9 2-2 2h-2" />
          <rect x="2" y="11" width="4" height="7" rx="2" fill="currentColor" fillOpacity="0.12" />
          <rect x="18" y="11" width="4" height="7" rx="2" fill="currentColor" fillOpacity="0.12" />
        </svg>
      </button>

      {/* Help & Support Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(3, 7, 18, 0.8)",
            backdropFilter: "blur(12px)",
            padding: 16,
          }}
          onClick={(e) => e.target === e.currentTarget && closeSupport()}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              background: "#0f172a",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              color: "white",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(59, 130, 246, 0.2)",
                    border: "1px solid rgba(59, 130, 246, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#60a5fa",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
                    <path d="M18 19c0 1.1-.9 2-2 2h-2" />
                    <rect x="2" y="11" width="4" height="7" rx="2" fill="currentColor" fillOpacity="0.12" />
                    <rect x="18" y="11" width="4" height="7" rx="2" fill="currentColor" fillOpacity="0.12" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "white" }}>
                    Help & Support
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    Raise an inquiry or report an issue directly to our team.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSupport}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "12px 22px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("raise")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: activeTab === "raise" ? "1px solid #3b82f6" : "1px solid transparent",
                  background: activeTab === "raise" ? "rgba(59, 130, 246, 0.15)" : "transparent",
                  color: activeTab === "raise" ? "#60a5fa" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                ✍️ Raise New Query
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("history");
                  loadMyTickets();
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: activeTab === "history" ? "1px solid #3b82f6" : "1px solid transparent",
                  background: activeTab === "history" ? "rgba(59, 130, 246, 0.15)" : "transparent",
                  color: activeTab === "history" ? "#60a5fa" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                📜 My Queries & Replies
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 22, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              {activeTab === "raise" ? (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Candidate Info Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      padding: 12,
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="Candidate Name"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: 6,
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "white",
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="candidate@example.com"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: 6,
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "white",
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Category & Priority */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                        Query Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "white",
                          fontSize: 12,
                          outline: "none",
                        }}
                      >
                        <option value="Technical Issue" style={{ background: "#0f172a" }}>Technical Issue</option>
                        <option value="Billing & Payment" style={{ background: "#0f172a" }}>Billing & Payment</option>
                        <option value="Resume AI" style={{ background: "#0f172a" }}>Resume AI / ATS</option>
                        <option value="Mock Interview" style={{ background: "#0f172a" }}>Mock Interview</option>
                        <option value="Account & Other" style={{ background: "#0f172a" }}>Account & Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "white",
                          fontSize: 12,
                          outline: "none",
                        }}
                      >
                        <option value="Low" style={{ background: "#0f172a" }}>Low</option>
                        <option value="Medium" style={{ background: "#0f172a" }}>Medium (Default)</option>
                        <option value="High" style={{ background: "#0f172a" }}>High</option>
                        <option value="Urgent" style={{ background: "#0f172a" }}>Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      placeholder="Brief headline of your inquiry (e.g. ATS score not updating)..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 8,
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "white",
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                      Describe Your Issue in Detail *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please explain what happened, steps to reproduce, or any relevant details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "white",
                        fontSize: 12,
                        lineHeight: 1.5,
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={closeSupport}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#94a3b8",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        border: "none",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        opacity: isSubmitting ? 0.6 : 1,
                        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                      }}
                    >
                      {isSubmitting ? "Submitting..." : "🚀 Submit Support Query"}
                    </button>
                  </div>
                </form>
              ) : (
                /* History Tab */
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {loadingHistory ? (
                    <div style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                      Loading your submitted queries...
                    </div>
                  ) : myTickets.length === 0 ? (
                    <div
                      style={{
                        padding: 36,
                        textAlign: "center",
                        background: "rgba(255, 255, 255, 0.02)",
                        borderRadius: 12,
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        color: "#94a3b8",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: 14 }}>
                        No queries raised yet
                      </div>
                      <p style={{ margin: "4px 0 14px", fontSize: 12 }}>
                        Any support ticket you raise will appear here with live admin replies.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("raise")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: "rgba(59, 130, 246, 0.2)",
                          border: "1px solid rgba(59, 130, 246, 0.4)",
                          color: "#60a5fa",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        + Raise a Query
                      </button>
                    </div>
                  ) : (
                    myTickets.map((t) => {
                      const st = getStatusColor(t.status || "Open");
                      return (
                        <div
                          key={t.id}
                          style={{
                            padding: 14,
                            borderRadius: 12,
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "#60a5fa", fontWeight: 700 }}>
                                {t.id}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  background: "rgba(255, 255, 255, 0.06)",
                                  color: "#94a3b8",
                                }}
                              >
                                {t.category}
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize: 11,
                                padding: "2px 10px",
                                borderRadius: 12,
                                background: st.bg,
                                border: `1px solid ${st.border}`,
                                color: st.color,
                                fontWeight: 700,
                              }}
                            >
                              {t.status || "Open"}
                            </span>
                          </div>

                          <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>
                            {t.subject}
                          </div>

                          <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.4 }}>
                            {t.description}
                          </div>

                          {t.adminResponse && (
                            <div
                              style={{
                                marginTop: 4,
                                padding: "8px 12px",
                                borderRadius: 8,
                                background: "rgba(59, 130, 246, 0.1)",
                                border: "1px solid rgba(59, 130, 246, 0.25)",
                                fontSize: 12,
                                color: "#93c5fd",
                              }}
                            >
                              <strong style={{ color: "#60a5fa" }}>Admin Response: </strong>
                              {t.adminResponse}
                            </div>
                          )}

                          <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                            Submitted: {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
