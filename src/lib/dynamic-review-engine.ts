// CustomerPilot — Dynamic Anti-Repetition Google Review Engine
// Generates diverse, authentic, human-like 5-star Google review drafts
// Grounded with Merchant Keyword Profile, 50 Allowed + 50 Blacklisted Entities,
// Gender & Grammar Persona, and Zero Food/Delivery Hallucination Guardrails.

import { resolveMerchantKeywordProfile, KeywordProfile } from "./keyword-matrix"

export interface ReviewDraftOptions {
  draft1: string // Quality & Core Experience (with allowed SEO keywords)
  draft2: string // Service & Vibes (conversational Hinglish with mild crowd marker)
  draft3: string // Short 1-Liner (punchy, high conversion)
}

interface FallbackReviewItem {
  draft1: string
  draft2: string
  draft3: string
}

// Category-specific rich pool of authentic Indian customer reviews
const BAKERY_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Super fresh chocolate truffle cake with rich cocoa layers. Delivered right on time for our celebration.",
    draft2: "Eggless fresh fruit cake ka taste badiya tha. Sunday rush ke baad bhi safe packing mili.",
    draft3: "Super fresh cake and safe packing. Live counter hygiene properly maintained thi, loved it!"
  },
  {
    draft1: "Tried their Rasmalai cake for a family birthday. Not overly sweet, perfect sponge texture and loaded with real dry fruits.",
    draft2: "Ordered on short notice on Saturday evening. Counter was crowded but the staff handed over my box in 10 minutes flat.",
    draft3: "100% pure eggless and melted in the mouth. Best bakery in the locality!"
  },
  {
    draft1: "Red velvet pastry and walnut brownie combo was unbelievable. Sponge super soft tha aur cream bilkul light thi.",
    draft2: "Shop pe thoda rush tha evening me, par counter boy was very polite. Safe sealed packaging mili.",
    draft3: "Delicious fresh pastries at very genuine rates. Highly recommended!"
  },
  {
    draft1: "Belgian dark chocolate cake ordered for our anniversary. Presentation photo se bhi zyada premium aayi.",
    draft2: "Delivery executive handled the cake box with care, zero damage to the design. Very dependable service.",
    draft3: "Rich chocolate flavor, elegant design and on-time doorstep delivery."
  },
  {
    draft1: "Pineapple gateau was juicy, fresh and light. Perfect sweetness balance for kids and elders alike.",
    draft2: "Sunday afternoon rush tha billing pe, par cake 5 minute me ready karke candles aur knife ke sath diya.",
    draft3: "Freshly baked cake, neat hygienic packaging and very courteous team."
  },
  {
    draft1: "Blueberry cheesecake slice and hazelnut crunch pastry taste me ekdum top-class the. Freshness unmatchable thi.",
    draft2: "Called to customize the name on top, unhone bina extra charges ke beautifully piping kar di.",
    draft3: "Authentic taste, soft fresh base and great variety of desserts."
  },
  {
    draft1: "Ordered customized fondant birthday cake. Design exactly jaisa reference picture bheja tha waisa hi banaya.",
    draft2: "Evening peak hours me thoda waiting tha par delivery boy delivered it safely without any tilt or melt.",
    draft3: "Spot-on custom cake design and heavenly taste. Made our celebration special!"
  },
  {
    draft1: "Cupcake hamper and dry fruit cookies super fresh the. Packaging premium aur gifting ke liye ideal thi.",
    draft2: "Counter staff guided nicely on eggless options. Smooth payment and polite interaction.",
    draft3: "Super fresh eggless treats and neat hygienic counter. Loved it!"
  }
]

