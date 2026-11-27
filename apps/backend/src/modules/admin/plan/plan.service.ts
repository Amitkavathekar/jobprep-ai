import {
  MembershipPlanModel,
  MembershipPlanNameModel,
  PlanFeatureModel,
  BadgeModel,
} from "./plan.model";
import { logAdminActivity } from "../activity-log/activity-log.service";

export const DEFAULT_DATABASE_PLANS = [
  {
    membershipPlanId: "plan-basic",
    name: "Basic",
    duration: "1 Month",
    durationMonths: 1,
    sellingPrice: 499,
    originalPrice: 699,
    mockLimitText: "10 AI Mock Interviews",
    atsLimitText: "25 ATS Resume Scans",
    mockLimit: 10,
    atsLimit: 25,
    aiCredits: 50,
    status: "Active",
    subscribersCount: 342,
    features: [
      "AI Mock Interviews with Speech Analysis",
      "ATS Resume Scan & Optimization",
      "Full Technical Question Bank Access",
      "Priority Email & Chat Support",
    ],
  },
  {
    membershipPlanId: "plan-plus",
    name: "Plus",
    duration: "3 Months",
    durationMonths: 3,
    sellingPrice: 1299,
    originalPrice: 1599,
    mockLimitText: "35 AI Mock Interviews",
    atsLimitText: "75 ATS Resume Scans",
    mockLimit: 35,
    atsLimit: 75,
    aiCredits: 150,
    status: "Active",
    subscribersCount: 856,
    features: [
      "35 AI Mock Interviews with Speech Analysis",
      "75 ATS Resume Scan & Optimization",
      "Detailed Speech Analysis",
      "All ATS Diagnostic Checks",
      "Priority Chat Support",
    ],
  },
  {
    membershipPlanId: "plan-pro",
    name: "Pro",
    duration: "6 Months",
    durationMonths: 6,
    badge: "🔥 MOST POPULAR",
    popular: true,
    sellingPrice: 2299,
    originalPrice: 2999,
    mockLimitText: "Unlimited Mock Interviews",
    atsLimitText: "Unlimited ATS Scans",
    mockLimit: 100,
    atsLimit: 200,
    aiCredits: 500,
    status: "Active",
    subscribersCount: 1420,
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
    membershipPlanId: "plan-elite",
    name: "Elite",
    duration: "1 Year",
    durationMonths: 12,
    badge: "👑 BEST VALUE",
    popular: false,
    sellingPrice: 3999,
    originalPrice: 5999,
    mockLimitText: "Unlimited + VIP Queue",
    atsLimitText: "Unlimited + VIP Scans",
    mockLimit: 100,
    atsLimit: 250,
    aiCredits: 1000,
    status: "Active",
    subscribersCount: 680,
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

// Helper to seed plans into MongoDB if not present
export async function seedPlansIfEmpty() {
  const count = await MembershipPlanModel.countDocuments();
  if (count === 0) {
    for (const plan of DEFAULT_DATABASE_PLANS) {
      let planNameDoc = await MembershipPlanNameModel.findOne({ name: plan.name });
      if (!planNameDoc) {
        planNameDoc = await MembershipPlanNameModel.create({
          membershipPlanNameId: `PLAN-NAME-${plan.name.toUpperCase().replace(/\s+/g, "_")}`,
          name: plan.name,
        });
      }

      let badgeDoc = null;
      if (plan.badge) {
        const badgeName = plan.badge.includes("POPULAR") ? "Popular" : "Best Value";
        badgeDoc = await BadgeModel.findOne({ badgeName });
        if (!badgeDoc) {
          badgeDoc = await BadgeModel.create({
            badgeId: `BADGE-${badgeName.toUpperCase().replace(/\s+/g, "_")}`,
            badgeName,
          });
        }
      }

      const created = await MembershipPlanModel.create({
        ...plan,
        membershipPlanNameId: planNameDoc._id,
        badgeId: badgeDoc ? badgeDoc._id : undefined,
      });

      for (let i = 0; i < plan.features.length; i++) {
        await PlanFeatureModel.create({
          id: `FEAT-${plan.membershipPlanId}-${i + 1}`,
          membershipPlanId: created._id,
          featureName: plan.features[i],
        });
      }
    }
  }
}

export function formatPlanDoc(p: any) {
  const badgeName = p.badgeId?.badgeName;
  const planName = p.name || p.membershipPlanNameId?.name || "Membership Plan";

  return {
    id: p.membershipPlanId || (p._id ? p._id.toString() : p.id),
    name: planName,
    duration: p.duration || `${p.durationMonths || 1} ${p.durationMonths === 1 ? "Month" : "Months"}`,
    months: p.durationMonths || 1,
    priceINR: p.sellingPrice ?? 0,
    originalPriceINR: p.originalPrice ?? p.sellingPrice ?? 0,
    badge: p.badge || (badgeName === "Popular" ? "🔥 MOST POPULAR" : badgeName === "Best Value" ? "👑 BEST VALUE" : undefined),
    popular: Boolean(p.popular || badgeName === "Popular" || (p.badge && p.badge.includes("POPULAR"))),
    features: Array.isArray(p.features) && p.features.length > 0 ? p.features : [],
    mockLimit: p.mockLimitText || (p.mockLimit >= 100 ? "Unlimited Mock Interviews" : `${p.mockLimit} AI Mock Interviews`),
    atsLimit: p.atsLimitText || (p.atsLimit >= 200 ? "Unlimited ATS Scans" : `${p.atsLimit} ATS Resume Scans`),
    aiCredits: p.aiCredits || (p.mockLimit >= 100 ? 500 : (p.mockLimit || 10) * 5),
    status: p.status || "Active",
    subscribersCount: p.subscribersCount || 0,
  };
}

export async function getAdminPlansService() {
  await seedPlansIfEmpty();

  const plans = await MembershipPlanModel.find()
    .populate("membershipPlanNameId")
    .populate("badgeId")
    .sort({ durationMonths: 1, createdAt: 1 })
    .lean();

  return await Promise.all(
    plans.map(async (p: any) => {
      let features = p.features;
      if (!Array.isArray(features) || features.length === 0) {
        const featureDocs = await PlanFeatureModel.find({ membershipPlanId: p._id }).lean();
        if (featureDocs && featureDocs.length > 0) {
          features = featureDocs.map((f: any) => f.featureName);
        }
      }
      return formatPlanDoc({ ...p, features });
    })
  );
}

export async function createAdminPlanService(data: {
  name: string;
  duration?: string;
  months?: number;
  priceINR: number;
  originalPriceINR?: number;
  badge?: string;
  popular?: boolean;
  features?: string[];
  mockLimit?: string | number;
  atsLimit?: string | number;
  aiCredits?: number;
  status?: string;
  subscribersCount?: number;
}) {
  const cleanName = data.name.trim();
  const durationMonths = Number(data.months) || 1;
  const sellingPrice = Number(data.priceINR);
  const originalPrice = data.originalPriceINR ? Number(data.originalPriceINR) : sellingPrice;

  let numericMockLimit = 10;
  if (typeof data.mockLimit === "number") numericMockLimit = data.mockLimit;
  else if (typeof data.mockLimit === "string") {
    const match = data.mockLimit.match(/\d+/);
    numericMockLimit = match
      ? parseInt(match[0], 10)
      : data.mockLimit.toLowerCase().includes("unlimited")
      ? 100
      : 10;
  }

  let numericAtsLimit = 25;
  if (typeof data.atsLimit === "number") numericAtsLimit = data.atsLimit;
  else if (typeof data.atsLimit === "string") {
    const match = data.atsLimit.match(/\d+/);
    numericAtsLimit = match
      ? parseInt(match[0], 10)
      : data.atsLimit.toLowerCase().includes("unlimited")
      ? 200
      : 25;
  }

  const planId = `plan-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

  let nameDoc = await MembershipPlanNameModel.findOne({ name: cleanName });
  if (!nameDoc) {
    nameDoc = await MembershipPlanNameModel.create({
      membershipPlanNameId: `PLAN-NAME-${Date.now()}`,
      name: cleanName,
    });
  }

  const newPlan = await MembershipPlanModel.create({
    membershipPlanId: planId,
    name: cleanName,
    duration: data.duration || "1 Month",
    durationMonths,
    sellingPrice,
    originalPrice,
    badge: data.badge || "",
    popular: Boolean(data.popular),
    features: Array.isArray(data.features) ? data.features : [],
    mockLimitText: String(data.mockLimit || "10 AI Mock Interviews"),
    atsLimitText: String(data.atsLimit || "25 ATS Resume Scans"),
    mockLimit: numericMockLimit,
    atsLimit: numericAtsLimit,
    aiCredits: Number(data.aiCredits) || 50,
    status: (data.status as "Active" | "Draft" | "Archived") || "Active",
    subscribersCount: Number(data.subscribersCount) || 0,
    membershipPlanNameId: nameDoc._id,
  });

  if (Array.isArray(data.features) && data.features.length > 0) {
    for (let i = 0; i < data.features.length; i++) {
      await PlanFeatureModel.create({
        id: `FEAT-${planId}-${i + 1}`,
        membershipPlanId: newPlan._id,
        featureName: data.features[i],
      });
    }
  }

  await logAdminActivity(
    `Added new membership plan "${cleanName}" (₹${sellingPrice} / ${data.duration || "1 Month"})`,
    `Plan: ${cleanName}`,
    "Pricing"
  );

  return formatPlanDoc(newPlan);
}

export async function updateAdminPlanService(
  id: string,
  data: {
    name?: string;
    duration?: string;
    months?: number;
    priceINR?: number;
    originalPriceINR?: number;
    badge?: string;
    popular?: boolean;
    features?: string[];
    mockLimit?: string | number;
    atsLimit?: string | number;
    aiCredits?: number;
    status?: string;
    subscribersCount?: number;
  }
) {
  const plan = await MembershipPlanModel.findOne({
    $or: [{ membershipPlanId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });

  if (!plan) {
    return null;
  }

  if (data.name) plan.name = data.name.trim();
  if (data.duration) plan.duration = data.duration;
  if (data.months !== undefined) plan.durationMonths = Number(data.months);
  if (data.priceINR !== undefined) plan.sellingPrice = Number(data.priceINR);
  if (data.originalPriceINR !== undefined) plan.originalPrice = Number(data.originalPriceINR);
  if (data.badge !== undefined) plan.badge = data.badge;
  if (data.popular !== undefined) plan.popular = Boolean(data.popular);
  if (Array.isArray(data.features)) plan.features = data.features;
  if (data.mockLimit !== undefined) {
    plan.mockLimitText = String(data.mockLimit);
    const match = String(data.mockLimit).match(/\d+/);
    plan.mockLimit = match
      ? parseInt(match[0], 10)
      : String(data.mockLimit).toLowerCase().includes("unlimited")
      ? 100
      : plan.mockLimit;
  }
  if (data.atsLimit !== undefined) {
    plan.atsLimitText = String(data.atsLimit);
    const match = String(data.atsLimit).match(/\d+/);
    plan.atsLimit = match
      ? parseInt(match[0], 10)
      : String(data.atsLimit).toLowerCase().includes("unlimited")
      ? 200
      : plan.atsLimit;
  }
  if (data.aiCredits !== undefined) plan.aiCredits = Number(data.aiCredits);
  if (data.status) plan.status = data.status as "Active" | "Draft" | "Archived";
  if (data.subscribersCount !== undefined) plan.subscribersCount = Number(data.subscribersCount);

  await plan.save();

  if (Array.isArray(data.features)) {
    try {
      await PlanFeatureModel.deleteMany({ membershipPlanId: plan._id });
      for (let i = 0; i < data.features.length; i++) {
        await PlanFeatureModel.create({
          id: `FEAT-${plan.membershipPlanId}-${Date.now()}-${i + 1}`,
          membershipPlanId: plan._id,
          featureName: data.features[i],
        });
      }
    } catch (featErr) {
      console.warn("Failed to sync feature models:", featErr);
    }
  }

  await logAdminActivity(
    `Updated membership plan "${plan.name}" (Price set to ₹${plan.sellingPrice})`,
    `Plan: ${plan.name}`,
    "Pricing"
  );

  return formatPlanDoc(plan);
}

export async function toggleAdminPlanStatusService(id: string, status?: string) {
  const plan = await MembershipPlanModel.findOne({
    $or: [{ membershipPlanId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });

  if (!plan) {
    return null;
  }

  const nextStatus = (status || (plan.status === "Active" ? "Draft" : "Active")) as "Active" | "Draft" | "Archived";
  plan.status = nextStatus;
  await plan.save();

  await logAdminActivity(
    `Changed status of membership plan "${plan.name}" to ${nextStatus}`,
    `Plan: ${plan.name}`,
    "Pricing"
  );

  return { nextStatus, plan: formatPlanDoc(plan) };
}

export async function deleteAdminPlanService(id: string) {
  const plan = await MembershipPlanModel.findOne({
    $or: [{ membershipPlanId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });

  if (!plan) {
    return null;
  }

  const planName = plan.name;
  await PlanFeatureModel.deleteMany({ membershipPlanId: plan._id });
  await MembershipPlanModel.deleteOne({ _id: plan._id });

  await logAdminActivity(
    `Deleted membership plan "${planName}"`,
    `Plan: ${planName}`,
    "Pricing"
  );

  return planName;
}
