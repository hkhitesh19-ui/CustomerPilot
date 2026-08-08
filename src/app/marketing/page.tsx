import type { Metadata } from "next"
import { MarketingClient } from "@/components/marketing-client"
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

const MARKETING_FAQS = [
  {
    question: "What is CustomerPilot?",
    answer: "CustomerPilot is an autonomous AI customer retention SaaS that helps bakeries, cafes, restaurants, and retail stores turn one-time visitors into repeat customers using WhatsApp digital stamp cards, live queue check-ins, and 5-star Google review automation."
  },
  {
    question: "Do customers need to download an app?",
    answer: "No. Customers simply scan the store QR code and join the loyalty program instantly via WhatsApp in under 5 seconds."
  },
  {
    question: "How does Google Review Automation work?",
    answer: "CustomerPilot automatically detects positive 5-star reviews on Google, awards bonus loyalty stamps to the customer, and generates an AI-written reply draft for the merchant to approve."
  },
  {
    question: "Does CustomerPilot require replacing my current POS system?",
    answer: "No. CustomerPilot works alongside any existing POS system, cash register, or UPI QR code. Cashiers only spend 5 seconds per customer on our Tap-to-Claim interface."
  }
]

export const metadata: Metadata = {
  title: "WhatsApp Loyalty & Google Review Automation Platform — CustomerPilot",
  description: "Turn every walk-in into a lifetime customer in 5 seconds. Boost repeat visits for bakeries, cafes, restaurants, and salons with WhatsApp digital stamp cards and AI Google reviews.",
  keywords: [
    "WhatsApp Loyalty Platform",
    "Customer Retention SaaS",
    "Google Review Automation",
    "Digital Stamp Card India",
    "Retail CRM WhatsApp",
    "Cafe Loyalty System",
  ],
  alternates: {
    canonical: "/marketing",
  },
  openGraph: {
    title: "CustomerPilot — Autonomous Customer Retention SaaS",
    description: "Customer scans QR. Cashier taps. Reward delivered in 5 seconds on WhatsApp. No POS replacement needed.",
    url: "https://customerpilot.ai/marketing",
  },
}

export default function MarketingPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", url: "https://customerpilot.ai" }, { name: "Platform", url: "https://customerpilot.ai/marketing" }]} />
      <FAQPageJsonLd faqs={MARKETING_FAQS} />
      <MarketingClient />
    </>
  )
}
