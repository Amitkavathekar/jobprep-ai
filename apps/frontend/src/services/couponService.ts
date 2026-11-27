import { Coupon } from "@/types";
import api from "@/lib/axios";
import { logAdminActivity } from "./activityLogService";

// Coupons are fetched dynamically from MongoDB database
export const DEFAULT_COUPONS: Coupon[] = [];

export function isCouponApplicableToPlan(
  coupon: Coupon,
  planName: string
): boolean {
  if (!coupon || !coupon.applicablePlans || coupon.applicablePlans.length === 0)
    return false;
  return coupon.applicablePlans.some((ap) => {
    const target = ap.trim().toLowerCase();
    const current = planName.trim().toLowerCase();
    return (
      target === "all" ||
      target === "all plans" ||
      target.includes(current) ||
      current.includes(target)
    );
  });
}

export function calculateCouponPrice(price: number, coupon: Coupon): number {
  if (coupon.discountType === "Percentage") {
    return Math.round(price * (1 - coupon.discountValue / 100));
  } else {
    return Math.max(0, price - coupon.discountValue);
  }
}

// In-memory cache for fast lookups if needed (NO localStorage)
let memoryCouponsCache: Coupon[] = [];

// Backend API Service - Database Storage (No localStorage)
export async function fetchCouponsApi(): Promise<Coupon[]> {
  try {
    const res = await api.get("/admin/coupons");
    if (res.data?.success && Array.isArray(res.data.data)) {
      memoryCouponsCache = res.data.data;
      return res.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch coupons from database API", err);
  }
  return memoryCouponsCache;
}

export async function createCouponApi(coupon: Coupon): Promise<Coupon> {
  const res = await api.post("/admin/coupons", coupon);
  const createdCoupon = res.data?.data || coupon;

  // Update memory cache
  memoryCouponsCache = [createdCoupon, ...memoryCouponsCache.filter((c) => c.code !== createdCoupon.code)];

  // Automatically log coupon creation activity
  logAdminActivity({
    action: `Created coupon code ${createdCoupon.code} (${createdCoupon.discountValue}${
      createdCoupon.discountType === "Percentage" ? "%" : "₹"
    } OFF)`,
    target: `Coupon: ${createdCoupon.code}`,
    type: "Coupon",
  });

  return createdCoupon;
}

export async function updateCouponApi(id: string, coupon: Partial<Coupon>): Promise<Coupon> {
  const res = await api.put(`/admin/coupons/${id}`, coupon);
  const updated = res.data?.data || ({ ...coupon, id } as Coupon);

  // Update memory cache
  memoryCouponsCache = memoryCouponsCache.map((c) =>
    c.id === id || c.code === coupon.code ? { ...c, ...updated } : c
  );

  // Automatically log coupon update activity
  logAdminActivity({
    action: `Updated coupon settings for ${updated.code || id}`,
    target: `Coupon: ${updated.code || id}`,
    type: "Coupon",
  });

  return updated;
}

export async function deleteCouponApi(id: string): Promise<boolean> {
  await api.delete(`/admin/coupons/${id}`);

  // Update memory cache
  memoryCouponsCache = memoryCouponsCache.filter((c) => c.id !== id && c.code !== id);

  // Automatically log coupon deletion activity
  logAdminActivity({
    action: `Deleted coupon ${id}`,
    target: `Coupon: ${id}`,
    type: "Coupon",
  });

  return true;
}

export async function validateCouponApi(code: string): Promise<{
  valid: boolean;
  coupon?: Coupon;
  message: string;
}> {
  try {
    const res = await api.get(`/admin/coupons/validate/${encodeURIComponent(code)}`);
    if (res.data?.success && res.data.valid) {
      return {
        valid: true,
        coupon: res.data.data,
        message: res.data.message || "Coupon is valid",
      };
    }
    return {
      valid: false,
      message: res.data?.message || "Invalid or expired coupon",
    };
  } catch (err: any) {
    const msg = err.response?.data?.message || "Invalid coupon code";
    return {
      valid: false,
      message: msg,
    };
  }
}

// Deprecated fallback: Returns in-memory cache without accessing localStorage
export function getStoredCoupons(): Coupon[] {
  return memoryCouponsCache;
}

export function saveStoredCoupons(_coupons: Coupon[]): void {
  // Intentionally no-op: coupons are now saved directly in MongoDB database
}
