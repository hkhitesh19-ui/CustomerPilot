import type { Metadata } from "next"
import { WhatsAppStampCardClient } from "@/components/whatsapp-stamp-card-client"

export const metadata: Metadata = {
  title: "App-Free WhatsApp Digital Stamp Cards for Retail — CustomerPilot",
  description: "Discover CustomerPilot's 100% app-free WhatsApp loyalty system. Customers scan counter QR codes and collect digital stamps directly in WhatsApp in 5 seconds.",
  keywords: [
    "WhatsApp Digital Stamp Card",
    "App-Free Loyalty System",
    "QR Code Retail Rewards",
    "WhatsApp Customer Loyalty",
    "Retail Stamp Card Automation",
  ],
  alternates: {
    canonical: "/features/whatsapp-stamp-card",
  },
  openGraph: {
    title: "100% App-Free WhatsApp Stamp Cards — CustomerPilot",
    description: "No apps to download. Customers scan your counter QR and collect digital loyalty stamps straight on WhatsApp.",
    url: "https://customerpilot.ai/features/whatsapp-stamp-card",
  },
}

export default function WhatsAppStampCardPage() {
  return <WhatsAppStampCardClient />
}
