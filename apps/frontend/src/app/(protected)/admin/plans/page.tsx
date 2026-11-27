"use client";

import React, { useState, useEffect } from "react";
import AdminMembershipScreen from "@/components/admin/AdminMembershipScreen";
import PlanModal, { PlanData } from "@/components/admin/PlanModal";
import { Coupon } from "@/types";
import { fetchCouponsApi } from "@/services/couponService";
import {
  fetchPlansApi,
  createPlanApi,
  updatePlanApi,
  togglePlanStatusApi,
} from "@/services/planService";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [dbPlans, dbCoupons] = await Promise.all([
          fetchPlansApi(),
          fetchCouponsApi(),
        ]);
        setPlans(dbPlans);
        setCoupons(dbCoupons);
      } catch (err) {
        console.error("Error loading plans from database:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => {
      setSaveStatus((current) => (current === msg ? null : current));
    }, 3500);
  };

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: PlanData) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (plan: PlanData) => {
    const nextStatus = plan.status === "Active" ? "Draft" : "Active";
    // Optimistic UI update
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, status: nextStatus } : p))
    );

    try {
      const updated = await togglePlanStatusApi(plan.id, nextStatus);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id || p.id === updated.id ? updated : p))
      );
      showNotification(`Plan "${plan.name}" status updated to ${nextStatus} in database.`);
    } catch (err) {
      console.error("Failed to toggle status in database:", err);
      // Revert if error
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, status: plan.status } : p))
      );
    }
  };

  const handleSavePlan = async (plan: PlanData) => {
    try {
      if (editingPlan) {
        showNotification(`Updating plan "${plan.name}" in database...`);
        const updated = await updatePlanApi(editingPlan.id, plan);
        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlan.id || p.id === updated.id ? updated : p))
        );
        showNotification(`Plan "${plan.name}" saved successfully to database.`);
      } else {
        showNotification(`Creating plan "${plan.name}" in database...`);
        const created = await createPlanApi(plan);
        setPlans((prev) => [...prev.filter((p) => p.id !== created.id), created]);
        showNotification(`New plan "${plan.name}" stored in database.`);
      }
    } catch (err) {
      console.error("Failed to save plan in database:", err);
      showNotification("Error saving plan to database. Please check backend connection.");
    }
  };

  return (
    <div style={{ padding: "28px 32px", minHeight: "100%", background: "#0a0a1a", color: "#f8fafc", position: "relative" }}>
      {/* Database status toast */}
      {saveStatus && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 99999,
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>💾</span>
          <span>{saveStatus}</span>
        </div>
      )}

      {isLoading && (
        <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>
          Loading plans...
        </div>
      )}

      <AdminMembershipScreen
        plans={plans}
        coupons={coupons}
        onAddPlan={handleOpenAdd}
        onEditPlan={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
      />

      {isModalOpen && (
        <PlanModal
          key={editingPlan ? editingPlan.id : "new-plan"}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlan(null);
          }}
          onSave={handleSavePlan}
          initialData={editingPlan}
        />
      )}
    </div>
  );
}
