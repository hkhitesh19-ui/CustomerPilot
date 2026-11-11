"use client"

import React, { useState, useMemo, useEffect } from "react"
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
  Clock,
  MessageSquare,
  FileCheck,
  CheckCheck,
  HelpCircle,
  BadgePercent,
  Gift,
  ShieldAlert,
  Target,
  BarChart3,
  Bot,
  XCircle,
  Coffee,
  Dumbbell,
  Hotel
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
      "While our internal RankLocal AI™ engine starts pushing rankings within 30 days, we contractually commit to a realistic, transparent SLA: 45 Days to reach 1st Page (Top 10) and the subsequent 45 Days to lock in Top 3 Local Pack status (or 60 Days to Top 3 if you are already on Page 1) — backed by an unconditional 100% Moneyback Guarantee. RankPilot AI strictly adheres to Google's Core Algorithm guidelines through 3 white-hat pillars: 10+10 Product/Service entity injection, genuine post-purchase WhatsApp photo review velocity with zero gating, and zero-gap 12-hour pre-expiration Google Post auto-renewals.",
    questionHi:
      "RankPilot AI kisi bhi dukaan ke GBP ko bina suspend huye 30 dino me Page 10 se Top 3 par kaise lata hai?",
    answerHi:
      "Halanki hamara internal RankLocal AI™ engine 30 dino me velocity accelerate karta hai, hum transparent aur contractual SLA dete hain: 45 dino me 1st Page (Top 10) aur agle 45 dino me Top 3 Local Pack (ya agar aap already 1st page par hain toh 60 dino me Top 3) — backed by 100% Moneyback Guarantee. RankPilot AI Google ki 2026 Core Policy ke mutabiq 100% white-hat tarike se kaam karta hai: 10+10 Bestseller Products aur Services ko Google Graph me jodna, WhatsApp QR se genuine customers ke photo reviews lana, aur Zero-gap Google Posts schedule karna. Koi fake review ya black-hat trick nahi, isliye listing 100% safe rehti hai."
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
  },
  {
    id: 7,
    questionEn: "What are the pricing options and how does the 100% Moneyback Guarantee work?",
    answerEn:
      "RankPilot AI offers two transparent options: our limited 3-Month Acceleration Pilot at ₹6,999 (saving 76% vs the ₹29,000/yr annual rate) and our 365-Day Annual Dominance Plan at ₹29,000/year (~₹2,416/mo). Both plans come with our contractual 100% Moneyback Guarantee: If your business does not achieve Page 1 within 45 days and Top 3 in 90 days (or within 60 days if already on Page 1), we refund 100% of your payment directly to your bank account or UPI with zero questions asked.",
    questionHi:
      "RankPilot AI ka pricing structure kya hai aur 100% Moneyback Guarantee ke terms kya hain?",
    answerHi:
      "Hum 2 transparent plans offer karte hain: Special Launch Offer me 3-Month Acceleration Pilot sirf ₹6,999 me (jo ₹29,000/year ke regular price par 76% discount hai) aur 365-Day Annual Dominance Plan ₹29,000/year me. Dono plans 100% Moneyback Guarantee ke sath aate hain: agar aapki listing 45 dino me 1st Page aur 90 dino me Top 3 (ya already 1st page par hain toh 60 dino me Top 3) par nahi aati, toh bina kisi cut ya excuse ke 100% poora refund aapko mil jata hai."
  },
  {
    id: 8,
    questionEn: "How does CustomerPilot handle Google phone verification and avoid video verification rejections?",
    answerEn:
      "Google's verification engine checks whether your DBA signboard, business category, and municipal address match government tax registries before offering phone or SMS verification. CustomerPilot audits your profile fields and signage beforehand to ensure 100% compliance. If Google requires video verification, our onboarding dashboard provides a step-by-step physical walkthrough script (signboard, billing counter, POS machine, opening keys) ensuring first-attempt approval.",
    questionHi:
      "Google Business Profile verification me phone verification kaise milti hai aur video rejection se kaise bachein?",
    answerHi:
      "Google tabhi phone/SMS verification deta hai jab aapka dukan ka signboard, category aur address municipal records se 100% match kare. CustomerPilot pehle hi saari details audit karke Google compliant bana deta hai taaki rejection na ho. Agar video verification required ho, toh hamara system counter, signboard aur POS dikhane ka exact checklist deta hai jisse 1st attempt me profile verify ho jata hai."
  },
  {
    id: 9,
    questionEn: "Why do Google Business Profiles get suspended, and how does CustomerPilot protect me?",
    answerEn:
      "Profiles are suspended primarily due to 3 reasons: 1) Keyword-stuffing the business name (e.g., adding 'Best Bakery In City' to your legal name), 2) Sudden bursts of fake reviews or review gating, and 3) Mismatched categories and pin locations. CustomerPilot enforces strict physical DBA signboard matching, collects genuine walk-in customer photo reviews with zero gating, and monitors your profile 24/7. In the rare case of a legacy suspension, our documentation team prepares and files the official reinstatement appeal.",
    questionHi:
      "Google Business Profile suspend kyu hoti hai aur CustomerPilot is se kaise protect karta hai?",
    answerHi:
      "Suspension ke 3 main reasons hote hain: 1) Naam me fake keywords add karna, 2) Bahar se fake reviews kharidna ya negative reviews chhipana, aur 3) Category mismatch. CustomerPilot aapke original shop signboard ke hisab se 100% white-hat setting karta hai aur sirf dukaan aane wale real customers ke photo reviews laata hai, jisse suspension ka 0% risk rehta hai. Agar pehle se suspended ho, toh hamari team appeal file karke reinstate karwati hai."
  },
  {
    id: 10,
    questionEn: "How does CustomerPilot fix duplicate or phantom Google Business Profile listings?",
    answerEn:
      "Duplicate listings split your review count and confuse Google's ranking algorithm, suppressing your main profile. CustomerPilot runs a multi-database CID audit to identify duplicate map pins, merges verified reviews into your primary profile, and submits official removal requests for unauthorized phantom pins.",
    questionHi:
      "Agar Google Maps par meri dukaan ke 2 duplicate profiles ban gaye hain toh use kaise merge karein?",
    answerHi:
      "Duplicate listing se reviews do jagah bat jaate hain aur ranking drop ho jaati hai. CustomerPilot duplicate pins ko detect karke Google ke CID database se merge kar deta hai taaki aapke saare purane reviews ek hi primary profile par jama ho sakein aur ranking boost ho jaye."
  }
]