const CAFE_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Hazelnut cold coffee super fresh thi aur evening vibes badiya hain. Seating comfortable hai.",
    draft2: "Cheese fries aur cappuccino taste me mast the. Thodi bheed thi Sunday ko par order quickly aa gaya.",
    draft3: "Pocket friendly cafe with great coffee and peaceful ambiance for laptop work."
  },
  {
    draft1: "Iced caramel latte paired with grilled paneer sandwich. Fresh bread, good cheese pull and perfectly balanced coffee.",
    draft2: "Weekend evening me cafe was completely packed, par music volume was decent and order 15 min me aa gaya.",
    draft3: "Great coffee aroma, chilled AC and comfortable seating. Total value for money."
  },
  {
    draft1: "Peri peri french fries were super crispy and the chocolate frappe was thick and rich.",
    draft2: "Counter pe staff polite tha aur Wi-Fi speed was genuinely fast for attending an urgent call.",
    draft3: "Crispy snacks, top notch cold beverages and cozy interior aesthetic."
  },
  {
    draft1: "Sourdough pizza and peach iced tea taste me bohot authentic the. Not oily, light on the stomach.",
    draft2: "Small cafe with great personality. Tables clean the aur order presentation kafi aesthetic tha.",
    draft3: "Peaceful spot with delicious artisanal pizzas and refreshing iced teas."
  }
]

const RESTAURANT_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Dal makhani aur butter naan ka taste proper authentic tha. Portions ache the aur garam khana mila.",
    draft2: "Family dinner ke liye shant mahaul hai. Weekend pe thodi waiting thi par service polite aur fast thi.",
    draft3: "Veg thali had authentic homestyle taste. Clean table, quick service and good pricing."
  },
  {
    draft1: "Paneer butter masala ki gravy rich aur creamy thi bina extra oil ke. Garlic naan was crisp and hot.",
    draft2: "Saturday night family dinner ke liye 15 mins waiting tha, par manager arranged comfortable seating quickly.",
    draft3: "Authentic North Indian food, generous portions and polite service."
  },
  {
    draft1: "Veg dum biryani served with chilled boondi raita was fragrant and flavorful. Rice grains long aur non-sticky the.",
    draft2: "Service staff was attentive throughout the meal. Clean crockery and quick billing.",
    draft3: "Delicious authentic biryani with great hygiene standards and fast table service."
  },
  {
    draft1: "Special unlimited thali me har sabzi ka taste unique tha. Sweets and hot rotis kept coming without asking.",
    draft2: "Rush kafi tha lunch time me, par serving staff polite aur attentive tha. AC cooling badiya thi.",
    draft3: "Authentic homestyle meal, sparkling clean tables and warm hospitality."
  }
]

const SALON_MEN_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Skin fade haircut bilkul photo jaisa diya. Rates genuine hain aur AC cooling badiya thi.",
    draft2: "Beard trim fast aur clean kiya. Thoda rush tha par fresh towel aur hygiene ka proper dhyan rakha.",
    draft3: "Relaxing head massage and clean setup. Staff polite hai aur service super quick."
  },
  {
    draft1: "Haircut and beard styling done with precision. Barber took time to understand the shape of my face.",
    draft2: "Sunday ko appointment ke bawajood 10 min wait tha, par service me koi rush nahi kiya. Sanitized scissors use kiye.",
    draft3: "Clean salon, professional hair stylists and genuine transparent pricing."
  },
  {
    draft1: "De-tan cleanup and charcoal mask treatment gave an instant fresh look. Skin feels thoroughly refreshed.",
    draft2: "Friendly staff with zero product upselling pressure. Comfortable massage chair and peaceful setup.",
    draft3: "Professional grooming services with high hygiene and courteous styling team."
  },
  {
    draft1: "Low fade haircut aur beard contour sharp diya. Finishing touch ekdum clean aur symmetric thi.",
    draft2: "Evening peak time me thoda waiting tha, par staff courteous tha aur wait comfortable AC lounge me tha.",
    draft3: "Top-notch men's grooming and hygienic haircut tools. Highly recommended!"
  }
]

