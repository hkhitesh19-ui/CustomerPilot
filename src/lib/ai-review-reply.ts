import { GoogleGenerativeAI } from "@google/generative-ai"
import {
  extractCleanJsonFromLlmResponse,
  hasBrokenGrammar,
  normalizeUnicodeHyphens,
  scrubBannedBuzzwords,
} from "./dynamic-review-engine"

export type ReplyCategoryKey =
  | "optical_store"
  | "bakery"
  | "saree_palace"
  | "pet_clinic"
  | "dental_clinic"
  | "beauty_parlour"
  | "restaurant"
  | "salon_men"
  | "car_wash"
  | "saas_agency"
  | "general"

/**
 * Returns a clean, short brand name without long directory suffixes or keyword stuffing.
 * e.g., "Cake Connection-Live Cake : Online Cake Delivery in Vadodara" -> "Cake Connection"
 */
export function getCleanMerchantName(rawName?: string | null): string {
  if (!rawName) return "Cake Connection"
  if (/cake\s*connection/i.test(rawName)) {
    return "Cake Connection"
  }
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

/**
 * Resolves business category strictly without Men's Salon vs Pet Grooming collision.
 */
export function resolveReplyCategory(category?: string, merchantName?: string): ReplyCategoryKey {
  const raw = `${category || ""} ${merchantName || ""}`.toLowerCase()
  if (!raw.trim()) return "general"

  // Men's salon / barber MUST be checked before pet grooming
  if (
    /\b(salon_men|men'?s\s*salon|barber|haircut|beard|fade)\b/i.test(raw) ||
    (/\bsalon\b/i.test(raw) && /\b(men|grooming|gent|unisex)\b/i.test(raw) && !/\b(pet|dog|cat|ladies|beauty\s*parlour)\b/i.test(raw))
  ) {
    return "salon_men"
  }
  if (/\b(optical|optician|eyewear|spectacle|glasses|frame|lens|eye\s*care)\b/i.test(raw)) {
    return "optical_store"
  }
  if (/\b(saree|silk|lehenga|ethnic|boutique|apparel|garment|textile)\b/i.test(raw)) {
    return "saree_palace"
  }
  if (/\b(pet_clinic|vet|veterinary|pet\s*clinic|pet\s*shop|pet\s*grooming|puppy|kitten|dog|cat|animal)\b/i.test(raw)) {
    return "pet_clinic"
  }
  if (/\b(dental|dentist|tooth|teeth|root\s*canal|orthodont|implant)\b/i.test(raw)) {
    return "dental_clinic"
  }
  if (/\b(beauty_parlour|parlour|parlor|ladies\s*beauty|bridal|facial|threading|waxing|manicure|keratin)\b/i.test(raw)) {
    return "beauty_parlour"
  }
  if (/\b(car_wash|car\s*wash|auto\s*detail|detailing|foam\s*wash|ceramic\s*coating|car\s*spa)\b/i.test(raw)) {
    return "car_wash"
  }
  if (/\b(saas_agency|saas|software|crm|agency|technology|digital\s*loyalty|whatsapp\s*wallet|automation)\b/i.test(raw)) {
    return "saas_agency"
  }
  if (/\b(restaurant|dining|kitchen|cafe|bistro|dhaba|thali|biryani|paneer|food)\b/i.test(raw)) {
    return "restaurant"
  }
  if (/\b(bakery|cake|pastry|patisserie|dessert|confection)\b/i.test(raw)) {
    return "bakery"
  }
  return "general"
}

const CATEGORY_SEO_PHRASES: Record<ReplyCategoryKey, string[]> = {
  optical_store: [
    "precision eyewear",
    "comfortable prescription glasses",
    "quality optical frames and lenses",
    "accurate eye testing and eyewear",
    "blue-cut and everyday glasses",
  ],
  bakery: [
    "custom celebration cakes",
    "freshly crafted cakes",
    "handcrafted theme cakes",
    "eggless celebration cakes",
    "freshly prepared cakes",
  ],
  saree_palace: [
    "authentic silk sarees",
    "handpicked bridal and festive sarees",
    "traditional ethnic wear",
    "pure silk and designer sarees",
    "curated festive saree collections",
  ],
  pet_clinic: [
    "gentle veterinary care",
    "compassionate pet checkups",
    "trusted pet healthcare",
    "safe pet vaccinations and care",
    "attentive care for pets",
  ],
  dental_clinic: [
    "comfortable dental care",
    "hygienic dental treatments",
    "gentle dental checkups",
    "modern painless dentistry",
    "patient-first dental care",
  ],
  beauty_parlour: [
    "hygienic beauty and skincare",
    "relaxing parlour services",
    "personalized hair and skin care",
    "gentle beauty treatments",
    "clean and comfortable salon care",
  ],
  restaurant: [
    "freshly prepared meals",
    "warm family dining",
    "authentic flavors and hospitality",
    "hygienic dine-in experience",
    "freshly cooked dishes",
  ],
  salon_men: [
    "precision haircuts and beard styling",
    "clean men's grooming",
    "tailored hair and beard care",
    "hygienic salon grooming",
    "sharp fades and styling",
  ],
  car_wash: [
    "thorough car detailing",
    "spotless foam wash and interior care",
    "careful exterior and interior cleaning",
    "reliable car spa service",
    "clean and shiny car care",
  ],
  saas_agency: [
    "WhatsApp digital loyalty tools",
    "smart customer retention software",
    "automated Google review growth",
    "simple repeat-customer tracking",
    "practical local business software",
  ],
  general: [
    "reliable customer service",
    "quality local service",
    "attentive customer care",
    "trusted service experience",
    "personalized customer support",
  ],
}

const CATEGORY_DEFAULT_NOUN: Record<ReplyCategoryKey, string> = {
  optical_store: "eyewear and eye checkup experience",
  bakery: "custom cake",
  saree_palace: "saree selection",
  pet_clinic: "pet's visit and care",
  dental_clinic: "dental visit",
  beauty_parlour: "salon service",
  restaurant: "meal and dining experience",
  salon_men: "haircut and grooming session",
  car_wash: "car wash and detailing service",
  saas_agency: "software and loyalty setup",
  general: "visit and service",
}

const CATEGORY_FORBIDDEN_LEAK_REGEX: Record<ReplyCategoryKey, RegExp | null> = {
  optical_store: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant|haircut|pet|puppy)\b/i,
  bakery: /\b(haircut|root canal|car wash|saree|veterinary|puppy)\b/i,
  saree_palace: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant|car wash|root canal)\b/i,
  pet_clinic: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant|saree|car wash)\b/i,
  dental_clinic: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant|car wash|saree)\b/i,
  beauty_parlour: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant|car wash|veterinary)\b/i,
  restaurant: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant|haircut|root canal|car wash)\b/i,
  salon_men: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant|pet|puppy|saree)\b/i,
  car_wash: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant|haircut|saree)\b/i,
  saas_agency: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant|haircut|car wash)\b/i,
  general: /\b(cake|bakery|baking|pastry|pastries|wedding cake|eggless|frosting|fondant)\b/i,
}

