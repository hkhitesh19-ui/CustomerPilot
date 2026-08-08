import type { Metadata } from "next"
import { HelpClient } from "@/components/help-client"

export const metadata: Metadata = {
  title: "Merchant Help Center & Onboarding Guides — CustomerPilot",
  description: "Find step-by-step merchant guides on printing QR stands, connecting WhatsApp, configuring loyalty rewards, and training cashiers on the 5-second claim terminal.",
  keywords: [
    "Merchant Help Center",
    "CustomerPilot Onboarding",
    "WhatsApp Loyalty Setup Guide",
    "QR Code Stand Printing",
    "Cashier Terminal Tutorial",
  ],
  alternates: {
    canonical: "/help",
  },
  openGraph: {
    title: "CustomerPilot Merchant Help Center",
    description: "Launch your customer loyalty engine in minutes with our setup guides, cashier tutorials, and QR printing assets.",
    url: "https://customerpilot.ai/help",
  },
}

export default function HelpCenterPage() {
  return <HelpClient />
}
