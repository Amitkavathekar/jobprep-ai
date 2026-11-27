import { useSyncExternalStore } from "react";
import { parseStoredUser, subscribeToUserChanges } from "@/utils/user";
import type { UserProfile } from "@/types";

function getClientSnapshot(): UserProfile {
  return parseStoredUser();
}

function getServerSnapshot(): UserProfile {
  return {};
}

/**
 * Reactive hook that synchronizes with the currently logged-in user in localStorage.
 */
export function useStoredUser(): UserProfile {
  return useSyncExternalStore(
    subscribeToUserChanges,
    getClientSnapshot,
    getServerSnapshot
  );
}
