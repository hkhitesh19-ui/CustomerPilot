"use client"

import { useQuery } from "@tanstack/react-query"

export interface DashboardState {
  merchant: any
  staff: any[]
  customers: any[]
  stampCards: any[]
  customerStampCards: any[]
  rewards: any[]
  bills: any[]
  redemptions: any[]
  referrals: any[]
  auditLogs: any[]
  waMessages: any[]
  subscriptions: any[]
  reviews: any[]
  birthdays: any[]
  vipTiers: any[]
  winBacks: any[]
  achievements: any[]
  supportTickets: any[]
  onboardingSteps: any[]
  fraudAlerts: any[]
  customerMergeLogs: any[]
  merchantTransferLogs: any[]
  rewardWaitlists: any[]
  cardRuleChangeLogs: any[]
  campaignDeliveryLogs: any[]
  ownerOverrideLogs: any[]
  waitingCustomers: any[]
  merchantGoogleConnections: any[]
}

export function useDashboardState() {
  return useQuery({
    queryKey: ["dashboard-state"],
    queryFn: async (): Promise<DashboardState> => {
      const res = await fetch("/api/state")
      if (res.status === 401 || res.status === 404) {
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        throw new Error("Session expired. Redirecting to login...")
      }
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard state")
      }
      const data = await res.json().catch(() => null)
      if (!data) throw new Error("Invalid response format from server")
      
      const dashboardData = data.data as DashboardState
      
      if (dashboardData.merchant && !dashboardData.merchant.onboardingCompleted) {
        if (typeof window !== "undefined" && !window.location.pathname.startsWith('/onboarding')) {
          const step = dashboardData.merchant.currentStep || 1
          window.location.href = `/onboarding?step=${step}`
        }
      }
      
      return dashboardData
    },
    refetchInterval: 30000, // Poll every 30s for Live Queue freshness
  })
}
