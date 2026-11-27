import type { UserProfile, Education } from "@/types";
import { STORAGE_KEYS, CUSTOM_EVENTS } from "@/constants";

/**
 * Safely retrieve the stored user ID from local storage.
 */
export function getStoredUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.id || parsed?._id || "";
  } catch {
    return "";
  }
}

/**
 * Safely retrieve the auth token from local storage.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch {
    return null;
  }
}

/**
 * Safely retrieve the parsed user object from local storage.
 */
export function getStoredUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Parse the stored user object into a strongly typed UserProfile.
 */
export function parseStoredUser(): UserProfile {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.USER) : null;
    if (!raw) return {};
    const u = JSON.parse(raw);

    const educationList: Education[] = Array.isArray(u.educationList)
      ? u.educationList
      : u.degree || u.field_of_study || u.institution
      ? [
          {
            degree: u.degree || "",
            field_of_study: u.field_of_study || "",
            institution: u.institution || "",
            start_year: u.start_year || "",
            end_year: u.end_year || "",
          },
        ]
      : [];

    return {
      id: u.id || u._id,
      full_name: u.fullName || u.full_name || "",
      fullName: u.fullName || u.full_name || "",
      email: u.email || "",
      role: u.role || "user",
      avatar_url: u.avatarUrl || u.avatar_url || "",
      avatarUrl: u.avatarUrl || u.avatar_url || "",
      professional_title: u.professionalTitle || u.professional_title || "",
      professionalTitle: u.professionalTitle || u.professional_title || "",
      phone_no: u.phoneNo || u.phone_no || "",
      phoneNo: u.phoneNo || u.phone_no || "",
      location: u.location || "",
      portfolio_url: u.portfolioUrl || u.portfolio_url || "",
      portfolioUrl: u.portfolioUrl || u.portfolio_url || "",
      github: u.github || "",
      linkedin: u.linkedin || "",
      bio: u.bio || "",
      educationList,
      degree: u.degree || "",
      field_of_study: u.field_of_study || "",
      institution: u.institution || "",
      start_year: u.start_year,
      end_year: u.end_year,
      hasActiveSubscription: Boolean(u.hasActiveSubscription || u.isSubscribed || u.plan),
      isSubscribed: Boolean(u.hasActiveSubscription || u.isSubscribed || u.plan),
      plan: u.plan || "",
      planId: u.planId || "",
    };
  } catch {
    return {};
  }
}

/**
 * Checks whether the user has unlocked AI Analysis (either active subscription or analysis flag).
 */
export function getIsAnalysisUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const userId = getStoredUserId();
    if (userId) {
      return (
        localStorage.getItem(`${STORAGE_KEYS.ANALYSIS_UNLOCKED}_${userId}`) === "true" ||
        Boolean(localStorage.getItem(`${STORAGE_KEYS.LATEST_ANALYSIS}_${userId}`)) ||
        localStorage.getItem(STORAGE_KEYS.ANALYSIS_UNLOCKED) === "true" ||
        Boolean(localStorage.getItem(STORAGE_KEYS.LATEST_ANALYSIS))
      );
    }
    return (
      localStorage.getItem(STORAGE_KEYS.ANALYSIS_UNLOCKED) === "true" ||
      Boolean(localStorage.getItem(STORAGE_KEYS.LATEST_ANALYSIS))
    );
  } catch {
    return false;
  }
}

/**
 * Subscribes to user profile update events across browser tabs and local window events.
 */
export function subscribeToUserChanges(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(CUSTOM_EVENTS.USER_UPDATED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CUSTOM_EVENTS.USER_UPDATED, onChange);
  };
}

/**
 * Subscribes to analysis unlocked state changes.
 */
export function subscribeToUnlockedState(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(CUSTOM_EVENTS.JOBPREP_UNLOCKED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CUSTOM_EVENTS.JOBPREP_UNLOCKED, onChange);
  };
}
