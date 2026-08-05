import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generateAIReviewReply(params: {
  merchantName: string
  locationOrArea: string
  category: string
  customerReview: string
}): Promise<string> {
  // Wait, if no key, just return a fallback text (to avoid crashes in demo mode)
  if (!process.env.GEMINI_API_KEY) {
    return "Thank you so much for your kind words! We look forward to serving you again."
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })
    
    const prompt = `Act as a warm, humble, genuine Indian business owner of ${params.merchantName} in ${params.locationOrArea} responding to a customer's Google review. 
Customer Review: "${params.customerReview}"
Category: ${params.category}

Draft a 2-3 line appreciative, warm, human-like owner reply in simple natural Indian English. Naturally mention the business name and express genuine gratitude. Keep it short, personal, and polite. Never sound like a generic robot or copy-paste template. Output ONLY the reply text.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    // Remove any conversational intro the AI might generate like "Here is a draft:"
    const cleanText = text.replace(/^(Here is a draft|Sure|Here's a response):/i, "").replace(/^"/, "").replace(/"$/, "").trim()
    
    return cleanText
  } catch (error: any) {
    console.error("[AI Reply Engine] Failed to generate reply:", error)
    return "Thank you for the amazing review! It means a lot to us."
  }
}
