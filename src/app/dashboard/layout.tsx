"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { SubscriptionGuard } from "@/components/subscription-guard"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-emerald-500/30">
        <AppSidebar />
        <div className="flex w-full flex-col relative">
          {/* Subtle glowing orb in background */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <TopNav />
          <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8 relative z-10">
            <SubscriptionGuard>
              {children}
            </SubscriptionGuard>
          </main>
        </div>
        {/* Sticky Thumb-Zone Navigation for Mobile View */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  )
}
