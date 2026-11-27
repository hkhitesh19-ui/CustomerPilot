// CustomerPilot — Dynamic Anti-Repetition Google Review Engine
// Generates diverse, authentic, human-like 5-star Google review drafts
// Grounded with Merchant Keyword Profile, 50 Allowed + 50 Blacklisted Entities,
// Gender & Grammar Persona, and Zero Food/Delivery Hallucination Guardrails.

import { resolveMerchantKeywordProfile, KeywordProfile } from "./keyword-matrix"

export interface ReviewDraftOptions {
  draft1: string // Quality & Core Experience (with allowed SEO keywords)
  draft2: string // Service & Vibes (conversational Hinglish with mild crowd marker)
  draft3: string // Short 1-Liner (punchy, high conversion)
  engine_used: "gemini" | "groq" | "tier3_fallback" // Telemetry: which engine generated this
  model_used?: string // Exact model ID used (e.g. gemini-2.5-flash, openai/gpt-oss-20b, tier3_static)
}

/**
 * Strips <think>...</think> / <reasoning>...</reasoning> blocks and markdown code fences,
 * then safely extracts and parses the JSON object from an LLM response.
 */
export function extractCleanJsonFromLlmResponse(raw: string): Record<string, any> | null {
  if (!raw || typeof raw !== "string") return null
  // 1. Strip Qwen / reasoning model <think>...</think> or <reasoning>...</reasoning> blocks
  let cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
    .replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1")
    .trim()

  // 2. Try direct parse first, then extract outermost {...}
  try {
    const direct = JSON.parse(cleaned)
    if (direct && typeof direct === "object") return direct
  } catch (_) {
    // fallback to brace extraction
  }

  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0])
    return parsed && typeof parsed === "object" ? parsed : null
  } catch (_) {
    return null
  }
}

/**
 * Universal NFKC + Unicode hyphen normalizer & banned buzzword scrubber.
 * Enforced across ALL 3 tiers (Gemini, Groq, and Tier-3 fallback).
 */
export function normalizeUnicodeHyphens(s: string): string {
  return s.normalize("NFKC").replace(/[\u2010-\u2015\u2212\u2E3A\u2E3B\uFE58\uFE63\uFF0D]/g, "-")
}

export const BANNED_BUZZWORD_REGEX = /\b(spot[- ]?on|top[- ]?notch|hidden gem|highly recommend(?:ed)?|pristine|testament|delve|exceptional|outstanding|game[- ]?changer|store special)\b/gi

export const FREEBIE_HYPE_REGEX = /\b(bina\s+(?:kisi\s+|koi\s+)?extra\s+charges?|no\s+extra\s+charges?|extra\s+charges?|10x|5x|100%\s+guaranteed|instant\s+cure|symptoms\s+turant\s+kam|cleared\s+(?:up\s+)?(?:my\s+)?acne\s+marks\s+instantly)\b/gi

/**
 * Non-destructive NFKC + Unicode hyphen normalizer & neutral synonym replacement.
 * Replaces banned AI buzzwords with natural neutral synonyms instead of blind deletion,
 * preventing broken sentences like "The staff was very while...".
 */
export function scrubBannedBuzzwords(s: string): string {
  let out = normalizeUnicodeHyphens(s)
    .replace(/\b(top[- ]?notch|exceptional|outstanding)\b/gi, "great")
    .replace(/\bspot[- ]?on\b/gi, "accurate")
    .replace(/\bgame[- ]?changer\b/gi, "very useful")
    .replace(/\bhidden gem\b/gi, "great find")
    .replace(/\bdelve\b/gi, "explore")
    .replace(/\bhighly recommend(?:ed)?\b/gi, "worth visiting")
    .replace(/\btestament\b/gi, "proof")
    .replace(/\bpristine\b/gi, "clean")
    .replace(/\bstore special\b/gi, "popular item")
    .replace(FREEBIE_HYPE_REGEX, "")
    .replace(/["\\]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!])/g, "$1")
    .replace(/([.,!])\s*([.,!])/g, "$1")
    .replace(/^[.,!\s]+/, "")
    .trim()
  return out
}

/**
 * Detects broken adjective/adverb gaps left after word stripping or bad LLM output.
 */
export function hasBrokenGrammar(text: string): boolean {
  if (!text || text.trim().length < 8) return true
  if (/\b(was|is|are|were|felt)\s+(very|really|quite|so|truly)\s+(while|and|for|to|in|at|with|because|that|who)\b/i.test(text)) {
    return true
  }
  if (/\b(very|really|quite)\s*[.,!?]/i.test(text)) {
    return true
  }
  return false
}

/**
 * Detects imperative cooking-recipe or blog-advice tone instead of 1st-person customer review.
 */
export function hasRecipeOrAdviceTone(text: string): boolean {
  return /\b(garam karo|nikaalo|use karo|avoid karo|enjoy karo)\b/i.test(text)
}

/**
 * Category-scoped verifiable store realities (zero cross-category leaks like "packaging" in salons,
 * zero "hidden charges" clichés in restaurants, zero unverified "AC" claims).
 */
export function getCategoryScopedRealities(categoryKey: string): string[] {
  switch (categoryKey) {
    case "bakery":
      return [
        "safe sealed cake box",
        "clean display counter",
        "polite counter staff",
        "clear flavour guidance",
        "freshly prepared order"
      ]
    case "salon_men":
    case "beauty_parlour":
      return [
        "clean sanitized tools",
        "fresh clean towels",
        "neat tidy workstation",
        "patient polite stylist",
        "comfortable grooming setup"
      ]
    case "dental_clinic":
      return [
        "sterilized dental instruments",
        "clean hygienic clinic",
        "patient clear explanation by doctor",
        "gentle careful handling",
        "organized appointment flow"
      ]
    case "pet_clinic":
      return [
        "clean sanitized examination table",
        "gentle pet-friendly handling",
        "clear post-visit care guidance",
        "polite caring clinic staff"
      ]
    case "restaurant":
    case "pizza_restaurant":
    case "fast_food":
    case "non_veg_restaurant":
    case "cafe":
      return [
        "clean hygienic dining area",
        "warm polite table service",
        "freshly cooked hot food",
        "generous fresh portions",
        "neat comfortable seating"
      ]
    case "optical_store":
      return [
        "patient frame selection guidance without pushiness",
        "clean sanitized eye-testing room",
        "sturdy hard protective case",
        "snug nose pad and temple adjustment",
        "brisk efficient billing and courteous team"
      ]
    case "saree_palace":
    case "clothing":
      return [
        "patient staff showing multiple weave designs",
        "neat folded saree presentation",
        "comfortable spacious showroom",
        "clear fabric and zari guidance"
      ]
    case "car_wash":
      return [
        "clean microfiber cloths to prevent scratches",
        "thorough wheel arch and corner cleaning",
        "organized washing bay",
        "polite detailing crew"
      ]
    case "saas_agency":
      return [
        "simple 5-minute merchant onboarding",
        "clean easy-to-use store dashboard",
        "responsive local support team",
        "clear transparent plan pricing"
      ]
    default:
      return [
        "clean well-organized counter",
        "polite courteous staff",
        "clear guidance on options",
        "smooth billing experience"
      ]
  }
}

interface FallbackReviewItem {
  draft1: string
  draft2: string
  draft3: string
}

// Category-specific rich pool of authentic Indian customer reviews (zero unverified claims, zero clichés)
const BAKERY_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Super fresh chocolate truffle cake with rich cocoa layers. Neat packing aur celebration ke liye bilkul perfect raha.",
    draft2: "Eggless fresh fruit cake ka taste badiya tha. Counter pe safe sealed packing mili aur staff polite tha.",
    draft3: "Super fresh cake and safe packing. Live counter hygiene properly maintained thi, loved it!"
  },
  {
    draft1: "Tried their Rasmalai cake for a family birthday. Not overly sweet, perfect sponge texture and loaded with real dry fruits.",
    draft2: "Saturday evening ko order pickup kiya. Staff ne neat packing karke time pe box hand over kar diya.",
    draft3: "100% pure eggless and melted in the mouth. Best bakery in the locality!"
  },
  {
    draft1: "Red velvet pastry and walnut brownie combo was unbelievable. Sponge super soft tha aur cream bilkul light thi.",
    draft2: "Evening me visit kiya tha, counter staff was very polite. Safe sealed packaging mili.",
    draft3: "Delicious fresh pastries at very genuine rates. Worth every visit!"
  },
  {
    draft1: "Belgian dark chocolate cake ordered for our anniversary. Presentation photo se bhi zyada premium aayi.",
    draft2: "Cake box handle karne ke liye sturdy packing di, zero damage to the design. Very dependable service.",
    draft3: "Rich chocolate flavor, elegant design and neat celebration packaging."
  },
  {
    draft1: "Pineapple gateau was juicy, fresh and light. Perfect sweetness balance for kids and elders alike.",
    draft2: "Sunday afternoon ko cake pickup kiya, staff ne candles aur knife ke sath neatly pack karke diya.",
    draft3: "Freshly baked cake, neat hygienic packaging and very courteous team."
  },
  {
    draft1: "Blueberry cheesecake slice and hazelnut crunch pastry taste me ekdum classic the. Freshness lajawab thi.",
    draft2: "Name piping request ki thi cake pe, staff ne neatly aur cleanly design karke diya.",
    draft3: "Authentic taste, soft fresh base and great variety of desserts."
  },
  {
    draft1: "Ordered customized fondant birthday cake. Design exactly jaisa reference picture bheja tha waisa hi banaya.",
    draft2: "Evening pickup time pe box ready mila with sturdy packaging, koi tilt ya melt nahi hua.",
    draft3: "Exact custom cake design and heavenly taste. Made our celebration special!"
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
    draft2: "Cheese fries aur cappuccino taste me mast the. Sunday ko visit kiya aur order quickly table pe aa gaya.",
    draft3: "Pocket friendly cafe with great coffee and peaceful ambiance for laptop work."
  },
  {
    draft1: "Iced caramel latte paired with grilled paneer sandwich. Fresh bread, good cheese pull and perfectly balanced coffee.",
    draft2: "Weekend evening me cafe lively tha, music volume decent tha aur order promptly aa gaya.",
    draft3: "Great coffee aroma, comfortable seating and peaceful cafe vibe. Total value for money."
  },
  {
    draft1: "Peri peri french fries were super crispy and the chocolate frappe was thick and rich.",
    draft2: "Counter pe staff polite tha aur Wi-Fi speed was genuinely fast for attending an urgent call.",
    draft3: "Crispy snacks, refreshing cold beverages and cozy interior aesthetic."
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
    draft2: "Family dinner ke liye shant mahaul hai. Weekend pe service polite aur attentive thi.",
    draft3: "Veg thali had authentic homestyle taste. Clean table, quick service and good pricing."
  },
  {
    draft1: "Paneer butter masala ki gravy rich aur creamy thi, bilkul light aur non-oily. Garlic naan was crisp and hot.",
    draft2: "Saturday night family dinner ke liye gaye, manager ne comfortable seating arrange ki.",
    draft3: "Authentic North Indian food, generous portions and polite service."
  },
  {
    draft1: "Veg dum biryani served with chilled boondi raita was fragrant and flavorful. Rice grains long aur non-sticky the.",
    draft2: "Service staff was attentive throughout the meal. Clean crockery and quick billing.",
    draft3: "Delicious authentic biryani with great hygiene standards and fast table service."
  },
  {
    draft1: "Special unlimited thali me har sabzi ka taste unique tha. Sweets and hot rotis kept coming without asking.",
    draft2: "Lunch time me serving staff polite aur attentive tha. Dining hall clean aur comfortable tha.",
    draft3: "Authentic homestyle meal, sparkling clean tables and warm hospitality."
  }
]

const SALON_MEN_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Skin fade haircut bilkul photo jaisa diya. Rates genuine hain aur salon setup clean hai.",
    draft2: "Beard trim fast aur clean kiya. Fresh towel aur hygiene ka proper dhyan rakha.",
    draft3: "Relaxing head massage and clean setup. Staff polite hai aur service super quick."
  },
  {
    draft1: "Haircut and beard styling done with precision. Barber took time to understand the shape of my face.",
    draft2: "Sunday ko appointment ke hisab se service mili, koi hurry nahi ki. Sanitized scissors use kiye.",
    draft3: "Clean salon, professional hair stylists and genuine transparent pricing."
  },
  {
    draft1: "De-tan cleanup and charcoal mask treatment gave an instant fresh look. Skin feels thoroughly refreshed.",
    draft2: "Friendly staff with zero product upselling pressure. Comfortable massage chair and peaceful setup.",
    draft3: "Professional grooming services with high hygiene and courteous styling team."
  },
  {
    draft1: "Low fade haircut aur beard contour sharp diya. Finishing touch ekdum clean aur symmetric thi.",
    draft2: "Evening me visit kiya, staff courteous tha aur comfortable lounge me seating mili.",
    draft3: "Clean men's grooming and hygienic haircut tools. Worth visiting again!"
  }
]

// Strictly feminine, zero tea/cake, pure beauty parlor experience
const PARLOUR_LADIES_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Painless eyebrow threading aur upper lip karwaya. Didi ka hath bohot light hai aur parlor bilkul hygienic hai.",
    draft2: "O3+ facial ke baad skin pe instant natural glow aa gaya. Treatment me bilkul jaldi nahi ki.",
    draft3: "Super relaxing hair spa and gentle beauty care. Staff bohot sweet hai aur rates transparent hain."
  },
  {
    draft1: "Family function se pehle hair spa aur D-tan cleanup karwaya. Hair super silky soft ho gaye aur skin glowing lag rahi hai.",
    draft2: "Parlour me female staff hai aur privacy ka full dhyan rakha. Disposable bedsheet aur sanitized tools use kiye the.",
    draft3: "Painless threading, relaxing facial massage and extremely courteous beauticians."
  },
  {
    draft1: "Pedicure and manicure service bohot relaxing thi. Sanitized tools use kiye aur dead skin properly clean ki.",
    draft2: "Staff gentle aur attentive tha. Ambiance calm aur peaceful tha, bina kisi product upselling ke.",
    draft3: "Very neat, hygienic setup with attentive beauticians. Great place for women!"
  },
  {
    draft1: "Hydra facial aur Rica waxing karwaya. Waxing me bilkul rash nahi hua aur skin bohot soft lag rahi hai.",
    draft2: "Shaam ko appointment thi aur didi ne patiently time dekar facial massage kiya. Worth every rupee.",
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
    draft2: "Sunday morning breakfast ke liye gaye, token counter se fresh garam dosa jaldi serve ho gaya.",
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
    draft2: "Sunday afternoon ko waiting lounge comfortable tha. Washing staff ne alloys ache se clean kiye.",
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

const EDUCATION_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Faculty members are experienced and explain every concept with crystal clarity. Personal attention given to each student.",
    draft2: "Doubt solving sessions regular hoti hain aur study material structured hai. Test series se confidence boost hua.",
    draft3: "Excellent coaching institute, supportive faculty and result-oriented academic environment!"
  },
  {
    draft1: "Concept clarity aur syllabus completion dono time par hua. Batch size comfortable hai aur classrooms air-conditioned hain.",
    draft2: "Weekly tests aur performance analysis se weak areas quickly identify hue. Teachers very encouraging hain.",
    draft3: "Best coaching classes in the city for competitive exam preparation!"
  }
]

