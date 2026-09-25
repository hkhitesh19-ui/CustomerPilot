import type { Metadata } from "next"
import { CafeLoyaltyClient } from "@/components/cafe-loyalty-client"

export const metadata: Metadata = {
  title: "WhatsApp Loyalty Card for Cafe in India & Digital Stamp Cards — CustomerPilot",
  description: "Drive 2X weekly cafe check-ins using automated WhatsApp reward triggers. Replace lost paper punch cards with digital stamps and boost repeat coffee visits.",
  keywords: [
    "whatsapp loyalty card for cafe in india",
    "cafe loyalty system india",
    "coffee shop punch card whatsapp",
    "digital stamp card software for cafes",
    "how to increase repeat customers in cafe",
    "cafe customer retention software",
  ],
  alternates: {
    canonical: "/cafe-loyalty",
  },
  openGraph: {
    title: "WhatsApp Loyalty Card for Cafe in India — CustomerPilot",
    description: "Drive 2X weekly cafe check-ins using automated WhatsApp reward triggers. Zero app downloads, instant counter check-in.",
    url: "https://customerpilot.in/cafe-loyalty",
  },
}

export default function CafeLoyaltyPage() {
  return <CafeLoyaltyClient />
}
