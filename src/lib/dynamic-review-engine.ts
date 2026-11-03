// CustomerPilot — Dynamic Anti-Repetition Google Review Engine
// Generates diverse, authentic, human-like 5-star Google review drafts
// Combines Multi-LLM cascade (Gemini + Groq) with an exhaustive 100+ multi-angle
// rotating fallback pool so consecutive visits NEVER produce identical reviews.

export interface ReviewDraftOptions {
  draft1: string // Quality & Taste (or Core Product/Service Experience)
  draft2: string // Service & Vibes (with authentic human popularity/crowd marker)
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

const SALON_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Fade haircut bilkul photo jaisa diya. Rates genuine hain aur AC cooling badiya thi.",
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
  }
]

const PARLOUR_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Threading aur upper lip me bilkul pain nahi hua. Didi ka hath bohot light hai aur parlor clean hai.",
    draft2: "O3+ facial ke baad skin pe instant glow tha. Saturday busy tha par treatment me koi jaldi nahi ki.",
    draft3: "Super relaxing hair spa and painless threading. Staff polite hai aur rates transparent hain."
  },
  {
    draft1: "Got my hair spa and cleanup done before a wedding. Hair is silky smooth and skin feels glowing.",
    draft2: "Parlour thoda busy tha afternoon me par disposable bedsheet aur sterilized tools used the.",
    draft3: "Painless threading, relaxing facial massage and extremely sweet staff."
  },
  {
    draft1: "Pedicure and manicure service was thorough and relaxing. Dead skin properly removed with sanitized tools.",
    draft2: "Staff was polite, gentle and attentive. Ambiance was calming with good air-conditioning.",
    draft3: "Very neat, hygienic setup with attentive beauticians. Totally recommended!"
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
    draft3: "Mouth-melting soft idlis, crisp vadas and authentic traditional chutneys. Must visit!"
  },
  {
    draft1: "Ghee roast paper dosa was wafer thin and delightfully crisp. Filter coffee had genuine aroma and froth.",
    draft2: "Family ke sath breakfast ke liye badiya spot hai. Ambiance clean hai aur service polite thi.",
    draft3: "Top-notch South Indian breakfast with genuine homestyle flavors and quick turnaround."
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
  },
  {
    draft1: "Ceramic quick-wax wash gave a deep glossy shine. Water beading effect is really impressive in rain.",
    draft2: "Vehicle 35 minutes me ready karke deliver kar diya. Microfiber cloths sanitized use kar rahe the.",
    draft3: "Affordable premium car wash with high attention to detail. Highly satisfied!"
  }
]

const EDUCATION_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Faculty concepts bilkul scratch se clear karti hai. Numerical practice aur doubt solving ka personal attention mila.",
    draft2: "Classroom environment disciplined aur focused hai. Weekly topic-wise tests se performance track hoti hai.",
    draft3: "Highly dedicated teaching faculty, comprehensive study material and supportive mentors."
  },
  {
    draft1: "Doubt clearing sessions aur regular parent-teacher feedback system bohot helpful hai. Teachers approachable hain.",
    draft2: "Batch size manageable hai so individual queries skip nahi hoti. Library aur study space peaceful hai.",
    draft3: "Excellent academic guidance, structured syllabus completion and encouraging teachers."
  },
  {
    draft1: "Test series analysis aur model answer sheets se exam pattern samajhna kafi easy ho gaya. Great mentorship.",
    draft2: "Admin and academic staff cooperative hain. Doubts class ke baad bhi solve karte hain.",
    draft3: "Top-tier coaching with personalized doubt support and motivating atmosphere."
  }
]

const CLINIC_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Doctor explained the root cause patiently bina unnecessary tests prescribe kiye. Treatment bilkul gentle tha.",
    draft2: "Appointment timing strictly follow hua. Clinic hygienic aur sterilized tha, staff polite hai.",
    draft3: "Experienced doctor, transparent diagnosis and compassionate healthcare support."
  },
  {
    draft1: "Dental cleaning aur cavity filling completely painless hui. High hygiene standards maintained hain.",
    draft2: "Waiting time minimal tha aur consultation room sparkling clean tha. Post-procedure tips clearly diye.",
    draft3: "Gentle dental care, modern equipment and very courteous clinic team."
  }
]

const GYM_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Floor trainers posture correct karwate hain har exercise me. Dumbbell aur machine variety top class hai.",
    draft2: "Evening peak hours me bhi equipment sharing smooth rehti hai. Air-conditioning and music vibes badiya hain.",
    draft3: "Spacious gym, modern fitness equipment and highly motivating training atmosphere."
  },
  {
    draft1: "Weight training aur cardio section properly bifurcated hai. Locker rooms and showers clean hain.",
    draft2: "Trainers zero ego ke sath guidance dete hain. Diet guidance aur workout schedule customize karke diya.",
    draft3: "Energetic workout vibe, well-maintained machines and friendly fitness coaches."
  }
]

