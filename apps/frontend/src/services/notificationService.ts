import api from "@/lib/axios";

export interface NotificationSettingItem {
  id: string;
  _id?: string;
  notificationId?: string;
  category: "monetization" | "support" | "system" | "interview";
  title: string;
  description: string;
  enabled: boolean;
  channel: "email" | "website";
}

export async function fetchNotificationSettingsApi(): Promise<NotificationSettingItem[]> {
  const res = await api.get("/admin/notifications");
  return res.data?.data || [];
}

export async function updateNotificationSettingApi(
  id: string,
  data: Partial<NotificationSettingItem>
): Promise<NotificationSettingItem> {
  const res = await api.put(`/admin/notifications/${id}`, data);
  return res.data?.data;
}

export async function createNotificationSettingApi(
  data: Partial<NotificationSettingItem>
): Promise<NotificationSettingItem> {
  const res = await api.post("/admin/notifications", data);
  return res.data?.data;
}

export async function deleteNotificationSettingApi(id: string): Promise<boolean> {
  await api.delete(`/admin/notifications/${id}`);
  return true;
}
