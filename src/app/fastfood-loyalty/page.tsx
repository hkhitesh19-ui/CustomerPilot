import type { Metadata } from "next"
import { FastFoodLoyaltyClient } from "@/components/fastfood-loyalty-client"

export const metadata: Metadata = {
  title: "Fast Food Loyalty Software WhatsApp & QSR Customer Retention — CustomerPilot",
  description: "Instant 5-second check-in on WhatsApp to boost repeat fast-food orders. Turn one-time fast food buyers into loyal daily customers with automated offers.",
  keywords: [
    "fast food loyalty software whatsapp",
    "customer retention tool for qsr street food shop",
    "qsr loyalty program india",
    "fast food digital stamp card",
    "whatsapp customer retention qsr",
    "street food loyalty card",
    "how to get 5 star google reviews for bakery fast food"
  ],
  alternates: {
    canonical: "/fastfood-loyalty",
  },
  openGraph: {
    title: "Fast Food Loyalty Software WhatsApp & QSR Retention — CustomerPilot",
    description: "Turn one-time fast food buyers into loyal daily customers with 5-second WhatsApp check-ins and automated combo offers.",
    url: "https://customerpilot.in/fastfood-loyalty",
  },
}

export default function FastFoodLoyaltyPage() {
  return <FastFoodLoyaltyClient />
}
