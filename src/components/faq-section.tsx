"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  ChevronDown,
  MessageSquare,
  Phone,
  ArrowRight,
  CheckCircle2,
  X
} from "lucide-react"

export interface FaqItem {
  id: number
  category: "all" | "general" | "loyalty" | "reviews" | "pricing" | "security"
  categoryLabel: string
  categoryLabelHi?: string
  icon: string
  question: string
  answer: string
  highlights?: string[]
  questionHi: string
  answerHi: string
  highlightsHi?: string[]
}

const FAQ_DATA: FaqItem[] = [
  // ─── 1. General & Getting Started ───
  {
    id: 1,
    category: "general",
    categoryLabel: "General",
    categoryLabelHi: "General",
    icon: "🚀",
    question: "What is CustomerPilot, and how does it grow my local business?",
    answer: "CustomerPilot is an all-in-one AI customer retention, digital loyalty, and Google Maps reputation platform designed specifically for local retail, restaurants, salons, cafes, and bakeries. It solves the biggest problem local businesses face: 70% of first-time walk-ins never return. CustomerPilot brings customers back through automated WhatsApp digital stamp cards, accelerates genuine 5-star Google reviews via AI drafting, and publishes appreciative review responses in 1-Click to boost your local SEO ranking.",
    highlights: [
      "Turns first-time walk-ins into repeat regular customers",
      "Automates 5-star Google review collection on WhatsApp",
      "Boosts local Google Maps ranking with 1-Click AI AutoReplies",
      "Zero extra workload for your cashier or store staff"
    ],
    questionHi: "CustomerPilot kya hai, aur ye mere local business ko kaise grow karta hai?",
    answerHi: "CustomerPilot ek all-in-one AI customer retention, digital loyalty, aur Google Maps reputation platform hai jo khas taur par local retail, restaurants, salons, cafes, aur bakeries ke liye banaya gaya hai. 70% naye walk-in grahak kabhi wapas nahi aate. CustomerPilot unhe WhatsApp digital stamp cards, AI-drafted 5-star Google reviews, aur 1-Click AutoReply ke zariye regular customer banata hai.",
    highlightsHi: [
      "Naye walk-ins ko regular repeat customer banata hai",
      "WhatsApp par 5-star Google review collection automate karta hai",
      "1-Click AI AutoReplies se local Google Maps ranking boost karta hai",
      "Cashier ya staff ke liye zero extra workload"
    ]
  },
  {
    id: 2,
    category: "general",
    categoryLabel: "Getting Started",
    categoryLabelHi: "Shuruat",
    icon: "📱",
    question: "Do my customers need to download an app or register an account?",
    answer: "No, absolutely NOT! Your customers never have to download anything from the App Store or Google Play Store. Unlike traditional loyalty apps that suffer from an 80%+ customer drop-off rate, CustomerPilot works 100% natively inside WhatsApp and standard mobile web browsers. Customers simply scan your counter QR code with their camera or share their mobile number at checkout.",
    highlights: [
      "100% No-App required for customers",
      "Works directly inside WhatsApp",
      "Zero friction: instant check-in under 5 seconds"
    ],
    questionHi: "Kya mere grahako ko koi app download ya account register karna padega?",
    answerHi: "Nahi, bilkul nahi! Aapke customers ko Play Store ya App Store se koi app download nahi karna padta. CustomerPilot 100% WhatsApp aur standard mobile web browser par chalta hai. Grahak bas counter QR code scan karte hain aur 5 second me jud jate hain.",
    highlightsHi: [
      "Grahako ke liye 100% No-App required",
      "Direct WhatsApp ke andar chalta hai",
      "Zero friction: 5 second me instant check-in"
    ]
  },
  {
    id: 3,
    category: "general",
    categoryLabel: "Getting Started",
    categoryLabelHi: "Shuruat",
    icon: "⚡",
    question: "How fast can I get started and launch CustomerPilot in my store?",
    answer: "You can be fully live in less than 3 minutes! Simply sign up with your business name, set your reward criteria (e.g. 'Visit 6 times, get ₹200 discount'), connect your Google Business Profile in 1 click, and download your auto-generated branded counter QR standee. Place the standee at your billing counter and start issuing stamps and collecting Google reviews immediately.",
    highlights: [
      "Live in under 3 minutes",
      "Instant printable QR standee generator included",
      "Free onboarding assistance via WhatsApp"
    ],
    questionHi: "Main CustomerPilot ko apni dukan me kitni jaldi shuru kar sakta hoon?",
    answerHi: "Aap sirf 3 minute me poori tarah live ho sakte hain! Apne business name ke sath signup karein, apna reward rule set karein (jaise '6 visits par ₹200 discount'), apna Google Business Profile connect karein, aur auto-generated counter QR standee print karke billing counter par rakh dein.",
    highlightsHi: [
      "3 minute ke andar live ho jayein",
      "Instant printable QR standee generator shamil hai",
      "WhatsApp par free onboarding assistance"
    ]
  },
  {
    id: 4,
    category: "general",
    categoryLabel: "Hardware & POS",
    categoryLabelHi: "Hardware & POS",
    icon: "🖥️",
    question: "Do I need an expensive POS system, barcode scanner, or special hardware?",
    answer: "Zero special hardware required! CustomerPilot operates entirely in the cloud. You can run our Cashier 1-Tap Counter Queue from any billing desktop, iPad, tablet, or staff smartphone. Alternatively, you can simply place our printed QR standee on your counter for customers to self-scan—meaning you don't even need a billing computer to run your loyalty program.",
    highlights: [
      "Works on any smartphone, iPad, tablet, or laptop",
      "Compatible with all existing billing software (Petpooja, Vyapar, Tally, Marg, etc.)",
      "Counter QR standee allows 100% contactless customer self-checkin"
    ],
    questionHi: "Kya mujhe kisi expensive POS system, barcode scanner, ya special hardware ki zaroorat padegi?",
    answerHi: "Zero special hardware required! CustomerPilot poori tarah cloud-based hai. Aap apne smartphone, tablet, iPad, ya billing desktop se 1-Tap Cashier Counter Queue chala sakte hain, ya grahak counter QR khud scan kar sakte hain.",
    highlightsHi: [
      "Kisi bhi smartphone, tablet, ya laptop par chalta hai",
      "Sabhi billing software (Petpooja, Vyapar, Tally, Marg) ke sath compatible",
      "Counter QR standee contactless self-checkin allow karta hai"
    ]
  },

  // ─── 2. WhatsApp Loyalty & Stamp Cards ───
  {
    id: 5,
    category: "loyalty",
    categoryLabel: "Digital Loyalty",
    categoryLabelHi: "Digital Loyalty",
    icon: "🎁",
    question: "How does the WhatsApp Digital Stamp Card work for customers?",
    answer: "When a customer visits your store and scans your counter QR code (or the cashier enters their phone number), a digital stamp is credited to their account. The customer instantly receives an interactive WhatsApp message containing their digital stamp card, an animated visual progress bar, total visits, and a reminder of their next reward milestone. Once they collect all required stamps, an exclusive reward voucher with a unique verification code is sent directly to their WhatsApp.",
    highlights: [
      "No lost, damaged, or forgotten paper stamp cards",
      "Instant WhatsApp delivery with animated progress tracker",
      "Automatic digital reward voucher with cashier redemption PIN"
    ],
    questionHi: "Customers ke liye WhatsApp Digital Stamp Card kaise kaam karta hai?",
    answerHi: "Jab customer dukan par aata hai aur counter QR scan karta hai, unke account me ek digital stamp lag jata hai. Customer ko turant WhatsApp par interactive message milta hai jisme unka digital stamp card, animated progress bar, total visits, aur next reward ki details hoti hain. Milestones poore hone par discount voucher WhatsApp par auto-deliver hota hai.",
    highlightsHi: [
      "Paper stamp cards ke khone ya fatne ka koi dar nahi",
      "Animated progress tracker ke sath instant WhatsApp delivery",
      "Cashier PIN redemption ke sath automatic digital reward voucher"
    ]
  },
  {
    id: 6,
    category: "loyalty",
    categoryLabel: "Anti-Fraud",
    categoryLabelHi: "Anti-Fraud",
    icon: "🛡️",
    question: "How does CustomerPilot prevent staff cheating, duplicate scans, or customer fraud?",
    answer: "CustomerPilot is equipped with strict anti-fraud safeguards: (1) Configurable Scan Cooldown Timers (e.g., maximum 1 stamp per customer every 4, 8, or 24 hours to prevent repeated scans in a single visit), (2) Minimum Bill Amount Validation (cashiers can enforce a minimum purchase threshold for stamp approval), (3) Cashier PIN Authorization for stamp issuance and reward redemption, and (4) Real-Time Audit Logs on the owner dashboard tracking every customer phone number, cashier name, and exact timestamp.",
    highlights: [
      "Strict scan cooldown timers (e.g. max 1 stamp per 24 hours)",
      "Cashier 4-digit PIN verification on reward redemptions",
      "Complete fraud audit trail accessible from owner portal"
    ],
    questionHi: "Staff cheating, duplicate scans, ya customer fraud kaise rukta hai?",
    answerHi: "CustomerPilot me strict anti-fraud safeguards hain: (1) Configurable Scan Cooldown Timers (e.g., 24 ghante me max 1 stamp per customer), (2) Minimum Bill Amount Validation, (3) Cashier 4-digit PIN Authorization, aur (4) Owner dashboard par real-time audit logs.",
    highlightsHi: [
      "Strict scan cooldown timers (e.g. max 1 stamp per 24 hours)",
      "Reward redemption par cashier 4-digit PIN verification",
      "Owner portal par complete fraud audit trail"
    ]
  },
  {
    id: 7,
    category: "loyalty",
    categoryLabel: "Win-Back Engine",
    categoryLabelHi: "Win-Back Engine",
    icon: "🔄",
    question: "How do Automated Win-Back campaigns and Birthday Rewards work?",
    answer: "CustomerPilot monitors customer visit frequency automatically. If a regular customer hasn't visited in 14, 30, or 60 days, our system automatically triggers a friendly, personalized WhatsApp message with a special perk to bring them back. Birthday and anniversary greetings with special vouchers are sent automatically at 9:00 AM on their special day—delivering high-margin repeat sales without you lifting a finger.",
    highlights: [
      "Automated 14/30/60 day inactivity win-back messages",
      "Automated birthday & anniversary celebration vouchers",
      "Over 42% of inactive customers return within 7 days of receiving a win-back prompt"
    ],
    questionHi: "Automated Win-Back campaigns aur Birthday Rewards kaise kaam karte hain?",
    answerHi: "CustomerPilot grahako ki visit frequency monitor karta hai. Agar koi regular grahak 14, 30, ya 60 din tak nahi aata, toh system use automatic personalized WhatsApp message aur special perk bhejta hai. Birthday aur anniversary par subah 9:00 AM par special gift voucher auto-send hota hai.",
    highlightsHi: [
      "Automated 14/30/60 din inactivity win-back messages",
      "Automated birthday & anniversary celebration vouchers",
      "42%+ inactive customers win-back message milne ke 7 din me wapas aate hain"
    ]
  },

  // ─── 3. Google Reviews & AutoReply ───
  {
    id: 8,
    category: "reviews",
    categoryLabel: "Google Reviews",
    categoryLabelHi: "Google Reviews",
    icon: "⭐",
    question: "How does CustomerPilot increase 5-star Google Reviews so quickly?",
    answer: "Right after a customer receives their visit stamp or completes a purchase, CustomerPilot sends a timely, polite WhatsApp message thanking them and asking for a quick rating. Satisfied customers rating 4 or 5 stars are immediately deep-linked to your Google Maps review page with an AI-drafted, SEO-optimized review draft already pre-filled. The customer simply pastes or taps 'Post'! This removes writer's block and increases your review conversion rate by 5X.",
    highlights: [
      "Frictionless WhatsApp post-visit review invitations",
      "AI generates unique, natural, keyword-rich review drafts for the customer",
      "Direct 1-tap redirect to your official Google Maps review screen"
    ],
    questionHi: "CustomerPilot itni jaldi 5-star Google Reviews kaise badhata hai?",
    answerHi: "Purchase ya stamp claim ke theek baad, CustomerPilot WhatsApp par gentle review request bhejta hai. 4 ya 5-star dene wale customers ko seedha Google Maps par redirect kiya jata hai jahan AI-drafted positive review pehle se likha hota hai. Customer bas 'Post' tap karta hai — jisse conversion 5X ho jata hai.",
    highlightsHi: [
      "Frictionless WhatsApp post-visit review invitations",
      "AI customer ke liye unique, natural review draft generate karta hai",
      "Aapke official Google Maps review screen par direct 1-tap redirect"
    ]
  },
  {
    id: 9,
    category: "reviews",
    categoryLabel: "Google Compliance",
    categoryLabelHi: "Google Compliance",
    icon: "✅",
    question: "Is CustomerPilot's Google review collection 100% compliant with Google policies?",
    answer: "Yes, 100% compliant. CustomerPilot strictly respects Google's review guidelines and FTC regulations. We never use bots, fake accounts, or illicit incentivization schemes. Every single review is posted voluntarily by real, verified customers logged into their own personal Google accounts on their own mobile devices.",
    highlights: [
      "Zero risk of Google account suspension or review deletion",
      "100% genuine reviews from verified walk-in customers",
      "Boosts local search visibility and Map Pack SEO organically"
    ],
    questionHi: "Kya CustomerPilot ka Google review collection 100% Google policies ke mutabik compliant hai?",
    answerHi: "Haan, 100% compliant. Hum kisi bot ya fake account ka use nahi karte. Har review real, verified walk-in customers dwara unke personal Google account se voluntarily post kiya jata hai.",
    highlightsHi: [
      "Google account suspension ya review deletion ka zero risk",
      "Verified walk-in customers se 100% genuine reviews",
      "Local search visibility aur Map Pack SEO organically boost hota hai"
    ]
  },
  {
    id: 10,
    category: "reviews",
    categoryLabel: "Review Protection",
    categoryLabelHi: "Review Protection",
    icon: "🤫",
    question: "What happens if an unhappy customer rates 1, 2, or 3 stars?",
    answer: "Negative reviews are caught by our Private Feedback Filter before reaching Google Maps. If a customer selects 1, 2, or 3 stars on WhatsApp, they are gracefully directed to a private, confidential feedback form instead of Google. The store owner or manager receives an immediate WhatsApp alert with the customer's comment and phone number, allowing you to resolve the grievance privately and win back their trust before a public review is ever posted.",
    highlights: [
      "Prevents damaging public 1-star reviews on Google Maps",
      "Instant WhatsApp alert to the store owner for rapid resolution",
      "Turns unhappy diners/shoppers into loyal regulars by listening"
    ],
    questionHi: "Agar koi na-khush customer 1, 2, ya 3 star rating de toh kya hota hai?",
    answerHi: "Negative reviews ko hamara Private Feedback Filter Google Maps par jaane se pehle hi rok leta hai. Customer ko ek private feedback form dikhaya jata hai aur store owner ko turant customer ke number aur grievance ka WhatsApp alert mil jata hai taaki aap private me mamla suljha sakein.",
    highlightsHi: [
      "Google Maps par damaging 1-star reviews ko rokta hai",
      "Rapid resolution ke liye store owner ko instant WhatsApp alert",
      "Sunwai karke naraz grahako ko loyal regular customer banata hai"
    ]
  },
  {
    id: 11,
    category: "reviews",
    categoryLabel: "AI AutoReply",
    categoryLabelHi: "AI AutoReply",
    icon: "💬",
    question: "What is AI Drafted 1-Click AutoReply, and how does it connect to Google Business Profile?",
    answer: "Replying to customer reviews on Google Maps is proven to boost your local SEO ranking by up to 28% and signals exceptional customer service. CustomerPilot connects seamlessly to your official Google Business Profile. Whenever a new review is posted, our AI analyzes the customer's sentiment and drafts an appreciative, polite, and keyword-optimized owner reply. You can approve and publish it to Google Maps with a single click from your dashboard, or set it to auto-publish.",
    highlights: [
      "1-Click official Google Maps response publishing",
      "AI contextually references mentioned dishes, stylists, or services",
      "Supports multiple Google Business Profile locations"
    ],
    questionHi: "AI Drafted 1-Click AutoReply kya hai aur Google Business Profile se kaise judta hai?",
    answerHi: "Google Maps reviews ka reply dene se local SEO ranking 28% tak badhti hai. CustomerPilot aapke official Google Business Profile se judkar har naye review ka sentiment samajhkar respectful aur keyword-rich reply draft karta hai, jise aap 1-click me approve kar sakte hain.",
    highlightsHi: [
      "1-Click official Google Maps response publishing",
      "AI dishes, stylists, ya services ko contextually mention karta hai",
      "Multiple Google Business Profile locations ko support karta hai"
    ]
  },

  // ─── 4. Pricing, Plans & 50% Offer ───
  {
    id: 12,
    category: "pricing",
    categoryLabel: "Modular Plans",
    categoryLabelHi: "Modular Plans",
    icon: "🛠️",
    question: "Can I buy only one standalone engine (e.g. only Google Reviews or only Loyalty)?",
    answer: "Yes! CustomerPilot gives you complete modular freedom. You are never forced into an expensive bundle you don't need. You can subscribe to: (1) Digital Loyalty Stamps & VIP Club standalone, (2) Smart AI Google Reviews standalone, (3) AI 1-Click AutoReply standalone, OR (4) the CustomerPilot Complete 3-in-1 Suite (Starter Growth or Pro Scaling) for maximum ROI.",
    highlights: [
      "Modular architecture: deploy single engines or the full suite",
      "Upgrade or add modules anytime as your store scales",
      "Transparent pricing starting from just ₹2.2/day"
    ],
    questionHi: "Kya main sirf ek standalone engine (jaise sirf Google Reviews ya sirf Loyalty) le sakta hoon?",
    answerHi: "Haan! CustomerPilot me complete modular freedom hai. Aap chahein toh sirf Digital Loyalty Stamps le sakte hain (₹549/6 mo), sirf Smart Google Reviews le sakte hain, ya complete 3-in-1 Suite le sakte hain.",
    highlightsHi: [
      "Modular architecture: single engine ya pura suite deploy karein",
      "Business scale hone par kabhi bhi upgrade karein",
      "Transparent pricing sirf ₹2.2/day se shuru"
    ]
  },
  {
    id: 13,
    category: "pricing",
    categoryLabel: "50% Discount Offer",
    categoryLabelHi: "50% Discount",
    icon: "🔥",
    question: "What is the Limited Time 50% Discount Offer, and how long is it locked in?",
    answer: "Currently, all plans are available with flat 50% OFF the Main MRP. Standalone 6-month plans are ₹549 (MRP ₹1,099), standalone 1-year plans are ₹799 (MRP ₹1,599 · ₹2.2/day), Starter Growth Complete 6-month plan is ₹1,749 (MRP ₹3,499), Pro Scaling Complete 1-year plan is ₹2,249 (MRP ₹4,499 · ₹6.2/day), and Enterprise 1-year is ₹4,999 (MRP ₹9,999 · ₹14/day). When you subscribe today, this 50% discount price is locked in for your entire active subscription duration.",
    highlights: [
      "Flat 50% OFF on all 6-month and 1-year plans",
      "Locked-in pricing: never experience surprise price hikes",
      "Includes all future feature updates and WhatsApp template enhancements"
    ],
    questionHi: "Limited Time 50% Discount Offer kya hai aur kab tak lock rahega?",
    answerHi: "Sabhi plans par flat 50% discount chal raha hai. Standalone plans ₹549 (6 months) aur ₹799 (1 year · ₹2.2/day) se shuru hote hain. Complete Pro Plan sirf ₹2,249/year (₹6.2/day) hai. Ek baar lene par ye 50% rate aapke poore subscription duration ke liye lock ho jata hai.",
    highlightsHi: [
      "Sabhi 6-month aur 1-year plans par flat 50% OFF",
      "Locked-in pricing: kabhi surprise price hike nahi hogi",
      "Sabhi future updates aur WhatsApp templates shamil hain"
    ]
  },
  {
    id: 14,
    category: "pricing",
    categoryLabel: "Free Trial",
    categoryLabelHi: "Free Trial",
    icon: "✨",
    question: "How does the 3-Day Free Trial work? Do I need to enter a credit card?",
    answer: "Our 3-Day Free Trial gives you 100% unrestricted access to all features—loyalty stamp cards, Google review automation, AI review reply generation, counter QR generator, and analytics. No credit card, debit card, or payment details are required to start. You can test real customer stamp cards and collect Google reviews risk-free.",
    highlights: [
      "100% free for 3 days with zero obligation",
      "No credit card or payment details required",
      "Keep all customer data and Google reviews collected during trial"
    ],
    questionHi: "3-Day Free Trial kaise kaam karta hai? Kya credit card details deni padegi?",
    answerHi: "3 din ka trial 100% unrestricted hai. Koi credit card, debit card, ya payment details required nahi hain. Aap real stamps issue karke aur Google reviews collect karke risk-free test kar sakte hain.",
    highlightsHi: [
      "Zero obligation ke sath 3 din ke liye 100% free",
      "Koi credit card ya payment details required nahi",
      "Trial ke dauran collected customer data aur Google reviews aapke paas rehte hain"
    ]
  },

  // ─── 5. Security, Data Ownership & Support ───
  {
    id: 15,
    category: "security",
    categoryLabel: "Data Privacy",
    categoryLabelHi: "Data Privacy",
    icon: "🔒",
    question: "Who owns my customer data, and can I export it to Excel/CSV?",
    answer: "You own 100% of your customer data. CustomerPilot strictly honors merchant confidentiality—we never sell, share, or market to your customers for third-party promotions. You can export your full customer database (names, phone numbers, visit counts, stamps earned, VIP tiers, and spend levels) to an Excel or CSV file at any time from your dashboard with one click.",
    highlights: [
      "100% Merchant-owned customer records",
      "One-click Excel/CSV export anytime",
      "Bank-grade SSL encryption and secure data isolation"
    ],
    questionHi: "Mere customer data ka maalik kaun hai? Kya main ise Excel/CSV me export kar sakta hoon?",
    answerHi: "Aap 100% apne customer data ke maalik hain. CustomerPilot kabhi bhi third-party ko data nahi bechta. Aap dashboard se 1-click me pura customer database (naam, number, visits, stamps, spend) Excel ya CSV me download kar sakte hain.",
    highlightsHi: [
      "100% Merchant-owned customer records",
      "Kabhi bhi 1-click Excel/CSV export karein",
      "Bank-grade SSL encryption aur secure data isolation"
    ]
  },
  {
    id: 16,
    category: "security",
    categoryLabel: "Support & Help",
    categoryLabelHi: "Support & Help",
    icon: "🤝",
    question: "What kind of customer support and training is provided?",
    answer: "Every merchant gets direct access to our priority WhatsApp support (+91 90333 04707), phone support, and email helpdesk. Our dedicated merchant success specialists assist you with designing and printing your counter standees, configuring custom reward milestones, verifying your Google Business Profile connection, and training your cashier staff.",
    highlights: [
      "Direct WhatsApp support with real humans: +91 90333 04707",
      "Free custom counter standee print-ready design file",
      "Staff training cheat-sheets and quick-start videos"
    ],
    questionHi: "Kis tarah ka customer support aur training provide ki jaati hai?",
    answerHi: "Har merchant ko hamari priority WhatsApp support (+91 90333 04707), phone support, aur free custom counter standee print-ready design file milti hai. Sath hi staff training cheat-sheets aur onboarding videos provide kiye jaate hain.",
    highlightsHi: [
      "Real humans ke sath direct WhatsApp support: +91 90333 04707",
      "Free custom counter standee print-ready design file",
      "Staff training cheat-sheets aur quick-start videos"
    ]
  }
]

