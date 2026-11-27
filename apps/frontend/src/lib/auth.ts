import { getStoredToken, getStoredUserId, getStoredUser } from "@/utils/user";
import { STORAGE_KEYS } from "@/constants";

/**
 * Checks if a user is currently authenticated on the client.
 */
export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}

/**
 * Clears user auth tokens and session storage.
 */
export function logoutUser(redirectPath?: string): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.clear();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      if (redirectPath) {
        window.location.href = redirectPath;
      }
    }
  } catch (error) {
    console.error("Error during user logout:", error);
  }
}

export { getStoredToken, getStoredUserId, getStoredUser };
