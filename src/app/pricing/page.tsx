import type { Metadata } from "next"
import { PricingClient } from "@/components/pricing-client"

export const metadata: Metadata = {
  title: "CustomerPilot Pricing Studio v4 — Pick Products, Compare Tenures & Build Bundles",
  description: "CustomerPilot Pricing Studio v4: Pick a product, compare tenures (6 Months, 1 Year Pro, Lifetime Deal), build your bundle with live pricing and volume discounts.",
  keywords: [
    "CustomerPilot Pricing",
    "WhatsApp Loyalty Cost",
    "Bakery Loyalty System Price",
    "Restaurant Retention Software Cost",
    "Digital Stamp Card Pricing",
  ],
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "CustomerPilot Pricing — Unlimited WhatsApp Loyalty & Google Reviews",
    description: "Start with a 3-Day Free Trial Today. Scale customer retention and 5-star Google reviews with high-ROI WhatsApp stamp cards.",
    url: "https://customerpilot.in/pricing",
  },
}

export default function PricingPage() {
  return <PricingClient />
}
