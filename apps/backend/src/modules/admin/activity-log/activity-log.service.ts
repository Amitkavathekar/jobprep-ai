import { ActivityLogModel, CategoryModel } from "./activity-log.model";
import { CouponModel } from "../coupon/coupon.model";

// Helper to get or create a Category document
export async function getOrCreateCategory(categoryName: string) {
  let cat = await CategoryModel.findOne({ category: categoryName });
  if (!cat) {
    cat = await CategoryModel.create({
      categoryId: `CAT-${Date.now()}`,
      category: categoryName,
    });
  }
  return cat;
}

// Log admin activity helper
export async function logAdminActivity(
  action: string,
  target: string = "System",
  type: string = "Settings"
) {
  try {
    const validCategory = ["Pricing", "User Action", "Coupon", "Settings"].includes(type)
      ? type
      : "Settings";
    const cat = await getOrCreateCategory(validCategory);
    return await ActivityLogModel.create({
      activityLogId: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoryId: cat._id,
      description: action,
      targetObject: target,
    });
  } catch (error) {
    console.warn("Failed to record admin activity log:", error);
    return null;
  }
}

// Get all activity logs with optional coupon backfilling if empty
export async function getActivityLogsService() {
  const logs = await ActivityLogModel.find()
    .sort({ createdAt: -1 })
    .populate("categoryId")
    .lean();

  // If database logs are empty, check if any coupons exist and backfill log entries
  if (!logs || logs.length === 0) {
    try {
      const coupons = await CouponModel.find().sort({ createdAt: -1 }).lean();
      if (coupons && coupons.length > 0) {
        const couponCat = await getOrCreateCategory("Coupon");
        for (const c of coupons) {
          await ActivityLogModel.create({
            activityLogId: `LOG-CPN-${c._id}`,
            categoryId: couponCat._id,
            description: `Created coupon code ${c.code} (${c.discountValue}${
              c.discountType === "Percentage" ? "%" : "₹"
            } OFF)`,
            targetObject: `Coupon: ${c.code}`,
            createdAt: (c as any).createdAt || new Date(),
          });
        }
      }
    } catch {}
  }

  const allLogs = await ActivityLogModel.find()
    .sort({ createdAt: -1 })
    .populate("categoryId")
    .lean();

  return allLogs.map((log: any) => ({
    id: log.activityLogId || log._id.toString(),
    adminName: "Super Admin",
    action: log.description,
    target: log.targetObject || "System",
    type: log.categoryId?.category || "Settings",
    timestamp: log.createdAt
      ? new Date(log.createdAt).toLocaleString()
      : new Date().toLocaleString(),
  }));
}

// Create new activity log
export async function createActivityLogService(data: {
  action?: string;
  target?: string;
  type?: string;
  adminName?: string;
}) {
  const { action, target, type = "Settings", adminName = "Super Admin" } = data;

  const validCategory = ["Pricing", "User Action", "Coupon", "Settings"].includes(type)
    ? type
    : "Settings";

  const cat = await getOrCreateCategory(validCategory);

  const log = await ActivityLogModel.create({
    activityLogId: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    categoryId: cat._id,
    description: action || "Admin action performed",
    targetObject: target || "System",
  });

  return {
    id: log.activityLogId,
    adminName,
    action: log.description,
    target: log.targetObject,
    type: cat.category,
    timestamp: new Date().toLocaleString(),
  };
}
