import { Coupon } from "../types";

export const DEFAULT_COUPONS: Coupon[] = [
  {
    code: "FESTIVE25",
    discountType: "Percentage",
    discountValue: 25,
    status: "Active",
    applicablePlans: ["Pro", "Elite", "Elite VIP"],
  },
  {
    code: "STUDENT50",
    discountType: "Percentage",
    discountValue: 50,
    status: "Active",
    applicablePlans: ["Pro", "Elite", "Elite VIP"],
  },
  {
    code: "SAVE20",
    discountType: "Percentage",
    discountValue: 20,
    status: "Active",
    applicablePlans: ["Basic", "Plus", "Pro", "Elite VIP"],
  },
  {
    code: "FLAT500",
    discountType: "Fixed",
    discountValue: 500,
    status: "Active",
    applicablePlans: ["Plus", "Pro", "Elite VIP"],
  },
  {
    code: "EXPIRED30",
    discountType: "Percentage",
    discountValue: 30,
    status: "Expired",
    applicablePlans: ["Pro"],
  },
];

const STORAGE_KEY = "jobprep_coupons";

export function getStoredCoupons(): Coupon[] {
  if (typeof window === "undefined") return DEFAULT_COUPONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_COUPONS;
}

export function saveStoredCoupons(coupons: Coupon[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  } catch {}
}

export function isCouponApplicableToPlan(coupon: Coupon, planName: string): boolean {
  if (!coupon || !coupon.applicablePlans || !Array.isArray(coupon.applicablePlans)) {
    return false;
  }
  const target = planName.trim().toLowerCase();
  return coupon.applicablePlans.some((ap) => {
    const norm = ap.trim().toLowerCase();
    return (
      norm === "all" ||
      norm === target ||
      target.includes(norm) ||
      norm.includes(target)
    );
  });
}

export function calculateCouponPrice(priceINR: number, coupon: Coupon): number {
  if (!coupon) return priceINR;
  if (coupon.discountType === "Percentage") {
    const discount = Math.round((priceINR * coupon.discountValue) / 100);
    return Math.max(0, priceINR - discount);
  }
  if (coupon.discountType === "Fixed") {
    return Math.max(0, priceINR - coupon.discountValue);
  }
  return priceINR;
}
