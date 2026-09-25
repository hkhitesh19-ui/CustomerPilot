import type { Metadata } from "next"
import { SalonLoyaltyClient } from "@/components/salon-loyalty-client"

export const metadata: Metadata = {
  title: "WhatsApp Loyalty Software for Salons & Spa & Google Review Automation — CustomerPilot",
  description: "Fill empty salon chairs on weekdays (Mon-Thu) with automated WhatsApp re-engagement offers. Rank #1 on Google Maps for 'Best Salon Near Me' with automated 5-star review drafts.",
  keywords: [
    "whatsapp loyalty software for salons and spa",
    "how to increase repeat clients in beauty salon",
    "automated google review request for salon owners",
    "salon loyalty program india",
    "spa customer retention software",
    "beauty parlour whatsapp marketing",
    "salon vip tier card"
  ],
  alternates: {
    canonical: "/salon-loyalty",
  },
  openGraph: {
    title: "WhatsApp Loyalty Software for Salons & Spas — CustomerPilot",
    description: "Fill empty salon chairs on weekdays with automated WhatsApp re-engagement offers and rank #1 on Google Maps with 5-star reviews.",
    url: "https://customerpilot.in/salon-loyalty",
  },
}

export default function SalonLoyaltyPage() {
  return <SalonLoyaltyClient />
}
