import type { Metadata } from "next"
import { SignupClient } from "@/components/signup-client"

export const metadata: Metadata = {
  title: "Merchant Signup & 14-Day Free Trial — CustomerPilot",
  description: "Create your CustomerPilot merchant account in 2 minutes. Activate WhatsApp digital stamp cards, cashier tap-to-claim terminals, and AI Google review responses.",
  keywords: [
    "Merchant Registration",
    "CustomerPilot Signup",
    "WhatsApp Loyalty Signup",
    "Bakery Loyalty System Trial",
    "Restaurant Retention Free Trial",
  ],
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    title: "CustomerPilot Merchant Registration",
    description: "Start your 14-day free trial. Bring walk-ins back to your retail store with WhatsApp stamp cards and Google Review AI responses.",
    url: "https://customerpilot.ai/signup",
  },
}

export default function SignupPage() {
  return <SignupClient />
}