// Strictly feminine, zero delivery, zero tea/cake, pure beauty parlor experience
const PARLOUR_LADIES_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Painless eyebrow threading aur upper lip karwaya. Didi ka hath bohot light hai aur parlor bilkul hygienic hai.",
    draft2: "O3+ facial ke baad skin pe instant natural glow aa gaya. Saturday rush tha par treatment me bilkul jaldi nahi ki.",
    draft3: "Super relaxing hair spa and painless threading. Staff bohot sweet hai aur rates transparent hain."
  },
  {
    draft1: "Family function se pehle hair spa aur D-tan cleanup karwaya. Hair super silky soft ho gaye aur skin glowing lag rahi hai.",
    draft2: "Parlour me female staff hai aur privacy ka full dhyan rakha. Disposable bedsheet aur sanitized tools use kiye the.",
    draft3: "Painless threading, relaxing facial massage and extremely courteous beauticians."
  },
  {
    draft1: "Pedicure and manicure service bohot relaxing thi. Sanitized tools use kiye aur dead skin properly clean ki.",
    draft2: "Staff gentle aur attentive tha. Ambiance calm tha aur AC cooling badiya thi, bina kisi product upselling ke.",
    draft3: "Very neat, hygienic setup with attentive beauticians. Totally recommended for women!"
  },
  {
    draft1: "Hydra facial aur Rica waxing karwaya. Waxing me bilkul rash nahi hua aur skin bohot soft lag rahi hai.",
    draft2: "Shaam ko appointments ki bheed thi par didi ne patiently time dekar facial massage kiya. Worth every rupee.",
    draft3: "Best ladies beauty parlor in area. Branded products used with genuine gentle care."
  },
  {
    draft1: "Engagement makeup aur saree draping karwaya tha. Makeup ekdum natural aur non-cakey tha, daylight me badiya lag raha tha.",
    draft2: "Ready hone me time exact estimate ke according laga. Hair updo dance ke baad bhi perfect set raha.",
    draft3: "Flawless long-lasting makeup and graceful saree draping. Loved the experience!"
  },
  {
    draft1: "Hair smoothening aur global hair color karwaya. Texture silky soft ho gaya aur shine natural aayi hai.",
    draft2: "Treatment ke time step-by-step care tips samjhaye. Staff polite tha aur seating comfortable thi.",
    draft3: "Professional hair care, original branded products and friendly female team."
  }
]

const SOUTH_INDIAN_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Crispy Mysore masala dosa with authentic piping hot sambar. Coconut chutney fresh aur flavorful thi.",
    draft2: "Sunday morning breakfast rush tha, par token counter se 10 min me fresh garam dosa hand over ho gaya.",
    draft3: "Authentic South Indian taste, crisp golden dosas and refreshing degree filter coffee."
  },
  {
    draft1: "Button idli and medu vada combo was steaming hot and super soft. Sambar ka spice balance perfect tha.",
    draft2: "Tables regularly sanitize ho rahe the. Self-service counter organized tha aur billing brisk thi.",
    draft3: "Mouth-melting soft idlis, crisp vadas and authentic traditional chutneys."
  }
]

const CAR_WASH_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Complete snow foam wash aur underbody pressure wash karwaya. Wheel arches se sara mud clean ho gaya.",
    draft2: "Thoda rush tha Sunday afternoon par waiting lounge me AC tha. Washing staff ne alloys ache se clean kiye.",
    draft3: "Scratch-free foam wash, sparkling glass finish and quick dependable vehicle care."
  },
  {
    draft1: "Deep interior vacuuming and dashboard conditioning made the car look showroom fresh. Odor completely gone.",
    draft2: "Boys were detail-oriented with mat cleaning and boot space. Transparent pricing bina hidden add-ons ke.",
    draft3: "Spotless interior detailing, shiny tyre polish and very courteous detailing crew."
  }
]

const CLINIC_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Doctor explained the root cause patiently bina unnecessary tests prescribe kiye. Treatment bilkul gentle tha.",
    draft2: "Appointment timing strictly follow hua. Clinic hygienic aur sterilized tha, staff polite hai.",
    draft3: "Experienced doctor, transparent diagnosis and compassionate healthcare support."
  }
]

