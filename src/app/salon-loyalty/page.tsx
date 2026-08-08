import type { Metadata } from "next"
import { SalonLoyaltyClient } from "@/components/salon-loyalty-client"

export const metadata: Metadata = {
  title: "Salon & Spa Loyalty Program — WhatsApp VIP Tier Cards — CustomerPilot",
  description: "Build a high-retention VIP club for your hair salon, spa, or beauty clinic. Automate service stamp cards, birthday discounts, and treatment milestone rewards.",
  keywords: [
    "Salon Loyalty Program",
    "Spa Stamp Cards",
    "Beauty Clinic WhatsApp VIP",
    "Salon Customer Retention",
    "Hair Salon Loyalty India",
  ],
  alternates: {
    canonical: "/salon-loyalty",
  },
  openGraph: {
    title: "CustomerPilot for Salons & Spas — VIP Tier Rewards",
    description: "Reward styling, haircut, and spa clients with automated WhatsApp digital punch cards and birthday pampering discounts.",
    url: "https://customerpilot.ai/salon-loyalty",
  },
}

export default function SalonLoyaltyPage() {
  return <SalonLoyaltyClient />
}
