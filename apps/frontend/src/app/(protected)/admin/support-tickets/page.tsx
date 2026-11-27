"use client";

import React, { useState, useEffect } from "react";
import { SupportTicket } from "@/types";
import {
  getStoredTickets,
  updateTicketStatus,
} from "@/services/supportTickets";

export default function SupportTicketsScreen() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "In Progress" | "Resolved" | "Closed">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [modalStatus, setModalStatus] = useState<SupportTicket["status"]>("Open");
  const [toastMsg, setToastMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const reloadTickets = () => {
    const list = getStoredTickets();
    setTickets(list);
  };

  useEffect(() => {
    reloadTickets();
    const handleUpdate = () => reloadTickets();
    window.addEventListener("support_tickets_updated", handleUpdate);
    return () => window.removeEventListener("support_tickets_updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleQuickResolve = (ticket: SupportTicket) => {
    updateTicketStatus(ticket.id, "Resolved", ticket.adminResponse || "Marked as resolved by Admin.");
    reloadTickets();
    showToast(`Ticket ${ticket.id} marked as Resolved!`);
  };

  const handleOpenDetailModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminResponse || "");
    setModalStatus(ticket.status);
  };

  const handleSaveModal = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, modalStatus, replyText.trim() || undefined);
    reloadTickets();
    showToast(`Ticket ${selectedTicket.id} updated successfully!`);
    setSelectedTicket(null);
  };

  // Filter calculations
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.id.toLowerCase().includes(query) ||
      (t.userName && t.userName.toLowerCase().includes(query)) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(query)) ||
      t.subject.toLowerCase().includes(query);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status: SupportTicket["status"]) => {
    switch (status) {
      case "Open":
        return { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", color: "#fbbf24", label: "Open" };
      case "In Progress":
        return { bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.3)", color: "#38bdf8", label: "In Progress" };
      case "Resolved":
        return { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", color: "#34d399", label: "✓ Resolved" };
      case "Closed":
        return { bg: "rgba(148, 163, 184, 0.15)", border: "rgba(148, 163, 184, 0.3)", color: "#94a3b8", label: "Closed" };
      default:
        return { bg: "rgba(148, 163, 184, 0.15)", border: "rgba(148, 163, 184, 0.3)", color: "#94a3b8", label: status || "Open" };
    }
  };

  const getPriorityBadge = (p: SupportTicket["priority"]) => {
    switch (p) {
      case "Urgent":
        return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" };
      case "High":
        return { color: "#f97316", bg: "rgba(249, 115, 22, 0.15)" };
      case "Medium":
        return { color: "#eab308", bg: "rgba(234, 179, 8, 0.15)" };
      case "Low":
        return { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
      default:
        return { color: "#eab308", bg: "rgba(234, 179, 8, 0.15)" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "28px 32px" }}>
      {/* Toast message */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 10000,
            padding: "12px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
          }}
        >
          ✓ {toastMsg}
        </div>
      )}

      {/* Top Header & Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{ padding: 18, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Total Support Queries</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "white", marginTop: 4 }}>{totalCount}</div>
        </div>

        <div style={{ padding: 18, borderRadius: 16, background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
          <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>Open Queries</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>{openCount}</div>
        </div>

        <div style={{ padding: 18, borderRadius: 16, background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.2)" }}>
          <div style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>In Progress</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#38bdf8", marginTop: 4 }}>{inProgressCount}</div>
        </div>

        <div style={{ padding: 18, borderRadius: 16, background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <div style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>Resolved Tickets</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#34d399", marginTop: 4 }}>{resolvedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: 16,
          borderRadius: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["All", "Open", "In Progress", "Resolved", "Closed"] as const).map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: isActive ? "1px solid #ec4899" : "1px solid rgba(255,255,255,0.1)",
                  background: isActive ? "rgba(236, 72, 153, 0.15)" : "transparent",
                  color: isActive ? "#ec4899" : "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: "flex", gap: 10, flex: 1, maxWidth: 450 }}>
          <input
            type="text"
            placeholder="Search candidate name, email, subject, or ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              fontSize: 12,
              outline: "none",
            }}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              fontSize: 12,
              outline: "none",
            }}
          >
            <option value="All" style={{ background: "#0f172a" }}>All Categories</option>
            <option value="Technical Issue" style={{ background: "#0f172a" }}>Technical Issue</option>
            <option value="Billing & Payment" style={{ background: "#0f172a" }}>Billing & Payment</option>
            <option value="Resume AI" style={{ background: "#0f172a" }}>Resume AI</option>
            <option value="Mock Interview" style={{ background: "#0f172a" }}>Mock Interview</option>
            <option value="Account & Other" style={{ background: "#0f172a" }}>Account & Other</option>
          </select>
        </div>
      </div>

      {/* Support Tickets Table / Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredTickets.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#94a3b8",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎫</div>
            <h4 style={{ margin: "0 0 6px", color: "white", fontSize: 16 }}>No support tickets found</h4>
            <p style={{ margin: 0, fontSize: 13 }}>Try adjusting your search query or status filters.</p>
          </div>
        ) : (
          <>
            {paginatedTickets.map((ticket) => {
              const badge = getStatusBadge(ticket.status);
              const priorityInfo = getPriorityBadge(ticket.priority);

              return (
                <div
                  key={ticket.id}
                  style={{
                    padding: 20,
                    borderRadius: 16,
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "#ec4899", fontWeight: 700 }}>
                          {ticket.id}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: priorityInfo.bg,
                            color: priorityInfo.color,
                            fontWeight: 700,
                          }}
                        >
                          {ticket.priority}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.05)",
                            color: "#94a3b8",
                          }}
                        >
                          {ticket.category}
                        </span>
                        <span style={{ fontSize: 11, color: "#64748b" }}>
                          • Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>

                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "white" }}>
                        {ticket.subject}
                      </h4>

                      <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <span>👤 Candidate: <strong>{ticket.userName || ticket.user?.name || "Candidate"}</strong> ({ticket.userEmail || ticket.user?.email || "candidate@example.com"})</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>

                      {/* Quick Resolve Button */}
                      {ticket.status !== "Resolved" && (
                        <button
                          onClick={() => handleQuickResolve(ticket)}
                          title="Mark ticket status as Resolved"
                          style={{
                            padding: "7px 14px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            background: "rgba(16, 185, 129, 0.2)",
                            border: "1px solid rgba(16, 185, 129, 0.4)",
                            color: "#34d399",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          ✓ Mark Resolved
                        </button>
                      )}

                      {/* View & Reply Button */}
                      <button
                        onClick={() => handleOpenDetailModal(ticket)}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          background: "rgba(236, 72, 153, 0.2)",
                          border: "1px solid rgba(236, 72, 153, 0.4)",
                          color: "#f472b6",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        💬 View & Reply
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "rgba(0, 0, 0, 0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      fontSize: 13,
                      color: "#e2e8f0",
                      lineHeight: 1.5,
                    }}
                  >
                    {ticket.description}
                  </div>

                  {ticket.adminResponse && (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: "rgba(236, 72, 153, 0.08)",
                        border: "1px solid rgba(236, 72, 153, 0.2)",
                        fontSize: 13,
                        color: "#f472b6",
                      }}
                    >
                      <strong style={{ color: "#f43f5e" }}>Admin Reply: </strong>
                      {ticket.adminResponse}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Showing Page {currentPage} of {totalPages} ({filteredTickets.length} total tickets)
              </span>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="btn-ghost"
                  style={{ padding: "6px 14px", fontSize: 12, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="btn-ghost"
                  style={{ padding: "6px 14px", fontSize: 12, opacity: currentPage >= totalPages ? 0.4 : 1, cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail & Reply Modal */}
      {selectedTicket && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(3, 7, 18, 0.8)",
            backdropFilter: "blur(12px)",
            padding: 16,
          }}
          onClick={(e) => e.target === e.currentTarget && setSelectedTicket(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 620,
              maxHeight: "90vh",
              background: "#0f172a",
              border: "1px solid rgba(236, 72, 153, 0.3)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              color: "white",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#ec4899", fontWeight: 700 }}>
                  {selectedTicket.id}
                </span>
                <h3 style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 700 }}>
                  Support Query Details & Reply
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Candidate Metadata */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ color: "#94a3b8" }}>Candidate:</span>{" "}
                  <strong>{selectedTicket.userName || selectedTicket.user?.name || "Candidate"}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8" }}>Email:</span>{" "}
                  <strong>{selectedTicket.userEmail || selectedTicket.user?.email || "candidate@example.com"}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8" }}>Category:</span>{" "}
                  <strong style={{ color: "#ec4899" }}>{selectedTicket.category}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8" }}>Priority:</span>{" "}
                  <strong style={{ color: "#f97316" }}>{selectedTicket.priority}</strong>
                </div>
              </div>

              {/* Ticket Subject & Description */}
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Query Subject
                </label>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4, color: "white" }}>
                  {selectedTicket.subject}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    padding: 14,
                    borderRadius: 10,
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "#cbd5e1",
                  }}
                >
                  {selectedTicket.description}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Update Ticket Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  <option value="Open" style={{ background: "#0f172a" }}>Open (Pending Review)</option>
                  <option value="In Progress" style={{ background: "#0f172a" }}>In Progress (Under Investigation)</option>
                  <option value="Resolved" style={{ background: "#0f172a" }}>✓ Resolved (Issue Fixed)</option>
                  <option value="Closed" style={{ background: "#0f172a" }}>Closed (Archived)</option>
                </select>
              </div>

              {/* Admin Response Input */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Admin Reply / Solution Note
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your response to the candidate..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 6 }}>
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#94a3b8",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveModal}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                    border: "none",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)",
                  }}
                >
                  💾 Save & Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
