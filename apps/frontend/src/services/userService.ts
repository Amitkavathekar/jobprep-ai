import api from "@/lib/axios";
import type { UserProfile } from "@/types";

export type { UserProfile };

// In-memory cache for fast synchronous access
let cachedUser: UserProfile | null = null;

export async function fetchCurrentUserApi(): Promise<UserProfile | null> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return null;

    const res = await api.get("/users/me");
    if (res.data?.success && res.data.data) {
      cachedUser = {
        ...res.data.data,
        id: res.data.data._id || res.data.data.id,
      };
      // Keep fallback sync in memory
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("user", JSON.stringify(cachedUser));
          window.dispatchEvent(new Event("user-profile-updated"));
          window.dispatchEvent(new Event("storage"));
        } catch {}
      }
      return cachedUser;
    }
  } catch (err) {
    console.warn("Could not fetch user profile from database:", err);
  }

  // Fallback to cached user if offline
  if (cachedUser) return cachedUser;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("user");
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return null;
}

export async function updateUserProfileApi(data: Record<string, any>): Promise<any> {
  try {
    const res = await api.put("/users/profile", data);
    if (res.data?.success && res.data.data) {
      const updated = {
        ...res.data.data,
        id: res.data.data._id || res.data.data.id,
      };
      cachedUser = updated;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("user", JSON.stringify(updated));
          window.dispatchEvent(new Event("user-profile-updated"));
          window.dispatchEvent(new Event("storage"));
        } catch {}
      }
      return updated;
    }
    return res.data;
  } catch (err) {
    console.error("Error updating user profile in database:", err);
    throw err;
  }
}

export function getCachedUser(): UserProfile | null {
  return cachedUser;
}
