import type { Metadata } from "next"
import { CustomerPilotCompleteClient } from "@/components/customerpilot-complete-client"
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "CustomerPilot Complete — All-in-One Retail Customer Retention Suite",
  description: "Unify WhatsApp loyalty stamps, AI Google reviews, 1-click AutoReply, and smart digital cards in one platform. 34% more repeat visits at ₹6.2/day.",
  keywords: [
    "Customer retention software India",
    "All-in-one customer loyalty and review software",
    "Retail customer retention engine",
    "WhatsApp loyalty program India",
    "Best customer retention platform local retail",
    "Complete customer lifecycle software"
  ],
  alternates: {
    canonical: "/customerpilot-complete"
  },
  openGraph: {
    title: "CustomerPilot Complete — All-in-One Customer Retention Engine",
    description: "The complete customer retention stack for Indian retail: WhatsApp loyalty, AI Google reviews, 1-Click AutoReply, and digital visiting cards.",
    url: "https://customerpilot.in/customerpilot-complete"
  }
}

const FAQS = [
  {
    question: "What modules are included in CustomerPilot Complete?",
    answer: "CustomerPilot Complete bundles all 4 core growth engines: (1) 100% App-Free WhatsApp Digital Stamp Cards, (2) Smart AI Google Review QR Generator with 5-second submissions, (3) 1-Click AI AutoReply for Google Maps via official GBP APIs, and (4) Smart Digital Business Cards with 1-tap contact saving and catalog links."
  },
  {
    question: "Can I use CustomerPilot without buying any expensive billing POS machine?",
    answer: "Zero special hardware required! CustomerPilot operates 100% in the cloud. You can run the cashier queue on any smartphone, iPad, tablet, or desktop, or simply place our printable counter QR Code for customer self-checkin."
  },
  {
    question: "How does CustomerPilot Complete compare to separate tools like Birdeye or Stamp Me?",
    answer: "Buying point solutions separately (Stamp Me for loyalty at $49/mo, Birdeye for reviews at $299/mo, and Linktree for links) costs over ₹3,00,000/year and leaves your customer data fragmented. CustomerPilot gives you all four modules unified inside WhatsApp at just ₹2,249/year (₹6.2/day)."
  },
  {
    question: "How fast can my store go live with the complete retention suite?",
    answer: "You can go live in under 3 minutes! Simply sign up, connect your WhatsApp bot and Google Business Profile, print your auto-generated counter QR Code, and start rewarding customers immediately."
  },
  {
    question: "What is the pricing for the full CustomerPilot Complete suite?",
    answer: "CustomerPilot Complete is included in the Founding Merchant Pro Plan at ₹2,249/year (50% OFF discount locked for life), equivalent to just ₹6.2 per day with a 3-day risk-free free trial."
  }
]

export default function CustomerPilotCompletePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Products", url: "https://customerpilot.in/#products" },
          { name: "CustomerPilot Complete", url: "https://customerpilot.in/customerpilot-complete" }
        ]}
      />
      <FAQPageJsonLd faqs={FAQS} />
      <CustomerPilotCompleteClient />
    </>
  )
}
