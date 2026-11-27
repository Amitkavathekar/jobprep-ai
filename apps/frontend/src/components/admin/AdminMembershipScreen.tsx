"use client";

import React, { useState } from "react";
import { Coupon } from "../../types";
import { DEFAULT_COUPONS } from "../../services/couponService";
import { PlanData } from "./PlanModal";

interface AdminMembershipScreenProps {
  plans: PlanData[];
  coupons: Coupon[];
  onAddPlan: () => void;
  onEditPlan: (plan: PlanData) => void;
  onToggleStatus: (plan: PlanData) => void;
}

export default function AdminMembershipScreen({
  plans,
  coupons,
  onAddPlan,
  onEditPlan,
  onToggleStatus,
}: AdminMembershipScreenProps) {
  return (
    <div>
      <h4
        style={{
          margin: "0 0 12px",
          fontSize: 14,
          fontWeight: 700,
          color: "#ec4899",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: "JetBrains Mono",
        }}
      >
        Financial Analytics &amp; Plan Revenue Overview
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          ["1 Month (Basic)", "₹1,70,658", "342 Active Subscribers", "#38bdf8"],
          ["3 Months (Plus)", "₹11,11,944", "856 Active Subscribers", "#a855f7"],
          ["6 Months (Pro)", "₹32,64,580", "1,420 Active Subscribers (43% volume)", "#ec4899"],
          ["1 Year (Elite)", "₹27,19,320", "680 Active Subscribers (High LTV)", "#34d399"],
        ].map(([label, revenue, subscribers, color]) => (
          <div
            key={label}
            className="glass-card"
            style={{
              padding: 18,
              borderLeft: `4px solid ${color}`,
              background: label.includes("Pro")
                ? "rgba(236,72,153,0.08)"
                : "rgba(255,255,255,0.025)",
            }}
          >
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{label}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "white",
                marginTop: 4,
              }}
            >
              {revenue}
            </div>
            <div style={{ fontSize: 11, color, marginTop: 2 }}>
              {subscribers}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "white" }}>
          Membership &amp; Subscription Tiers
        </h3>

        <button
          type="button"
          className="btn-primary"
          onClick={onAddPlan}
          style={{
            fontSize: 12,
            padding: "8px 16px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #ec4899, #7c3aed)",
          }}
        >
          + Add New Plan
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {plans.map((plan) => (
          <MembershipPlanCard
            key={plan.id}
            plan={plan}
            coupons={coupons}
            onEditPlan={onEditPlan}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </div>
  );
}

interface MembershipPlanCardProps {
  plan: PlanData;
  coupons: Coupon[];
  onEditPlan: (plan: PlanData) => void;
  onToggleStatus: (plan: PlanData) => void;
}

function MembershipPlanCard({
  plan,
  coupons,
  onEditPlan,
  onToggleStatus,
}: MembershipPlanCardProps) {
  const [couponCode, setCouponCode] = useState("");
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    text: string;
    finalPrice: number;
  } | null>(null);

  const checkCoupon = () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setTestResult(null);
      return;
    }

    const coupon =
      coupons.find((item) => item.code.toUpperCase() === code) ||
      DEFAULT_COUPONS.find((item) => item.code.toUpperCase() === code);

    if (!coupon) {
      setTestResult({
        valid: false,
        text: `✕ Invalid coupon code "${code}"`,
        finalPrice: plan.priceINR,
      });
      return;
    }

    if (coupon.status === "Expired") {
      setTestResult({
        valid: false,
        text: `⚠️ Coupon ${coupon.code} is Expired!`,
        finalPrice: plan.priceINR,
      });
      return;
    }

    const applicable =
      coupon.applicablePlans.includes("All Plans") ||
      coupon.applicablePlans.includes("All") ||
      coupon.applicablePlans.some(
        (item) =>
          item.toLowerCase().includes(plan.name.toLowerCase()) ||
          plan.name.toLowerCase().includes(item.toLowerCase())
      );

    if (!applicable) {
      setTestResult({
        valid: false,
        text: `⚠️ Coupon ${coupon.code} is NOT eligible for ${plan.name}`,
        finalPrice: plan.priceINR,
      });
      return;
    }

    const finalPrice =
      coupon.discountType === "Percentage"
        ? Math.round(plan.priceINR * (1 - coupon.discountValue / 100))
        : Math.max(0, plan.priceINR - coupon.discountValue);

    setTestResult({
      valid: true,
      text: `✓ ${coupon.code} applied`,
      finalPrice,
    });
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: 22,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
        minHeight: 430,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "JetBrains Mono",
              color: "#ec4899",
              textTransform: "uppercase",
            }}
          >
            {plan.duration} ({plan.months} MONTH{plan.months > 1 ? "S" : ""})
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 4,
              background:
                plan.status === "Active"
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(239, 68, 68, 0.15)",
              color: plan.status === "Active" ? "#34d399" : "#f87171",
              fontWeight: 600,
            }}
          >
            ● {plan.status}
          </span>
        </div>

        <h4
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "white",
            margin: "8px 0 4px",
          }}
        >
          {plan.name}
        </h4>

        <div style={{ display: "flex", alignItems: "baseline", margin: "8px 0" }}>
          <span style={{ fontSize: 25, fontWeight: 800, color: "white" }}>
            ₹
            {testResult?.valid
              ? testResult.finalPrice.toLocaleString("en-IN")
              : plan.priceINR.toLocaleString("en-IN")}
          </span>
          {testResult?.valid && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 12,
                color: "#94a3b8",
                textDecoration: "line-through",
              }}
            >
              ₹{plan.priceINR.toLocaleString("en-IN")}
            </span>
          )}
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>
            / total
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 12,
            color: "#cbd5e1",
            margin: "10px 0",
          }}
        >
          {plan.features.map((feature, index) => (
            <div
              key={`${feature}-${index}`}
              style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
            >
              <span style={{ color: "#10b981" }}>✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {testResult && (
          <div
            style={{
              marginBottom: 8,
              fontSize: 11,
              color: testResult.valid ? "#34d399" : "#f87171",
            }}
          >
            {testResult.text}
          </div>
        )}
      </div>

      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            placeholder="Enter code (e.g. FEST)"
            style={{
              width: "100%",
              minWidth: 0,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              borderRadius: 6,
              padding: "6px 8px",
              fontSize: 11,
            }}
          />
          <button
            type="button"
            onClick={checkCoupon}
            style={{
              background: "#0891b2",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Check Coupon
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button
            type="button"
            onClick={() => onToggleStatus(plan)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              borderRadius: 8,
              padding: "8px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {plan.status === "Active" ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => onEditPlan(plan)}
            style={{
              background: "linear-gradient(135deg, #ec4899, #7c3aed)",
              border: "none",
              color: "white",
              borderRadius: 8,
              padding: "8px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Edit Plan
          </button>
        </div>
      </div>
    </div>
  );
}
