"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Store,
  Star,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ChevronRight
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

export interface SubCategoryPreset {
  id: string
  label: string
  icon: string
  sampleStore: string
  sampleHighlight: string
}

export interface MainIndustryGroup {
  id: string
  label: string
  icon: string
  subCategories: SubCategoryPreset[]
}

export const MAIN_INDUSTRY_GROUPS: MainIndustryGroup[] = [
  {
    id: "food_dining",
    label: "Food & Dining",
    icon: "🍽️",
    subCategories: [
      {
        id: "fast_food",
        label: "Fast Food & Street Snacks (Dabeli, Vadapav, Burger, Samosa, Sandwich)",
        icon: "🥪",
        sampleStore: "Tasty Vadapav & Dabeli Center",
        sampleHighlight: "Butter Kutchi Dabeli, Crispy Jumbo Vadapav with spicy garlic chutney & Cheese Grill Sandwich"
      },
      {
        id: "pizza_restaurant",
        label: "Pizza Restaurant & Pizzeria",
        icon: "🍕",
        sampleStore: "Artisan Wood-Fired Pizzeria",
        sampleHighlight: "Wood-fired Margherita with fresh basil, Farmhouse cheese burst pizza & Stuffed Garlic Bread"
      },
      {
        id: "non_veg_restaurant",
        label: "Non-Veg Restaurant & Biryani House",
        icon: "🍗",
        sampleStore: "Lazeez Biryani & Kebabs",
        sampleHighlight: "Chicken Dum Biryani, Rich Butter Chicken with garlic naan & smoky Tandoori Chicken"
      },
      {
        id: "bakery",
        label: "Bakery & Cake Shop",
        icon: "🎂",
        sampleStore: "Cake Connection",
        sampleHighlight: "Fresh Dutch Chocolate Truffle cake, pure eggless custom theme cakes & chocolate brownies"
      },
      {
        id: "punjabi_restaurant",
        label: "Punjabi / North Indian (Pure Veg)",
        icon: "🍲",
        sampleStore: "Shreeji Punjabi Restaurant",
        sampleHighlight: "Dal Makhani, creamy Paneer Butter Masala, crispy garlic naan & family dining AC hall"
      },
      {
        id: "south_indian",
        label: "South Indian Restaurant",
        icon: "🥞",
        sampleStore: "Udupi Dosa Corner",
        sampleHighlight: "Crispy Mysore Masala Dosa, steaming hot Button Idli, sambar & authentic degree filter coffee"
      },
      {
        id: "cafe",
        label: "Cafe & Coffee Shop",
        icon: "☕",
        sampleStore: "The Roast Room & Cafe",
        sampleHighlight: "Thick Hazelnut Cold Coffee, cheesy peri peri fries & cozy ambiance with fast Wi-Fi"
      },
      {
        id: "sweet_shop",
        label: "Sweet Shop / Mithai & Farsan",
        icon: "🍬",
        sampleStore: "Kanhaiya Sweets & Farsan",
        sampleHighlight: "Pure desi ghee Kaju Katli, warm Motichoor Laddus & crispy fresh nylon khaman"
      },
      {
        id: "ice_cream",
        label: "Ice Cream & Dessert Parlour",
        icon: "🍨",
        sampleStore: "Natural Scoop Gelato",
        sampleHighlight: "Belgian dark chocolate sundae, seasonal fresh mango scoops & crispy waffle cones"
      }
    ]
  },
  {
    id: "healthcare_clinics",
    label: "Healthcare & Veterinary",
    icon: "🩺",
    subCategories: [
      {
        id: "dental_clinic",
        label: "Dental Clinic & Orthodontist",
        icon: "🦷",
        sampleStore: "Smile Studio Dental Clinic",
        sampleHighlight: "Painless single-sitting root canal treatment, ultrasonic teeth scaling & gentle compassionate dentist"
      },
      {
        id: "pet_clinic",
        label: "Pet Clinic & Veterinary Hospital",
        icon: "🐾",
        sampleStore: "Paws & Care Veterinary Clinic",
        sampleHighlight: "Puppy 7-in-1 vaccination, routine pet health checkup, gentle pet handling & tick/flea prevention"
      },
      {
        id: "polyclinic",
        label: "Polyclinic & General Physician",
        icon: "🩺",
        sampleStore: "LifeCare Health Clinic",
        sampleHighlight: "Patient doctor consultation, accurate health diagnosis, minimal medicines & clean clinic"
      },
      {
        id: "diagnostic_lab",
        label: "Pathology Lab & Diagnostic Center",
        icon: "🔬",
        sampleStore: "Metro Diagnostic Pathology",
        sampleHighlight: "Painless blood sample collection, same-day digital test reports & 100% hygienic sample tubes"
      },
      {
        id: "pharmacy",
        label: "Pharmacy & Chemist",
        icon: "💊",
        sampleStore: "Apollo Meds Chemist",
        sampleHighlight: "Genuine prescribed medicines, quick home delivery & helpful pharmacist guidance"
      },
      {
        id: "physiotherapy",
        label: "Physiotherapy & Rehab Center",
        icon: "🏃",
        sampleStore: "Spine & Joint Rehab Center",
        sampleHighlight: "Back pain relief therapy, targeted exercise guidance & caring physiotherapist"
      }
    ]
  },
  {
    id: "beauty_grooming",
    label: "Beauty & Grooming",
    icon: "💇",
    subCategories: [
      {
        id: "salon_men",
        label: "Men's Salon & Grooming",
        icon: "✂️",
        sampleStore: "Sharp Looks Men's Salon",
        sampleHighlight: "Skin fade haircut, precision beard shaping, refreshing head massage & sanitized clippers"
      },
      {
        id: "beauty_parlour",
        label: "Beauty Parlour & Ladies Spa",
        icon: "💅",
        sampleStore: "Suvarna Beauty Parlour",
        sampleHighlight: "Painless eyebrow threading, O3+ glow facial, L'Oreal hair spa & private female cabins"
      },
      {
        id: "unisex_salon",
        label: "Unisex Salon & Makeup Studio",
        icon: "💄",
        sampleStore: "Luxe Glow Unisex Studio",
        sampleHighlight: "Keratin hair smoothening, balayage highlights, HD bridal makeup & expert stylists"
      },
      {
        id: "tattoo_studio",
        label: "Tattoo & Piercing Studio",
        icon: "🎨",
        sampleStore: "Ink Aura Tattoo Studio",
        sampleHighlight: "Fine line custom tattoo artwork, sterilized single-use needles & painless piercing"
      }
    ]
  },
  {
    id: "automotive_detailing",
    label: "Automotive & Detailing",
    icon: "🚗",
    subCategories: [
      {
        id: "car_wash",
        label: "Car Wash & Auto Detailing",
        icon: "🚗",
        sampleStore: "SpeedShine Car Spa & Detailing",
        sampleHighlight: "High-pressure snow foam wash, underbody mud wash & deep interior vacuum cleaning"
      },
      {
        id: "auto_garage",
        label: "Automobile Repair & Garage",
        icon: "🔧",
        sampleStore: "Apex Motors Multibrand Garage",
        sampleHighlight: "Genuine engine oil service, suspension diagnostics, honest mechanic & clear estimates"
      },
      {
        id: "bike_service",
        label: "Two-Wheeler Service Center",
        icon: "🏍️",
        sampleStore: "SuperBike Tuning & Service",
        sampleHighlight: "Smooth engine pickup tuning, chain lube & wash, disc brake service & timely delivery"
      },
      {
        id: "car_accessories",
        label: "Car Accessories & Tyres",
        icon: "🛞",
        sampleStore: "DrivePro Accessories & Tyres",
        sampleHighlight: "Custom bucket seat covers fitting, Android infotainment screen & 3D wheel alignment"
      }
    ]
  },
  {
    id: "retail_shopping",
    label: "Retail & Shopping",
    icon: "🛒",
    subCategories: [
      {
        id: "supermarket",
        label: "Supermarket & Grocery Store",
        icon: "🛒",
        sampleStore: "Daily Mart Supermarket",
        sampleHighlight: "Monthly grocery ration, fresh daily vegetables, discounts below MRP & quick express billing"
      },
      {
        id: "clothing_boutique",
        label: "Clothing & Fashion Boutique",
        icon: "👗",
        sampleStore: "Vogue Cotton & Silk Boutique",
        sampleHighlight: "Pure cotton daily kurtis, designer partywear gowns, size S to 5XL & spacious trial rooms"
      },
      {
        id: "electronics_mobile",
        label: "Mobile & Electronics Store",
        icon: "📱",
        sampleStore: "TechZone Mobile & Gadgets",
        sampleHighlight: "Latest smartphones, original accessories, 11D tempered glass fitting & genuine warranties"
      },
      {
        id: "jewellery_store",
        label: "Jewellery & Silver Showroom",
        icon: "💍",
        sampleStore: "Swarna Jewellers",
        sampleHighlight: "916 BIS Hallmark certified gold, trendy lightweight silver jewellery & transparent making rates"
      },
      {
        id: "footwear_store",
        label: "Footwear & Shoe Store",
        icon: "👟",
        sampleStore: "Comfort Step Footwear",
        sampleHighlight: "Cushioned formal shoes, branded running sneakers, durable daily sandals & patient staff"
      },
      {
        id: "furniture_decor",
        label: "Furniture & Home Decor Store",
        icon: "🛋️",
        sampleStore: "Urban Living Furniture",
        sampleHighlight: "Solid teakwood sofas, ergonomic work desks, safe home delivery & modern aesthetic decor"
      },
      {
        id: "pet_shop",
        label: "Pet Shop & Supplies",
        icon: "🐶",
        sampleStore: "Pet Paradise Foods & Toys",
        sampleHighlight: "Royal Canin pet food, fun puppy toys, comfortable cat beds & friendly owner guidance"
      }
    ]
  },
  {
    id: "services_professional",
    label: "Services & Professional",
    icon: "💼",
    subCategories: [
      {
        id: "saas_agency",
        label: "Software & Digital Agency (CustomerPilot)",
        icon: "🚀",
        sampleStore: "CustomerPilot Growth SaaS",
        sampleHighlight: "WhatsApp digital loyalty card software, smart AI review standees & 1-click review auto-reply"
      },
      {
        id: "real_estate",
        label: "Real Estate & Property Consultant",
        icon: "🏢",
        sampleStore: "Prime Landmark Properties",
        sampleHighlight: "Verified commercial and residential properties, transparent paperwork & honest site visits"
      },
      {
        id: "ca_finance",
        label: "CA & Tax Consultant",
        icon: "💼",
        sampleStore: "Apex Tax Advisors & CA",
        sampleHighlight: "Smooth ITR filing, GST compliance accuracy, proactive tax planning & punctual delivery"
      },
      {
        id: "photo_studio",
        label: "Photography & Video Studio",
        icon: "📸",
        sampleStore: "Candid Moments Photography",
        sampleHighlight: "Candid wedding photography, vibrant cinematic color grading & instant passport prints"
      },
      {
        id: "laundry_drycleaning",
        label: "Dry Cleaner & Laundry Service",
        icon: "👔",
        sampleStore: "WhiteGlow Steam Laundry",
        sampleHighlight: "Crisp steam ironing, gentle stain removal, doorstep pickup & pleasant fabric fragrance"
      }
    ]
  },
  {
    id: "education_coaching",
    label: "Education & Coaching",
    icon: "📚",
    subCategories: [
      {
        id: "coaching_institute",
        label: "Coaching Institute & Exam Prep",
        icon: "📚",
        sampleStore: "Excel Academy & Coaching",
        sampleHighlight: "Supportive faculty, clear conceptual teaching, rigorous test series & individual doubt solving"
      },
      {
        id: "preschool_daycare",
        label: "Preschool & Daycare",
        icon: "🧸",
        sampleStore: "Little Sprouts Preschool",
        sampleHighlight: "Caring teachers, clean and safe play area, fun creative activities & live CCTV access"
      },
      {
        id: "tuition_classes",
        label: "Tuition & Learning Center",
        icon: "✏️",
        sampleStore: "Bright Minds Tuition Center",
        sampleHighlight: "Small batch size, personalized attention, regular homework follow-up & weekly tests"
      },
      {
        id: "music_dance_academy",
        label: "Music & Dance Academy",
        icon: "🎵",
        sampleStore: "Rhythm Beats Dance Studio",
        sampleHighlight: "Patient choreographers, classical rhythm foundation & energetic stage performance training"
      }
    ]
  },
  {
    id: "fitness_sports",
    label: "Fitness & Sports",
    icon: "💪",
    subCategories: [
      {
        id: "gym",
        label: "Gym & Fitness Studio",
        icon: "💪",
        sampleStore: "IronCore Fitness Gym",
        sampleHighlight: "Imported strength machines, certified personal trainers, motivating music & clean locker room"
      },
      {
        id: "yoga_studio",
        label: "Yoga & Pilates Studio",
        icon: "🧘",
        sampleStore: "Prana Yoga & Wellness Space",
        sampleHighlight: "Calm peaceful atmosphere, mindful breathing techniques, posture alignment & gentle guidance"
      }
    ]
  }
]