/**
 * Returns 3 distinct rotating category-scoped SEO keywords (with optional locality if provided).
 */
export function getRotatingSeoKeywords(
  seedStr?: string,
  category?: string,
  locationOrArea?: string,
  merchantName?: string
): [string, string, string] {
  const catKey = resolveReplyCategory(category, merchantName)
  const basePool = CATEGORY_SEO_PHRASES[catKey] || CATEGORY_SEO_PHRASES.general
  const cleanLoc = (locationOrArea || "").trim()
  const pool = cleanLoc
    ? basePool.map((kw, idx) => (idx % 2 === 0 ? `${kw} in ${cleanLoc}` : kw))
    : [...basePool]

  let seed = 0
  if (seedStr) {
    for (let i = 0; i < seedStr.length; i++) {
      seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0
    }
  } else {
    seed = Math.floor(Math.random() * 10000)
  }
  const idx1 = seed % pool.length
  let idx2 = (seed + 2) % pool.length
  if (idx2 === idx1) idx2 = (idx2 + 1) % pool.length
  let idx3 = (seed + 4) % pool.length
  if (idx3 === idx1 || idx3 === idx2) idx3 = (idx3 + 1) % pool.length
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
  engine_used?: "gemini" | "groq" | "tier3_fallback"
  model_used?: string
}

