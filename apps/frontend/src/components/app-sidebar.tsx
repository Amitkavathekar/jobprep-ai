"use client"

import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  PencilLine,
  Mic,
  LogOut,
  UserRound,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useSyncExternalStore } from "react"
import api from "@/lib/axios"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"

type SidebarUser = {
  id?: string
  fullName?: string
  email?: string
}

function subscribeToUserChanges(onChange: () => void) {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

function getStoredUser() {
  try {
    return window.localStorage.getItem("user")
  } catch (error) {
    console.error("Unable to read the signed-in user for the sidebar.", error)
    return null
  }
}

const GATED_HREFS = new Set([
  "/user/ai-analysis",
  "/user/resume-editor",
  "/user/interview-prep",
  "/user/mock-interview",
])

function getIsAnalysisUnlocked(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem("user")
    let userId = ""
    if (raw) {
      const u = JSON.parse(raw)
      userId = u?.id || u?._id || ""
    }
    if (userId) {
      return (
        localStorage.getItem(`jobprep_analysis_unlocked_${userId}`) === "true" ||
        Boolean(localStorage.getItem(`jobprep_latest_analysis_${userId}`))
      )
    }
    return false
  } catch {
    return false
  }
}

function subscribeToUnlockedState(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("storage", onChange)
  window.addEventListener("jobprep_unlocked", onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener("jobprep_unlocked", onChange)
  }
}

function parseSidebarUser(value: string | null): SidebarUser | null {
  if (!value) return null
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== "object" || parsed === null) return null

    const user = parsed as Record<string, unknown>
    return {
      id: typeof user.id === "string" ? user.id : typeof user._id === "string" ? user._id : undefined,
      fullName:
        typeof user.fullName === "string" ? user.fullName.trim() : undefined,
      email: typeof user.email === "string" ? user.email.trim() : undefined,
    }
  } catch (error) {
    console.error("Unable to parse the signed-in user for the sidebar.", error)
    return null
  }
}

const navigation = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/user/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Resume AI",
    badge: "25%",
    items: [
      {
        title: "Job & Resume",
        href: "/user/resume",
        icon: FileText,
        stepBadge: "1",
      },
      {
        title: "AI Analysis",
        href: "/user/ai-analysis",
        icon: BarChart3,
      },
      {
        title: "Resume Editor",
        href: "/user/resume-editor",
        icon: PencilLine,
      },
      {
        title: "ATS Analysis",
        href: "/user/ats-analysis",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Interview",
    items: [
      {
        title: "Interview Prep",
        href: "/user/interview-prep",
        icon: BriefcaseBusiness,
      },
      {
        title: "Mock Interview",
        href: "/user/mock-interview",
        icon: Mic,
      },
    ],
  },
  {
    label: "History",
    items: [
      {
        title: "Reports & History",
        href: "/user/reports",
        icon: BriefcaseBusiness,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Profile Settings",
        href: "/user/profile",
        icon: UserRound,
      },
    ],
  },


]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const storedUser = useSyncExternalStore(
    subscribeToUserChanges,
    getStoredUser,
    () => null
  )
  const isUnlocked = useSyncExternalStore(
    subscribeToUnlockedState,
    getIsAnalysisUnlocked,
    () => false
  )
  const user = useMemo(() => parseSidebarUser(storedUser), [storedUser])

  useEffect(() => {
    if (!user?.id) return
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return

    api.get("/ai-analysis/latest")
      .then((res) => {
        if (res?.data?.success && res.data.data) {
          localStorage.setItem(`jobprep_analysis_unlocked_${user.id}`, "true")
          localStorage.setItem(`jobprep_latest_analysis_${user.id}`, JSON.stringify(res.data.data))
          window.dispatchEvent(new Event("jobprep_unlocked"))
        } else {
          localStorage.removeItem(`jobprep_analysis_unlocked_${user.id}`)
          localStorage.removeItem(`jobprep_latest_analysis_${user.id}`)
          localStorage.removeItem("jobprep_analysis_unlocked")
          localStorage.removeItem("jobprep_latest_analysis")
          window.dispatchEvent(new Event("jobprep_unlocked"))
        }
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          localStorage.removeItem(`jobprep_analysis_unlocked_${user.id}`)
          localStorage.removeItem(`jobprep_latest_analysis_${user.id}`)
          localStorage.removeItem("jobprep_analysis_unlocked")
          localStorage.removeItem("jobprep_latest_analysis")
          window.dispatchEvent(new Event("jobprep_unlocked"))
        }
      })
  }, [user?.id])

  const initials =
    user?.fullName
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "JP"

  const handleSignOut = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    } catch (e) {
      console.error("Sign out error:", e)
    }
    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-4 border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-white">
              {user?.fullName || "Your account"}
            </p>
            {user?.email && (
              <p className="truncate text-[11px] text-sidebar-foreground/60">
                {user.email}
              </p>
            )}
          </div>
          <SidebarTrigger
            aria-label="Toggle navigation sidebar"
            className="size-7 shrink-0 text-sidebar-foreground hover:bg-white/10 hover:text-white"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {navigation.map((section) => (
          <SidebarGroup className="py-1" key={section.label}>
            <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45 flex items-center justify-between">
              <span>{section.label}</span>
              {(section as any).badge && (
                <span className="text-[10px] font-bold text-violet-400 group-data-[collapsible=icon]:hidden">
                  {(section as any).badge}
                </span>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((item) => {
                  const isGated = GATED_HREFS.has(item.href)
                  const isItemDisabled = isGated && !isUnlocked

                  const isActive =
                    pathname === item.href ||
                    (item.href === "/user/resume" &&
                      pathname.startsWith("/user/resume/"))

                  if (isItemDisabled) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={false}
                          tooltip={`${item.title} (Locked - Complete Step 2: Validate Data & Proceed to AI Analysis to unlock)`}
                          className="h-9 rounded-lg text-[13px] font-medium opacity-40 cursor-not-allowed hover:bg-transparent hover:text-sidebar-foreground flex items-center justify-between"
                          onClick={(e) => {
                            e.preventDefault()
                            router.push("/user/resume")
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <item.icon className="shrink-0 size-4" />
                            <span className="truncate">{item.title}</span>
                          </div>
                          <Lock className="size-3 shrink-0 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.title}
                        className="h-9 rounded-lg text-[13px] font-medium data-[active=true]:bg-linear-to-r data-[active=true]:from-violet-600/35 data-[active=true]:to-cyan-500/20 data-[active=true]:text-white hover:bg-white/5 hover:text-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <item.icon className="shrink-0 size-4" />
                          <span className="truncate">{item.title}</span>
                        </div>
                        {(item as any).stepBadge && (
                          <span className="size-5 shrink-0 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs group-data-[collapsible=icon]:hidden">
                            {(item as any).stepBadge}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="text-xs text-sidebar-foreground/60 p-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleSignOut}
          className="w-full justify-start gap-2 border-white/10 bg-white/5 text-sidebar-foreground hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
