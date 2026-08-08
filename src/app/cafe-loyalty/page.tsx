import type { Metadata } from "next"
import { CafeLoyaltyClient } from "@/components/cafe-loyalty-client"

export const metadata: Metadata = {
  title: "Cafe Loyalty & WhatsApp Coffee Punch Card System — CustomerPilot",
  description: "Replace paper coffee punch cards with instant WhatsApp digital stamps. Automate win-back campaigns and boost cafe repeat visits with zero app downloads.",
  keywords: [
    "Cafe Loyalty System",
    "Coffee Shop Punch Card",
    "WhatsApp Stamp Card Cafe",
    "Cafe Customer Retention",
    "Digital Coffee Loyalty India",
  ],
  alternates: {
    canonical: "/cafe-loyalty",
  },
  openGraph: {
    title: "CustomerPilot for Cafes — Digital WhatsApp Coffee Punch Cards",
    description: "Replace paper punch cards with automated WhatsApp digital stamps. Win back dormant coffee lovers on autopilot.",
    url: "https://customerpilot.ai/cafe-loyalty",
  },
}

export default function CafeLoyaltyPage() {
  return <CafeLoyaltyClient />
}
