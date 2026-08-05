import { GoogleGenerativeAI } from "@google/generative-ai"
import { db } from "@/lib/db"
import { ReviewEditor } from "@/components/review/ReviewEditor"

export const dynamic = "force-dynamic"

// Basic fallback draft if AI fails
const FALLBACK_DRAFT = "The products were fresh, beautiful, and absolutely delicious. Highly recommended!"

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const customerId = typeof params.c === 'string' ? params.c : undefined
  const merchantId = typeof params.m === 'string' ? params.m : undefined

  if (!customerId || !merchantId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="text-slate-400">Invalid Review Link.</div>
      </div>
    )
  }

  const merchant = await db.merchant.findUnique({
    where: { id: merchantId }
  })

  const googleConnection = await db.merchantGoogleConnection.findUnique({
    where: { merchantId: merchantId }
  })

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: { bills: { orderBy: { createdAt: 'desc' }, take: 5 } }
  })

  if (!merchant || !customer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="text-slate-400">Store or Customer not found.</div>
      </div>
    )
  }

  // Extract actual purchased product from customer bills
  let productName = ""
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
  let dynamicDraft = FALLBACK_DRAFT
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
      dynamicDraft = response.text().trim().replace(/^["']|["']$/g, '')
    }
  } catch (error) {
    console.error("AI Generation failed, using fallback:", error)
  }

  let googlePlaceId: string | null = googleConnection?.placeId || null
  let googleReviewLink: string | null = googleConnection?.googleReviewUrl || null

  if (googlePlaceId === "manual_url") {
    googleReviewLink = googleConnection?.address || googleConnection?.googleReviewUrl || null
    googlePlaceId = null
  }

  // Fetch existing review if customer already posted previously
  const existingReview = await db.review.findFirst({
    where: { merchantId, customerId },
    orderBy: { createdAt: "desc" }
  })
  const existingReviewText = existingReview?.finalText || existingReview?.aiDraft || null
  
  return (
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
        id: customer.id,
        name: customer.name
      }} 
    />
  )
}
// Force rebuild 2