// ============================================================================
// Core Services Audit Showcase Data: "See Exactly What We Fix" (Inspired by GMBPro)
// ============================================================================
const FIX_SHOWCASE_DATA = {
  profile: {
    id: "profile",
    title: "Profile & Entity Optimization",
    sub: "Complete profile & 10+10 Knowledge Graph entity wire",
    icon: Layers,
    merchant: "Cake Connection, Manjalpur (Vadodara)",
    category: "Bakery & Confectionery",
    beforeScore: "55%",
    beforeLabel: "Incomplete & Dormant",
    beforePoints: [
      "Name & address set, but 5 services listed with zero photos or pricing",
      "Only 4 owner photos uploaded • Missing product catalog",
      "1 of 15+ essential Google attributes configured",
      "No Q&A seeded • Missing 'Request a Quote / WhatsApp' action",
      "Result: Google algorithm lacks confidence to rank in Local 3-Pack"
    ],
    afterScore: "100%",
    afterLabel: "Fully Wired Entity Authority",
    afterPoints: [
      "Primary + 2 verified secondary categories correctly aligned with DBA",
      "10 Bestseller Products + 10 High-Intent Services mapped with prices & tags",
      "32 high-resolution photos with verified geo-location metadata",
      "12-item live product catalog with WhatsApp 1-tap ordering link",
      "Structured Q&A seeded with buyer keywords and verified business hours"
    ]
  },
  geogrid: {
    id: "geogrid",
    title: "3x3 Geo-Grid Rank Tracking",
    sub: "Ranked #1–#3 across every nearby neighborhood zone",
    icon: Compass,
    merchant: "Pet Clinic @ Manjalpur (Vadodara)",
    category: "Veterinary Care & Clinic",
    beforeScore: "Rank #18.4",
    beforeLabel: "Buried on Page 2 (1.2% Click Share)",
    beforePoints: [
      "Only visible within 200m of clinic doorstep • Invisible in adjacent neighborhoods",
      "Ranks #14 to #28 across Akota, Alkapuri, and Gotri for 'dog vaccination near me'",
      "Local 3-Pack captured by distant competitors with lower ratings",
      "Zero keyword justifications displayed on search results",
      "Result: Bleeding ₹42,000+ monthly revenue directly to competitors"
    ],
    afterScore: "Rank #1.6",
    afterLabel: "Local 3-Pack Dominance (16.0% Click Share)",
    afterPoints: [
      "Locked positions #1, #2, #3 across all 9 micro-zones within 5km radius",
      "Google justifies listing with 'Provides service: Dog 7-in-1 vaccination'",
      "Click volume surges with 16.0% average Local Pack click capture",
      "Real-time 3x3 Geo-Rank Radar alerts for competitor ranking drops",
      "Result: 74+ additional walk-in appointments booked every month"
    ]
  },
  ai: {
    id: "ai",
    title: "AI Search Visibility (ChatGPT & Gemini)",
    sub: "Recommended by conversational AI assistants and search bots",
    icon: Bot,
    merchant: "Apex Smile Dental Studio (Vadodara)",
    category: "Dental Clinic & Implant Studio",
    beforeScore: "0% AI Share",
    beforeLabel: "Completely Invisible to AI Agents",
    beforePoints: [
      "ChatGPT and Perplexity cite zero information about clinic services",
      "Google SGE (Search Generative Experience) summaries omit business",
      "Zero structured JSON-LD schemas linking clinic to local knowledge graph",
      "Patients asking voice assistants get directed to competing corporate chains",
      "Result: Complete loss of next-gen high-ticket dental implant queries"
    ],
    afterScore: "#1 Recommended",
    afterLabel: "Top Recommended Provider Across AI Engines",
    afterPoints: [
      "Hyper-local SSR Micro-Page live with Triple Schema (LocalBusiness + FAQ + ItemList)",
      "500m neighborhood landmarks embedded into entity knowledge graph",
      "ChatGPT, Gemini, and Google SGE cite clinic as top authority for root canals",
      "Voice search optimization captures 'painless dental implant near me' queries",
      "Result: High-margin patients directed straight to WhatsApp consultation"
    ]
  },
  reviews: {
    id: "reviews",
    title: "Review Flywheel & Vision OCR",
    sub: "5.0★ rating with genuine customer photo reviews & zero gating",
    icon: MessageSquare,
    merchant: "Cake Connection, Manjalpur",
    category: "Pure Veg Bakery",
    beforeScore: "3.8 ★ (14 reviews)",
    beforeLabel: "Stagnant Social Proof",
    beforePoints: [
      "Last customer review posted 4 months ago • Zero food photos attached",
      "Vulnerable to malicious 1-star reviews dragging down average rating",
      "Staff hesitant to manually ask customers for Google reviews at counter",
      "No fraud protection: customers claim discounts using fake review screenshots",
      "Result: Google demotes profile due to low engagement velocity"
    ],
    afterScore: "4.9 ★ (384 reviews)",
    afterLabel: "Autonomous WhatsApp Review Flywheel",
    afterPoints: [
      "Physical acrylic WhatsApp QR standee active on billing counter",
      "Gemini 2.5 Flash Vision OCR verifies review screenshots in 3 seconds",
      "Scam detection auto-rejects draft buttons and wrong-shop screenshots",
      "Customers naturally upload cake photos and mention bestseller items",
      "Result: 100% Google policy compliant with zero review gating risk"
    ]
  },
  posts: {
    id: "posts",
    title: "Zero-Gap Google Business Posts",
    sub: "Active weekly cadence with 12-hour pre-expiration auto-renewal",
    icon: Clock,
    merchant: "Elegance Hair & Skin Lounge",
    category: "Luxury Salon & Aesthetics",
    beforeScore: "Expired 6mo Ago",
    beforeLabel: "Dormant Profile Signal",
    beforePoints: [
      "Zero active Google posts • Listing looks abandoned to searchers",
      "Google drops SERP justifications ('Special Offer', 'Available Today')",
      "Owner forgets to manually design and post promotional flyers",
      "Special festival packages fail to get local visibility on Google Maps",
      "Result: Missed weekend walk-ins and lost booking inquiries"
    ],
    afterScore: "3 Posts / Week",
    afterLabel: "Zero-Gap Auto-Renewal Cadence",
    afterPoints: [
      "Tuesday Product Spotlight: Highlights high-margin treatments with prices",
      "Thursday Customer Social Proof: Real review quote with photo proof",
      "Saturday Weekend VIP Flash Deal: 48h promo with countdown timer",
      "Zero-Gap Auto-Renewal: Schedules new post 12 hours before expiration",
      "Result: Listing stays 100% active 24/7 with permanent SERP justifications"
    ]
  },
  suspension: {
    id: "suspension",
    title: "Suspension Recovery & Policy Shield",
    sub: "100% Google 2026 Core Policy compliance & suspension immunity",
    icon: ShieldAlert,
    merchant: "Vinayak Car Care & Detailing (Vadodara)",
    category: "Car Detailing & Ceramic Studio",
    beforeScore: "SUSPENDED",
    beforeLabel: "Banned Due to Guideline Violations",
    beforePoints: [
      "Profile suspended by Google automated bot due to stuffed keywords in name",
      "Owner locked out of Google Maps • Zero phone calls or foot traffic",
      "Disputed via generic online forms with zero response from Google support",
      "Competitors immediately captured all local detailing search traffic",
      "Result: Complete business standstill bleeding ₹1.2 Lakh per month"
    ],
    afterScore: "REINSTATED (100% Clean)",
    afterLabel: "Reinstated & Policy Hardened",
    afterPoints: [
      "Physical DBA signboard audit matching municipal trade license exactly",
      "Clean category hierarchy restructuring without spammy keyword modifiers",
      "Official Google reinstatement appeal documentation prepared and cleared",
      "Listing restored with all legacy reviews and map citations preserved",
      "Result: Full recovery with permanent zero-suspension structural guard"
    ]
  }
}

