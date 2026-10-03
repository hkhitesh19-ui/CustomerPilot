import type { Metadata } from "next"
import { AiGoogleReviewQrClient } from "@/components/ai-google-review-qr-client"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Smart AI Google Review Software & Automation | CustomerPilot",
  description:
    "CustomerPilot's Smart AI Google Review software automates 5-star review generation using WhatsApp automation and generative AI. Zero customer typing — AI auto-writes keyword-rich reviews for local merchants.",
  keywords: [
    "AI Google review software",
    "WhatsApp review automation",
    "automated Google review writer",
    "generative AI review system India",
    "AI auto review generation tool",
    "Smart AI Google review software",
    "QR scan review automation SaaS",
    "local business review automation WhatsApp",
    "Scan karte hi Google review option dene wala software",
    "QR code scan karke review likhne wala AI tool"
  ],
  alternates: {
    canonical: "https://customerpilot.in/smart-ai-google-review"
  },
  openGraph: {
    title: "Smart AI Google Review Software & Automation | CustomerPilot",
    description:
      "CustomerPilot's Smart AI Google Review software automates 5-star review generation using WhatsApp automation and generative AI. Zero customer typing — AI auto-writes keyword-rich reviews for local merchants.",
    url: "https://customerpilot.in/smart-ai-google-review"
  }
}

const SMART_AI_REVIEW_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot Smart AI Google Review",
      "operatingSystem": "All (Web-based, WhatsApp integrated)",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "description":
        "AI-powered tool that automatically drafts Google reviews for customers using smart QR codes and WhatsApp automation."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Smart AI Google Review by CustomerPilot?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "It is an automated QR tool that writes personalized 5-star Google reviews for customers based on their positive experience, boosting local SEO ranking."
          }
        },
        {
          "@type": "Question",
          "name": "QR code scan karke review likhne wala AI tool kaise kaam karta hai?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Customer QR code scan karta hai, AI unke liye review text draft karta hai, aur customer bina type kiye 1-click me Google Business Profile par submit kar deta hai."
          }
        },
        {
          "@type": "Question",
          "name": "How does the AI Google Review QR code generator work for local retail shops?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Place the CustomerPilot acrylic QR standee on your billing counter. When customers scan it, our generative AI drafts an authentic, positive review highlighting their purchase. The customer taps once to open Google Maps directly to the review submission dialog with the text pre-filled."
          }
        },
        {
          "@type": "Question",
          "name": "Does CustomerPilot filter or protect my business from negative reviews?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes! CustomerPilot features a Smart Sentiment Router. If a customer rates their experience 1 to 3 stars, they are routed to a private merchant feedback dialog where you can resolve their issue directly. Only 4 and 5-star satisfied ratings are directed to publish on Google Maps, safeguarding your public rating."
          }
        },
        {
          "@type": "Question",
          "name": "Can I reward customers with bonus stamps for giving a 5-star Google review?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Absolutely! You can configure CustomerPilot to automatically award +2 bonus loyalty stamps once a customer submits their verified Google Review."
          }
        }
      ]
    }
  ]
}

export default function SmartAiGoogleReviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SMART_AI_REVIEW_SCHEMA) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Products", url: "https://customerpilot.in/#products" },
          { name: "Smart AI Google Review", url: "https://customerpilot.in/smart-ai-google-review" }
        ]}
      />
      <AiGoogleReviewQrClient />
    </>
  )
}