interface ReviewVariation {
  title: string
  tag: string
  text: string
}

function generateReviews(subCatId: string, storeName: string, highlight: string): ReviewVariation[] {
  const name = storeName.trim() || "this store"
  const detail = highlight.trim() || "top quality and courteous service"

  if (subCatId === "dental_clinic") {
    return [
      {
        title: "Keyword-Rich SEO Champion",
        tag: "Best for Google Maps Ranking",
        text: `Visited ${name} for dental care and had an exceptionally smooth experience. Their ${detail}. The clinic maintains high sterilization standards and the doctor explained the procedure with utmost clarity. Highly recommend ${name} for painless dental treatments in the city!`
      },
      {
        title: "Warm Experience & Doctor Trust",
        tag: "High Trust & Authenticity",
        text: `Consulted ${name} today on a strong recommendation. ${detail}. What truly sets this clinic apart is the gentle, caring approach and zero unnecessary procedures. Felt completely comfortable throughout!`
      },
      {
        title: "Short, Punchy & High-Impact",
        tag: "Fastest 1-Tap Submission",
        text: `Painless treatment and spotlessly clean clinic at ${name}! ${detail}. Punctual appointments and very transparent fees. 5 stars!`
      }
    ]
  }

  if (subCatId === "pet_clinic") {
    return [
      {
        title: "Keyword-Rich SEO Champion",
        tag: "Best for Google Maps Ranking",
        text: `Brought my pet to ${name} and could not be happier with the veterinary care. Their ${detail}. The vet doctor is truly compassionate and handles anxious animals with incredible gentleness. Best pet clinic in the area!`
      },
      {
        title: "Warm Experience & Pet Parent Trust",
        tag: "High Trust & Authenticity",
        text: `Visited ${name} today for my pet's checkup. ${detail}. The clinic is sanitized, staff is warm, and the doctor patiently answered all my diet and vaccination questions. Truly dependable animal hospital!`
      },
      {
        title: "Short, Punchy & High-Impact",
        tag: "Fastest 1-Tap Submission",
        text: `Outstanding veterinary care at ${name}! ${detail}. Gentle animal handling and genuine medicines. Highly recommended for every pet parent!`
      }
    ]
  }

  if (subCatId === "fast_food") {
    return [
      {
        title: "Keyword-Rich SEO Champion",
        tag: "Best for Google Maps Ranking",
        text: `Had an amazing street food bite at ${name}! Their ${detail}. The snacks were served piping hot and the authentic spicy red garlic chutney is absolutely unforgettable. Best fast food joint in town!`
      },
      {
        title: "Warm Experience & Evening Hangout",
        tag: "High Trust & Authenticity",
        text: `Visited ${name} with friends for an evening snack. ${detail}. Despite the counter rush, our parcel was handed over in 5 minutes with neat safe packaging. Crispy, delicious, and pocket-friendly!`
      },
      {
        title: "Short, Punchy & High-Impact",
        tag: "Fastest 1-Tap Submission",
        text: `Super fresh and mouth-watering street snacks at ${name}! ${detail}. Fresh oil used and brisk counter service. 10/10 recommended!`
      }
    ]
  }

  if (subCatId === "pizza_restaurant") {
    return [
      {
        title: "Keyword-Rich SEO Champion",
        tag: "Best for Google Maps Ranking",
        text: `Had a delicious dining experience at ${name}! Their ${detail}. The wood-fired artisanal crust was delightfully crisp with generous melted mozzarella cheese pull. Best pizzeria in the city!`
      },
      {
        title: "Warm Experience & Cafe Vibes",
        tag: "High Trust & Authenticity",
        text: `Visited ${name} for a weekend pizza dinner. ${detail}. The cozy youthful ambiance, great music, and steaming hot garlic bread made our evening memorable. Attentive table service!`
      },
      {
        title: "Short, Punchy & High-Impact",
        tag: "Fastest 1-Tap Submission",
        text: `Authentic wood-fired pizzas and superb cheesy sides at ${name}! ${detail}. Spotless clean cafe and value for money combos. Must visit!`
      }
    ]
  }

  if (subCatId === "non_veg_restaurant") {
    return [
      {
        title: "Keyword-Rich SEO Champion",
        tag: "Best for Google Maps Ranking",
        text: `Dined at ${name} and the authentic Mughlai flavors were phenomenal. Their ${detail}. The chicken pieces were succulent and well-marinated, and the dum biryani aroma was incredible. Top non-veg restaurant in the locality!`
      },
      {
        title: "Warm Experience & Family Dining",
        tag: "High Trust & Authenticity",
        text: `Visited ${name} for a family feast. ${detail}. The air-conditioned dining hall is very comfortable, food was served steaming hot with prompt table service, and portion sizes were generous!`
      },
      {
        title: "Short, Punchy & High-Impact",
        tag: "Fastest 1-Tap Submission",
        text: `Juicy tandoori kebabs and aromatic biryani at ${name}! ${detail}. Clean setup, authentic taste, and polite staff. 5 stars all the way!`
      }
    ]
  }

  if (subCatId === "bakery") {
    return [
      {
        title: "Keyword-Rich SEO Champion",
        tag: "Best for Google Maps Ranking",
        text: `Ordered a celebration cake from ${name} and it exceeded all expectations! Their ${detail}. Perfectly balanced sweetness, soft fresh sponge, and stunning cake presentation. Best bakery in the area!`
      },
      {
        title: "Warm Experience & Celebration Delight",
        tag: "High Trust & Authenticity",
        text: `Celebrated our special day with treats from ${name}. ${detail}. The delivery was punctual, the box was damage-free, and the bakery team gave helpful custom recommendations. Loved it!`
      },
      {
        title: "Short, Punchy & High-Impact",
        tag: "Fastest 1-Tap Submission",
        text: `Super fresh 100% pure eggless cakes at ${name}! ${detail}. Melt-in-the-mouth sponge and pristine hygiene. Highly recommended!`
      }
    ]
  }

  if (subCatId === "saas_agency") {
    return [
      {
        title: "Keyword-Rich SEO Champion",
        tag: "Best for Google Maps Ranking",
        text: `CustomerPilot transformed our retail footfall and online reputation! Their ${detail}. Customers love the frictionless WhatsApp digital cards and 5-star Google review velocity tripled within 60 days. Essential SaaS growth platform for store owners!`
      },
      {
        title: "Warm Experience & Business Growth",
        tag: "High Trust & Authenticity",
        text: `Partnered with ${name} for our multi-store loyalty system. ${detail}. The acrylic billing counter standees get instant scans, and customer retention jumped noticeably. Outstanding tech support team!`
      },
      {
        title: "Short, Punchy & High-Impact",
        tag: "Fastest 1-Tap Submission",
        text: `Game-changer software for retail stores! ${detail}. Zero app downloads and automatic review boost. 10/10 value!`
      }
    ]
  }

  return [
    {
      title: "Keyword-Rich SEO Champion",
      tag: "Best for Google Maps Ranking",
      text: `Had a wonderful experience at ${name}! Their ${detail}. The ambiance was welcoming and the entire team was courteous, skilled, and prompt. Highly recommend ${name} to anyone looking for genuine quality and dependable service in the area. 5 stars all the way!`
    },
    {
      title: "Warm Experience & Staff Compliment",
      tag: "High Trust & Authenticity",
      text: `Visited ${name} today and they completely exceeded my expectations. ${detail}. What truly stands out is how warmly the team treats every customer with transparent pricing. Will definitely be a regular visitor here!`
    },
    {
      title: "Short, Punchy & High-Impact",
      tag: "Fastest 1-Tap Submission",
      text: `Top-notch experience at ${name}! ${detail}. Spotless clean setup, quick billing, and consistently high quality. 10/10 recommended!`
    }
  ]
}

