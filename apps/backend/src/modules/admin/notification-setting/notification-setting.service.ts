import { NotificationSettingModel } from "./notification-setting.model";
import { logAdminActivity } from "../activity-log/activity-log.service";

export const DEFAULT_NOTIFICATIONS = [
  {
    notificationId: "notif-mon-1",
    category: "monetization",
    title: "Subscription Renewal Alert",
    description: "Send automated expiry notice 3 days prior to membership plan expiration.",
    enabled: true,
    channel: "email",
  },
  {
    notificationId: "notif-mon-3",
    category: "monetization",
    title: "Exclusive Plan Coupon Announcement",
    description: "Notify eligible candidates when special discount coupons (e.g. FESTIVE25, STUDENT50) are active.",
    enabled: true,
    channel: "website",
  },
  {
    notificationId: "notif-sup-1",
    category: "support",
    title: "Admin Ticket Response Alert",
    description: "Notify candidate immediately when support team posts a reply to their query.",
    enabled: true,
    channel: "email",
  },
  {
    notificationId: "notif-sys-1",
    category: "system",
    title: "System Maintenance Window Alert",
    description: "Broadcast planned system upgrade window to active candidates 24h prior.",
    enabled: true,
    channel: "website",
  },
];

export async function getNotificationSettingsService() {
  let settings = await NotificationSettingModel.find().sort({ createdAt: 1 });

  if (settings.length === 0) {
    settings = (await NotificationSettingModel.insertMany(DEFAULT_NOTIFICATIONS)) as any;
  }

  return settings;
}

export async function updateNotificationSettingService(
  id: string,
  data: {
    enabled?: boolean;
    channel?: "email" | "website";
    title?: string;
    description?: string;
    category?: string;
  }
) {
  const setting = await NotificationSettingModel.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { notificationId: id }],
  });

  if (!setting) {
    return null;
  }

  if (data.enabled !== undefined) setting.enabled = Boolean(data.enabled);
  if (data.channel !== undefined) setting.channel = data.channel;
  if (data.title !== undefined) setting.title = data.title;
  if (data.description !== undefined) setting.description = data.description;
  if (data.category !== undefined) setting.category = data.category;

  await setting.save();

  await logAdminActivity(
    `Updated notification setting "${setting.title}" (${
      setting.enabled ? "Enabled" : "Disabled"
    }, Channel: ${setting.channel})`,
    `Notification: ${setting.title}`,
    "Settings"
  );

  return setting;
}

export async function createNotificationSettingService(data: {
  category?: string;
  title: string;
  description?: string;
  enabled?: boolean;
  channel?: "email" | "website";
}) {
  const notificationId = `notif-${data.category || "sys"}-${Date.now().toString(36)}`;

  const newSetting = await NotificationSettingModel.create({
    notificationId,
    category: data.category || "system",
    title: data.title,
    description: data.description || "",
    enabled: Boolean(data.enabled ?? true),
    channel: data.channel || "website",
  });

  await logAdminActivity(
    `Created new notification rule "${data.title}"`,
    `Notification: ${data.title}`,
    "Settings"
  );

  return newSetting;
}

export async function deleteNotificationSettingService(id: string) {
  const deleted = await NotificationSettingModel.findOneAndDelete({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { notificationId: id }],
  });

  return deleted;
}
