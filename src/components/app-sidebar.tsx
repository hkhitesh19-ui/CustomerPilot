"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Gift, Clock, Star } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

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
  { name: "Google Reviews AI", href: "/dashboard/reviews", icon: Star },
  { name: "Live Queue", href: "/dashboard/queue", icon: Clock },
  { name: "Rewards", href: "/dashboard/rewards", icon: Gift },
  { name: "Customers CRM", href: "/dashboard/customers", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

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
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              variant="outline" 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                // Also clear NextAuth session if present
                const { signOut } = await import("next-auth/react");
                await signOut({ redirect: false });
                window.location.href = '/login';
              }}
              className="w-full justify-start cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
