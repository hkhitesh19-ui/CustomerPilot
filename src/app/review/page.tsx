import { GoogleGenerativeAI } from "@google/generative-ai"
import { db } from "@/lib/db"
import { ReviewEditor } from "@/components/review/ReviewEditor"

export const dynamic = "force-dynamic"

function getSmartFallbackReview(category: string, product: string): { draft1: string; draft2: string; draft3: string } {
  const c = (category || "").toLowerCase()
  const hasItem = Boolean(product && product.trim())
  const item = hasItem ? product.trim() : ""

  // Category 1: Hotels & Lodging
  if (c.includes("hotel") || c.includes("resort") || c.includes("stay") || c.includes("lodge") || c.includes("room")) {
    return {
      draft1: "Late night check-in me koi issue nahi hua. Rooms ekdum clean the aur AC cooling badiya thi.",
      draft2: "Family ke sath stay ke liye safe hotel hai. Counter thoda busy tha par staff bohot helpful laga.",
      draft3: "Super clean washrooms, comfortable bed and fast Wi-Fi. Convenient location."
    }
  }

  // Category 2: Cafe & Coffee Shop
  if (c.includes("cafe") || c.includes("coffee") || c.includes("tea") || c.includes("bistro") || c.includes("beverage")) {
    return {
      draft1: hasItem 
        ? `${item} super fresh thi aur evening vibes badiya hain. Seating comfortable hai.`
        : "Hazelnut cold coffee super fresh thi aur evening vibes badiya hain. Seating comfortable hai.",
      draft2: "Cheese fries aur cappuccino taste me mast the. Thodi bheed thi Sunday ko par order quickly aa gaya.",
      draft3: "Pocket friendly cafe with great coffee and peaceful ambiance for laptop work."
    }
  }

  // Category 3: Cake Shop & Bakery
  if (c.includes("cake") || c.includes("bakery") || c.includes("pastry") || c.includes("dessert") || c.includes("sweet")) {
    return {
      draft1: hasItem 
        ? `Tried the ${item} today. Texture soft tha, sweetness perfectly balanced thi aur bilkul fresh!`
        : "Midnight delivery bilkul time pe aayi. Chocolate truffle cake soft aur super fresh tha.",
      draft2: hasItem 
        ? `${item} packing safe thi. Weekend rush tha shop pe par counter service fast thi.`
        : "Eggless fresh fruit cake ka taste badiya tha. Sunday rush ke baad bhi safe packing mili.",
      draft3: "Super fresh cake and safe packing. Live counter hygiene properly maintained thi, loved it!"
    }
  }

  // Category 4: Restaurant & Dining / Dhaba
  if (c.includes("restaurant") || c.includes("dining") || c.includes("dhaba") || c.includes("food") || c.includes("thali") || c.includes("eatery") || c.includes("kitchen")) {
    return {
      draft1: hasItem 
        ? `${item} ka taste proper authentic tha. Portions ache the aur khana garam mila.`
        : "Dal makhani aur butter naan ka taste proper authentic tha. Portions ache the aur garam khana mila.",
      draft2: "Family dinner ke liye shant mahaul hai. Weekend pe thodi waiting thi par service polite aur fast thi.",
      draft3: "Veg thali had authentic homestyle taste. Clean table, quick service and good pricing."
    }
  }

  // Category 5: Salon (Men/Unisex) / Barber
  if (c.includes("salon") || c.includes("barber") || c.includes("haircut") || c.includes("grooming")) {
    return {
      draft1: hasItem 
        ? `${item} bilkul photo jaisa diya. Rates genuine hain aur AC cooling badiya thi.`
        : "Fade haircut bilkul photo jaisa diya. Rates genuine hain aur AC cooling badiya thi.",
      draft2: "Beard trim fast aur clean kiya. Thoda rush tha par fresh towel aur hygiene ka proper dhyan rakha.",
      draft3: "Relaxing head massage and clean setup. Staff polite hai aur service super quick."
    }
  }

  // Category 6: Beauty Parlor (Women) / Spa / Makeup
  if (c.includes("beauty") || c.includes("parlor") || c.includes("parlour") || c.includes("makeup") || c.includes("spa")) {
    return {
      draft1: hasItem 
        ? `${item} me bilkul pain nahi hua. Didi ka hath bohot light hai aur parlor clean hai.`
        : "Threading aur upper lip me bilkul pain nahi hua. Didi ka hath bohot light hai aur parlor clean hai.",
      draft2: "O3+ facial ke baad skin pe instant glow tha. Saturday busy tha par treatment me koi jaldi nahi ki.",
      draft3: "Super relaxing hair spa and painless threading. Staff polite hai aur rates transparent hain."
    }
  }

  // Category 7: Gift Shop / Novelty / Toys
  if (c.includes("gift") || c.includes("toy") || c.includes("stationery") || c.includes("craft") || c.includes("novelty")) {
    return {
      draft1: hasItem 
        ? `Urgent gift lena tha ${item} ke liye, bhaiya ne badiya packing kar di. Variety kafi achi hai.`
        : "Urgent birthday gift lena tha, bhaiya ne badiya packing kar di. Variety kafi achi hai.",
      draft2: "Customized photo frame ki print quality ekdum clear aayi. Same day fast delivery mil gayi.",
      draft3: "Great collection of showpieces and toys at affordable rates. Clean and organized shop."
    }
  }

  // Category 8: Garment Shop / Clothing / Fashion
  if (c.includes("garment") || c.includes("clothing") || c.includes("apparel") || c.includes("fashion") || c.includes("boutique") || c.includes("textile") || c.includes("wear")) {
    return {
      draft1: hasItem 
        ? `${item} ki fitting perfect aayi aur fabric quality solid hai. Clean trial rooms the.`
        : "Jeans ki fitting sahi aayi aur trial rooms saaf the. Fabric quality wash ke baad bhi solid hai.",
      draft2: "Kurtis aur kids wear me cotton ke soft kapde mil gaye. Thodi bheed thi par exchange easily ho gaya.",
      draft3: "Trending collection at reasonable fixed prices. Smooth counter service and good fabric quality."
    }
  }

  // Category 9: SuperMarket / Grocery / Mart
  if (c.includes("market") || c.includes("grocery") || c.includes("mart") || c.includes("provision") || c.includes("store")) {
    return {
      draft1: "Mahine ka rashan lene ke liye best mart hai, har item pe genuine discount milta hai.",
      draft2: "Sunday rush tha par billing counter fast move ho raha tha. Parking bhi easily mil gayi.",
      draft3: "Fresh fruits, vegetables, and well-organized shelves. Fast WhatsApp home delivery service."
    }
  }

  // Category 10: Car Wash / Auto Service / Detailing
  if (c.includes("car") || c.includes("wash") || c.includes("auto") || c.includes("garage") || c.includes("detailing") || c.includes("service") || c.includes("mechanic")) {
    return {
      draft1: "Interior vacuum deep kiya aur mats ke neeche se poori mitti nikal di. Exterior shine solid hai.",
      draft2: "Foam wash aur pressure wash badiya kiya. Time thoda laga par microfiber se scratch-free finish di.",
      draft3: "Super clean car wash, spotless alloys and comfortable waiting area. Totally worth it."
    }
  }

  // Category 11: General / Retail fallback
  const fallbackItem = hasItem ? item : "order"
  return {
    draft1: hasItem
      ? `Picked up ${fallbackItem} today. Super fresh quality, great finish and totally worth it.`
      : "Picked up some items earlier today. Super fresh quality, loved the taste and packaging.",
    draft2: hasItem
      ? `${fallbackItem} packaging was completely intact. Thodi bheed thi counter par par service fast thi.`
      : "Smooth experience and neat packaging. Thodi bheed thi counter par par counter service fast thi.",
    draft3: hasItem
      ? `Quick service for ${fallbackItem}. Very clean setup and courteous staff!`
      : "Fast service, clean setup and courteous staff. Baki experience bhi badiya tha."
  }
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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 text-center">
        <div className="p-6 bg-white border border-[#DADCE0] rounded-2xl shadow-xs text-sm font-medium text-[#5F6368] max-w-sm">
          Invalid Review Link. Merchant ID is required.
        </div>
      </div>
    )
  }

  const merchant = await db.merchant.findUnique({
    where: { id: merchantId }
  })

  if (!merchant) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 text-center">
        <div className="p-6 bg-white border border-[#DADCE0] rounded-2xl shadow-xs text-sm font-medium text-[#5F6368] max-w-sm">
          Store not found. Please verify the QR code.
        </div>
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
  let draftOptions: { draft1: string; draft2: string; draft3?: string } | null = smartFallback

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey)
      
      const prompt = `[ROLE & OBJECTIVE]
You are an advanced, anti-detection consumer review drafting engine for CustomerPilot. Your sole mission is to generate 3 distinct, authentic, and high-converting Google Maps reviews (strictly 12 to 22 words each) based on real transaction data.

Every draft must completely bypass Google's spam/NLP filters, trigger Google Local Justifications (SEO-rich entity matching), and read 100% like an authentic, spontaneous mobile message typed by an everyday Indian customer.

[INPUT VARIABLES]
- Business Category: ${businessCategory}
- Purchased Item/Service: ${productName || "General Store Service"}

[RULE 1: STRICT LENGTH & PUNCHINESS]
- Maximum 1 to 2 lines per draft (STRICTLY 12 to 22 words). 
- Write like a quick WhatsApp message — short, punchy, zero fluff.

[RULE 2: LANGUAGE & TONE DIVERSITY]
- Draft 1 (Everyday Indian English / Universal): Simple, natural Indian English that feels 100% genuine across Gujarat, Maharashtra, South, and North India.
- Draft 2 (Natural Hinglish with Popularity Marker): Casual spoken Hinglish (Hindi in English script) blending words like 'badiya', 'packing', 'rush tha', 'smooth service'.
- Draft 3 (Ultra-Short 1-Liner): 8 to 15 words maximum. Punchy, instant, and high conversion.

[RULE 3: ABSOLUTE BAN ON AI MARKETING CLICHÉS (ZERO AI FOOTPRINT)]
Strictly NEVER use any of these dead-giveaway AI words or phrases:
- "delve", "top-notch", "highly recommend", "hidden gem", "pristine", "testament", "exceptional", "outstanding"
- "spot on", "must visit", "best in town", "best in the city", "world class", "plethora", "masterpiece", "exceeded expectations"

[RULE 4: LOCAL SEO ENTITY & ATTRIBUTE STRATEGY (RANKING MULTIPLIER)]
- NEVER write spammy fake keywords like "Best ${businessCategory} in city".
- Seamlessly mention real ENTITIES: Specific purchased items/dishes/treatments (e.g., '${productName || "menu item"}', 'chocolate truffle', 'fade haircut', 'O3+ facial', 'butter naan').
- Naturally mention physical ATTRIBUTES that Google Maps algorithms reward: 'AC cooling', 'clean washrooms', 'fast billing', 'safe parking', 'midnight delivery', 'fresh towel', 'clean trial room', 'easy exchange', 'safe packing'.

[RULE 5: CONTROLLED REAL-HUMAN POPULARITY MARKER (IMPERFECTION RULE)]
- In Draft 2 ONLY, include a subtle high-demand/popularity marker (e.g., 'thodi bheed thi Sunday ko', 'counter thoda busy tha', 'weekend rush tha') BUT IMMEDIATELY balance it with an operational positive ('par billing/service fast thi', 'par staff polite tha').
- NEVER output harmful negative complaints (do NOT complain about bad food, cold meals, or dirty rooms).

[OUTPUT FORMAT]
Return ONLY a valid, parseable JSON object with zero additional conversational filler or markdown outside the JSON:
{
  "draft_1": "12 to 22 words text",
  "draft_2": "12 to 22 words text",
  "draft_3": "8 to 18 words text"
}`

      let responseText = ""
      const candidates = ["gemini-2.0-flash", "gemini-1.5-flash"]

      const generateWithTimeout = async (): Promise<string> => {
        for (const modelName of candidates) {
          try {
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              generationConfig: { temperature: 0.85 }
            })
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text().trim()
            if (text && text.includes("{")) return text
          } catch (_) {
            continue
          }
        }
        return ""
      }

      // Hard 2.5-second timeout to prevent any Nginx 504 Gateway Time-out
      const timeoutPromise = new Promise<string>((resolve) =>
        setTimeout(() => resolve(""), 2500)
      )

      responseText = await Promise.race([generateWithTimeout(), timeoutPromise])

      if (responseText) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            const bannedRegex = /\b(spot[- ]?on|top[- ]?notch|hidden gem|highly recommend|pristine|testament|delve|exceptional|outstanding)\b/gi
            const clean = (s: string) => s.replace(bannedRegex, "really good").trim()
            if (parsed.draft_1 && parsed.draft_2) {
              const d1 = clean(parsed.draft_1)
              const d2 = clean(parsed.draft_2)
              const d3 = parsed.draft_3 ? clean(parsed.draft_3) : smartFallback.draft3
              dynamicDraft = d1
              draftOptions = { draft1: d1, draft2: d2, draft3: d3 }
            } else if (parsed.draft_1) {
              const d1 = clean(parsed.draft_1)
              dynamicDraft = d1
              draftOptions = { draft1: d1, draft2: smartFallback.draft2, draft3: smartFallback.draft3 }
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
  )
}
// Force rebuild 2