// ============================================================================
// Multi-Radius Local Neighborhood Geo-Visibility Data (Inspired by GMBPro)
// ============================================================================
const RADAR_PINS = [
  {
    title: "Cafe Near Me",
    distance: "450 m",
    icon: Coffee,
    color: "text-amber-600",
    dotColor: "bg-amber-500",
    posClass: "top-[16%] left-[6%]"
  },
  {
    title: "Gym Near Me",
    distance: "700 m",
    icon: Dumbbell,
    color: "text-emerald-600",
    dotColor: "bg-emerald-500",
    posClass: "top-[14%] right-[8%]"
  },
  {
    title: "Dental Clinic Near Me",
    distance: "1.2 km",
    icon: Stethoscope,
    color: "text-blue-600",
    dotColor: "bg-blue-500",
    posClass: "top-[50%] left-[2%]"
  },
  {
    title: "Salon Near Me",
    distance: "800 m",
    icon: Scissors,
    color: "text-purple-600",
    dotColor: "bg-purple-500",
    posClass: "top-[48%] right-[4%]"
  },
  {
    title: "Restaurant Near Me",
    distance: "1.5 km",
    icon: UtensilsCrossed,
    color: "text-teal-600",
    dotColor: "bg-teal-500",
    posClass: "bottom-[16%] left-[8%]"
  },
  {
    title: "Hotel Near Me",
    distance: "900 m",
    icon: Hotel,
    color: "text-rose-600",
    dotColor: "bg-rose-500",
    posClass: "bottom-[14%] right-[10%]"
  }
]

const RADAR_FEATURES = [
  {
    icon: Target,
    iconBg: "bg-emerald-600",
    title: "Rank in Nearby Searches",
    desc: "We optimize your Google Business Profile so you appear in 'near me' and location-based searches across your city."
  },
  {
    icon: Compass,
    iconBg: "bg-blue-600",
    title: "Show Up Across Your Service Area",
    desc: "Get visibility not just in one location, but in every nearby area where your customers are searching."
  },
  {
    icon: Sparkles,
    iconBg: "bg-teal-600",
    title: "Optimized for Real Search Terms",
    desc: "We target 'near me', 'best [service]', '[service] in [city]', and hundreds of local keyword variations."
  },
  {
    icon: Search,
    iconBg: "bg-sky-600",
    title: "Keep an Eye on Competitors",
    desc: "Track where competitors rank, get alerts for profile changes, and stay ahead in local search."
  },
  {
    icon: TrendingUp,
    iconBg: "bg-emerald-600",
    title: "More Visibility. More Customers.",
    desc: "Higher local rankings lead to more calls, direction requests, website visits and enquiries."
  }
]

const NEARBY_SEARCH_PINS = [
  { term: "Cake Shop Near Me", distance: "450 m", rank: "#1", volume: "2,400/mo", tag: "Primary Micro-Zone" },
  { term: "Custom Birthday Cakes", distance: "800 m", rank: "#1", volume: "1,850/mo", tag: "High-Intent Buyer" },
  { term: "Midnight Cake Delivery", distance: "1.2 km", rank: "#2", volume: "1,600/mo", tag: "Service Expansion" },
  { term: "Pure Veg Eggless Bakery", distance: "1.8 km", rank: "#1", volume: "1,400/mo", tag: "Dietary Filter" },
  { term: "Belgian Truffle Near Me", distance: "2.4 km", rank: "#1", volume: "980/mo", tag: "Entity Match" },
  { term: "Designer Theme Cakes", distance: "3.5 km", rank: "#3", volume: "850/mo", tag: "City-Wide Radius" }
]

