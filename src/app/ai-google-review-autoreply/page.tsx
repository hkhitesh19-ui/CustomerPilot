import type { Metadata } from "next"
import { AiGoogleReviewAutoReplyClient } from "@/components/ai-google-review-autoreply-client"
import { FAQPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "1-Click AI Google Review AutoReply & Response Generator | CustomerPilot",
  description: "Automate owner replies to 100% of Google Maps reviews in 1-Click. Gemini AI generates appreciative, context-aware responses to boost local SEO ranking by 42%.",
  keywords: [
    "AI Google review auto reply software",
    "Google Business Profile review responder India",
    "Automated owner response for Google Maps",
    "Google review reply bot",
    "GBP AI auto reply tool",
    "Local SEO review responder"
  ],
  alternates: {
    canonical: "/ai-google-review-autoreply"
  },
  openGraph: {
    title: "1-Click AI Google Review AutoReply — CustomerPilot",
    description: "Publish personalized, appreciative owner responses to Google Maps reviews in 1 second with context-aware generative AI.",
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
