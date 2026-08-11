"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Settings, LogOut, Gift, Clock, Crown, Zap, Sparkles, ChevronRight } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { useDashboardState } from "@/hooks/use-dashboard-state"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  // HIDING UNTIL GOOGLE API APPROVAL
  // { name: "Google Reviews AI", href: "/dashboard/reviews", icon: Star },
  { name: "Live Queue", href: "/dashboard/queue", icon: Clock },
  { name: "Rewards", href: "/dashboard/rewards", icon: Gift },
  { name: "Customers CRM", href: "/dashboard/customers", icon: Users },
  { name: "Subscription", href: "/dashboard/subscription", icon: Crown },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data } = useDashboardState()

  const merchant = data?.merchant
  const trialEndsAt = merchant?.trialEndsAt ? new Date(merchant.trialEndsAt) : null
  const now = new Date()

  let daysRemaining = 0
  let isExpired = false
  if (trialEndsAt) {
    const diffTime = trialEndsAt.getTime() - now.getTime()
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (daysRemaining <= 0) {
      daysRemaining = 0
      isExpired = true
    }
  }

  const getPlanDisplay = () => {
    if (isExpired) return { label: "Plan Expired", icon: "⚠️", color: "rose" }
    const plan = merchant?.plan || "trial"
    if (plan === "trial") return { label: "7-Day Free Trial", icon: "🎁", color: "amber" }
    if (plan === "starter" || plan === "starter_30") return { label: "30 Days Plan", icon: "⚡", color: "indigo" }
    if (plan === "growth" || plan === "growth_180") return { label: "180 Days Plan", icon: "🚀", color: "purple" }
    if (plan === "enterprise" || plan === "enterprise_365") return { label: "365 Days Plan", icon: "👑", color: "emerald" }
    return { label: "Active Plan", icon: "✨", color: "emerald" }
  }

  const planInfo = getPlanDisplay()
  const isSubPage = pathname === "/dashboard/subscription"

  return (
    <Sidebar>
      <SidebarHeader className="h-20 flex flex-col justify-center px-4 border-b">
        <div className="flex items-center justify-between w-full">
          <Link href="/dashboard" className="no-underline">
            <BrandLogo variant="dark" size="sm" />
          </Link>
          <div className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
            <span>👑</span>
            <span>FOUNDER #04</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-slate-800/80 space-y-2">
        {/* Prominent Colored Subscription Widget navigating to /dashboard/subscription */}
        <Link
          href="/dashboard/subscription"
          className={`group relative block overflow-hidden rounded-xl p-3 no-underline border transition-all duration-200 shadow-md ${
            isSubPage
              ? "bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-900 border-indigo-400 ring-2 ring-indigo-500/30 shadow-indigo-500/20"
              : isExpired
              ? "bg-gradient-to-br from-rose-950/70 to-slate-900 border-rose-500/40 hover:border-rose-400"
              : daysRemaining <= 3
              ? "bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-900 border-amber-500/40 hover:border-amber-400"
              : "bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-500/40 hover:border-indigo-400"
          }`}
        >
          {/* Subtle glow effect */}
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{planInfo.icon}</span>
              <span className="text-xs font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                {planInfo.label}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Days Left and Expiry Details */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                isExpired
                  ? "bg-rose-500"
                  : daysRemaining <= 3
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`} />
              <span className={`text-[11px] font-bold ${
                isExpired
                  ? "text-rose-400"
                  : daysRemaining <= 3
                  ? "text-amber-300"
                  : "text-emerald-300"
              }`}>
                {isExpired ? "Subscription Expired" : `${daysRemaining} Days Remaining`}
              </span>
            </div>
            <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded group-hover:bg-indigo-500 group-hover:text-white transition-all">
              {isExpired ? "Renew" : "Upgrade"}
            </span>
          </div>

          {trialEndsAt && (
            <p className="text-[9px] text-slate-500 mt-1 font-mono">
              Valid till: {trialEndsAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          )}
        </Link>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              variant="outline" 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                const { signOut } = await import("next-auth/react");
                await signOut({ redirect: false });
                window.location.href = '/login';
              }}
              className="w-full justify-start cursor-pointer text-slate-400 hover:text-rose-400 hover:bg-rose-950/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs font-semibold">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
