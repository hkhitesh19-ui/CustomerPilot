import type { Metadata } from "next"
import { SignupClient } from "@/components/signup-client"

export const metadata: Metadata = {
  title: "Merchant Signup & 3-Day Free Trial — CustomerPilot",
  description: "Create your merchant account in under 2 minutes. Start 3 Days Free Trial Today with no credit card required.",
  keywords: [
    "Merchant Signup",
    "CustomerPilot Free Trial",
    "WhatsApp Loyalty Setup",
    "Retail CRM Registration",
  ],
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    title: "Start Your 3-Day CustomerPilot Free Trial",
    description: "Start 3 Days Free Trial Today. Bring walk-ins back to your retail store with WhatsApp stamp cards and Google Review AI responses.",
    url: "https://customerpilot.ai/signup",
  },
}

export default function SignupPage() {
  return <SignupClient />
}
