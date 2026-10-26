"use client";

import React, { useState } from "react";
import { PlanData, defaultPlans } from "./admin/PlanModal";
import { Coupon } from "../types";
import {
  getStoredCoupons,
  isCouponApplicableToPlan,
  calculateCouponPrice,
} from "../services/couponService";

export interface UserMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans?: PlanData[];
  currentPlanId?: string | null;
  onSubscribe?: (plan: PlanData) => void;
}

export default function UserMembershipModal({
  isOpen,
  onClose,
  plans = defaultPlans,
  currentPlanId = null,
  onSubscribe,
}: UserMembershipModalProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  if (!isOpen) return null;

  const effectivePlans = plans && plans.length > 0 ? plans : defaultPlans;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    const couponsList = getStoredCoupons();
    const found = couponsList.find((c) => c.code.trim().toUpperCase() === cleanCode);

    if (!found) {
      setAppliedCoupon(null);
      setCouponMsg({ type: "error", text: `Invalid coupon code "${cleanCode}".` });
      return;
    }

    if (found.status === "Expired") {
      setAppliedCoupon(null);
      setCouponMsg({ type: "error", text: `Coupon "${found.code}" has expired.` });
      return;
    }

    setAppliedCoupon(found);
    const plansLabel = found.applicablePlans.join(", ");
    setCouponMsg({
      type: "success",
      text: `Coupon "${found.code}" applied! (${found.discountType === "Percentage" ? found.discountValue + "% OFF" : "₹" + found.discountValue + " OFF"}). Valid for: ${plansLabel}.`,
    });
  };

  const handlePlanSubscribe = (plan: PlanData) => {
    if (onSubscribe) {
      onSubscribe(plan);
    } else {
      try {
        const raw = localStorage.getItem("user");
        const u = raw ? JSON.parse(raw) : {};
        u.hasActiveSubscription = true;
        u.isSubscribed = true;
        u.plan = plan.name;
        u.planId = plan.id;
        localStorage.setItem("user", JSON.stringify(u));
      } catch {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("subscription-updated", { detail: { plan } }));
      }
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(5, 5, 20, 0.82)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="fade-in glass-card"
        style={{
          width: "100%",
          maxWidth: 1340,
          background: "linear-gradient(145deg, rgba(15, 15, 42, 0.95), rgba(7, 7, 26, 0.98))",
          border: "1px solid rgba(124, 58, 237, 0.35)",
          borderRadius: 24,
          padding: "32px 36px",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 58, 237, 0.25)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd", fontSize: 12, fontWeight: 700, marginBottom: 8, fontFamily: "JetBrains Mono" }}>
              ⚡ UNLOCK ALL PREMIUM FEATURES
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.02em" }}>
              Upgrade Your <span className="gradient-text">Membership Plan</span>
            </h2>
            <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 14, margin: "6px 0 0" }}>
              Unlock complete AI analysis, all ATS checks, unlimited mock interview questions & full model answers.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "rgba(255, 255, 255, 0.7)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 18,
              transition: "all 0.2s ease",
            }}
            title="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Coupon Bar */}
        <div
          style={{
            background: "rgba(124, 58, 237, 0.08)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            borderRadius: 14,
            padding: "12px 18px",
            marginBottom: 24,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🎟️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Have a Discount Coupon?</div>
              <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)" }}>Use code FESTIVE25 for 25% OFF or STUDENT50 for 50% OFF (Pro & Elite)</div>
            </div>
          </div>
          <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 8,
                padding: "7px 12px",
                color: "white",
                fontSize: 13,
                fontFamily: "JetBrains Mono",
                width: 160,
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: "7px 16px", fontSize: 12, borderRadius: 8, flexShrink: 0 }}
            >
              Apply Code
            </button>
          </form>
        </div>

        {couponMsg && (
          <div
            style={{
              marginBottom: 20,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: couponMsg.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: couponMsg.type === "success" ? "#10b981" : "#fca5a5",
              border: `1px solid ${couponMsg.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            {couponMsg.text}
          </div>
        )}

        {/* Plans Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 24 }}>
          {effectivePlans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const isPopular = plan.popular || plan.badge?.toLowerCase().includes("popular");
            const isEligible = appliedCoupon ? isCouponApplicableToPlan(appliedCoupon, plan.name) : false;
            const finalPrice = (appliedCoupon && isEligible)
              ? calculateCouponPrice(plan.priceINR, appliedCoupon)
              : plan.priceINR;

            return (
              <div
                key={plan.id}
                style={{
                  position: "relative",
                  background: isPopular
                    ? "linear-gradient(160deg, rgba(124, 58, 237, 0.2), rgba(15, 15, 42, 0.9))"
                    : "rgba(255, 255, 255, 0.03)",
                  border: isEligible && appliedCoupon
                    ? "2px solid #10b981"
                    : isPopular
                    ? "2px solid rgba(124, 58, 237, 0.7)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 18,
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: isEligible && appliedCoupon
                    ? "0 8px 25px rgba(16, 185, 129, 0.25)"
                    : isPopular
                    ? "0 12px 30px rgba(124, 58, 237, 0.3)"
                    : undefined,
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      right: 16,
                      background: isPopular ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(6, 182, 212, 0.9)",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(148,163,184,0.8)", marginBottom: 4, fontFamily: "JetBrains Mono" }}>
                    {plan.duration}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: "0 0 12px 0" }}>
                    {plan.name}
                  </h3>

                  {/* Price display */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>
                        ₹{finalPrice.toLocaleString()}
                      </span>
                      {(isEligible || (plan.originalPriceINR && plan.originalPriceINR > plan.priceINR)) && (
                        <span style={{ fontSize: 14, color: "rgba(148,163,184,0.5)", textDecoration: "line-through" }}>
                          ₹{(isEligible ? plan.priceINR : (plan.originalPriceINR ?? plan.priceINR)).toLocaleString()}
                        </span>
                      )}
                      {appliedCoupon && isEligible && (
                        <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700, fontFamily: "JetBrains Mono" }}>
                          ({appliedCoupon.discountType === "Percentage" ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})
                        </span>
                      )}
                    </div>

                    {appliedCoupon && !isEligible && (
                      <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        ⚠️ Coupon {appliedCoupon.code} not valid for {plan.name}
                      </div>
                    )}
                  </div>

                  {/* Limits summary */}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      marginBottom: 16,
                      fontSize: 11,
                      color: "rgba(226, 232, 240, 0.8)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div>🎯 <strong>{plan.mockLimit}</strong></div>
                    <div>⚡ <strong>{plan.atsLimit}</strong></div>
                    {plan.aiCredits ? <div>💎 <strong>{plan.aiCredits} AI Credits</strong> included</div> : null}
                  </div>

                  {/* Features list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {plan.features.slice(0, 5).map((feat, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "rgba(226, 232, 240, 0.85)" }}>
                        <span style={{ color: "#10b981", fontSize: 12, fontWeight: 800 }}>✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button */}
                <button
                  type="button"
                  className={isPopular ? "btn-primary" : "btn-ghost"}
                  style={{
                    width: "100%",
                    padding: "11px",
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 10,
                    justifyContent: "center",
                    background: isCurrent ? "rgba(16, 185, 129, 0.2)" : undefined,
                    borderColor: isCurrent ? "#10b981" : undefined,
                    color: isCurrent ? "#10b981" : undefined,
                  }}
                  onClick={() => handlePlanSubscribe(plan)}
                >
                  {isCurrent ? "✓ Currently Active" : "Subscribe & Unlock All →"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div style={{ textAlign: "center", fontSize: 12, color: "rgba(148, 163, 184, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <span>🔒 256-Bit Secure Checkout</span>
          <span>⚡ Instant Feature Activation</span>
          <span>💬 24/7 Priority Support</span>
        </div>
      </div>
    </div>
  );
}
