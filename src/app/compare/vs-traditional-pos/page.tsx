import type { Metadata } from "next"
import { ComparePOSClient } from "@/components/compare-pos-client"

export const metadata: Metadata = {
  title: "CustomerPilot vs. Traditional POS Loyalty Systems Comparison — CustomerPilot",
  description: "Compare CustomerPilot against traditional POS loyalty add-ons. Zero hardware investment, 100% WhatsApp native, and 5-second tap-to-claim checkout speed.",
  keywords: [
    "CustomerPilot vs Traditional POS",
    "POS Loyalty Alternative",
    "WhatsApp Loyalty Comparison",
    "Retail CRM vs POS Addon",
    "Cloud POS Customer Retention",
  ],
  alternates: {
    canonical: "/compare/vs-traditional-pos",
  },
  openGraph: {
    title: "CustomerPilot vs Traditional POS Loyalty Systems",
    description: "Discover why merchants prefer CustomerPilot's app-free WhatsApp loyalty over clunky POS software add-ons.",
    url: "https://customerpilot.ai/compare/vs-traditional-pos",
  },
}

export default function CompareVsPOSPage() {
  return <ComparePOSClient />
}
