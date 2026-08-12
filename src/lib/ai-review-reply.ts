import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generateAIReviewReply(params: {
  merchantName: string
  locationOrArea: string
  category: string
  customerReview: string
  rating?: number
}): Promise<string> {
  const storeName = params.merchantName || "Cake Connection"
  const location = params.locationOrArea || "Vadodara"
  const categoryStr = params.category || "fresh cakes and bakery items"
  const rating = params.rating ?? 5

  // Tier-Based Fallbacks if AI API is unavailable
  let fallbackReply = ""
  if (rating <= 2) {
    fallbackReply = `Dear Customer, thank you for bringing this to our attention. We at ${storeName} ${location} take full responsibility for not meeting your expectations regarding your recent ${categoryStr} experience. Please message us directly on WhatsApp so we can resolve this for you immediately.`
  } else if (rating === 3) {
    fallbackReply = `Hi! Thank you for sharing your valuable feedback for ${storeName} in ${location}. We appreciate your honest thoughts about our ${categoryStr} and are constantly improving to make your next visit a 5-star experience!`
  } else {
    fallbackReply = `Thank you so much for your wonderful 5-star review of ${storeName} in ${location}! We are thrilled that you loved our ${categoryStr}. Looking forward to serving you again soon!`
  }

  if (!process.env.GEMINI_API_KEY) {
    return fallbackReply
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })
    
    let sentimentGuidance = ""
    if (rating <= 2) {
      sentimentGuidance = `
RATING: ${rating}/5 Stars (NEGATIVE REVIEW)
TONE: Empathetic, deeply apologetic, humble, professional, and resolution-focused.
RULES:
1. Sincerely apologize and acknowledge the specific issue mentioned in the customer's wording (e.g. quality, delay, service, taste).
2. Naturally include Merchant Name "${storeName}" and Location "${location}" for brand protection and local SEO.
3. Invite them to contact store management directly via WhatsApp to make things right. Never be defensive.`
    } else if (rating === 3) {
      sentimentGuidance = `
RATING: 3/5 Stars (MODERATE / NEUTRAL REVIEW)
TONE: Balanced, appreciative, constructive, and humble.
RULES:
1. Express genuine thanks for the honest feedback and address the specific points highlighted in their review.
2. Naturally incorporate Merchant Name "${storeName}", Location "${location}", and product keywords (${categoryStr}) for SEO ranking.
3. Express commitment to turning their next visit into a full 5-star experience.`
    } else {
      sentimentGuidance = `
RATING: ${rating}/5 Stars (POSITIVE REVIEW)
TONE: Warm, celebratory, appreciative, and hospitable ("Dhanyawad / Thank you ❤️").
RULES:
1. Express genuine delight for their specific compliments in the review text.
2. Maximize Local SEO by naturally embedding Merchant Name "${storeName}", Location/Area "${location}", and primary keywords (${categoryStr}).
3. Warmly invite them back to visit the business.`
    }

    const prompt = `Act as the warm, professional, genuine business owner of ${storeName} located in ${location}. Respond to the following customer Google Review.

CUSTOMER REVIEW (${rating}/5 Stars): "${params.customerReview}"
CATEGORY: ${categoryStr}

${sentimentGuidance}

GENERAL INSTRUCTIONS:
- Match the length and specific wordings of the customer's review (keep reply concise: 2-4 sentences, 40-70 words).
- Output ONLY the reply text, no intro text, no quotes.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    const cleanText = text.replace(/^(Here is a draft|Sure|Here's a response):/i, "").replace(/^"/, "").replace(/"$/, "").trim()
    
    return cleanText || fallbackReply
  } catch (error: any) {
    console.error("[AI Reply Engine] Failed to generate reply:", error)
    return fallbackReply
  }
}
