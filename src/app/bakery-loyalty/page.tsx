import type { Metadata } from "next"
import { BakeryLoyaltyClient } from "@/components/bakery-loyalty-client"

export const metadata: Metadata = {
  title: "Digital Stamp Card Software for Cake Shops & Bakeries — CustomerPilot",
  description: "Replace lost paper cards with WhatsApp digital stamp cards to double repeat orders. Collect 100+ 5-star Google reviews on autopilot using 1-click AI drafts.",
  keywords: [
    "digital stamp card software for cake shops and bakeries",
    "how to get 5 star google reviews for bakery fast food",
    "bakery loyalty program india",
    "cake shop stamp card whatsapp",
    "cake box seal qr code",
    "bakery customer retention software",
  ],
  alternates: {
    canonical: "/bakery-loyalty",
  },
  openGraph: {
    title: "Digital Stamp Card Software for Cake Shops & Bakeries — CustomerPilot",
    description: "Replace lost paper cards with WhatsApp digital stamp cards to double repeat orders and collect 5-star Google reviews.",
    url: "https://customerpilot.in/bakery-loyalty",
  },
}

export default function BakeryLoyaltyPage() {
  return <BakeryLoyaltyClient />
}
