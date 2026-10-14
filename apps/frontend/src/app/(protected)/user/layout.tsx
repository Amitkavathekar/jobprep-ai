import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"

export default function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider
      className="bg-[#0b0a20] [--sidebar:#201640] [--sidebar-accent:#39216d] [--sidebar-accent-foreground:#ffffff] [--sidebar-border:rgba(255,255,255,0.08)] [--sidebar-foreground:#a5a0bf] [--sidebar-primary:#7c3aed] [--sidebar-primary-foreground:#ffffff]"
    >
      <AppSidebar />
      <SidebarInset className="min-h-svh bg-[#0b0a20] text-white">
        <header className="flex h-12 items-center px-4 md:hidden">
          <SidebarTrigger className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </header>
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3 sm:px-7 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
