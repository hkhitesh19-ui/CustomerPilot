import type { Metadata } from "next"
import { RestaurantLoyaltyClient } from "@/components/restaurant-loyalty-client"

export const metadata: Metadata = {
  title: "Restaurant Loyalty Program & Table Standee QR Retention — CustomerPilot",
  description: "Convert dining guests into weekly repeat customers with table QR standees, visit-based VIP multiplier tiers, and 5-second cashier claim terminals.",
  keywords: [
    "Restaurant Loyalty Program",
    "Table QR Standee Loyalty",
    "Restaurant Customer Retention",
    "Diner Rewards WhatsApp",
    "Restaurant CRM India",
  ],
  alternates: {
    canonical: "/restaurant-loyalty",
  },
  openGraph: {
    title: "CustomerPilot for Restaurants — Table QR & VIP Tier Loyalty",
    description: "Bring diners back weekly with table standee QRs, visit multipliers, and 5-second cashier claim terminals.",
    url: "https://customerpilot.ai/restaurant-loyalty",
  },
}

export default function RestaurantLoyaltyPage() {
  return <RestaurantLoyaltyClient />
}
