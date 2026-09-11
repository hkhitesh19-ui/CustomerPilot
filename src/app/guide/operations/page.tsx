'use client'

import React, { useState } from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import {
  Sparkles,
  Gift,
  Star,
  ArrowRight,
  Clock,
  Smartphone,
  Store,
  Users,
  Layers,
  Sliders,
  Settings,
  Repeat,
  Zap,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Receipt,
  MessageSquare,
  Flame,
  Award,
  Volume2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Lang = "en" | "hi"
type JourneyView = "all" | "merchant" | "customer" | "simulation" | "matrix"
type SimStage = 1 | 2 | 3 | 4 | 5

// --- MULTI-LANGUAGE DICTIONARY ---
const I18N = {
  en: {
    langBtn: "हिंग्लिश (Hinglish)",
    langLabel: "Language",
    topBanner: "Live Counter Operations Manual • Daily Flow for Restaurant/Shop Owners, Managers & Customers",
    topLink: "5-Min Setup Blueprint →",
    navHome: "Home",
    navSetup: "5-Minute Setup Guide",
    navSimulation: "Counter Simulation",
    navSettings: "Live Settings",
    navQueue: "Open Live Queue",
    heroBadge: "🔄 Live Counter Operations Manual",
    heroH1Part1: "After Complete Setup:",
    heroH1Part2: "How Does It Actually Work?",
    heroSubtitle:
      "A complete infographic guide explaining exactly what the Restaurant/Shop Owner, Manager, or Cashier does at the billing counter (just 3 seconds!) and what the Customer experiences on WhatsApp in real time.",
    switcherAll: "Full Journey (All)",
    switcherMerchant: "👨‍💼 Merchant's Journey (Restaurant/Shop)",
    switcherCustomer: "📱 Customer's Journey (Visitor)",
    switcherSimulation: "⚡ Interactive Simulation",
    switcherMatrix: "📊 Responsibility Matrix",
    stat1Val: "3 Seconds",
    stat1Label: "Cashier Effort Per Bill",
    stat2Val: "Zero App Download",
    stat2Label: "Customer Joins via WhatsApp",
    stat3Val: "100% Automated",
    stat3Label: "AI 5★ Reviews & Auto-Reply",
    stat4Val: "Silver VIP Tier",
    stat4Label: "Surprise Loyalty Milestones",
    simHeaderBadge: "⚡ Interactive Live Simulation",
    simTitle: "Counter Transaction Stepper",
    simSubtitle: "(Click any stage to see live phone vs counter screen)",
    simCashierBadge: "Total Cashier Effort: 3 Seconds",
    simTimeLabel: "Time Taken:",
    simCustomerTitle: "📱 Customer Experience (Phone Screen)",
    simMerchantTitle: "👨‍💼 Cashier / Merchant Screen (/dashboard/queue)",
    simSystemAutomation: "System Automation:",
    simNextStage: "Next Stage",
    merchantSectionBadge: "Restaurant/Shop Daily Routine",
    merchantSectionTitle: "Merchant Journey: What Does the Restaurant/Shop Owner / Manager / Cashier Do?",
    merchantPosBadge: "Zero POS Integration Risk 🛡️",
    customerSectionBadge: "Visitor Experience",
    customerSectionTitle: "Customer Journey: What Does the Customer Experience?",
    customerZeroBadge: "Zero Form • Zero App Download 🚀",
    matrixBadge: "Responsibility Matrix",
    matrixTitle: "Summary Matrix: Who Does What?",
    colStep: "Step / Activity",
    colMerchant: "👨‍💼 What Does Merchant / Cashier Do?",
    colCustomer: "📱 What Does Customer Do?",
    colAI: "🤖 What Does CustomerPilot AI Automate?",
    ctaBadge: "Need to Configure First?",
    ctaTitle: "Want to Learn the 5-Minute Setup First?",
    ctaSubtitle:
      "Configure store details, choose your industry rules & rewards, connect WhatsApp Web, and download counter QR standees in under 5 minutes.",
    ctaBtnSetup: "Open 5-Minute Setup Guide →",
    ctaBtnQueue: "Launch Live Queue Desk",
    ctaBtnSettings: "Open Store Settings",
    stepsM: [
      {
        tag: "Step M1 • Morning (One-Time Placement)",
        time: "0 Min Daily",
        title: "Place QR Standee on the Billing Counter",
        desc: "Download the printable QR Standee PDF from your dashboard and place it in an acrylic stand on your billing desk (right next to your UPI payment scanner). No wires, POS cables, or electricity needed.",
        pitchTitle: "🗣️ How to invite customers at the counter (Verbal Pitch):",
        pitch: "You can say: 'Sir/Madam, you can now become a VIP Club Member of our Restaurant/Shop. Just scan this QR code on your phone — it is 100% free with no charges and you will earn rewards on every visit!'",
      },
      {
        tag: "Step M2 • When Restaurant/Shop Opens",
        time: "10 Seconds",
        title: "Open Live Queue on the Counter Phone or Tablet",
        desc: "Cashier keeps customerpilot.in/dashboard/queue open on any phone, tablet, or billing PC. You can add it to your home screen like an app icon for 1-tap launch.",
      },
      {
        tag: "Step M3 • Core Daily Duty (Per Customer)",
        time: "⏱️ Only 3 Seconds!",
        title: "Type Bill Amount & Tap 'Approve Stamp (✓)'",
        desc: "When a customer scans the counter QR, their name and mobile number instantly appear on the cashier's Live Queue. The cashier just types the bill amount (e.g. ₹280) and taps the green 'Approve Stamp (✓)' button. (Here, you can also enter a short name for the product purchased by the customer — this is purely optional, not compulsory).",
        highlight: "Rahul Sharma (+91 98765...) ➔ Bill: ₹280 | Item: Belgian Chocolate Pastry (Optional) [✓ Approve Stamp]",
        note: "💡 That's all the cashier does! Adding stamps, sending WhatsApp receipt, and updating the customer's wallet are 100% handled by CustomerPilot autonomously.",
      },
      {
        tag: "Step M4 • When Customer Completes 10 Stamps",
        time: "5 Seconds",
        title: "Hand Over Free Reward & Tap 'Redeem'",
        desc: "When a customer presents their WhatsApp Golden Voucher (e.g. 'Free Belgian Pastry'), the cashier checks the voucher ID and taps 'Redeem' in the dashboard. The system automatically upgrades the customer to Silver VIP tier with bonus surprise stamps.",
      },
      {
        tag: "Step M5 • 100% Autonomous (Zero Daily Effort)",
        time: "Merchant Effort: 0%",
        title: "Google Reviews, AI Auto-Replies & Win-Backs Run Automatically",
        items: [
          {
            title: "⭐ Google 5★ Review Requests",
            desc: "Customers automatically receive AI review prompts on WhatsApp after the customizable time delay. Merchant never needs to beg.",
          },
          {
            title: "🤖 Gemini AI Auto-Replies",
            desc: "When a 5-star review appears on Google Maps, Gemini AI instantly publishes a polite, personalized owner reply.",
          },
          {
            title: "💌 30-Day Win-Backs",
            desc: "Customers who haven't returned for 30 days receive automated friendly WhatsApp reminders with tailored treats.",
          },
        ],
      },
    ],
    stepsC: [
      {
        tag: "Step C1 • At Billing Counter",
        time: "Friction: Zero",
        title: "Scan Standee QR with Phone Camera or WhatsApp",
        desc: "Customer sees the desk standee: 'Scan to Earn Free Pastry on Every Visit!'. They point their standard mobile camera or WhatsApp scanner at the QR code. No Google Play or App Store download needed.",
      },
      {
        tag: "Step C2 • 1-Tap Join",
        time: "Action: 1 Tap 'Send'",
        title: "Send Pre-Typed WhatsApp Join Message",
        desc: "Scanning opens WhatsApp with a pre-filled message: 'Hi! Adding my visit at Cake Connection...'. The customer simply taps 'Send' and immediately gets a personalized welcome card.",
      },
      {
        tag: "Step C3 • After Paying the Bill",
        time: "Instant Notification",
        title: "Receive WhatsApp Bill Receipt & Live Animated Stamp Card",
        desc: "As soon as the cashier approves, the customer's phone pings with their official receipt: '🎉 ₹320 Bill Confirmed! 1 Stamp Added. Total: 1/10 Stamps.' Includes a live web wallet link showing an animated stamp card.",
      },
      {
        tag: "Step C4 • 1-Click AI Review",
        time: "Effort: 5 Seconds",
        title: "Publish AI-Drafted 5-Star Review to Google Maps",
        desc: "After the visit (after the set time-delay), customer receives a WhatsApp message: 'Loved your visit? AI has drafted a 5★ review for you!'. With 1 tap, the customer opens Google Maps with the genuine review already drafted, and clicks Post.",
      },
      {
        tag: "Step C5 • Reward Milestone",
        time: "10 Stamps Complete",
        title: "Show Golden Voucher at Counter & Enjoy Free Treat",
        desc: "Upon reaching 10 stamps, the customer unlocks a Golden Voucher on WhatsApp. On their next visit, they show the voucher to get their free item, get 2 surprise advance stamps, and level up to Silver VIP status!",
      },
      {
        tag: "Step C6 • Referral Viral Loop",
        time: "Organic Growth",
        title: "Share Referral Link with Friends via WhatsApp",
        desc: "Customer taps 'Invite a Friend' in their digital wallet to share a WhatsApp invite. When their friend makes their first purchase, both the friend and customer receive bonus stamps.",
      },
    ],
    matrixRows: [
      {
        step: "1. Joining the Loyalty Program",
        merchant: "Keep QR standee on the counter & invite customer to scan",
        customer: "Point phone camera to scan & tap Send",
        ai: "Instant WhatsApp welcome message & live digital wallet creation",
      },
      {
        step: "2. Earning Stamps",
        merchant: "Type bill amount & tap 'Approve' (optional product name) (3s)",
        customer: "Pay bill normally (UPI/Cash/Card)",
        ai: "Instant WhatsApp receipt delivery & animated stamp card balance update",
      },
      {
        step: "3. 5-Star Google Reviews",
        merchant: "Zero effort (automated after custom time-delay)",
        customer: "Tap WhatsApp link to post AI-drafted 5★ review (1 click)",
        ai: "Gemini AI crafts personalized review drafts & delivers via WhatsApp after set delay",
      },
      {
        step: "4. Google Review Auto-Replies",
        merchant: "Zero effort (no manual typing)",
        customer: "N/A",
        ai: "Gemini AI generates and posts polite owner replies directly onto Google Maps",
      },
      {
        step: "5. Claiming Free Rewards",
        merchant: "Inspect voucher & tap 'Redeem' (5 seconds)",
        customer: "Show WhatsApp Golden Voucher & enjoy treat",
        ai: "Voucher verification, Silver VIP tier upgrade & 2 advance bonus stamps",
      },
      {
        step: "6. Customer Retention & Repeat Visits",
        merchant: "Focus on running Restaurant/Shop and serving great products",
        customer: "Receives birthday treats & win-back perks",
        ai: "30-day win-back campaigns, birthday automation & referral rewards",
      },
    ],
  },
  hi: {
    langBtn: "English",
    langLabel: "भाषा",
    topBanner: "Live Counter Operations Manual • Restaurant/Shop ke Owner/Manager/Cashier aur Grahak Ka Rozana Flow",
    topLink: "5-Min Setup Blueprint →",
    navHome: "Home",
    navSetup: "5-Minute Setup Guide",
    navSimulation: "Counter Simulation",
    navSettings: "Live Settings",
    navQueue: "Open Live Queue",
    heroBadge: "🔄 Live Counter Operations Manual",
    heroH1Part1: "Complete Setup Ke Baad:",
    heroH1Part2: "Kaise Kaam Karega?",
    heroSubtitle:
      "Restaurant/Shop par complete setup ke baad Cashier ko kya karna hoga (sirf 3 second!) aur Customer ko apne WhatsApp par kya dikhega — step-by-step infographical guide aur live simulation dekhiye.",
    switcherAll: "Full Journey (Dono)",
    switcherMerchant: "👨‍💼 Merchant Ki Journey (Restaurant/Shop)",
    switcherCustomer: "📱 Customer Ki Journey (Grahak)",
    switcherSimulation: "⚡ Interactive Simulation",
    switcherMatrix: "📊 Responsibility Matrix",
    stat1Val: "3 Seconds",
    stat1Label: "Cashier Ka Effort Per Bill",
    stat2Val: "Zero App Download",
    stat2Label: "Customer WhatsApp Se Judega",
    stat3Val: "100% Automated",
    stat3Label: "AI 5★ Reviews & Auto-Reply",
    stat4Val: "Silver VIP Tier",
    stat4Label: "Surprise Bonus Stamps",
    simHeaderBadge: "⚡ Interactive Live Simulation",
    simTitle: "Counter Transaction Stepper",
    simSubtitle: "(Kisi bhi stage par click karke dekhein)",
    simCashierBadge: "Total Cashier Effort: Sirf 3 Seconds",
    simTimeLabel: "Kitna Time Laga:",
    simCustomerTitle: "📱 Customer Experience (Phone Screen)",
    simMerchantTitle: "👨‍💼 Cashier / Merchant Screen (/dashboard/queue)",
    simSystemAutomation: "System Automation:",
    simNextStage: "Agla Stage",
    merchantSectionBadge: "Restaurant/Shop Par Daily Routine",
    merchantSectionTitle: "Merchant Ki Journey: Restaurant/Shop ke Owner/Manager/Cashier Ko Kya-Kya Karna Hoga?",
    merchantPosBadge: "Zero POS Integration Risk 🛡️",
    customerSectionBadge: "Grahak Ka Experience",
    customerSectionTitle: "Customer Ki Journey: Grahak Ko Kya-Kya Karna Hoga?",
    customerZeroBadge: "Zero Form • Zero App Download 🚀",
    matrixBadge: "Kaam Ka Batwara",
    matrixTitle: "Summary Matrix: Kaun Kya Karega?",
    colStep: "Activity / Step",
    colMerchant: "👨‍💼 Restaurant/Shop Cashier Ko Kya Karna Hai?",
    colCustomer: "📱 Customer Ko Kya Karna Hai?",
    colAI: "🤖 CustomerPilot AI Engine Kya Automate Karta Hai?",
    ctaBadge: "Pehle Setup Karna Hai?",
    ctaTitle: "Pehle 5-Minute Setup Guide Dekhna Chahte Hain?",
    ctaSubtitle:
      "Store details bharna, apne business ke hisaab se rules & rewards set karna, WhatsApp connect karna aur counter QR standee download karne ka pura guide dekhein.",
    ctaBtnSetup: "5-Minute Setup Guide Kholein →",
    ctaBtnQueue: "Live Queue Desk Kholein",
    ctaBtnSettings: "Store Settings Kholein",
    stepsM: [
      {
        tag: "Step M1 • Subah (Ek Baar Setup)",
        time: "Daily: 0 Minutes",
        title: "Counter Par Standee QR Rakhna & Customer Ko Invite Karna",
        desc: "Dashboard se downloaded printable PDF QR Standee ko cash counter / billing desk par acrylic stand me rakh dein (UPI scanner ke bagal me). Isme koi wire ya electricity ki zaroorat nahi hoti.",
        pitchTitle: "🗣️ Customer ko cashier kya bol sakta hai (Verbal Pitch):",
        pitch: "Customer ko aisa bata sakte ho ki : 'Sir/Mam aap ab hamare Restaurant/Shop ke VIP Club me Member ban sakte ho, uske liye just ye QR code Scan kijiye, uska koi charges nahi he, bilkul Free he.'",
      },
      {
        tag: "Step M2 • Restaurant/Shop Open Hote Hi",
        time: "10 Seconds",
        title: "Counter Phone Ya Tablet Me Live Queue Kholna",
        desc: "Cashier apne phone, billing tablet ya computer browser me customerpilot.in/dashboard/queue open rakhta hai (ya phone screen par bookmark/Add to Home Screen kar leta hai).",
      },
      {
        tag: "Step M3 • Core Daily Duty (Per Customer)",
        time: "⏱️ Sirf 3 Seconds!",
        title: "Customer Bill Amount Daal Kar 'Approve' Click Karna",
        desc: "Customer ne counter QR scan kiya hai, toh cashier ke queue screen par customer ka naam aur phone number dikhta hai. Cashier bas bill amount type karta hai (e.g. ₹280) aur green 'Approve Stamp (✓)' button press kar deta hai. (Yahan Customer ne jo Product Purchase kiya uska short name bhi aap enter kar sakte ho - ye Compulsory nahi he).",
        highlight: "Rahul Sharma (+91 98765...) ➔ Bill Amount: ₹280 | Product: Belgian Chocolate Pastry (Optional) [✓ Approve Stamp]",
        note: "💡 Cashier ko bas itna hi karna hai! Stamp add karna, WhatsApp receipt bhejna, aur wallet update karna CustomerPilot khud karta hai.",
      },
      {
        tag: "Step M4 • Jab Customer 10 Stamps Poore Kare",
        time: "5 Seconds",
        title: "Free Reward Deliver Karna & 1-Click Redeem",
        desc: "Jab customer apna WhatsApp Golden Voucher dikhaye (e.g. 'Free Belgian Pastry'), cashier customer ko free item deliver karta hai aur dashboard me voucher ID verify karke 'Redeem' button daba deta hai. System customer ko automatically Silver VIP me upgrade kar deta hai.",
      },
      {
        tag: "Step M5 • 100% Zero-Effort Automation",
        time: "Merchant Effort: 0%",
        title: "Google Reviews, Auto-Replies & Win-backs Khud Chalte Hain",
        items: [
          {
            title: "⭐ Google 5★ Review (Custom Time-Delay):",
            desc: "Customer ke jaane ke baad aapke set kiye gaye time delay (e.g. 20 min ya 1 ghanta) ke baad AI review link khud send hota hai. Merchant ko mangne ki zarurat nahi.",
          },
          {
            title: "🤖 AI Auto-Reply:",
            desc: "Google Maps par aane wale 5★ review ka appreciative reply Gemini AI khud publish karta hai.",
          },
          {
            title: "💌 30-Day Win-Backs:",
            desc: "Jo customer 30 din se nahi aaya, system use automatic re-engagement offer bhejta hai.",
          },
        ],
      },
    ],
    stepsC: [
      {
        tag: "Step C1 • Billing Counter Par",
        time: "Friction: Zero",
        title: "Standee QR Scan Karna (Phone Camera Ya WhatsApp Se)",
        desc: "Customer bill counter par Standee dekhta hai: 'Scan to Earn Free Pastry on Every Visit!'. Customer apne mobile camera ya WhatsApp scanner se QR scan karta hai. Use koi bhi Play Store app install nahi karni padti.",
      },
      {
        tag: "Step C2 • 1-Tap Join",
        time: "Action: 1 Tap 'Send'",
        title: "WhatsApp Par Pre-Typed Message Send Karna",
        desc: "Scan karte hi customer ka WhatsApp khulta hai jisme pehle se likha hota hai: 'Hi! Adding my visit at Cake Connection...'. Customer bas 'Send' dabata hai aur turant Restaurant/Shop ka personalized welcome card receive ho jata hai.",
      },
      {
        tag: "Step C3 • Bill Payment Ke Baad",
        time: "Live VIP Wallet",
        title: "WhatsApp Par Live Stamp & Bill Receipt Milna",
        desc: "Cashier ke approve karte hi customer ke phone par notification aati hai: '🎉 ₹320 Bill Confirmed! 1 Stamp Added. Total: 1/10 Stamps.'. Saath me live digital wallet link hota hai jisme animated stamp card dikhta hai.",
      },
      {
        tag: "Step C4 • 1-Click AI Review (After Time-Delay)",
        time: "Effort: 5 Seconds",
        title: "AI-Drafted 5-Star Review Google Maps Par Post Karna",
        desc: "Visit ke baad (aapke set kiye gaye delay ke baad) customer ko WhatsApp message aata hai: 'Aapka experience kaisa raha? AI ne aapke liye ek shandar review draft kiya hai!'. Customer link kholta hai, Gemini AI genuine 5★ review pre-fill kar deta hai, aur customer 1-tap me Google Maps par post kar deta hai.",
      },
      {
        tag: "Step C5 • Reward Unlock",
        time: "10 Stamps Complete",
        title: "Counter Par Golden Voucher Dikhakar Free Treat Enjoy Karna",
        desc: "10 stamps complete hote hi WhatsApp par Golden Voucher milta hai. Agli visit par customer counter par voucher dikha kar free reward collect karta hai. Saath hi agle card ke liye 2 advance bonus stamps milte hain aur customer Silver VIP ban jata hai!",
      },
      {
        tag: "Step C6 • Referral Loop",
        time: "Viral Growth",
        title: "Friends Ko WhatsApp Par Invite Karke Extra Points Earn Karna",
        desc: "Customer apne digital wallet me 'Invite a Friend' button dabakar doston ko WhatsApp link bhejta hai. Friend ke first visit par friend ko bonus stamp milta hai aur customer ko extra wallet reward milta hai.",
      },
    ],
    matrixRows: [
      {
        step: "1. Joining Loyalty",
        merchant: "Counter par standee QR rakhna & customer ko scan karne bolna",
        customer: "Phone camera se scan & send",
        ai: "Instant WhatsApp welcome & digital wallet creation",
      },
      {
        step: "2. Stamp Crediting",
        merchant: "Bill amount enter karke 'Approve' click (optional product name) (3s)",
        customer: "Sirf normal bill pay karna",
        ai: "WhatsApp bill receipt + animated stamp card update",
      },
      {
        step: "3. Google 5★ Review",
        merchant: "Zero work (time-delay ke baad khud WhatsApp jata hai)",
        customer: "1-tap me AI review Google Maps pe post",
        ai: "Gemini AI contextual review draft + delayed dispatch according to setting",
      },
      {
        step: "4. Review Response",
        merchant: "Zero work (manual typing nahi)",
        customer: "N/A",
        ai: "Google Maps par AI owner reply autonomously published",
      },
      {
        step: "5. Reward Claim",
        merchant: "Voucher dekh kar 'Redeem' click (5s)",
        customer: "Free item enjoy karna",
        ai: "Silver VIP tier upgrade + 2 surprise advance stamps",
      },
      {
        step: "6. Customer Retention",
        merchant: "Restaurant/Shop chalana aur acche items bechna",
        customer: "Personalized offers receive karna",
        ai: "30-day win-back offers, birthday treats & referrals",
      },
    ],
  },
}

// Interactive Simulation Stages
const SIMULATION_STAGES = [
  {
    stage: 1,
    title: "Stage 1: Walk-In & Counter Scan",
    short: "1. Scan QR",
    customerAction: "Customer scans the counter QR with their mobile camera or WhatsApp and sends the pre-typed join message.",
    customerScreen: {
      message: "Hi! Adding my visit at Cake Connection... 🥐",
      reply: "Welcome to Cake Connection VIP Club! 🎉 You have been added to the counter queue. As soon as cashier confirms your bill, your digital stamp will be added.",
    },
    merchantAction: "Cashier customer ko smile ke sath invite karta hai: 'Sir/Mam aap ab hamare Restaurant/Shop ke VIP Club me Member ban sakte ho, uske liye just ye QR code Scan kijiye, bilkul Free he.'",
    merchantScreen: {
      title: "Live Queue Screen (/dashboard/queue)",
      badge: "1 Customer Waiting",
      content: "Rahul Sharma (+91 98765 43210) joined queue at 04:15 PM",
    },
    timeNeeded: "5 Seconds",
    automation: "Instant WhatsApp webhook response + live queue insertion",
  },
  {
    stage: 2,
    title: "Stage 2: Bill Payment & 3-Second Approval",
    short: "2. Approve Bill",
    customerAction: "Customer pays their bill at the counter via UPI, Cash, or Card (e.g. ₹320).",
    customerScreen: {
      message: "Bill paid: ₹320. Waiting for receipt ping on WhatsApp...",
      reply: "",
    },
    merchantAction: "Cashier sees Rahul Sharma on Live Queue, types '320' (aur optional product name), and taps green 'Approve Stamp (✓)' button.",
    merchantScreen: {
      title: "Cashier Actions (Live Queue)",
      badge: "Action Required (Takes 3s)",
      content: "Amount: [ ₹320 ]  | Item: [ Pastry (Opt) ] ➔  [ ✓ Approve Stamp (1 Stamp Awarded) ]",
    },
    timeNeeded: "3 Seconds",
    automation: "Instant stamp calculation & digital wallet balance update",
  },
  {
    stage: 3,
    title: "Stage 3: WhatsApp Receipt & Digital Wallet",
    short: "3. Digital Wallet",
    customerAction: "Customer's phone vibrates immediately. They receive an official branded WhatsApp receipt and a link to their live animated stamp card.",
    customerScreen: {
      message: "🎉 ₹320 Bill Confirmed! 1 Stamp Added.\n\nTotal: 1/10 Stamps collected 🥐\n9 more visits to unlock: Free Belgian Chocolate Pastry!\n\n👉 View Your Live VIP Card: customerpilot.in/q/wallet/c_9281",
      reply: "",
    },
    merchantAction: "Zero effort! The customer card clears automatically from the queue screen and the cashier is ready for the next customer.",
    merchantScreen: {
      title: "Queue Cleared",
      badge: "Ready for Next Customer",
      content: "✅ Approved: Rahul Sharma (1 Stamp credited). Today's Total Stamps: 42",
    },
    timeNeeded: "0 Seconds (Auto)",
    automation: "Automated WhatsApp delivery with personalized dynamic wallet link",
  },
  {
    stage: 4,
    title: "Stage 4: AI-Crafted 5-Star Google Review (After Set Delay)",
    short: "4. Google Review",
    customerAction: "After visiting (after merchant's configured time-delay), customer receives WhatsApp prompt with AI-crafted 5★ review and posts with 1-click.",
    customerScreen: {
      message: "How was your experience at Cake Connection? 🌟\n\nAI drafted a review for you:\n\"Loved the fresh pastries at Cake Connection! Great ambiance and polite staff in Vadodara.\"\n\n👉 [ Post to Google Maps (1 Tap) ]",
      reply: "",
    },
    merchantAction: "Zero effort! When 5★ review goes live on Google Maps, Gemini AI publishes an appreciative owner reply automatically.",
    merchantScreen: {
      title: "Google Review Dashboard",
      badge: "5★ New Review on Google Maps",
      content: "Rahul Sharma: 5 Stars ⭐⭐⭐⭐⭐\nAI Owner Reply Published: \"Thank you Rahul! So glad you loved our pastries. See you again soon! 💜\"",
    },
    timeNeeded: "100% Automated",
    automation: "Gemini AI review draft + Google Business Profile auto-fetch + AI owner reply publish",
  },
  {
    stage: 5,
    title: "Stage 5: Reward Unlock & Silver VIP Level-Up",
    short: "5. Free Reward",
    customerAction: "Upon completing 10 visits, the customer gets a Golden Voucher on WhatsApp. On their next visit, they show it to claim their free reward.",
    customerScreen: {
      message: "👑 CONGRATULATIONS RAHUL!\n\nYou have completed 10 Stamps!\n🎁 Voucher: FREE BELGIAN CHOCOLATE PASTRY\nVoucher ID: #RD-9821\n\nShow this message at counter to redeem.",
      reply: "",
    },
    merchantAction: "Cashier matches the voucher number, taps 'Redeem' in the dashboard, and hands over the free pastry.",
    merchantScreen: {
      title: "Reward Redemption Screen",
      badge: "Redemption Verified",
      content: "Voucher #RD-9821: Free Belgian Chocolate Pastry\n[ Mark as Redeemed ✓ ]\n➔ Customer upgraded to Silver VIP (+2 Advance Surprise Stamps Gifted!)",
    },
    timeNeeded: "5 Seconds",
    automation: "Voucher validation + Silver VIP tier upgrade + 2 surprise bonus stamps injection",
  },
]

export default function LiveCounterOperationsManualPage() {
  const [lang, setLang] = useState<Lang>("hi") // Default to Hinglish per merchant preference
  const [journeyView, setJourneyView] = useState<JourneyView>("all")
  const [simStage, setSimStage] = useState<SimStage>(1)

  const t = I18N[lang]
  const currentSim = SIMULATION_STAGES[simStage - 1]

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 text-white text-xs py-2.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span>{t.topBanner}</span>
        <Link href="/guide/3-day-trial" className="underline hover:text-emerald-200 ml-2 font-black">
          {t.topLink}
        </Link>
      </div>

      {/* Main Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              {t.navHome}
            </Link>
            <Link href="/guide/3-day-trial" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>{t.navSetup}</span>
            </Link>
            <Link href="#simulation" className="text-emerald-700 font-bold flex items-center gap-1.5">
              <span>{t.navSimulation}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
            <Link href="/dashboard/settings" className="text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              <span>{t.navSettings}</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Toggle Switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLang(lang === "en" ? "hi" : "en")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.langBtn}</span>
              </button>
            </div>

            <Link href="/dashboard/queue">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 shadow-sm hover:shadow-md transition-all">
                {t.navQueue}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-[400px] h-[300px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
            {t.heroBadge}
          </Badge>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            {t.heroH1Part1}{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              {t.heroH1Part2}
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Sub-view Navigation Switcher */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl max-w-3xl mx-auto shadow-inner">
            {[
              { id: "all", label: t.switcherAll, icon: Layers },
              { id: "merchant", label: t.switcherMerchant, icon: Store },
              { id: "customer", label: t.switcherCustomer, icon: Users },
              { id: "simulation", label: t.switcherSimulation, icon: Zap },
              { id: "matrix", label: t.switcherMatrix, icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = journeyView === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setJourneyView(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Quick Metrics */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Clock className="w-5 h-5 text-amber-500 mb-1.5" />
              <div className="text-base font-black text-slate-900">{t.stat1Val}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t.stat1Label}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Smartphone className="w-5 h-5 text-emerald-600 mb-1.5" />
              <div className="text-base font-black text-slate-900">{t.stat2Val}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t.stat2Label}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Star className="w-5 h-5 text-indigo-600 mb-1.5" />
              <div className="text-base font-black text-slate-900">{t.stat3Val}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t.stat3Label}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Gift className="w-5 h-5 text-purple-600 mb-1.5" />
              <div className="text-base font-black text-slate-900">{t.stat4Val}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t.stat4Label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 pb-20">

        {/* ------------------------------------------------------------- */}
        {/* SUB-VIEW 1: SIDE-BY-SIDE INTERACTIVE COUNTER SIMULATION       */}
        {/* ------------------------------------------------------------- */}
        {(journeyView === "all" || journeyView === "simulation") && (
          <section id="simulation" className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-4">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] uppercase font-bold mb-1">
                  {t.simHeaderBadge}
                </Badge>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>{t.simTitle}</span>
                  <span className="text-xs font-normal text-slate-400">{t.simSubtitle}</span>
                </h3>
              </div>
              <div className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800">
                {t.simCashierBadge}
              </div>
            </div>

            {/* Stage Stepper Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SIMULATION_STAGES.map((s) => (
                <button
                  key={s.stage}
                  onClick={() => setSimStage(s.stage as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all border ${
                    simStage === s.stage
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                      : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {s.short}
                </button>
              ))}
            </div>

            {/* Active Stage Split Screen */}
            <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                    {currentSim.stage}
                  </span>
                  <span className="font-bold text-base text-white">{currentSim.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">{t.simTimeLabel}</span>
                  <span className="text-amber-400 font-black">{currentSim.timeNeeded}</span>
                </div>
              </div>

              {/* Side-by-Side View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Left Column: Customer Side */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4" />
                        <span>{t.simCustomerTitle}</span>
                      </span>
                      <Badge className="text-[9px] bg-slate-800 text-slate-300">Grahak</Badge>
                    </div>
                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                      {currentSim.customerAction}
                    </p>
                  </div>

                  {/* Customer Mock Phone Screen */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 text-xs font-sans space-y-2 mt-3">
                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                      <span>WhatsApp Official Message</span>
                      <span className="text-emerald-400">Live</span>
                    </div>
                    <div className="bg-emerald-950/40 text-emerald-200 border border-emerald-900/60 p-2.5 rounded-lg whitespace-pre-line text-[11px] leading-relaxed">
                      {currentSim.customerScreen.message}
                    </div>
                    {currentSim.customerScreen.reply && (
                      <div className="bg-slate-900 text-slate-300 p-2 rounded-lg text-[10px] border border-slate-800">
                        {currentSim.customerScreen.reply}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Merchant Side */}
                <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                        <Store className="w-4 h-4" />
                        <span>{t.simMerchantTitle}</span>
                      </span>
                      <Badge className="text-[9px] bg-indigo-950 text-indigo-300 border-indigo-800">Counter Desk</Badge>
                    </div>
                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                      {currentSim.merchantAction}
                    </p>
                  </div>

                  {/* Cashier Mock Screen */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 text-xs space-y-2 mt-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{currentSim.merchantScreen.title}</span>
                      <span className="text-amber-400">{currentSim.merchantScreen.badge}</span>
                    </div>
                    <div className="bg-slate-900 text-slate-200 p-3 rounded-lg border border-slate-800 font-mono text-[11px] leading-relaxed">
                      {currentSim.merchantScreen.content}
                    </div>
                  </div>
                </div>
              </div>

              {/* Automation Footer Banner */}
              <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-900/50 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>{t.simSystemAutomation}</strong> {currentSim.automation}</span>
                </div>
                {simStage < 5 && (
                  <button
                    onClick={() => setSimStage((simStage + 1) as any)}
                    className="text-[11px] text-white font-bold bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <span>{t.simNextStage}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-VIEW 2: MERCHANT KI JOURNEY (STORE OWNER / CASHIER)       */}
        {/* ------------------------------------------------------------- */}
        {(journeyView === "all" || journeyView === "merchant") && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                  👨‍💼
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-700">{t.merchantSectionBadge}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.merchantSectionTitle}</h3>
                </div>
              </div>
              <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200 text-xs px-3 py-1 font-bold">
                {t.merchantPosBadge}
              </Badge>
            </div>

            <div className="space-y-5">
              {t.stepsM.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    idx === 2
                      ? "bg-emerald-50/70 border-emerald-200"
                      : idx === 4
                      ? "bg-amber-50/70 border-amber-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        idx === 2
                          ? "bg-emerald-100 text-emerald-800"
                          : idx === 4
                          ? "bg-amber-100 text-amber-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {step.tag}
                    </span>
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        idx === 2
                          ? "text-emerald-800"
                          : idx === 4
                          ? "text-amber-800"
                          : "text-slate-500"
                      }`}
                    >
                      {step.time}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{step.title}</h4>
                  {"desc" in step && step.desc && (
                    <p className="text-xs text-slate-700 leading-relaxed">{step.desc}</p>
                  )}

                  {/* USER REQUESTED VERBAL PITCH IN STEP M1 */}
                  {"pitch" in step && step.pitch && (
                    <div className="p-4 bg-amber-50 border-2 border-amber-200/80 rounded-2xl text-xs space-y-1.5">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-amber-700" />
                        <span>{step.pitchTitle}</span>
                      </div>
                      <p className="text-amber-950 font-medium leading-relaxed italic">
                        &quot;{step.pitch}&quot;
                      </p>
                    </div>
                  )}

                  {"highlight" in step && step.highlight && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-mono flex items-center justify-between">
                      <span className="text-slate-700 font-bold">{step.highlight}</span>
                    </div>
                  )}

                  {"note" in step && step.note && (
                    <p className="text-[11px] text-slate-500 italic">{step.note}</p>
                  )}

                  {"items" in step && step.items && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                      {step.items.map((item, i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-amber-200">
                          <strong className="text-slate-900 block mb-1">{item.title}</strong>
                          <span className="text-slate-600">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-VIEW 3: CUSTOMER KI JOURNEY (GRAHAK EXPERIENCE)           */}
        {/* ------------------------------------------------------------- */}
        {(journeyView === "all" || journeyView === "customer") && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20">
                  📱
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">{t.customerSectionBadge}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.customerSectionTitle}</h3>
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
                {t.customerZeroBadge}
              </Badge>
            </div>

            <div className="space-y-5">
              {t.stepsC.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border space-y-2 ${
                    idx === 2
                      ? "bg-emerald-50/70 border-emerald-200"
                      : idx === 4
                      ? "bg-purple-50/70 border-purple-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        idx === 4
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {step.tag}
                    </span>
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        idx === 4 ? "text-purple-800" : "text-slate-500"
                      }`}
                    >
                      {step.time}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{step.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-VIEW 4: QUICK RESPONSIBILITY MATRIX TABLE                 */}
        {/* ------------------------------------------------------------- */}
        {(journeyView === "all" || journeyView === "matrix") && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 overflow-hidden">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">{t.matrixBadge}</span>
              <h3 className="text-xl font-black text-slate-900">{t.matrixTitle}</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">{t.colStep}</th>
                    <th className="py-3 px-4 text-indigo-700">{t.colMerchant}</th>
                    <th className="py-3 px-4 text-emerald-700">{t.colCustomer}</th>
                    <th className="py-3 px-4 text-purple-700">{t.colAI}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {t.matrixRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.step}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{row.merchant}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{row.customer}</td>
                      <td className="py-3 px-4 text-purple-700 font-semibold">{row.ai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CALL TO ACTION: JUMP TO 5-MIN SETUP GUIDE                     */}
        {/* ------------------------------------------------------------- */}
        <section className="bg-slate-900 text-white py-12 px-6 text-center rounded-3xl shadow-xl">
          <div className="max-w-2xl mx-auto space-y-5">
            <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-3 py-1 font-bold">
              {t.ctaBadge}
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {t.ctaTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              {t.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link href="/guide/3-day-trial">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-sm px-7 py-5 rounded-xl shadow-lg shadow-indigo-500/20">
                  {t.ctaBtnSetup}
                </Button>
              </Link>
              <Link href="/dashboard/queue">
                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm px-6 py-5 rounded-xl">
                  {t.ctaBtnQueue}
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm px-6 py-5 rounded-xl">
                  {t.ctaBtnSettings}
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms &amp; Privacy</Link>
            <Link href="/guide/3-day-trial" className="text-indigo-600 font-bold hover:underline">5-Minute Setup Guide</Link>
            <Link href="/guide/operations" className="text-emerald-700 font-bold hover:underline">Operations Manual</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
