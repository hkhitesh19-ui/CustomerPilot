import type { Metadata } from "next"
import { AiGoogleReviewQrClient } from "@/components/ai-google-review-qr-client"
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "AI Google Review QR Code Generator & Auto-Writer | CustomerPilot",
  description: "Collect 312% more verified 5-star Google reviews on autopilot. Smart AI QR codes pre-draft personalized reviews on WhatsApp with zero app download friction.",
  keywords: [
    "AI Google Review QR Code Generator",
    "Smart AI Review QR code",
    "Scan karte hi Google review option dene wala software",
    "Google review QR code generator India",
    "Automated Google review collector retail",
    "AI review auto writer for local business",
    "Increase Google Maps reviews for restaurants"
  ],
  alternates: {
    canonical: "/ai-google-review-qr-generator"
  },
  openGraph: {
    title: "AI Google Review QR Code Generator & Writer — CustomerPilot",
    description: "Turn every happy customer into a 5-star Google review. Smart QR codes pre-draft AI reviews on WhatsApp in 5 seconds.",
    url: "https://customerpilot.in/ai-google-review-qr-generator"
  }
}

const FAQS = [
  {
    question: "How does the AI Google Review QR code generator work for local retail shops?",
    answer: "Place the CustomerPilot acrylic QR standee on your billing counter. When customers scan it (or receive an automated post-visit WhatsApp message), our generative AI drafts an authentic, positive review highlighting their purchase. The customer taps once to open Google Maps directly to the review submission dialog with the text pre-filled."
  },
  {
    question: "Does CustomerPilot filter or protect my business from negative reviews?",
    answer: "Yes! CustomerPilot features a Smart Sentiment Router. If a customer rates their experience 1 to 3 stars, they are routed to a private merchant feedback dialog where you can resolve their issue directly. Only 4 and 5-star satisfied ratings are directed to publish on Google Maps, safeguarding your public rating."
  },
  {
    question: "Can I reward customers with bonus stamps for giving a 5-star Google review?",
    answer: "Absolutely! You can configure CustomerPilot to automatically award +2 bonus loyalty stamps (or exclusive reward discounts) once a customer submits their verified Google Review. This creates a powerful incentive loop that triples monthly review volume."
  },
  {
    question: "Does the customer need to download any app to post a Google review?",
    answer: "Zero app download required. The flow works 100% inside mobile web browsers and WhatsApp, connecting directly to the customer's native Google Maps app or browser account."
  },
  {
    question: "How does getting more Google reviews boost my store's local Google Maps ranking?",
    answer: "Google's local search algorithm places heavy weight on review velocity, recency, average star rating, and keyword-rich text. CustomerPilot reviews naturally include product keywords and location context, accelerating your position into Google Map's top-3 Local Pack."
  }
]

export default function AiGoogleReviewQrPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Products", url: "https://customerpilot.in/#products" },
          { name: "AI Google Review QR Generator", url: "https://customerpilot.in/ai-google-review-qr-generator" }
        ]}
      />
      <FAQPageJsonLd faqs={FAQS} />
      <AiGoogleReviewQrClient />
    </>
  )
}
