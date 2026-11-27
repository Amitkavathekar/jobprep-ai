"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import {
  StatCard,
  SearchInput,
  StatusBadge,
  LoadingSpinner,
} from "@/components/common";

interface TransactionItem {
  id: string;
  transactionId: string;
  gatewayTransactionId: string;
  amount: number;
  planName: string;
  userName: string;
  userEmail: string;
  gatewayName: string;
  status: "Success" | "Pending" | "Failed" | "Refunded" | string;
  reason?: string;
  failureReason?: string;
  date: string;
}

interface PaymentSummary {
  totalRevenue: number;
  totalTransactions: number;
  successfulCount: number;
  refundedCount: number;
  failedCount: number;
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulCount: 0,
    refundedCount: 0,
    failedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/payments");
      if (res.data?.success && res.data.data) {
        setTransactions(res.data.data.transactions || []);
        if (res.data.data.summary) {
          setSummary(res.data.data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to fetch payments from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRefund = async (txn: TransactionItem) => {
    if (!window.confirm(`Are you sure you want to refund ₹${txn.amount} for transaction ${txn.transactionId}?`)) {
      return;
    }
    try {
      await api.post(`/admin/payments/${txn.transactionId}/refund`, {
        reason: "Admin manual refund",
      });
      setTransactions((prev) =>
        prev.map((t) => (t.transactionId === txn.transactionId ? { ...t, status: "Refunded" } : t))
      );
      showToast(`Refund processed for transaction ${txn.transactionId}`);
    } catch {
      showToast(`Error processing refund`);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchesStatus =
      statusFilter === "All" || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      t.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.planName.toLowerCase().includes(search.toLowerCase());
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
            background: "rgba(16, 185, 129, 0.9)",
            color: "white",
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
        >
          ✓ {toastMessage}
        </div>
      )}

      {/* Screen Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "white" }}>
          💳 Payments & <span className="gradient-text">Revenue Transactions</span>
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
          Monitor candidate membership purchases, gateway transaction IDs, and handle refunds synced with MongoDB database.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          title="Total Collected Revenue"
          value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
          subtitle={`${summary.successfulCount} Successful Payments`}
          color="#34d399"
        />

        <StatCard
          title="Total Transactions"
          value={summary.totalTransactions}
          subtitle="Across all payment gateways"
          color="#a855f7"
        />

        <StatCard
          title="Refunds Issued"
          value={summary.refundedCount}
          subtitle="Processed through admin"
          color="#f87171"
        />
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: "14px 18px",
          marginBottom: 16,
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: 12,
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ flex: 1, minWidth: 280, maxWidth: 420 }}>
          <SearchInput
            placeholder="Search by transaction ID, candidate name, plan..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Status:</span>
          {["All", "Success", "Failed", "Refunded"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                background: statusFilter === s ? "rgba(236, 72, 153, 0.25)" : "rgba(255, 255, 255, 0.04)",
                color: statusFilter === s ? "#f472b6" : "#94a3b8",
                border: statusFilter === s ? "1px solid #ec4899" : "1px solid rgba(255, 255, 255, 0.08)",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <LoadingSpinner
          text="Loading transactions from MongoDB database..."
          minHeight={160}
        />
      )}

      {/* Transactions Table */}
      {!loading && (
        <div
          className="glass-card"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.04)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>TXN ID</th>
                <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>CANDIDATE</th>
                <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>PLAN</th>
                <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>AMOUNT</th>
                <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>GATEWAY</th>
                <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>DATE</th>
                <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    transition: "background 0.2s",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontFamily: "JetBrains Mono", color: "#cbd5e1" }}>
                    {t.transactionId}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 700, color: "white" }}>{t.userName}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{t.userEmail}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#c084fc", fontWeight: 600 }}>
                    {t.planName}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 800, color: "white" }}>
                    ₹{t.amount}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 12 }}>
                    {t.gatewayName}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status={t.status} />
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 11 }}>
                    {t.date}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {t.status === "Success" ? (
                      <button
                        onClick={() => handleRefund(t)}
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Refund
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: "#64748b" }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                    No transactions match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