const REPLY_FLUFF_SCRUB = (s: string): string => {
  return scrubBannedBuzzwords(s)
    .replace(/\bstrive for excellence\b/gi, "work hard to serve you well")
    .replace(/\btop[- ]?tier\b/gi, "quality")
    .replace(/\bdelighted to hear that loved\b/gi, "glad to hear you liked")
    .replace(/\bdelighted to hear\b/gi, "glad to hear")
    .replace(/\bthrilled to hear\b/gi, "glad to hear")
    .replace(/\bthrilled that\b/gi, "glad that")
    .replace(/Dhanyawad/gi, "Thank you")
    .replace(/\s+/g, " ")
    .trim()
}

function hasInvalidReplyOutput(
  text: string,
  catKey: ReplyCategoryKey,
  rating: number,
  customerReview: string
): boolean {
  if (!text || text.trim().length < 15) return true
  if (hasBrokenGrammar(text)) return true
  if (/\bthat loved\b/i.test(text)) return true
  if (/dhanyawad/i.test(text)) return true
  // Block hallucinated placeholder phone numbers like 98XXXXXXXX, 98765, 12345
  if (/\b\d*x{4,}\d*\b/i.test(text) || /\b(98765|12345|00000)\b/.test(text)) return true

  // Block cross-category leaks (e.g. cake/bakery in non-bakery)
  const forbidden = CATEGORY_FORBIDDEN_LEAK_REGEX[catKey]
  if (forbidden && forbidden.test(text) && !forbidden.test(customerReview)) {
    return true
  }

  // Block unverified delivery promises unless customer review explicitly mentions delivery
  if (/\b(on[- ]?time\s+cake\s+delivery|doorstep\s+delivery|free\s+delivery)\b/i.test(text) && !/\bdelivery\b/i.test(customerReview)) {
    return true
  }

  // Block cheerful/5-star phrases on 1-3 star negative/neutral reviews
  if (rating <= 3) {
    if (/\b(delighted|thrilled|glad you loved|wonderful 5-star|5-star review|looking forward to baking|extra sweet)\b/i.test(text) || /🎂|🎉|🥰/.test(text)) {
      return true
    }
  }

  return false
}

function extractReviewTopicNoun(customerReview: string, catKey: ReplyCategoryKey): string {
  const rev = normalizeUnicodeHyphens(customerReview || "").toLowerCase()
  const patterns: Array<[RegExp, string]> = [
    [/blue[- ]?cut/i, "blue-cut glasses"],
    [/progressive|bifocal/i, "progressive lenses"],
    [/sunglass/i, "sunglasses"],
    [/eye\s*(?:test|check)/i, "eye checkup"],
    [/frame/i, "eyewear frames"],
    [/truffle/i, "chocolate truffle cake"],
    [/fruit\s*(?:cake|gateau)/i, "fresh fruit cake"],
    [/wedding\s*cake/i, "customized wedding cake"],
    [/birthday/i, "birthday cake"],
    [/kanjivaram/i, "Kanjivaram silk saree"],
    [/banarasi/i, "Banarasi saree"],
    [/lehenga/i, "bridal lehenga"],
    [/saree/i, "saree"],
    [/vaccination|deworming/i, "pet vaccination and checkup"],
    [/allergy|skin/i, "skin care treatment"],
    [/puppy/i, "puppy's care"],
    [/kitten|cat/i, "cat's care"],
    [/root\s*canal/i, "root canal treatment"],
    [/scaling|cleaning/i, "dental cleaning"],
    [/braces|aligner/i, "orthodontic care"],
    [/threading/i, "eyebrow threading"],
    [/facial|cleanup/i, "facial session"],
    [/keratin|hair\s*spa/i, "hair spa treatment"],
    [/skin\s*fade|fade/i, "skin fade haircut"],
    [/beard/i, "beard styling"],
    [/haircut/i, "haircut"],
    [/snow\s*foam|foam\s*wash/i, "snow foam wash"],
    [/interior|vacuum/i, "interior cleaning"],
    [/ceramic/i, "ceramic detailing"],
    [/loyalty\s*wallet|whatsapp|stamp/i, "WhatsApp loyalty wallet"],
    [/review|qr/i, "review automation setup"],
    [/dal\s*makhani|naan|paneer|thali|biryani/i, "meal"],
  ]
  for (const [re, label] of patterns) {
    if (re.test(rev)) return label
  }
  return CATEGORY_DEFAULT_NOUN[catKey]
}

