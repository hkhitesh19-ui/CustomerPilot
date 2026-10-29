import type { Metadata } from "next"
import { AiGoogleReviewQrClient } from "@/components/ai-google-review-qr-client"

export const metadata: Metadata = {
  title: "AI Google Review QR Code Generator & Auto-Writer — CustomerPilot",
  description: "Collect 312% more verified 5-star Google reviews on autopilot. Smart AI QR codes pre-draft personalized reviews on WhatsApp with zero app download friction.",
  keywords: [
    "Google Review Automation",
    "AI Google Review QR Code Generator",
    "Local SEO Review Generation",
    "AI Review Reply Generator",
    "Google Business Profile Automation",
    "Restaurant Google Reviews India",
  ],
  alternates: {
    canonical: "/ai-google-review-qr-generator",
  },
  openGraph: {
    title: "AI Google Review QR Code Generator & Writer — CustomerPilot",
    description: "Turn positive walk-in experiences into verified 5-star Google reviews with automated AI response drafts.",
    url: "https://customerpilot.in/ai-google-review-qr-generator",
  },
}

export default function GoogleReviewAutomationPage() {
  return <AiGoogleReviewQrClient />
}
