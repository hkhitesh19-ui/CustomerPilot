"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  MapPin,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  Star,
  Award,
  Phone,
  Calendar,
  Flame,
  Coins,
  Lock,
  ChevronRight,
  Zap,
  Building2,
  UtensilsCrossed,
  Stethoscope,
  Scissors,
  Eye,
  Camera,
  Check,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ExternalLink,
  Activity,
  Compass,
  Crosshair,
  Store,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"
import { calculateRevenueLeak, getClickShareByRank } from "@/lib/auditCalculator"

// ============================================================================
// Multi-Vertical 10+10 Knowledge Graph Entity Matrix
// ============================================================================
const VERTICAL_DATA = {
  bakery: {
    id: "bakery",
    name: "Bakery & Confectionery",
    icon: UtensilsCrossed,
    exampleMerchant: "Cake Connection, Manjalpur",
    city: "Vadodara",
    primaryCategory: "Bakery (Verified)",
    secondaryCategories: ["Cake Shop", "Dessert Shop", "Pastry Shop"],
    products: [
      { name: "Belgian Chocolate Truffle Cake", volume: "1,800/mo", justification: "Sold here • 48 reviews mention this" },
      { name: "Rasmalai Pista Tres Leches Cake", volume: "1,450/mo", justification: "Sold here • Customer photo verified" },
      { name: "Fresh Dutch Chocolate Cake", volume: "1,200/mo", justification: "Sold here • In-stock catalog item" },
      { name: "Red Velvet Cream Cheese Cake", volume: "950/mo", justification: "Sold here • 32 photo tags" },
      { name: "Dark Chocolate Walnut Brownies", volume: "850/mo", justification: "Sold here • Mentioned in reviews" },
      { name: "Fresh Seasonal Fruit Cake", volume: "780/mo", justification: "Sold here • Weekly fresh inventory" },
      { name: "Lotus Biscoff Cold Cheesecake", volume: "720/mo", justification: "Sold here • High-intent local search" },
      { name: "Pineapple Chunks Classic Cake", volume: "650/mo", justification: "Sold here • Standard retail catalog" },
      { name: "Blueberry Glaze Cold Cheesecake", volume: "580/mo", justification: "Sold here • Menu highlight" },
      { name: "Ferrero Rocher Luxury Cake", volume: "540/mo", justification: "Sold here • Premium celebration tier" }
    ],
    services: [
      { name: "Same Day 2-Hour Express Delivery", volume: "2,200/mo", justification: "Provides this service • Confirmed by owner" },
      { name: "Midnight Birthday Cake Delivery", volume: "1,900/mo", justification: "Provides this service • High weekend CTR" },
      { name: "Custom 3D Designer Theme Cakes", volume: "1,650/mo", justification: "Provides this service • Photo album linked" },
      { name: "100% Pure Veg Eggless Baking", volume: "1,400/mo", justification: "Provides this service • Critical local dietary filter" },
      { name: "Multi-Tier Wedding Cake Setup", volume: "850/mo", justification: "Provides this service • Venue setup verified" },
      { name: "Corporate Office Bulk Gifting", volume: "720/mo", justification: "Provides this service • Invoice support" },
      { name: "Personalized Edible Photo Print Cakes", volume: "680/mo", justification: "Provides this service • Same-day turnaround" },
      { name: "Walk-in Pastry & Dessert Tasting", volume: "590/mo", justification: "Provides this service • Store amenity" },
      { name: "Anniversary Fondant Customization", volume: "510/mo", justification: "Provides this service • Portfolio verified" },
      { name: "Handcrafted Gift Hamper Packing", volume: "440/mo", justification: "Provides this service • Festive season special" }
    ]
  },
  pet_clinic: {
    id: "pet_clinic",
    name: "Pet Clinic & Veterinary",
    icon: Stethoscope,
    exampleMerchant: "Pet Clinic @ Manjalpur",
    city: "Vadodara",
    primaryCategory: "Veterinary Care (Verified)",
    secondaryCategories: ["Veterinary Clinic", "Pet Groomer", "Pet Supply Store"],
    products: [
      { name: "Royal Canin Breed Health Nutrition", volume: "1,600/mo", justification: "Sold here • Authorized clinic partner" },
      { name: "Bravecto & Simparica Trio Tick Chews", volume: "1,350/mo", justification: "Sold here • Prescription anti-tick item" },
      { name: "Himalaya Scavon & Canisep Wound Sprays", volume: "1,100/mo", justification: "Sold here • Clinic pharmacy inventory" },
      { name: "Hypoallergenic Prescription Dog Food", volume: "920/mo", justification: "Sold here • Special dietary line" },
      { name: "Joint Support Calcium Supplements", volume: "780/mo", justification: "Sold here • Senior pet prescription" },
      { name: "Orthopedic Dog Collars & Leashes", volume: "690/mo", justification: "Sold here • Clinic pet boutique" },
      { name: "Herbal Ear Cleansers & Eye Drops", volume: "620/mo", justification: "Sold here • Over-the-counter care" },
      { name: "Puppy Teething Sticks & Natural Chews", volume: "570/mo", justification: "Sold here • Dental hygiene section" },
      { name: "Multi-Vitamin Coat Shine Tonics", volume: "510/mo", justification: "Sold here • Dermatological wellness" },
      { name: "Odor Control Clumping Cat Litter", volume: "460/mo", justification: "Sold here • Feline essentials" }
    ],
    services: [
      { name: "Dog & Puppy 7-in-1 Vaccination", volume: "2,400/mo", justification: "Provides this service • High local emergency search" },
      { name: "Cat Anti-Rabies & Tricat Vaccines", volume: "1,800/mo", justification: "Provides this service • Routine appointment" },
      { name: "Laser Dental Scaling & Polishing", volume: "1,250/mo", justification: "Provides this service • Preventive oral health" },
      { name: "Minor & Major Soft Tissue Surgery", volume: "980/mo", justification: "Provides this service • In-house surgical theatre" },
      { name: "Spaying & Neutering Procedures", volume: "890/mo", justification: "Provides this service • Post-op recovery room" },
      { name: "In-House Digital CBC Blood Tests", volume: "820/mo", justification: "Provides this service • 15-min diagnostic lab" },
      { name: "Emergency Traumatic First Aid", volume: "760/mo", justification: "Provides this service • On-call veterinarian" },
      { name: "Senior Pet Geriatric Checkup", volume: "610/mo", justification: "Provides this service • Comprehensive screening" },
      { name: "Medicated Bath & Flea Grooming", volume: "540/mo", justification: "Provides this service • Spa & hygiene salon" },
      { name: "Tick Infestation Demodex Treatment", volume: "490/mo", justification: "Provides this service • Specialized dermatology" }
    ]
  },
  dental: {
    id: "dental",
    name: "Dental Clinic & Implant Studio",
    icon: Building2,
    exampleMerchant: "Apex Smile Dental Studio",
    city: "Vadodara",
    primaryCategory: "Dental Clinic (Verified)",
    secondaryCategories: ["Dentist", "Cosmetic Dentist", "Orthodontist"],
    products: [
      { name: "Custom Night Guards for Teeth Grinding", volume: "1,100/mo", justification: "Sold here • Lab-molded appliance" },
      { name: "Fluoride Anti-Cavity Enamel Rinse", volume: "920/mo", justification: "Sold here • Clinical pharmacy" },
      { name: "Medicated Sensitivity Toothpaste", volume: "850/mo", justification: "Sold here • Recommended by dentists" },
      { name: "Orthodontic Wax & Aligners Cleaner", volume: "740/mo", justification: "Sold here • In-office aligner care" },
      { name: "Interdental Specialty Flossers", volume: "630/mo", justification: "Sold here • Post-scaling care kit" },
      { name: "Post-Extraction Surgical Care Kits", volume: "580/mo", justification: "Sold here • Take-home surgical packet" },
      { name: "Home Teeth Whitening Bleach Gel", volume: "520/mo", justification: "Sold here • Cosmetic touch-up" },
      { name: "Electric Sonic Plaque Toothbrush", volume: "480/mo", justification: "Sold here • Authorized retail" },
      { name: "Denture Adhesive Fixative Creams", volume: "430/mo", justification: "Sold here • Prosthodontic care" },
      { name: "Chlorhexidine Gum Protection Wash", volume: "390/mo", justification: "Sold here • Periodontal maintenance" }
    ],
    services: [
      { name: "Painless Single-Sitting Root Canal", volume: "3,100/mo", justification: "Provides this service • Micro-endodontic rotary" },
      { name: "Invisible Clear Aligners Treatment", volume: "2,600/mo", justification: "Provides this service • 3D intraoral scan" },
      { name: "Permanent Titanium Dental Implants", volume: "2,200/mo", justification: "Provides this service • CBCT guided surgery" },
      { name: "Laser Teeth Whitening in 45 Mins", volume: "1,750/mo", justification: "Provides this service • Instant shade lightening" },
      { name: "Impacted Wisdom Tooth Extraction", volume: "1,400/mo", justification: "Provides this service • Oral surgeon specialist" },
      { name: "Ceramic Zirconia Dental Crowns", volume: "1,150/mo", justification: "Provides this service • CAD/CAM metal-free" },
      { name: "Cosmetic Porcelain Smile Veneers", volume: "950/mo", justification: "Provides this service • Hollywood smile makeover" },
      { name: "Ultrasonic Plaque Scaling & Polishing", volume: "890/mo", justification: "Provides this service • Preventive hygiene" },
      { name: "Pediatric Kids Preventive Dentistry", volume: "740/mo", justification: "Provides this service • Child-friendly sedation" },
      { name: "Full Mouth Digital OPG X-Ray Scan", volume: "620/mo", justification: "Provides this service • In-house low radiation OPG" }
    ]
  },
  salon: {
    id: "salon",
    name: "Luxury Salon & Aesthetics",
    icon: Scissors,
    exampleMerchant: "Elegance Hair & Skin Lounge",
    city: "Vadodara",
    primaryCategory: "Beauty Salon (Verified)",
    secondaryCategories: ["Hair Salon", "Nail Salon", "Day Spa"],
    products: [
      { name: "Keratin Smooth Sulfate-Free Shampoo", volume: "1,450/mo", justification: "Sold here • Salon professional backbar" },
      { name: "Moroccan Argan Hair Repair Oil", volume: "1,200/mo", justification: "Sold here • Genuine import certificate" },
      { name: "Hyaluronic Acid Hydrating Serum", volume: "980/mo", justification: "Sold here • Aesthetic skincare retail" },
      { name: "Vitamin C Glow Face Night Cream", volume: "860/mo", justification: "Sold here • Dermatologically tested" },
      { name: "Deep Cleansing Charcoal Clay Mask", volume: "740/mo", justification: "Sold here • Pre-bridal care kit" },
      { name: "Salon Heat Protection Styling Spray", volume: "670/mo", justification: "Sold here • Professional blow-dry prep" },
      { name: "Anti-Dandruff Tea Tree Scalp Scrub", volume: "610/mo", justification: "Sold here • Trichology wellness" },
      { name: "Botanical Cuticle Nourishing Oil", volume: "530/mo", justification: "Sold here • Manicure bar retail" },
      { name: "Organic Shaving Balm & Beard Elixir", volume: "490/mo", justification: "Sold here • Men's grooming section" },
      { name: "SPF 50 Matte Non-Greasy Sunscreen", volume: "450/mo", justification: "Sold here • Daily facial guard" }
    ],
    services: [
      { name: "Cysteine & Keratin Hair Smoothing", volume: "2,800/mo", justification: "Provides this service • Formaldehyde-free" },
      { name: "Hydra-Facial Deep Pore Extraction", volume: "2,400/mo", justification: "Provides this service • Vortex-fusion technology" },
      { name: "Luxury Bridal Airbrush Makeover", volume: "1,950/mo", justification: "Provides this service • Master artist trial" },
      { name: "Balayage & Global Ammonia-Free Color", volume: "1,700/mo", justification: "Provides this service • L'Oreal Inoa certified" },
      { name: "Aromatherapy Stress Relief Body Spa", volume: "1,350/mo", justification: "Provides this service • Private couples suite" },
      { name: "Laser Painless Hair Reduction", volume: "1,100/mo", justification: "Provides this service • Triple-wavelength diode" },
      { name: "Korean Glass Skin Facial Treatment", volume: "980/mo", justification: "Provides this service • Peptide infusion" },
      { name: "Russian Volume Eyelash Extensions", volume: "850/mo", justification: "Provides this service • Certified lash technician" },
      { name: "Acrylic Sculpted Nail Art Extensions", volume: "790/mo", justification: "Provides this service • Gelish LED cured" },
      { name: "Detox Scalp Spa for Hair Fall", volume: "670/mo", justification: "Provides this service • Micro-mist ozone steamer" }
    ]
  }
}

