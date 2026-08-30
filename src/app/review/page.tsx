import { GoogleGenerativeAI } from "@google/generative-ai"
import { db } from "@/lib/db"
import { ReviewEditor } from "@/components/review/ReviewEditor"

export const dynamic = "force-dynamic"

function getSmartFallbackReview(bizName: string, category: string, city: string, product: string): string {
  const item = product ? product : (category.toLowerCase().includes('cake') || category.toLowerCase().includes('bakery') ? 'cake' : 'order')
  const templates = [
    `Ordered ${product ? product : 'from ' + bizName} in ${city} and really loved the quality! The sponge was very soft, fresh, and perfectly balanced in sweetness. Good service and packaging. Definitely a great bakery in ${city}.`,
    `Tried ${bizName} in ${city} and had a wonderful experience. The ${item} was super fresh, delicious, and beautifully presented. Staff was polite and the overall service was smooth. Highly recommended cake shop in ${city}!`,
    `Great experience with ${bizName} in ${city}! The ${item} was very fresh with authentic taste and great texture. If you are looking for a reliable bakery in ${city}, this place is a solid option.`,
    `Very satisfied with my purchase from ${bizName}, ${city}. The ${item} was fresh, flavorful, and packed neatly. Excellent quality and friendly customer service. One of the best places for cakes in ${city}!`
  ]
  const randomIndex = Math.floor(Math.random() * templates.length)
  return templates[randomIndex]
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const customerId = typeof params.c === 'string' ? params.c : undefined
  const merchantId = typeof params.m === 'string' ? params.m : undefined

  if (!merchantId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="text-slate-400">Invalid Review Link. Merchant ID is required.</div>
      </div>
    )
  }

  const merchant = await db.merchant.findUnique({
    where: { id: merchantId }
  })

  if (!merchant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="text-slate-400">Store not found. Please verify the QR code.</div>
      </div>
    )
  }

  const googleConnection = await db.merchantGoogleConnection.findUnique({
    where: { merchantId: merchantId }
  })

  const customer = customerId
    ? await db.customer.findUnique({
        where: { id: customerId },
        include: { bills: { orderBy: { createdAt: 'desc' }, take: 5 } }
      })
    : null

  // Extract actual purchased product from customer bills if available
  let productName = ""
  if (customer) {
    for (const bill of customer.bills || []) {
      if (bill.notes) {
        const match = bill.notes.match(/Product:\s*([^|]+)/i)
        if (match && match[1]?.trim()) {
          productName = match[1].trim()
          break
        } else if (!bill.notes.includes("Visit #") && !bill.notes.includes("Approved by")) {
          productName = bill.notes.trim()
          break
        }
      }
  }

  const city = merchant.address?.split(',').pop()?.trim() || "Vadodara"
  const businessCategory = merchant.category?.trim() || merchant.businessType || "Cake Shop"
  const cleanBizName = (merchant.name || "Cake Connection").trim()

  // Generate dynamic AI draft using Gemini with Strict Indian Review Prompt
  const smartFallback = getSmartFallbackReview(cleanBizName, businessCategory, city, productName)
  let dynamicDraft = smartFallback
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        generationConfig: { temperature: 0.85 }
      })
      
      const prompt = `Act as a real Indian customer writing a genuine Google review.

Business Details:
- Business Name: ${cleanBizName}
- Category: ${businessCategory}
- City: ${city}
- Purchased Product/Service: ${productName}

Write a natural 3-4 lines Google review in simple Indian English.

STRICT RULES

1. NEVER invent or assume any fact.
   - Mention the purchased product/service ONLY if [Product/Service Name] is provided.
   - If it is empty, never guess any product or service. Mention only the business category naturally.

2. Never mention any incorrect product, flavour, service, staff member, offer, price, event, visit history, or experience.

3. Never use relative time references such as:
   - today
   - yesterday
   - recently
   - last week
   - first visit
   - second visit
   - again
   - this time
   unless explicitly provided.

4. Write only from the customer's experience.

5. Keep the tone completely human, casual and believable.
   Never sound like an advertisement.

6. Naturally mention BOTH:
   - ${cleanBizName}
   - ${city}

7. Improve local SEO naturally by using ONE OR TWO relevant local search phrases in every review.

Examples (DO NOT always use these):
- cake shop in ${city}
- birthday cake in ${city}
- custom cake in ${city}
- fresh cakes in ${city}
- designer cakes in ${city}
- anniversary cake in ${city}
- bakery in ${city}
- dessert shop in ${city}
- pastry shop in ${city}
- online cake delivery in ${city}
- same day cake delivery in ${city}
- celebration cakes in ${city}
- delicious cakes in ${city}

8. IMPORTANT:
Rotate SEO keywords naturally.
Do NOT repeatedly use the same keyword combination.
Generate different keyword variations every time depending on the review context.

9. Mention only ONE SEO phrase naturally.
Occasionally use TWO if it fits naturally.
Never stuff keywords.

10. Vary every review by changing:
- sentence structure
- opening sentence
- vocabulary
- review angle
- writing style
- ending
- SEO keyword used

11. Focus naturally on one or more:
- product quality
- freshness
- taste
- service
- staff behaviour
- packaging
- cleanliness
- value for money
- overall experience

12. Avoid AI-style and marketing phrases such as:
- Best in the city
- World class
- Premium experience
- Outstanding
- Highly recommended to everyone
- Number one
- Perfect in every way
unless they naturally fit the customer's experience.

13. Every review must look completely human-written and unique.
Avoid repeated sentence patterns across multiple generations.

Output ONLY the review text.`
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const generatedText = response.text().trim().replace(/^["']|["']$/g, '')
      if (generatedText && generatedText.length > 20) {
        dynamicDraft = generatedText
      }
    }
  } catch (error) {
    console.warn("[ReviewPage] Gemini AI unavailable (rate limit or network), using fallback draft.", error)
  }

  let googlePlaceId: string | null = googleConnection?.placeId || null
  let googleReviewLink: string | null = googleConnection?.googleReviewUrl || null

  if (googlePlaceId === "manual_url") {
    googleReviewLink = googleConnection?.address || googleConnection?.googleReviewUrl || null
    googlePlaceId = null
  }

  // Fetch existing review if customer already posted previously
  const existingReview = customerId
    ? await db.review.findFirst({
        where: { merchantId, customerId },
        orderBy: { createdAt: "desc" }
      })
    : null
  const existingReviewText = existingReview?.finalText || existingReview?.aiDraft || null
  
  return (
    <>
    <ReviewEditor 
      initialDraft={dynamicDraft}
      existingReviewText={existingReviewText}
      merchant={{
        id: merchant.id,
        name: merchant.name,
        logoUrl: merchant.logoUrl,
        googleReviewLink: googleReviewLink,
        googlePlaceId: googlePlaceId
      }} 
      customer={{
        id: customer?.id || "",
        name: customer?.name || "VIP"
      }} 
    />
    <div className="mt-6 pt-4 border-t border-slate-200/20 text-center space-y-1">
      <p className="text-[10px] text-slate-500">
        Powered by <a href="/for-business" className="text-indigo-400 hover:text-indigo-300 font-semibold">CustomerPilot</a> 🚀
      </p>
      <p className="text-[9px] text-slate-600">
        <a href="/for-business" className="hover:text-slate-400 transition-colors">Want this for your business?</a>
      </p>
    </div>
    </>
  )
}
// Force rebuild 2
