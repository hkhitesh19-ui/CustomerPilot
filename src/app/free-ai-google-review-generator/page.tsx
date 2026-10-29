import type { Metadata } from "next"
import { FreeAiReviewGeneratorClient } from "@/components/free-ai-review-generator-client"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Free AI Google Review Generator | Create 5-Star Reviews | CustomerPilot",
  description:
    "Generate authentic, keyword-rich 5-star Google reviews in 3 seconds for free. Enter your business type and key highlight to get 3 ready-to-copy review variations for cafes, bakeries, salons & clinics.",
  keywords: [
    "Free AI Google Review Generator",
    "AI review writer free",
    "Google review text generator India",
    "5 star review template generator",
    "AI review auto writer for local business",
    "Google Maps review generator",
    "Customer review generator tool"
  ],
  alternates: {
    canonical: "https://customerpilot.in/free-ai-google-review-generator"
  },
  openGraph: {
    title: "Free AI Google Review Generator — 3 Variations in 3 Seconds",
    description:
      "Generate 5-star Google reviews for free. Tailored for Indian retail shops, restaurants, salons, and bakeries.",
    url: "https://customerpilot.in/free-ai-google-review-generator"
  }
}

const FREE_GENERATOR_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "CustomerPilot Free AI Google Review Generator",
      "operatingSystem": "All (Web browser)",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "description":
        "Free AI tool that generates 3 authentic, keyword-optimized 5-star Google review drafts for local businesses."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is this AI Google Review Generator really 100% free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes! This generator is completely free with zero credit card required and no daily usage limits. Local retail shops, restaurants, salons, and clinics can use it anytime."
          }
        },
        {
          "@type": "Question",
          "name": "How do keyword-rich reviews help my store rank #1 on Google Maps?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Google's local search algorithm indexes words inside user reviews. When reviews mention specific products or services, Google Maps ranks your business higher for those local searches."
          }
        }
      ]
    }
  ]
}

export default function FreeAiGoogleReviewGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FREE_GENERATOR_SCHEMA) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Free Tools", url: "https://customerpilot.in/#tools" },
          { name: "Free AI Google Review Generator", url: "https://customerpilot.in/free-ai-google-review-generator" }
        ]}
      />
      <FreeAiReviewGeneratorClient />
    </>
  )
}