const DENTAL_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Painless single-sitting root canal karwaya. Doctor bohot gentle the aur sterilization standards top class the.",
    draft2: "Teeth scaling aur polishing ke baad sensitivity nahi hui. Clinic spotlessly clean hai aur appointment time par start hua.",
    draft3: "Experienced dentist, completely painless treatment and very transparent pricing. Best dental clinic!"
  },
  {
    draft1: "Got composite tooth filling and dental checkup done. Doctor explained the findings patiently and clearly.",
    draft2: "Hygienic clinic with sealed disposable instruments. Staff was courteous and the procedure was completely comfortable.",
    draft3: "Gentle dental care, clean modern clinic and punctual appointment handling!"
  }
]

const PET_CLINIC_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Mera Labrador puppy ka 7-in-1 vaccination aur deworming karwaya. Vet doctor ne bohot gently handle kiya, pet bilkul calm raha poori visit mein.",
    draft2: "Clean hygienic clinic aur caring veterinary team. Doctor ne post-vaccination feeding aur care ke baare mein clearly samjhaya.",
    draft3: "Gentle vet doctor, clean clinic and genuine pet medicines. Best pet clinic for vaccinations!"
  },
  {
    draft1: "Meri billi ka skin allergy diagnosis accurately kiya aur effective treatment di. 3 din mein visible relief dikhi, cat bilkul comfortable ho gayi.",
    draft2: "Clinic sanitized hai aur staff polite hai. Vet ne cat ko gently handle kiya aur proper care guide di.",
    draft3: "Compassionate vet care, stress-free for cats and transparent charges. Truly caring clinic!"
  },
  {
    draft1: "Mera German Shepherd ka tick fever diagnose karke IV drip aur medicines di. Doctor ne poora treatment patiently explain kiya.",
    draft2: "Weekend visit mein bhi doctor available the. Pet ko promptly attend kiya aur mujhe calm kiya.",
    draft3: "Prompt pet care, experienced vet doctor and caring veterinary team!"
  },
  {
    draft1: "Golden Retriever ki spaying surgery successfully karwai. Anesthesia safe tha aur post-surgery recovery guide clear di doctor ne.",
    draft2: "Dedicated pet recovery area hai clinic mein. Staff ne surgery ke baad bhi follow-up call ki, great caring service.",
    draft3: "Safe pet surgery, expert vet doctors and excellent post-op care. Truly caring clinic!"
  },
  {
    draft1: "Kitten ka first core vaccination aur health checkup kiya. Doctor ne vaccination card di aur next schedule clearly bataya.",
    draft2: "Waiting room comfortable aur clean hai. Doctor ne kitten ko gently handle kiya, bacchi bilkul nervous nahi hui.",
    draft3: "Thorough kitten vaccination, gentle handling and informative vet. Perfect first clinic visit!"
  },
  {
    draft1: "Puppy ka parvovirus mein critical care mila. Doctor ne quickly diagnose kiya, fluids shuru kiye aur 4 din mein recovery ho gayi.",
    draft2: "Doctor ne phone pe guide kiya aur clinic pe prompt treatment shuru kiya, bahut grateful hoon.",
    draft3: "Prompt parvovirus treatment, attentive care and expert vet. Caring clinic for pets!"
  },
  {
    draft1: "Dog ka ear infection properly clean karke drops prescribe ki. Doctor ne ghar pe care kaise karein clearly demonstrate kiya.",
    draft2: "Clinic mein examination table sanitized thi aur vet gloves wear karke handle kiya. Hygienic aur professional setup.",
    draft3: "Thorough ear infection treatment, hygienic clinic and caring doctor. My dog loves visiting here!"
  },
  {
    draft1: "Senior dog ki arthritis ke liye joint supplement aur physiotherapy advice mili. Doctor ne age-appropriate diet chart bhi diya.",
    draft2: "Doctor ne senior pet ke sath extra patience rakkhi. Unhurried consultation, sab kuch samjhaya bina rush kiye.",
    draft3: "Expert senior pet care, detailed diet advice and gentle doctor. Best geriatric pet clinic!"
  }
]

const FAST_FOOD_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Butter Kutchi Dabeli aur Crispy Vadapav super fresh the. Spicy red garlic chutney ka taste ekdum authentic Mumbai style tha.",
    draft2: "Evening me counter se piping hot parcel pack karwaya. Fresh oil use karte hain aur taste lajawab tha.",
    draft3: "Delicious butter dabeli, crispy hot vadapav and quick polite service. Best evening street snack spot!"
  },
  {
    draft1: "Cheese Grill Sandwich aur Peri Peri Burger ka combo unbeatable tha. Bread super crisp thi aur cheese pull badiya tha.",
    draft2: "Sunday evening billing par counter staff brisk aur well-mannered tha. Neat food-grade parcel packing mili.",
    draft3: "Crispy delicious sandwiches, fresh burgers and pocket-friendly rates. Must-visit fast food corner!"
  }
]

const PIZZA_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Wood-fired Margherita and Farmhouse cheese burst pizza taste me unbeatable the. Crust perfectly crispy tha aur cheese pull rich tha.",
    draft2: "Stuffed garlic bread hot and cheesy serve hua. Ambiance cozy tha aur order freshly baked table pe aa gaya.",
    draft3: "Authentic wood-fired crust, generous mozzarella cheese and wonderful dining ambiance. Top-tier pizza!"
  },
  {
    draft1: "Tried their Paneer Tikka pizza and Alfredo pasta. Sourdough base was light on the stomach and toppings were super fresh.",
    draft2: "Weekend evening me cafe lively tha, staff attentive tha aur service prompt thi. Great youthful vibe.",
    draft3: "Mouth-watering artisanal pizzas, fresh garlic bread and polite team. Value for money family combos!"
  }
]

const NON_VEG_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Chicken Dum Biryani aur Butter Chicken ka taste proper authentic Mughlai tha. Chicken pieces juicy aur tender the.",
    draft2: "Family dinner ke liye dining hall comfortable tha. Garlic naan steaming hot aayi aur serving staff polite tha.",
    draft3: "Delicious aromatic biryani, rich creamy butter chicken and warm hospitality. Best non-veg restaurant in locality!"
  },
  {
    draft1: "Tandoori Chicken super smoky aur well-marinated tha. Mutton Rogan Josh gravy rich thi, bilkul light aur balanced.",
    draft2: "Saturday night family dinner ke liye manager ne comfortable table arrange ki. Fast parcel counter service.",
    draft3: "Authentic non-veg food quality, generous portions and courteous service. Must visit!"
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
    draft3: "Professional SaaS platform, polite team and reliable WhatsApp loyalty system for Indian retailers."
  },
  {
    draft1: "Replaced our old paper stamp cards with CustomerPilot WhatsApp loyalty wallet. Customers love seeing their stamps on mobile.",
    draft2: "Onboarding was done in 5 minutes with zero technical hassle. Team in Vadodara provided genuine guidance.",
    draft3: "100% value for money software. Helps genuine local businesses reach Google Maps Top 3 pack."
  },
  {
    draft1: "Customer retention aur Google review automation ke liye CustomerPilot se better koi tool nahi hai. Transparent pricing and great support.",
    draft2: "Automated WhatsApp winback messages se puraane customers wapas aane lage. Store sales me noticeable jump aaya.",
    draft3: "Dependable software company for retail merchants looking to grow repeat business."
  }
]

const OPTICAL_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Daily screen coding hours ke liye blue-cut anti-glare specs liye. Eyes me jo dry burn aur heaviness hoti thi wo completely khatam ho gayi.",
    draft2: "Shaam ko visit kiya tha, counter staff ne face cut ke hisab se lightweight acetate frame suggest kiya. Smooth fitting mili.",
    draft3: "Zero-power blue-cut computer glasses with crisp clarity. Excellent anti-glare eye strain protection!"
  },
  {
    draft1: "Optometrist ne computerized auto-refractor se detail me eye test kiya. Progressive multifocal lenses me reading aur driving dono corridors bilkul smooth hain.",
    draft2: "Family ke sath gaye the, staff ne bina hurry kiye frames patiently try karwaye. Fitting zero distortion ke sath perfect mili.",
    draft3: "Crystal clear progressive vision and accurate power testing. Best optician in Vadodara!"
  },
  {
    draft1: "Polarized UV400 branded sunglasses purchase kiye highway road trip ke liye. Harsh sunlight glare bilkul cut ho gaya aur frame fit ekdum snug hai.",
    draft2: "Showroom me latest sunglasses collection kafi bada hai. Transparent rates the aur hard protective case ke sath microfiber cloth bhi diya.",
    draft3: "Stylish polarized sunglasses, genuine branded quality and very courteous customer service!"
  },
  {
    draft1: "Mera beta ke liye unbreakable flexible spectacle frame liya. School aur playground activities me safe rehta hai aur bilkul bendable hai.",
    draft2: "Optometrist ne bache ka eye checkup bohot gently aur friendly tareeqe se kiya. Beta bilkul nervous nahi hua.",
    draft3: "Durable kids eyewear frames, gentle optometrist checkup and very cooperative team!"
  },
  {
    draft1: "Rimless titanium frame with high-index ultra-thin lenses karwaya. Face par weight bilkul feel nahi hota aur professional executive look aata hai.",
    draft2: "Pehle purane glasses se nose bridge par marks aate the, yahan soft silicon nose pad fitting ke baad zero discomfort hai.",
    draft3: "Featherweight rimless titanium frame fitting and precision lens marking. Superb craftsmanship!"
  },
  {
    draft1: "Spectacle frame ka loose screw aur nose pads emergency me replace karwaye. Counter staff ne frame perfectly align kar diya.",
    draft2: "Old glasses ki ultrasonic machine deep cleaning bhi karke di. Extremely polite and helpful gesture by the team.",
    draft3: "Quick spectacle repair, courteous staff and prompt assistance. Highly dependable!"
  },
  {
    draft1: "Daily disposable contact lenses liye. Optometrist ne lens insertion, removal aur hygienic care ki proper step-by-step training di.",
    draft2: "Whole day screen work ke baad bhi zero eye dryness ya irritation hui. Fresh sealed packaging aur genuine solution mila.",
    draft3: "Comfortable contact lens trial, expert guidance and transparent pricing. 100% satisfied!"
  },
  {
    draft1: "Night drive yellow tint anti-glare glasses banwaye. Opposite vehicles ki high-beam headlight glare se driving me bohot sukoon mila.",
    draft2: "Staff ne UV light demo tester pe anti-glare coating live check karke dikhayi. Very knowledgeable and honest guidance.",
    draft3: "Safe night driving spectacles with genuine anti-glare coating. Great for regular motorists!"
  },
  {
    draft1: "Dadi ke liye reading aur walking ke liye bifocal lenses banwaye. Distance aur reading lines clearly separated hain, first day se adjust ho gaya.",
    draft2: "Senior citizen ke sath staff ne bohot respect aur patience rakhi. Clear explanation diya bina kisi jaldbaazi ke.",
    draft3: "Accurate bifocal spectacles, respectful staff and timely delivery. Trusted family optical store!"
  },
  {
    draft1: "Acetate cat-eye designer frame liya everyday wear ke liye. Color subtle hai, hinges sturdy hain aur aesthetic compliments mil rahe hain.",
    draft2: "Weekend evening me billing counter par team ne briskly pack karke warranty card ke sath hand over kiya.",
    draft3: "Trendy eyewear collection, aesthetic frames and reliable lens quality. Great collection!"
  },
  {
    draft1: "Original Crizal anti-reflective scratch-resistant lenses lagwaye. Dust aur fingerprints easily wipe ho jate hain, vision 100% sharp hai.",
    draft2: "Cylinder power checkup optometrist ne double-verify kiya trail frame pe. Delivery promise time se 2 ghante pehle ready ho gaya.",
    draft3: "Original scratch-resistant lenses with warranty card. Crystal sharp vision and dependable service!"
  },
  {
    draft1: "High minus power ke liye 1.67 high-index thin lenses liye. Lenses bilkul flat aur lightweight bane, thick edges bilkul nahi dikh rahe.",
    draft2: "Optometrist ne frame selection me guidance di ki high power me kaunsa frame fit best baithega. Superb technical knowledge.",
    draft3: "Ultra-thin high index lenses, flawless aesthetic finish and pocket-friendly pricing!"
  }
]

const SAREE_CLOTHING_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Wedding shopping ke liye visit kiya tha. Pure silk sarees aur bridal collection bohot hi khoobsurat hai. Staff ne bohot patience se har design dikhayi.",
    draft2: "Authentic Pethapur silk sarees aur designer collection lajawab hai. Fabric quality rich hai aur rates reasonable hain.",
    draft3: "Best saree showroom in Vadodara! Royal Rajwadi collection aur wedding sarees ke liye must visit jagah hai."
  },
  {
    draft1: "Family wedding ke liye Kanjivaram aur Banarasi silk sarees li. Zari work aur fabric bohot genuine hai. Pure silk ka trust mila.",
    draft2: "Showroom me bohot bada collection hai, staff bilkul pushy nahi hai aur designs ek se badhkar ek dikhaye. Shopping experience smooth raha.",
    draft3: "Festive collection aur designer bridal sarees bohot sundar hain. Fitting and fall-pico service timely mil gayi."
  },
  {
    draft1: "Rajwadi silk saree li function ke liye, sabne tareef ki. Fabric bohot comfortable aur premium lag raha tha. Thank you team!",
    draft2: "Traditional Patola aur Bandhani sarees ka exclusive collection yahan mila. Family ke sath shopping karne ka best experience.",
    draft3: "Pure silk sarees, spacious showroom aur polite sales staff. Great place for wedding shopping!"
  }
]

