import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generateAIReviewReply(params: {
  merchantName: string
  locationOrArea: string
  category: string
  customerReview: string
}): Promise<string> {
  const storeName = params.merchantName || "Cake Connection"
  const location = params.locationOrArea || "Vadodara"
  const categoryStr = params.category || "fresh cakes and bakery items"

  // SEO-Rich fallback if Gemini API is unavailable or rate-limited
  const seoFallback = `Thank you so much for your wonderful 5-star review of ${storeName} in ${location}! We are thrilled that you loved our ${categoryStr}. Looking forward to serving you again soon!`

  if (!process.env.GEMINI_API_KEY) {
    return seoFallback
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })
    
    const prompt = `Act as a warm, humble, genuine Indian business owner of ${storeName} located in ${location} responding to a customer's 5-star Google review.

Customer Review: "${params.customerReview}"
Category: ${categoryStr}

CRITICAL SEO & BRANDING RULES FOR OWNER REPLY:
1. Must naturally include the Merchant Name: "${storeName}"
2. Must naturally include the Location/City/Area: "${location}"
3. Must naturally mention primary product keywords (e.g., fresh cakes, bakery, sweets, desserts) suitable for ${categoryStr}
4. Tone: Warm, humble Indian hospitality ("Dhanyawad / Thank you ❤️").
5. Length: 2-3 short, impactful sentences (40-70 words).
6. Output ONLY the reply text, no quotes, no extra headings.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    // Remove any conversational intro the AI might generate
    const cleanText = text.replace(/^(Here is a draft|Sure|Here's a response):/i, "").replace(/^"/, "").replace(/"$/, "").trim()
    
    return cleanText || seoFallback
  } catch (error: any) {
    console.error("[AI Reply Engine] Failed to generate reply:", error)
    return seoFallback
  }
}
