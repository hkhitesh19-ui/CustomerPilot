import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Candidate model cascade in priority order
const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest"
]

export interface GenerateAIReviewReplyParams {
  merchantName: string
  locationOrArea: string
  category: string
  customerReview: string
  rating?: number
}

/**
 * Builds rich, industry-aware SEO fallbacks when LLM network calls are unavailable
 */
function buildSeoFallbackReply(params: {
  storeName: string
  location: string
  categoryStr: string
  rating: number
  customerReview?: string
}): string {
  const { storeName, location, categoryStr, rating, customerReview } = params
  const reviewLower = (customerReview || "").toLowerCase()

  // Detect products/flavors mentioned for product mirroring
  let productEcho = ""
  if (reviewLower.includes("red velvet")) productEcho = "red velvet cake"
  else if (reviewLower.includes("chocolate") || reviewLower.includes("truffle")) productEcho = "chocolate truffle"
  else if (reviewLower.includes("pineapple")) productEcho = "fresh pineapple cake"
  else if (reviewLower.includes("pastry") || reviewLower.includes("pastries")) productEcho = "artisanal pastries"
  else if (reviewLower.includes("cake")) productEcho = "fresh cakes"
  else productEcho = categoryStr

  if (rating <= 2) {
    return `Dear Customer, thank you for bringing this to our attention. We at ${storeName}, ${location} take full owner accountability for not meeting your expectations with our ${categoryStr}. Please reach out to us directly on WhatsApp so we can personally make this right for you.`
  } else if (rating === 3) {
    return `Hi! Thank you for sharing your valuable feedback for ${storeName} in ${location}. We truly appreciate your honest thoughts about our ${productEcho || categoryStr}. We are continuously perfecting our recipes and service to make your next visit a complete 5-star experience!`
  } else if (rating === 4) {
    return `Thank you so much for your wonderful review! ❤️ We are so glad you enjoyed our ${productEcho || categoryStr} at ${storeName}, ${location}. We're committed to being the best ${categoryStr} in ${location} and would love to know how we can earn that 5th star on your next visit!`
  } else {
    return `Dhanyawad for such a lovely 5-star review! ❤️ We are thrilled that you loved our ${productEcho || categoryStr} and service. At ${storeName}, delivering the freshest, highest quality ${categoryStr} in ${location} is our greatest passion. We warmly look forward to welcoming you back soon!`
  }
}

/**
 * Generates an SEO Keyword-Optimized Owner Auto-Reply using Gemini AI
 */
export async function generateAIReviewReply(params: GenerateAIReviewReplyParams): Promise<string> {
  const storeName = params.merchantName || "Cake Connection"
  const location = params.locationOrArea || "Vadodara"
  const categoryStr = params.category || "fresh cakes and bakery items"
  const rating = params.rating ?? 5
  const customerReview = params.customerReview || "Great experience and quality!"

  const fallbackReply = buildSeoFallbackReply({
    storeName,
    location,
    categoryStr,
    rating,
    customerReview
  })

  if (!process.env.GEMINI_API_KEY) {
    return fallbackReply
  }

  // Construct Local SEO Keyword Strategy Prompt
  let sentimentGuidance = ""
  if (rating <= 2) {
    sentimentGuidance = `
RATING: ${rating}/5 Stars (CRITICAL / UNHAPPY CUSTOMER)
TONE: Empathetic, deeply humble, professional, accountable, and resolution-focused.
RULES:
1. Sincerely apologize as the store owner without making defensive excuses.
2. Acknowledge the specific pain point mentioned in the review (e.g. taste, delay, packaging, service).
3. Naturally embed Brand Name "${storeName}" and Location "${location}" for brand protection and local presence.
4. Invite them to connect directly via WhatsApp/Phone with the store owner to make things right immediately. Never argue.`
  } else if (rating === 3) {
    sentimentGuidance = `
RATING: 3/5 Stars (MODERATE / CONSTRUCTIVE FEEDBACK)
TONE: Balanced, appreciative, humble, and growth-oriented.
RULES:
1. Express genuine gratitude for the honest feedback and address the specific points they highlighted.
2. Embed Brand Name "${storeName}", Location "${location}", and product category (${categoryStr}) naturally for Google Local SEO.
3. Express genuine commitment to turning their next visit into a 100% 5-star experience.`
  } else if (rating === 4) {
    sentimentGuidance = `
RATING: 4/5 Stars (SATISFIED CUSTOMER — OPPORTUNITY FOR 5-STAR ADVOCATE)
TONE: Warm, appreciative, hospitable, and attentive.
RULES:
1. Express heartfelt thanks for their high praise and highlight the specific items they enjoyed.
2. Maximize Local SEO by naturally weaving in "${storeName}", Location "${location}", and keywords like "best ${categoryStr} in ${location}".
3. Express enthusiasm to make their next visit even better, inviting them back soon.`
  } else {
    sentimentGuidance = `
RATING: 5/5 Stars (DELIGHTED CUSTOMER / MAXIMUM SEO OPPORTUNITY)
TONE: Celebratory, genuinely hospitable ("Dhanyawad / Thank you ❤️"), and proud.
RULES:
1. Express genuine delight for their compliments, echoing the exact items or qualities praised (e.g. freshness, softness, packaging, specific flavors).
2. LOCAL SEO OPTIMIZATION: Naturally weave in:
   - Business Name: "${storeName}"
   - Location / Area: "${location}"
   - High-Intent Local Keywords: "best ${categoryStr} in ${location}", "fresh ${categoryStr}"
3. RECOMMENDATION HOOK: Gently suggest a popular item or specialty for their next visit.
4. Warmly invite them back to visit.`
  }

  const prompt = `Act as the warm, proud, professional owner of "${storeName}" located in "${location}". 
Respond to this Google Maps customer review. Your response will be published on Google Business Profile to boost Local 3-Pack SEO rankings and build customer loyalty.

CUSTOMER REVIEW (${rating}/5 Stars): "${customerReview}"
BUSINESS CATEGORY: ${categoryStr}
LOCATION / CITY: ${location}

${sentimentGuidance}

STRICT CONSTRAINTS:
- Length: 2 to 4 sentences (45-75 words). Concise, human, conversational.
- Incorporate Local SEO keywords naturally without keyword stuffing or robotic language.
- Echo specific products/flavors mentioned by the customer.
- Output ONLY the final reply text. Do NOT include markdown quotes, introductory labels like "Response:", or quotation marks.`

  // Execute with multi-model cascade
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()

      const cleanText = text
        .replace(/^(Here is a draft|Sure|Here's a response|Owner response):/i, "")
        .replace(/^"/, "")
        .replace(/"$/, "")
        .trim()

      if (cleanText) {
        return cleanText
      }
    } catch (modelError: any) {
      console.warn(`[AI Reply Engine] Model ${modelName} unavailable (${modelError?.message}). Trying next candidate...`)
    }
  }

  console.error("[AI Reply Engine] All Gemini model candidates failed. Using SEO fallback.")
  return fallbackReply
}
