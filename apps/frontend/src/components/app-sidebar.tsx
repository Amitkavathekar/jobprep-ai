"use client"

import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Mic
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"

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
        href: "/user/ai-analysis",
        icon: BarChart3,
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
        href: "/user/report",
        icon: BriefcaseBusiness,
      },
    ],
  },


]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/user/dashboard" className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-cyan-500 text-sm font-bold text-white">
            JP
          </span>
          <span className="truncate font-semibold">
            JobPrep <span className="text-cyan-500">AI</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === "/user/resume" &&
                      pathname.startsWith("/user/resume/"))

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.title}
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

      <SidebarFooter className="text-xs text-sidebar-foreground/60">
        <Button type="button" variant="outline" className="w-full justify-start bg-red-400">
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
