import api from "@/lib/axios";
import { PlanData } from "@/components/admin/PlanModal";
import { logAdminActivity } from "./activityLogService";

// In-memory cache for fast synchronous access fetched dynamically from MongoDB database
let inMemoryPlans: PlanData[] = [];

// Clean up any legacy localStorage entry so plans are never stored in localStorage
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("jobprep_admin_plans");
  } catch {}
}

/**
 * Fetch all membership plans directly from the MongoDB database via backend API
 */
export async function fetchPlansApi(): Promise<PlanData[]> {
  try {
    const res = await api.get("/admin/plans");
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      inMemoryPlans = res.data.data;
      return inMemoryPlans;
    }
  } catch (err) {
    try {
      // Fallback to subscriptions endpoint
      const subRes = await api.get("/subscriptions/plans");
      if (subRes.data?.success && Array.isArray(subRes.data.data) && subRes.data.data.length > 0) {
        inMemoryPlans = subRes.data.data;
        return inMemoryPlans;
      }
    } catch (fallbackErr) {
      console.warn("Could not fetch plans from database, using cached plans:", fallbackErr);
    }
  }

  return inMemoryPlans;
}

/**
 * Create a new membership plan directly in the MongoDB database
 */
export async function createPlanApi(plan: PlanData): Promise<PlanData> {
  let createdPlan: PlanData = { ...plan };

  try {
    const res = await api.post("/admin/plans", plan);
    if (res.data?.success && res.data.data) {
      createdPlan = res.data.data;
    }
  } catch (err) {
    console.error("Backend API error when creating plan in database:", err);
  }

  // Update in-memory cache (NOT localStorage)
  inMemoryPlans = [...inMemoryPlans.filter((p) => p.id !== createdPlan.id), createdPlan];

  logAdminActivity({
    action: `Added new membership plan "${createdPlan.name}" (₹${createdPlan.priceINR} / ${createdPlan.duration})`,
    target: `Plan: ${createdPlan.name}`,
    type: "Pricing",
  });

  return createdPlan;
}

/**
 * Update a membership plan directly in the MongoDB database
 */
export async function updatePlanApi(id: string, updates: Partial<PlanData>): Promise<PlanData> {
  let updatedPlan: PlanData = {
    ...(inMemoryPlans.find((p) => p.id === id) || ({} as PlanData)),
    ...updates,
    id,
  };

  try {
    const res = await api.put(`/admin/plans/${id}`, updates);
    if (res.data?.success && res.data.data) {
      updatedPlan = res.data.data;
    }
  } catch (err) {
    console.error("Backend API error when updating plan in database:", err);
  }

  // Update in-memory cache (NOT localStorage)
  inMemoryPlans = inMemoryPlans.map((p) => (p.id === id ? updatedPlan : p));

  logAdminActivity({
    action: `Updated membership plan "${updatedPlan.name || id}" (Price set to ₹${updatedPlan.priceINR})`,
    target: `Plan: ${updatedPlan.name || id}`,
    type: "Pricing",
  });

  return updatedPlan;
}

/**
 * Toggle plan status (Active <-> Draft) directly in the database
 */
export async function togglePlanStatusApi(id: string, nextStatus?: string): Promise<PlanData> {
  const current = inMemoryPlans.find((p) => p.id === id);
  const statusToSet = nextStatus || (current?.status === "Active" ? "Draft" : "Active");

  try {
    const res = await api.patch(`/admin/plans/${id}/status`, { status: statusToSet });
    if (res.data?.success && res.data.data) {
      const updated = res.data.data;
      inMemoryPlans = inMemoryPlans.map((p) => (p.id === id ? updated : p));
      return updated;
    }
  } catch (err) {
    console.error("Backend API error toggling plan status:", err);
  }

  return updatePlanApi(id, { status: statusToSet as any });
}

/**
 * Delete a membership plan from the database
 */
export async function deletePlanApi(id: string): Promise<boolean> {
  try {
    await api.delete(`/admin/plans/${id}`);
  } catch (err) {
    console.error("Backend API error deleting plan from database:", err);
  }

  const planToDelete = inMemoryPlans.find((p) => p.id === id);
  inMemoryPlans = inMemoryPlans.filter((p) => p.id !== id);

  logAdminActivity({
    action: `Deleted membership plan "${planToDelete?.name || id}"`,
    target: `Plan: ${planToDelete?.name || id}`,
    type: "Pricing",
  });

  return true;
}

// In-memory backward-compatible helper methods (strictly without localStorage)
export function getStoredPlans(): PlanData[] {
  return inMemoryPlans;
}

export function saveStoredPlans(plans: PlanData[]): void {
  inMemoryPlans = plans;
}

export function createPlan(plan: PlanData): PlanData {
  const newPlan: PlanData = {
    ...plan,
    id: plan.id || `plan-${Date.now()}`,
  };
  inMemoryPlans = [...inMemoryPlans, newPlan];
  // Persist asynchronously in database
  createPlanApi(newPlan).catch(() => {});
  return newPlan;
}

export function updatePlan(id: string, updates: Partial<PlanData>): PlanData | null {
  const existing = inMemoryPlans.find((p) => p.id === id);
  if (!existing) return null;

  const updatedPlan: PlanData = { ...existing, ...updates };
  inMemoryPlans = inMemoryPlans.map((p) => (p.id === id ? updatedPlan : p));
  // Persist asynchronously in database
  updatePlanApi(id, updates).catch(() => {});
  return updatedPlan;
}

export function deletePlan(id: string): boolean {
  inMemoryPlans = inMemoryPlans.filter((p) => p.id !== id);
  // Persist asynchronously in database
  deletePlanApi(id).catch(() => {});
  return true;
}