/**
 * Builds rating-aware, category-isolated, non-robotic owner reply drafts.
 */
export function buildPersonalizedRuleBasedDrafts(params: {
  storeName: string
  location: string
  categoryStr: string
  rating: number
  customerReview?: string
  reviewerName?: string
}): AIReviewReplyDrafts {
  const { storeName, location, categoryStr, rating, customerReview = "", reviewerName } = params
  const catKey = resolveReplyCategory(categoryStr, storeName)
  const firstName = extractCustomerFirstName(reviewerName)
  const nameSalutation = firstName || "Valued Customer"
  const topic = extractReviewTopicNoun(customerReview, catKey)
  const locPhrase = location?.trim() ? ` in ${location.trim()}` : ""

  const [kw1, kw2, kw3] = getRotatingSeoKeywords(
    (reviewerName || "") + customerReview,
    categoryStr,
    location,
    storeName
  )

  // 1★–3★ Negative / Issue Reviews: Calm empathy + sincere apology + ZERO SEO stuffing + offline resolution
  if (rating <= 3) {
    return {
      draft1: `Dear ${nameSalutation}, thank you for sharing your honest feedback. We sincerely apologize that your ${topic} at ${storeName} did not meet expectations. Please reach out to our team directly by phone or WhatsApp so we can understand what went wrong and resolve this for you right away.`,
      draft2: `Hi ${nameSalutation}, we are truly sorry to hear about your recent experience with ${storeName}. Your feedback matters to us, and we take full responsibility for falling short. Please connect with our store manager directly so we can make things right.`,
      draft3: `Dear ${nameSalutation}, thank you for bringing this concern to our notice. We regret the inconvenience caused during your visit to ${storeName}. Kindly message or call us directly so we can address this promptly and personally.`,
      keywords: [],
      engine_used: "tier3_fallback",
      model_used: "tier3_static",
    }
  }

  // 4★ Good Review: Warm thanks + ask what would make next visit 5-star
  if (rating === 4) {
    return {
      draft1: `Dear ${nameSalutation}, thank you for your 4-star review and for visiting ${storeName}${locPhrase}! We are glad you had a good experience with our ${topic}. Please let us know what we can improve to make your next visit a full 5-star experience.`,
      draft2: `Hi ${nameSalutation}, we appreciate your kind 4-star feedback for ${storeName}. It is great to know you liked our ${topic}. We would love to hear any suggestions on how we can serve you even better next time!`,
      draft3: `Thank you so much, ${nameSalutation}, for choosing ${storeName} and sharing a 4-star rating. We value your feedback on our ${topic} and look forward to welcoming you back for an even better experience soon.`,
      keywords: [kw1],
      engine_used: "tier3_fallback",
      model_used: "tier3_static",
    }
  }

  // 5★ Positive Review: Warm gratitude + exact topic + at most 1 natural mention
  return {
    draft1: `Dear ${nameSalutation}, thank you so much for your kind 5-star review! We are glad you had a great experience with our ${topic} at ${storeName}${locPhrase}. Looking forward to welcoming you again soon.`,
    draft2: `Hi ${nameSalutation}, thank you for choosing ${storeName} and sharing your feedback on our ${topic}. Providing ${kw2} with warm, attentive care is always our priority. See you again soon!`,
    draft3: `Thank you, ${nameSalutation}! We appreciate your support for ${storeName} and are happy our ${topic} met your expectations. We look forward to serving you again with ${kw3}.`,
    keywords: [kw1, kw2, kw3],
    engine_used: "tier3_fallback",
    model_used: "tier3_static",
  }
}

