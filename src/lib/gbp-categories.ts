import { db } from "@/lib/db"

export interface GbpCategoryItem {
  id: string
  label: string
  group: string
  icon: string
  googleType: string
  reviewKeywords: string[]
  isCustom?: boolean
  defaultLoyaltyRule: {
    stamps: number
    reward: string
    value: number
  }
}

export const OFFICIAL_GBP_CATEGORIES: GbpCategoryItem[] = [
  // ── Food & Dining ──────────────────────────────────────────────────────────
  {
    id: "bakery",
    label: "Bakery & Cake Shop",
    group: "Food & Dining",
    icon: "🎂",
    googleType: "bakery",
    reviewKeywords: ["custom cake", "truffle cake", "pastry", "eggless", "fresh sponge", "delivery"],
    defaultLoyaltyRule: { stamps: 8, reward: "Free Premium Pastry or ₹150 Off", value: 150 }
  },
  {
    id: "punjabi_restaurant",
    label: "Punjabi / North Indian Restaurant",
    group: "Food & Dining",
    icon: "🍲",
    googleType: "restaurant",
    reviewKeywords: ["dal makhani", "paneer butter masala", "garlic naan", "authentic taste", "family dinner"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Starter or ₹200 Off on Bill", value: 200 }
  },
  {
    id: "south_indian_restaurant",
    label: "South Indian Restaurant",
    group: "Food & Dining",
    icon: "🥞",
    googleType: "restaurant",
    reviewKeywords: ["crispy dosa", "soft idli", "filter coffee", "sambar", "coconut chutney"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Special Dosa or Filter Coffee Combo", value: 120 }
  },
  {
    id: "cafe",
    label: "Cafe & Coffee Shop",
    group: "Food & Dining",
    icon: "☕",
    googleType: "cafe",
    reviewKeywords: ["cold coffee", "hazelnut frappe", "cheesy fries", "cozy vibes", "wifi work spot"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Cold Coffee or Cheesy Garlic Bread", value: 160 }
  },
  {
    id: "fast_food",
    label: "Fast Food & Pizzeria",
    group: "Food & Dining",
    icon: "🍕",
    googleType: "meal_takeaway",
    reviewKeywords: ["wood fired pizza", "crispy burger", "loaded fries", "cheese pull", "quick bite"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Medium Pizza or Shake", value: 180 }
  },
  {
    id: "sweet_shop",
    label: "Sweet Shop / Mithai & Farsan",
    group: "Food & Dining",
    icon: "🍬",
    googleType: "food",
    reviewKeywords: ["kaju katli", "motichoor laddu", "pure ghee sweets", "fresh farsan", "festival gifts"],
    defaultLoyaltyRule: { stamps: 8, reward: "250g Free Kaju Katli / Special Sweet Box", value: 250 }
  },
  {
    id: "ice_cream",
    label: "Ice Cream & Dessert Parlour",
    group: "Food & Dining",
    icon: "🍨",
    googleType: "ice_cream_shop",
    reviewKeywords: ["natural ice cream", "belgian chocolate sundae", "waffles", "shirley temple", "late night scoop"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Double Scoop Sundae", value: 150 }
  },
  {
    id: "cloud_kitchen",
    label: "Cloud Kitchen & Delivery Hub",
    group: "Food & Dining",
    icon: "🥡",
    googleType: "meal_delivery",
    reviewKeywords: ["spill proof packaging", "steaming hot food", "quick doorstep delivery", "hygienic box"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Meal Combo on Next Order", value: 180 }
  },

  // ── Beauty & Grooming ──────────────────────────────────────────────────────
  {
    id: "salon",
    label: "Men's Salon & Grooming",
    group: "Beauty & Grooming",
    icon: "✂️",
    googleType: "hair_care",
    reviewKeywords: ["fade haircut", "beard trim styling", "head massage", "sanitized tools", "fresh towel"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Relaxing Head Massage or D-Tan", value: 200 }
  },
  {
    id: "beauty_parlour",
    label: "Beauty Parlour & Women's Spa",
    group: "Beauty & Grooming",
    icon: "💅",
    googleType: "beauty_salon",
    reviewKeywords: ["painless threading", "O3+ facial glow", "hair spa treatment", "gentle beautician", "clean private cabin"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Hair Spa or Express Cleanup", value: 350 }
  },
  {
    id: "unisex_salon",
    label: "Unisex Salon & Makeup Studio",
    group: "Beauty & Grooming",
    icon: "💄",
    googleType: "beauty_salon",
    reviewKeywords: ["keratin hair treatment", "bridal makeup", "balayage highlights", "professional stylist"],
    defaultLoyaltyRule: { stamps: 6, reward: "₹500 Off on Hair or Skin Service", value: 500 }
  },
  {
    id: "tattoo_studio",
    label: "Tattoo & Piercing Studio",
    group: "Beauty & Grooming",
    icon: "🎨",
    googleType: "tattoo_shop",
    reviewKeywords: ["custom tattoo design", "hygienic needles", "fine line art", "painless piercing", "aftercare guide"],
    defaultLoyaltyRule: { stamps: 3, reward: "₹500 Off on Next Tattoo or Free Piercing", value: 500 }
  },

  // ── Automotive & Detailing ─────────────────────────────────────────────────
  {
    id: "car_wash",
    label: "Car Wash & Auto Detailing",
    group: "Automotive & Detailing",
    icon: "🚗",
    googleType: "car_wash",
    reviewKeywords: ["snow foam wash", "underbody pressure clean", "deep interior vacuum", "dashboard polish", "ceramic shine"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Snow Foam Wash & Vacuum", value: 350 }
  },
  {
    id: "auto_garage",
    label: "Automobile Repair & Garage",
    group: "Automotive & Detailing",
    icon: "🔧",
    googleType: "car_repair",
    reviewKeywords: ["genuine spare parts", "engine oil service", "suspension check", "honest mechanic", "clear estimate"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Full Vehicle Inspection & AC Check", value: 400 }
  },
  {
    id: "bike_service",
    label: "Two-Wheeler Service Center",
    group: "Automotive & Detailing",
    icon: "🏍️",
    googleType: "motorcycle_repair",
    reviewKeywords: ["smooth engine pickup", "brake tuning", "oil change", "water washing", "timely delivery"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Bike Foam Wash & Chain Lube", value: 150 }
  },
  {
    id: "car_accessories",
    label: "Car Accessories & Tyres",
    group: "Automotive & Detailing",
    icon: "🛞",
    googleType: "car_dealer",
    reviewKeywords: ["seat covers fitting", "android infotainment screen", "wheel alignment", "nitrogen air", "ambient lights"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Wheel Alignment or ₹300 Accessory Voucher", value: 300 }
  },

  // ── Education & Coaching ───────────────────────────────────────────────────
  {
    id: "coaching_institute",
    label: "Coaching Institute & Exam Prep",
    group: "Education & Coaching",
    icon: "📚",
    googleType: "school",
    reviewKeywords: ["supportive faculty", "concept clarity", "test series", "doubt clearing sessions", "exam score boost"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Test Series Module or Subject Workshop", value: 500 }
  },
  {
    id: "preschool_daycare",
    label: "Preschool & Daycare",
    group: "Education & Coaching",
    icon: "🧸",
    googleType: "school",
    reviewKeywords: ["caring teachers", "clean safe play area", "creative activities", "live CCTV access", "healthy habits"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free 1-Month Activity Kit or Saturday Camp Pass", value: 600 }
  },
  {
    id: "tuition_classes",
    label: "Tuition & Learning Center",
    group: "Education & Coaching",
    icon: "✏️",
    googleType: "school",
    reviewKeywords: ["small batch size", "individual attention", "regular homework check", "weekly test reports"],
    defaultLoyaltyRule: { stamps: 4, reward: "1 Free Revision Masterclass for Exams", value: 300 }
  },
  {
    id: "music_dance_academy",
    label: "Music & Dance Academy",
    group: "Education & Coaching",
    icon: "🎵",
    googleType: "school",
    reviewKeywords: ["patient instructor", "rhythm practice", "stage performance exposure", "flexible batches"],
    defaultLoyaltyRule: { stamps: 4, reward: "1 Free Private Masterclass Session", value: 400 }
  },

  // ── Healthcare & Clinics ───────────────────────────────────────────────────
  {
    id: "dental_clinic",
    label: "Dental Clinic & Orthodontist",
    group: "Healthcare & Clinics",
    icon: "🦷",
    googleType: "dentist",
    reviewKeywords: ["painless root canal", "teeth cleaning scaling", "gentle doctor", "sterile clinic", "clear explanation"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Ultrasonic Teeth Polishing or ₹300 Off", value: 300 }
  },
  {
    id: "polyclinic",
    label: "Polyclinic & General Physician",
    group: "Healthcare & Clinics",
    icon: "🩺",
    googleType: "doctor",
    reviewKeywords: ["patient listener", "accurate diagnosis", "minimal medicine prescription", "clean waiting room"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Follow-up Health Checkup or BP/Sugar Test", value: 200 }
  },
  {
    id: "diagnostic_lab",
    label: "Pathology Lab & Diagnostic Center",
    group: "Healthcare & Clinics",
    icon: "🔬",
    googleType: "health",
    reviewKeywords: ["gentle blood collection", "same day report delivery", "accurate readings", "hygienic sample tubes"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Full Body Screening Add-on or 20% Off", value: 250 }
  },
  {
    id: "pharmacy",
    label: "Pharmacy & Chemist",
    group: "Healthcare & Clinics",
    icon: "💊",
    googleType: "pharmacy",
    reviewKeywords: ["all genuine medicines available", "home delivery", "refrigerated vaccines", "helpful pharmacist"],
    defaultLoyaltyRule: { stamps: 6, reward: "₹100 Off on Health Wellness Products", value: 100 }
  },
  {
    id: "physiotherapy",
    label: "Physiotherapy & Rehab Center",
    group: "Healthcare & Clinics",
    icon: "🏃‍♂️",
    googleType: "physiotherapist",
    reviewKeywords: ["back pain relief", "posture correction", "guided exercises", "caring therapist", "quick recovery"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free 30-Min Deep Heat / TENS Session", value: 400 }
  },

  // ── Fitness & Sports ───────────────────────────────────────────────────────
  {
    id: "gym",
    label: "Gym & Fitness Studio",
    group: "Fitness & Sports",
    icon: "💪",
    googleType: "gym",
    reviewKeywords: ["modern imported machines", "certified personal trainers", "motivating workout vibe", "clean locker room"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free 1-Week Guest Pass for Friend or Protein Shake", value: 300 }
  },
  {
    id: "yoga_studio",
    label: "Yoga & Pilates Studio",
    group: "Fitness & Sports",
    icon: "🧘",
    googleType: "gym",
    reviewKeywords: ["peaceful ambiance", "asanas breathing technique", "stress relief", "mindful trainer"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Weekend Sound Healing / Pranayama Session", value: 350 }
  },

  // ── Retail & Shopping ──────────────────────────────────────────────────────
  {
    id: "supermarket",
    label: "Supermarket & Grocery Store",
    group: "Retail & Shopping",
    icon: "🛒",
    googleType: "supermarket",
    reviewKeywords: ["fresh vegetables daily", "quick billing counter", "organized aisles", "great discounts"],
    defaultLoyaltyRule: { stamps: 5, reward: "₹100 Instant Discount on Grocery Bill", value: 100 }
  },
  {
    id: "clothing_boutique",
    label: "Clothing & Fashion Boutique",
    group: "Retail & Shopping",
    icon: "👗",
    googleType: "clothing_store",
    reviewKeywords: ["latest trending fashion", "quality fabric", "perfect alteration fit", "reasonable prices"],
    defaultLoyaltyRule: { stamps: 4, reward: "₹300 Voucher on Next Apparel Purchase", value: 300 }
  },
  {
    id: "jewellery_store",
    label: "Jewellery & Silver Showroom",
    group: "Retail & Shopping",
    icon: "💍",
    googleType: "jewelry_store",
    reviewKeywords: ["hallmark certified gold", "delicate silver designs", "transparent making charges", "polite staff"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Silver Coin or ₹500 Off on Making Charges", value: 500 }
  },
  {
    id: "footwear_store",
    label: "Footwear & Shoe Store",
    group: "Retail & Shopping",
    icon: "👟",
    googleType: "shoe_store",
    reviewKeywords: ["comfortable sole cushioning", "branded sneakers", "durable sandals", "courteous salesmen"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Shoe Care Kit or ₹200 Off", value: 200 }
  },
  {
    id: "electronics_mobile",
    label: "Mobile & Electronics Store",
    group: "Retail & Shopping",
    icon: "📱",
    googleType: "electronics_store",
    reviewKeywords: ["instant tempered glass fitting", "original accessories", "honest mobile repair", "exchange deals"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free 11D Tempered Glass or Fast Cable", value: 199 }
  },
  {
    id: "furniture_decor",
    label: "Furniture & Home Decor Store",
    group: "Retail & Shopping",
    icon: "🛋️",
    googleType: "furniture_store",
    reviewKeywords: ["solid wood durability", "modern aesthetic sofa", "safe home delivery", "custom size options"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Cushion Set or ₹500 Off on Next Furniture", value: 500 }
  },
  {
    id: "pet_shop",
    label: "Pet Shop & Vet Clinic",
    group: "Retail & Shopping",
    icon: "🐾",
    googleType: "pet_store",
    reviewKeywords: ["premium pet food", "gentle puppy grooming", "vet consultation", "pet toys variety"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Pet Treats Hamper or Grooming Discount", value: 250 }
  },

  // ── Services & Professional ────────────────────────────────────────────────
  {
    id: "real_estate",
    label: "Real Estate & Property Consultant",
    group: "Services & Professional",
    icon: "🏢",
    googleType: "real_estate_agency",
    reviewKeywords: ["verified properties", "transparent paperwork", "honest broker", "fair market pricing"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Property Valuation Report", value: 500 }
  },
  {
    id: "ca_finance",
    label: "CA & Tax Consultant",
    group: "Services & Professional",
    icon: "💼",
    googleType: "accounting",
    reviewKeywords: ["smooth ITR filing", "GST compliance accuracy", "proactive tax saving advice", "timely submission"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Annual Tax Optimization Audit", value: 500 }
  },
  {
    id: "photo_studio",
    label: "Photography & Video Studio",
    group: "Services & Professional",
    icon: "📸",
    googleType: "photography_studio",
    reviewKeywords: ["candid wedding shots", "instant passport photos", "vibrant color grading", "punctual team"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Framed Photo Print or 20% Off", value: 300 }
  },
  {
    id: "laundry_drycleaning",
    label: "Dry Cleaner & Laundry Service",
    group: "Services & Professional",
    icon: "👔",
    googleType: "laundry",
    reviewKeywords: ["crisp steam iron", "gentle fabric wash", "stain removal", "doorstep delivery", "nice fragrance"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free 2 Garments Dry Cleaning", value: 200 }
  }
]

const CUSTOM_CATEGORIES_KEY = "gbp_custom_categories"

/**
 * Fetch all categories: combines built-in official GBP categories with
 * custom categories created dynamically by SuperAdmin in SystemContent.
 */
export async function getAllGbpCategories(): Promise<GbpCategoryItem[]> {
  try {
    const customRecord = await db.systemContent.findUnique({
      where: { key: CUSTOM_CATEGORIES_KEY }
    })

    if (!customRecord || !customRecord.value) {
      return OFFICIAL_GBP_CATEGORIES
    }

    const customList: GbpCategoryItem[] = JSON.parse(customRecord.value)
    if (!Array.isArray(customList)) return OFFICIAL_GBP_CATEGORIES

    // Combine: official list + custom list (avoiding id duplicates)
    const map = new Map<string, GbpCategoryItem>()
    OFFICIAL_GBP_CATEGORIES.forEach((c) => map.set(c.id.toLowerCase(), c))
    customList.forEach((c) => map.set(c.id.toLowerCase(), { ...c, isCustom: true }))

    return Array.from(map.values())
  } catch (err) {
    console.warn("[GBP Categories] Error reading custom categories from DB:", err)
    return OFFICIAL_GBP_CATEGORIES
  }
}

/**
 * Add or update a custom business category created by SuperAdmin
 */
export async function addCustomGbpCategory(category: Omit<GbpCategoryItem, "isCustom">): Promise<GbpCategoryItem[]> {
  const existing = await getAllGbpCategories()
  const customOnly = existing.filter((c) => c.isCustom)

  const newEntry: GbpCategoryItem = {
    ...category,
    id: category.id.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
    isCustom: true
  }

  const updatedCustom = [...customOnly.filter((c) => c.id !== newEntry.id), newEntry]

  await db.systemContent.upsert({
    where: { key: CUSTOM_CATEGORIES_KEY },
    create: {
      key: CUSTOM_CATEGORIES_KEY,
      section: "admin_settings",
      category: "categories",
      value: JSON.stringify(updatedCustom)
    },
    update: {
      value: JSON.stringify(updatedCustom)
    }
  })

  return getAllGbpCategories()
}

/**
 * Delete a custom category created by SuperAdmin
 */
export async function deleteCustomGbpCategory(categoryId: string): Promise<GbpCategoryItem[]> {
  const existing = await getAllGbpCategories()
  const customOnly = existing.filter((c) => c.isCustom && c.id !== categoryId)

  await db.systemContent.upsert({
    where: { key: CUSTOM_CATEGORIES_KEY },
    create: {
      key: CUSTOM_CATEGORIES_KEY,
      section: "admin_settings",
      category: "categories",
      value: JSON.stringify(customOnly)
    },
    update: {
      value: JSON.stringify(customOnly)
    }
  })

  return getAllGbpCategories()
}

/**
 * Look up a category item by ID or loose string match
 */
export function findCategoryByQuery(query: string, allCategories: GbpCategoryItem[] = OFFICIAL_GBP_CATEGORIES): GbpCategoryItem | undefined {
  if (!query) return undefined
  const q = query.toLowerCase().trim()
  return allCategories.find((c) =>
    c.id.toLowerCase() === q ||
    c.label.toLowerCase().includes(q) ||
    c.reviewKeywords.some((k) => q.includes(k.toLowerCase()))
  )
}
