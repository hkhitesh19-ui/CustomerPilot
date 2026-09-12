"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Gift, Clock, Menu } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import { hasModule } from "@/lib/feature-gate"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { toggleSidebar, openMobile } = useSidebar()
  const { data } = useDashboardState()
  const merchant = data?.merchant

  const isLoyaltyEnabled = !merchant || hasModule(merchant, "LOYALTY")

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      id: "customers",
      label: "Customers",
      href: "/dashboard/customers",
      icon: Users,
      isActive: pathname.startsWith("/dashboard/customers"),
    },
    {
      id: "rewards",
      label: "Rewards",
      href: "/dashboard/rewards",
      icon: Gift,
      isActive: pathname.startsWith("/dashboard/rewards"),
      show: isLoyaltyEnabled,
    },
    {
      id: "queue",
      label: "Queue",
      href: "/dashboard/queue",
      icon: Clock,
      isActive: pathname.startsWith("/dashboard/queue"),
      show: isLoyaltyEnabled,
    },
  ]

  const visibleItems = navItems.filter((item) => item.show !== false)
  const isMoreActive =
    openMobile ||
    (!navItems.some((item) => item.isActive) && pathname.startsWith("/dashboard"))

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = item.isActive

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 relative group ${
                active ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {active && (
                <span className="absolute top-1.5 w-7 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
              <div
                className={`p-1.5 rounded-xl transition-transform duration-200 ${
                  active
                    ? "scale-110 bg-emerald-500/15"
                    : "group-active:scale-95"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] tracking-tight font-bold mt-0.5 leading-none ${
                  active ? "text-emerald-400 font-extrabold" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        <button
          onClick={toggleSidebar}
          type="button"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 relative group ${
            isMoreActive ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Open Full Menu Drawer"
        >
          {isMoreActive && (
            <span className="absolute top-1.5 w-7 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
          )}
          <div
            className={`p-1.5 rounded-xl transition-transform duration-200 ${
              isMoreActive
                ? "scale-110 bg-indigo-500/15"
                : "group-active:scale-95"
            }`}
          >
            <Menu className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] tracking-tight font-bold mt-0.5 leading-none ${
              isMoreActive ? "text-indigo-400 font-extrabold" : "text-slate-400"
            }`}
          >
            More
          </span>
        </button>
      </div>
    </nav>
  )
}
