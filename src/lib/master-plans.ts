// Master Plans & Coupons Canonical Definition and Self-Healing Auto-Seeder
// Ensures database ALWAYS has all 9 subscription plans and active coupons even after fresh resets or DB wipes.

export interface MasterPlanDefinition {
  planKey: string
  name: string
  description: string
  days: number
  price: number
  originalPrice: number
  discountPercent: number
  badge: string
  popular: boolean
  features: string[]
  enabledModules: string
  active: boolean
}

export interface MasterCouponDefinition {
  code: string
  description: string
  discountType: string
  discountValue: number
  minOrderAmount: number
  maxDiscount?: number
  maxUses: number
  active: boolean
}

export const MASTER_PLANS: MasterPlanDefinition[] = [
  // ─── GEAR 1 : Smart Digital Business Card + Smart AI Google Review System ───
  {
    planKey: "gear1_6mo",
    name: "Gear 1 : Smart Digital Business Card + Smart AI Google Review System — 6 Months",
    description: "Instant digital card branding plus autonomous Google review acceleration for local stores (6 Months).",
    days: 180,
    price: 899,
    originalPrice: 899,
    discountPercent: 0,
    badge: "Gear 1",
    popular: false,
    features: [
      "Smart Digital Business Card (vCard Contact Sync)",
      "Smart AI Google Review Collection & 5-Star Filter",
      "AI-Drafted 5-Star Customer Reviews",
      "Direct Google Maps Review Integration",
      "WhatsApp & Direct Call Buttons",
      "High-Resolution Review Counter QR Code",
      "6 Months Cloud Hosting & Analytics"
    ],
    enabledModules: "DIGITAL_CARD,REVIEWS",
    active: true
  },
  {
    planKey: "gear1_yearly",
    name: "Gear 1 : Smart Digital Business Card + Smart AI Google Review System — 1 Year",
    description: "Full year interactive digital business card plus autonomous AI Google review acceleration (1 Year).",
    days: 365,
    price: 1249,
    originalPrice: 1249,
    discountPercent: 0,
    badge: "Gear 1 · 1 Year",
    popular: false,
    features: [
      "Everything in Gear 1 (6 Months)",
      "365 Days Unlimited Review Collection & Card Sync",
      "Gemini AI Dynamic Review Angle Variations",
      "Online Ordering / Catalog Links Integration",
      "Printable Counter Standee Artwork (A4/A5)",
      "Dedicated WhatsApp Support"
    ],
    enabledModules: "DIGITAL_CARD,REVIEWS",
    active: true
  },

  // ─── GEAR 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System ───
  {
    planKey: "gear2_6mo",
    name: "Gear 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System — 6 Months",
    description: "High-retention combo: WhatsApp automated loyalty stamps plus interactive digital business card (6 Months).",
    days: 180,
    price: 1499,
    originalPrice: 1499,
    discountPercent: 0,
    badge: "Gear 2",
    popular: false,
    features: [
      "Smart Digital Business Card (vCard Contact Sync)",
      "WhatsApp Digital Loyalty Stamp Cards & VIP Club",
      "QR Counter Check-in & Stamp Crediting",
      "Automated Milestone Rewards & Customer VIP Tiers",
      "Automated 30/60/90 Day Customer Win-Backs",
      "6 Months Loyalty Cloud Hosting & CRM"
    ],
    enabledModules: "DIGITAL_CARD,LOYALTY",
    active: true
  },
  {
    planKey: "gear2_yearly",
    name: "Gear 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System — 1 Year",
    description: "Full year WhatsApp digital loyalty automation plus branded digital business card (1 Year).",
    days: 365,
    price: 2249,
    originalPrice: 2249,
    discountPercent: 0,
    badge: "Gear 2 · 1 Year",
    popular: false,
    features: [
      "Everything in Gear 2 (6 Months)",
      "365 Days Unlimited WhatsApp Stamp Cards",
      "VIP Customer Database & Spend CRM",
      "Custom Store Branding on Acrylic Standees",
      "Priority WhatsApp Helpdesk"
    ],
    enabledModules: "DIGITAL_CARD,LOYALTY",
    active: true
  },

  // ─── GEAR 3 : WhatsApp Digital Loyalty + Smart AI Google Review System + Smart Digital Business Card ───
  {
    planKey: "gear3_6mo",
    name: "Gear 3 : WhatsApp Digital Loyalty + Smart AI Google Review System + Smart Digital Business Card — 6 Months",
    description: "Trio retention suite: Digital card, WhatsApp loyalty stamps, and smart AI Google reviews (6 Months).",
    days: 180,
    price: 1799,
    originalPrice: 1799,
    discountPercent: 0,
    badge: "Gear 3",
    popular: false,
    features: [
      "Smart Digital Business Card (vCard Sync)",
      "WhatsApp Digital Loyalty Stamp Cards & VIP Rewards",
      "Smart AI Google Review Collection & 5-Star Filter",
      "Direct Google Maps Redirection",
      "Dual-Action Counter Standee Artwork",
      "6 Months Cloud Hosting & Analytics"
    ],
    enabledModules: "DIGITAL_CARD,LOYALTY,REVIEWS",
    active: true
  },
  {
    planKey: "gear3_yearly",
    name: "Gear 3 : WhatsApp Digital Loyalty + Smart AI Google Review System + Smart Digital Business Card — 1 Year",
    description: "Full year trio retention powerhouse: Digital card, WhatsApp loyalty stamps, and smart AI reviews (1 Year).",
    days: 365,
    price: 2499,
    originalPrice: 2499,
    discountPercent: 0,
    badge: "Gear 3 · 1 Year",
    popular: false,
    features: [
      "Everything in Gear 3 (6 Months)",
      "365 Days Unlimited Retention & Review Acceleration",
      "Customer Spend CRM & Milestone Alerts",
      "Automated WhatsApp Win-Back Campaigns",
      "Print-Ready A4/A5 Counter Acrylic Standees"
    ],
    enabledModules: "DIGITAL_CARD,LOYALTY,REVIEWS",
    active: true
  },

  // ─── GEAR 4 : All 4 Core Engines (Card + Loyalty + Reviews + AutoReply) ───
  {
    planKey: "gear4_6mo",
    name: "Gear 4 : All 4 Core Engines — 6 Months",
    description: "All 4 flagship engines: Card, Loyalty Stamps, Smart AI Reviews, and 1-Click AI AutoReply (6 Months).",
    days: 180,
    price: 1899,
    originalPrice: 1899,
    discountPercent: 0,
    badge: "Gear 4",
    popular: false,
    features: [
      "Smart Digital Business Card",
      "WhatsApp Digital Loyalty Stamp Cards & VIP Club",
      "Smart AI Google Reviews with Keyword Extraction",
      "1-Click AI AutoReply to Google Maps Reviews",
      "Automated 30/60/90 Day Customer Win-Backs",
      "Printable High-Res Counter Standees (A4/A5)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "growth_180",
    name: "Gear 4 : CustomerPilot Complete — 6 Months",
    description: "All 4 flagship engines: Card, Loyalty Stamps, Smart AI Reviews, and 1-Click AI AutoReply (6 Months).",
    days: 180,
    price: 1899,
    originalPrice: 1899,
    discountPercent: 0,
    badge: "Gear 4 · 6 Months",
    popular: false,
    features: [
      "Smart Digital Business Card",
      "WhatsApp Digital Loyalty Stamp Cards & VIP Club",
      "Smart AI Google Reviews with Keyword Extraction",
      "1-Click AI AutoReply to Google Maps Reviews",
      "Automated 30/60/90 Day Customer Win-Backs",
      "Printable High-Res Counter Standees (A4/A5)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "gear4_yearly",
    name: "Gear 4 : All 4 Core Engines — 1 Year",
    description: "Full year of all 4 flagship engines: Card, Loyalty, Reviews, and 1-Click AI AutoReply (1 Year).",
    days: 365,
    price: 2499,
    originalPrice: 2499,
    discountPercent: 0,
    badge: "Gear 4 · All 4 Core Engines",
    popular: true,
    features: [
      "Everything in Gear 4 (6 Months)",
      "365 Days Unlimited Automation Across All 4 Engines",
      "AI Review Reply Generator Published via Google OAuth",
      "VIP Tier Progression & Custom Stamp Milestones",
      "Priority WhatsApp Helpdesk (+91 90333 04707)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "enterprise_365",
    name: "Gear 4 : CustomerPilot Complete — 1 Year",
    description: "Full year of all 4 flagship engines: Card, Loyalty, Reviews, and 1-Click AI AutoReply (1 Year).",
    days: 365,
    price: 2499,
    originalPrice: 2499,
    discountPercent: 0,
    badge: "Gear 4 · 1 Year",
    popular: true,
    features: [
      "Everything in Gear 4 (6 Months)",
      "365 Days Unlimited Automation Across All 4 Engines",
      "AI Review Reply Generator Published via Google OAuth",
      "VIP Tier Progression & Custom Stamp Milestones",
      "Priority WhatsApp Helpdesk (+91 90333 04707)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },

  // ─── GEAR 5 : CustomerPilot All-in-One Enterprise ───
  {
    planKey: "gear5_monthly",
    name: "Gear 5 : CustomerPilot All-in-One Enterprise — Monthly",
    description: "The complete enterprise retail stack: Gear 4 + WhatsApp Group Booster, Smart POS Billing & Invoicing, and 24/7 AI WhatsApp ChatBot (Monthly).",
    days: 30,
    price: 999,
    originalPrice: 999,
    discountPercent: 0,
    badge: "Gear 5 · Monthly",
    popular: false,
    features: [
      "Smart Digital Business Card",
      "WhatsApp Digital Loyalty Stamps & VIP Club",
      "Smart AI Google Reviews",
      "AutoReply to GoogleReviews",
      "Dynamic QR Studio (Permanent QR + Instant Route Updates)",
      "WhatsApp Group Booster & Lead Capture Form",
      "Smart POS Billing & WhatsApp Invoicing Pro",
      "24/7 AI WhatsApp ChatBot (Multilingual AI Assistant)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD,DYNAMIC_QR,LEAD_CAPTURE,SMART_BILLING,CHATBOT",
    active: true
  },
  {
    planKey: "gear5_yearly",
    name: "Gear 5 : CustomerPilot All-in-One Enterprise — 1 Year",
    description: "Full year of the complete enterprise retail stack with all 8 engines included (1 Year).",
    days: 365,
    price: 9999,
    originalPrice: 9999,
    discountPercent: 0,
    badge: "Gear 5 · 1 Year (₹9,999/yr)",
    popular: true,
    features: [
      "Everything in Gear 5 Monthly",
      "365 Days Unlimited Access to All 8 Engines",
      "Dynamic QR Studio + Unlimited Destination Routing",
      "WhatsApp Group Booster & Lead Capture CRM",
      "Smart POS Billing & WhatsApp Invoicing Pro",
      "24/7 AI WhatsApp ChatBot Builder",
      "Priority WhatsApp Concierge Support (+91 90333 04707)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD,DYNAMIC_QR,LEAD_CAPTURE,SMART_BILLING,CHATBOT",
    active: true
  },
  {
    planKey: "gear6_monthly",
    name: "Gear 5 : CustomerPilot All-in-One Enterprise — Monthly (Alias)",
    description: "The complete enterprise retail stack (Monthly alias).",
    days: 30,
    price: 999,
    originalPrice: 999,
    discountPercent: 0,
    badge: "Gear 5 · Monthly",
    popular: false,
    features: [
      "All 8 Enterprise Retention Engines",
      "Monthly Subscription (₹999/month)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD,DYNAMIC_QR,LEAD_CAPTURE,SMART_BILLING,CHATBOT",
    active: true
  },
  // ─── Legacy Capacity & Standalone References (Backward Compatible) ───
  {
    planKey: "complete_monthly",
    name: "CustomerPilot Complete — Monthly (30 Days)",
    description: "Full CustomerPilot Complete suite for 30 days.",
    days: 30,
    price: 999,
    originalPrice: 999,
    discountPercent: 0,
    badge: "Monthly",
    popular: false,
    features: [
      "All 4 Core Retention Engines",
      "30-Day WhatsApp Automations",
      "AI Google Reviews & AutoReply",
      "Digital Loyalty Stamp Cards",
      "Smart Digital Business Card",
      "Printable High-Res QR Code"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "enterprise_unlimited_365",
    name: "Enterprise / upto 5-Outlets (1 Year)",
    description: "Capacity retention system for up to 5 retail outlets & brands (₹14/day).",
    days: 365,
    price: 4999,
    originalPrice: 9999,
    discountPercent: 50,
    badge: "upto 5 Outlets",
    popular: false,
    features: [
      "Up to 5 Retail Outlets Supported",
      "Unlimited VIP Customers",
      "Multi-Outlet Store Switcher",
      "Custom Brand Domain & Logo",
      "Dedicated Account Manager",
      "Custom ERP/POS Sync Assistance",
      "Maximum ROI Guarantee"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },

  // ─── Standalone Service 1: Digital Loyalty Stamps & VIP Club ───
  {
    planKey: "loyalty_6mo",
    name: "Digital Loyalty Stamps & VIP Club — 6 Months",
    description: "WhatsApp digital loyalty stamp card and VIP rewards automation for 6 months (₹4.99/day).",
    days: 180,
    price: 899,
    originalPrice: 1598,
    discountPercent: 44,
    badge: "Loyalty (6 Mo)",
    popular: false,
    features: [
      "Digital Loyalty Stamp Card",
      "QR Counter Check-In",
      "Birthday Rewards Engine",
      "VIP Tier Upgrades",
      "Automated 30/60/90 Day Win-Backs",
      "Basic Customer Analytics"
    ],
    enabledModules: "LOYALTY",
    active: true
  },
  {
    planKey: "loyalty_yearly",
    name: "Digital Loyalty Stamps & VIP Club — 1 Year",
    description: "Full year of loyalty automation (₹4.11/day Billed yearly).",
    days: 365,
    price: 1999,
    originalPrice: 1999,
    discountPercent: 42,
    badge: "Loyalty (1 Year)",
    popular: false,
    features: [
      "Everything in Loyalty 6 Months",
      "365-Day Unlimited Automation",
      "VIP Customer CRM & Export",
      "Custom Store Branding",
      "Priority WhatsApp Support"
    ],
    enabledModules: "LOYALTY",
    active: true
  },

  // ─── Standalone Service 2: Smart Ai (SEO Optimized) Google Reviews ───
  {
    planKey: "reviews_6mo",
    name: "Smart Ai (SEO Optimized) Google Reviews [upto 1000 Reviews] — 6 Months",
    description: "Automated WhatsApp review collection with AI-drafted 5-star reviews [upto 1000 reviews] (₹3.61/day).",
    days: 180,
    price: 649,
    originalPrice: 1099,
    discountPercent: 41,
    badge: "Reviews (6 Mo)",
    popular: false,
    features: [
      "Up to 1,000 Reviews Collection",
      "WhatsApp Review Request Automation",
      "AI-Drafted Customer Reviews",
      "5-Star Review Filter",
      "Google Maps Deep Link",
      "Review Analytics Dashboard"
    ],
    enabledModules: "REVIEWS",
    active: true
  },
  {
    planKey: "reviews_yearly",
    name: "Smart Ai (SEO Optimized) Google Reviews [upto 2500 Reviews] — 1 Year",
    description: "Full year automated review collection [upto 2500 reviews] (₹2.46/day Billed yearly).",
    days: 365,
    price: 999,
    originalPrice: 999,
    discountPercent: 44,
    badge: "Reviews (1 Year)",
    popular: false,
    features: [
      "Up to 2,500 Reviews Collection",
      "Everything in Reviews 6 Months",
      "365-Day Unlimited Review Collection",
      "Priority WhatsApp Delivery",
      "Review Sentiment Reports"
    ],
    enabledModules: "REVIEWS",
    active: true
  },

  // ─── Standalone Service 3: Ai Drafted (SEO Optimized) 1-Click AutoReply ───
  {
    planKey: "autoreply_6mo",
    name: "Ai Drafted (SEO Optimized) 1-Click AutoReply to GoogleReviews — 6 Months",
    description: "AI-powered Google review replies published in 1-Click to Google Maps for 6 months (₹3/day).",
    days: 180,
    price: 549,
    originalPrice: 1099,
    discountPercent: 50,
    badge: "AutoReply (6 Mo)",
    popular: false,
    features: [
      "Google Business Profile Connect",
      "Smart AI Context-Aware Replies",
      "1-Click Publish to Google Maps",
      "Smart Sentiment Adaptation",
      "Bulk Reply Engine",
      "Review Sync Dashboard"
    ],
    enabledModules: "AUTOREPLY",
    active: true
  },
  {
    planKey: "autoreply_yearly",
    name: "Ai Drafted (SEO Optimized) 1-Click AutoReply to GoogleReviews — 1 Year",
    description: "Full year of AI review replies published in 1-Click to Google Maps (₹2.2/day Billed yearly).",
    days: 365,
    price: 999,
    originalPrice: 999,
    discountPercent: 50,
    badge: "AutoReply (1 Year)",
    popular: false,
    features: [
      "Everything in AutoReply 6 Months",
      "365-Day Unlimited AI Replies",
      "Dead-Letter Queue Safety",
      "Multi-Location Google Support"
    ],
    enabledModules: "AUTOREPLY",
    active: true
  },

  // ─── Standalone Service 4: Smart Digital Business Card ───
  {
    planKey: "card_6mo",
    name: "Smart Digital Business Card — 6 Months",
    description: "Interactive Smart QR digital business card, 1-tap contact saving, direct Google review modal (6 Months Access, ~₹58/mo).",
    days: 180,
    price: 349,
    originalPrice: 699,
    discountPercent: 50,
    badge: "Starter (6 Mo)",
    popular: false,
    features: [
      "1-Tap Save Contact (vCard .vcf phonebook sync)",
      "Direct 5-Star Google Reviews Submission Modal",
      "WhatsApp Chat & Direct Calling Connect",
      "Google Maps Turn-by-Turn Navigation",
      "High-Resolution Printable QR Code (PNG & SVG)",
      "6 Months Cloud Hosting with Real-Time Edits"
    ],
    enabledModules: "DIGITAL_CARD",
    active: true
  },
  {
    planKey: "card_yearly",
    name: "Smart Digital Business Card — 1 Year",
    description: "Full year interactive digital business card with online ordering links, social profiles, and counter QR codes (~₹41/mo).",
    days: 365,
    price: 549,
    originalPrice: 549,
    discountPercent: 58,
    badge: "⭐ Most Popular",
    popular: true,
    features: [
      "Everything in 6 Months Plan +",
      "Online Ordering Links (Zomato / Swiggy / Catalog)",
      "Social Media Links (Instagram, Facebook, YouTube)",
      "Printable Counter QR Code Templates",
      "1 Year Cloud Hosting with Instant Live Updates",
      "Priority WhatsApp Support (+91 90333 04707)"
    ],
    enabledModules: "DIGITAL_CARD",
    active: true
  },
  {
    planKey: "card_lifetime",
    name: "Smart Digital Business Card — Lifetime Deal",
    description: "Zero renewal fees forever. Pay once, keep your digital business card and QR code active for life.",
    days: 3650,
    price: 1499,
    originalPrice: 3999,
    discountPercent: 62,
    badge: "Lifetime Deal",
    popular: false,
    features: [
      "Lifetime Permanent Cloud Hosting",
      "Zero Renewal or Maintenance Fees Forever",
      "Unlimited Real-Time Profile & Contact Updates",
      "All Current & Future Features Included",
      "Custom Counter QR Code Display Guide",
      "VIP Founder Support Line"
    ],
    enabledModules: "DIGITAL_CARD",
    active: true
  },
  // --- GBP Track A & B Ranking Services -------------------------
  {
    planKey: "gbp_track_a_setup",
    name: "Track A: New Business Launchpad (Setup)",
    description: "One-time setup: 100% video verification guidance, signboard check, legal proof, NAP citations across Justdial/FB.",
    days: 30,
    price: 5999,
    originalPrice: 9999,
    discountPercent: 40,
    badge: "Track A Setup",
    popular: false,
    features: [
      "Zero-Fail 90-Second Video Verification Script",
      "Signboard & Official Legal Proof Audit",
      "Top 10 Indian Directory Citations (JD, Sulekha, FB)",
      "Google Sandbox Warm-Up Protection (Max 3/wk cap)",
      "Top 3 Competitor Category Alignment",
      "1-Page Smart Digital Card Website Link"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "gbp_track_a_monthly",
    name: "Track A: New Business Launchpad (Monthly)",
    description: "Monthly subscription for Track A: WhatsApp review engine, sandbox monitoring, monthly 4-number report.",
    days: 30,
    price: 1999,
    originalPrice: 2999,
    discountPercent: 33,
    badge: "Track A Monthly",
    popular: false,
    features: [
      "Weekly Review Velocity Auto-Throttling",
      "WhatsApp Loyalty Stamp & Keyword Reviews",
      "AI 30-Minute Review Auto-Reply",
      "Monthly 4-Number Visual Map Report",
      "Rank Trajectory Progress Tracking"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "gbp_track_b_setup",
    name: "Track B: Top 3 Rank Accelerator (Setup)",
    description: "One-time 90-minute GBP surgery: categories, 20 products, 15 Q&As, fake competitor removal, citations fix.",
    days: 30,
    price: 27000,
    originalPrice: 27000,
    discountPercent: 0,
    badge: "Track B Setup",
    popular: true,
    features: [
      "90-Minute Complete GBP Surgery",
      "GBP Manager Access Setup (No Password Needed)",
      "Top 3 Competitor Categories Copy-Paste",
      "Fake Keyword-Stuffed Competitor Clean-Up",
      "20 Products with Photos & 15 Q&As Uploaded",
      "Top 10 Indian Directories 100% NAP Match"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "gbp_track_b_monthly",
    name: "Track B: Top 3 Rank Accelerator (Monthly)",
    description: "Monthly subscription for Track B: aggressive keyword reviews, weekend Map Traffic broadcast, rank lock.",
    days: 30,
    price: 1999,
    originalPrice: 2999,
    discountPercent: 33,
    badge: "Track B Monthly",
    popular: true,
    features: [
      "Aggressive Keyword & Photo Reviews (6-10/wk)",
      "Cash Counter QR Standee Workflow",
      "Bi-Monthly Weekend Map Traffic Broadcast (300-500 customers)",
      "AI Gemini 30-Minute Review Auto-Reply",
      "Monthly 4-Number Visual Map Report"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  // ─── Module 1: Dynamic QR Studio (Self-Hosted QR Tiger Alternative) ───
  {
    planKey: "qr_lite_monthly",
    name: "Dynamic QR Studio — Monthly",
    description: "Self-hosted permanent dynamic QR with unlimited destination updates & scan analytics.",
    days: 30,
    price: 100,
    originalPrice: 299,
    discountPercent: 66,
    badge: "Dynamic QR",
    popular: false,
    features: [
      "Permanent Counter QR Code",
      "Change WhatsApp Group/Link Anytime",
      "Zero Paid QR API Dependency",
      "PNG, SVG & Print PDF Download",
      "Daily & Monthly Scan Analytics"
    ],
    enabledModules: "DYNAMIC_QR",
    active: true
  },
  {
    planKey: "qr_lite_yearly",
    name: "Dynamic QR Studio — 1 Year Pro",
    description: "1 Full Year of self-hosted dynamic QR (₹1.91/day). Never reprint counter QRs.",
    days: 365,
    price: 699,
    originalPrice: 1499,
    discountPercent: 53,
    badge: "Best Value QR",
    popular: true,
    features: [
      "Permanent Counter QR Code",
      "Unlimited Destination Updates",
      "Zero Paid QR API Dependency",
      "Direct WhatsApp Group Redirection",
      "PNG, SVG & Print PDF Download",
      "Device & Scan Trend Analytics"
    ],
    enabledModules: "DYNAMIC_QR",
    active: true
  },

  // ─── Module 2: WhatsApp Group Booster with Lead Capture ───
  {
    planKey: "wa_booster_monthly",
    name: "WhatsApp Group Booster — Monthly",
    description: "Dynamic QR with Pre-Redirect Mini Registration Form + CRM lead capture.",
    days: 30,
    price: 299,
    originalPrice: 599,
    discountPercent: 50,
    badge: "Lead Capture",
    popular: false,
    features: [
      "Dynamic WhatsApp Group QR",
      "Pre-Redirect Customer Form",
      "Name & WhatsApp Number Capture",
      "Customer CRM & Consent Ledger",
      "Direct Redirect to WhatsApp Group"
    ],
    enabledModules: "DYNAMIC_QR,LEAD_CAPTURE",
    active: true
  },
  {
    planKey: "wa_booster_yearly",
    name: "WhatsApp Group Booster — 1 Year Pro",
    description: "1 Full Year of WhatsApp Community Growth & Customer Data Capture.",
    days: 365,
    price: 2499,
    originalPrice: 4999,
    discountPercent: 50,
    badge: "Growth Pro",
    popular: true,
    features: [
      "Dynamic WhatsApp Group QR",
      "Pre-Redirect Customer Form",
      "Name & WhatsApp Number Capture",
      "Full Customer CRM Database",
      "Unlimited Group Destination Updates",
      "Device & Conversion Analytics"
    ],
    enabledModules: "DYNAMIC_QR,LEAD_CAPTURE",
    active: true
  },

  // ─── Module 3: Smart POS Billing & WhatsApp Invoicing Pro ───
  {
    planKey: "smart_billing_monthly",
    name: "Smart POS Billing & WA Invoicing — Monthly",
    description: "Mobile POS billing with auto GST & 1-click Print + WhatsApp PDF delivery.",
    days: 30,
    price: 599,
    originalPrice: 1199,
    discountPercent: 50,
    badge: "Smart POS",
    popular: false,
    features: [
      "Mobile POS Billing Screen",
      "Automatic GST Calculation (CGST/SGST/IGST)",
      "1-Click Physical Print + WhatsApp PDF",
      "Automated Evolution API Delivery",
      "Customer Search & Auto-Suggestions",
      "Delivery Receipts & 1-Click Resend"
    ],
    enabledModules: "DYNAMIC_QR,LEAD_CAPTURE,SMART_BILLING",
    active: true
  },
  {
    planKey: "smart_billing_yearly",
    name: "Smart POS Billing & WA Invoicing — 1 Year Pro",
    description: "Complete Mobile POS, WhatsApp PDF Invoicing & Dynamic QR Suite for 1 Year.",
    days: 365,
    price: 4999,
    originalPrice: 9999,
    discountPercent: 50,
    badge: "All-in-One POS",
    popular: true,
    features: [
      "Everything in Dynamic QR & Group Booster",
      "Fast Mobile POS Billing Interface",
      "Automated GST & Discount Breakdown",
      "Dual-Action Print (Thermal + WhatsApp PDF)",
      "Instant Evolution API Document Delivery",
      "Complete Customer CRM & Spend History",
      "Invoice Ledger with Delivery Receipts & Resend"
    ],
    enabledModules: "DYNAMIC_QR,LEAD_CAPTURE,SMART_BILLING",
    active: true
  }
]

export const MASTER_COUPONS: MasterCouponDefinition[] = [
  {
    code: "CP99",
    description: "Special ₹99 Founder Test Pass (Pay only ₹99)",
    discountType: "fixed",
    discountValue: 1650,
    minOrderAmount: 99,
    maxUses: 1000,
    active: true
  },
  {
    code: "WELCOME20",
    description: "20% off on any subscription plan",
    discountType: "percent",
    discountValue: 20,
    minOrderAmount: 500,
    maxDiscount: 2000,
    maxUses: 500,
    active: true
  },
  {
    code: "LAUNCH50",
    description: "Special 50% discount for early adopters",
    discountType: "percent",
    discountValue: 50,
    minOrderAmount: 900,
    maxDiscount: 5000,
    maxUses: 100,
    active: true
  },
  {
    code: "FLAT500",
    description: "Flat ₹500 discount on 6-Month or 1-Year plans",
    discountType: "fixed",
    discountValue: 500,
    minOrderAmount: 1500,
    maxUses: 200,
    active: true
  },
]

/**
 * Ensures the database contains all master plans and canonical coupons.
 * Runs idempotently in <15ms. If plans are missing, upserts them.
 */
export async function ensureMasterPlans(prismaClient: any): Promise<{ seededPlans: number; seededCoupons: number }> {
  let seededPlans = 0
  let seededCoupons = 0

  try {
    for (const p of MASTER_PLANS) {
      const existing = await prismaClient.plan.findFirst({
        where: { OR: [{ planKey: p.planKey }, { name: p.name }] }
      })

      const dataToSave = {
        planKey: p.planKey,
        name: p.name,
        description: p.description,
        days: p.days,
        price: p.price,
        originalPrice: p.originalPrice,
        discountPercent: p.discountPercent,
        badge: p.badge,
        popular: p.popular,
        currency: "INR",
        features: JSON.stringify(p.features),
        enabledModules: p.enabledModules,
        active: p.active
      }

      if (existing) {
        // Keep active, planKey, prices, features and enabledModules synchronized
        await prismaClient.plan.update({
          where: { id: existing.id },
          data: dataToSave
        })
        seededPlans++
      } else {
        await prismaClient.plan.create({
          data: dataToSave
        })
        seededPlans++
      }
    }

    // Also ensure canonical coupons (including CP99) exist
    for (const c of MASTER_COUPONS) {
      const existingCoupon = await prismaClient.coupon.findUnique({
        where: { code: c.code }
      })

      if (!existingCoupon) {
        await prismaClient.coupon.create({
          data: {
            code: c.code,
            description: c.description,
            discountType: c.discountType,
            discountValue: c.discountValue,
            minOrderAmount: c.minOrderAmount,
            maxDiscount: c.maxDiscount,
            maxUses: c.maxUses,
            active: c.active
          }
        })
        seededCoupons++
      }
    }
  } catch (err: any) {
    console.error("[ensureMasterPlans] Error during self-healing seed:", err?.message || err)
  }

  return { seededPlans, seededCoupons }
}
