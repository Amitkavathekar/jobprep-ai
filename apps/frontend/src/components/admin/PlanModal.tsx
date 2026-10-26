"use client";

import React from "react";

export interface PlanData {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  duration: string;
  priceINR: number;
  originalPriceINR?: number;
  mockLimit: string;
  atsLimit: string;
  aiCredits?: number | string;
  features: string[];
}

export const defaultPlans: PlanData[] = [
  {
    id: "plan-basic",
    name: "Basic",
    duration: "1 Month",
    badge: "1 Month",
    priceINR: 499,
    originalPriceINR: 699,
    mockLimit: "10 AI Mock Interviews",
    atsLimit: "25 ATS Resume Scans",
    aiCredits: 50,
    features: [
      "10 AI Mock Interviews",
      "25 ATS Resume Scans",
      "Standard AI Feedback",
      "Email & Chat Support",
    ],
  },
  {
    id: "plan-plus",
    name: "Plus",
    duration: "3 Months",
    badge: "3 Months",
    priceINR: 1299,
    originalPriceINR: 1599,
    mockLimit: "35 AI Mock Interviews",
    atsLimit: "75 ATS Resume Scans",
    aiCredits: 150,
    features: [
      "35 AI Mock Interviews",
      "75 ATS Resume Scans",
      "Detailed Speech Analysis",
      "All ATS Diagnostic Checks",
      "Priority Chat Support",
    ],
  },
  {
    id: "plan-pro",
    name: "Pro",
    duration: "6 Months",
    badge: "🔥 MOST POPULAR",
    popular: true,
    priceINR: 2299,
    originalPriceINR: 2999,
    mockLimit: "Unlimited Mock Interviews",
    atsLimit: "Unlimited ATS Scans",
    aiCredits: "Unlimited",
    features: [
      "Unlimited Mock Interviews",
      "Unlimited ATS Scans",
      "Live Speech & Confidence Analysis",
      "1-on-1 AI Resume Optimization",
      "Full Model Answers & Scoring",
      "Priority 24/7 Support",
    ],
  },
  {
    id: "plan-elite",
    name: "Elite VIP",
    duration: "1 Year",
    badge: "👑 BEST VALUE",
    priceINR: 3999,
    originalPriceINR: 5999,
    mockLimit: "Unlimited + VIP Queue",
    atsLimit: "Unlimited + VIP Scans",
    aiCredits: "Unlimited VIP",
    features: [
      "All Pro Features Included",
      "VIP Priority Processing Queue",
      "Executive Job Application Tracker",
      "Dedicated Placement Advisor",
      "Custom Interview Simulations",
      "24/7 Priority Support",
    ],
  },
];

export interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: PlanData | null;
  onSave?: (plan: PlanData) => void;
}

export default function PlanModal({ isOpen, onClose, plan, onSave }: PlanModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(5, 5, 20, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 500,
          background: "#0f0f2a",
          border: "1px solid rgba(124, 58, 237, 0.4)",
          borderRadius: 16,
          padding: 24,
          color: "white",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          {plan ? `Edit Plan: ${plan.name}` : "Create New Plan"}
        </h3>
        <p style={{ fontSize: 13, color: "rgba(148, 163, 184, 0.8)", marginBottom: 16 }}>
          Manage membership plan limits, pricing, and features.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: "8px 16px" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
