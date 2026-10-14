"use client"

import { useMemo, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

import type { UserProfile } from "@/app/(protected)/user/profile/types"
import { CompleteProfileModal } from "./components/CompleteProfileModal"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : 0
}

function subscribeToUserChanges(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener("user-profile-updated", onChange)

  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener("user-profile-updated", onChange)
  }
}

function getStoredUser() {
  try {
    return window.localStorage.getItem("user") || ""
  } catch (error) {
    console.error("Unable to read the signed-in user's profile.", error)
    return ""
  }
}

function toUserProfile(value: unknown): UserProfile {
  if (!isRecord(value)) return {}

  return {
    id: getString(value.id) || undefined,
    full_name: getString(value.fullName || value.full_name),
    email: getString(value.email),
    role: getString(value.role),
    avatar_url: getString(value.avatar_url),
    professional_title: getString(value.professional_title || value.professionalTitle),
    phone_no: getString(value.phone_no),
    location: getString(value.location),
    portfolio_url: getString(value.portfolio_url),
    github: getString(value.github),
    linkedin: getString(value.linkedin),
    bio: getString(value.bio),
    degree: getString(value.degree),
    field_of_study: getString(value.field_of_study),
    institution: getString(value.institution),
    start_year: getNumber(value.start_year),
    end_year: getNumber(value.end_year),
    updated_at: getString(value.updated_at),
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const storedUserJson = useSyncExternalStore(
    subscribeToUserChanges,
    getStoredUser,
    () => ""
  )

  const { profile, storedUser } = useMemo(() => {
    if (!storedUserJson) {
      return { profile: {}, storedUser: {} } as const
    }

    try {
      const parsedUser: unknown = JSON.parse(storedUserJson)
      if (!isRecord(parsedUser)) {
        throw new Error("Stored user profile must be an object.")
      }

      return {
        profile: toUserProfile(parsedUser),
        storedUser: parsedUser,
      }
    } catch (error) {
      console.error("Unable to parse the signed-in user's profile.", error)
      return { profile: {}, storedUser: {} } as const
    }
  }, [storedUserJson])

  const saveProfile = (updatedProfile: UserProfile) => {
    const updatedUser = {
      ...storedUser,
      ...updatedProfile,
      fullName: updatedProfile.full_name || "",
      professionalTitle: updatedProfile.professional_title || "",
    }

    window.localStorage.setItem("user", JSON.stringify(updatedUser))
    window.dispatchEvent(new Event("user-profile-updated"))
  }

  return (
    <CompleteProfileModal
      isOpen
      onClose={() => router.push("/user/dashboard")}
      profile={profile}
      onSaveProfile={saveProfile}
    />
  )
}