const GENERAL_REVIEWS: FallbackReviewItem[] = [
  {
    draft1: "Picked up some items earlier today. Super fresh quality, loved the experience and neat setup.",
    draft2: "Smooth transaction and neat service. Counter par billing brisk aur polite thi.",
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
    case "optical_store":
      return [
        "Computerized eye power testing and prescription check",
        "Progressive multifocal lens fitting and alignment",
        "Blue-cut anti-glare glasses for laptop screen protection",
        "Designer lightweight spectacle frame selection",
        "Polarized UV sunglasses purchase",
        "Contact lens trial and consultation"
      ]
    case "clothing":
    case "saree_palace":
      return [
        "Bridal wedding trousseau shopping",
        "Festive Diwali & wedding reception saree trial",
        "Authentic Pethapur silk saree selection",
        "Family wedding saree matching & blouse contrast",
        "Traditional Patola and Bandhani saree purchase"
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
    case "dental_clinic":
      return [
        "Routine dental cleaning and scaling",
        "Painless single-sitting root canal treatment",
        "Cosmetic smile design and aligners consultation",
        "Wisdom tooth extraction recovery",
        "Kids dental cavity filling visit"
      ]
    case "pet_clinic":
      return [
        "Puppy core vaccination and deworming visit",
        "Routine pet health and wellness checkup",
        "Tick and flea prevention treatment",
        "Emergency pet care and recovery",
        "Skin allergy treatment and dietary consultation"
      ]
    case "fast_food":
      return [
        "Evening street snack hangout with friends",
        "Quick vadapav and dabeli parcel takeaway",
        "College afternoon snack break",
        "Crispy cheese grill sandwich craving",
        "Family weekend fast food treat"
      ]
    case "pizza_restaurant":
      return [
        "Weekend wood-fired pizza date",
        "Family pizza and garlic bread feast",
        "College friends cheese burst pizza party",
        "Late evening gourmet sourdough pizza craving"
      ]
    case "non_veg_restaurant":
      return [
        "Weekend family non-veg feast",
        "Chicken biryani and kebabs dinner outing",
        "Special butter chicken and tandoori treat",
        "Anniversary Mughlai dinner with family"
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
  const isPetCategory = (
    c.includes("pet_clinic") || c.includes("pet_shop") ||
    c.includes("veterin") || c.includes("animal hospital") || c.includes("pet hospital") ||
    c.includes("vet clinic") || c.includes("dog clinic") || c.includes("cat clinic") ||
    (/\b(pet|pets|puppy|puppies|kitten|kittens|dog|dogs|cat|cats)\b/i.test(c) && !c.includes("pethapur") && !c.includes("carpet") && !c.includes("petlad"))
  )

  if (c.includes("optical") || c.includes("optician") || c.includes("eyewear") || c.includes("spectacle") || c.includes("lens") || c.includes("chashma") || c.includes("optical_store")) {
    pool = OPTICAL_REVIEWS
  } else if (
    c.includes("saree") || c.includes("silk") || c.includes("saree_palace") ||
    c.includes("rajwadi") || c.includes("pethapur") || c.includes("lehenga") ||
    c.includes("patola") || c.includes("chaniya") || c.includes("cloth") ||
    c.includes("garment") || c.includes("boutique")
  ) {
    pool = SAREE_CLOTHING_REVIEWS
  } else if (isPetCategory) {
    pool = PET_CLINIC_REVIEWS
  } else if (c.includes("dental") || c.includes("dentist") || c.includes("tooth") || c.includes("teeth") || c.includes("orthodont") || c.includes("rct") || c.includes("dental_clinic")) {
    pool = DENTAL_REVIEWS
  } else if (c.includes("pizza") || c.includes("pizzeria") || c.includes("wood fired") || c.includes("wood-fired")) {
    pool = PIZZA_REVIEWS
  } else if (c.includes("dabeli") || c.includes("vadapav") || c.includes("vada pav") || c.includes("samosa") || c.includes("sandwich") || c.includes("fast food") || c.includes("street snack")) {
    pool = FAST_FOOD_REVIEWS
  } else if (c.includes("non veg") || c.includes("non-veg") || c.includes("chicken") || c.includes("mutton") || c.includes("biryani") || c.includes("mughlai") || c.includes("kebab")) {
    pool = NON_VEG_REVIEWS
  } else if (c.includes("beauty") || c.includes("parlor") || c.includes("parlour") || c.includes("makeup") || c.includes("bridal") || c.includes("ladies salon") || c.includes("ssv")) {
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
  } else if (c.includes("clinic") || c.includes("hospital") || c.includes("doctor")) {
    pool = CLINIC_REVIEWS
  } else if (c.includes("education") || c.includes("coaching") || c.includes("institute") || c.includes("tuition") || c.includes("classes")) {
    pool = EDUCATION_REVIEWS
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

  const rawResult: ReviewDraftOptions = hasItem
    ? getCategoryAwareItemDrafts(c, item, selected, typeof seed === "number" ? Math.abs(seed) : index)
    : {
        draft1: selected.draft1,
        draft2: selected.draft2,
        draft3: selected.draft3,
        engine_used: "tier3_fallback",
        model_used: "tier3_static"
      }

  return {
    draft1: scrubBannedBuzzwords(rawResult.draft1),
    draft2: scrubBannedBuzzwords(rawResult.draft2),
    draft3: scrubBannedBuzzwords(rawResult.draft3),
    engine_used: rawResult.engine_used,
    model_used: rawResult.model_used || "tier3_static"
  }
}

/**
 * Generates category-specific draft1 and draft2 when a focal item (service/product) is provided.
 * Sub-typed routing prevents ALL semantic blunders (puppy for cat, scissors for facial, etc.)
 * draft3 is always taken from the category pool entry for consistency.
 * engine_used is always "tier3_fallback" since this is offline template generation.
 */
function getCategoryAwareItemDrafts(
  category: string,
  item: string,
  poolEntry: FallbackReviewItem,
  seedIndex?: number
): ReviewDraftOptions {
  const c = category.toLowerCase()
  const itemLower = item.toLowerCase()
  const pickTemplate = <T>(arr: T[]): T =>
    arr[(typeof seedIndex === "number" ? seedIndex : Math.floor(Math.random() * arr.length)) % arr.length]

  // ── SAREE & SILK PALACE / ETHNIC WEAR ─────────────────────────────────────────
  if (
    c.includes("saree") || c.includes("silk") || c.includes("cloth") ||
    c.includes("garment") || c.includes("boutique") || c.includes("lehenga") ||
    c.includes("sari") || c.includes("rajwadi") || c.includes("pethapur") ||
    c.includes("saree_palace")
  ) {
    const templates = [
      {
        draft1: `Wedding function ke liye ${item} li thi. Rich zari border aur pure fabric dekh kar sabne look ki bohot tareef ki!`,
        draft2: `${item} ka collection bohot unique tha. Staff ne patience se styling dikhayi aur fall-pico finishing bhi time pe karke di.`
      },
      {
        draft1: `Family shopping ke liye gaye the aur ${item} pasand aayi. Genuine weave aur soft drape dekh kar maza aa gaya.`,
        draft2: `${item} ki fitting aur drape perfect baithi. Vadodara me royal traditional wear ke liye best showroom hai.`
      },
      {
        draft1: `Showroom me ${item} ki multiple exclusive designs dikhayin. Rates genuine hain aur staff ka behavior bohot polite tha.`,
        draft2: `${item} ke sath blouse matching aur contrast suggestions bohot ache diye. Wedding trousseau shopping ke liye zaroor visit karein.`
      },
      {
        draft1: `Festive occasion ke liye ${item} select ki — color combination aur handloom detailing bilkul royal lag rahi thi.`,
        draft2: `Bina kisi hurry ke sales team ne 20+ patterns khol kar dikhaye. Comfortable showroom aur genuine silk trust.`
      },
      {
        draft1: `Diwali get-together ke liye ${item} choose ki — itni comfortable aur breathable thi ki poora evening easily carry kar payi!`,
        draft2: `Alteration aur blouse stitching guidance time pe mil gayi. Pure family ko yahan ka collection pasand aaya.`
      }
    ]
    const chosen = pickTemplate(templates)
    return {
      draft1: chosen.draft1,
      draft2: chosen.draft2,
      draft3: poolEntry.draft3 || `Genuine quality ${item} and wonderful shopping experience at this showroom!`,
      engine_used: "tier3_fallback"
    }
  }

  // ── OPTICAL STORE & EYEWEAR ──────────────────────────────────────────────────
  if (
    c.includes("optical") || c.includes("optician") || c.includes("eyewear") ||
    c.includes("spectacle") || c.includes("lens") || c.includes("chashma") ||
    c.includes("optical_store")
  ) {
    let templates: { draft1: string; draft2: string; draft3?: string }[] = []

    // 1. Eye testing & Clinical Checkup
    if (itemLower.includes("eye test") || itemLower.includes("power") || itemLower.includes("optometrist") || itemLower.includes("refract") || itemLower.includes("checkup")) {
      templates = [
        {
          draft1: `Detailed ${item} karwaya. Optometrist ne cylinder aur spherical numbers bahut thoroughly verify kiye trial frame pe.`,
          draft2: `Testing room clean aur sanitized tha. Doctor ne eye strain causes aur screen hygiene tips clearly samjhaye.`,
          draft3: `Accurate computerized ${item} and trustworthy eye care advice!`
        },
        {
          draft1: `Accurate ${item} done with digital autorefractor machine. Clear explanation mili bina kisi hurry ke.`,
          draft2: `Appointment punctual tha. Staff courteous tha aur transparent eye power prescription di.`,
          draft3: `Dependable ${item} and professional optical consultation!`
        }
      ]
    } else if (itemLower.includes("blue") || itemLower.includes("screen") || itemLower.includes("gaming") || itemLower.includes("anti-glare") || itemLower.includes("computer glasses") || itemLower.includes("computer protect")) {
      templates = [
        {
          draft1: `Daily laptop screen work ke liye ${item} liya. Glare aur eye fatigue bilkul stop ho gaya, visual comfort badiya hai!`,
          draft2: `Shaam ko counter pe visit kiya tha, staff ne face cut ke hisab se lightweight frame suggest kiya. Smooth fitting mili.`,
          draft3: `Genuine quality ${item} and crystal clear screen protection from this optical store!`
        },
        {
          draft1: `Mera new ${item} banwaya yahan se. Coding aur continuous monitor use ke baad bhi headaches completely band ho gaye.`,
          draft2: `Optometrist ne lens anti-reflective coating light meter pe demo karke dikhayi. Honest advice and zero upselling.`,
          draft3: `High-performance ${item} with featherweight frames. Great choice for daily screen users!`
        },
        {
          draft1: `Picked up ${item} for office work. Lenses crystal clear hain aur frame nose bridge par bilkul heavy feel nahi hota.`,
          draft2: `Staff polite tha aur hard case ke sath lens cleaning microfiber kit bhi provide ki. Smooth transaction.`,
          draft3: `Total value for money ${item} and courteous optical service!`
        }
      ]
    } else if (itemLower.includes("progressive") || itemLower.includes("multifocal") || itemLower.includes("bifocal")) {
      templates = [
        {
          draft1: `New ${item} banwaye yahan se. Reading aur distant vision dono corridors bilkul seamless hain bina kisi distortion ke!`,
          draft2: `Optometrist ne computerized power checkup bahut detail me kiya. Fitting exact pupil distance ke sath perfect mili.`,
          draft3: `Precision-crafted ${item} and smooth progressive adaptation!`
        },
        {
          draft1: `Got my ${item} fitted here. Driving aur mobile text reading me quick switch ho jata hai, first day se adjust ho gaya.`,
          draft2: `Family ke sath visit kiya tha, staff ne frames patiently try karwaye bina kisi hurry ke. Comfortable fitting mili.`,
          draft3: `Flawless ${item} and experienced optometrist consultation. Best optician in Vadodara!`
        },
        {
          draft1: `Accurate power testing ke baad ${item} order kiye. Lens quality clear hai aur peripheral blurriness bilkul nahi hai.`,
          draft2: `Store me progressive lenses ke multiple branded options explain kiye. Transparent pricing aur warranty card mila.`,
          draft3: `Crystal sharp ${item} and highly professional eyewear dispensing!`
        }
      ]
    } else if (itemLower.includes("sunglass") || itemLower.includes("polarized") || itemLower.includes("uv400") || itemLower.includes("photochrom")) {
      templates = [
        {
          draft1: `Highway trips aur daily driving ke liye ${item} purchase kiya. Harsh sunlight glare bilkul cut ho gaya aur build solid hai.`,
          draft2: `Showroom me stylish sunglasses ka huge collection tha. Rates transparent hain aur staff guidance bahut helpful rahi.`,
          draft3: `Stylish polarized ${item} and genuine UV protection. Superb collection!`
        },
        {
          draft1: `Picked up branded ${item} with UV protection. Eyes relaxed rehti hain outdoor daylight me aur finish premium hai.`,
          draft2: `Counter staff ne snug face fitting karke di aur sturdy protective hard case diya. Great buying experience.`,
          draft3: `Premium quality ${item} and very polite customer handling!`
        }
      ]
    } else if (itemLower.includes("repair") || itemLower.includes("screw") || itemLower.includes("nose pad") || itemLower.includes("clean")) {
      templates = [
        {
          draft1: `Chashme ke frame me ${item} karwaya. Frame perfectly align karke tight kar diya aur comfortable fit diya.`,
          draft2: `Ultrasonic machine se deep frame cleaning bhi karke di. Very polite and helpful gesture by the team.`,
          draft3: `Quick ${item} and prompt optical goodwill assistance!`
        },
        {
          draft1: `Loose frame screw and ${item} done neatly. Proper temple adjustment karke di taaki frame slip na ho.`,
          draft2: `Staff ne promptly attend kiya. Dependable neighborhood optical clinic.`,
          draft3: `Fast dependable ${item} and courteous optical service!`
        }
      ]
    } else if (itemLower.includes("contact") || itemLower.includes("solution")) {
      templates = [
        {
          draft1: `Got my ${item} from here. Whole day screen wear ke baad bhi zero eye irritation ya dryness feel hui.`,
          draft2: `Optometrist ne hygienic insertion aur safe lens care steps bohot patiently demonstrate kiye. Fresh sealed pack mila.`,
          draft3: `Comfortable ${item} and expert optometrist training!`
        }
      ]
    } else if (itemLower.includes("kid") || itemLower.includes("flexible") || itemLower.includes("unbreakable")) {
      templates = [
        {
          draft1: `Mera beta ke liye ${item} liya. Unbreakable flexible material hai jo school aur outdoor play me bilkul safe hai.`,
          draft2: `Optometrist ne bache ka vision test bahut playfully aur patiently kiya. Child-friendly staff aur cooperative behavior.`,
          draft3: `Durable kids ${item} and gentle optometrist care!`
        }
      ]
    } else {
      // General Frames, Rimless, Titanium & Spectacles
      templates = [
        {
          draft1: `Mera ${item} banwaya yahan se. Featherweight lightweight fit baitha aur vision ekdum crisp sharp hai!`,
          draft2: `Showroom me stylish frames ka wide collection available tha. Staff ne face shape ke according best design pick karwaya.`,
          draft3: `High-quality ${item} and comfortable precision fitting!`
        },
        {
          draft1: `Picked up new ${item}. Frame finishing solid hai, hinges sturdy hain aur nose bridge par bilkul pressure nahi padta.`,
          draft2: `Transparent pricing mili aur hard protective case ke sath warranty card diya. Polite and attentive team.`,
          draft3: `Stylish durable ${item} and wonderful shopping experience at this showroom!`
        },
        {
          draft1: `Showroom me ${item} ki wide variety available thi. Fitting seamless hai aur look bahut sophisticated aaya.`,
          draft2: `Collection ke time proper lens alignment aur nose pad check kiya. Smooth and pleasant transaction.`,
          draft3: `Top-grade ${item} with genuine warranty and dependable after-sales support!`
        }
      ]
    }

    const chosen = pickTemplate(templates)
    return {
      draft1: chosen.draft1,
      draft2: chosen.draft2,
      draft3: chosen.draft3 || poolEntry.draft3 || `Genuine quality ${item} and professional optical consultation at this store!`,
      engine_used: "tier3_fallback",
      model_used: "tier3_static"
    }
  }

  // ── PET CLINIC ───────────────────────────────────────────────────────────────
  const isPetCategory = (
    c.includes("pet_clinic") || c.includes("pet_shop") ||
    c.includes("veterin") || c.includes("animal hospital") || c.includes("pet hospital") ||
    c.includes("vet clinic") || c.includes("dog clinic") || c.includes("cat clinic") ||
    (/\b(pet|pets|puppy|puppies|kitten|kittens|dog|dogs|cat|cats)\b/i.test(c) && !c.includes("pethapur") && !c.includes("carpet") && !c.includes("petlad"))
  )
  if (isPetCategory) {
    // Sub-typed: detect animal type and service type from ITEM, not generic ${item} blind paste
    const isDogItem = itemLower.includes("dog") || itemLower.includes("puppy") || itemLower.includes("labrador") || itemLower.includes("retriever") || itemLower.includes("pup")
    const isCatItem = itemLower.includes("cat") || itemLower.includes("kitten") || itemLower.includes("billi") || itemLower.includes("persian") || itemLower.includes("feline")
    const isVaccination = itemLower.includes("vaccin") || itemLower.includes("deworming") || itemLower.includes("7-in-1") || itemLower.includes("core vaccine")
    const isSurgery = itemLower.includes("surgery") || itemLower.includes("spay") || itemLower.includes("neuter") || itemLower.includes("operation")
    const isEmergency = itemLower.includes("emergency") || itemLower.includes("parvovirus") || itemLower.includes("tick fever") || itemLower.includes("iv drip") || itemLower.includes("critical")
    const isSkinAllergy = itemLower.includes("skin allergy") || itemLower.includes("allergy") || itemLower.includes("rash") || itemLower.includes("infection")
    const isCheckup = itemLower.includes("checkup") || itemLower.includes("health check") || itemLower.includes("wellness") || itemLower.includes("routine")
    const isEarInfection = itemLower.includes("ear") && itemLower.includes("infection")
    const isSeniorCare = itemLower.includes("senior") || itemLower.includes("geriatric") || itemLower.includes("arthritis") || itemLower.includes("old dog") || itemLower.includes("old cat")

    // Animal pronoun/descriptor for the item
    const animalSubject = isCatItem ? "billi" : isDogItem ? "dog" : "pet"
    const animalPronoun = isCatItem ? "meri billi ka" : isDogItem ? "mera dog ka" : "mera pet ka"

    let templates: { draft1: string; draft2: string; draft3: string }[]

    if (isVaccination && isCatItem) {
      templates = [
        {
          draft1: `Meri billi ka core vaccination aur deworming kiya — vet ne gently handle kiya, bilkul dard nahi hua. Vaccination card di aur next schedule bataya.`,
          draft2: `Waiting room comfortable aur clean tha. Doctor ne kitten ko dheere handle kiya, billi bilkul nervous nahi hui.`,
          draft3: `Gentle cat vaccination and clean veterinary clinic. Billi bilkul calm rahi!`
        },
        {
          draft1: `Kitten ka pehla vaccination yahan karwaya. Doctor ne carefully inject kiya aur post-vaccination feeding tips clearly samjhaye.`,
          draft2: `Clinic sanitized aur hygienic hai. Staff polite tha aur vet ne care instructions ka written summary diya.`,
          draft3: `Stress-free kitten vaccination and caring vet doctor!`
        }
      ]
    } else if (isVaccination) {
      // Dog or general vaccination
      templates = [
        {
          draft1: `${animalPronoun} 7-in-1 vaccination aur deworming karwaya — vet ne gently handle kiya, pet poori visit mein calm aur comfortable raha.`,
          draft2: `Doctor ne post-vaccination feeding aur care ke baare mein clearly samjhaya. Clean hygienic clinic aur caring veterinary team.`,
          draft3: `Gentle pet vaccination, clean clinic and genuine veterinary care!`
        },
        {
          draft1: `${animalPronoun} vaccination schedule complete kiya yahan. Vet professional aur gentle tha, pet ko bilkul stress nahi hua.`,
          draft2: `Clinic ka atmosphere friendly aur calm tha. Appointment timely mila aur examination table properly sanitized thi.`,
          draft3: `Smooth pet vaccination experience and polite veterinary staff!`
        }
      ]
    } else if (isSkinAllergy && isCatItem) {
      templates = [
        {
          draft1: `Meri billi ka skin allergy diagnosis accurately kiya aur effective treatment di. 3 din mein visible relief dikhi, cat bilkul comfortable ho gayi.`,
          draft2: `Clinic sanitized hai aur staff polite hai. Vet ne billi ko gently examine kiya aur skin care instructions clearly di.`,
          draft3: `Gentle cat skin allergy treatment and quick relief. Caring veterinary team!`
        },
        {
          draft1: `Persian cat ki skin allergy ka treatment kiya — vet ne proper diagnosis ke baad targeted medicine di. Cat ka itching aur rash 4 din mein completely theek ho gaya.`,
          draft2: `Doctor ne allergy trigger identify karke diet aur skin care tips suggest kiye. Very thorough consultation, koi hurry nahi ki.`,
          draft3: `Accurate cat skin allergy diagnosis and stress-free feline care!`
        }
      ]
    } else if (isSkinAllergy) {
      templates = [
        {
          draft1: `${animalPronoun} skin allergy ka treatment kiya — vet ne proper diagnosis ke baad effective medicine di. 3-4 din mein visible improvement dikhi.`,
          draft2: `Clinic sanitized aur hygienic hai. Doctor ne allergy trigger identify karke dietary advice bhi di. Very caring team.`,
          draft3: `Effective pet skin allergy treatment and gentle veterinary care!`
        }
      ]
    } else if (isSurgery) {
      templates = [
        {
          draft1: `${animalPronoun} surgery yahan successfully karwai. Anesthesia safe tha aur post-surgery recovery guide clear di doctor ne.`,
          draft2: `Dedicated pet recovery area hai clinic mein. Staff ne surgery ke baad bhi follow-up call ki — genuinely caring service.`,
          draft3: `Safe pet surgery, experienced vet doctors and attentive post-op care!`
        },
        {
          draft1: `Pet surgery ke liye best clinic in area. Vet team experienced hai aur har step detail mein explain kiya.`,
          draft2: `Pre-surgery tests aur post-op care dono thorough the. Mera pet smooth recovery pe hai, bohot grateful hoon.`,
          draft3: `Trusted veterinary surgery care and smooth pet recovery!`
        }
      ]
    } else if (isEmergency) {
      templates = [
        {
          draft1: `${animalPronoun} critical case mein doctor ne quickly diagnose kiya, fluids shuru kiye aur recovery track pe hai. Caring veterinary team!`,
          draft2: `Doctor ne immediately attend kiya aur treatment shuru kiya — staff polite aur calm tha.`,
          draft3: `Prompt veterinary care and experienced vet doctor for critical pet cases!`
        },
        {
          draft1: `Urgent visit mein doctor ne promptly attend kiya aur treatment shuru kiya. Mera pet ab bahut better hai.`,
          draft2: `Staff caring aur vet highly experienced hai urgent pet cases mein.`,
          draft3: `Dependable urgent pet care and compassionate vet team!`
        }
      ]
    } else if (isCheckup) {
      templates = [
        {
          draft1: `${animalPronoun} routine health checkup kiya — vet ne thorough physical exam, weight check aur diet assessment kiya. Sab normal nikla!`,
          draft2: `Clinic clean aur organized hai. Doctor ne checkup ke baad preventive care tips clearly samjhaye.`,
          draft3: `Thorough routine pet health checkup and gentle vet consultation!`
        },
        {
          draft1: `Annual wellness checkup ke liye ${animalSubject} ko lekar gaya. Vet ne patiently sab examine kiya aur diet guide diya.`,
          draft2: `Clinic ka setup neat tha. Examination table sanitized aur vet team very professional aur gentle tha.`,
          draft3: `Clean pet clinic and unhurried wellness checkup for pets!`
        }
      ]
    } else if (isEarInfection) {
      templates = [
        {
          draft1: `${animalPronoun} ear infection properly clean karke drops prescribe ki. Doctor ne ghar pe care kaise karein clearly demonstrate kiya.`,
          draft2: `Clinic mein examination table sanitized thi aur vet gloves wear karke handle kiya. Hygienic aur professional setup.`,
          draft3: `Thorough ear infection care and hygienic veterinary setup!`
        }
      ]
    } else if (isSeniorCare) {
      templates = [
        {
          draft1: `${animalPronoun} arthritis ke liye joint supplement aur physiotherapy advice mili. Doctor ne age-appropriate diet chart bhi diya.`,
          draft2: `Doctor ne senior ${animalSubject} ke sath extra patience rakkhi. Unhurried consultation, sab kuch samjhaya.`,
          draft3: `Compassionate senior pet care and clear diet guidance!`
        }
      ]
    } else {
      // Generic pet service
      templates = [
        {
          draft1: `${animalPronoun} treatment yahan karwaya. Vet doctor ne bahut gently handle kiya, ${animalSubject} poori visit mein calm aur comfortable raha.`,
          draft2: `Clinic clean aur hygienic hai. Doctor ne clearly samjhaya kya karein aur kya nahi — thorough and caring vet.`,
          draft3: `Gentle veterinary doctor, clean clinic and caring pet handling!`
        },
        {
          draft1: `${animalPronoun} care ke liye visited — procedure smooth raha aur doctor ne post-care instructions clearly di.`,
          draft2: `Appointment timely mila. Staff polite tha aur examination table properly sanitized thi. Genuinely caring clinic.`,
          draft3: `Compassionate vet care and sanitized pet clinic!`
        }
      ]
    }

    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── DENTAL CLINIC ────────────────────────────────────────────────────────────
  if (
    c.includes("dental") || c.includes("dentist") || c.includes("tooth") ||
    c.includes("teeth") || c.includes("orthodont")
  ) {
    // Sub-typed: consultation vs actual procedure
    const isConsultation = itemLower.includes("consult") || itemLower.includes("opinion") || itemLower.includes("advice") || itemLower.includes("wisdom tooth consult") || itemLower.includes("second opinion")
    const isScaling = itemLower.includes("scaling") || itemLower.includes("polishing") || itemLower.includes("cleaning")
    const isRCT = itemLower.includes("root canal") || itemLower.includes("rct") || itemLower.includes("endodontic")
    const isExtraction = itemLower.includes("extraction") || itemLower.includes("wisdom tooth removal") || itemLower.includes("tooth pull")
    const isFilling = itemLower.includes("filling") || itemLower.includes("composite") || itemLower.includes("cavity")
    const isWhitening = itemLower.includes("whiten") || itemLower.includes("bleach") || itemLower.includes("bright smile")
    const isAligner = itemLower.includes("aligner") || itemLower.includes("braces") || itemLower.includes("orthodontic") || itemLower.includes("invisalign")

    let templates: { draft1: string; draft2: string; draft3: string }[]

    if (isConsultation) {
      // NEVER say "teeth fresh after consultation" — no procedure done
      templates = [
        {
          draft1: `${item} ke liye doctor ke paas gaya — comprehensive evaluation kiya aur clear treatment roadmap diya.`,
          draft2: `Doctor ne sab options clearly samjhaye bina pressure ke. Clinic environment clean aur professional tha.`,
          draft3: `Honest dental consultation and clear treatment explanation!`
        },
        {
          draft1: `Wisdom tooth ke baare mein expert opinion liya — doctor ne condition clearly explain ki aur realistic options bataye.`,
          draft2: `Consultation ke time koi hurry nahi thi. Doctor patient the aur sab questions ke detailed answers diye.`,
          draft3: `Patient dentist, clear advice and transparent dental consultation!`
        }
      ]
    } else if (isScaling) {
      templates = [
        {
          draft1: `Teeth scaling aur polishing karwai — plaque completely clean ho gaya aur teeth ekdum fresh aur smooth feel ho rahe hain after treatment!`,
          draft2: `Scaling ke baad sensitivity nahi hui. Clinic spotlessly clean hai aur sealed instruments use kiye — hygienic setup.`,
          draft3: `Gentle teeth scaling, hygienic clinic and smooth dental polishing!`
        },
        {
          draft1: `Professional scaling aur polishing done here. Stubborn tartar completely removed, teeth visibly brighter aur gums healthier feel ho rahe hain.`,
          draft2: `Appointment on time start hua. Dentist gentle the aur step-by-step sab explain kiya during the procedure.`,
          draft3: `Clean hygienic teeth scaling and comfortable dental care!`
        }
      ]
    } else if (isRCT) {
      templates = [
        {
          draft1: `Painless single-sitting root canal karwaya. Doctor bohot gentle the aur sterilization standards top class the.`,
          draft2: `RCT procedure mein bilkul dard nahi hua. Clinic ke sanitized environment ne confidence diya, sealed instruments use hue.`,
          draft3: `Painless root canal treatment and strict dental sterilization!`
        },
        {
          draft1: `Root canal completely painless tha — doctor skilled hain aur anesthesia perfectly effective tha throughout the procedure.`,
          draft2: `Post-RCT care instructions clearly di. Clinic clean aur well-equipped hai, follow-up appointment bhi timely schedule kiya.`,
          draft3: `Experienced dentist and comfortable painless root canal!`
        }
      ]
    } else if (isExtraction) {
      templates = [
        {
          draft1: `Wisdom tooth extraction bilkul painless tha. Doctor experienced hain aur extraction smooth raha without any post-surgical complications.`,
          draft2: `Post-extraction aftercare instructions clearly di — kya khana hai, kya nahi. Clinic hygienic aur staff very supportive tha.`,
          draft3: `Smooth painless tooth extraction and caring dental staff!`
        }
      ]
    } else if (isFilling) {
      templates = [
        {
          draft1: `Composite tooth filling karwaya — doctor ne cavity properly clean kiya aur filling natural tooth color se match kiya. Bilkul painless procedure tha.`,
          draft2: `Clinic neat aur sterilized instruments use kiye. Doctor ne filling ke baad bite adjustment carefully check kiya.`,
          draft3: `Natural-shade tooth filling and gentle dental procedure!`
        },
        {
          draft1: `Got composite filling done here. Procedure quick aur comfortable tha, aur natural tooth color se ekdum match kar raha hai.`,
          draft2: `Clear pricing mili — doctor ne treatment options aur filling material clearly samjhaye.`,
          draft3: `Clean tooth filling, transparent pricing and comfortable care!`
        }
      ]
    } else if (isWhitening) {
      templates = [
        {
          draft1: `Professional teeth whitening done here — shade visibly lighter ho gaya! Doctor ne gums protect karke safe bleaching kiya.`,
          draft2: `Procedure comfortable tha aur sensitivity minimal rahi. Doctor ne post-whitening diet tips clearly explain kiye.`,
          draft3: `Safe teeth whitening and noticeable natural brightness!`
        }
      ]
    } else if (isAligner) {
      templates = [
        {
          draft1: `Aligner/braces treatment yahan start kiya. Doctor ne digital scan se precise plan banaya aur clear milestones explain kiye.`,
          draft2: `Follow-up appointments punctual hain. Doctor attentive hain aur har visit mein progress clearly review kiya.`,
          draft3: `Structured aligner plan and attentive orthodontic care!`
        }
      ]
    } else {
      // Generic dental procedure
      templates = [
        {
          draft1: `${item} karwaya — completely painless procedure tha. Doctor ne sab clearly explain kiya aur clinic sterilized instruments use karti hai.`,
          draft2: `${item} ke liye visit kiya. Appointment punctual tha, clinic hygienic aur doctor very professional aur gentle the.`,
          draft3: `Gentle dental care, sanitized tools and transparent treatment!`
        },
        {
          draft1: `${item} done here — doctor bahut gentle the aur chair pe bilkul comfortable feel hua throughout the procedure.`,
          draft2: `Clear billing aur honest consultation. Doctor ne treatment clearly explain kiya aur follow-up schedule diya.`,
          draft3: `Comfortable dental visit and experienced dentist!`
        }
      ]
    }

    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── PIZZA RESTAURANT ─────────────────────────────────────────────────────────
  if (c.includes("pizza") || c.includes("pizzeria") || c.includes("wood fired") || c.includes("wood-fired")) {
    const templates = [
      {
        draft1: `${item} order kiya — crust perfectly crispy aur cheese pull rich tha. Best pizza in the area!`,
        draft2: `${item} tha menu mein, served hot aur fresh. Service quick aur attentive thi.`,
        draft3: `Crispy crust and hot fresh ${item}!`
      },
      {
        draft1: `Tried their ${item} — sourdough base light on stomach aur toppings generously fresh the.`,
        draft2: `${item} ka order freshly baked table pe aa gaya. Ambiance cozy aur staff very welcoming tha.`,
        draft3: `Fresh sourdough ${item} and cozy dining vibe!`
      }
    ]
    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── FAST FOOD / STREET SNACKS ─────────────────────────────────────────────────
  if (
    c.includes("dabeli") || c.includes("vadapav") || c.includes("vada pav") ||
    c.includes("samosa") || c.includes("sandwich") || c.includes("fast food") ||
    c.includes("street snack")
  ) {
    const templates = [
      {
        draft1: `${item} order kiya — super crispy, piping hot aur spicy chutney ka taste authentic tha. Bilkul paisa vasool!`,
        draft2: `${item} ke liye evening mein gaye — counter se piping hot parcel neatly pack kar diya.`,
        draft3: `Crispy hot ${item} with authentic chutney taste!`
      },
      {
        draft1: `${item} here is unmatched — fresh fried, generous fillings aur pocket-friendly price. Daily craving spot!`,
        draft2: `${item} ka taste ghar yaad dilata hai — spicy, hot aur authentic. Staff brisk aur polite tha.`,
        draft3: `Fresh ${item}, generous fillings and pocket-friendly rates!`
      }
    ]
    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── NON-VEG RESTAURANT ────────────────────────────────────────────────────────
  if (
    c.includes("non veg") || c.includes("non-veg") || c.includes("chicken") ||
    c.includes("mutton") || c.includes("biryani") || c.includes("mughlai") || c.includes("kebab")
  ) {
    const templates = [
      {
        draft1: `${item} order kiya — chicken tender, gravy aromatic aur dum ka taste proper authentic tha. Unforgettable meal!`,
        draft2: `${item} ke liye family ke sath aaye — serving hot, portion generous aur staff very courteous tha.`,
        draft3: `Aromatic authentic ${item} and warm family dining!`
      },
      {
        draft1: `Best ${item} in the city — well-marinated, smoky aur rich gravy, bilkul balanced aur non-oily. Worth every penny!`,
        draft2: `Tried ${item} here on a weekend — manager ne comfortable seating arrange ki. Great dining experience.`,
        draft3: `Rich smoky ${item} with generous portions and courteous service!`
      }
    ]
    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── LADIES BEAUTY PARLOUR ─────────────────────────────────────────────────────
  if (
    c.includes("beauty") || c.includes("parlor") || c.includes("parlour") ||
    c.includes("makeup") || c.includes("bridal") || c.includes("ladies salon")
  ) {
    // Sub-typed: skin service vs hair service vs makeup service
    const isSkinService = itemLower.includes("facial") || itemLower.includes("cleanup") || itemLower.includes("threading") || itemLower.includes("waxing") || itemLower.includes("bleach") || itemLower.includes("tan") || itemLower.includes("pedicure") || itemLower.includes("manicure") || itemLower.includes("hydra")
    const isHairService = itemLower.includes("hair spa") || itemLower.includes("keratin") || itemLower.includes("smoothening") || itemLower.includes("rebonding") || itemLower.includes("hair color") || itemLower.includes("global color") || itemLower.includes("highlights") || itemLower.includes("hair treatment")
    const isMakeupService = itemLower.includes("makeup") || itemLower.includes("bridal") || itemLower.includes("engagement look") || itemLower.includes("party makeup") || itemLower.includes("saree draping")

    let templates: { draft1: string; draft2: string; draft3: string }[]

    if (isHairService) {
      // NEVER mention skin glow or threading/waxing for hair services
      templates = [
        {
          draft1: `${item} karwaya — hair texture smooth aur silky ho gaya. Shine natural aayi hai aur frizz completely band ho gaya!`,
          draft2: `${item} ke liye appointment liya — treatment me step-by-step care tips samjhaye. Staff professional aur gentle tha.`,
          draft3: `Silky smooth hair and zero frizz after ${item}! Gentle hair care team.`
        },
        {
          draft1: `Gayi thi ${item} ke liye — results amazing the! Hair much more manageable ho gaye aur texture bohot improved hai.`,
          draft2: `Didi ne ${item} properly ache se kiya bina kisi hurry ke. Parlour comfortable tha aur hygiene top class thi.`,
          draft3: `Soft manageable hair and relaxing ${item} session!`
        },
        {
          draft1: `${item} yahan karwaya — branded products use kiye aur har step clearly explain kiya. Hair genuinely better feel ho rahe hain.`,
          draft2: `Appointment on time mili. Staff ne aftercare tips clearly bataye — kab shampoo karna, kya avoid karna.`,
          draft3: `Healthy shiny hair with genuine branded products for ${item}!`
        }
      ]
    } else if (isMakeupService) {
      templates = [
        {
          draft1: `${item} karwaya tha — makeup ekdum natural aur non-cakey tha. Daylight mein bhi perfectly set lag raha tha, function mein sab ne tareef ki!`,
          draft2: `Ready hone mein time exact estimate ke according laga. Updo dance ke baad bhi perfect set raha, bohot impressed thi!`,
          draft3: `Flawless natural ${item} that stayed fresh through the entire function!`
        },
        {
          draft1: `${item} se bilkul dreamy look mila — didi ne face shape ke hisab se makeup design kiya. Long-lasting aur flawless finish!`,
          draft2: `Staff patient aur creative tha. Reference photo se bhi better nikla — genuinely skilled makeup artist didi!`,
          draft3: `Graceful ${item} with long-lasting finish and attentive artists!`
        }
      ]
    } else {
      // Skin services — NEVER mention hair shine
      templates = [
        {
          draft1: `${item} karwaya — didi ke haath mein jadoo hai! Skin pe instant glow aur freshness aa gayi, results better than expected.`,
          draft2: `${item} ke liye appointment liya — parlour clean aur comfortable tha. Treatment mein koi hurry nahi ki.`,
          draft3: `Gentle ${item} and clean hygienic ladies parlour. Skin feels super fresh!`
        },
        {
          draft1: `Gayi thi ${item} ke liye — bohot relaxing experience tha. Products high quality, no irritation on skin whatsoever!`,
          draft2: `${item} ke baad skin ekdum soft, clean aur refreshed lag rahi thi. Didi bahut friendly aur hygienic tha.`,
          draft3: `Soft refreshed skin after ${item} with polite female staff!`
        },
        {
          draft1: `Pehli baar ${item} try kiya is parlour mein — painless aur gentle care mili, bilkul hygienic tools use kiye.`,
          draft2: `Saturday ko appointment thi aur treatment mein bilkul jaldi nahi ki. Disposable bedsheet aur sanitized tools use kiye the.`,
          draft3: `Painless ${item}, sanitized tools and courteous female beauticians!`
        },
        {
          draft1: `Branded products ke sath ${item} session bohot soothing tha. Face pe natural radiance clearly dikh raha hai.`,
          draft2: `Female staff supportive aur polite tha, bina kisi extra product upselling ke genuine care mili.`,
          draft3: `Soothing ${item} session with branded products and zero upselling!`
        },
        {
          draft1: `Weekend mein ${item} ke liye visit ki thi — sanitized setup aur gentle female beautician se full comfort mila.`,
          draft2: `Rates transparent hain aur appointment timing properly follow hui. Skin bilkul soft feel ho rahi hai.`,
          draft3: `Transparent pricing and comfortable ${item} experience for women!`
        }
      ]
    }

    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── MEN SALON / BARBER ────────────────────────────────────────────────────────
  if (c.includes("salon") || c.includes("barber") || c.includes("haircut") || c.includes("grooming") || c.includes("saloon")) {
    // Sub-typed: haircut vs facial/cleanup vs massage vs hair treatment
    const isFacialOrCleanup = itemLower.includes("facial") || itemLower.includes("cleanup") || itemLower.includes("charcoal") || itemLower.includes("de-tan") || itemLower.includes("detan") || itemLower.includes("mask") || itemLower.includes("skin")
    const isMassage = itemLower.includes("massage") || itemLower.includes("head massage") || itemLower.includes("scalp")
    const isHairTreatment = itemLower.includes("hair treatment") || itemLower.includes("hair wash") || itemLower.includes("hair spa") || itemLower.includes("dandruff") || itemLower.includes("hair fall")
    const isHaircut = itemLower.includes("haircut") || itemLower.includes("fade") || itemLower.includes("trim") || itemLower.includes("hair style") || itemLower.includes("beard") || itemLower.includes("shave") || itemLower.includes("contour")

    let templates: { draft1: string; draft2: string; draft3: string }[]

    if (isFacialOrCleanup) {
      // NEVER mention scissors/razor/haircut/head massage for facial
      templates = [
        {
          draft1: `${item} karwaya — instant freshness aur clean skin feel. Face pe natural glow aa gaya aur skin ekdum refreshed hai!`,
          draft2: `${item} ke liye visit kiya — waiting time minimal tha aur result clean nikla. Fair pricing, clean salon.`,
          draft3: `Fresh glowing skin after ${item}! Clean salon and gentle skin care.`
        },
        {
          draft1: `De-tan ${item} done yahan — dullness visibly kam hui aur skin tone even aur bright lag raha hai. Very satisfied!`,
          draft2: `Comfortable chair aur peaceful setup tha. Zero product upselling pressure — staff genuinely helpful tha.`,
          draft3: `Refreshing ${item} with zero upselling pressure and hygienic towels!`
        },
        {
          draft1: `Tried their ${item} — super relaxing. Products quality branded the aur professional application se face ekdum clean laga.`,
          draft2: `Staff patient tha aur skin type ke hisab se treatment customize kiya. Clean sanitized setup aur fresh towels use kiye.`,
          draft3: `Relaxing ${item} tailored for men's skin. Clean setup and fair rates!`
        }
      ]
    } else if (isMassage) {
      templates = [
        {
          draft1: `${item} karwaya — tension completely release ho gayi. Pressure points sahi jagah pe aur duration perfect tha, bohot refreshing!`,
          draft2: `${item} ke baad ekdum fresh aur light feel hua. Comfortable reclining chair aur clean fresh towels use kiye.`,
          draft3: `Deeply relaxing ${item} with clean towels and skilled hands!`
        },
        {
          draft1: `Best ${item} in the area — experienced hands, right pressure and very relaxing. Completely de-stressed after session.`,
          draft2: `Staff ne exactly jo bola tha wo type of massage deliver kiya. Zero hurry aur very professional setup.`,
          draft3: `Stress-relieving ${item} in a calm, hygienic men's salon!`
        }
      ]
    } else if (isHairTreatment) {
      templates = [
        {
          draft1: `${item} karwaya — scalp feels much healthier aur hair fall visibly reduced. Genuine branded products use kiye.`,
          draft2: `${item} ke baad staff ne aftercare tips clearly bataye — kab shampoo karna, kya products avoid karne. Very helpful!`,
          draft3: `Effective ${item} with genuine products and clear aftercare advice!`
        }
      ]
    } else {
      // Haircut, fade, beard, shave — scissors/razor are correct here
      templates = [
        {
          draft1: `${item} karwaya — bhai ne zero mistake se kiya. Fresh clean look mila, bilkul jaisa bola tha waisa. Very skilled!`,
          draft2: `${item} ke liye walk-in gaya — clean result nikla. Fair pricing aur neat setup.`,
          draft3: `Sharp ${item} exactly as asked! Clean setup and fair pricing.`
        },
        {
          draft1: `${item} done here — precision cut, clean lines aur attention to detail zabardast tha. Exactly what I asked for!`,
          draft2: `Tried ${item} here for the first time — staff patient tha aur exactly jo chaha wo deliver kiya. Definitely coming back.`,
          draft3: `Precision ${item} with clean lines and patient stylist!`
        },
        {
          draft1: `${item} karwaya — steady scissor work, clean finish aur symmetric shape bilkul perfect nikli. Professional groomer!`,
          draft2: `Sanitized tools use kiye. Fresh towel aur hygienic setup tha, quality pe koi compromise nahi kiya.`,
          draft3: `Hygienic tools, fresh towels and sharp ${item} finish!`
        }
      ]
    }

    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── BAKERY / CAKE SHOP ────────────────────────────────────────────────────────
  if (c.includes("cake") || c.includes("bakery") || c.includes("pastry") || c.includes("dessert") || c.includes("sweet")) {
    // Sub-typed: chocolate vs fruit vs custom vs pastry/slice
    const isFruitCake = itemLower.includes("fruit") || itemLower.includes("pineapple") || itemLower.includes("strawberry") || itemLower.includes("mango") || itemLower.includes("blueberry") || itemLower.includes("gateau") || itemLower.includes("fresh fruit")
    const isChocolateCake = itemLower.includes("chocolate") || itemLower.includes("truffle") || itemLower.includes("dark choc") || itemLower.includes("choco")
    const isCustomCake = itemLower.includes("custom") || itemLower.includes("fondant") || itemLower.includes("design") || itemLower.includes("personali")
    const isPastrySlice = itemLower.includes("pastry") || itemLower.includes("slice") || itemLower.includes("brownie") || itemLower.includes("eclair") || itemLower.includes("cookie")
    const isEgglessCake = itemLower.includes("eggless")

    let templates: { draft1: string; draft2: string; draft3: string }[]

    if (isFruitCake) {
      // NEVER say "rich chocolate flavor" or "bina extra charge" for fruit cake
      templates = [
        {
          draft1: `${item} order kiya — super fresh fruit pieces, light sponge aur perfectly balanced sweetness. Not too heavy on stomach!`,
          draft2: `${item} ke liye evening mein gaye — counter pe safe sealed packing ke sath box ready mili.`,
          draft3: `Fresh juicy fruits, soft sponge and balanced sweetness in ${item}!`
        },
        {
          draft1: `Tried their ${item} — juicy fresh fruits, light cream aur soft base. Kids aur elders dono ko pasand aaya!`,
          draft2: `${item} ki decoration aur fruit layering bohot neat thi — celebration ke liye bilkul fresh baked mila.`,
          draft3: `Light, refreshing ${item} with real fruit pieces and neat packing!`
        }
      ]
    } else if (isChocolateCake) {
      templates = [
        {
          draft1: `${item} order kiya — rich cocoa flavor, dense moist sponge aur bittersweet chocolate ganache perfect tha. Celebration special ho gayi!`,
          draft2: `${item} ke liye evening mein gaye — counter pe neat packing ke sath box ready mili.`,
          draft3: `Rich moist cocoa layers and pure chocolate indulgence in ${item}!`
        },
        {
          draft1: `Tried their ${item} — extra dark, rich chocolate intensity with ultra-moist texture. Best chocolate cake in the area!`,
          draft2: `${item} ke upar name piping bohot cleanly ki thi — presentation bilkul premium aayi!`,
          draft3: `Ultra-moist ${item} with neat presentation and rich cocoa taste!`
        }
      ]
    } else if (isCustomCake) {
      templates = [
        {
          draft1: `${item} banwaya — design exactly jaisa reference picture bheja tha waisa hi banaya. Quality aur presentation dono first class!`,
          draft2: `${item} customize kiya — staff patient tha aur har detail seriously liya. Sturdy secure packaging mili.`,
          draft3: `Exact custom design and delicious fresh sponge for ${item}!`
        },
        {
          draft1: `Ordered ${item} for a birthday — exact theme replica with beautiful topper. Everyone was amazed by the design!`,
          draft2: `${item} ke liye advance order diya — time pe ready tha aur sturdy box packing me safe raha.`,
          draft3: `Picture-perfect ${item} crafted with neat detailing and fresh cream!`
        }
      ]
    } else if (isPastrySlice) {
      templates = [
        {
          draft1: `${item} try kiya — perfectly fresh, light aur melt-in-mouth texture tha. Cream balanced aur not overly sweet!`,
          draft2: `Sunday ko counter pe visit kiya aur fresh daily-baked ${item} taste mein genuine aur hygienic mila.`,
          draft3: `Fresh daily-baked ${item} with light cream and authentic taste!`
        }
      ]
    } else {
      // Generic / Eggless cake
      templates = [
        {
          draft1: `${item} order kiya — super moist, perfectly sweet aur presentation photo se bhi zyada premium aayi!`,
          draft2: `${item} ke liye evening mein gaye — counter pe neat packing ke sath box jaldi ready ho gayi.`,
          draft3: `Super moist ${item} with hygienic counter and neat packaging!`
        },
        {
          draft1: `Tried their ${item} — sponge ultra soft tha aur cream absolutely fresh. Made our celebration perfect!`,
          draft2: `${item} pe name piping neatly karwayi — taste aur look dono family ko pasand aaye.`,
          draft3: `Soft fresh sponge and balanced sweetness in ${item}!`
        }
      ]
    }

    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── CAFE / COFFEE SHOP ────────────────────────────────────────────────────────
  if (c.includes("cafe") || c.includes("coffee") || c.includes("tea") || c.includes("bistro") || c.includes("beverage")) {
    const templates = [
      {
        draft1: `${item} order kiya — perfect temperature, rich flavour aur presentation Instagram-worthy thi!`,
        draft2: `${item} ke sath ek peaceful afternoon spend ki — Wi-Fi fast tha, music decent aur ambiance cozy.`,
        draft3: `Rich brewed ${item} and cozy peaceful cafe ambiance!`
      },
      {
        draft1: `Tried their ${item} — fresh brewed, excellent balance of sweet and bitter. Instant mood booster!`,
        draft2: `${item} served promptly with neat presentation. Comfortable seating aur calm vibe tha.`,
        draft3: `Fresh ${item}, calm ambiance and comfortable seating!`
      }
    ]
    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── GENERAL RESTAURANT / FOOD ─────────────────────────────────────────────────
  if (
    c.includes("restaurant") || c.includes("dining") || c.includes("dhaba") ||
    c.includes("food") || c.includes("thali") || c.includes("kitchen") ||
    c.includes("south indian") || c.includes("punjabi")
  ) {
    const templates = [
      {
        draft1: `${item} order kiya — garam, fresh aur taste mein bilkul ghar jaisi quality. Full paisa vasool!`,
        draft2: `${item} ke liye family ke sath aaye. Service quick thi aur sabka order sahi aur garam aa gaya.`,
        draft3: `Garam fresh ${item} with homestyle taste and quick service!`
      },
      {
        draft1: `Best ${item} I've had in this area — generous portion, authentic spices aur piping hot served.`,
        draft2: `${item} ka taste lag raha tha jaise ghar pe kha rahe hoon. Staff friendly aur serving prompt tha.`,
        draft3: `Authentic spices, generous portion and delicious ${item}!`
      },
      {
        draft1: `Weekend dinner pe ${item} try kiya, aroma aur masala balance bilkul perfect, light aur non-oily tha.`,
        draft2: `Dining hall clean aur comfortable tha. Waiter ne bina delay ke fresh rotis aur sides serve kiye.`,
        draft3: `Light non-oily ${item} in a clean family dining hall!`
      },
      {
        draft1: `Friends ke sath lunch pe ${item} mangwaya — quantity kafi achi thi aur presentation neat mili.`,
        draft2: `Billing fast thi aur table hygiene proper maintained thi. Family outings ke liye dependable spot hai.`,
        draft3: `Neat presentation, good quantity and tasty ${item}!`
      },
      {
        draft1: `Freshly prepared ${item} served hot — rich flavors aur pocket-friendly rates dono mile!`,
        draft2: `Counter aur table service dono smooth thi. Hospitality warm aur staff courteous raha.`,
        draft3: `Pocket-friendly ${item} with warm hospitality and fresh taste!`
      }
    ]
    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── CAR WASH / GARAGE ─────────────────────────────────────────────────────────
  if (c.includes("wash") || c.includes("car") || c.includes("detailing") || c.includes("auto") || c.includes("garage")) {
    // Sub-typed: exterior vs interior vs underbody vs ceramic
    const isUnderbody = itemLower.includes("underbody") || itemLower.includes("chassis") || itemLower.includes("undercarriage")
    const isInterior = itemLower.includes("interior") || itemLower.includes("vacuum") || itemLower.includes("dashboard") || itemLower.includes("seat") || itemLower.includes("boot") || itemLower.includes("cabin")
    const isCeramic = itemLower.includes("ceramic") || itemLower.includes("coating") || itemLower.includes("ppf") || itemLower.includes("nano")
    const isGlass = itemLower.includes("glass") || itemLower.includes("windshield") || itemLower.includes("windscreen")

    let templates: { draft1: string; draft2: string; draft3: string }[]

    if (isUnderbody) {
      // "showroom shine" is WRONG for underbody
      templates = [
        {
          draft1: `${item} karwaya — mud aur road grime completely blast ho gaya. Chassis visibly clean aur rust prevention ke liye bilkul ready!`,
          draft2: `${item} done professionally — high-pressure equipment use kiya aur wheel arches ke andar se sab clean ho gaya. Thorough job!`,
          draft3: `Thorough ${item} — mud and grime completely cleared from wheel arches!`
        },
        {
          draft1: `Professional ${item} done here — undercarriage ekdum clean ho gaya, monsoon ka mud completely remove hua.`,
          draft2: `Boys were detail-oriented, transparent billing ke sath sab clean kiya. Waiting lounge comfortable tha.`,
          draft3: `Clean undercarriage after ${item} and comfortable waiting lounge!`
        }
      ]
    } else if (isInterior) {
      templates = [
        {
          draft1: `${item} karwaya — car interior ekdum fresh aur clean ho gaya. Dashboard conditioning, mat cleaning sab properly kiya. Odor completely gone!`,
          draft2: `${item} done professionally — boot space aur door pockets bhi thoroughly clean kiye. Transparent pricing bina hidden add-ons ke.`,
          draft3: `Fresh odor-free cabin after ${item} and neat interior detailing!`
        }
      ]
    } else if (isCeramic) {
      templates = [
        {
          draft1: `${item} lagwaya — paint protection excellent aur hydrophobic water beading effect zabardast hai. Car ekdum showroom shine mein dikh rahi hai!`,
          draft2: `${item} application careful aur detailed tha. Staff professional tha aur har coat properly cure karne ke baad next lagaya.`,
          draft3: `Glossy ${item} finish with strong hydrophobic paint protection!`
        }
      ]
    } else if (isGlass) {
      templates = [
        {
          draft1: `${item} treatment karwaya — visibility dramatically improved aur rain water properly beads off. Night driving much safer now!`,
          draft2: `Quick professional job, no streaks, no smudges. ${item} done with quality solution.`,
          draft3: `Streak-free ${item} and crystal clear driving visibility!`
        }
      ]
    } else {
      // Exterior foam wash — "showroom shine" is correct here
      templates = [
        {
          draft1: `${item} karwaya — car ekdum showroom jaisi shine mein aa gayi. Scratch-free foam wash aur sparkling glass finish!`,
          draft2: `${item} done in estimated time — staff professional tha aur every corner properly cleaned. Impressed with the result!`,
          draft3: `Scratch-free ${item} with sparkling exterior finish!`
        },
        {
          draft1: `Snow foam ${item} karwaya — paint safe, finish brilliant aur alloys ekdum clean. Great value detailing service!`,
          draft2: `Sunday afternoon ko waiting lounge comfortable tha. Washing staff ne alloys ache se clean kiye.`,
          draft3: `Clean alloys, safe foam wash and polite crew for ${item}!`
        }
      ]
    }

    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── SAAS / AGENCY ─────────────────────────────────────────────────────────────
  if (c.includes("saas") || c.includes("software") || c.includes("customerpilot") || c.includes("agency") || c.includes("tech")) {
    // Sub-typed: match benefit to actual product (WhatsApp allowed ONLY here)
    const isLoyaltyWallet = itemLower.includes("loyalty") || itemLower.includes("stamp") || itemLower.includes("wallet") || itemLower.includes("rewards")
    const isReviewProduct = itemLower.includes("review") || itemLower.includes("google review") || itemLower.includes("qr review") || itemLower.includes("review standee")
    const isBillingProduct = itemLower.includes("billing") || itemLower.includes("invoice") || itemLower.includes("pos") || itemLower.includes("payment")
    const isWAProduct = itemLower.includes("whatsapp") || itemLower.includes("wa group") || itemLower.includes("wa booster") || itemLower.includes("campaign")
    const isOnboarding = itemLower.includes("onboard") || itemLower.includes("setup") || itemLower.includes("implement") || itemLower.includes("install")

    let d1: string, d2: string, d3: string

    if (isLoyaltyWallet) {
      d1 = `${item} implement kiya — customers ab WhatsApp pe apne stamps track karte hain. Repeat footfall 30% badh gaya store ka!`
      d2 = `${item} ka setup 5 minute mein hua bina kisi technical hassle ke. Dashboard simple aur live support fast hai.`
      d3 = `Simple ${item} helping retail stores grow repeat customer footfall!`
    } else if (isReviewProduct) {
      d1 = `${item} lagane ke baad Google reviews 3 mahine mein dramatically badh gaye. Counter standee pe customers khushi se scan karte hain!`
      d2 = `${item} ka QR system extremely easy hai — customer scan kare aur seconds mein review ready. ROI clearly dikh raha hai.`
      d3 = `High-converting ${item} for authentic Google Maps growth!`
    } else if (isBillingProduct) {
      d1 = `${item} use karne ke baad billing faster ho gayi aur PDF invoices directly WhatsApp pe customers ko milti hain. Very professional!`
      d2 = `${item} setup smooth tha. Team ne onboarding properly guide kiya aur sab features ache se samjhaye.`
      d3 = `Fast ${item} with clean digital billing and supportive team!`
    } else if (isWAProduct) {
      d1 = `${item} se weekly customer campaigns bhejne lage — repeat visits aur engagement dono badh gaya. Genuine ROI visible hai!`
      d2 = `${item} interface clean hai aur schedule feature bohot useful hai. Support team responsive aur helpful hai.`
      d3 = `Clean ${item} dashboard for steady repeat customer engagement!`
    } else if (isOnboarding) {
      d1 = `${item} 5 minute mein complete hua bina kisi technical knowledge ke. Team ne step-by-step guide kiya aur sab features properly set up kiye.`
      d2 = `${item} experience seamless tha. Vadodara team very responsive hai aur onboarding ke baad bhi support available hai.`
      d3 = `Smooth 5-minute ${item} and responsive local support team!`
    } else {
      d1 = `${item} implement kiya — results immediately visible hue. Best software for Indian retail merchants!`
      d2 = `${item} se store ka Google Maps ranking aur customer retention dono improve hua. Genuinely worth the investment.`
      d3 = `Dependable ${item} built for Indian retail store growth!`
    }

    return { draft1: d1, draft2: d2, draft3: d3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── GENERIC CLINIC / DOCTOR (Human medical — NOT pet) ────────────────────────
  if (c.includes("clinic") || c.includes("hospital") || c.includes("doctor")) {
    const templates = [
      {
        draft1: `${item} ke liye doctor ke paas gaya — thorough consultation, accurate diagnosis aur clear prescription mili.`,
        draft2: `${item} done here — doctor patient the aur bina hurry kiye sab samjhaya. Clean hygienic clinic environment.`,
        draft3: `Thorough ${item} consultation and clean hygienic clinic!`
      }
    ]
    const t = pickTemplate(templates)
    return { draft1: t.draft1, draft2: t.draft2, draft3: t.draft3, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // ── DEFAULT FALLBACK (completely generic) ─────────────────────────────────────
  return {
    draft1: `${item} liya — quality genuine thi, professional experience aur seamless transaction. Definitely coming back!`,
    draft2: `${item} ke liye visit kiya — counter par staff courteous aur quick tha. Satisfied customer.`,
    draft3: poolEntry.draft3,
    engine_used: "tier3_fallback",
    model_used: "tier3_static"
  }
}

/**
 * Calls AI (Gemini or Groq fallback) with strict Merchant KeywordProfile grounding.
 * Enforces Whitelists, Blacklists, and Gender Persona to guarantee ZERO context hallucinations.
 */
export async function generateDynamicReviewDraft(params: {
  businessCategory: string
  businessType?: string
  productName?: string
  merchantName?: string
  menuItems?: string[]
  seed?: string
  merchantKeywordProfile?: string | null
  merchantCity?: string
  merchantAddress?: string
  pastPublicReviews?: string[]
}): Promise<ReviewDraftOptions> {
  const { businessCategory, businessType, productName, merchantName, menuItems, seed, merchantKeywordProfile, merchantCity, merchantAddress, pastPublicReviews } = params

  // 1. Resolve merchant's active KeywordProfile (SEO, AEO, GEO, and Blacklist)
  const profile: KeywordProfile = resolveMerchantKeywordProfile({
    name: merchantName,
    category: businessCategory,
    businessType: businessType,
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

  // 3. Category-appropriate authentic context angle & archetype selection
  const categoryAngles = getCategoryAuthenticAngles(profile.categoryKey)
  const randomAngle = categoryAngles[Math.floor(Math.random() * categoryAngles.length)]
  const timestampSeed = Date.now().toString(36)

  // Dynamic Archetypes for Anti-Repetition
  const OPTICAL_ARCHETYPES = [
    {
      label: "Screen Worker (Blue-Cut Computer Specs)",
      need: "blue-cut anti-glare screen glasses for laptop coding and monitor work",
      angle: "eye strain and headache relief, featherweight frame",
      avoid: "progressive, bifocal, sunglasses, kids"
    },
    {
      label: "Senior / Middle-Aged (Progressive Multifocal)",
      need: "progressive multifocal lenses for reading and distance",
      angle: "smooth corridor switch, zero peripheral distortion, accurate power",
      avoid: "gaming, computer glasses, sunglasses, kids"
    },
    {
      label: "Fashion & Highway Driving (Polarized Sunglasses)",
      need: "polarized UV400 branded sunglasses for road trips and daylight",
      angle: "glare-free driving vision, stylish look, compliments, sturdy hinges",
      avoid: "progressive, power checkup, kids"
    },
    {
      label: "Parent for School Child (Kids Eyewear)",
      need: "flexible unbreakable eyewear frames for kids",
      angle: "gentle friendly optometrist eye test, durable play-proof flexible frame",
      avoid: "progressive, computer coding, reading bifocal"
    },
    {
      label: "Executive / Professional (Rimless Titanium)",
      need: "rimless titanium featherweight spectacles",
      angle: "sophisticated executive look, zero pressure marks on nose bridge, precision fit",
      avoid: "sunglasses, kids, emergency repair"
    },
    {
      label: "Quick Frame Maintenance (Emergency Repair)",
      need: "loose screw tightening and nose pad replacement",
      angle: "quick 5-minute fix, ultrasonic machine cleaning, polite helpful gesture",
      avoid: "new eye test, progressive lenses"
    },
    {
      label: "Contact Lens Wearer (Disposable Lenses)",
      need: "daily disposable contact lenses",
      angle: "comfort during long wear, clear hygienic insertion training by optometrist, fresh stock",
      avoid: "spectacle frame, sunglasses"
    },
    {
      label: "Night Driver (Anti-Glare Yellow Tint)",
      need: "night drive yellow tint anti-glare glasses",
      angle: "high-beam light glare reduction, relaxed night driving, certified lens coating",
      avoid: "progressive, contact lenses, kids"
    },
    {
      label: "Eye Testing & Clinical Checkup",
      need: "computerized eye power testing with digital autorefractor",
      angle: "precise cylindrical & spherical power check, patient optometrist explanation, zero rush",
      avoid: "sunglasses, repair, kids play"
    }
  ]

  const categoryRealities = getCategoryScopedRealities(profile.categoryKey)
  const assignedVibe = categoryRealities[Math.floor(Math.random() * categoryRealities.length)]

  let assignedArchetype = OPTICAL_ARCHETYPES[Math.floor(Math.random() * OPTICAL_ARCHETYPES.length)]
  const focalLower = focalItem.toLowerCase()
  if (focalLower.includes("eye test") || focalLower.includes("power") || focalLower.includes("autorefractor") || focalLower.includes("optometrist") || focalLower.includes("pupil")) {
    assignedArchetype = OPTICAL_ARCHETYPES[8]
  } else if (focalLower.includes("blue") || focalLower.includes("screen") || focalLower.includes("gaming") || focalLower.includes("computer glasses") || focalLower.includes("computer protect")) {
    assignedArchetype = OPTICAL_ARCHETYPES[0]
  } else if (focalLower.includes("progressive") || focalLower.includes("multifocal") || focalLower.includes("bifocal")) {
    assignedArchetype = OPTICAL_ARCHETYPES[1]
  } else if (focalLower.includes("sunglass") || focalLower.includes("polarized") || focalLower.includes("uv400")) {
    assignedArchetype = OPTICAL_ARCHETYPES[2]
  } else if (focalLower.includes("kid") || focalLower.includes("flexible") || focalLower.includes("unbreakable")) {
    assignedArchetype = OPTICAL_ARCHETYPES[3]
  } else if (focalLower.includes("rimless") || focalLower.includes("titanium")) {
    assignedArchetype = OPTICAL_ARCHETYPES[4]
  } else if (focalLower.includes("repair") || focalLower.includes("screw") || focalLower.includes("nose pad") || focalLower.includes("clean")) {
    assignedArchetype = OPTICAL_ARCHETYPES[5]
  } else if (focalLower.includes("contact") || focalLower.includes("solution")) {
    assignedArchetype = OPTICAL_ARCHETYPES[6]
  } else if (focalLower.includes("night")) {
    assignedArchetype = OPTICAL_ARCHETYPES[7]
  }

  // Removed old global STORE_REALITIES array in favor of categoryRealities above

  // 4. Prepare fallback immediately
  const fallback = getDynamicFallbackReview(profile.categoryKey || businessCategory, focalItem, seed || timestampSeed)

  // 5. Check active API keys
  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  const groqKey = process.env.AI_API_KEY?.trim()
  const groqUrl = process.env.AI_API_URL?.trim() || "https://api.groq.com/openai/v1/chat/completions"
  const groqModel = process.env.AI_MODEL?.trim() || "openai/gpt-oss-120b"

  if (!geminiKey && !groqKey) {
    return { ...fallback, engine_used: "tier3_fallback", model_used: "tier3_static" }
  }

  // Post-generation Negative Blacklist + Grammar + Recipe Guard
  const sanitizeStrict = (text: string, fallbackText: string): string => {
    let res = scrubBannedBuzzwords(text)
    for (const banned of profile.strictlyNotAllowed) {
      if (banned.length >= 3) {
        const re = new RegExp(`\\b${banned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
        res = res.replace(re, "")
      }
    }
    res = res.replace(/\s+/g, " ").replace(/\s+([.,!])/g, "$1").trim()
    if (hasBrokenGrammar(res) || hasRecipeOrAdviceTone(res)) {
      return fallbackText
    }
    return res
  }

  // 6. Audience Persona & Gender Grammar Directive
  let personaInstruction = "Tone: Casual, natural Indian English or conversational Hinglish like a genuine local customer."
  if (profile.categoryKey === "optical_store") {
    personaInstruction = `STRICT OPTICAL & EYEWEAR PERSONA RULE:
- This is an OPTICIAN & EYEWEAR SHOWROOM (spectacles, prescription glasses, progressive lenses, blue-cut computer glasses, sunglasses).
- Perspective: Customer getting computerized eye power testing, purchasing new spectacle frames, progressive lenses, contact lenses, or sunglasses.
- Praising: Accurate computerized eye test, crystal clear progressive vision, lightweight durable frames, blue-cut anti-glare screen protection, polite optometrist and neat fitting.
- ABSOLUTELY NEVER mention cakes, pastries, bakery, burger, pizza, food delivery, pets, dogs, cats, or teeth/dentist.`
  } else if (profile.categoryKey === "saree_palace" || profile.categoryKey === "clothing") {
    personaInstruction = `STRICT SAREE & ETHNIC WEAR PERSONA RULE:
- This is a SILK SAREE PALACE & BRIDAL ETHNIC WEAR SHOWROOM.
- Perspective: Customer / Bride / Family shopping for wedding, reception, festive function, or family ceremony.
- Praising: Authentic Pethapur silk sarees, pure fabric, rich zari border, bridal chaniya choli, patient staff showing dozens of designs, comfortable showroom ambience.
- ABSOLUTELY NEVER mention pets, dogs, cats, animals, vet, clinic, doctor, medicine, cakes, or food delivery.`
  } else if (profile.categoryKey === "saas_agency") {
    personaInstruction = `STRICT B2B MERCHANT PERSONA RULE:
- The reviewer is an authentic local retail store owner / merchant / shop manager writing for CustomerPilot (SaaS platform).
- STRICT FEATURE-TO-BENEFIT LOCK:
  * If the item is "WhatsApp loyalty wallet / digital stamps": praise ONLY repeat customer visits, digital stamp tracking, and customer retention — NEVER mention Google reviews!
  * If the item is "Smart AI Google review QR / Auto-reply": praise ONLY genuine Google reviews, fast owner replies, and local visibility — NEVER use unrealistic multipliers like "10x" or "5x".
- ABSOLUTELY NEVER mention ordering food, haircut, doctor visit, cakes, thali, or personal services.`
  } else if (profile.categoryKey === "pet_clinic") {
    personaInstruction = `STRICT PET OWNER PERSONA RULE (CRITICAL — READ CAREFULLY):
- This is a VETERINARY / PET CLINIC. The reviewer is a PET OWNER, NOT a human patient.
- The reviewer visits to get their DOG, CAT, RABBIT, or other ANIMAL treated — not themselves.
- ALWAYS use pet owner language: "mera dog", "meri billi", "mera puppy", "hamare pet", "mera Golden Retriever", "meri Persian cat".
- Use vet-specific terms: "vaccination", "deworming", "vet doctor", "veterinary", "animal", "pet", "parvovirus", "tick fever", "drip treatment", "neutering", "spaying", "pet surgery".
- ABSOLUTELY NEVER write "mera fever", "meri headache", "doctor consultation for me", "medicine for me", "mujhe diagnosis di" — these are human medical phrases STRICTLY FORBIDDEN here.
- ABSOLUTELY NEVER mention food delivery, parcel, cake, haircut, or grooming (human).
- Example correct phrases: "Mera dog ka vaccination karwaya", "Vet ne meri billi ko gently handle kiya", "Puppy ki deworming done, clinic clean thi", "Doctor ne pet ki condition clearly explain ki".`
  } else if (profile.categoryKey === "dental_clinic") {
    personaInstruction = `STRICT DENTAL PATIENT PERSONA RULE:
- This is a DENTAL CLINIC. The reviewer is a human dental patient.
- Use dental-specific terms matching ONLY the requested service: "root canal", "scaling", "polishing", "tooth filling", "dental checkup", "orthodontic", "braces", "wisdom tooth extraction".
- ABSOLUTELY NEVER mention food delivery, animal/pet, biryani, haircut, or non-dental medical terms.
- Example: "Root canal completely painless tha", "Teeth scaling ke baad sensitivity nahi hui", "Doctor ne treatment options clearly explain kiye".`
  } else if (profile.audiencePersona === "Female_Only") {
    personaInstruction = `STRICT FEMININE GRAMMAR RULE (CRITICAL):
- The reviewer is STRICTLY a woman/girl writing for a ladies beauty parlor.
- Use natural feminine Hindi/Hinglish verbs: "gayi thi", "karwaya", "didi ne bohot ache se kiya", "bohot soft lag rahi hai".
- ABSOLUTELY NEVER use masculine words like "gaya tha", "bhai", "bro", "barber".
- ABSOLUTELY NEVER mention food, chai, tea, cake, snacks, dinner, or delivery.`
  } else if (profile.audiencePersona === "Male_Only") {
    personaInstruction = `STRICT MASCULINE GRAMMAR RULE:
- The reviewer is a male customer writing for men's grooming/salon.
- Use masculine verbs: "karwaya", "bhai ne time lekar banaya".
- ABSOLUTELY NEVER mention ladies bridal makeup, saree, waxing, delivery, or food.`
  } else if (profile.audiencePersona === "Family_Kids") {
    personaInstruction = `STRICT FAMILY TONE:
- Family perspective: "Family ke sath dinner kiya", "kids loved it", "parents ke sath gaye the".`
  }

  // 7. Dynamic Variable Grounding Prompt
  const allowedSample = profile.allowedSeoEntities.slice(0, 20).join(", ")
  const aeoSample = profile.allowedAeoAnswers.slice(0, 8).join(", ")
  const bannedSample = profile.strictlyNotAllowed.slice(0, 50).join(", ")

  // Category-specific anti-hallucination guard lines injected into prompt
  let categoryGuard = ""
  if (profile.categoryKey === "optical_store") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (OPTICIAN, EYEWEAR & SPECTACLES):
- BUSINESS TYPE: OPTICIAN / EYEWEAR STORE. NOT a bakery, not food, not a pet clinic, not dental.
- Assigned Customer Archetype: ${assignedArchetype.label}
- Specific Visit Need: ${assignedArchetype.need} (${assignedArchetype.angle})
- ANTI-REPETITION MANDATE (CRITICAL):
  * Focus ONLY on this specific customer goal: "${assignedArchetype.need}".
  * NEVER combine unrelated services! If this review is about ${assignedArchetype.label}, DO NOT mention ${assignedArchetype.avoid}!
  * FORBIDDEN FORMULAIC OPENINGS: DO NOT start your review with:
    - "The optometrist performed..."
    - "${profile.businessName} provided..."
    - "Visited ${profile.businessName}..."
    - "Got my eye testing done..."
  * Start dynamically and naturally: start with the need, the product, the comfort, or the experience.
  * FOR DRAFT 2: DO NOT write "thoda rush tha par service polite thi". Instead, naturally reflect this real visit context: "${assignedVibe}". Rephrase it in casual conversational Hinglish.
  * STRICTLY FORBIDDEN: Words like "cake", "bakery", "pastry", "food", "puppy", "dog", "cat", "teeth", "clinic doctor" are BANNED.`
  } else if (profile.categoryKey === "saree_palace" || profile.categoryKey === "clothing") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (SILK SAREE PALACE & BRIDAL ETHNIC WEAR):
- BUSINESS TYPE: SILK SAREE PALACE & BRIDAL WEAR SHOWROOM. NOT a pet clinic, not medical, not food.
- Reviewer = Woman / Bride / Family member shopping for authentic sarees and wedding wear.
- MUST USE SAREE & ETHNIC TERMS: silk saree, Pethapur craft, pure fabric, rich zari border, bridal lehenga, wedding shopping, patient sales staff, comfortable showroom.
- STRICTLY FORBIDDEN: Words like "puppy", "dog", "cat", "pet", "vaccination", "clinic", "doctor", "cake", "burger", "delivery" are BANNED.`
  } else if (profile.categoryKey === "pet_clinic") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (PET CLINIC — VETERINARY):
- BUSINESS TYPE: PET CLINIC / VETERINARY HOSPITAL. NOT a human hospital or medical clinic.
- Reviewer = PET OWNER. Subject = PET (dog/cat/puppy/kitten/rabbit). NOT a human patient.
- LEGAL PROHIBITION: Words "mera fever", "meri headache", "doctor consultation for me personally", "mujhe medicine di", "meri diagnosis", "my illness" are COMPLETELY BANNED.
- MUST USE PET TERMS: dog, cat, puppy, kitten, billi, kutte, pet, animal, vet, vaccination, deworming, parvovirus, tick fever, spaying, neutering, IV drip.
- EXAMPLE CORRECT: "Mera Labrador ka vaccination karwaya — vet bohot gentle tha."
- EXAMPLE WRONG (NEVER DO THIS): "Doctor consultation for me was thorough", "my fever was cured", "prescribed medicine for me".`
  } else if (profile.categoryKey === "dental_clinic") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (DENTAL CLINIC):
- BUSINESS TYPE: DENTAL / TEETH CLINIC. NOT general medicine, not veterinary, not food.
- Reviewer = human dental patient getting teeth/gum treatment.
- MUST USE DENTAL TERMS matching ONLY the requested service (e.g., root canal, teeth scaling, polishing, filling, braces, extraction, dental consultation, teeth whitening).
- NEVER mention food ordering, delivery, haircut, animal/pet, biryani, or general medicine.`
  } else if (profile.categoryKey === "fast_food" || profile.categoryKey === "pizza_restaurant" || profile.categoryKey === "non_veg_restaurant") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (FOOD BUSINESS):
- BUSINESS TYPE: FOOD RESTAURANT / EATERY.
- Reviewer = customer who visited to EAT. Focus on taste, freshness, service speed, ambiance.
- NEVER mention doctor, clinic, medicine, haircut, salon, car wash, or software.`
  } else if (profile.audiencePersona === "Female_Only" || profile.categoryKey === "beauty_parlour") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (LADIES BEAUTY PARLOUR):
- BUSINESS TYPE: LADIES BEAUTY PARLOUR. Reviewer = woman/girl customer.
- MUST USE feminine language and beauty terms (threading, facial, waxing, hair spa, cleanup, bridal makeup).
- STRICTLY FORBIDDEN: NEVER mention masculine haircut/fade, beard, men grooming, pets, animals, clinic doctor, or food delivery.`
  } else if (profile.audiencePersona === "Male_Only" || profile.categoryKey === "salon_men") {
    categoryGuard = `
CATEGORY-SPECIFIC HARD RULES (MEN SALON / BARBERSHOP):
- BUSINESS TYPE: MEN SALON / BARBER. Reviewer = male customer getting haircut/grooming.
- MUST USE masculine language and grooming terms (haircut, fade, beard styling, trim, head massage, hair wash, facial cleanup).
- STRICTLY FORBIDDEN: NEVER mention pets, dogs, cats, puppy, kitten, pet grooming, vet, clinic, doctor, ladies makeup, bridal saree, cake, or food delivery.`
  }

  // 8. Authentic Real GBP Past Reviews Style Inspiration (Few-Shot Grounding)
  const pastReviewsPool = (pastPublicReviews && pastPublicReviews.length > 0)
    ? pastPublicReviews
    : (profile.pastPublicReviews && profile.pastPublicReviews.length > 0)
      ? profile.pastPublicReviews
      : []

  const validPastReviews = pastReviewsPool
    .filter((r) => typeof r === "string" && r.trim().length >= 10)
    .slice(0, 3)

  let pastReviewStyleGuide = ""
  if (validPastReviews.length > 0) {
    pastReviewStyleGuide = `\n6. REAL PAST GOOGLE MAPS REVIEWS (STYLE & TONE INSPIRATION):\nBelow are authentic 5-star customer reviews previously left by real customers on "${profile.businessName}"'s Google Maps profile:\n${validPastReviews.map((r, i) => `   - Example ${i + 1}: "${r.replace(/"/g, "'").trim()}"`).join("\n")}\nDirectives:\n- Match the exact conversational style, Hinglish/English balance, and real emotional warmth of these genuine reviews.\n- Do NOT copy them word-for-word; write completely new, fresh drafts following their natural cadence.\n`
  }

  const systemPrompt = `[ROLE & OBJECTIVE]
You are CustomerPilot's authentic Indian consumer review drafting engine.
Generate 3 distinct, natural, human Google Maps reviews (12 to 20 words each) for "${profile.businessName}".
${categoryGuard}

HARD 1ST-PERSON CUSTOMER VOICE LOCK (NON-NEGOTIABLE):
- ALL 3 drafts MUST be written strictly in 1st-person customer voice ("I", "My", "We", "Maine", "Mere/Meri", "Humne") describing an actual visit or purchase.
- STRICTLY FORBIDDEN: cooking recipes, how-to tips, or post-care advice to readers ("mild shampoo use karo", "dhimi aanch par garam karo", "fridge mein rakho") OR 3rd-person narrator voice ("Bhai ne... bhai ka look").

HARD FOCAL-ITEM LOCK & NATURAL KEYWORD SHORTHAND (NON-NEGOTIABLE):
- Requested Focal Item: "${focalItem}"
- ALL THREE drafts (draft_1, draft_2, AND draft_3) MUST stay 100% anchored ONLY to "${focalItem}" and its exact service/animal sub-type.
- NATURAL SHORTHAND RULE (ANTI-STUFFING):
  * draft_1: Use the exact requested item keyword "${focalItem}" naturally ONCE.
  * draft_2 & draft_3: Use natural casual customer shorthand instead of repeating the full 4-5 word catalog title verbatim (e.g., "snow foam wash" instead of "complete snow foam exterior wash"; "root canal" instead of "painless single-sitting root canal"; "truffle cake" instead of "Dutch Chocolate Truffle Cake").
- NEVER introduce a second or unrequested service in draft_2 or draft_3:
  * Pet Clinic: If item is about a cat or skin allergy -> NEVER mention dog, puppy, kutta, kutte, vaccination, or deworming.
  * Men's Salon: If item is a facial/cleanup -> NEVER mention haircut, fade, beard, scissors, razor, or head massage.
  * Beauty Parlour: If item is a hair treatment (keratin/spa) -> NEVER mention threading, waxing, facial, or skin glow.
  * Dental Clinic: If item is a consultation -> NEVER claim teeth feel clean, scaled, or filled.
  * Bakery: If item is a fruit cake -> NEVER mention chocolate flavor.
- HINGLISH GRAMMAR & TONE:
  * Write in natural Indian English or conversational Hinglish with correct gender/verb agreement: "Mere puppy ka" (not "Mera puppy ka"), "bill clear tha" (not "clear thi"), "box ready mila" (not "mili"), "vet doctor gentle the" (not "tha"), and end every sentence with proper punctuation.
  * NEVER use Western AI fluff ("sweet, fruity delight", "Great service!") or unrealistic numeric/medical hype ("10x", "5x", "100% guaranteed", "instant relief", "symptoms turant kam", "cleared acne marks instantly").

MERCHANT STRICT BOUNDARIES:
1. Target Customer Persona:
${personaInstruction}

2. ALLOWED Offerings (Focus ONLY on "${focalItem}" — do not mix other items):
${allowedSample}

3. ALLOWED Vibe / Context Signals:
${aeoSample}

4. Occasion / Context Angle:
${randomAngle} (Focus product: ${focalItem})

5. STRICTLY BANNED ENTITIES (DO NOT EVER MENTION ANY OF THESE):
${bannedSample}
${pastReviewStyleGuide}
CRITICAL ANTI-HALLUCINATION RULES:
- NEVER invent or hallucinate specific staff, stylist, barber, or doctor names (e.g., Rahul, Priya, Dr. Sharma) unless explicitly provided in input.
- NEVER invent unverified store promises, AC, or freebies: NO "AC", "no hidden charges", "koi hidden charge nahi", "24/7", "24-hour", "X-ray", "zero waiting", "bina extra charge", "bina koi extra charge", "free delivery", "15+ frames", "15 minutes only", or "WhatsApp ping" (WhatsApp is allowed ONLY for SaaS/Software).
- NEVER use clichés like "rush tha", "thoda rush", "thodi bheed", or awkward openers like "Suno,".
- DO NOT use "Store Special" or banned buzzwords ("spot-on", "top-notch", "game-changer", "hidden gem", "delve", "exceptional", "outstanding", "highly recommended").
- Every single draft MUST feel 100% human, casual, and authentic.

[OUTPUT FORMAT]
Return ONLY a valid parseable JSON object (NO <think> tags, NO markdown prose):
{
  "draft_1": "12 to 20 words 1st-person customer review using ${focalItem}",
  "draft_2": "12 to 20 words 1st-person conversational Hinglish using casual shorthand for ${focalItem} reflecting '${assignedVibe}'",
  "draft_3": "8 to 14 words punchy 1st-person 1-liner using casual shorthand for ${focalItem}"
}`

  // A. Try Gemini if configured
  if (geminiKey) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai")
      const genAI = new GoogleGenerativeAI(geminiKey)
      const candidates = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash", "gemini-flash-latest"]

      const geminiPromise = (async (): Promise<{ text: string; modelName: string } | null> => {
        for (const modelName of candidates) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: { temperature: 0.90 }
            })
            const res = await model.generateContent(systemPrompt)
            const text = (await res.response).text().trim()
            if (text && text.includes("{")) return { text, modelName }
          } catch (_) {
            continue
          }
        }
        return null
      })()

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6500))
      const geminiResult = await Promise.race([geminiPromise, timeoutPromise])

      if (geminiResult) {
        const parsed = extractCleanJsonFromLlmResponse(geminiResult.text)
        if (parsed && parsed.draft_1 && parsed.draft_2) {
          return {
            draft1: sanitizeStrict(String(parsed.draft_1), fallback.draft1),
            draft2: sanitizeStrict(String(parsed.draft_2), fallback.draft2),
            draft3: parsed.draft_3 ? sanitizeStrict(String(parsed.draft_3), fallback.draft3) : fallback.draft3,
            engine_used: "gemini",
            model_used: geminiResult.modelName
          }
        }
      }
    } catch (err: any) {
      console.warn("[DynamicReviewEngine] Gemini attempt failed:", err?.message)
    }
  }

  // B. Try Groq / OpenAI compatible LLM with multi-model failover on 429 / error
  if (groqKey) {
    const groqCandidates = Array.from(
      new Set([groqModel, "openai/gpt-oss-20b", "qwen/qwen3.8-27b"])
    )
    for (const candidateModel of groqCandidates) {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 4500)

        const res = await fetch(groqUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`,
            "User-Agent": "CustomerPilot/1.0"
          },
          body: JSON.stringify({
            model: candidateModel,
            messages: [
              { role: "system", content: "You generate authentic Indian Google reviews in strict JSON format. Stay strictly anchored to the requested focal item across all 3 drafts. Output ONLY valid JSON with no <think> tags." },
              { role: "user", content: systemPrompt }
            ],
            temperature: 0.90,
            response_format: { type: "json_object" }
          }),
          signal: controller.signal
        })

        clearTimeout(timer)
        if (res.ok) {
          const data = await res.json()
          const content = data.choices?.[0]?.message?.content?.trim()
          if (content) {
            const parsed = extractCleanJsonFromLlmResponse(content)
            if (parsed && parsed.draft_1 && parsed.draft_2) {
              return {
                draft1: sanitizeStrict(String(parsed.draft_1), fallback.draft1),
                draft2: sanitizeStrict(String(parsed.draft_2), fallback.draft2),
                draft3: parsed.draft_3 ? sanitizeStrict(String(parsed.draft_3), fallback.draft3) : fallback.draft3,
                engine_used: "groq",
                model_used: candidateModel
              }
            }
          }
        } else {
          const errText = await res.text().catch(() => "")
          console.warn(`[DynamicReviewEngine] Groq (${candidateModel}) returned status ${res.status}: ${errText.slice(0, 150)}`)
        }
      } catch (err: any) {
        console.warn(`[DynamicReviewEngine] Groq (${candidateModel}) attempt failed:`, err?.message)
      }
    }
  }

  return { ...fallback, engine_used: "tier3_fallback", model_used: "tier3_static" }
}
