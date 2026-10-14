import { AdminSidebar } from "@/components/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4 bg-background">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin Console
            </span>
          </div>
          <div className="flex items-center gap-2">
          
          </div>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