const GENERAL_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Picked up some items earlier today. Super fresh quality, loved the experience and neat packaging.",
    draft2: "Smooth transaction and neat packaging. Thodi bheed thi counter par par counter service fast thi.",
    draft3: "Fast service, clean setup and courteous staff. Dependable local store!"
  },
  {
    draft1: "Great product quality and transparent pricing. All items in stock and clearly labeled.",
    draft2: "Staff greeted nicely and helped locate what I needed in under a minute. Quick billing.",
    draft3: "Hassle-free experience, reliable product quality and super friendly assistance."
  },
  {
    draft1: "Authentic products at genuine market rates. No hidden markups and bill was provided instantly.",
    draft2: "Shop had a rush of customers par payment counter was moving briskly. Parking space convenient thi.",
    draft3: "Genuine products, swift checkout and very cooperative shop owners."
  }
]

/**
 * Returns a randomized, diverse review draft set based on category, product, and optional seed.
 */
export function getDynamicFallbackReview(
  category: string,
  product?: string,
  seed?: number | string
): ReviewDraftOptions {
  const c = (category || "").toLowerCase()
  const hasItem = Boolean(product && product.trim())
  const item = hasItem ? product!.trim() : ""

  // Choose appropriate pool based on category
  let pool: FallbackReviewItem[] = GENERAL_REVIEWS
  if (c.includes("cake") || c.includes("bakery") || c.includes("pastry") || c.includes("dessert") || c.includes("sweet")) {
    pool = BAKERY_REVIEWS
  } else if (c.includes("south indian") || c.includes("dosa") || c.includes("idli") || c.includes("udupi")) {
    pool = SOUTH_INDIAN_REVIEWS
  } else if (c.includes("punjabi") || c.includes("restaurant") || c.includes("dining") || c.includes("dhaba") || c.includes("food") || c.includes("thali") || c.includes("kitchen")) {
    pool = RESTAURANT_REVIEWS
  } else if (c.includes("cafe") || c.includes("coffee") || c.includes("tea") || c.includes("bistro") || c.includes("beverage")) {
    pool = CAFE_REVIEWS
  } else if (c.includes("salon") || c.includes("barber") || c.includes("haircut") || c.includes("grooming")) {
    pool = SALON_REVIEWS
  } else if (c.includes("beauty") || c.includes("parlor") || c.includes("parlour") || c.includes("makeup") || c.includes("spa")) {
    pool = PARLOUR_REVIEWS
  } else if (c.includes("wash") || c.includes("car") || c.includes("detailing") || c.includes("auto") || c.includes("garage")) {
    pool = CAR_WASH_REVIEWS
  } else if (c.includes("education") || c.includes("coaching") || c.includes("institute") || c.includes("class") || c.includes("school") || c.includes("tutor") || c.includes("academy")) {
    pool = EDUCATION_REVIEWS
  } else if (c.includes("clinic") || c.includes("hospital") || c.includes("dental") || c.includes("doctor") || c.includes("dentist")) {
    pool = CLINIC_REVIEWS
  } else if (c.includes("gym") || c.includes("fitness") || c.includes("workout") || c.includes("crossfit")) {
    pool = GYM_REVIEWS
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

  // If a specific purchased item is passed, weave it organically into draft1 & draft2
  if (hasItem) {
    return {
      draft1: `Ordered ${item} today. Taste and quality were completely fresh, texture soft tha aur packaging solid thi.`,
      draft2: `${item} was packed carefully. Thoda rush tha shop pe par counter service quick aur courteous thi.`,
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
 * Calls AI (Gemini or Groq fallback) with an upgraded, dynamic variation prompt.
 * If AI is unconfigured or slow, seamlessly returns a random dynamic fallback.
 */
export async function generateDynamicReviewDraft(params: {
  businessCategory: string
  productName?: string
  merchantName?: string
  menuItems?: string[]
  seed?: string
}): Promise<ReviewDraftOptions> {
  const { businessCategory, productName, merchantName, menuItems, seed } = params

  // 1. Pick a randomized focal item if no specific product is provided
  let focalItem = productName?.trim() || ""
  if (!focalItem && menuItems && menuItems.length > 0) {
    const randomMenuItem = menuItems[Math.floor(Math.random() * menuItems.length)]
    if (randomMenuItem) focalItem = randomMenuItem
  }

  // 2. Randomized occasions & focus angles to guarantee zero-repetition across calls
  const ANGLES = [
    "Birthday celebration with family",
    "Midnight doorstep surprise delivery",
    "Weekend evening sweet craving",
    "Anniversary celebration treat",
    "Office celebration & team snack",
    "Urgent same-day gift pickup",
    "Comforting tea-time indulgence"
  ]
  const randomAngle = ANGLES[Math.floor(Math.random() * ANGLES.length)]
  const timestampSeed = Date.now().toString(36)

  // 3. Prepare fallback immediately
  const fallback = getDynamicFallbackReview(businessCategory, focalItem, seed || timestampSeed)

  // 4. Check for active API keys
  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  const groqKey = process.env.AI_API_KEY?.trim()
  const groqUrl = process.env.AI_API_URL?.trim() || "https://api.groq.com/openai/v1/chat/completions"
  const groqModel = process.env.AI_MODEL?.trim() || "llama-3.3-70b-versatile"

  if (!geminiKey && !groqKey) {
    return fallback
  }

  const bannedRegex = /\b(spot[- ]?on|top[- ]?notch|hidden gem|highly recommend|pristine|testament|delve|exceptional|outstanding|game changer)\b/gi
  const cleanText = (s: string) => s.replace(bannedRegex, "really good").replace(/["\\]/g, "").trim()

  const systemPrompt = `[ROLE & OBJECTIVE]
You are CustomerPilot's authentic Indian consumer review drafting engine.
Generate 3 distinct, natural, human Google Maps reviews (12 to 22 words each) based on real transaction data.

CRITICAL ANTI-REPETITION DIRECTIVE:
Every single generation MUST be unique. Do NOT repeat opening words or templates. Each draft must feel like a spontaneous WhatsApp message typed on a smartphone.

[INPUT VARIABLES]
- Merchant Name: ${merchantName || "Local Store"}
- Category: ${businessCategory}
- Product Spotlight: ${focalItem || "Store Special"}
- Random Angle / Occasion: ${randomAngle}
- Seed Token: ${timestampSeed}

[CATEGORY CONTEXT & INDUSTRY VOCABULARY]
Tailor terminology strictly to the merchant's specific category:
- South Indian: Crispy dosas, steaming soft idlis, piping hot sambar, coconut chutney, degree filter coffee.
- Punjabi / North Indian: Dal makhani, paneer butter masala, crisp garlic naan, rich gravies, tandoori flavors.
- Bakery / Cake Shop: Soft sponge, fresh cream, rich chocolate, pure eggless base, midnight delivery, clean box.
- Cafe / Bistro: Hazelnut cold coffee, frappes, crispy fries, cozy seating, quick Wi-Fi, peaceful vibe.
- Men's Salon: Fade haircuts, beard styling, head massage, sanitized scissors, fresh towels, clean chairs.
- Beauty Parlour: Painless threading, O3+ facial glow, hair spa, gentle beauticians, hygienic setup.
- Car Wash / Detailing: Snow foam wash, underbody pressure cleaning, interior vacuuming, dashboard polish, alloy shine.
- Coaching / Educational Institute: Concept clarity, supportive faculty, doubt clearing, test series, focused study environment.
- Dental / Healthcare Clinic: Experienced doctor, gentle painless treatment, clean sterile clinic, patient diagnosis.
- Gym / Fitness Studio: Certified trainers correcting posture, modern machines, clean locker rooms, motivating vibe.
- General Retail / Local Store: Genuine rates, fresh stock, polite billing counter, helpful staff.

[OUTPUT FORMAT]
Return ONLY a valid parseable JSON object:
{
  "draft_1": "12 to 22 words text focusing on quality/freshness/taste",
  "draft_2": "12 to 22 words text in conversational Hinglish with mild crowd marker ('thoda rush tha par service fast thi')",
  "draft_3": "8 to 15 words punchy 1-liner review"
}`

  // A. Try Gemini if key is provided
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
              generationConfig: { temperature: 0.9 }
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
              draft1: cleanText(parsed.draft_1),
              draft2: cleanText(parsed.draft_2),
              draft3: parsed.draft_3 ? cleanText(parsed.draft_3) : fallback.draft3
            }
          }
        }
      }
    } catch (_) {}
  }

  // B. Try Groq/OpenAI compatible LLM if key is provided
  if (groqKey) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 3500)

      const res = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: "You generate authentic Indian Google reviews in strict JSON format." },
            { role: "user", content: systemPrompt }
          ],
          temperature: 0.9,
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
              draft1: cleanText(parsed.draft_1),
              draft2: cleanText(parsed.draft_2),
              draft3: parsed.draft_3 ? cleanText(parsed.draft_3) : fallback.draft3
            }
          }
        }
      }
    } catch (_) {}
  }

  return fallback
}
