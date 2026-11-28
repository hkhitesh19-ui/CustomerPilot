import type { Metadata } from "next"
import { AiGoogleReviewAutoReplyClient } from "@/components/ai-google-review-autoreply-client"
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "AI Auto Reply Google Reviews — 1-Click Review Response Tool India | CustomerPilot",
  description: "Auto reply to 100% of your Google Maps reviews in 1 click. CustomerPilot's AI review reply tool generates context-aware, professional owner responses instantly — boosts Local SEO ranking by 42%.",
  keywords: [
    "auto reply google reviews india",
    "ai google review reply tool",
    "google review response generator",
    "automated google review owner reply software",
    "Google Business Profile review responder India",
    "google maps review auto reply",
    "AI review reply bot india",
    "GBP AI auto reply tool",
    "1 click google review response",
    "Local SEO review responder"
  ],
  alternates: {
    canonical: "https://customerpilot.in/ai-google-review-autoreply"
  },
  openGraph: {
    title: "AI Auto Reply Google Reviews — 1-Click Review Response Tool India | CustomerPilot",
    description: "Auto reply to all Google Maps reviews in 1 click. AI generates professional, context-aware owner responses — boosts Local SEO and builds customer trust.",
    url: "https://customerpilot.in/ai-google-review-autoreply"
  }
}

const FAQS = [
  {
    question: "How does 1-Click AI AutoReply work with my Google Business Profile?",
    answer: "CustomerPilot connects securely to your Google Business Profile via official Google OAuth APIs. Whenever a new review is posted, our Gemini AI engine analyzes the sentiment, mentions specific products, and prepares a warm, professional owner response ready for 1-click approval."
  },
  {
    question: "Does the AI reply sound robotic or does it mention specific customer details?",
    answer: "Zero robotic templates. The AI reads the actual text of the review—if the customer praised your 'Butter Croissant' or mentioned 'friendly staff at the counter', the AI contextualizes the response to thank them specifically for that exact dish and visit context."
  },
  {
    question: "Can I edit the AI reply before it gets published to Google Maps?",
    answer: "Yes! Every reply is placed in your Pre-Approval Queue with a 60-second safety delay. You can publish it in 1-click, customize the text in seconds, or let trusted auto-pilot post verified appreciative responses automatically."
  },
  {
    question: "How does replying to all Google reviews boost my local Google ranking?",
    answer: "Google's official guidelines state that businesses that actively respond to customer reviews demonstrate higher trustworthiness. Consistent, fast review replies directly boost your Local 3-Pack rankings and result in 28% more direction requests."
  },
  {
    question: "Does this software violate Google Business Profile policies?",
    answer: "100% compliant. CustomerPilot operates strictly through official Google Cloud Console APIs and enterprise OAuth 2.0 authorization, without scraping or unauthorized automation bots."
  }
]

export default function AiGoogleReviewAutoReplyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Products", url: "https://customerpilot.in/#products" },
          { name: "1-Click AI AutoReply", url: "https://customerpilot.in/ai-google-review-autoreply" }
        ]}
      />
      <FAQPageJsonLd faqs={FAQS} />
      <AiGoogleReviewAutoReplyClient />
    </>
  )
}
