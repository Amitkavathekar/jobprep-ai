"use client";

import {
  Users,
  ShieldCheck,
  CreditCard,
  Ticket,
  Bot,
  LifeBuoy,
  Bell,
  LayoutDashboard,
  LogOut,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";

const adminNavigation = [
  {
    label: "Overview",
    items: [
      {
        title: "Admin Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Roles & Permissions",
        href: "/admin/roles-permissions",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Plans & Billing",
    items: [
      {
        title: "Subscription Plans",
        href: "/admin/plans",
        icon: Layers,
      },
      {
        title: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
      },
      {
        title: "Coupons",
        href: "/admin/coupons",
        icon: Ticket,
      },
    ],
  },
  {
    label: "AI & System",
    items: [
      {
        title: "AI Models",
        href: "/admin/ai-models",
        icon: Bot,
      },
      {
        title: "Support Tickets",
        href: "/admin/support-tickets",
        icon: LifeBuoy,
      },
      {
        title: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (e) {
      console.error("Sign out error:", e);
    }
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-amber-500 text-sm font-bold text-white shadow-md">
            AD
          </span>
          <div className="flex flex-col">
            <span className="truncate font-bold leading-tight">
              JobPrep <span className="text-amber-500">Admin</span>
            </span>
            <span className="text-[10px] text-sidebar-foreground/60">
              Control Panel
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {adminNavigation.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      pathname.startsWith(`${item.href}/`));

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
                  );
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
          className="w-full justify-start gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="size-4" />
          <span>Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AdminSidebar;