// ============================================================================
// Real Client Growth Stories & Verified Google Reviews
// ============================================================================
const REAL_CLIENT_STORIES = [
  {
    name: "Cake Connection, Manjalpur",
    owner: "Bhavin Patel",
    category: "Bakery & Desserts",
    city: "Vadodara",
    stars: 5,
    rankJump: "Rank #18 ➔ Rank #1 (Top 3 Locked)",
    result: "+82 Monthly Cake Orders via WhatsApp",
    quote: "CustomerPilot took our dormant listing from Page 2 to the absolute #1 spot on Google Maps in just 32 days. The acrylic QR standee on our billing counter collects 4–5 genuine photo reviews daily, and the automated Tuesday/Saturday posts keep our store highlighted on Google."
  },
  {
    name: "Pet Clinic @ Manjalpur",
    owner: "Dr. Kunal Shah",
    category: "Veterinary Care",
    city: "Vadodara",
    stars: 5,
    rankJump: "Rank #14 ➔ Rank #2 (9 Neighborhoods)",
    result: "+65 Puppy Vaccinations / Month",
    quote: "Earlier, clients just 1km away in Akota couldn't see our clinic on Google Maps. RankPilot wired our dog vaccinations and surgical services into Google's entity matrix. Now pet parents find us first, and the Gemini AI vision verifies review screenshots instantly without scam complaints."
  },
  {
    name: "Apex Smile Dental Studio",
    owner: "Dr. Sneha Mehta",
    category: "Dental Implants",
    city: "Vadodara",
    stars: 5,
    rankJump: "Page 2 ➔ Local 3-Pack #1 Spot",
    result: "₹1.8 Lakh High-Margin Inquiries",
    quote: "The SSR micro-page and schema wiring immediately triggered Google justifications for 'Sold here: Clear aligners' and 'Provides service: Single-sitting root canal'. Our consultation appointments doubled within the first 60 days."
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

  // What We Fix Showcase Tab State (GMBPro Inspired)
  const [activeFixTab, setActiveFixTab] = useState<keyof typeof FIX_SHOWCASE_DATA>("profile")
  const currentFix = FIX_SHOWCASE_DATA[activeFixTab]

  // Nearby Search Active Pin Index
  const [activeNearbyPin, setActiveNearbyPin] = useState<number>(0)

  // 3D Hero Card Flipper State (Inspired by GMBPro)
  const [activeFlipperCard, setActiveFlipperCard] = useState<number>(0)
  const [isFlipperPaused, setIsFlipperPaused] = useState<boolean>(false)

  // Auto-flip every 5 seconds unless hovered/interacted
  useEffect(() => {
    if (isFlipperPaused) return
    const timer = setInterval(() => {
      setActiveFlipperCard((prev) => (prev + 1) % 4)
    }, 5000)
    return () => clearInterval(timer)
  }, [isFlipperPaused])

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
      {/* 0. TOP ANNOUNCEMENT OFFER BAR */}
      <aside aria-label="Limited Launch Offer" className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white py-2 px-4 text-xs font-semibold shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-2xs">
              <Flame className="w-3 h-3 text-red-600 fill-current" />
              Limited Launch Offer
            </span>
            <span className="text-blue-100">
              <strong>3 Months at ₹6,999/-</strong> (Regular ₹29,000/yr) • 45 Days to 1st Page & 90 Days to Top 3 (or 60 Days if on Page 1) • <strong className="text-white underline decoration-amber-400 underline-offset-2">100% Moneyback Guarantee</strong>
            </span>
          </div>
          <a
            href="#pricing"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-[11px] shrink-0 transition-colors shadow-2xs"
          >
            <span>Claim ₹6,999 Offer</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </aside>

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

          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
            <a href="#audit-showcase" className="hover:text-blue-600 transition-colors">
              What We Fix
            </a>
            <a href="#nearby-search" className="hover:text-blue-600 transition-colors">
              Nearby Search
            </a>
            <a href="#geo-grid" className="hover:text-blue-600 transition-colors">
              Radar Grid
            </a>
            <a href="#revenue-leak" className="hover:text-blue-600 transition-colors">
              Revenue Leak
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              10+10 Matrix
            </a>
            <a href="#reviews" className="hover:text-blue-600 transition-colors">
              Client Proof
            </a>
            <a href="#roadmap" className="hover:text-blue-600 transition-colors">
              Guaranteed SLA
            </a>
            <a href="#pricing" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Pricing & Offer
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
            <a href="#pricing">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-9 shadow-sm gap-1.5 group">
                Claim ₹6,999 Offer
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </a>
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

                {/* HERO PROMINENT OFFER & 2-TIER SLA BANNER */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-emerald-50/80 border border-blue-200 shadow-sm space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-amber-500 hover:bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5">
                        🔥 SPECIAL LAUNCH OFFER: ₹6,999 / 3 MONTHS
                      </Badge>
                      <span className="text-xs text-slate-500 line-through font-mono">₹29,000/yr</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Save 76%
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>100% Moneyback Guarantee</span>
                    </div>
                  </div>

                  {/* 2-Tier Realistic SLA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-white/95 rounded-xl border border-blue-100 flex items-center gap-2 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                        1
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">New Store / Page 2–10</div>
                        <div className="text-[11px] text-slate-600">
                          <strong>45 Days</strong> to 1st Page ➔ <strong>90 Days</strong> to Top 3
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/95 rounded-xl border border-emerald-100 flex items-center gap-2 shadow-2xs">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">
                        2
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">Already on 1st Page</div>
                        <div className="text-[11px] text-slate-600">
                          <strong>60 Days Fast-Track</strong> to Top 3 Local Pack
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-0.5">
                    <span>Powered by internal <strong>RankLocal AI™</strong> core engine</span>
                    <a href="#pricing" className="text-blue-700 hover:text-blue-800 font-bold inline-flex items-center gap-1">
                      View Pricing & Guarantee <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Google Business Not Showing Up on Maps?</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                    Move Your Store from Page 10 to{" "}
                    <span className="text-blue-600 underline decoration-blue-200 decoration-wavy underline-offset-4">
                      Google Maps Top 3
                    </span>{" "}
                    in 45–90 Days.
                  </h1>
                </div>

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
                  <a href="#pricing">
                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 h-12 shadow-sm gap-2 group">
                      Claim ₹6,999 Launch Offer
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <Link href="#revenue-leak">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-slate-700 border-slate-300 font-semibold text-sm h-12 px-5 hover:bg-slate-100">
                      Calculate Your Revenue Leak
                    </Button>
                  </Link>
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

              {/* RIGHT: HERO 3D CARD FLIPPER ANIMATION (Inspired by GMBPro hero-visual) */}
              <div
                className="lg:col-span-5 relative"
                onMouseEnter={() => setIsFlipperPaused(true)}
                onMouseLeave={() => setIsFlipperPaused(false)}
              >
                <div className="flex flex-col items-center justify-center gap-3.5">
                  {/* Flipper Dots */}
                  <div className="flex items-center gap-2 mb-0.5">
                    {[
                      { idx: 0, label: "Maps 3-Pack" },
                      { idx: 1, label: "AI Review Vision" },
                      { idx: 2, label: "Zero-Gap Posts" },
                      { idx: 3, label: "AI Search (GEO)" }
                    ].map((dot) => (
                      <button
                        key={dot.idx}
                        onClick={() => setActiveFlipperCard(dot.idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          activeFlipperCard === dot.idx
                            ? "w-8 bg-blue-600 shadow-xs"
                            : "w-2.5 bg-slate-300 hover:bg-slate-400"
                        }`}
                        title={dot.label}
                        aria-label={dot.label}
                      />
                    ))}
                  </div>

                  {/* Flipper Box Chassis */}
                  <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-5 sm:p-6 relative min-h-[460px] flex flex-col justify-between overflow-hidden transition-all duration-500">
                    
                    {/* ── CARD 0: GOOGLE MAPS RANKING (Cake Connection, Manjalpur) ── */}
                    {activeFlipperCard === 0 && (
                      <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] uppercase tracking-wider border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                            Google Maps Ranking #1
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Vadodara Micro-Zone</span>
                        </div>

                        {/* Search Input Bar Mock */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-xs font-semibold text-slate-800 truncate">cake shop near me in manjalpur</span>
                          </div>
                          <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Search className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        {/* Search Sub-Tabs */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium border-b border-slate-100 pb-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">📍 Maps (Active)</span>
                          <span>All</span>
                          <span>Images</span>
                          <span className="ml-auto text-slate-400 font-mono">2,40,000 results</span>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-3 gap-2 py-1">
                          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-center">
                            <div className="text-lg font-black text-blue-700">#1 Spot</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase">Maps Rank</div>
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                            <div className="text-lg font-black text-emerald-700">+82 /mo</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase">Calls & Orders</div>
                          </div>
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                            <div className="text-lg font-black text-amber-700">4.9 ★</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase">384 Reviews</div>
                          </div>
                        </div>

                        {/* SERP Results Preview */}
                        <div className="space-y-1.5">
                          {/* Winning Card (Top 3) */}
                          <div className="p-2.5 rounded-xl bg-emerald-50/90 border-2 border-emerald-500 flex items-center justify-between text-xs shadow-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                              <div className="truncate">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>Cake Connection</span>
                                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px]">YOU (TOP 3)</span>
                                </div>
                                <div className="text-[10px] text-slate-600">4.9 ★ (384) • Bakery • 0.4 km</div>
                              </div>
                            </div>
                            <span className="text-[11px] font-black text-emerald-700 font-mono">16.0% Clicks</span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs opacity-75">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                              <div className="truncate">
                                <div className="font-semibold text-slate-700">Cityline Bakery & Cakes</div>
                                <div className="text-[10px] text-slate-500">4.4 ★ (168) • 1.1 km</div>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">7.2% Clicks</span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs opacity-60">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                              <div className="truncate">
                                <div className="font-semibold text-slate-700">Sweet Treats Studio</div>
                                <div className="text-[10px] text-slate-500">4.3 ★ (121) • 0.9 km</div>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">4.1% Clicks</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Jumped from Page 2 (Rank #18 ➔ #1)
                          </span>
                          <span className="font-mono text-blue-700 font-bold">Powered by RankLocal AI™</span>
                        </div>
                      </div>
                    )}

                    {/* ── CARD 1: AI REVIEW MANAGEMENT & VISION OCR ── */}
                    {activeFlipperCard === 1 && (
                      <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] uppercase tracking-wider border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            AI Review Management & Vision OCR
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">Always On</span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <div>
                            <div className="text-xs font-bold text-slate-900">We reply to every review in seconds</div>
                            <div className="text-[11px] text-slate-500">Automated in brand voice • 0 review gating</div>
                          </div>
                          <div className="w-9 h-5 rounded-full bg-emerald-600 p-0.5 flex items-center justify-end">
                            <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">P</div>
                                <div>
                                  <div className="font-bold text-slate-900 text-[11px]">Priya S.</div>
                                  <div className="text-amber-500 text-[10px]">★★★★★</div>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400">Google Review</span>
                            </div>
                            <p className="text-[11px] text-slate-700 italic">"Best Belgian chocolate cake in Vadodara! Custom ordered for birthday, fresh & delicious."</p>
                            
                            <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-[10px] space-y-1">
                              <div className="flex items-center justify-between font-bold text-blue-900">
                                <span className="flex items-center gap-1">✨ GEMINI AI VISION</span>
                                <span className="text-emerald-700 font-black">✔ Replied & Verified</span>
                              </div>
                              <p className="text-slate-700 text-[10px]">"Thank you Priya! We loved baking the Belgian truffle cake for your celebration! Enjoy your loyalty reward stamp!"</p>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center">K</div>
                                <div>
                                  <div className="font-bold text-slate-900 text-[11px]">Dr. Kunal Shah (Pet Clinic)</div>
                                  <div className="text-amber-500 text-[10px]">★★★★★</div>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400">Google Review</span>
                            </div>
                            <p className="text-[11px] text-slate-700 italic">"Our puppy vaccinations doubled within 30 days of setting up the QR standee. 100% genuine reviews!"</p>
                            
                            <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-[10px] space-y-1">
                              <div className="flex items-center justify-between font-bold text-blue-900">
                                <span className="flex items-center gap-1">✨ GEMINI AI VISION</span>
                                <span className="text-emerald-700 font-black">✔ Replied & Verified</span>
                              </div>
                              <p className="text-slate-700 text-[10px]">"Thank you Dr. Kunal! So proud to help pet parents across Vadodara find your clinic first!"</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span className="text-emerald-700 font-bold">Gemini 2.5 Flash Vision OCR</span>
                          <span>Scam-Proof Screenshot Verification in 3s</span>
                        </div>
                      </div>
                    )}

                    {/* ── CARD 2: ZERO-GAP GBP POST STUDIO ── */}
                    {activeFlipperCard === 2 && (
                      <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold text-[11px] uppercase tracking-wider border border-indigo-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                            Zero-Gap GBP Post Publishing
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold text-[10px]">✨ AI Studio</span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <div>
                            <div className="text-xs font-bold text-slate-900">We design & post for you on schedule</div>
                            <div className="text-[11px] text-slate-500">Auto-renewed 12h before Google expiration</div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 text-white space-y-2">
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-[9px] font-bold flex items-center justify-center">CP</span>
                              <span className="font-bold text-[11px]">Cake Connection, Manjalpur</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono">Auto-Scheduled</span>
                          </div>
                          
                          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-center space-y-1">
                            <div className="text-amber-300 font-black text-sm tracking-wide">30% OFF WEEKEND VIP SPECIAL</div>
                            <div className="text-[11px] text-blue-100 font-medium">Belgian Truffle & Walnut Brownies • 48-Hour Deal</div>
                          </div>

                          <p className="text-[11px] text-slate-300">
                            Beat the weekend celebration cravings! 🎂 Flash VIP celebration offer with 1-tap WhatsApp ordering. #VadodaraBakery #Local3Pack
                          </p>

                          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                            <div className="flex items-center gap-1 text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> Google Business Posts
                            </div>
                            <div className="flex items-center gap-1 text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> Zero-Gap Renewal
                            </div>
                            <div className="flex items-center gap-1 text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> WhatsApp 1-Tap CTA
                            </div>
                            <div className="flex items-center gap-1 text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> Triple Schema Wire
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>Tuesday Spotlight • Thursday Review • Saturday Deal</span>
                          <span className="text-blue-700 font-bold">100% Automated</span>
                        </div>
                      </div>
                    )}

                    {/* ── CARD 3: AI SEARCH VISIBILITY (GEO/AEO) ── */}
                    {activeFlipperCard === 3 && (
                      <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold text-[11px] uppercase tracking-wider border border-purple-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                            AI Search Visibility (GEO & AEO)
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[10px]">● LIVE</span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <div>
                            <div className="text-xs font-bold text-slate-900">Recommended by AI Assistants</div>
                            <div className="text-[11px] text-slate-500">ChatGPT · Gemini · Perplexity</div>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <Bot className="w-4 h-4 text-purple-600 shrink-0" />
                            <span className="text-[11px] text-slate-800 font-medium truncate">best pure veg cake shop in vadodara</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px] shrink-0">Ask AI</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 text-white space-y-2">
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-400" /> AI Answer
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                              ✔ Top Pick
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-200 leading-relaxed">
                            I recommend <strong className="text-amber-400">Cake Connection</strong> (Manjalpur, Vadodara) — rated 4.9★ with 384 verified reviews. Renowned for pure veg Belgian truffle cakes, custom themes, and fast midnight delivery.
                          </p>

                          <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                            <div className="text-[9px] font-mono text-slate-400 font-bold uppercase">CITED ACROSS AI ENGINES:</div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] flex items-center gap-1 border border-slate-700">
                                <Bot className="w-3 h-3 text-emerald-400" /> ChatGPT
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] flex items-center gap-1 border border-slate-700">
                                <Sparkles className="w-3 h-3 text-blue-400" /> Google Gemini
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] flex items-center gap-1 border border-slate-700">
                                <Search className="w-3 h-3 text-teal-400" /> Perplexity
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>Triple Schema JSON-LD Injection</span>
                          <span className="text-purple-700 font-bold">Knowledge Graph Verified</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Real numbers, not new claims (Matching GMBPro) */}
                  <div className="w-full max-w-lg p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between text-center divide-x divide-slate-100">
                    <div className="flex-1 px-1">
                      <div className="text-lg sm:text-xl font-black text-blue-600">500+</div>
                      <div className="text-[10px] text-slate-500 font-medium">Businesses Ranked</div>
                    </div>
                    <div className="flex-1 px-1">
                      <div className="text-lg sm:text-xl font-black text-amber-500">45–90 Days</div>
                      <div className="text-[10px] text-slate-500 font-medium">Guaranteed SLA</div>
                    </div>
                    <div className="flex-1 px-1">
                      <div className="text-lg sm:text-xl font-black text-emerald-600">3×</div>
                      <div className="text-[10px] text-slate-500 font-medium">More Calls</div>
                    </div>
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

        {/* 3.1. INTERACTIVE 3X3 GEO-RANK RADAR GRID */}
        <section id="geo-grid" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs px-3.5 py-1 font-semibold">
                Multi-Coordinate Geo-Grid Probes
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                3x3 Geo-Rank Radar Grid —{" "}
                <span className="text-blue-600">Simulate Day 1 vs Day 30</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Google Maps rankings vary dramatically depending on where the customer is standing. Toggle between Day 1 and Day 30 to see how our <strong>RankLocal AI™</strong> system transforms obscure red coordinates across your city into dominant green Local 3-Pack spots.
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
              {/* Radar Control Bar */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-5 h-5 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <div>
                    <span className="text-sm font-bold tracking-wide">3x3 Geo-Rank Radar Grid</span>
                    <span className="block text-[11px] text-slate-400">Hub: Cake Connection, Manjalpur (Vadodara)</span>
                  </div>
                </div>
                <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs self-start sm:self-auto">
                  <button
                    onClick={() => setRadarSprintMode("before")}
                    className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      radarSprintMode === "before"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Day 1 (Lost on Page 2)
                  </button>
                  <button
                    onClick={() => setRadarSprintMode("after")}
                    className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      radarSprintMode === "after"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Day 30 (Top 3 Locked)
                  </button>
                </div>
              </div>

              {/* 3x3 Coordinate Map Canvas */}
              <div className="p-5 sm:p-7 bg-radial from-slate-50 via-slate-100/50 to-slate-200/40 relative">
                <div className="text-xs font-semibold text-slate-500 mb-4 flex items-center justify-between">
                  <span>9 Grid Nodes Across Vadodara</span>
                  <span className="font-mono text-slate-400">Coverage Radius: 5.0 km</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {GEO_GRID_NODES.map((node) => {
                    const rank = radarSprintMode === "before" ? node.rankBefore : node.rankAfter
                    const isTop3 = rank <= 3
                    const isSelected = selectedGridPin.id === node.id

                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedGridPin(node)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[90px] cursor-pointer ${
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
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-rose-600 text-white shadow-xs"
                            }`}
                          >
                            #{rank}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {node.distanceKm}
                          </span>
                        </div>
                        <div className="text-xs font-bold truncate leading-tight mt-1.5">
                          {node.neighborhood}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Active Pin Inspection Card */}
                <div className="mt-5 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100">
                    <span className="flex items-center gap-2 text-slate-900 font-bold">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {selectedGridPin.neighborhood} ({selectedGridPin.distanceKm} from store)
                    </span>
                    <span className={`font-mono font-black px-2.5 py-0.5 rounded-full text-xs ${
                      (radarSprintMode === "before" ? selectedGridPin.rankBefore : selectedGridPin.rankAfter) <= 3
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      Google Rank: #{radarSprintMode === "before" ? selectedGridPin.rankBefore : selectedGridPin.rankAfter}
                    </span>
                  </div>
                  <div className="pt-1 text-xs space-y-1.5">
                    <div className="text-slate-700">
                      Search Query Tested: <span className="font-bold text-slate-900">"{selectedGridPin.query}"</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <span>Google Justification:</span>
                      <span className={`font-bold ${radarSprintMode === "before" ? "text-rose-600" : "text-emerald-700"}`}>
                        {radarSprintMode === "before" ? "None (Buried on Page 2)" : `✔ ${selectedGridPin.justification}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Radar Footer Status */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  {radarSprintMode === "before" ? (
                    <span className="text-rose-700 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Day 1 State: Average Rank #18 across 9 zones • Bleeding ~₹37,000 monthly revenue to competitors
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Day 30 State: Top 3 locked across all 9 zones • Capturing 16.0% local search click volume
                    </span>
                  )}
                </div>
                <a href="#pricing">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-3.5 shadow-xs">
                    Lock My Top 3 Rank
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3.5. WHAT WE FIX SHOWCASE: BEFORE vs AFTER (Inspired by GMBPro) */}
        <section id="audit-showcase" className="py-16 lg:py-24 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-900 to-slate-950 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <Badge className="bg-blue-600 text-white text-xs font-semibold px-3.5 py-1">
                GMB Audit & Transformation Showcase
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Google Business Profile Management —{" "}
                <span className="text-blue-400">See Exactly What We Fix</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Most agencies give vague promises. Here is the concrete, side-by-side technical difference between a neglected Google Business profile and one powered by our autonomous <strong>RankLocal AI™</strong> system.
              </p>
            </div>

            {/* 6 Tabs Switcher */}
            <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
              {(Object.keys(FIX_SHOWCASE_DATA) as Array<keyof typeof FIX_SHOWCASE_DATA>).map((tabKey) => {
                const tab = FIX_SHOWCASE_DATA[tabKey]
                const IconComponent = tab.icon
                const isActive = activeFixTab === tabKey
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFixTab(tabKey)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-500 shadow-md scale-102"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-400"}`} />
                    <span>{tab.title}</span>
                  </button>
                )
              })}
            </div>

            {/* Current Tab Metadata Box */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-700/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-semibold border border-blue-500/30">
                      Audit Example
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-300">{currentFix.category}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">{currentFix.merchant}</h3>
                  <p className="text-xs text-slate-400">{currentFix.sub}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                    <span className="text-[10px] text-slate-400 block uppercase">Before:</span>
                    <span>{currentFix.beforeScore}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <span className="text-[10px] text-slate-400 block uppercase">After AI Fix:</span>
                    <span>{currentFix.afterScore}</span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparative Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                {/* BEFORE CARD */}
                <div className="bg-rose-950/20 rounded-xl border border-rose-900/50 p-5 sm:p-6 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-rose-400" />
                      </span>
                      <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                        BEFORE • Problem State
                      </span>
                    </div>
                    <Badge variant="outline" className="text-rose-400 border-rose-800 bg-rose-950/40 text-[10px] font-mono">
                      {currentFix.beforeLabel}
                    </Badge>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {currentFix.beforePoints.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AFTER CARD */}
                <div className="bg-emerald-950/20 rounded-xl border border-emerald-800/50 p-5 sm:p-6 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </span>
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        AFTER • RankLocal AI™ Fix
                      </span>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-800 bg-emerald-950/40 text-[10px] font-mono">
                      {currentFix.afterLabel}
                    </Badge>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-200">
                    {currentFix.afterPoints.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-6 pt-5 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All fixes verified against official Google Business Profile 2026 Core Guidelines.</span>
                </div>
                <a href="#pricing">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-8 shadow-sm gap-1.5">
                    <span>Fix My Profile for ₹6,999</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </a>
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

        {/* 5.5. MULTI-RADIUS LOCAL NEIGHBORHOOD GEO-VISIBILITY (Inspired by GMBPro) */}
        <section id="nearby-search" className="py-16 lg:py-24 bg-white border-b border-slate-200/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider border border-blue-200">
                • LOCAL VISIBILITY •
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Rank Your Google Business Profile{" "}
                <span className="text-blue-600">In Every Nearby Search</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                When customers search for your services nearby, your business should be the one they see. We help you show up in every local search that matters.
              </p>
            </div>

            {/* Visual Layout: Left Radar Animation vs Right 5 Features */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
              {/* Left Column: 550px Radar Container (Inspired by GMBPro) */}
              <div className="lg:col-span-6 flex items-center justify-center">
                <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[520px] md:h-[520px] rounded-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.12)_0%,_rgba(14,165,233,0.02)_60%,_transparent_72%)] border border-sky-100 shadow-inner select-none">
                  
                  {/* Concentric Ring 4 (Outer ~500px) */}
                  <div className="absolute w-[94%] h-[94%] rounded-full border border-sky-200/50 pointer-events-none" />
                  
                  {/* Concentric Ring 3 (~380px) */}
                  <div className="absolute w-[72%] h-[72%] rounded-full border border-sky-200/60 pointer-events-none" />
                  
                  {/* Concentric Ring 2 (~260px) */}
                  <div className="absolute w-[50%] h-[50%] rounded-full border border-sky-200/70 pointer-events-none" />
                  
                  {/* Concentric Ring 1 (Inner ~140px) */}
                  <div className="absolute w-[28%] h-[28%] rounded-full border border-sky-300/80 pointer-events-none bg-sky-50/30" />

                  {/* Rotating Scanning Radar Sweep Wedge */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none animate-radar-sweep"
                    style={{
                      background: 'conic-gradient(from 0deg at 50% 50%, rgba(14, 165, 233, 0.35) 0deg, rgba(14, 165, 233, 0.05) 55deg, transparent 55deg)'
                    }}
                  />

                  {/* Center Business Node ("Your Business") */}
                  <div className="relative z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 text-white flex flex-col items-center justify-center shadow-xl shadow-blue-500/30 border-4 border-white text-center p-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
                    <Store className="w-4 h-4 sm:w-5 sm:h-5 text-white mb-0.5" />
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight leading-tight">
                      Your Business
                    </span>
                    <span className="text-[8px] text-blue-100 font-medium">Cake Connection</span>
                  </div>

                  {/* 6 Orbiting Pin Cards (Matching GMBPro Screenshot 2) */}
                  {RADAR_PINS.map((pin, pIdx) => {
                    const IconC = pin.icon
                    return (
                      <div
                        key={pIdx}
                        className={`absolute z-30 ${pin.posClass} flex items-center gap-1.5 transition-all duration-300 hover:scale-105`}
                      >
                        {/* Glowing Map Pin Dot */}
                        <div className="relative flex items-center justify-center shrink-0">
                          <span className={`w-3 h-3 rounded-full ${pin.dotColor} border-2 border-white shadow-xs`} />
                          <span className={`w-3 h-3 rounded-full ${pin.dotColor} animate-ping absolute opacity-75`} />
                        </div>

                        {/* Floating Pill Card */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-md flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0 ${pin.color}`}>
                            <IconC className="w-3.5 h-3.5" />
                          </div>
                          <div className="leading-tight">
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 whitespace-nowrap">
                              {pin.title}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono font-medium">
                              {pin.distance}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: 5 Features List (Inspired by GMBPro geo-features-col) */}
              <div className="lg:col-span-6 space-y-3.5">
                {RADAR_FEATURES.map((feature, fIdx) => {
                  const IconComp = feature.icon
                  return (
                    <div
                      key={fIdx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs hover:bg-white hover:border-blue-300 hover:shadow-md transition-all flex items-start gap-4"
                    >
                      <div className={`w-10 h-10 rounded-full ${feature.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5`}>
                        <IconComp className="w-5 h-5 text-white" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
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

        {/* 8. THE STEP-BY-STEP ROADMAP STEPPER & GUARANTEED SLA */}
        <section id="roadmap" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs px-3.5 py-1 font-semibold">
                Guaranteed Algorithmic SLA • 100% Moneyback
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                The Guaranteed Ranking Timeline Protocol
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                While our internal <strong>RankLocal AI™</strong> core engine accelerates optimization velocity within 30 days, we hold ourselves to a realistic, contract-grade SLA on our website: <strong>45 Days to 1st Page</strong> and <strong>90 Days to Top 3</strong> (or <strong>60 Days</strong> if already on Page 1) — backed by our unconditional 100% Moneyback Guarantee.
              </p>
            </div>

            {/* 2-Track SLA Visual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10">
              <div className="p-5 rounded-2xl bg-white border-2 border-blue-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-black">A</span>
                    Track A: New Listing or Currently on Page 2–10
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold">90-Day Full Journey</Badge>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-medium pl-8">
                  <div>• <strong>Phase 1 (Days 1–45)</strong>: 1st Page Ranking (Top 10) Guaranteed</div>
                  <div>• <strong>Phase 2 (Days 46–90)</strong>: Google Maps Top 3 Local 3-Pack Dominance</div>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 pl-8 pt-1">
                  🛡️ 100% Moneyback Guarantee if Top 3 is not achieved in 90 days.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs flex items-center justify-center font-black">B</span>
                    Track B: Already on 1st Page (Top 10)
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">60-Day Fast-Track</Badge>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-medium pl-8">
                  <div>• <strong>Fast-Track SLA (60 Days)</strong>: Elevate from position #4–#10 into the elite Google Maps Top 3 Local Pack</div>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 pl-8 pt-1">
                  🛡️ 100% Moneyback Guarantee if Top 3 is not achieved in 60 days.
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
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

        {/* 8.2. VERIFIED CLIENT RESULTS & REAL GOOGLE REVIEWS (Inspired by GMBPro) */}
        <section id="reviews" className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs px-3.5 py-1 font-semibold">
                Verified Client Transformation Proof
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Real Local Business Results •{" "}
                <span className="text-blue-600">Top 3 on Google Maps</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                Hear directly from real store owners who took their dormant listings from Page 2 obscure rankings to dominant Google Local 3-Pack placement using CustomerPilot.
              </p>
            </div>

            {/* 3 Case Study Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {REAL_CLIENT_STORIES.map((story, sIdx) => (
                <div
                  key={sIdx}
                  className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Stars and Jump Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: story.stars }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        Verified Result
                      </Badge>
                    </div>

                    {/* Rank Jump Badge */}
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{story.rankJump}</span>
                    </div>

                    {/* Real Quote */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      "{story.quote}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 space-y-2">
                    <div className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{story.result}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{story.name}</div>
                      <div className="text-[11px] text-slate-500">{story.owner} • {story.category}, {story.city}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Proof Strip */}
            <div className="mt-10 p-4 rounded-2xl bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>All case study metrics verified against Google Search Console & live Google Maps geo-coordinate probes.</span>
              </div>
              <a href="#pricing" className="text-blue-700 hover:text-blue-800 font-bold inline-flex items-center gap-1 shrink-0">
                <span>Start Your 45–90 Day Sprint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* 8.5. GUARANTEED PRICING & 100% MONEYBACK SECTION (Inspired by GMBPro Image 3 + CustomerPilot Brand Gradient) */}
        <section id="pricing" className="py-16 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Pricing Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider border border-blue-200">
                • PRICING PLAN •
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Unbeatable Google Business Profile Management{" "}
                <span className="text-blue-600">Pricing</span> — Find Your Perfect Plan Now
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Simple, transparent pricing to boost your local SEO visibility and attract more customers.
              </p>
            </div>

            {/* 4 Trust Badges Under Header (Matching GMBPro Screenshot 3) */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pb-12 text-slate-600 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Zap className="w-4 h-4" />
                </span>
                <span>Premium Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Phone className="w-4 h-4" />
                </span>
                <span>Expert Support</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <span>Real Results</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span>No Hidden Charges</span>
              </div>
            </div>

            {/* 2 Side-by-Side Pricing Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
              
              {/* CARD 1: MONTHLY / 3-MONTH PILOT (Matching Left Card in Screenshot 3) */}
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-lg p-7 sm:p-9 flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="space-y-6">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Monthly (3-Month Pilot)
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      Flexible plan for small businesses & fast ranking acceleration
                    </div>
                  </div>

                  {/* 10 Deliverables Checklist with Green Checks */}
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                    {[
                      "Google Business Profile Optimization",
                      "Product & Service Listings Management (10+10 Entity Matrix)",
                      "Local SEO & Citation Management",
                      "Local Keyword Optimization",
                      "Geo-Grid Ranking Analysis & Probes",
                      "Daily Google Business Profile Posts",
                      "Customer Review & Reply Management (Vision OCR)",
                      "Google Review Magic QR Code Standee",
                      "Monthly Performance Reports",
                      "24/7 Priority Support"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Pricing Details */}
                  <div className="pt-4 border-t border-slate-100 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 line-through">₹29,000</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200">
                        SAVE 76%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        ₹6,999
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 font-semibold">
                        / 3 Months
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      Just ₹2,333 / month • Full 90 Days SLA Coverage
                    </div>
                  </div>
                </div>

                {/* Pill CTA Button with Dark Arrow Circle (Matching Screenshot 3) */}
                <div className="pt-8">
                  <a
                    href="https://wa.me/919033304707?text=Hi%20CustomerPilot,%20I%20want%20to%20subscribe%20to%20the%20RankLocal%20Ai%203-Month%20Pilot%20(₹6,999)%20with%20100%25%20Moneyback%20Guarantee!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <button className="w-full h-13 px-6 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-600 font-bold text-sm sm:text-base flex items-center justify-between shadow-xs transition-all cursor-pointer group">
                      <span>Subscribe to 3-Month Pilot</span>
                      <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center transition-transform group-hover:translate-x-1">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </a>
                  <p className="text-[11px] text-center text-slate-500 mt-2">
                    🔒 Instant WhatsApp Activation • Standee Dispatched in 48h
                  </p>
                </div>
              </div>

              {/* CARD 2: YEARLY DOMINANCE (Elevated with CustomerPilot Brand Gradient: #1D4ED8 to #2563EB to #0D9488) */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#0D9488] text-white shadow-2xl shadow-blue-600/30 ring-4 ring-blue-500/20 p-7 sm:p-9 flex flex-col justify-between transition-all">
                {/* Gold MOST POPULAR Ribbon (Matching Screenshot 3) */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                    👑 MOST POPULAR
                  </span>
                </div>

                <div className="space-y-6 pt-2">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Yearly Dominance
                    </div>
                    <div className="text-xs text-blue-100 font-medium mt-1">
                      Best value for long-term category monopoly & defense
                    </div>
                  </div>

                  {/* 10+ Deliverables Checklist with Crisp White Checks */}
                  <ul className="space-y-3 text-xs sm:text-sm text-white/95">
                    {[
                      "Google Business Profile Optimization",
                      "Product & Service Listings Management (10+10 Matrix)",
                      "Local SEO & Citation Management",
                      "Local Keyword Optimization",
                      "Geo-Grid Ranking Analysis",
                      "Daily Google Business Profile Posts",
                      "Customer Review & Reply Management (Vision OCR)",
                      "Google Review Magic QR Standee + 2 NFC Tabletop Cards",
                      "Monthly Performance Reports",
                      "24/7 Priority VIP Dedicated Account Manager",
                      "Full 365-Day Continuous Google 3-Pack Defense",
                      "Algorithmic Core Update & Competitor Poach Shield"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5 border border-white/40">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Pricing Details */}
                  <div className="pt-4 border-t border-white/20 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-blue-200 line-through">₹39,000</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                        SAVE 25%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        ₹29,000
                      </span>
                      <span className="text-xs sm:text-sm text-blue-100 font-semibold">
                        / Year
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-200 font-bold">
                      Just ₹2,416 / month • Complete 365-Day Ranking Defense
                    </div>
                  </div>
                </div>

                {/* Pill CTA Button with Dark Circle Arrow (Matching Screenshot 3) */}
                <div className="pt-8">
                  <a
                    href="https://wa.me/919033304707?text=Hi%20CustomerPilot,%20I%20want%20to%20subscribe%20to%20the%20RankLocal%20Ai%20Yearly%20Dominance%20Plan%20with%20100%25%20Moneyback%20Guarantee!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <button className="w-full h-13 px-6 rounded-full bg-white hover:bg-slate-50 text-slate-950 font-black text-sm sm:text-base flex items-center justify-between shadow-xl transition-all cursor-pointer group">
                      <span>Subscribe to Yearly</span>
                      <span className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center transition-transform group-hover:translate-x-1">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </span>
                    </button>
                  </a>
                  <p className="text-[11px] text-center text-blue-100 mt-2">
                    🛡️ Official Invoice with GST Credit • 100% Moneyback Guarantee
                  </p>
                </div>
              </div>

            </div>

            {/* THE IRONCLAD 100% MONEYBACK GUARANTEE SEAL */}
            <div className="mt-12 max-w-4xl mx-auto rounded-3xl bg-emerald-50/80 border-2 border-emerald-300 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-base sm:text-lg font-black text-emerald-950">
                      Our Ironclad 100% Moneyback Guarantee
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[11px] font-bold">
                      Zero Financial Risk
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950/80 leading-relaxed font-medium">
                    We remove 100% of the financial risk. If your business profile does not rank on <strong>Page 1 within 45 days</strong> and in the <strong>Google Maps Top 3 within 90 days</strong> (or within <strong>60 days</strong> if you are already on Page 1), we will refund <strong>100% of your money</strong> directly to your bank account or UPI. No excuses, no complicated paperwork, zero questions asked.
                  </p>
                  <p className="text-xs text-emerald-900 font-semibold italic pt-1">
                    "Agar aapki dukaan committed timeline me target rank par nahi aati, toh bina kisi sawal ke 100% poora paisa turant wapas mil jayega."
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[11px] font-bold text-emerald-900">
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <Check className="w-3.5 h-3.5 text-emerald-700" /> 100% Full Refund
                    </div>
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <Check className="w-3.5 h-3.5 text-emerald-700" /> Direct UPI / Bank
                    </div>
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <Check className="w-3.5 h-3.5 text-emerald-700" /> Contractual SLA
                    </div>
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <Check className="w-3.5 h-3.5 text-emerald-700" /> Zero Hidden Fees
                    </div>
                  </div>
                </div>
              </div>
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
              Launch your Google Local 3-Pack sprint with RankPilot AI™. Full WhatsApp review flywheel, zero-gap posts, 10+10 entity matrix wiring, and a contractual 100% Moneyback Guarantee.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="#pricing" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-12 px-8 shadow-lg shadow-blue-600/30 gap-2 group">
                  Claim 3-Month Offer (₹6,999)
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a
                href="https://wa.me/919033304707?text=Hi%20CustomerPilot,%20I%20want%20to%20discuss%20the%20RankLocal%20Ai%20Annual%20Plan%20(₹29,000/yr)!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-slate-200 border-slate-700 hover:bg-slate-800 font-semibold text-sm h-12 px-6">
                  Inquire Annual Plan (₹29,000/yr)
                </Button>
              </a>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Google Policy-Clean
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Zero Fake Reviews
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> 100% Moneyback Guarantee
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

      {/* SCOPED CSS KEYFRAMES FOR RADAR & FLIPPER ANIMATIONS */}
      <style jsx global>{`
        @keyframes radarSweep {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-radar-sweep {
          animation: radarSweep 6s linear infinite;
        }
      `}</style>
    </div>
  )
}