const SAAS_AGENCY_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "CustomerPilot lagane ke baad hamare store ke Google reviews 3 mahine me 800% badh gaye. Counter acrylic standee ka response zabardast hai!",
    draft2: "WhatsApp digital loyalty card system se repeat customers ka footfall double ho gaya. Store dashboard simple hai aur live support fast hai.",
    draft3: "Best customer retention software for retail stores. Google Map ranking aur reviews bohot fast improve hue!"
  },
  {
    draft1: "Smart AI Google review engine works like magic. Billing counter pe customers QR scan karte hi 10 second me review post kar dete hain.",
    draft2: "1-Click AI owner review auto-reply feature ne hamara daily time bacha diya. Great software for busy store owners.",
    draft3: "Professional SaaS platform, polite team and game-changer WhatsApp loyalty system for Indian retailers."
  },
  {
    draft1: "Replaced our old paper stamp cards with CustomerPilot WhatsApp loyalty wallet. Customers love seeing their stamps on mobile.",
    draft2: "Onboarding was done in 5 minutes with zero technical hassle. Team in Vadodara provided exceptional guidance.",
    draft3: "100% value for money software. Helps genuine local businesses reach Google Maps Top 3 pack."
  },
  {
    draft1: "Customer retention aur Google review automation ke liye CustomerPilot se better koi tool nahi hai. Transparent pricing and great support.",
    draft2: "Automated WhatsApp winback messages se puraane customers wapas aane lage. Store sales me noticeable jump aaya.",
    draft3: "Highly recommended software company for retail merchants looking to grow repeat business."
  }
]

const GENERAL_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Picked up some items earlier today. Super fresh quality, loved the experience and neat setup.",
    draft2: "Smooth transaction and neat service. Thodi bheed thi counter par par billing brisk aur polite thi.",
    draft3: "Fast service, clean setup and courteous staff. Dependable local store!"
  },
  {
    draft1: "Great product quality and transparent pricing. All items in stock and clearly labeled.",
    draft2: "Staff greeted nicely and helped locate what I needed in under a minute. Quick billing.",
    draft3: "Hassle-free experience, reliable product quality and super friendly assistance."
  }
]

/**
 * Returns category-specific, realistic Indian context angles (NO cross-industry mismatch).
 */
function getCategoryAuthenticAngles(categoryKey: string): string[] {
  switch (categoryKey) {
    case "beauty_parlour":
      return [
        "Family wedding function preparation",
        "Pre-festive skin glow & facial session",
        "Weekend pampering & relaxing hair spa",
        "Routine eyebrow threading & face cleanup",
        "Friend's sangeet function look",
        "Casual party styling & grooming"
      ]
    case "bakery":
      return [
        "Kids 1st birthday cake celebration",
        "Parents wedding anniversary celebration",
        "Weekend sweet craving treat",
        "Surprise celebration cake gift",
        "Office team celebration treat"
      ]
    case "restaurant":
      return [
        "Weekend family dinner outing",
        "Family anniversary celebration meal",
        "Casual lunch with relatives",
        "Sunday dinner with friends"
      ]
    case "salon_men":
      return [
        "Sunday morning fresh fade haircut & beard trim",
        "Pre-interview clean grooming session",
        "Routine haircut & relaxing head massage",
        "Wedding season sharp hair styling"
      ]
    case "cafe":
      return [
        "Evening coffee catchup with friends",
        "Laptop work from cafe session",
        "Cozy weekend hangout",
        "Student budget snack break"
      ]
    case "hotels":
      return [
        "Family transit stay during travel",
        "Overnight business trip check-in",
        "Peaceful weekend stopover"
      ]
    case "gift_shop":
      return [
        "Last-minute birthday gift selection",
        "Customized anniversary photo gift",
        "Kids birthday return gift purchase"
      ]
    case "clothing":
      return [
        "Festive shopping for family",
        "Wedding guest outfit trial",
        "Casual daily wear shopping"
      ]
    case "car_wash":
      return [
        "Monsoon mud cleanup & snow foam wash",
        "Weekend road trip car wash",
        "Pre-festive interior vacuum detailing"
      ]
    case "supermarket":
      return [
        "Monthly ration grocery restocking",
        "Morning fresh dairy and snacks purchase",
        "Household essentials shopping"
      ]
    case "saas_agency":
      return [
        "Google review 10x growth milestone",
        "Paper loyalty card to WhatsApp digital transition",
        "Customer retention & repeat footfall increase",
        "Billing counter QR standee implementation",
        "Owner AI review auto-reply automation"
      ]
    default:
      return [
        "Regular local visit",
        "Weekend service visit",
        "Friendly local recommendation"
      ]
  }
}

/**
 * Returns a randomized, diverse review draft set based on category, product, and optional seed.
 */
