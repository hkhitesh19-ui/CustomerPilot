import { GoogleGenerativeAI } from "@google/generative-ai"

/**
 * Returns a clean, short brand name without long directory suffixes or keyword stuffing.
 * e.g., "Cake Connection-Live Cake : Online Cake Delivery in Vadodara" -> "Cake Connection"
 */
export function getCleanMerchantName(rawName?: string | null): string {
  if (!rawName) return "Cake Connection"
  // Specific override for Cake Connection
  if (/cake\s*connection/i.test(rawName)) {
    return "Cake Connection"
  }
  // Strip descriptors after -, :, |, (, [
  const clean = rawName.split(/[-–—:|(\[]/)[0].trim()
  return clean || rawName.trim()
}

/**
 * Extracts a clean first name from the Google reviewer's display name.
 */
export function extractCustomerFirstName(fullName?: string | null): string {
  if (!fullName) return ""
  const trimmed = fullName.trim()
  if (!trimmed || /google user|customer|guest|anonymous|local guide/i.test(trimmed)) {
    return ""
  }
  const first = trimmed.split(/\s+/)[0]
  const clean = first.replace(/[^a-zA-Z]/g, "")
  return clean || trimmed
}

// Diverse, high-intent Local SEO keywords for bakery / cake shops in Vadodara
export const VADODARA_CAKE_SEO_KEYWORDS = [
  "customized designer cakes in Vadodara",
  "fresh customized wedding cakes in Vadodara",
  "custom birthday celebration cakes in Vadodara",
  "fresh eggless cakes and pastries in Vadodara",
  "live fresh baking in Manjalpur Vadodara",
  "delicious handcrafted cakes in Vadodara",
  "best cake shop in Manjalpur Vadodara",
  "on-time cake delivery in Vadodara",
  "special occasion custom cakes in Vadodara",
  "pure veg fresh bakery in Vadodara",
  "custom theme cakes in Vadodara",
  "rich chocolate truffle cakes in Vadodara",
  "budget-friendly customized cakes in Vadodara",
  "fresh celebration desserts in Vadodara"
]

/**
 * Returns 3 distinct rotating SEO keywords derived deterministically or pseudo-randomly
 * so consecutive reviews and alternative drafts never repeat the same keyword chain.
 */
export function getRotatingSeoKeywords(seedStr?: string): [string, string, string] {
  const pool = [...VADODARA_CAKE_SEO_KEYWORDS]
  let seed = 0
  if (seedStr) {
    for (let i = 0; i < seedStr.length; i++) {
      seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0
    }
  } else {
    seed = Math.floor(Math.random() * 10000)
  }
  const idx1 = seed % pool.length
  let idx2 = (seed + 3) % pool.length
  if (idx2 === idx1) idx2 = (idx2 + 1) % pool.length
  let idx3 = (seed + 7) % pool.length
  if (idx3 === idx1 || idx3 === idx2) idx3 = (idx3 + 2) % pool.length
  return [pool[idx1], pool[idx2], pool[idx3]]
}

export interface GenerateAIReviewReplyParams {
  merchantName?: string
  locationOrArea?: string
  category?: string
  customerReview: string
  rating?: number
  reviewerName?: string
}

export interface AIReviewReplyDrafts {
  draft1: string
  draft2: string
  draft3: string
  keywords: string[]
}

/**
 * Builds rich, personalized, non-robotic rule-based drafts addressing the customer by name,
 * echoing their exact product/experience, using the short clean store name, and embedding rotating SEO keywords.
 */
export function buildPersonalizedRuleBasedDrafts(params: {
  storeName: string
  location: string
  categoryStr: string
  rating: number
  customerReview?: string
  reviewerName?: string
}): AIReviewReplyDrafts {
  const { storeName, rating, customerReview = "", reviewerName } = params
  const firstName = extractCustomerFirstName(reviewerName)
  const nameSalutation = firstName ? `${firstName}` : "Valued Customer"
  const rev = (customerReview || "").toLowerCase()

  // Detect specific product
  let product = "fresh cake"
  if (rev.includes("wedding cake") || rev.includes("marriage cake")) product = "customized wedding cake"
  else if (rev.includes("birthday")) product = "birthday cake"
  else if (rev.includes("chocolate") || rev.includes("truffle") || rev.includes("dutch")) product = "chocolate truffle cake"
  else if (rev.includes("red velvet")) product = "red velvet cake"
  else if (rev.includes("pineapple")) product = "fresh pineapple cake"
  else if (rev.includes("black forest")) product = "black forest cake"
  else if (rev.includes("blueberry")) product = "blueberry cake"
  else if (rev.includes("cookie") || rev.includes("cookies")) product = "freshly baked cookies"
  else if (rev.includes("pastry") || rev.includes("pastries")) product = "artisanal pastries"
  else if (rev.includes("donut") || rev.includes("doughnut")) product = "fresh donuts"
  else if (rev.includes("custom")) product = "customized cake"

  // Detect specific experiences
  const hasOnTimeDelivery = rev.includes("on time") || rev.includes("delivered") || rev.includes("delivery") || rev.includes("venue")
  const hasFriendly = rev.includes("friendly") || rev.includes("polite") || rev.includes("staff") || rev.includes("service")
  const hasBudget = rev.includes("budget") || rev.includes("reasonable") || rev.includes("price") || rev.includes("pricing")
  const hasFresh = rev.includes("fresh") || rev.includes("soft") || rev.includes("taste") || rev.includes("tasty") || rev.includes("delicious")

  const [kw1, kw2, kw3] = getRotatingSeoKeywords((reviewerName || "") + customerReview)

  if (rating <= 2) {
    return {
      draft1: `Dear ${nameSalutation}, thank you for bringing this to our attention. We at ${storeName} take full owner responsibility for not meeting your expectations with our ${product}. Please reach out to us directly on WhatsApp so we can personally make this right for you immediately.`,
      draft2: `Hi ${nameSalutation}, we sincerely apologize for your experience with ${storeName}. Quality and complete customer satisfaction are our highest priorities, and we regret falling short. Please contact us directly so we can understand what happened and resolve this for you.`,
      draft3: `Dear ${nameSalutation}, thank you for your candid feedback. We are deeply sorry that your experience with our ${product} did not meet our usual standards. We invite you to message us directly on WhatsApp so our management can make things right.`,
      keywords: [kw1, kw2, kw3]
    }
  }

  // ─── Draft 1: Warm & Personal Experience Focus ───
  let d1Exp = `loved our ${product}`
  if (hasOnTimeDelivery && hasFresh) {
    d1Exp = `your ${product} was fresh, delicious, and safely delivered on time to the venue`
  } else if (hasOnTimeDelivery) {
    d1Exp = `your ${product} was delivered right on time and in perfect condition`
  } else if (hasFresh) {
    d1Exp = `our fresh live baking and soft ${product} made your celebration so special`
  }
  const draft1 = `Dear ${nameSalutation}, thank you so much for this wonderful 5-star review! 🥰 We are delighted to hear that ${d1Exp}. Crafting ${kw1} that create joyful memories${hasBudget ? " within budget" : ""} is our greatest passion at ${storeName}. We warmly look forward to baking for you again soon! ✨`

  // ─── Draft 2: Professional & Quality Craftsmanship Focus ───
  let d2Exp = `our quality standards and fresh baking hit the mark`
  if (hasFriendly && hasOnTimeDelivery) {
    d2Exp = `our team was polite and your ${product} arrived right on time at the venue`
  } else if (hasFriendly) {
    d2Exp = `our friendly counter service made your ordering experience smooth and pleasant`
  }
  const draft2 = `Hi ${nameSalutation}, thank you for choosing ${storeName} for your celebration! ❤️ We're thrilled that ${d2Exp} and that you enjoyed our ${product}. Delivering the freshest ${kw2} with dependable on-time service is what we strive for every single day. See you again soon!`

  // ─── Draft 3: Celebratory & Joyful Focus ───
  let d3Exp = `making your celebration extra sweet`
  if (rev.includes("friend")) {
    d3Exp = `baking that special ${product} for your friend`
  } else if (rev.includes("birthday")) {
    d3Exp = `making the birthday celebration so memorable`
  } else if (rev.includes("wedding")) {
    d3Exp = `crafting that special wedding cake`
  }
  const draft3 = `Warmest thanks, ${nameSalutation}! 🎂 It was an absolute pleasure ${d3Exp}! We're so glad you appreciated the fresh taste, pretty design${hasBudget ? ", and budget-friendly pricing" : ""}. Providing top-tier ${kw3} is what we love doing most. Best wishes from the entire team at ${storeName}! 🎉`

  return { draft1, draft2, draft3, keywords: [kw1, kw2, kw3] }
}

/**
 * Generates 3 distinct AI Owner Auto-Reply drafts using Multi-LLM cascade (Gemini -> Groq -> Rule Engine)
 */
export async function generateAIReviewReplyDrafts(params: GenerateAIReviewReplyParams): Promise<AIReviewReplyDrafts> {
  const storeName = getCleanMerchantName(params.merchantName)
  const location = params.locationOrArea || "Vadodara"
  const categoryStr = params.category || "fresh cakes and bakery products"
  const rating = params.rating ?? 5
  const customerReview = params.customerReview || "Great experience and quality!"
  const reviewerName = params.reviewerName || ""
  const firstName = extractCustomerFirstName(reviewerName)
  const [kw1, kw2, kw3] = getRotatingSeoKeywords(reviewerName + customerReview)

  const fallbackDrafts = buildPersonalizedRuleBasedDrafts({
    storeName,
    location,
    categoryStr,
    rating,
    customerReview,
    reviewerName
  })

  // ─── 1. Attempt Gemini Cascade ───
  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey)
      const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]

      const prompt = `Act as the warm, proud owner of "${storeName}" in "${location}".
Generate 3 distinct, high-quality, professional owner reply drafts for this Google Maps review.

REVIEW DETAILS:
- Customer Name: "${reviewerName}" (Address as: "${firstName || 'Valued Customer'}")
- Star Rating: ${rating}/5 Stars
- Customer Review: "${customerReview}"
- Business Category: ${categoryStr}
- Clean Business Name (STRICT): "${storeName}" (DO NOT use long listing titles like "Cake Connection-Live Cake: Online cake delivery in vadodara", strictly use "${storeName}")

ASSIGNED LOCAL SEO KEYWORDS (Use one keyword naturally per draft):
- Draft 1 SEO Keyword: "${kw1}"
- Draft 2 SEO Keyword: "${kw2}"
- Draft 3 SEO Keyword: "${kw3}"

STRICT GUIDELINES:
1. Always address the customer personally by their name (e.g. "Dear ${firstName || 'Valued Customer'},", "Hi ${firstName || 'Valued Customer'},", "Warmest thanks, ${firstName || 'Valued Customer'}!").
2. Contextualize the reply: specifically mention the exact cake, flavor, or service they praised (e.g. customized wedding cake, on-time delivery, friendly staff, budget-friendly).
3. Draft 1 must be warm, personal, and grateful.
4. Draft 2 must be professional, focusing on quality craftsmanship and dependable service.
5. Draft 3 must be celebratory and cheerful.
6. Length: 2 to 3 sentences (35-65 words) each. Natural, conversational, zero robotic spam.
7. Always use "Thank you" or "Thank you so much" to express gratitude. Strictly never use "Dhanyawad".

Return ONLY a valid JSON object matching:
{
  "draft_1": "text of draft 1",
  "draft_2": "text of draft 2",
  "draft_3": "text of draft 3"
}`

      for (const modelName of GEMINI_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName })
          const result = await model.generateContent(prompt)
          const response = await result.response
          const text = response.text().trim()
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            if (parsed.draft_1 && parsed.draft_2 && parsed.draft_3) {
              return {
                draft1: parsed.draft_1.trim(),
                draft2: parsed.draft_2.trim(),
                draft3: parsed.draft_3.trim(),
                keywords: [kw1, kw2, kw3]
              }
            }
          }
        } catch (e: any) {
          console.warn(`[AI Review Reply] Gemini model ${modelName} failed (${e?.message}). Trying next...`)
        }
      }
    } catch (err: any) {
      console.warn("[AI Review Reply] Gemini engine failed:", err?.message)
    }
  }

  // ─── 2. Attempt Groq / OpenAI-compatible LLM ───
  const groqKey = process.env.AI_API_KEY?.trim() || process.env.GROQ_API_KEY?.trim()
  const groqUrl = process.env.AI_API_URL?.trim() || "https://api.groq.com/openai/v1/chat/completions"
  const groqModel = process.env.AI_MODEL?.trim() || "llama-3.3-70b-versatile"

  if (groqKey) {
    try {
      const prompt = `Act as the warm, proud owner of "${storeName}" in "${location}".
Generate 3 distinct, high-quality, professional owner reply drafts for this Google Maps review.

REVIEW DETAILS:
- Customer Name: "${reviewerName}" (Address as: "${firstName || 'Valued Customer'}")
- Star Rating: ${rating}/5 Stars
- Customer Review: "${customerReview}"
- Clean Business Name (STRICT): "${storeName}"

ASSIGNED LOCAL SEO KEYWORDS:
- Draft 1 SEO Keyword: "${kw1}"
- Draft 2 SEO Keyword: "${kw2}"
- Draft 3 SEO Keyword: "${kw3}"

RULES:
1. Address the customer personally by their name ("Dear ${firstName || 'Valued Customer'},", etc.).
2. Mention their exact product and experience (wedding cake, delivery on time, friendly, budget, etc.).
3. Strictly use short store name "${storeName}". Never write long GMB titles.
4. Return ONLY valid JSON:
{
  "draft_1": "text of draft 1",
  "draft_2": "text of draft 2",
  "draft_3": "text of draft 3"
}`

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 4500)

      const res = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: "You generate authentic, warm, SEO-optimized Indian Google review owner replies in strict JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      })
      clearTimeout(timeout)

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content?.trim()
        if (content) {
          const parsed = JSON.parse(content)
          if (parsed.draft_1 && parsed.draft_2 && parsed.draft_3) {
            return {
              draft1: parsed.draft_1.trim(),
              draft2: parsed.draft_2.trim(),
              draft3: parsed.draft_3.trim(),
              keywords: [kw1, kw2, kw3]
            }
          }
        }
      }
    } catch (gErr: any) {
      console.warn("[AI Review Reply] Groq LLM failed:", gErr?.message)
    }
  }

  // ─── 3. Intelligent Rule-Based Personalized Fallback ───
  return fallbackDrafts
}

/**
 * Primary single-reply generator (maintains full backward compatibility)
 */
export async function generateAIReviewReply(params: GenerateAIReviewReplyParams): Promise<string> {
  const drafts = await generateAIReviewReplyDrafts(params)
  return drafts.draft1
}
