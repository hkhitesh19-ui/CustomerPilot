import type { Metadata } from "next"
import { RankPilotLandingClient } from "@/components/rankpilot/rankpilot-landing-client"

export const metadata: Metadata = {
  title: "RankPilot AI™ — Move from Page 10 to Google Maps Top 3 in 30 Days",
  description:
    "RankPilot AI™ is India's premier autonomous Local SEO & Google Business Profile accelerator. Dominate Google's 3-Pack with 10 Products + 10 Services matrix, automated post scheduling, and geo-relevance ranking.",
  keywords: [
    "RankPilot AI",
    "Google Maps Top 3 Ranking",
    "GBP Local SEO Software",
    "Google 3-Pack Domination",
    "Local Business Rank Accelerator",
    "Google Business Profile Automation",
    "Bakery Local SEO",
    "Salon SEO Vadodara",
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
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "description": "30-Day Sprint & Free Revenue Leak Audit"
        },
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
