import type { Metadata } from "next"
import { BakeryLoyaltyClient } from "@/components/bakery-loyalty-client"

export const metadata: Metadata = {
  title: "Bakery Loyalty Program & Cake Box QR Stamp Cards — CustomerPilot",
  description: "Turn one-time cake buyers into lifetime repeat customers with WhatsApp digital stamp cards and branded cake box seal QR codes for bakeries and confectioneries.",
  keywords: [
    "Bakery Loyalty Program",
    "Cake Shop Stamp Card",
    "Confectionery WhatsApp Loyalty",
    "Cake Box QR Code",
    "Bakery Customer Retention India",
  ],
  alternates: {
    canonical: "/bakery-loyalty",
  },
  openGraph: {
    title: "CustomerPilot for Bakeries — WhatsApp Cake Box Loyalty",
    description: "Automate repeat cake and pastry sales with printable cake box seal QR codes and instant WhatsApp digital stamp cards.",
    url: "https://customerpilot.ai/bakery-loyalty",
  },
}

export default function BakeryLoyaltyPage() {
  return <BakeryLoyaltyClient />
}
