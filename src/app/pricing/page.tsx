import type { Metadata } from "next"
import { PricingClient } from "@/components/pricing-client"

export const metadata: Metadata = {
  title: "Pricing & Founding Merchant Seats — CustomerPilot",
  description: "Transparent SaaS pricing for local merchants. 14-Day full-featured free trial. Pro plan at ₹2,999/month for unlimited WhatsApp loyalty stamps and AI Google review automation.",
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
    title: "CustomerPilot Pricing & ROI Plans",
    description: "Start with a 14-day free trial. Scale customer retention and 5-star Google reviews with high-ROI WhatsApp stamp cards.",
    url: "https://customerpilot.ai/pricing",
  },
}

export default function PricingPage() {
  return <PricingClient />
}
