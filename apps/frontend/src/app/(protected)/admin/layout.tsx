"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin-sidebar";
import { usePathname, useRouter } from "next/navigation";
import { AdminScreen } from "@/types";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const getActiveScreen = (): AdminScreen => {
    if (pathname.includes("/admin/membership") || pathname.includes("/admin/plans")) return "admin-membership";
    if (pathname.includes("/admin/coupons")) return "admin-coupons";
    if (pathname.includes("/admin/users")) return "admin-users";
    if (pathname.includes("/admin/support")) return "admin-support";
    if (pathname.includes("/admin/ai-models")) return "admin-ai-models";
    if (pathname.includes("/admin/notifications")) return "admin-notifications";
    if (pathname.includes("/admin/activity-log")) return "admin-activity-log";
    return "admin-dashboard";
  };

  const handleNavigate = (screen: AdminScreen) => {
    const routeMap: Record<string, string> = {
      "admin-dashboard": "/admin/dashboard",
      "admin-membership": "/admin/plans",
      "admin-coupons": "/admin/coupons",
      "admin-users": "/admin/users", 
      "admin-support": "/admin/support-tickets",
      "admin-ai-models": "/admin/ai-models",
      "admin-notifications": "/admin/notifications",
      "admin-activity-log": "/admin/activity-log",
    };
    const route = routeMap[screen] || "/admin/dashboard";
    router.push(route);
  };

  const handleLogout = () => {
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
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      <AdminSidebar
        active={getActiveScreen()}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
      <div style={{ flex: 1, height: "100vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
