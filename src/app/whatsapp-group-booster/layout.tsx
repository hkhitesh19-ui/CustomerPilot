import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "WhatsApp Group QR Code — Lead Capture & Group Booster for Indian Shops | CustomerPilot",
  description:
    "Grow your WhatsApp group with a smart QR code lead capture system. Add 100s of customers to your WhatsApp broadcast list from your billing counter — no manual number saving. Perfect for Indian retailers.",
  keywords: [
    "whatsapp group qr code lead capture",
    "whatsapp group booster india",
    "whatsapp broadcast list builder india",
    "whatsapp customer list builder for shop",
    "qr code whatsapp group joiner india",
    "whatsapp marketing for small business india",
    "whatsapp group grow tool india",
    "customer whatsapp number collector",
    "whatsapp group lead capture qr",
    "dynamic qr code whatsapp group india"
  ],
  alternates: {
    canonical: "https://customerpilot.in/whatsapp-group-booster"
  },
  openGraph: {
    title: "WhatsApp Group QR Code Lead Capture — Booster for Indian Shops | CustomerPilot",
    description:
      "Grow your WhatsApp customer list automatically with a smart QR code. 100s of customers join your broadcast list from your billing counter — no manual work.",
    url: "https://customerpilot.in/whatsapp-group-booster",
    type: "website"
  }
}

export default function WhatsAppGroupBoosterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
