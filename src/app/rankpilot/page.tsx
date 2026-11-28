import type { Metadata } from "next"
import { RankPilotLandingClient } from "@/components/rankpilot/rankpilot-landing-client"

export const metadata: Metadata = {
  title: "RankPilot AI™ — Google Business Profile Optimization Service India | Top 3 Maps | CustomerPilot",
  description:
    "RankPilot AI™ is India's #1 Google Business Profile optimization service — move from Page 10 to Google Maps Top 3 in 30 days. Automated GBP posts, 10+10 product matrix, Local SEO for Indian retail shops.",
  keywords: [
    "google business profile optimization service india",
    "RankPilot AI",
    "Google Maps Top 3 Ranking india",
    "GBP Local SEO Software india",
    "Google 3-Pack Domination",
    "local seo service for small business india",
    "google business profile ranking software",
    "Local Business Rank Accelerator india",
    "Google Business Profile Automation india",
    "CustomerPilot RankPilot"
  ],
  alternates: {
    canonical: "/rankpilot",
  },
  openGraph: {
    title: "RankPilot AI™ — Move from Page 10 to Google Maps Top 3 in 30 Days",
    description:
      "Automated Google Business Profile ranking engine with zero-gap posts, 10+10 bestseller matrix, and real-time revenue leak analytics.",
    url: "https://customerpilot.in/rankpilot",
    siteName: "CustomerPilot AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RankPilot AI - Google Local Pack Top 3 Accelerator"
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RankPilot AI™ — Google Maps Top 3 Accelerator",
    description: "Move from Page 10 to Top 3 in 30 Days with automated Google Business Profile growth.",
    images: ["/og-image.png"]
  }
}

export default function RankPilotPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "RankPilot AI™",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, Cloud",
        "offers": [
          {
            "@type": "Offer",
            "name": "3-Month Acceleration Pilot (Limited Launch Offer)",
            "price": "6999",
            "priceCurrency": "INR",
            "description": "3-Month acceleration pilot with 45-day Page 1 and 90-day Top 3 guarantee, or 100% Moneyback.",
            "url": "https://customerpilot.in/rankpilot#pricing"
          },
          {
            "@type": "Offer",
            "name": "Annual Local Dominance Plan",
            "price": "29000",
            "priceCurrency": "INR",
            "description": "Full 365-day Google Maps Local 3-Pack domination and defense with 100% Moneyback guarantee.",
            "url": "https://customerpilot.in/rankpilot#pricing"
          }
        ],
        "description": "Automated Google Business Profile Top 3 Local Pack ranking accelerator for brick-and-mortar merchants."
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://customerpilot.in"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "RankPilot AI",
            "item": "https://customerpilot.in/rankpilot"
          }
        ]
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RankPilotLandingClient />
    </>
  )
}
