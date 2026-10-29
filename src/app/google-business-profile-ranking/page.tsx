import type { Metadata } from "next"
import { GbpRankingAuditClient } from "@/components/gbp-ranking-audit-client"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Google Business Profile Top 3 Rank Accelerator & Free Audit | CustomerPilot",
  description:
    "Free 100-Point Google Business Profile (GBP) audit tool and Top 3 Local Pack ranking accelerator for retail shops in India. 100% video verification, zero-ban sandbox velocity protection, and competitor spam redressal.",
  keywords: [
    "Google Business Profile audit",
    "GBP ranking software India",
    "Top 3 Local Pack Google Maps",
    "Google Maps rank accelerator",
    "free GBP self audit tool",
    "Google my business SEO Vadodara Gujarat India",
    "Google sandbox ban protection",
    "video call verification pass Google Business",
    "competitor spam redressal form",
    "local SEO WhatsApp review engine"
  ],
  alternates: {
    canonical: "https://customerpilot.in/google-business-profile-ranking"
  },
  openGraph: {
    title: "Google Business Profile Top 3 Rank Accelerator & Free Audit | CustomerPilot",
    description:
      "Free 100-Point Google Business Profile (GBP) audit tool and Top 3 Local Pack ranking accelerator for retail shops in India. 100% video verification, zero-ban sandbox velocity protection, and competitor spam redressal.",
    url: "https://customerpilot.in/google-business-profile-ranking",
    type: "website"
  }
}

const GBP_RANKING_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot Google Business Profile Top 3 Rank Accelerator",
      "operatingSystem": "All (Web-based, WhatsApp integrated)",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "1999",
        "highPrice": "5999",
        "priceCurrency": "INR"
      },
      "description":
        "Local SEO software and operational SOP engine designed to lock Indian retail merchants into Google Maps Top 3 Local Pack with zero-ban review velocity guardrails and competitor spam redressal."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Why is a Brand New Google Business Profile (Track A) handled differently from an existing one (Track B)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Brand new GBP listings face Google's strict 30-Day Sandbox Trust Barrier and video call verification hurdles. If a new profile receives 30 reviews in week one, Google immediately flags and suspends it for abnormal velocity. Existing profiles (#10-#50) are already verified and require aggressive 90-minute keyword optimization, category parity, and competitor spam purging."
          }
        },
        {
          "@type": "Question",
          "name": "How does the Zero-Ban WhatsApp Review Rule protect merchants from Google policy penalties?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Google strictly prohibits review gating and bribing customers for 5-star ratings. CustomerPilot sends a direct Google review link asking for honest feedback with a photo and awards loyalty stamps for the action itself. If a customer is displeased, a private HELP reply keyword connects them directly to the owner before any public review is drafted."
          }
        },
        {
          "@type": "Question",
          "name": "What is the timeline to reach Top 3 Local Pack on Google Maps?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For Track B (Existing businesses #10 to #50), the 90-minute category surgery, competitor spam redressal, and WhatsApp photo review flywheel typically unlock Top 3 rankings within 30 to 45 days. For Track A (Brand new profiles), video verification takes 7 days followed by a 30-day safe sandbox warm-up, reaching Top 3 within 60 days."
          }
        }
      ]
    }
  ]
}

export default function GoogleBusinessProfileRankingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(GBP_RANKING_SCHEMA) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Google Business Profile Ranking", url: "https://customerpilot.in/google-business-profile-ranking" }
        ]}
      />
      <GbpRankingAuditClient />
    </>
  )
}
