import type { Metadata } from "next"
import { CarWashLoyaltyClient } from "@/components/car-wash-loyalty-client"

export const metadata: Metadata = {
  title: "Car Wash Loyalty Software WhatsApp & Detailing Review Booster — CustomerPilot",
  description: "Build a loyal base of monthly recurring car wash subscribers using WhatsApp cards. Get top Google search rankings for auto detailing by automating review collection.",
  keywords: [
    "car wash loyalty software whatsapp",
    "google review booster for car wash business",
    "auto detailing customer retention",
    "car wash digital stamp card",
    "car detailing reviews google maps",
    "car wash membership software india",
    "car detailing customer loyalty program"
  ],
  alternates: {
    canonical: "/car-wash-loyalty",
  },
  openGraph: {
    title: "Car Wash Loyalty Software WhatsApp & Review Booster — CustomerPilot",
    description: "Build monthly recurring car wash subscribers and collect 100+ 5-star Google reviews on autopilot for your auto detailing studio.",
    url: "https://customerpilot.in/car-wash-loyalty",
  },
}

export default function CarWashLoyaltyPage() {
  return <CarWashLoyaltyClient />
}