// ============================================================================
// Interactive Geo-Grid Radar Mockup Coordinates
// ============================================================================
interface GridNode {
  id: number
  neighborhood: string
  distanceKm: string
  rankBefore: number
  rankAfter: number
  query: string
  justification: string
}

const GEO_GRID_NODES: GridNode[] = [
  { id: 1, neighborhood: "Akota Circle", distanceKm: "1.4 km", rankBefore: 18, rankAfter: 1, query: "best cake shop near me", justification: "Mentioned by 48 reviewers" },
  { id: 2, neighborhood: "Manjalpur Main Road", distanceKm: "0.2 km", rankBefore: 9, rankAfter: 1, query: "custom birthday cakes", justification: "In-stock catalog: Belgian Truffle" },
  { id: 3, neighborhood: "Makarpura GIDC", distanceKm: "2.1 km", rankBefore: 24, rankAfter: 2, query: "midnight cake delivery", justification: "Provides 2-hour express delivery" },
  { id: 4, neighborhood: "Alkapuri Hub", distanceKm: "3.8 km", rankBefore: 16, rankAfter: 3, query: "pure veg eggless bakery", justification: "100% pure veg verified" },
  { id: 5, neighborhood: "Store Center Point", distanceKm: "0.0 km", rankBefore: 4, rankAfter: 1, query: "cake shop open now", justification: "Primary store location • Open now" },
  { id: 6, neighborhood: "Tarsali Crossing", distanceKm: "1.8 km", rankBefore: 21, rankAfter: 2, query: "anniversary cakes vadodara", justification: "Customer photo uploaded" },
  { id: 7, neighborhood: "Waghodia Road", distanceKm: "4.2 km", rankBefore: 27, rankAfter: 3, query: "designer cakes manjalpur", justification: "Sold here • 3D theme cakes" },
  { id: 8, neighborhood: "Gotri Canal Road", distanceKm: "4.9 km", rankBefore: 31, rankAfter: 2, query: "belgian chocolate truffle", justification: "Knowledge Graph exact match" },
  { id: 9, neighborhood: "Atladara Junction", distanceKm: "3.1 km", rankBefore: 19, rankAfter: 1, query: "fresh pastries near me", justification: "Daily fresh baked badge" }
]

