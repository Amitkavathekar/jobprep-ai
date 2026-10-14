"use client"

import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  LayoutDashboard,
  PencilLine,
  Mic,
  LogOut,
  UserRound,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useSyncExternalStore } from "react"

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

function parseSidebarUser(value: string | null): SidebarUser | null {
  if (!value) return null
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== "object" || parsed === null) return null

    const user = parsed as Record<string, unknown>
    return {
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

    ]

  },
  {
     label: "Resume AI",
    items:  [{
        title: "Job & Resume",
        href: "/user/resume",
        icon: FileText,
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
        icon: ClipboardList,
      },]
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
  const user = useMemo(() => parseSidebarUser(storedUser), [storedUser])
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
      localStorage.removeItem("token")
      localStorage.removeItem("user")
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
            <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === "/user/resume" &&
                      pathname.startsWith("/user/resume/"))

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.title}
                        className="h-9 rounded-lg text-[13px] font-medium data-[active=true]:bg-linear-to-r data-[active=true]:from-violet-600/35 data-[active=true]:to-cyan-500/20 data-[active=true]:text-white hover:bg-white/5 hover:text-white"
                      >
                        <item.icon />
                        <span>{item.title}</span>
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