export function getDynamicFallbackReview(
  category: string,
  product?: string,
  seed?: number | string
): ReviewDraftOptions {
  const c = (category || "").toLowerCase()
  const hasItem = Boolean(product && product.trim() && !product.toLowerCase().includes("store special"))
  const item = hasItem ? product!.trim() : ""

  // Choose appropriate pool based on category
  let pool: FallbackReviewItem[] = GENERAL_REVIEWS
  if (c.includes("beauty") || c.includes("parlor") || c.includes("parlour") || c.includes("makeup") || c.includes("bridal") || c.includes("ladies salon") || c.includes("ssv")) {
    pool = PARLOUR_LADIES_REVIEWS
  } else if (c.includes("cake") || c.includes("bakery") || c.includes("pastry") || c.includes("dessert") || c.includes("sweet")) {
    pool = BAKERY_REVIEWS
  } else if (c.includes("south indian") || c.includes("dosa") || c.includes("idli") || c.includes("udupi")) {
    pool = SOUTH_INDIAN_REVIEWS
  } else if (c.includes("punjabi") || c.includes("restaurant") || c.includes("dining") || c.includes("dhaba") || c.includes("food") || c.includes("thali") || c.includes("kitchen")) {
    pool = RESTAURANT_REVIEWS
  } else if (c.includes("cafe") || c.includes("coffee") || c.includes("tea") || c.includes("bistro") || c.includes("beverage")) {
    pool = CAFE_REVIEWS
  } else if (c.includes("salon") || c.includes("barber") || c.includes("haircut") || c.includes("grooming") || c.includes("saloon")) {
    pool = SALON_MEN_REVIEWS
  } else if (c.includes("wash") || c.includes("car") || c.includes("detailing") || c.includes("auto") || c.includes("garage")) {
    pool = CAR_WASH_REVIEWS
  } else if (c.includes("clinic") || c.includes("hospital") || c.includes("dental") || c.includes("doctor")) {
    pool = CLINIC_REVIEWS
  } else if (c.includes("saas") || c.includes("software") || c.includes("customerpilot") || c.includes("agency") || c.includes("tech")) {
    pool = SAAS_AGENCY_REVIEWS
  }

  // Derive selection index using random or deterministic seed
  let index: number
  if (typeof seed === "number") {
    index = Math.abs(seed) % pool.length
  } else if (typeof seed === "string" && seed.length > 0) {
    let hash = 0
    for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i)
    const jitter = Math.floor(Math.random() * pool.length)
    index = (Math.abs(hash) + jitter) % pool.length
  } else {
    index = Math.floor(Math.random() * pool.length)
  }

  const selected = pool[index] || pool[0]

  if (hasItem) {
    return {
      draft1: `Opted for ${item} today. Quality was really good, professional experience tha aur proper care li.`,
      draft2: `${item} service was handled gently. Thoda rush tha par staff courteous tha aur proper attention diya.`,
      draft3: selected.draft3
    }
  }

  return {
    draft1: selected.draft1,
    draft2: selected.draft2,
    draft3: selected.draft3
  }
}

/**
 * Calls AI (Gemini or Groq fallback) with strict Merchant KeywordProfile grounding.
 * Enforces Whitelists, Blacklists, and Gender Persona to guarantee ZERO context hallucinations.
 */
