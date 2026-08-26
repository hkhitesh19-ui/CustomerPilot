import type { Metadata } from "next"
import { GoogleReviewAutomationClient } from "@/components/google-review-automation-client"

export const metadata: Metadata = {
  title: "Google Review Automation & AI Response Generator — CustomerPilot",
  description: "Incentivize 5-star Google reviews with bonus loyalty stamps and automate personalized AI reply drafts for 1-click merchant approval.",
  keywords: [
    "Google Review Automation",
    "Local SEO Review Generation",
    "AI Review Reply Generator",
    "Google Business Profile Automation",
    "Restaurant Google Reviews India",
  ],
  alternates: {
    canonical: "/features/google-review-automation",
  },
  openGraph: {
    title: "Google Review Automation & AI Replies — CustomerPilot",
    description: "Turn positive walk-in experiences into verified 5-star Google reviews with automated AI response drafts.",
    url: "https://customerpilot.ai/features/google-review-automation",
  },
}

export default function GoogleReviewAutomationPage() {
  return <GoogleReviewAutomationClient />
}