const FREE_TOOL_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "Is this AI Google Review Generator really 100% free to use?",
    answerEn:
      "Yes! This generator is completely free with zero credit card required and no daily usage limits. Local retail shops, restaurants, salons, and healthcare clinics can use it to draft authentic, keyword-optimized review suggestions anytime.",
    questionHi: "Kya ye AI Google Review Generator sach me 100% free hai?",
    answerHi:
      "Haan! Ye tool bilkul 100% free hai, koi credit card ya login ki jarurat nahi hai. Aap jitni baar chahein free me 5-star Google review variations generate kar sakte hain."
  },
  {
    id: 2,
    questionEn: "How do keyword-rich reviews help my store rank #1 on Google Maps?",
    answerEn:
      "Google's local search algorithm indexes words inside user reviews. When customer reviews mention specific products (e.g., 'butter dabeli', 'wood-fired pizza', or 'painless root canal'), Google Maps displays your business higher when local buyers search for those exact items.",
    questionHi: "Keyword-rich reviews se meri dukan Google Maps par #1 kaise aati hai?",
    answerHi:
      "Google Maps ka algorithm reviews ke andar ke keywords ko read karta hai. Jab customer review me 'crispy vadapav' ya 'dental cleaning' likhta hai, toh Google Maps un keywords par aapki shop ko top local pack me show karta hai."
  },
  {
    id: 3,
    questionEn: "Can CustomerPilot generate reviews for my customers automatically at the billing counter?",
    answerEn:
      "Yes! While this online page is a manual test generator, CustomerPilot's Smart Ai Google Review System does this completely on autopilot. When walk-in customers scan the counter QR Code with their phone camera, our AI drafts personalized reviews directly on their WhatsApp in 3 seconds.",
    questionHi: "Kya CustomerPilot billing counter par customers ke liye automatically reviews likh sakta hai?",
    answerHi:
      "Bilkul! Ye page manual testing ke liye hai, par CustomerPilot ka Smart Ai Google Review System yahi kaam billing counter par autopilot par karta hai. Customer QR scan karta hai aur AI 3 second me unke phone me review draft kar deta hai."
  },
  {
    id: 4,
    questionEn: "Does CustomerPilot protect my business from public negative reviews?",
    answerEn:
      "Absolutely. CustomerPilot includes an automated Private Feedback Shield. 4 and 5-star ratings are seamlessly directed to Google Maps, while 1 to 3-star ratings are routed to a private merchant feedback dialog on your WhatsApp so you can resolve the complaint directly.",
    questionHi: "Kya CustomerPilot meri dukan ko public 1-star negative reviews se protect karta hai?",
    answerHi:
      "Haan, CustomerPilot me Private Feedback Shield hota hai. 4 aur 5 star review seedhe Google Maps par jaate hain, aur 1 se 3 star ka feedback privately aapke WhatsApp par aata hai taaki aapka public Google score safe rahe."
  }
]

