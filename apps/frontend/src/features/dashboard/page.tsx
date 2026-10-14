"use client"

import { useMemo, useSyncExternalStore } from "react"

import { DashboardMetrics } from "./components/dashboard-metrics"
import { DashboardHeader } from "./components/dashboard-header"
import { RecentActivity } from "./components/recent-activity"
import { ResumeTable } from "./components/resume-table"
import type { DashboardUser } from "./types"

function subscribeToUserChanges(onChange: () => void) {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

function getStoredUser() {
  try {
    return window.localStorage.getItem("user")
  } catch (error) {
    console.error("Unable to read the signed-in user for the dashboard.", error)
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function getDashboardUser(value: unknown): DashboardUser | null {
  if (!isRecord(value)) return null

  return {
    fullName: optionalString(value.fullName),
    email: optionalString(value.email),
    role: optionalString(value.role),
    professionalTitle: optionalString(value.professionalTitle),
    createdAt: optionalString(value.createdAt),
  }
}

export default function DashboardPage() {
  const storedUser = useSyncExternalStore(
    subscribeToUserChanges,
    getStoredUser,
    () => null
  )
  const user = useMemo(() => {
    if (!storedUser) return null
    try {
      return getDashboardUser(JSON.parse(storedUser))
    } catch (error) {
      console.error("Unable to parse the signed-in user for the dashboard.", error)
      return null
    }
  }, [storedUser])

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 text-white">
      <DashboardHeader user={user} />
      <DashboardMetrics />
      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <ResumeTable />
        <RecentActivity />
      </div>
    </main>
  )
}
