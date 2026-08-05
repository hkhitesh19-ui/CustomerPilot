"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="dark flex min-h-screen w-full bg-slate-950 text-slate-50 selection:bg-emerald-500/30">
        <AppSidebar />
        <div className="flex w-full flex-col relative">
          {/* Subtle glowing orb in background */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <TopNav />
          <main className="flex-1 overflow-auto p-4 md:p-8 relative z-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