export function FreeAiReviewGeneratorClient() {
  const [selectedMainGroup, setSelectedMainGroup] = useState<string>("food_dining")
  const currentGroup = MAIN_INDUSTRY_GROUPS.find((g) => g.id === selectedMainGroup) || MAIN_INDUSTRY_GROUPS[0]

  const [selectedSubCat, setSelectedSubCat] = useState<string>("fast_food")
  const currentSubCat = currentGroup.subCategories.find((s) => s.id === selectedSubCat) || currentGroup.subCategories[0]

  const [storeName, setStoreName] = useState<string>(currentSubCat.sampleStore)
  const [highlight, setHighlight] = useState<string>(currentSubCat.sampleHighlight)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const [reviews, setReviews] = useState<ReviewVariation[]>(() =>
    generateReviews(currentSubCat.id, currentSubCat.sampleStore, currentSubCat.sampleHighlight)
  )

  const handleSelectMainGroup = (groupId: string) => {
    setSelectedMainGroup(groupId)
    const newGroup = MAIN_INDUSTRY_GROUPS.find((g) => g.id === groupId) || MAIN_INDUSTRY_GROUPS[0]
    const defaultSub = newGroup.subCategories[0]
    setSelectedSubCat(defaultSub.id)
    setStoreName(defaultSub.sampleStore)
    setHighlight(defaultSub.sampleHighlight)
    setIsGenerating(true)
    setTimeout(() => {
      setReviews(generateReviews(defaultSub.id, defaultSub.sampleStore, defaultSub.sampleHighlight))
      setIsGenerating(false)
    }, 250)
  }

  const handleSelectSubCategory = (subCat: SubCategoryPreset) => {
    setSelectedSubCat(subCat.id)
    setStoreName(subCat.sampleStore)
    setHighlight(subCat.sampleHighlight)
    setIsGenerating(true)
    setTimeout(() => {
      setReviews(generateReviews(subCat.id, subCat.sampleStore, subCat.sampleHighlight))
      setIsGenerating(false)
    }, 250)
  }

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setTimeout(() => {
      setReviews(generateReviews(selectedSubCat, storeName, highlight))
      setIsGenerating(false)
    }, 300)
  }

  const handleCopy = (text: string, index: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Clipboard copy failed:", err)
      })
    }
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/smart-ai-google-review"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Smart Ai Google Review QR
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all"
            >
              <Link href="/signup?module=reviews">Get Smart QR Free →</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        {/* ============ HERO SECTION ============ */}
        <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-amber-50/40 via-white to-white border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white px-4 py-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">
                100% Free Online Tool • Zero Sign-Up Required • 8 Industry Taxonomies
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Free AI Google Review Generator:{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
                5-Star Reviews for Every Business
              </span>
            </h1>

            {/* Direct Answer Snippet */}
            <div className="max-w-3xl mx-auto bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Multi-Category AI Review Generator</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Select your **Main Industry Group** (Food &amp; Dining, Healthcare, Beauty, Retail, Automotive, etc.) and tap your exact **Sub-Category** (e.g. Fast Food &amp; Vadapav, Dental Clinic, Pet Hospital, Wood-Fired Pizza, Non-Veg Biryani). CustomerPilot crafts keyword-rich 5-star Google review drafts that boost your Google Maps Local Pack ranking.
              </p>
            </div>
          </div>
        </section>

        {/* ============ INTERACTIVE GENERATOR WORKBENCH ============ */}
        <section className="py-10 sm:py-14 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Workbench Top Bar */}
            <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-600" />
                  <span>Interactive Industry &amp; Sub-Category Selector</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick your Main Business Category first, then click your specific Sub-Category below:
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Google Maps Policy Safe</span>
              </div>
            </div>

            {/* STEP 1: Main Business Category Tabs (8 Groups) */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Step 1: Choose Main Business Category (8 Industry Groups):
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Selected: <strong className="text-slate-900">{currentGroup.icon} {currentGroup.label}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MAIN_INDUSTRY_GROUPS.map((group) => {
                  const isActive = selectedMainGroup === group.id
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleSelectMainGroup(group.id)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                        isActive
                          ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900 ring-offset-1"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-base">{group.icon}</span>
                      <span className="truncate">{group.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* STEP 2: Sub-Category Pills for Selected Main Group */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-amber-50/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Step 2: Select Sub-Category Preset ({currentGroup.subCategories.length} Options in {currentGroup.label}):
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  1-Click Auto-Fill
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentGroup.subCategories.map((sub) => {
                  const isSubActive = selectedSubCat === sub.id
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectSubCategory(sub)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSubActive
                          ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-500 ring-offset-1"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50"
                      }`}
                    >
                      <span>{sub.icon}</span>
                      <span>{sub.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Input Form with Store Name & Custom Highlights */}
            <form onSubmit={handleGenerate} className="p-5 sm:p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="store-name-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Store / Brand Name
                  </label>
                  <input
                    id="store-name-input"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Tasty Vadapav, Smile Dental, Paws Vet Clinic"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Your business or practice name as listed on Google Business Profile.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="experience-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Key Highlights / Product &amp; Service Keywords
                  </label>
                  <input
                    id="experience-input"
                    type="text"
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    placeholder="e.g. Butter dabeli, wood-fired pizza, painless root canal"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Specific specialties you want included in customer Google reviews for local ranking.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Powered by Gemini Generative AI • Instant local SEO keyword grounding</span>
                </div>
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all w-full sm:w-auto"
                >
                  <RotateCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>{isGenerating ? "Drafting Reviews..." : "Generate 3 Review Variations"}</span>
                </Button>
              </div>
            </form>

            {/* Generated Review Output Cards */}
            <div className="p-5 sm:p-8 bg-slate-50/70 border-t border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Ready-to-Copy 5-Star Google Review Variations</span>
                    <span className="text-xs font-normal text-slate-500">({currentSubCat.label})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click &ldquo;Copy Review Text&rdquo; to paste directly into your customer&apos;s Google review prompt:
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto">
                  3 Variations Ready
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {reviews.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Option {idx + 1}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <h4 className="font-extrabold text-xs text-slate-900">{item.title}</h4>
                      <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {item.tag}
                      </span>

                      <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50/60 p-3 rounded-xl border border-slate-100 min-h-[96px]">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.text, idx)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                        copiedIndex === idx
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Review Text</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ INTERNAL NAVIGATION STRIP ============ */}
        <div className="py-4 px-4 sm:px-6 bg-slate-50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-slate-500">
            <span>You might also need:</span>
            <Link href="/smart-ai-google-review" className="text-amber-700 hover:text-amber-900 underline underline-offset-2">
              Smart Ai Google Review System (Auto-Generates on WhatsApp)
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/ai-google-review-autoreply" className="text-amber-700 hover:text-amber-900 underline underline-offset-2">
              AI Auto-Reply for Google Reviews
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/customerpilot-complete" className="text-emerald-700 hover:text-emerald-900 underline underline-offset-2">
              CustomerPilot Complete Ecosystem
            </Link>
          </div>
        </div>

        {/* ============ AUTOMATION HOOK & UPSELL SECTION ============ */}
        <section className="py-14 sm:py-20 bg-gradient-to-b from-white via-amber-50/30 to-white border-t border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-2 border-amber-300 shadow-xl grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className="text-amber-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 inline-flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  Tired of Manually Generating Reviews?
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  Put This Entire Review Engine on Autopilot at Your Billing Counter.
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  With CustomerPilot&apos;s Smart Ai Google Review System, customers don&apos;t have to open websites or think of words. When they scan your counter QR Code or pay via UPI, our AI automatically crafts 3 personalized 5-star review drafts directly in their WhatsApp. They tap once, and it publishes directly to Google Maps!
                </p>

                <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Zero Customer Typing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Private 1-3★ Negative Filter
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Free Counter QR Code Included
                  </span>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm px-6 py-4 rounded-xl shadow-md w-full sm:w-auto transition-all"
                  >
                    <Link href="/smart-ai-google-review">
                      <span>Explore Smart Ai Google Review QR</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm px-6 py-4 rounded-xl w-full sm:w-auto shadow-xs"
                  >
                    <Link href="/signup?module=reviews">Start 3-Day Free Trial</Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="text-slate-600 hover:text-slate-900 font-bold text-sm px-4 py-4 rounded-xl w-full sm:w-auto"
                  >
                    <Link href="/customerpilot-complete">See Full CustomerPilot Ecosystem →</Link>
                  </Button>
                </div>
              </div>

              <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-amber-200 shadow-md space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-black text-2xl shadow-xs">
                  4.2x
                </div>
                <div className="font-extrabold text-base text-slate-900">
                  Average Review Growth
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Retail shops and restaurants using CustomerPilot collect an average of 42+ verified Google reviews every month compared to just 10 with ordinary QR stickers.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Policy Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT HELPS LOCAL SEO ============ */}
        <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-amber-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              Local SEO Science
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              How AI-Crafted Google Reviews Boost Your Store Ranking
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Why high-volume keyword-rich reviews outperform simple 5-star ratings on Google Maps:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Long-Tail Keyword Indexing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When customers mention items like &ldquo;butter dabeli&rdquo;, &ldquo;wood-fired pizza&rdquo;, or &ldquo;painless root canal&rdquo; in their reviews, Google Maps indexes those terms. Your store appears in search queries even when customers don&apos;t search for your brand name.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Continuous Review Velocity</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Google prioritizes businesses with consistent new reviews every week over stores that got 100 reviews two years ago and stopped. Consistent review flow signals an active, trusted business.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">High Conversion Trust Shield</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                93% of local consumers read Google reviews before visiting a new restaurant, dental clinic, or retail store. Descriptive 5-star reviews build instant consumer confidence.
              </p>
            </div>
          </div>
        </section>

        {/* ============ DUAL LANGUAGE FAQ ============ */}
        <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6">
          <DualLangFaq items={FREE_TOOL_FAQS} accentColor="amber" theme="light" />
        </section>
      </main>

      {/* Simple Clean Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CustomerPilot. All rights reserved. Made for Indian Retail Merchants.</p>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/smart-ai-google-review" className="hover:text-slate-900 transition">
              Smart AI Google Review
            </Link>
            <Link href="/ai-google-review-autoreply" className="hover:text-slate-900 transition">
              AI Auto-Reply
            </Link>
            <Link href="/smart-digital-business-card" className="hover:text-slate-900 transition">
              Digital Business Card
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
