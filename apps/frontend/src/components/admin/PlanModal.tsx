"use client";

import React, { useState, useEffect } from "react";

export interface PlanData {
  id: string;
  name: string;
  duration: string;
  months: number;
  priceINR: number;
  originalPriceINR?: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  mockLimit: string;
  atsLimit: string;
  aiCredits?: number;
  status: "Active" | "Draft" | "Archived";
  subscribersCount: number;
}

// Default plans are now stored and fetched dynamically from MongoDB database
export const defaultPlans: PlanData[] = [];

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: PlanData) => void;
  initialData?: PlanData | null;
}

export default function PlanModal({ isOpen, onClose, onSave, initialData }: PlanModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [duration, setDuration] = useState(initialData?.duration || "3 Months");
  const [months, setMonths] = useState(initialData?.months || 3);
  const [priceINR, setPriceINR] = useState(initialData?.priceINR || 1499);
  const [mockLimit, setMockLimit] = useState(initialData?.mockLimit || "40 Interviews / qtr");
  const [atsLimit, setAtsLimit] = useState(initialData?.atsLimit || "80 Resume Scans / qtr");
  const [status, setStatus] = useState<"Active" | "Draft" | "Archived">(initialData?.status || "Active");
  
  const [features, setFeatures] = useState<string[]>(
    initialData?.features || [
      "AI Mock Interviews with Speech Analysis",
      "ATS Resume Scan & Optimization",
      "Full Technical Question Bank Access",
      "Priority Email & Chat Support",
    ]
  );
  const [newFeatureText, setNewFeatureText] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDuration(initialData.duration || "3 Months");
      setMonths(initialData.months || 3);
      setPriceINR(initialData.priceINR ?? 0);
      setMockLimit(initialData.mockLimit || "40 Interviews / qtr");
      setAtsLimit(initialData.atsLimit || "80 Resume Scans / qtr");
      setStatus(initialData.status || "Active");
      setFeatures(initialData.features && initialData.features.length > 0 ? [...initialData.features] : []);
    } else {
      setName("");
      setDuration("3 Months");
      setMonths(3);
      setPriceINR(1499);
      setMockLimit("40 Interviews / qtr");
      setAtsLimit("80 Resume Scans / qtr");
      setStatus("Active");
      setFeatures([
        "AI Mock Interviews with Speech Analysis",
        "ATS Resume Scan & Optimization",
        "Full Technical Question Bank Access",
        "Priority Email & Chat Support",
      ]);
    }
    setNewFeatureText("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: PlanData = {
      ...(initialData || {}),
      id: initialData?.id || `plan-${Date.now()}`,
      name: name || "New Membership Plan",
      duration,
      months: Number(months),
      priceINR: Number(priceINR),
      originalPriceINR: initialData?.originalPriceINR ?? Number(priceINR),
      features,
      mockLimit,
      atsLimit,
      status,
      subscribersCount: initialData?.subscribersCount || 0,
    };
    onSave(newPlan);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(5, 5, 16, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 960,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          background: "rgba(13, 13, 35, 0.95)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>💳</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "white" }}>
                {initialData ? "Edit Membership Plan" : "Add New Membership Plan"}
              </h3>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Configure plan details with live real-time card preview
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#94a3b8",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Grid with Form & Live Preview */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          {/* Left Column: Input Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Plan Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pro"
                className="glass-input"
                style={{ marginTop: 4, padding: "8px 12px", fontSize: 13 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Duration Tag
                </label>
                <select
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    if (e.target.value.includes("1 Month")) setMonths(1);
                    else if (e.target.value.includes("3 Month")) setMonths(3);
                    else if (e.target.value.includes("6 Month")) setMonths(6);
                    else if (e.target.value.includes("1 Year")) setMonths(12);
                  }}
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
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="Custom Pass">Custom Pass</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Duration (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="glass-input"
                  style={{ marginTop: 4, padding: "8px 12px", fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Price (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={priceINR}
                  onChange={(e) => setPriceINR(Number(e.target.value))}
                  className="glass-input"
                  style={{ marginTop: 4, padding: "8px 12px", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
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
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Mock Limit Text
                </label>
                <input
                  type="text"
                  value={mockLimit}
                  onChange={(e) => setMockLimit(e.target.value)}
                  className="glass-input"
                  style={{ marginTop: 4, padding: "8px 10px", fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  ATS Limit Text
                </label>
                <input
                  type="text"
                  value={atsLimit}
                  onChange={(e) => setAtsLimit(e.target.value)}
                  className="glass-input"
                  style={{ marginTop: 4, padding: "8px 10px", fontSize: 12 }}
                />
              </div>
            </div>

            {/* Repeatable Features Section */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Plan Included Features ({features.length})
              </label>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  placeholder="Add feature item..."
                  className="glass-input"
                  style={{ padding: "6px 10px", fontSize: 12 }}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  style={{
                    background: "rgba(236, 72, 153, 0.2)",
                    border: "1px solid #ec4899",
                    color: "#f472b6",
                    padding: "6px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  + Add
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto" }}>
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(255,255,255,0.03)",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      color: "#cbd5e1",
                    }}
                  >
                    <span>✓ {feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: 12,
                        padding: "0 4px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Right Column: Live Plan Card Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#ec4899", fontFamily: "JetBrains Mono", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ● LIVE CARD PREVIEW
            </div>

            <div
              className="glass-card"
              style={{
                padding: 24,
                borderRadius: 16,
                position: "relative",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(124, 58, 237, 0.12))",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono", color: "#ec4899", textTransform: "uppercase" }}>
                  {duration} ({months} Month{months > 1 ? "s" : ""})
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: status === "Active" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    color: status === "Active" ? "#34d399" : "#f87171",
                    fontWeight: 600,
                  }}
                >
                  ● {status}
                </span>
              </div>

              <h4 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "10px 0 6px" }}>
                {name || "Untitled Plan"}
              </h4>

              <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "12px 0 16px" }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: "#ffffff" }}>₹{priceINR}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>/ total</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: 8, fontSize: 11, color: "#cbd5e1" }}>
                  <span style={{ color: "#ec4899", fontWeight: 700, display: "block" }}>Mock Interviews:</span>
                  {mockLimit}
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: 8, fontSize: 11, color: "#cbd5e1" }}>
                  <span style={{ color: "#06b6d4", fontWeight: 700, display: "block" }}>ATS Scans:</span>
                  {atsLimit}
                </div>
              </div>

              <ul style={{ paddingLeft: 16, margin: "0 0 16px", fontSize: 12, color: "#cbd5e1", display: "flex", flexDirection: "column", gap: 6 }}>
                {features.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>

              <button
                disabled
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #ec4899, #7c3aed)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  opacity: 0.8,
                }}
              >
                Get Started Now
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: "8px 18px", fontSize: 13, borderRadius: 8 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{
              padding: "8px 22px",
              fontSize: 13,
              borderRadius: 8,
              background: "linear-gradient(135deg, #ec4899, #7c3aed)",
            }}
          >
            {initialData ? "Save Changes" : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
