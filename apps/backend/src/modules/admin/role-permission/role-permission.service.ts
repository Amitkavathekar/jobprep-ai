import { RolePermissionModel } from "./role-permission.model";
import { logAdminActivity } from "../activity-log/activity-log.service";

export const AVAILABLE_PERMISSIONS = [
  { id: "manage_users", label: "Manage User Accounts & Directory", category: "Users" },
  { id: "manage_plans", label: "Create & Update Membership Plans", category: "Monetization" },
  { id: "manage_coupons", label: "Create & Delete Promo Coupons", category: "Monetization" },
  { id: "manage_payments", label: "View Payments & Issue Refunds", category: "Monetization" },
  { id: "manage_tickets", label: "Resolve Candidate Support Tickets", category: "Support" },
  { id: "ai_router", label: "Configure AI Model Feature Routing", category: "AI Models" },
  { id: "view_analytics", label: "View Platform Activity & Analytics", category: "Analytics" },
  { id: "manage_roles", label: "Assign Roles & Permissions", category: "Security" },
];

export const DEFAULT_ROLES = [
  {
    roleId: "role-super-admin",
    name: "Super Administrator",
    description: "Full uncontrolled platform access and configuration privileges.",
    usersCount: 2,
    isSystem: true,
    permissions: [
      "manage_users",
      "manage_plans",
      "manage_coupons",
      "manage_payments",
      "manage_tickets",
      "ai_router",
      "view_analytics",
      "manage_roles",
    ],
  },
  {
    roleId: "role-support-agent",
    name: "Support Specialist",
    description: "Handles candidate queries, resolves support tickets and reviews scan logs.",
    usersCount: 5,
    isSystem: false,
    permissions: ["manage_tickets", "manage_users"],
  },
  {
    roleId: "role-marketing-lead",
    name: "Growth & Marketing Lead",
    description: "Oversees coupon campaigns, membership plan promotions and user stats.",
    usersCount: 3,
    isSystem: false,
    permissions: ["manage_coupons", "manage_plans", "view_analytics"],
  },
  {
    roleId: "role-candidate",
    name: "Candidate (Standard User)",
    description: "Standard registered user with access to ATS scan, mock interview, and reports.",
    usersCount: 1420,
    isSystem: true,
    permissions: ["view_analytics"],
  },
];

export async function getRolesPermissionsService() {
  let roles = await RolePermissionModel.find().sort({ createdAt: 1 });

  if (roles.length === 0) {
    roles = (await RolePermissionModel.insertMany(DEFAULT_ROLES as any)) as any;
  }

  return {
    roles,
    availablePermissions: AVAILABLE_PERMISSIONS,
  };
}

export async function updateRolePermissionsService(
  id: string,
  data: { permissions?: string[]; description?: string }
) {
  const role = await RolePermissionModel.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { roleId: id }],
  });

  if (!role) {
    return null;
  }

  if (Array.isArray(data.permissions)) role.permissions = data.permissions;
  if (data.description) role.description = data.description;

  await role.save();

  await logAdminActivity(
    `Updated permissions matrix for role "${role.name}"`,
    `Role: ${role.name}`,
    "Security"
  );

  return role;
}

export async function createRoleService(data: {
  name: string;
  description?: string;
  permissions?: string[];
}) {
  const roleId = `role-${data.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

  const newRole = await RolePermissionModel.create({
    roleId,
    name: data.name,
    description: data.description || "",
    permissions: data.permissions || [],
    usersCount: 0,
    isSystem: false,
  });

  return newRole;
}
