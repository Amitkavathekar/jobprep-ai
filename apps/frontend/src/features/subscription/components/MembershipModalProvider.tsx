"use client";

import React, { useState, useEffect } from "react";
import UserMembershipModal from "./UserMembershipModal";
import { defaultPlans, PlanData } from "@/components/admin/PlanModal";
import api from "@/lib/axios";

export default function MembershipModalProvider() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanData[]>(defaultPlans);

  useEffect(() => {
    // Fetch real plans from backend MongoDB API
    async function fetchPlans() {
      try {
        const res = await api.get("/subscriptions/plans");
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setPlans(res.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch plans from backend, using default plans schema", err);
      }
    }
    fetchPlans();

    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentPlanId(u?.planId || null);
      }
    } catch {}

    const handleOpen = () => {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          setCurrentPlanId(u?.planId || null);
        }
      } catch {}
      setIsOpen(true);
    };

    const handleSubUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ plan?: PlanData }>;
      const plan = customEvent?.detail?.plan;
      if (plan?.id) {
        setCurrentPlanId(plan.id);
      }
    };

    window.addEventListener("open-membership-modal", handleOpen);
    window.addEventListener("subscription-updated", handleSubUpdated);

    return () => {
      window.removeEventListener("open-membership-modal", handleOpen);
      window.removeEventListener("subscription-updated", handleSubUpdated);
    };
  }, []);

  const handleSubscribe = (plan: PlanData) => {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : {};
      u.hasActiveSubscription = true;
      u.isSubscribed = true;
      u.plan = plan.name;
      u.planId = plan.id;
      localStorage.setItem("user", JSON.stringify(u));
    } catch {}
    setCurrentPlanId(plan.id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("subscription-updated", { detail: { plan } }));
    }
  };

  return (
    <UserMembershipModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      plans={plans}
      currentPlanId={currentPlanId}
      onSubscribe={handleSubscribe}
    />
  );
}
