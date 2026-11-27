import { Router } from "express";
import activityLogRoutes from "./activity-log/activity-log.routes";
import atsInterviewConfigRoutes from "./ats-interview-config/ats-interview-config.routes";
import couponRoutes from "./coupon/coupon.routes";
import notificationSettingRoutes from "./notification-setting/notification-setting.routes";
import paymentRoutes from "./payment/payment.routes";
import planRoutes from "./plan/plan.routes";
import rolePermissionRoutes from "./role-permission/role-permission.routes";
import supportTicketRoutes from "./support-ticket/support-ticket.routes";

const router = Router();

// Membership Plans CRUD endpoints (/api/admin/plans)
router.use("/plans", planRoutes);

// Coupons CRUD endpoints (/api/admin/coupons)
router.use("/coupons", couponRoutes);

// Notification Settings endpoints (/api/admin/notifications)
router.use("/notifications", notificationSettingRoutes);

// Support Tickets endpoints (/api/admin/support-tickets)
router.use("/support-tickets", supportTicketRoutes);

// Payments & Transactions endpoints (/api/admin/payments)
router.use("/payments", paymentRoutes);

// Roles & Permissions endpoints (/api/admin/roles-permissions)
router.use("/roles-permissions", rolePermissionRoutes);

// ATS Dictionaries & Interview Categories (/api/admin/ats-config, /api/admin/interview-types)
router.use("/", atsInterviewConfigRoutes);

// Activity Logs endpoints (/api/admin/activity-logs)
router.use("/activity-logs", activityLogRoutes);

export default router;
