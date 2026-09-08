import { GoogleGenerativeAI } from "@google/generative-ai"
import { db } from "@/lib/db"
import { ReviewEditor } from "@/components/review/ReviewEditor"

export const dynamic = "force-dynamic"

function getSmartFallbackReview(category: string, product: string): { draft1: string; draft2: string } {
  const hasItem = Boolean(product && product.trim())
  const item = hasItem ? product.trim() : (category.toLowerCase().includes('cake') || category.toLowerCase().includes('bakery') ? 'pastry' : 'order')
  
  const draft1Templates = [
    hasItem
      ? `Tried the ${item} today. Honestly super fresh, texture was spot on and sweetness was perfectly balanced!`
      : `Picked up some items earlier today. Super fresh quality, loved the taste. Totally worth it.`,
    hasItem
      ? `Got the ${item} yesterday for evening. Really good taste and soft texture, family loved it.`
      : `Tried their specialty today. Badiya taste tha, really fresh and authentic.`,
  ]

  const draft2Templates = [
    hasItem
      ? `Quick service and very neat packaging for the ${item}. Clean setup and courteous staff!`
      : `Smooth experience and very neat packaging. Fast counter service, totally hassle-free.`,
    hasItem
      ? `Ordered ${item} — packaging was completely intact and service was super quick. Good experience.`
      : `Prompt service and clean packaging. Baki taste bhi badiya tha, will visit again.`
  ]

  const d1 = draft1Templates[Math.floor(Math.random() * draft1Templates.length)]
  const d2 = draft2Templates[Math.floor(Math.random() * draft2Templates.length)]

  return { draft1: d1, draft2: d2 }
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
  }

  const businessCategory = merchant.category?.trim() || merchant.businessType || "Retail Store"

  // Generate dynamic AI draft using Gemini with Anti-Detection Multi-Option Prompt
  const smartFallback = getSmartFallbackReview(businessCategory, productName)
  let dynamicDraft = smartFallback.draft1
  let draftOptions: { draft1: string; draft2: string } | null = smartFallback

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey)
      
      const prompt = `[ROLE & OBJECTIVE]
You are an advanced, anti-detection consumer review drafting engine. Your job is to convert real transaction data provided by a customer into 2 distinctly styled, authentic, and high-converting Google Maps reviews (1 to 3 sentences maximum each). 

The generated drafts must completely bypass Google's spam/NLP filters, trigger Google Local Justifications (SEO-rich entity matching), and read 100% like an authentic, spontaneous mobile message typed by an everyday Indian customer.

[INPUT VARIABLES]
- Business Category: ${businessCategory}
- Purchased Item/Service: ${productName}

[SECTION 1: LOCAL SEO & ENTITY OPTIMIZATION (THE RANKING MULTIPLIER)]
1. NATURAL ENTITY ANCHORING: If ${productName} is provided, seamlessly integrate it into the text. Google's algorithm scans reviews for exact product/service entities to display "Sold here" or "Mentioned in reviews" search justifications.
2. CATEGORY FALLBACK: If ${productName} is empty, anchor the text around the core experience of ${businessCategory} without guessing specific items.
3. NO FORCED FOOTPRINTS: 
   - NEVER force the business name into the review.
   - NEVER force the city name into the review (e.g., do NOT write "best bakery in Vadodara"). Google Maps already knows the exact location; repeating it creates an artificial footprint that triggers AI review audits.

[SECTION 2: HUMANIZER & ANTI-AI DETECTION PROTOCOL]
1. HIGH BURSTINESS (Irregular Sentence Cadence): Never write uniform sentences. Pair an ultra-short sentence fragment (2-4 words) with a slightly longer conversational clause (8-14 words).
   - Unnatural / AI: "The pastry was very fresh. The service was also quite good. I really liked the packaging."
   - Natural / Human: "Tried the truffle pastry today. Honestly super fresh, and packing bhi ekdum intact thi."
2. PERPLEXITY INJECTION (Unpredictable Spoken Tokens): Completely avoid sterile, textbook transition words ("Moreover", "Additionally", "Furthermore", "Overall"). Use colloquial, spoken Indian English/Hinglish connectors ("Honestly", "Also", "To be fair", "Baki", "Taste-wise").
3. CASUAL IMPERFECTIONS (Micro-Stylistics):
   - Natural Ellipsis: Drop formal grammatical subjects where natural (e.g., write "Loved the texture" instead of "I really loved the texture").
   - Punctuation: Use conversational punctuation (simple hyphens, a single exclamation mark, or casual commas). Strictly ban semicolons (;) and formal em-dashes (—).
   - Natural Slang/Hinglish: Blend everyday spoken phrases naturally (e.g., "spot on", "badiya", "super fresh", "clean setup").
4. TEMPORAL ANCHORS: Freely allow natural time markers ("today", "yesterday", "got this for evening") to mimic authentic mobile behavior.

[SECTION 3: STRICT NEGATIVE CONSTRAINTS & POLICY GUARDRAILS]
1. ZERO HALLUCINATION: Never invent staff names, prices, discounts, delivery timelines, or specific store decor not provided in the input.
2. ABSOLUTE BAN ON MARKETING CLICHÉS: The following phrases immediately trigger spam filters and are strictly forbidden:
   - "hidden gem"
   - "exceeded expectations"
   - "top-notch"
   - "must visit"
   - "highly recommend"
   - "best in town / best in the city"
   - "world class"
   - "plethora"
   - "masterpiece"
3. STRICT LENGTH LIMIT: Every individual draft must stay strictly between 15 and 40 words. Real customers do not write essays.

[SECTION 4: DYNAMIC MULTI-OPTION MATRIX]
Generate exactly 2 diverse drafts catering to different psychological angles:
- Draft 1 (Product & Sensory Focus): Focuses directly on the item's texture, taste, build, freshness, or direct quality.
- Draft 2 (Operational & Speed Focus OR Raw Short Remark): Focuses on quick service, neat packaging, or an ultra-short casual remark.

[OUTPUT FORMAT]
Return ONLY a valid, parseable JSON object with zero additional conversational filler, Markdown headings, or explanations outside the JSON:
{
  "draft_1": "String",
  "draft_2": "String"
}`

      let responseText = ""
      const candidates = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"]
      for (const modelName of candidates) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { temperature: 0.85 }
          })
          const result = await model.generateContent(prompt)
          const response = await result.response
          responseText = response.text().trim()
          if (responseText && responseText.includes("{")) break
        } catch (_) {
          continue
        }
      }

      if (responseText) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            if (parsed.draft_1 && parsed.draft_2) {
              dynamicDraft = parsed.draft_1.trim()
              draftOptions = {
                draft1: parsed.draft_1.trim(),
                draft2: parsed.draft_2.trim()
              }
            } else if (parsed.draft_1) {
              dynamicDraft = parsed.draft_1.trim()
              draftOptions = {
                draft1: parsed.draft_1.trim(),
                draft2: smartFallback.draft2
              }
            }
          } catch (jsonErr) {
            console.warn("[ReviewPage] Failed to parse JSON draft from Gemini:", jsonErr)
          }
        }
      }
    }
  } catch (error) {
    console.warn("[ReviewPage] Gemini AI unavailable, using smart fallback drafts.", error)
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
  // Fetch active stamp card configuration to display exact bonus stamps
  const stampCard = await db.stampCard.findFirst({
    where: { merchantId, active: true }
  })
  const googleReviewBonus = stampCard?.googleReviewBonus ?? 1
  const photoBonus = stampCard?.photoBonus ?? 2
  const existingReviewText = existingReview?.finalText || existingReview?.aiDraft || null
  const hasPreviousPhoto = !!(existingReview?.photoUrl)
  
  return (
    <>
    <ReviewEditor 
      initialDraft={dynamicDraft}
      draftOptions={draftOptions}
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
      bonusInfo={{
        googleReviewBonus,
        photoBonus,
        hasPreviousPhoto,
        rewardName: stampCard?.rewardName || "FREE Reward",
        stampsRequired: stampCard?.stampsRequired || 10
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