export async function generateDynamicReviewDraft(params: {
  businessCategory: string
  productName?: string
  merchantName?: string
  menuItems?: string[]
  seed?: string
  merchantKeywordProfile?: string | null
  merchantCity?: string
  merchantAddress?: string
}): Promise<ReviewDraftOptions> {
  const { businessCategory, productName, merchantName, menuItems, seed, merchantKeywordProfile, merchantCity, merchantAddress } = params

  // 1. Resolve merchant's active KeywordProfile (SEO, AEO, GEO, and Blacklist)
  const profile: KeywordProfile = resolveMerchantKeywordProfile({
    name: merchantName,
    category: businessCategory,
    city: merchantCity,
    address: merchantAddress,
    keywordProfile: merchantKeywordProfile
  })

  // 2. Pick a randomized focal item from allowed whitelist (NEVER generic "Store Special")
  let focalItem = productName?.trim() || ""
  if (!focalItem && menuItems && menuItems.length > 0) {
    const randomMenuItem = menuItems[Math.floor(Math.random() * menuItems.length)]
    if (randomMenuItem) focalItem = randomMenuItem
  }
  if (!focalItem || focalItem.toLowerCase().includes("store special")) {
    // Pick an authentic service/product from merchant's allowed whitelist
    const whitelist = profile.allowedSeoEntities
    if (whitelist && whitelist.length > 0) {
      focalItem = whitelist[Math.floor(Math.random() * whitelist.length)]
    } else {
      focalItem = "Service"
    }
  }

  // 3. Category-appropriate authentic context angle
  const categoryAngles = getCategoryAuthenticAngles(profile.categoryKey)
  const randomAngle = categoryAngles[Math.floor(Math.random() * categoryAngles.length)]
  const timestampSeed = Date.now().toString(36)

  // 4. Prepare fallback immediately
  const fallback = getDynamicFallbackReview(businessCategory, focalItem, seed || timestampSeed)

  // 5. Check active API keys
  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  const groqKey = process.env.AI_API_KEY?.trim()
  const groqUrl = process.env.AI_API_URL?.trim() || "https://api.groq.com/openai/v1/chat/completions"
  const groqModel = process.env.AI_MODEL?.trim() || "openai/gpt-oss-120b"

  if (!geminiKey && !groqKey) {
    return fallback
  }

  // Common Banned Buzzwords
  const bannedRegex = /\b(spot[- ]?on|top[- ]?notch|hidden gem|highly recommend|pristine|testament|delve|exceptional|outstanding|game changer|store special)\b/gi
  const cleanText = (s: string) => s.replace(bannedRegex, "").replace(/["\\]/g, "").replace(/\s+/g, " ").trim()

  // Post-generation Negative Blacklist Sanitizer
  const sanitizeStrict = (text: string): string => {
    let res = cleanText(text)
    for (const banned of profile.strictlyNotAllowed) {
      if (banned.length >= 3) {
        const re = new RegExp(`\\b${banned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
        res = res.replace(re, "")
      }
    }
    // Remove hanging punctuation or double spaces
    return res.replace(/\s+/g, " ").replace(/\s+([.,!])/g, "$1").trim()
  }

  // 6. Audience Persona & Gender Grammar Directive
  let personaInstruction = "Tone: Casual, natural Indian English or Hinglish like a spontaneous WhatsApp text."
  if (profile.categoryKey === "saas_agency") {
    personaInstruction = `STRICT B2B MERCHANT PERSONA RULE:
- The reviewer is an authentic local retail store owner / merchant / shop manager writing for CustomerPilot (SaaS platform).
- Perspective: "Hamare store/bakery/salon ke liye CustomerPilot WhatsApp loyalty lagaya", "Google reviews 800% badh gaye", "Counter standee se customers khush hoke review dete hain", "1-click owner auto-reply se daily time bachta hai".
- ABSOLUTELY NEVER mention ordering food, haircut, doctor visit, cakes, thali, or personal services.`
  } else if (profile.audiencePersona === "Female_Only") {
    personaInstruction = `STRICT FEMININE GRAMMAR RULE (CRITICAL):
- The reviewer is STRICTLY a woman/girl writing for a ladies beauty parlor.
- Use natural feminine Hindi/Hinglish verbs: "gayi thi", "facial karwaya", "didi ne bohot ache se kiya", "skin pe instant glow aa gaya", "bohot soft lag rahi hai".
- ABSOLUTELY NEVER use masculine words like "gaya tha", "bhai", "bro", "barber".
- ABSOLUTELY NEVER mention food, chai, tea, cake, snacks, dinner, or delivery.`
  } else if (profile.audiencePersona === "Male_Only") {
    personaInstruction = `STRICT MASCULINE GRAMMAR RULE:
- The reviewer is a male customer writing for men's grooming/salon.
- Use masculine verbs: "haircut karwaya", "fade haircut mast kiya", "bhai ne time lekar banaya".
- ABSOLUTELY NEVER mention ladies bridal makeup, saree, waxing, delivery, or food.`
  } else if (profile.audiencePersona === "Family_Kids") {
    personaInstruction = `STRICT FAMILY TONE:
- Family perspective: "Family ke sath dinner kiya", "kids loved it", "parents ke sath gaye the".`
  }

  // 7. Dynamic Variable Grounding Prompt
  const allowedSample = profile.allowedSeoEntities.slice(0, 15).join(", ")
  const aeoSample = profile.allowedAeoAnswers.slice(0, 6).join(", ")
  const bannedSample = profile.strictlyNotAllowed.slice(0, 30).join(", ")

  const systemPrompt = `[ROLE & OBJECTIVE]
You are CustomerPilot's authentic Indian consumer review drafting engine.
Generate 3 distinct, natural, human Google Maps reviews (12 to 20 words each) for "${profile.businessName}".

MERCHANT STRICT BOUNDARIES:
1. Target Customer Persona:
${personaInstruction}

2. ALLOWED Offerings (Mention ONLY 1 of these services/products naturally):
${allowedSample}

3. ALLOWED Vibe / Context Signals:
${aeoSample}

4. Occasion / Context Angle:
${randomAngle} (Focus product: ${focalItem})

5. STRICTLY BANNED ENTITIES (DO NOT EVER MENTION ANY OF THESE):
${bannedSample}

CRITICAL ANTI-HALLUCINATION RULES:
- DO NOT mention delivery, doorstep delivery, or parcel unless the merchant is an online delivery service!
- DO NOT mention chai, tea, coffee, food, dinner, cakes, or snacks if this is a salon or parlor!
- DO NOT use the phrase "Store Special" or generic AI words ("top-notch", "hidden gem", "delve").
- Every single draft MUST feel 100% human, casual, and authentic.

[OUTPUT FORMAT]
Return ONLY a valid parseable JSON object:
{
  "draft_1": "12 to 20 words focusing on service quality & results",
  "draft_2": "12 to 20 words conversational Hinglish with mild crowd marker ('thoda rush tha par service polite thi')",
  "draft_3": "8 to 14 words punchy 1-liner review"
}`

  // A. Try Gemini if configured
  if (geminiKey) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai")
      const genAI = new GoogleGenerativeAI(geminiKey)
      const candidates = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]

      const geminiPromise = (async (): Promise<string> => {
        for (const modelName of candidates) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: { temperature: 0.85 }
            })
            const res = await model.generateContent(systemPrompt)
            const text = (await res.response).text().trim()
            if (text && text.includes("{")) return text
          } catch (_) {
            continue
          }
        }
        return ""
      })()

      const timeoutPromise = new Promise<string>((resolve) => setTimeout(() => resolve(""), 3500))
      const geminiResult = await Promise.race([geminiPromise, timeoutPromise])

      if (geminiResult) {
        const match = geminiResult.match(/\{[\s\S]*\}/)
        if (match) {
          const parsed = JSON.parse(match[0])
          if (parsed.draft_1 && parsed.draft_2) {
            return {
              draft1: sanitizeStrict(parsed.draft_1),
              draft2: sanitizeStrict(parsed.draft_2),
              draft3: parsed.draft_3 ? sanitizeStrict(parsed.draft_3) : fallback.draft3
            }
          }
        }
      }
    } catch (err: any) {
      console.warn("[DynamicReviewEngine] Gemini attempt failed:", err?.message)
    }
  }

  // B. Try Groq / OpenAI compatible LLM
  if (groqKey) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)

      const res = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`,
          "User-Agent": "CustomerPilot/1.0"
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: "You generate authentic Indian Google reviews in strict JSON format. Strictly observe all banned keywords." },
            { role: "user", content: systemPrompt }
          ],
          temperature: 0.85,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      })

      clearTimeout(timer)
      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content?.trim()
        if (content) {
          const parsed = JSON.parse(content)
          if (parsed.draft_1 && parsed.draft_2) {
            return {
              draft1: sanitizeStrict(parsed.draft_1),
              draft2: sanitizeStrict(parsed.draft_2),
              draft3: parsed.draft_3 ? sanitizeStrict(parsed.draft_3) : fallback.draft3
            }
          }
        }
      } else {
        const errText = await res.text().catch(() => "")
        console.warn(`[DynamicReviewEngine] Groq API returned status ${res.status}: ${errText.slice(0, 150)}`)
      }
    } catch (err: any) {
      console.warn("[DynamicReviewEngine] Groq attempt failed:", err?.message)
    }
  }

  return fallback
}
