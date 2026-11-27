import { CouponModel } from "./coupon.model";
import { logAdminActivity } from "../activity-log/activity-log.service";

export async function getCouponsService() {
  let coupons = await CouponModel.find().sort({ createdAt: -1 });

  // Seed default coupons into database if collection is empty
  if (coupons.length === 0) {
    const defaultCoupons = [
      {
        code: "FESTIVE25",
        discountType: "Percentage" as const,
        discountValue: 25,
        applicablePlans: ["All Plans"],
        usageLimit: 500,
        timesUsed: 14,
        expiryDate: "2026-12-31",
        status: "Active" as const,
      },
      {
        code: "STUDENT50",
        discountType: "Percentage" as const,
        discountValue: 50,
        applicablePlans: ["Pro", "Elite"],
        usageLimit: 200,
        timesUsed: 42,
        expiryDate: "2026-12-31",
        status: "Active" as const,
      },
    ];

    coupons = (await CouponModel.insertMany(defaultCoupons)) as any;
  }

  return coupons;
}

export async function createCouponService(data: {
  code: string;
  discountType?: "Percentage" | "Flat Amount" | "Fixed";
  discountValue: number;
  applicablePlans?: string[];
  usageLimit?: number;
  timesUsed?: number;
  expiryDate?: string;
  status?: "Active" | "Expired" | "Draft";
}) {
  const cleanCode = data.code.trim().toUpperCase();

  const existing = await CouponModel.findOne({ code: cleanCode });
  if (existing) {
    return { error: "CONFLICT", message: `Coupon code '${cleanCode}' already exists` };
  }

  const newCoupon = await CouponModel.create({
    code: cleanCode,
    discountType: data.discountType || "Percentage",
    discountValue: Number(data.discountValue),
    applicablePlans:
      Array.isArray(data.applicablePlans) && data.applicablePlans.length > 0
        ? data.applicablePlans
        : ["All Plans"],
    usageLimit: Number(data.usageLimit) || 500,
    timesUsed: Number(data.timesUsed) || 0,
    expiryDate: data.expiryDate || "2026-12-31",
    status: data.status || "Active",
  });

  await logAdminActivity(
    `Created coupon code ${cleanCode} (${data.discountValue}${
      (data.discountType || "Percentage") === "Percentage" ? "%" : "₹"
    } OFF)`,
    `Coupon: ${cleanCode}`,
    "Coupon"
  );

  return { success: true, data: newCoupon };
}

export async function updateCouponService(
  id: string,
  data: {
    code?: string;
    discountType?: "Percentage" | "Flat Amount" | "Fixed";
    discountValue?: number;
    applicablePlans?: string[];
    usageLimit?: number;
    timesUsed?: number;
    expiryDate?: string;
    status?: "Active" | "Expired" | "Draft";
  }
) {
  const coupon = await CouponModel.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { code: id.toUpperCase() }],
  });

  if (!coupon) {
    return null;
  }

  if (data.code) coupon.code = data.code.trim().toUpperCase();
  if (data.discountType) coupon.discountType = data.discountType;
  if (data.discountValue !== undefined) coupon.discountValue = Number(data.discountValue);
  if (data.applicablePlans) coupon.applicablePlans = data.applicablePlans;
  if (data.usageLimit !== undefined) coupon.usageLimit = Number(data.usageLimit);
  if (data.timesUsed !== undefined) coupon.timesUsed = Number(data.timesUsed);
  if (data.expiryDate) coupon.expiryDate = data.expiryDate;
  if (data.status) coupon.status = data.status;

  await coupon.save();

  await logAdminActivity(
    `Updated coupon settings for ${coupon.code}`,
    `Coupon: ${coupon.code}`,
    "Coupon"
  );

  return coupon;
}

export async function deleteCouponService(id: string) {
  const deleted = await CouponModel.findOneAndDelete({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { code: id.toUpperCase() }],
  });

  if (!deleted) {
    return null;
  }

  await logAdminActivity(
    `Deleted coupon ${deleted.code || id}`,
    `Coupon: ${deleted.code || id}`,
    "Coupon"
  );

  return deleted;
}

export async function validateCouponService(code: string) {
  const cleanCode = code.trim().toUpperCase();
  const coupon = await CouponModel.findOne({ code: cleanCode });

  if (!coupon) {
    return { notFound: true, message: `Coupon '${cleanCode}' not found` };
  }

  if (coupon.status !== "Active") {
    return {
      valid: false,
      message: `Coupon '${cleanCode}' is ${coupon.status.toLowerCase()}`,
    };
  }

  return { valid: true, message: "Coupon is valid", data: coupon };
}
