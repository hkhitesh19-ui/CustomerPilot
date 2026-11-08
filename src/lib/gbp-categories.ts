// ============================================================================
// CustomerPilot - Master Business Categories & Industry Taxonomy (Isomorphic & Client-Safe)
// 100% Free of Server / DB dependencies to ensure zero runtime client bundle crashes
// ============================================================================

export interface GbpCategoryItem {
  id: string
  label: string
  group: string
  groupId?: string
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

export interface MainCategoryGroupItem {
  id: string
  name: string
  icon: string
  subcategories: Array<{
    id: string
    label: string
    icon: string
  }>
}

export const MAIN_CATEGORY_GROUPS: MainCategoryGroupItem[] = [
  {
    id: "healthcare_clinics",
    name: "Healthcare & Clinics",
    icon: "🩺",
    subcategories: [
      { id: "clinic_doctor", label: "Clinic & General Physician (Doctor / Medical)", icon: "🩺" },
      { id: "dental_clinic", label: "Dental Clinic & Orthodontist", icon: "🦷" },
      { id: "pet_clinic", label: "Pet Clinic & Veterinary Hospital", icon: "🐾" },
      { id: "diagnostic_lab", label: "Pathology Lab & Diagnostic Center", icon: "🔬" },
      { id: "pharmacy", label: "Pharmacy & Chemist", icon: "💊" },
      { id: "physiotherapy", label: "Physiotherapy & Rehab Center", icon: "🏃‍♂️" },
      { id: "other_healthcare", label: "➕ Other Healthcare / Medical Specialization", icon: "🏥" },
    ]
  },
  {
    id: "food_dining",
    name: "Food & Dining",
    icon: "🍽️",
    subcategories: [
      { id: "bakery", label: "Bakery, Cake Shop & Desserts", icon: "🎂" },
      { id: "cafe", label: "Cafe & Coffee Shop", icon: "☕" },
      { id: "restaurant", label: "Punjabi / North Indian Restaurant & Dining", icon: "🍲" },
      { id: "south_indian_restaurant", label: "South Indian Restaurant & Tiffins", icon: "🥞" },
      { id: "fast_food", label: "Fast Food & Street Snacks (Dabeli, Vadapav, Burger, Sandwich)", icon: "🥪" },
      { id: "pizza_restaurant", label: "Pizza Restaurant & Pizzeria", icon: "🍕" },
      { id: "non_veg_restaurant", label: "Non-Veg Restaurant & Biryani House", icon: "🍗" },
      { id: "sweet_shop", label: "Sweet Shop / Mithai & Farsan", icon: "🍬" },
      { id: "ice_cream", label: "Ice Cream & Dessert Parlour", icon: "🍨" },
      { id: "cloud_kitchen", label: "Cloud Kitchen & Delivery Hub", icon: "🥡" },
      { id: "other_food", label: "➕ Other Food & Restaurant Business", icon: "🍴" },
    ]
  },
  {
    id: "beauty_grooming",
    name: "Beauty & Grooming",
    icon: "💅",
    subcategories: [
      { id: "womens_salon", label: "Women's Salon (Hair, Styling & Makeover)", icon: "💇‍♀️" },
      { id: "beauty_parlour", label: "Beauty Parlour (Skin, Facial, Makeup & Care)", icon: "💅" },
      { id: "womens_spa", label: "Women's Spa & Wellness Center", icon: "🧖‍♀️" },
      { id: "salon", label: "Men's Salon & Grooming", icon: "✂️" },
      { id: "unisex_salon", label: "Unisex Salon & Makeup Studio", icon: "💄" },
      { id: "tattoo_studio", label: "Tattoo & Piercing Studio", icon: "🎨" },
      { id: "other_beauty", label: "➕ Other Beauty, Spa or Styling Service", icon: "✨" },
    ]
  },
  {
    id: "automotive_detailing",
    name: "Automotive & Detailing",
    icon: "🚗",
    subcategories: [
      { id: "car_wash", label: "Car Wash & Auto Detailing", icon: "🚗" },
      { id: "auto_garage", label: "Automobile Repair & Garage", icon: "🔧" },
      { id: "bike_service", label: "Two-Wheeler Service Center", icon: "🏍️" },
      { id: "car_accessories", label: "Car Accessories & Tyres", icon: "🛞" },
      { id: "other_automotive", label: "➕ Other Automotive Service", icon: "🚘" },
    ]
  },
  {
    id: "education_coaching",
    name: "Education & Coaching",
    icon: "📚",
    subcategories: [
      { id: "coaching_classes", label: "Coaching Institute & Exam Prep", icon: "📚" },
      { id: "preschool_daycare", label: "Preschool & Daycare", icon: "🧸" },
      { id: "tuition_classes", label: "Tuition & Learning Center", icon: "✏️" },
      { id: "music_dance_academy", label: "Music & Dance Academy", icon: "🎵" },
      { id: "other_education", label: "➕ Other Education or Training Center", icon: "🎓" },
    ]
  },
  {
    id: "fitness_sports",
    name: "Fitness & Sports",
    icon: "💪",
    subcategories: [
      { id: "gym_fitness", label: "Gym & Fitness Center", icon: "💪" },
      { id: "yoga_studio", label: "Yoga & Meditation Studio", icon: "🧘" },
      { id: "sports_academy", label: "Sports Academy, Badminton & Turf", icon: "🏸" },
      { id: "other_fitness", label: "➕ Other Fitness & Sports Facility", icon: "🏋️" },
    ]
  },
  {
    id: "retail_shopping",
    name: "Retail & Shopping",
    icon: "🛒",
    subcategories: [
      { id: "supermarket", label: "Supermarket & Grocery Store", icon: "🛒" },
      { id: "clothing_boutique", label: "Clothing & Fashion Boutique", icon: "👗" },
      { id: "jewellery_store", label: "Jewellery & Silver Showroom", icon: "💍" },
      { id: "footwear_store", label: "Footwear & Shoe Store", icon: "👟" },
      { id: "electronics_mobile", label: "Mobile & Electronics Shop", icon: "📱" },
      { id: "furniture_decor", label: "Furniture & Home Decor Store", icon: "🛋️" },
      { id: "pet_shop", label: "Pet Shop & Supplies", icon: "🐾" },
      { id: "retail_other", label: "General Retail & Variety Store", icon: "🛍️" },
      { id: "other_retail", label: "➕ Other Retail / Specialty Store", icon: "🏪" },
    ]
  },
  {
    id: "agency_professionals",
    name: "Agency & Professionals",
    icon: "💼",
    subcategories: [
      { id: "plumbing_services", label: "Plumbing Services", icon: "🔧" },
      { id: "electrical_services", label: "Electrical Services", icon: "⚡" },
      { id: "ac_repair_services", label: "AC Repair & HVAC Services", icon: "❄️" },
      { id: "carpenter_services", label: "Carpenter & Furniture Works", icon: "🪚" },
      { id: "pest_control_services", label: "Pest Control Services", icon: "🐜" },
      { id: "accountant_services", label: "Chartered Accountant & Tax Consultant", icon: "💼" },
      { id: "real_estate_broker", label: "Real Estate Broker & Property Consultant", icon: "🏢" },
      { id: "visa_consultancy", label: "Visa & Immigration Consultancy", icon: "✈️" },
      { id: "wedding_planning_agency", label: "Wedding Planning & Event Agency", icon: "💍" },
      { id: "photography_agency", label: "Photography & Videography Agency", icon: "📸" },
      { id: "architecture_engineering_consultancy", label: "Architecture, Engineering & Construction Consultancy", icon: "📐" },
      { id: "patent_trademark_consultant", label: "Patent & Trademark Consultant", icon: "⚖️" },
      { id: "saas_agency", label: "Software & Digital Marketing Agency", icon: "💻" },
      { id: "other_professionals", label: "➕ Other Professional / Home Service", icon: "🤝" },
    ]
  },
  {
    id: "other",
    name: "Other / Custom Business",
    icon: "✨",
    subcategories: [
      { id: "other_custom", label: "✨ Other (Specify Your Custom Business)", icon: "✍️" }
    ]
  }
]

export const OFFICIAL_GBP_CATEGORIES: GbpCategoryItem[] = [
  // ── Healthcare & Clinics ───────────────────────────────────────────────────
  {
    id: "clinic_doctor",
    label: "Clinic & General Physician (Doctor / Medical)",
    group: "Healthcare & Clinics",
    groupId: "healthcare_clinics",
    icon: "🩺",
    googleType: "doctor",
    reviewKeywords: ["experienced doctor", "accurate diagnosis", "kind consultation", "caring staff", "clean clinic", "effective treatment"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Follow-up Health Checkup or BP/Sugar Test", value: 200 }
  },
  {
    id: "dental_clinic",
    label: "Dental Clinic & Orthodontist",
    group: "Healthcare & Clinics",
    groupId: "healthcare_clinics",
    icon: "🦷",
    googleType: "dentist",
    reviewKeywords: ["painless root canal", "teeth cleaning scaling", "gentle dentist", "sterile clinic", "clear explanation"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Ultrasonic Teeth Polishing or ₹300 Off", value: 300 }
  },
  {
    id: "pet_clinic",
    label: "Pet Clinic & Veterinary Hospital",
    group: "Healthcare & Clinics",
    groupId: "healthcare_clinics",
    icon: "🐾",
    googleType: "veterinary_care",
    reviewKeywords: ["puppy vaccination", "compassionate vet", "gentle pet handling", "deworming", "flea tick care"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Pet General Health Checkup or 20% Off Vaccination", value: 300 }
  },
  {
    id: "diagnostic_lab",
    label: "Pathology Lab & Diagnostic Center",
    group: "Healthcare & Clinics",
    groupId: "healthcare_clinics",
    icon: "🔬",
    googleType: "health",
    reviewKeywords: ["gentle blood collection", "same day report delivery", "accurate readings", "hygienic sample tubes"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Full Body Screening Add-on or 20% Off", value: 250 }
  },
  {
    id: "pharmacy",
    label: "Pharmacy & Chemist",
    group: "Healthcare & Clinics",
    groupId: "healthcare_clinics",
    icon: "💊",
    googleType: "pharmacy",
    reviewKeywords: ["all genuine medicines available", "home delivery", "refrigerated vaccines", "helpful pharmacist"],
    defaultLoyaltyRule: { stamps: 6, reward: "₹100 Off on Health Wellness Products", value: 100 }
  },
  {
    id: "physiotherapy",
    label: "Physiotherapy & Rehab Center",
    group: "Healthcare & Clinics",
    groupId: "healthcare_clinics",
    icon: "🏃‍♂️",
    googleType: "physiotherapist",
    reviewKeywords: ["back pain relief", "posture correction", "guided exercises", "caring therapist", "quick recovery"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free 30-Min Deep Heat / TENS Session", value: 400 }
  },

  // ── Food & Dining ──────────────────────────────────────────────────────────
  {
    id: "bakery",
    label: "Bakery, Cake Shop & Desserts",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "🎂",
    googleType: "bakery",
    reviewKeywords: ["custom cake", "truffle cake", "pastry", "eggless", "fresh sponge", "delivery"],
    defaultLoyaltyRule: { stamps: 8, reward: "Free Premium Pastry or ₹150 Off", value: 150 }
  },
  {
    id: "cafe",
    label: "Cafe & Coffee Shop",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "☕",
    googleType: "cafe",
    reviewKeywords: ["cold coffee", "hazelnut frappe", "cheesy fries", "cozy vibes", "wifi work spot"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Cold Coffee or Cheesy Garlic Bread", value: 160 }
  },
  {
    id: "restaurant",
    label: "Punjabi / North Indian Restaurant & Dining",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "🍲",
    googleType: "restaurant",
    reviewKeywords: ["dal makhani", "paneer butter masala", "garlic naan", "authentic taste", "family dinner"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Starter or ₹200 Off on Bill", value: 200 }
  },
  {
    id: "south_indian_restaurant",
    label: "South Indian Restaurant & Tiffins",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "🥞",
    googleType: "restaurant",
    reviewKeywords: ["crispy dosa", "soft idli", "filter coffee", "sambar", "coconut chutney"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Special Dosa or Filter Coffee Combo", value: 120 }
  },
  {
    id: "fast_food",
    label: "Fast Food & Street Snacks (Dabeli, Vadapav, Burger, Sandwich)",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "🥪",
    googleType: "fast_food_restaurant",
    reviewKeywords: ["butter dabeli", "crispy vadapav", "garlic chutney", "cheese grill sandwich", "veg burger", "samosa chaat"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Cheese Grill Sandwich or Vadapav Combo", value: 120 }
  },
  {
    id: "pizza_restaurant",
    label: "Pizza Restaurant & Pizzeria",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "🍕",
    googleType: "pizza_restaurant",
    reviewKeywords: ["wood fired pizza", "cheese burst", "mozzarella cheese pull", "stuffed garlic bread", "sourdough crust"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Medium Pizza or Stuffed Garlic Bread", value: 220 }
  },
  {
    id: "non_veg_restaurant",
    label: "Non-Veg Restaurant & Biryani House",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "🍗",
    googleType: "restaurant",
    reviewKeywords: ["chicken dum biryani", "butter chicken", "tandoori chicken", "juicy kebabs", "mutton rogan josh"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Chicken Starter or ₹250 Off on Bill", value: 250 }
  },
  {
    id: "sweet_shop",
    label: "Sweet Shop / Mithai & Farsan",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "🍬",
    googleType: "food",
    reviewKeywords: ["kaju katli", "motichoor laddu", "pure ghee sweets", "fresh farsan", "festival gifts"],
    defaultLoyaltyRule: { stamps: 8, reward: "250g Free Kaju Katli / Special Sweet Box", value: 250 }
  },
  {
    id: "ice_cream",
    label: "Ice Cream & Dessert Parlour",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "🍨",
    googleType: "ice_cream_shop",
    reviewKeywords: ["natural ice cream", "belgian chocolate sundae", "waffles", "shirley temple", "late night scoop"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Double Scoop Sundae", value: 150 }
  },
  {
    id: "cloud_kitchen",
    label: "Cloud Kitchen & Delivery Hub",
    group: "Food & Dining",
    groupId: "food_dining",
    icon: "🥡",
    googleType: "meal_delivery",
    reviewKeywords: ["spill proof packaging", "steaming hot food", "quick doorstep delivery", "hygienic box"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free Meal Combo on Next Order", value: 180 }
  },

  // ── Beauty & Grooming ──────────────────────────────────────────────────────
  {
    id: "womens_salon",
    label: "Women's Salon (Hair, Styling & Makeover)",
    group: "Beauty & Grooming",
    groupId: "beauty_grooming",
    icon: "💇‍♀️",
    googleType: "beauty_salon",
    reviewKeywords: ["haircut styling", "keratin smoothening", "hair spa", "hair coloring", "balayage", "blow dry", "expert stylist"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Deep Conditioning Hair Spa or ₹300 Off", value: 300 }
  },
  {
    id: "beauty_parlour",
    label: "Beauty Parlour (Skin, Facial, Makeup & Care)",
    group: "Beauty & Grooming",
    groupId: "beauty_grooming",
    icon: "💅",
    googleType: "beauty_salon",
    reviewKeywords: ["painless threading", "O3+ facial glow", "bridal makeup", "skin cleanup", "waxing", "gentle beautician"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Facial Cleanup or D-Tan Pack", value: 300 }
  },
  {
    id: "womens_spa",
    label: "Women's Spa & Wellness Center",
    group: "Beauty & Grooming",
    groupId: "beauty_grooming",
    icon: "🧖‍♀️",
    googleType: "day_spa",
    reviewKeywords: ["body massage", "aromatherapy", "steam bath", "deep tissue massage", "stress relief", "hygienic private suite"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free 30-Min Head & Shoulder Massage or Aromatherapy Add-on", value: 450 }
  },
  {
    id: "salon",
    label: "Men's Salon & Grooming",
    group: "Beauty & Grooming",
    groupId: "beauty_grooming",
    icon: "✂️",
    googleType: "hair_care",
    reviewKeywords: ["fade haircut", "beard trim styling", "head massage", "sanitized tools", "fresh towel"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Relaxing Head Massage or D-Tan", value: 200 }
  },
  {
    id: "unisex_salon",
    label: "Unisex Salon & Makeup Studio",
    group: "Beauty & Grooming",
    groupId: "beauty_grooming",
    icon: "💄",
    googleType: "beauty_salon",
    reviewKeywords: ["keratin hair treatment", "bridal makeup", "balayage highlights", "professional stylist"],
    defaultLoyaltyRule: { stamps: 6, reward: "₹500 Off on Hair or Skin Service", value: 500 }
  },
  {
    id: "tattoo_studio",
    label: "Tattoo & Piercing Studio",
    group: "Beauty & Grooming",
    groupId: "beauty_grooming",
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
    groupId: "automotive_detailing",
    icon: "🚗",
    googleType: "car_wash",
    reviewKeywords: ["snow foam wash", "interior deep vacuum", "dashboard polish", "ceramic coating", "water spot removal"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Snow Foam Wash & Vacuum", value: 350 }
  },
  {
    id: "auto_garage",
    label: "Automobile Repair & Garage",
    group: "Automotive & Detailing",
    groupId: "automotive_detailing",
    icon: "🔧",
    googleType: "car_repair",
    reviewKeywords: ["honest mechanic", "original parts", "ac cooling service", "wheel alignment", "engine tuning"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free General Inspection & Fluid Top-up", value: 400 }
  },
  {
    id: "bike_service",
    label: "Two-Wheeler Service Center",
    group: "Automotive & Detailing",
    groupId: "automotive_detailing",
    icon: "🏍️",
    googleType: "motorcycle_repair",
    reviewKeywords: ["smooth engine oil change", "brake adjustment", "clutch cable replacement", "water wash"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Teflon Coating & Chain Lubrication", value: 200 }
  },
  {
    id: "car_accessories",
    label: "Car Accessories & Tyres",
    group: "Automotive & Detailing",
    groupId: "automotive_detailing",
    icon: "🛞",
    googleType: "car_parts",
    reviewKeywords: ["touchscreen android player", "bucket seat covers", "alloy wheels", "nitrogen air", "perfumes"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Car Perfume or 10% Off on Accessories", value: 250 }
  },

  // ── Education & Coaching ───────────────────────────────────────────────────
  {
    id: "coaching_classes",
    label: "Coaching Institute & Exam Prep",
    group: "Education & Coaching",
    groupId: "education_coaching",
    icon: "📚",
    googleType: "school",
    reviewKeywords: ["experienced faculty", "concept clarity", "doubt solving", "test series", "disciplined environment"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Test Series / Subject Workshop", value: 500 }
  },
  {
    id: "preschool_daycare",
    label: "Preschool & Daycare",
    group: "Education & Coaching",
    groupId: "education_coaching",
    icon: "🧸",
    googleType: "preschool",
    reviewKeywords: ["caring teachers", "safe playful environment", "hygienic activity area", "engaging storytelling"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free 1-Week Activity Workshop Pass", value: 400 }
  },
  {
    id: "tuition_classes",
    label: "Tuition & Learning Center",
    group: "Education & Coaching",
    groupId: "education_coaching",
    icon: "✏️",
    googleType: "school",
    reviewKeywords: ["individual attention", "regular homework check", "weekly unit tests", "visible score improvement"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Subject Diagnostic Assessment", value: 300 }
  },
  {
    id: "music_dance_academy",
    label: "Music & Dance Academy",
    group: "Education & Coaching",
    groupId: "education_coaching",
    icon: "🎵",
    googleType: "school",
    reviewKeywords: ["patient instructor", "classical kathak western dance", "guitar keyboard lessons", "stage confidence"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Masterclass Session or Instrument Tuning", value: 350 }
  },

  // ── Fitness & Sports ───────────────────────────────────────────────────────
  {
    id: "gym_fitness",
    label: "Gym & Fitness Center",
    group: "Fitness & Sports",
    groupId: "fitness_sports",
    icon: "💪",
    googleType: "gym",
    reviewKeywords: ["modern imported machines", "certified personal trainers", "motivating workout vibe", "clean locker room"],
    defaultLoyaltyRule: { stamps: 6, reward: "Free 1-Week Guest Pass for Friend or Protein Shake", value: 300 }
  },
  {
    id: "yoga_studio",
    label: "Yoga & Meditation Studio",
    group: "Fitness & Sports",
    groupId: "fitness_sports",
    icon: "🧘",
    googleType: "gym",
    reviewKeywords: ["peaceful ambiance", "asanas breathing technique", "stress relief", "mindful trainer"],
    defaultLoyaltyRule: { stamps: 5, reward: "Free Weekend Sound Healing / Pranayama Session", value: 350 }
  },
  {
    id: "sports_academy",
    label: "Sports Academy, Badminton & Turf",
    group: "Fitness & Sports",
    groupId: "fitness_sports",
    icon: "🏸",
    googleType: "sports_complex",
    reviewKeywords: ["well maintained turf", "wooden badminton court", "professional coaching", "floodlights"],
    defaultLoyaltyRule: { stamps: 5, reward: "1 Hour Free Court / Turf Booking", value: 400 }
  },

  // ── Retail & Shopping ──────────────────────────────────────────────────────
  {
    id: "supermarket",
    label: "Supermarket & Grocery Store",
    group: "Retail & Shopping",
    groupId: "retail_shopping",
    icon: "🛒",
    googleType: "supermarket",
    reviewKeywords: ["fresh vegetables daily", "quick billing counter", "organized aisles", "great discounts"],
    defaultLoyaltyRule: { stamps: 5, reward: "₹100 Instant Discount on Grocery Bill", value: 100 }
  },
  {
    id: "clothing_boutique",
    label: "Clothing & Fashion Boutique",
    group: "Retail & Shopping",
    groupId: "retail_shopping",
    icon: "👗",
    googleType: "clothing_store",
    reviewKeywords: ["latest trending fashion", "quality fabric", "perfect alteration fit", "reasonable prices"],
    defaultLoyaltyRule: { stamps: 4, reward: "₹300 Voucher on Next Apparel Purchase", value: 300 }
  },
  {
    id: "jewellery_store",
    label: "Jewellery & Silver Showroom",
    group: "Retail & Shopping",
    groupId: "retail_shopping",
    icon: "💍",
    googleType: "jewelry_store",
    reviewKeywords: ["hallmark certified gold", "delicate silver designs", "transparent making charges", "polite staff"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Silver Coin or ₹500 Off on Making Charges", value: 500 }
  },
  {
    id: "footwear_store",
    label: "Footwear & Shoe Store",
    group: "Retail & Shopping",
    groupId: "retail_shopping",
    icon: "👟",
    googleType: "shoe_store",
    reviewKeywords: ["comfortable sole cushioning", "branded sneakers", "durable sandals", "courteous salesmen"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Shoe Care Kit or ₹200 Off", value: 200 }
  },
  {
    id: "electronics_mobile",
    label: "Mobile & Electronics Shop",
    group: "Retail & Shopping",
    groupId: "retail_shopping",
    icon: "📱",
    googleType: "electronics_store",
    reviewKeywords: ["instant tempered glass fitting", "original accessories", "honest mobile repair", "exchange deals"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free 11D Tempered Glass or Fast Cable", value: 199 }
  },
  {
    id: "furniture_decor",
    label: "Furniture & Home Decor Store",
    group: "Retail & Shopping",
    groupId: "retail_shopping",
    icon: "🛋️",
    googleType: "furniture_store",
    reviewKeywords: ["solid wood durability", "modern aesthetic sofa", "safe home delivery", "custom size options"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Cushion Set or ₹500 Off on Next Furniture", value: 500 }
  },
  {
    id: "pet_shop",
    label: "Pet Shop & Supplies",
    group: "Retail & Shopping",
    groupId: "retail_shopping",
    icon: "🐾",
    googleType: "pet_store",
    reviewKeywords: ["premium pet food", "gentle puppy grooming", "vet consultation", "pet toys variety"],
    defaultLoyaltyRule: { stamps: 4, reward: "Free Pet Treats Hamper or Grooming Discount", value: 250 }
  },
  {
    id: "retail_other",
    label: "General Retail & Variety Store",
    group: "Retail & Shopping",
    groupId: "retail_shopping",
    icon: "🛍️",
    googleType: "store",
    reviewKeywords: ["great product range", "reasonable prices", "helpful owner", "quick checkout"],
    defaultLoyaltyRule: { stamps: 5, reward: "₹100 Off on Next Purchase", value: 100 }
  },

  // ── Agency & Professionals ─────────────────────────────────────────────────
  {
    id: "plumbing_services",
    label: "Plumbing Services",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "🔧",
    googleType: "plumber",
    reviewKeywords: ["quick response", "water leakage fixed", "tap installation", "drainage cleaning", "fair pricing", "expert plumber"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Safety Checkup or ₹150 Off on Next Service", value: 150 }
  },
  {
    id: "electrical_services",
    label: "Electrical Services",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "⚡",
    googleType: "electrician",
    reviewKeywords: ["short circuit repair", "safe house wiring", "mcb installation", "prompt electrician", "neat work"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Wiring & MCB Inspection or ₹150 Off", value: 150 }
  },
  {
    id: "ac_repair_services",
    label: "AC Repair & HVAC Services",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "❄️",
    googleType: "hvac_contractor",
    reviewKeywords: ["ice cold cooling", "deep jet pump cleaning", "gas refill r32", "punctual technician", "honest rates"],
    defaultLoyaltyRule: { stamps: 2, reward: "₹200 Off on Next Jet Pump Service", value: 200 }
  },
  {
    id: "carpenter_services",
    label: "Carpenter & Furniture Works",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "🪚",
    googleType: "carpenter",
    reviewKeywords: ["modular kitchen woodwork", "door lock hinge fitting", "wardrobe repair", "perfect finishing", "durable wood"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Door & Lock Alignment Checkup", value: 200 }
  },
  {
    id: "pest_control_services",
    label: "Pest Control Services",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "🐜",
    googleType: "pest_control_service",
    reviewKeywords: ["odorless spray", "termite eradication", "cockroach gel treatment", "bed bug removal", "long warranty"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Kitchen Cockroach Gel Top-up or ₹250 Off", value: 250 }
  },
  {
    id: "accountant_services",
    label: "Chartered Accountant & Tax Consultant",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "💼",
    googleType: "accounting",
    reviewKeywords: ["accurate itr filing", "gst returns compliance", "transparent tax planning", "timely submission", "knowledgeable ca"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Annual Tax Optimization Audit", value: 500 }
  },
  {
    id: "real_estate_broker",
    label: "Real Estate Broker & Property Consultant",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "🏢",
    googleType: "real_estate_agency",
    reviewKeywords: ["verified properties", "transparent paperwork", "honest broker", "fair market pricing", "smooth registration"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Property Valuation Report", value: 500 }
  },
  {
    id: "visa_consultancy",
    label: "Visa & Immigration Consultancy",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "✈️",
    googleType: "visa_consultant",
    reviewKeywords: ["high visa success rate", "transparent filing process", "expert counselor", "sop drafting", "no hidden charges"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Profile Assessment & University Shortlist", value: 500 }
  },
  {
    id: "wedding_planning_agency",
    label: "Wedding Planning & Event Agency",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "💍",
    googleType: "event_planner",
    reviewKeywords: ["dream wedding decoration", "flawless execution", "stress free management", "creative stage decor", "punctual team"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Welcome Entry Decor Add-on", value: 1000 }
  },
  {
    id: "photography_agency",
    label: "Photography & Videography Agency",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "📸",
    googleType: "photography_studio",
    reviewKeywords: ["candid wedding shots", "cinematic teaser video", "patient photographer", "high resolution album", "drone shots"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Framed Canvas Print or 15% Off Album", value: 500 }
  },
  {
    id: "architecture_engineering_consultancy",
    label: "Architecture, Engineering & Construction Consultancy",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "📐",
    googleType: "architectural_designer",
    reviewKeywords: ["modern architectural plan", "space optimization 3d layout", "structural engineering drawing", "site supervision"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free 3D Elevation Consultation", value: 800 }
  },
  {
    id: "patent_trademark_consultant",
    label: "Patent & Trademark Consultant",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "⚖️",
    googleType: "legal_services",
    reviewKeywords: ["fast trademark filing", "comprehensive brand search", "objection reply resolution", "experienced ip attorney"],
    defaultLoyaltyRule: { stamps: 2, reward: "Free Brand Trademark Availability Search", value: 500 }
  },
  {
    id: "saas_agency",
    label: "Software & Digital Marketing Agency",
    group: "Agency & Professionals",
    groupId: "agency_professionals",
    icon: "💻",
    googleType: "marketing_agency",
    reviewKeywords: ["whatsapp loyalty software", "google review standee", "1-click auto reply", "maps rank booster", "lead generation"],
    defaultLoyaltyRule: { stamps: 3, reward: "Free Counter Acrylic QR Standee or 1-Month Free Trial", value: 499 }
  },

  // ── Other / Custom Business ────────────────────────────────────────────────
  {
    id: "other",
    label: "Other / Custom Business",
    group: "Other",
    groupId: "other",
    icon: "✨",
    googleType: "establishment",
    reviewKeywords: ["friendly service", "high quality", "prompt response", "recommended business", "great experience"],
    defaultLoyaltyRule: { stamps: 5, reward: "Special VIP Reward on 5th Visit", value: 200 }
  }
]

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

/**
 * Helper to get subcategories for a given main category group ID
 */
export function getSubcategoriesForGroup(groupId: string) {
  const grp = MAIN_CATEGORY_GROUPS.find(g => g.id === groupId)
  return grp ? grp.subcategories : []
}

/**
 * Helper to determine which main group an arbitrary category/businessType belongs to
 */
export function findMainGroupForCategory(categoryOrType: string): string {
  if (!categoryOrType) return "food_dining"
  const c = categoryOrType.toLowerCase().trim()

  for (const grp of MAIN_CATEGORY_GROUPS) {
    if (grp.id === c) return grp.id
    if (grp.subcategories.some(sub => sub.id === c || sub.label.toLowerCase().includes(c))) {
      return grp.id
    }
  }

  // Fallbacks by keywords
  if (c.includes("clinic") || c.includes("doctor") || c.includes("health") || c.includes("dental") || c.includes("pharma") || c.includes("lab") || c.includes("pet clinic")) {
    return "healthcare_clinics"
  }
  if (c.includes("cake") || c.includes("bake") || c.includes("food") || c.includes("dine") || c.includes("cafe") || c.includes("coffee") || c.includes("restaurant") || c.includes("sweet") || c.includes("pizza") || c.includes("burger") || c.includes("biryani")) {
    return "food_dining"
  }
  if (c.includes("salon") || c.includes("parlour") || c.includes("parlor") || c.includes("spa") || c.includes("beauty") || c.includes("makeup") || c.includes("tattoo")) {
    return "beauty_grooming"
  }
  if (c.includes("wash") || c.includes("car") || c.includes("auto") || c.includes("garage") || c.includes("bike")) {
    return "automotive_detailing"
  }
  if (c.includes("coach") || c.includes("school") || c.includes("tuition") || c.includes("class") || c.includes("academy") || c.includes("educat")) {
    return "education_coaching"
  }
  if (c.includes("gym") || c.includes("fitness") || c.includes("yoga") || c.includes("sport") || c.includes("turf")) {
    return "fitness_sports"
  }
  if (c.includes("cloth") || c.includes("store") || c.includes("shop") || c.includes("mart") || c.includes("jewel") || c.includes("shoe") || c.includes("retail") || c.includes("supermarket")) {
    return "retail_shopping"
  }
  if (c.includes("plumb") || c.includes("electr") || c.includes("ac") || c.includes("carpenter") || c.includes("pest") || c.includes("account") || c.includes("ca") || c.includes("real estate") || c.includes("visa") || c.includes("wedding") || c.includes("photo") || c.includes("architect") || c.includes("patent") || c.includes("trademark") || c.includes("agency") || c.includes("software")) {
    return "agency_professionals"
  }

  return "other"
}