function buildReplyPrompt(params: {
  storeName: string
  location: string
  categoryStr: string
  catKey: ReplyCategoryKey
  rating: number
  customerReview: string
  reviewerName: string
  firstName: string
  kw1: string
  kw2: string
  kw3: string
}): string {
  const { storeName, location, categoryStr, rating, customerReview, reviewerName, firstName, kw1, kw2, kw3 } = params
  const locText = location ? ` in "${location}"` : ""

  const ratingInstruction =
    rating <= 3
      ? `RATING MODE: NEGATIVE / ISSUE (${rating}/5 Stars)
- Express calm, respectful empathy and a sincere apology for the inconvenience.
- STRICTLY ZERO defensive arguing, ZERO fake cheerfulness ("delighted", "thrilled", "glad you loved", "wonderful"), ZERO emojis like 🎂/🎉/🥰, and ZERO SEO keyword stuffing.
- Invite the customer to connect directly with the store owner/manager by phone or WhatsApp (NEVER invent placeholder phone numbers like 98XXXXXXXX) so the issue can be resolved promptly.`
      : rating === 4
      ? `RATING MODE: GOOD (${rating}/5 Stars)
- Warmly thank the customer and acknowledge the specific item/experience mentioned in their review.
- Politely ask what would make their next visit a full 5-star experience, and invite them back.`
      : `RATING MODE: 5-STAR POSITIVE (${rating}/5 Stars)
- Write in a warm, genuine owner tone matching the customer's language (English or light natural Hinglish if the review is in Hinglish).
- Acknowledge the exact product/service praised in the customer review.
- Include at most 1 natural mention of "${storeName}"${location ? ` or "${location}"` : ""} — use "${kw1}", "${kw2}", "${kw3}" ONLY if they fit naturally without stuffing.`

  return `Act as the genuine, respectful owner of "${storeName}"${locText} (Business Category: ${categoryStr}).
Generate 3 distinct, natural owner reply drafts for this Google Maps review.

REVIEW DETAILS:
- Customer Name: "${reviewerName}" (Address as: "${firstName || "Valued Customer"}")
- Star Rating: ${rating}/5 Stars
- Customer Review: "${customerReview}"
- Clean Business Name (STRICT): "${storeName}"

${ratingInstruction}

STRICT ANTI-HALLUCINATION & QUALITY RULES:
1. Stay 100% anchored to the actual business category (${categoryStr}) and the customer's review text. NEVER mention cakes, baking, pastries, delivery, or unrelated services unless this business is a bakery/cake shop AND it matches the review.
2. NEVER assume or invent "on-time cake delivery", "pure veg bakery", or "Vadodara" unless explicitly provided above.
3. NEVER invent or hallucinate staff, stylist, barber, or doctor names unless explicitly mentioned in the customer review.
4. NEVER use AI buzzwords ("spot-on", "top-notch", "top-tier", "game-changer", "hidden gem", "delve", "exceptional", "outstanding", "highly recommended", "strive for excellence", "delighted", "thrilled") or "Dhanyawad".
5. Length: 2 to 3 natural sentences (30-55 words) each.

Return ONLY valid JSON (NO <think> tags, NO markdown prose):
{
  "draft_1": "text of draft 1",
  "draft_2": "text of draft 2",
  "draft_3": "text of draft 3"
}`
}

function sanitizeDraftSet(
  parsed: Record<string, any>,
  fallback: AIReviewReplyDrafts,
  catKey: ReplyCategoryKey,
  rating: number,
  customerReview: string
): { draft1: string; draft2: string; draft3: string } | null {
  if (!parsed?.draft_1 || !parsed?.draft_2 || !parsed?.draft_3) return null
  const d1 = REPLY_FLUFF_SCRUB(String(parsed.draft_1))
  const d2 = REPLY_FLUFF_SCRUB(String(parsed.draft_2))
  const d3 = REPLY_FLUFF_SCRUB(String(parsed.draft_3))

  return {
    draft1: hasInvalidReplyOutput(d1, catKey, rating, customerReview) ? fallback.draft1 : d1,
    draft2: hasInvalidReplyOutput(d2, catKey, rating, customerReview) ? fallback.draft2 : d2,
    draft3: hasInvalidReplyOutput(d3, catKey, rating, customerReview) ? fallback.draft3 : d3,
  }
}

/**
 * Generates 3 distinct AI Owner Auto-Reply drafts using 3-Tier cascade:
 * Tier 1: Gemini (gemini-3.1-flash-lite -> gemini-3.5-flash)
 * Tier 2: Groq (openai/gpt-oss-120b -> openai/gpt-oss-20b)
 * Tier 3: Rating-aware, category-isolated rule-based fallback
 */