const CATEGORIES = [
  { key: "all", labelEn: "All Questions", labelHi: "Sabhi Sawal", emoji: "❓" },
  { key: "general", labelEn: "General & Setup", labelHi: "General & Setup", emoji: "⭐" },
  { key: "loyalty", labelEn: "WhatsApp Loyalty", labelHi: "WhatsApp Loyalty", emoji: "🎁" },
  { key: "reviews", labelEn: "Google Reviews & AI", labelHi: "Google Reviews & AI", emoji: "🌟" },
  { key: "pricing", labelEn: "Pricing & 50% Offer", labelHi: "Pricing & 50% Offer", emoji: "🔥" },
  { key: "security", labelEn: "Data Privacy & Support", labelHi: "Data Privacy & Support", emoji: "🔒" },
]

export function FaqSection() {
  // (1) English (Indian English) is the DEFAULT language
  const [lang, setLang] = useState<"en" | "hinglish">("en")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [openFaqId, setOpenFaqId] = useState<number | null>(1) // First item open by default

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.questionHi && item.questionHi.toLowerCase().includes(q)) ||
        (item.answerHi && item.answerHi.toLowerCase().includes(q)) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.highlights?.some(h => h.toLowerCase().includes(q)) ||
        item.highlightsHi?.some(h => h.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  const toggleFaq = (id: number) => {
    setOpenFaqId(prev => (prev === id ? null : id))
  }

  return (
    <section className="faq-section py-20 sm:py-28 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-t border-slate-200/80" id="faq">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <span>❓</span>
            <span>{lang === "en" ? "Frequently Asked Questions" : "Aapke Sawal, Hamare Jawab"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-base sm:text-lg font-medium text-slate-600 leading-relaxed">
            {lang === "en" 
              ? "Everything you need to know about CustomerPilot" 
              : "CustomerPilot ke bare me vyaparion ke zaroori sawal aur unke detailed jawab"}
          </p>

          {/* TWO LANGUAGE OPTIONS SELECTION MODE (ENGLISH BY DEFAULT) */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-inner">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  lang === "en"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🇮🇳 English (Indian English)
              </button>
              <button
                type="button"
                onClick={() => setLang("hinglish")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  lang === "hinglish"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🗣️ Hinglish
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === "en" 
                ? "Search questions (e.g. WhatsApp, staff fraud, Google reviews, pricing, POS)..."
                : "Sawal search karein (jaise: WhatsApp, staff fraud, Google reviews, pricing, POS)..."}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-xs text-slate-500 text-center font-medium">
              Found {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"} for &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.key
            const label = lang === "en" ? cat.labelEn : cat.labelHi
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Accordion List */}
        <div className="mt-12 space-y-3.5 max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3 text-xl">
                ❓
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {lang === "en" ? "No matching questions found" : "Koi milta julta sawal nahi mila"}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {lang === "en"
                  ? `We couldn't find anything matching "${searchQuery}". Try another term or chat with our team on WhatsApp directly.`
                  : `"${searchQuery}" se related koi sawal nahi mila. Doosra term try karein ya WhatsApp par direct baat karein.`}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            filteredFaqs.map(item => {
              const isOpen = openFaqId === item.id
              const questionText = lang === "en" ? item.question : item.questionHi
              const answerText = lang === "en" ? item.answer : item.answerHi
              const highlightsList = lang === "en" ? item.highlights : (item.highlightsHi || item.highlights)

              return (
                <div
                  key={item.id}
                  className={`group rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-white border-emerald-500/50 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                      : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
                      <span className="text-xl flex-shrink-0 select-none">{item.icon}</span>
                      <span className={`text-sm sm:text-base font-extrabold transition-colors leading-snug ${
                        isOpen ? "text-slate-950" : "text-slate-800 group-hover:text-slate-950"
                      }`}>
                        {questionText}
                      </span>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "bg-emerald-50 text-emerald-600 rotate-180" : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100/80">
                          <p className="whitespace-pre-line text-slate-700 font-normal">
                            {answerText}
                          </p>

                          {highlightsList && highlightsList.length > 0 && (
                            <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-1.5 bg-slate-50/60 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 px-5 sm:px-6 py-3.5">
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {lang === "en" ? "Key Highlights:" : "Khas Baatein:"}
                              </div>
                              <ul className="space-y-1">
                                {highlightsList.map((h, i) => (
                                  <li key={i} className="flex items-start gap-2 text-[12px] font-medium text-slate-800">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span>{h}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </div>

        {/* ============ STILL HAVE QUESTIONS? CALLOUT CARD ============ */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 text-white shadow-xl border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  {lang === "en" ? "Still have questions?" : "Koi aur sawal hai?"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  {lang === "en" ? "Chat directly with our founder on WhatsApp" : "Hamare founder se direct WhatsApp par baat karein"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
                  {lang === "en"
                    ? "Get a customized retention plan for your exact business type in 5 minutes. No sales bots, just real help."
                    : "Apne business type ke mutabik 5 minute me customized plan samjhein. Real humans, zero bots."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <a
                  href="https://wa.me/919033304707?text=Hi%2C%20I%20have%20questions%20about%20CustomerPilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp: +91 90333 04707</span>
                </a>

                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all"
                >
                  <span>{lang === "en" ? "Start Free Trial" : "Free Trial Shuru Karein"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
