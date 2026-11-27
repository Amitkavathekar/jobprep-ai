import React, { useState, useEffect } from "react";
import { Coupon } from "@/types";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (coupon: Coupon) => void;
  initialData?: Coupon | null;
}

const ALL_PLANS = ["Basic", "Plus", "Pro", "Elite"];

export default function CouponModal({ isOpen, onClose, onSave, initialData }: CouponModalProps) {
  const [code, setCode] = useState(initialData?.code || "");
  const [discountType, setDiscountType] = useState<"Percentage" | "Flat Amount">(
    initialData?.discountType === "Flat Amount" ? "Flat Amount" : "Percentage"
  );
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue || 25);
  const [selectedPlans, setSelectedPlans] = useState<string[]>(initialData?.applicablePlans || ["All Plans"]);
  const [usageLimit, setUsageLimit] = useState(initialData?.usageLimit || 500);
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || "2026-12-31");
  const [status, setStatus] = useState<"Active" | "Expired" | "Draft">(initialData?.status || "Active");

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || "");
      setDiscountType(initialData.discountType === "Flat Amount" ? "Flat Amount" : "Percentage");
      setDiscountValue(initialData.discountValue ?? 25);
      setSelectedPlans(initialData.applicablePlans && initialData.applicablePlans.length > 0 ? initialData.applicablePlans : ["All Plans"]);
      setUsageLimit(initialData.usageLimit ?? 500);
      setExpiryDate(initialData.expiryDate || initialData.expiresAt || "2026-12-31");
      setStatus(initialData.status || "Active");
    } else {
      setCode("");
      setDiscountType("Percentage");
      setDiscountValue(25);
      setSelectedPlans(["All Plans"]);
      setUsageLimit(500);
      setExpiryDate("2026-12-31");
      setStatus("Active");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const togglePlan = (plan: string) => {
    if (plan === "All Plans") {
      setSelectedPlans(["All Plans"]);
      return;
    }
    const filtered = selectedPlans.filter((p) => p !== "All Plans");
    if (filtered.includes(plan)) {
      const next = filtered.filter((p) => p !== plan);
      setSelectedPlans(next.length === 0 ? ["All Plans"] : next);
    } else {
      setSelectedPlans([...filtered, plan]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: Coupon = {
      id: initialData?.id || `cpn_${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      applicablePlans: selectedPlans,
      usageLimit: Number(usageLimit),
      timesUsed: initialData?.timesUsed || 0,
      expiryDate,
      status,
    };
    onSave(newCoupon);
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
          maxWidth: 540,
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
            <span style={{ fontSize: 20 }}>🏷</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "white" }}>
                {initialData ? "Edit Coupon Code" : "Create New Coupon Code"}
              </h3>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Set discount rules and applicable subscription plans</span>
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Coupon Code
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. FESTIVE50"
              className="glass-input"
              style={{ marginTop: 4, textTransform: "uppercase", fontFamily: "JetBrains Mono", fontWeight: 700, letterSpacing: "0.05em" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                }}
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Flat Amount">Flat Amount (₹ INR)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Discount Value ({discountType === "Percentage" ? "%" : "₹"})
              </label>
              <input
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="glass-input"
                style={{ marginTop: 4 }}
              />
            </div>
          </div>

          {/* Applicable Plans Multi-Select */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Applicable Plans (Select Multiple)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["All Plans", ...ALL_PLANS].map((planName) => {
                const isSelected = selectedPlans.includes(planName);
                return (
                  <button
                    key={planName}
                    type="button"
                    onClick={() => togglePlan(planName)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected ? "1px solid #ec4899" : "1px solid rgba(255,255,255,0.12)",
                      background: isSelected ? "rgba(236, 72, 153, 0.2)" : "rgba(255,255,255,0.04)",
                      color: isSelected ? "#f472b6" : "#cbd5e1",
                    }}
                  >
                    {isSelected ? "✓ " : ""}{planName}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Usage Limit
              </label>
              <input
                type="number"
                required
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="glass-input"
                style={{ marginTop: 4 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Expiry Date
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="glass-input"
                style={{ marginTop: 4 }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Initial Status
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
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 13,
              }}
            >
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: "8px 22px",
                fontSize: 13,
                background: "linear-gradient(135deg, #ec4899, #7c3aed)",
              }}
            >
              {initialData ? "Save Coupon" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