export async function generateAIReviewReplyDrafts(params: GenerateAIReviewReplyParams): Promise<AIReviewReplyDrafts> {
  const storeName = getCleanMerchantName(params.merchantName || "Our Store")
  const location = (params.locationOrArea || "").trim()
  const categoryStr = (params.category || "local business").trim()
  const catKey = resolveReplyCategory(categoryStr, storeName)
  const rating = params.rating ?? 5
  const customerReview = params.customerReview || "Great experience!"
  const reviewerName = params.reviewerName || ""
  const firstName = extractCustomerFirstName(reviewerName)
  const [kw1, kw2, kw3] = getRotatingSeoKeywords(reviewerName + customerReview, categoryStr, location, storeName)

  const fallbackDrafts = buildPersonalizedRuleBasedDrafts({
    storeName,
    location,
    categoryStr,
    rating,
    customerReview,
    reviewerName,
  })

  const prompt = buildReplyPrompt({
    storeName,
    location,
    categoryStr,
    catKey,
    rating,
    customerReview,
    reviewerName,
    firstName,
    kw1,
    kw2,
    kw3,
  })

  // ─── 1. Tier 1: Gemini Cascade ───
  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey)
      const GEMINI_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash"]

      const geminiPromise = (async (): Promise<{ parsed: Record<string, any>; modelName: string } | null> => {
        for (const modelName of GEMINI_MODELS) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName })
            const result = await model.generateContent(prompt)
            const text = (await result.response).text().trim()
            const parsed = extractCleanJsonFromLlmResponse(text)
            if (parsed && parsed.draft_1 && parsed.draft_2 && parsed.draft_3) {
              return { parsed, modelName }
            }
          } catch (e: any) {
            console.warn(`[AI Review Reply] Gemini model ${modelName} failed (${e?.message}). Trying next...`)
          }
        }
        return null
      })()

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6500))
      const geminiResult = await Promise.race([geminiPromise, timeoutPromise])

      if (geminiResult) {
        const clean = sanitizeDraftSet(geminiResult.parsed, fallbackDrafts, catKey, rating, customerReview)
        if (clean) {
          return {
            ...clean,
            keywords: fallbackDrafts.keywords,
            engine_used: "gemini",
            model_used: geminiResult.modelName,
          }
        }
      }
    } catch (err: any) {
      console.warn("[AI Review Reply] Gemini engine failed:", err?.message)
    }
  }

  // ─── 2. Tier 2: Groq / OpenAI-compatible Failover ───
  const groqKey = process.env.AI_API_KEY?.trim() || process.env.GROQ_API_KEY?.trim()
  const groqUrl = process.env.AI_API_URL?.trim() || "https://api.groq.com/openai/v1/chat/completions"
  const envGroqModel = process.env.AI_MODEL?.trim()
  const groqCandidates = Array.from(
    new Set([envGroqModel, "openai/gpt-oss-120b", "openai/gpt-oss-20b"].filter(Boolean) as string[])
  )

  if (groqKey) {
    for (const groqModel of groqCandidates) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4500)

        const res = await fetch(groqUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: "system", content: "You generate authentic, category-accurate, rating-aware Google review owner replies in strict JSON with zero <think> tags." },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (res.ok) {
          const data = await res.json()
          const content = data.choices?.[0]?.message?.content?.trim()
          if (content) {
            const parsed = extractCleanJsonFromLlmResponse(content)
            if (parsed) {
              const clean = sanitizeDraftSet(parsed, fallbackDrafts, catKey, rating, customerReview)
              if (clean) {
                return {
                  ...clean,
                  keywords: fallbackDrafts.keywords,
                  engine_used: "groq",
                  model_used: groqModel,
                }
              }
            }
          }
        }
      } catch (gErr: any) {
        console.warn(`[AI Review Reply] Groq (${groqModel}) failed:`, gErr?.message)
      }
    }
  }

  // ─── 3. Tier 3: Zero-Downtime Category & Rating-Aware Fallback ───
  return fallbackDrafts
}

/**
 * Primary single-reply generator (maintains full backward compatibility)
 */
export async function generateAIReviewReply(params: GenerateAIReviewReplyParams): Promise<string> {
  const drafts = await generateAIReviewReplyDrafts(params)
  return drafts.draft1
}
