import type { Metadata } from "next"
import { PricingClient } from "@/components/pricing-client"

export const metadata: Metadata = {
  title: "Simple, Predictable Pricing — CustomerPilot",
  description: "Transparent SaaS pricing for local merchants. 7-Day full-featured free trial. Pro plan at ₹2,999/month for unlimited WhatsApp loyalty stamps and AI Google review automation.",
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
    description: "Start with a 7-Day Free Trial Today. Scale customer retention and 5-star Google reviews with high-ROI WhatsApp stamp cards.",
    url: "https://customerpilot.ai/pricing",
  },
}

export default function PricingPage() {
  return <PricingClient />
}