// ============================================================================
// Dual-Language Comprehensive FAQs
// ============================================================================
const FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "How can a business on Page 10 reach Top 3 in 30 days?",
    answerEn:
      "RankPilot AI strictly follows Google's 2026 Core Algorithm guidelines using white-hat operational engineering. It fixes the 3 core ranking bottlenecks simultaneously: 1) Knowledge Graph entity wiring through our 10+10 Product/Service matrix, 2) Honest photo review velocity via billing-counter WhatsApp QR scans (zero review gating), and 3) Zero-gap Google Post publishing with 12-hour pre-expiration auto-renewal. Because every photo, keyword, and geo-coordinate comes from real walk-in customers and verified DBA signboards, Google views the profile as the most relevant authority in the area.",
    questionHi:
      "RankPilot AI kisi bhi dukaan ke GBP ko bina suspend huye 30 dino me Page 10 se Top 3 par kaise lata hai?",
    answerHi:
      "RankPilot AI Google ki 2026 Core Policy ke mutabiq 100% white-hat tarike se kaam karta hai. Ye 3 main cheezon ko ek sath activate karta hai: 1) Google Knowledge Graph me dukaan ke 10 Bestseller Products aur 10 Services ko inject karna, 2) Billing counter par WhatsApp QR se genuine customers se photo reviews collect karna, aur 3) Zero-gap Google Posts jo expire hone se 12 ghante pehle khud naye update ho jate hain. Koi fake review ya black-hat trick use nahi hoti, isliye listing 100% safe rehti hai aur ranking naturally skyrocket hoti hai."
  },
  {
    id: 2,
    questionEn: "Why does RankPilot AI enforce zero fake reviews and zero review gating?",
    answerEn:
      "Google's 2026 spam detection AI immediately detects machine-generated fake reviews, review bursts from non-geo IP addresses, and private 1-to-3 star feedback filtering (review gating), resulting in instant suspension. RankPilot AI collects 100% honest reviews from physical walk-in customers using a verified post-purchase WhatsApp loyalty incentive. Every customer is directed straight to Google's official review form with zero filtering, ensuring full FTC and Google policy compliance.",
    questionHi:
      "RankPilot AI fake reviews aur private review filtering (review gating) ko strictly ban kyu karta hai?",
    answerHi:
      "Google ka 2026 spam algorithm fake reviews aur negative reviews chhipane wale tools (review gating) ko turant pakad kar listing suspend kar deta hai. RankPilot AI sirf dukan par aane wale real walk-in customers se billing ke baad WhatsApp par 100% genuine reviews mangta hai. Customer seedha Google ke official page par jata hai, jisse Google ko 100% trust milta hai aur koi policy violation nahi hota."
  },
  {
    id: 3,
    questionEn: "What is the Zero-Gap Google Business Post Dominance Engine?",
    answerEn:
      "Google Posts heavily boost local relevance and ranking, but offer/event posts expire after a set period. When a post expires, your profile loses active SERP justifications (like 'Special Offer' or 'In Stock'). RankPilot AI automates a 3-post weekly cadence: Tuesday Product Spotlight, Thursday Social Proof/Review Highlight, and Saturday Weekend VIP Offer. Crucially, the system checks 12 hours before expiration and auto-schedules the next fresh creative, ensuring your listing has zero downtime in active signals.",
    questionHi:
      "Zero-Gap Google Business Post Dominance Engine kya hai aur ye kaise kaam karta hai?",
    answerHi:
      "Google Posts listing ki visibility badhate hain, lekin offers aur events expire ho jate hain. Jaise hi post expire hota hai, Google ranking drop hone lagti hai. RankPilot AI hafte me 3 automated posts karta hai: Mangalwar ko Product Spotlight, Guruwar ko Customer Review Proof, aur Shanivar ko Weekend VIP Offer. Sabse khaas baat: post expire hone se 12 ghante pehle AI naya verified post ready karke publish kar deta hai taaki Google par aapki listing 24/7 active aur fresh rahe."
  },
  {
    id: 4,
    questionEn: "How does the 10+10 Dual Bestseller Entity Matrix trigger Google Justifications?",
    answerEn:
      "When someone searches for a specific phrase like 'midnight chocolate truffle delivery', Google looks for justifications ('Sold here', 'Provides this service', 'Mentioned in reviews'). RankPilot AI structures your 10 highest-margin products and 10 most-searched services in your profile catalog, links them to customer photo review prompts, and embeds them into SSR micro-pages with LocalBusiness Schema. When the customer types the name or Google's Gemini Vision scans their review photo, Google displays your store in the Local 3-Pack with a verified justification badge.",
    questionHi:
      "10+10 Dual Bestseller Entity Matrix se Google par 'Sold here' aur 'Provides service' badges kaise milte hain?",
    answerHi:
      "Jab koi customer Google par 'midnight chocolate cake' ya 'puppy vaccination' search karta hai, toh Google unhi dukaano ko Top 3 me dikhata hai jinke paas 'Sold here' ya 'Mentioned by reviewers' ka justification ho. RankPilot AI aapke 10 main products aur 10 services ko Google ke catalog, customer reviews, aur micro-page schema me jod deta hai. Isse Google ka algorithm aapki dukaan ko exact match maankar #1 rank par dikhata hai."
  },
  {
    id: 5,
    questionEn: "How does the Revenue Leak Calculator compute lost revenue?",
    answerEn:
      "Local search CTR data proves that Rank #1 captures ~24% of search clicks, Rank #2 captures ~15%, and Rank #3 captures ~10% (an average of 16% in the Local 3-Pack). If you rank on Page 2 or lower (Rank #11-#20), your click share collapses to just 1.2%. If your category has 2,500 monthly local searches, the Top 3 stores receive 400 customer actions (calls, directions, web clicks), while you receive only 30. At an industry-standard 20% conversion rate and ₹500 average bill, you are bleeding ₹37,000 every 30 days directly to competitors.",
    questionHi:
      "Revenue Leak Calculator kis formula se loss calculate karta hai?",
    answerHi:
      "Industry data ke mutabiq Top 3 Local Pack ko 16% clicks milte hain, jabki Page 2 (Rank #11-#20) par rehne walon ko sirf 1.2% clicks milte hain. Agar aapke shehar me us product ke 2,500 monthly searches hain, toh Top 3 walon ko 400 customer calls aur directions milti hain, jabki aapko sirf 30. Agar 20% log bhi dukaan aate hain aur ₹500 ka bill banate hain, toh aap har mahine ₹37,000 ka confirmed business seedha apne competitors ko de rahe hain."
  },
  {
    id: 6,
    questionEn: "Do I need to hire an SEO agency or write content manually?",
    answerEn:
      "No. RankPilot AI is a 100% autonomous software suite. From drafting Google policy-compliant posts and generating photo review prompts to verifying customer screenshots via Gemini 2.5 Flash Vision OCR, everything runs automatically. Store owners simply keep the acrylic QR standee on their billing counter; our software orchestrates the algorithmic ranking growth behind the scenes.",
    questionHi:
      "Kya mujhe kisi SEO agency ko hire karna padega ya content khud likhna hoga?",
    answerHi:
      "Bilkul nahi. RankPilot AI poori tarah automated software hai. Post create karna, schedule karna, reviews ke keywords analyze karna, aur customer ke WhatsApp screenshots verify karke stamps dena — sab kuch software automatically karta hai. Vyapari ko sirf billing counter par QR standee rakhna hai, baaki Google Maps ranking ka poora engine autonomously background me chalta hai."
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function RankPilotLandingClient() {
  // Simulator State
  const [volume, setVolume] = useState<number>(2500)
  const [aov, setAov] = useState<number>(500)
  const [currentRank, setCurrentRank] = useState<number>(18)

  // Geo-Grid Interactive Radar State
  const [radarSprintMode, setRadarSprintMode] = useState<"before" | "after">("before")
  const [selectedGridPin, setSelectedGridPin] = useState<GridNode>(GEO_GRID_NODES[4])

  // Vertical Switcher State
  const [activeVertical, setActiveVertical] = useState<keyof typeof VERTICAL_DATA>("bakery")
  const selectedVertical = VERTICAL_DATA[activeVertical]

  // Post Engine Active Cadence Tab
  const [activeCadence, setActiveCadence] = useState<"tue" | "thu" | "sat">("sat")

  // Calculate Real-Time Deterministic Financial Leak
  const leakData = useMemo(() => {
    return calculateRevenueLeak({
      monthlySearchVolume: volume,
      currentGridRankAvg: currentRank,
      averageOrderValueINR: aov,
      conversionRate: 0.20
    })
  }, [volume, currentRank, aov])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* 1. STICKY ENTERPRISE HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo size="sm" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200 tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              RankPilot AI™ v7.0
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#geo-grid" className="hover:text-blue-600 transition-colors">
              Radar Grid
            </a>
            <a href="#revenue-leak" className="hover:text-blue-600 transition-colors">
              Revenue Leak Audit
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              10+10 Entity Matrix
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              Post Dominance
            </a>
            <a href="#roadmap" className="hover:text-blue-600 transition-colors">
              30-Day Sprint
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="#revenue-leak">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-semibold text-slate-700 hover:text-blue-600">
                Live Audit Tool
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-9 shadow-sm gap-1.5 group">
                Start 30-Day Sprint
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* 2. SPLIT HERO SECTION: AUTHORITY COPY + INTERACTIVE GEO-RANK RADAR */}
        <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* LEFT: AUTHORITY COPY */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/90 text-blue-800 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>100% Policy-Clean Local SEO • Zero Fake Reviews</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                  Move Your Store from Page 10 to{" "}
                  <span className="text-blue-600 underline decoration-blue-200 decoration-wavy underline-offset-4">
                    Google Maps Top 3
                  </span>{" "}
                  in 30 Days.
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
                  The autonomous Local SEO engine that transforms billing counter walk-ins into genuine photo reviews, auto-publishes zero-gap Google Business posts, and embeds your 10+10 bestseller entity matrix directly into Google's 3-Pack algorithm.
                </p>

                {/* 3 Hard Truth Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-xl sm:text-2xl font-black text-slate-900">16.0%</div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Top-3 Click Share</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-xl sm:text-2xl font-black text-emerald-600">30 Days</div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Algorithmic Sprint</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-xl sm:text-2xl font-black text-blue-600">0% Risk</div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">DBA Signboard Proof</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
                  <Link href="#revenue-leak">
                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 h-12 shadow-sm gap-2 group">
                      Calculate Your Revenue Leak
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <a href="#geo-grid">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-slate-700 border-slate-300 font-semibold text-sm h-12 px-5 hover:bg-slate-100">
                      Explore Interactive Radar Grid
                    </Button>
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Google Policy Clean</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Top 3 Local Pack Guarantee</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>10+10 Dual Matrix</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: INTERACTIVE 3X3 GEO-RANK RADAR VISUALIZER */}
              <div id="geo-grid" className="lg:col-span-5">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
                  {/* Radar Control Bar */}
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
                      <span className="text-xs font-bold tracking-wide">3x3 Geo-Rank Radar Grid</span>
                    </div>
                    <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
                      <button
                        onClick={() => setRadarSprintMode("before")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          radarSprintMode === "before"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Day 1 (Lost)
                      </button>
                      <button
                        onClick={() => setRadarSprintMode("after")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          radarSprintMode === "after"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Day 30 (Top 3)
                      </button>
                    </div>
                  </div>

                  {/* 3x3 Coordinate Map Canvas */}
                  <div className="p-5 bg-radial from-slate-50 via-slate-100/50 to-slate-200/40 relative">
                    <div className="text-[11px] font-semibold text-slate-500 mb-3 flex items-center justify-between">
                      <span>Area: Manjalpur Hub (Vadodara)</span>
                      <span className="font-mono text-slate-400">Radius: 5.0 km</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {GEO_GRID_NODES.map((node) => {
                        const rank = radarSprintMode === "before" ? node.rankBefore : node.rankAfter
                        const isTop3 = rank <= 3
                        const isSelected = selectedGridPin.id === node.id

                        return (
                          <button
                            key={node.id}
                            onClick={() => setSelectedGridPin(node)}
                            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-24 ${
                              isSelected
                                ? "ring-2 ring-blue-600 shadow-md scale-102"
                                : "hover:border-slate-300"
                            } ${
                              isTop3
                                ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                                : "bg-rose-50/80 border-rose-300 text-rose-950"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                                  isTop3
                                    ? "bg-emerald-600 text-white"
                                    : "bg-rose-600 text-white"
                                }`}
                              >
                                #{rank}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                                {node.distanceKm}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold truncate leading-tight mt-1">
                              {node.neighborhood}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Active Pin Inspection Card */}
                    <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-1.5 border-b border-slate-100">
                        <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {selectedGridPin.neighborhood} ({selectedGridPin.distanceKm})
                        </span>
                        <span className="font-mono text-blue-700">
                          Rank: #{radarSprintMode === "before" ? selectedGridPin.rankBefore : selectedGridPin.rankAfter}
                        </span>
                      </div>
                      <div className="pt-2 text-xs space-y-1">
                        <div className="text-slate-600">
                          Search Query: <span className="font-semibold text-slate-900">"{selectedGridPin.query}"</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Justification:{" "}
                          <span className={`font-semibold ${radarSprintMode === "before" ? "text-rose-600" : "text-emerald-700"}`}>
                            {radarSprintMode === "before" ? "None (Lost on Page 2)" : selectedGridPin.justification}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Radar Footer Status */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
                    <span className="text-xs font-semibold text-slate-600">
                      {radarSprintMode === "before" ? (
                        <span className="text-rose-700 font-bold">
                          ⚠️ Page 2–3 Ranking: Bleeding ₹37,000+ monthly revenue to competitors
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          ✅ Top-3 Local 3-Pack Locked: Capturing 16.0% search click volume
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. DUAL-REALITY SERP SHOWCASE: BEFORE VS AFTER */}
        <section className="py-16 lg:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs px-3 py-1 font-semibold">
                Google 3-Pack Physical Reality
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                What Google Displays on Customers' Phones
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                When nearby customers search with buying intent, Google presents only 3 verified businesses in the map pack. Here is the physical difference RankPilot AI creates in 30 days.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* CARD A: BEFORE */}
              <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="destructive" className="text-xs font-bold">
                    BEFORE RANKPILOT • RANK #18 (PAGE 2)
                  </Badge>
                  <span className="text-xs font-mono font-bold text-rose-700">1.2% Click Share</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-rose-200/90 shadow-2xs space-y-2 opacity-80">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>maps.google.com/search?q=cake+shop</span>
                    <span>Position: #18</span>
                  </div>
                  <div className="text-base font-bold text-slate-700">Cake Connection</div>
                  <div className="text-xs text-slate-500">3.8 ★ (14 reviews) • Bakery</div>
                  <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200 font-medium">
                    ❌ No justifications displayed. Zero recent photo reviews. Expired Google Post.
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Customer taps on competitor #1 or #2 before ever seeing your store.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Average 370 customer calls and direction requests lost every 30 days.</span>
                  </div>
                </div>
              </div>

              {/* CARD B: AFTER */}
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-6 sm:p-7 space-y-4 shadow-lg shadow-emerald-500/5">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs font-bold">
                    AFTER 30-DAY SPRINT • RANK #1 (LOCAL 3-PACK)
                  </Badge>
                  <span className="text-xs font-mono font-bold text-emerald-700">24.0% Click Share</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-emerald-300 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-mono">
                    <span className="flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Google Verified Local Pack
                    </span>
                    <span className="font-bold text-emerald-600">Position: #1 Top Spot</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-base font-extrabold text-slate-900">Cake Connection, Manjalpur</div>
                      <div className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                        <span>4.9 ★★★★★</span>
                        <span className="text-slate-500 font-normal">(384 reviews) • Pure Veg Bakery</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Open Now</span>
                  </div>
                  <div className="text-xs text-emerald-900 bg-emerald-50/80 p-2 rounded border border-emerald-200 font-medium space-y-0.5">
                    <div>✨ <strong>Sold here</strong>: Belgian Chocolate Truffle, Rasmalai Cake</div>
                    <div className="text-[11px] text-slate-600">💬 Mentioned by 48 customer photo reviews: <em>"fresh & moist delivery"</em></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button className="py-1.5 text-center text-xs font-bold text-blue-700 bg-blue-50 rounded border border-blue-200">
                      Directions
                    </button>
                    <button className="py-1.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-200">
                      Call Now
                    </button>
                    <button className="py-1.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded border border-slate-200">
                      Website
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 pt-2 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customer taps directly to call, order on WhatsApp, or request driving directions.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Captures 74+ confirmed orders per month previously lost to local competitors.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. THE 60-SECOND REALITY CHECK: CFO-GRADE REVENUE LEAK SIMULATOR */}
        <section id="revenue-leak" className="py-16 lg:py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 space-y-3">
              <Badge className="bg-blue-600 text-white text-xs font-semibold px-3 py-1">
                Deterministic Financial Mathematics
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                The 60-Second Reality Check: Calculate Your Revenue Leak
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Adjust your category's monthly local search volume, current average rank, and average bill size to calculate the exact rupee amount you hand over to top-3 competitors every 30 days.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* SLIDERS WORKSTATION */}
              <div className="lg:col-span-5 bg-slate-800/80 rounded-2xl border border-slate-700 p-6 sm:p-7 space-y-6">
                {/* SLIDER 1: SEARCH VOLUME */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">Monthly Local Searches</span>
                    <span className="font-mono text-blue-400 text-sm font-bold">{volume.toLocaleString()} searches/mo</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={250}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>500</span>
                    <span>2,500 (Vadodara Avg)</span>
                    <span>10,000</span>
                  </div>
                </div>

                {/* SLIDER 2: AOV */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">Average Customer Order Value (AOV)</span>
                    <span className="font-mono text-emerald-400 text-sm font-bold">₹{aov.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={3000}
                    step={50}
                    value={aov}
                    onChange={(e) => setAov(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>₹100 (Cafe/Fast Food)</span>
                    <span>₹500 (Bakery/Salon)</span>
                    <span>₹3,000 (Clinic)</span>
                  </div>
                </div>

                {/* SLIDER 3: CURRENT RANK BUTTONS */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">Your Current Average Google Rank</span>
                    <span className="font-mono text-amber-400 text-sm font-bold">Position #{currentRank}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Top 3", rank: 2, share: "16.0%" },
                      { label: "Page 1 (#5)", rank: 5, share: "3.0%" },
                      { label: "Page 2 (#18)", rank: 18, share: "1.2%" },
                      { label: "Page 3+ (#25)", rank: 25, share: "0.4%" },
                    ].map((opt) => (
                      <button
                        key={opt.rank}
                        onClick={() => setCurrentRank(opt.rank)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          currentRank === opt.rank
                            ? "bg-blue-600 border-blue-400 text-white font-bold"
                            : "bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{opt.share}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-950/40 border border-blue-800/80 rounded-xl text-xs text-blue-200">
                  💡 <strong>The 20% Action-to-Order Conversion Rule</strong>: 1 out of every 5 customers who taps "Call", "Directions", or "Website" completes a transaction.
                </div>
              </div>

              {/* FINANCIAL AUDIT LEDGER */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700">
                    <div className="text-xs font-semibold text-slate-400">Top 3 Potential Monthly Actions</div>
                    <div className="text-3xl font-black text-white mt-1">{leakData.top3PotentialActionsMonthly}</div>
                    <div className="text-xs font-semibold text-emerald-400 mt-1">16.0% Click Share Average</div>
                  </div>

                  <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700">
                    <div className="text-xs font-semibold text-slate-400">Your Current Monthly Actions</div>
                    <div className="text-3xl font-black text-slate-300 mt-1">{leakData.currentActionsMonthly}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-1">{(leakData.currentClickShare * 100).toFixed(1)}% Current Share</div>
                  </div>
                </div>

                {/* THE FINANCIAL LOSS CARD */}
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-rose-900/90 via-rose-950 to-slate-900 border-2 border-rose-500/80 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-rose-800/60 gap-4">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-wider text-rose-300 uppercase">
                        Monthly Walk-In & Order Loss
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                        {leakData.lostOrdersMonthly} Lost Orders / Month
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-mono font-bold tracking-wider text-rose-300 uppercase">
                        Missed Customer Inquiries
                      </span>
                      <div className="text-2xl font-black text-slate-200 mt-1">
                        {leakData.missedActionsMonthly} Actions
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs text-rose-300 font-semibold">Monthly Revenue Bleeding Out</span>
                      <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                        ₹{leakData.monthlyRevenueLeakINR.toLocaleString("en-IN")}
                      </div>
                      <span className="text-xs text-rose-400 mt-0.5 block">Lost every 30 days to competitors</span>
                    </div>

                    <div>
                      <span className="text-xs text-amber-300 font-semibold">12-Month Cumulative Loss</span>
                      <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 mt-1">
                        ₹{leakData.annualRevenueLeakINR.toLocaleString("en-IN")}
                      </div>
                      <span className="text-xs text-amber-300/80 mt-0.5 block">Handed directly to local rivals every year</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Want to stop this leak immediately?</span>
                  <Link href="/onboarding" className="text-blue-400 hover:text-blue-300 font-bold underline inline-flex items-center gap-1">
                    Deploy 30-Day Recovery Sprint <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. THE 10+10 DUAL BESTSELLER ENTITY MATRIX */}
        <section id="features" className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs px-3 py-1 font-semibold">
                Algorithmic Weight: 32% Category & Entity Wire
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                The 10+10 Dual Bestseller Entity Matrix
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Google doesn't rank arbitrary keywords. It ranks <strong>Knowledge Graph Entities</strong> confirmed through 3 sources: your profile menu, verified customer photo reviews, and SSR structured schema.
              </p>
            </div>

            {/* Vertical Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {(Object.keys(VERTICAL_DATA) as Array<keyof typeof VERTICAL_DATA>).map((key) => {
                const item = VERTICAL_DATA[key]
                const IconComponent = item.icon
                const isActive = activeVertical === key

                return (
                  <button
                    key={key}
                    onClick={() => setActiveVertical(key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Store & Category Overview Bar */}
            <div className="max-w-5xl mx-auto mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900">{selectedVertical.exampleMerchant}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">{selectedVertical.city}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-medium">Mapped Categories:</span>
                <Badge variant="secondary" className="text-[10px] font-semibold bg-blue-100 text-blue-800">
                  {selectedVertical.primaryCategory}
                </Badge>
                {selectedVertical.secondaryCategories.map((cat, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] text-slate-600 border-slate-200">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Split Matrix Columns: 10 Products vs 10 Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* TOP 10 PRODUCTS */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs uppercase tracking-wide">Top 10 High-Intent Products</span>
                  </div>
                  <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px]">
                    "Sold Here" Triggers
                  </Badge>
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedVertical.products.map((prod, idx) => (
                    <div key={idx} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-slate-900">{prod.name}</span>
                          <span className="block text-[11px] text-emerald-700 font-medium">{prod.justification}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 font-bold shrink-0">{prod.volume}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP 10 SERVICES */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-xs uppercase tracking-wide">Top 10 High-Intent Services</span>
                  </div>
                  <Badge className="bg-blue-500 text-white font-bold text-[10px]">
                    "Provides Service" Triggers
                  </Badge>
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedVertical.services.map((serv, idx) => (
                    <div key={idx} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-slate-900">{serv.name}</span>
                          <span className="block text-[11px] text-blue-700 font-medium">{serv.justification}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 font-bold shrink-0">{serv.volume}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. GOOGLE BUSINESS POST DOMINANCE ENGINE */}
        <section id="how-it-works" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs px-3 py-1 font-semibold">
                Autonomous Content Cadence
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                The Google Business Post Dominance Engine
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Google heavily rewards fresh posts with active justification badges. RankPilot AI auto-publishes 3 verified posts every week with <strong>Zero-Gap 12-Hour Pre-Expiration Auto-Renewal</strong>.
              </p>
            </div>

            {/* Post Cadence Switcher */}
            <div className="flex justify-center gap-2 mb-8">
              {[
                { id: "tue", title: "Tuesday Spotlight", sub: "Product / Service Focus" },
                { id: "thu", title: "Thursday Social Proof", sub: "5-Star Customer Review" },
                { id: "sat", title: "Saturday Weekend VIP Offer", sub: "48h Flash Deal + Zero-Gap" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCadence(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl border text-left transition-all ${
                    activeCadence === tab.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-xs font-bold">{tab.title}</div>
                  <div className="text-[10px] text-slate-400">{tab.sub}</div>
                </button>
              ))}
            </div>

            {/* Pixel-Perfect Google Business Post Mockup */}
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Google Business App Chrome Bar */}
              <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    CC
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      Cake Connection, Manjalpur
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline" />
                    </div>
                    <div className="text-[10px] text-slate-500">Google Business Profile Update • 2 hours ago</div>
                  </div>
                </div>
                {activeCadence === "sat" && (
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                    Zero-Gap Auto-Renewal Active
                  </Badge>
                )}
              </div>

              {/* Creative Post Body */}
              <div className="p-6 space-y-4">
                {activeCadence === "tue" && (
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-blue-700 border-blue-200 text-[10px] font-bold">
                      TUESDAY PRODUCT SPOTLIGHT • 180 WORDS
                    </Badge>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Signature Belgian Chocolate Truffle Cake — Pure Veg Eggless Baking in Manjalpur
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Crafted daily with authentic imported 54.5% Belgian dark chocolate, silky truffle ganache, and light sponge. 100% pure vegetarian kitchen. Ideal for birthdays, anniversaries, and luxury corporate gifting in Vadodara. Same-day 2-hour express delivery available across Manjalpur, Akota, and Makarpura.
                    </p>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 flex justify-between">
                      <span>Price: ₹650 / 500g</span>
                      <span className="text-emerald-600 font-bold">In Stock Today</span>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-10 gap-1.5">
                      Order Online via WhatsApp <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                {activeCadence === "thu" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-emerald-700 border-emerald-200 text-[10px] font-bold">
                        THURSDAY SOCIAL PROOF • VERIFIED CUSTOMER PHOTO
                      </Badge>
                      <span className="text-xs font-semibold text-slate-700">Customer Review Spotlight</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      {"★".repeat(5)} <span className="text-xs text-slate-500 font-semibold ml-1">5.0 Star Verified Review</span>
                    </div>
                    <blockquote className="p-4 bg-slate-50 rounded-xl border-l-4 border-emerald-500 text-xs italic text-slate-700 leading-relaxed">
                      "Ordered the Rasmalai Pista Cake for my daughter's 5th birthday in Manjalpur. Delivered right at midnight in perfect shape! The sponge was ultra fresh and not overly sweet. Truly the best bakery in Vadodara."
                    </blockquote>
                    <div className="text-[11px] text-slate-500 font-medium">
                      — Verified Customer Review via Google Maps (Photo Verified by Gemini 2.5 Vision)
                    </div>
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-10 gap-1.5">
                      Read 384+ Customer Reviews on Google <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                {activeCadence === "sat" && (
                  <div className="space-y-3">
                    <Badge className="bg-amber-500 text-slate-950 text-[10px] font-bold">
                      Weekend VIP Offer Post • Zero-Gap Expiration (48-Hour Promo)
                    </Badge>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Weekend Celebration Flash: Flat 15% OFF on Custom 3D Theme Cakes + Double VIP Loyalty Stamps
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Planning a celebration this weekend? Book any designer 3D custom theme cake by Sunday 10 PM and unlock instant 15% VIP discount plus double loyalty stamps credited to your WhatsApp wallet.
                    </p>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-950 font-medium">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-4 h-4 text-amber-700" /> Expires in 36 Hours
                      </span>
                      <span className="text-[11px] text-amber-800 font-mono">Auto-renews Monday 10:00 AM</span>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-10 gap-1.5">
                      Claim VIP Weekend Deal on WhatsApp <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 7. FRAUD-PROOF REVIEW VERIFICATION: GEMINI 2.5 FLASH VISION OCR */}
        <section className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs px-3 py-1 font-semibold">
                Gemini 2.5 Flash Vision OCR Engine
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                How We Defend Merchants from Review Fraud
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Rewarding loyalty stamps for reviews creates scam attempts. CustomerPilot uses multimodal AI vision to verify screenshots instantly, rejecting fraudulent claims in milliseconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  01
                </div>
                <h3 className="text-sm font-bold text-slate-900">The "Draft Screen" Scam</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fraudsters type a review, screenshot the blue "Post" button <em>without actually posting it</em>, then discard it. Our Vision OCR detects the blue Post button and <strong>rejects the bonus stamp</strong>.
                </p>
                <div className="text-[11px] font-mono font-bold text-rose-700">Verdict: Auto-Rejected</div>
              </div>

              <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  02
                </div>
                <h3 className="text-sm font-bold text-slate-900">The "Wrong Shop" Scheme</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Users take a screenshot of a review they posted to a different restaurant or salon. Gemini Vision extracts the business header and rejects it if the Place Name doesn't match your exact DBA name.
                </p>
                <div className="text-[11px] font-mono font-bold text-rose-700">Verdict: Name Mismatch Rejection</div>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-300 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  03
                </div>
                <h3 className="text-sm font-bold text-slate-900">The Legitimate Photo Review</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Genuine walk-in post confirmed with published timestamp, 4+ star rating, and store photo. Cryptographic SHA-256 hash stored to prevent duplicate reuse. <strong>+1 Loyalty Stamp awarded in 3 seconds</strong>.
                </p>
                <div className="text-[11px] font-mono font-bold text-emerald-700">Verdict: Stamp Credited via WhatsApp</div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. THE 30-DAY STEP-BY-STEP ROADMAP STEPPER */}
        <section id="roadmap" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs px-3 py-1 font-semibold">
                Predictable Growth Execution
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                The 30-Day Google Local 3-Pack Sprint
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                A structured, day-by-day technical execution plan engineered to safely scale your listing to the Top 3 without triggering Google suspensions.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {[
                {
                  phase: "STAGE 1 • DAYS 1–7",
                  title: "Foundation Surgery & Google Policy Verification",
                  deliverables: [
                    "Physical DBA signboard audit (guarantees zero keyword-stuffing penalties)",
                    "Category hierarchy optimization (1 primary category + 3 verified secondary categories)",
                    "Audit and purge of duplicate or phantom map pins",
                    "Deployment of acrylic WhatsApp loyalty QR standee at billing counter"
                  ],
                  metric: "Pillar 1 & 2 Alignment: 58% algorithmic foundation locked"
                },
                {
                  phase: "STAGE 2 • DAYS 8–18",
                  title: "Genuine Photo Review Velocity & Vision OCR Verification",
                  deliverables: [
                    "WhatsApp post-purchase loyalty incentive activated for genuine customers",
                    "Gemini 2.5 Flash Vision OCR screenshot parser auto-credits stamps",
                    "Keyword injection: Customer reviews naturally reference Top 10 Bestsellers",
                    "Zero review gating: 100% compliant with Google review policies"
                  ],
                  metric: "Velocity Target: 15–25 verified photo reviews with food/store tags"
                },
                {
                  phase: "STAGE 3 • DAYS 19–30",
                  title: "SSR Micro-Pages, Zero-Gap Posts & Map CTR Surge",
                  deliverables: [
                    "Hyper-local SSR Micro-Page (/[city]/[slug]) live with Triple Schema",
                    "500m nearby landmarks embedded to trigger Google SGE and ChatGPT AEO cards",
                    "Zero-Gap weekly posts (Spotlight, Review proof, Weekend VIP deal)",
                    "Weekend directions & call requests surge locks in Top 3 Local Pack status"
                  ],
                  metric: "End Result: Position #1 to #3 on Google Maps • 16.0% Click Share"
                }
              ].map((step, idx) => (
                <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center shrink-0 border border-blue-200">
                    0{idx + 1}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-wider">
                      {step.phase}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{step.title}</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                      {step.deliverables.map((item, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 text-[11px] font-semibold text-emerald-700">
                      🎯 {step.metric}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. DUAL-LANGUAGE FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DualLangFaq
              items={FAQS}
              titleEn="Frequently Asked Questions (RankPilot AI™)"
              titleHi="Frequently Asked Questions (RankPilot AI™)"
              subtitleEn="Clear, transparent answers on Google policy, algorithmic timeline, and our zero-suspension architecture."
              subtitleHi="Google policy, suspension safety, aur 30-day ranking timeline ke baare me sabhi jankari."
              accentColor="blue"
              theme="light"
            />
          </div>
        </section>

        {/* 10. ENTERPRISE CONVERSION FOOTER & CTA */}
        <section className="py-16 lg:py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-900/60 border border-blue-700 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Claim Your Local Pack Dominance</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
              Stop Handing ₹37,000+ Every Month to Competitors on Page 1.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Launch your 30-Day Local 3-Pack sprint with RankPilot AI™. Full WhatsApp review flywheel, zero-gap posts, and 10+10 entity matrix wiring.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-12 px-8 shadow-lg shadow-blue-600/30 gap-2 group">
                  Start Your 30-Day Sprint Now
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-slate-200 border-slate-700 hover:bg-slate-800 font-semibold text-sm h-12 px-6">
                  View Transparent Pricing Plans
                </Button>
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Google Policy-Clean
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Zero Fake Reviews
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> 14-Day Money-Back Guarantee
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-950 text-slate-500 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span>© 2026 CustomerPilot AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <Link href="/pricing" className="hover:text-slate-300">Pricing</Link>
            <Link href="/rankpilot" className="hover:text-slate-300">RankPilot AI</Link>
            <Link href="/google-business-profile-ranking" className="hover:text-slate-300">Free Audit</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
