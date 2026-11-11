// CustomerPilot — GBP Checklist Seed Templates
// Defines all ops-executive tasks per Track A (weeks 1–8) and Track B (phases 1–3)
// Used by /api/gbp/assign-track to auto-create GbpChecklistItem rows.

export type ChecklistTemplate = {
  week: number
  taskKey: string
  taskLabel: string
}

export const TRACK_A_CHECKLIST: ChecklistTemplate[] = [
  // Week 1: Pre-Verification & Legal Setup
  { week: 1, taskKey: "SIGNBOARD_VERIFIED", taskLabel: "Client ne keyword-wala signboard banwaya confirm karo (e.g. 'Aura Hair & Beauty Salon')" },
  { week: 1, taskKey: "LEGAL_PROOF_COLLECTED", taskLabel: "Udyam/GST/Shop Act ka PDF lo — naam aur address GBP se 100% match hona chahiye" },
  { week: 1, taskKey: "NAP_CITATIONS_DONE", taskLabel: "JD + Sulekha + Facebook Page + Instagram par exact NAP (Name/Address/Phone) create karo" },
  { week: 1, taskKey: "CITATIONS_READY", taskLabel: "Sab citations live hain — mark done in CustomerPilot dashboard" },

  // Week 2: Zero-Fail Video Verification
  { week: 2, taskKey: "VIDEO_SCRIPT_SENT", taskLabel: "90-second video script client ko WhatsApp karo (road se start -> signboard -> inside)" },
  { week: 2, taskKey: "VIDEO_VERIFICATION_PASS", taskLabel: "Google ne profile verify kiya — client se confirmation lo aur GBP status check karo" },
  { week: 2, taskKey: "CATEGORIES_SET", taskLabel: "Top 3 competitors ki exact Primary + Secondary categories copy-paste karo in GBP" },
  { week: 2, taskKey: "MINI_WEBSITE_LINKED", taskLabel: "CustomerPilot digital card link GBP ke 'Website' button par set karo" },
  { week: 2, taskKey: "HIDDEN_ATTRIBUTES_SET", taskLabel: "AEO Voice Search: GBP 'More' tab me Wheelchair, Restroom, Women-owned, UPI switches ON karo + 'Order Online' link me direct WhatsApp link daalo" },

  // Weeks 3–4: Sandbox Warm-Up
  { week: 3, taskKey: "PHOTOS_UPLOADED", taskLabel: "15 real dukan photos upload: exterior, interior, staff, products (no stock photos)" },
  { week: 3, taskKey: "PRODUCTS_CATALOG_DONE", taskLabel: "15–20 products/services with rate + photo in GBP Products section" },
  { week: 3, taskKey: "SANDBOX_REVIEWS_W3", taskLabel: "Week 3: Max 3 reviews from in-store customers only (QR scan — NO WhatsApp blast)" },
  { week: 4, taskKey: "SANDBOX_REVIEWS_W4", taskLabel: "Week 4: 3 more reviews (total 6) — all from in-person customers, honest photo reviews" },

  // Weeks 5–8: Full Velocity Unlock
  { week: 5, taskKey: "VELOCITY_UNLOCKED", taskLabel: "Profile 30+ days old + 10+ reviews confirmed -> Admin me velocity cap 3 se 10 karo" },
  { week: 5, taskKey: "WHATSAPP_AUTOMATION_ON", taskLabel: "Full WhatsApp Zero-Ban Loyalty Stamp + Honest Photo Review Engine activate karo" },
  { week: 5, taskKey: "WEEKEND_BROADCAST_ON", taskLabel: "Weekend Map Offer Broadcast schedule karo (Month-end aur Mid-month)" },
  { week: 5, taskKey: "GEO_AI_LISTICLE_PUBLISHED", taskLabel: "Outside-GBP GEO AI Mentions: Medium/Quora par 'Top 5 [Category] in [City]' authority guide publish karo with mini-website link taaki ChatGPT & Gemini recommend karein" },
  { week: 8, taskKey: "TOP3_CHECK", taskLabel: "Map grid screenshot lo — 6/9 ya zyada green hain? Top 3 confirmed?" },
]

export const TRACK_B_CHECKLIST: ChecklistTemplate[] = [
  // Phase 1 (Days 1–5): 90-Minute Surgery
  { week: 1, taskKey: "MANAGER_ACCESS", taskLabel: "GBP Manager Access: client se CustomerPilot agency email par manager access lo (owner password nahi)" },
  { week: 1, taskKey: "SUBBOARD_UPGRADE_VERIFIED", taskLabel: "Existing Shops (#10–#50) Signboard SOP: Agar naam me keyword nahi hai (e.g. 'Patel Clinic'), seedha GBP title edit mat karo. Pehle client ₹500 permanent Acrylic/Vinyl sub-board lagwaye ('Patel Clinic - Dental & Implant Centre') + Udyam certificate update kare. Proof milne ke baad hi operator GBP title edit karega." },
  { week: 1, taskKey: "CATEGORY_COPIED", taskLabel: "Area ke Top 3 competitors ki exact Primary + Secondary categories match karo" },
  { week: 1, taskKey: "COMPETITOR_REDRESSAL_FILED", taskLabel: "Asli Competitor Spam Purge SOP: Top 5 fake keyword competitors ke asli physical signboard ki photo field boy se khinchwao. Google Business Redressal Complaint Form me Maps link + photo proof attach karke submit karo (7-day keyword removal)." },
  { week: 1, taskKey: "PRODUCTS_UPLOADED", taskLabel: "20 menu/service items with photo + rate in GBP Products section" },
  { week: 1, taskKey: "QA_UPLOADED", taskLabel: "15 common Q&As post karo in GBP Q&A section (customer ke perspective se)" },
  { week: 1, taskKey: "MINI_WEBSITE_CONNECTED", taskLabel: "CustomerPilot 1-page card (3 landmarks + FAQs) GBP Website button par lagao" },
  { week: 1, taskKey: "HIDDEN_ATTRIBUTES_AND_BOOKING", taskLabel: "AEO Voice Search: GBP Attributes switches ON karo (Wheelchair, Restroom, Women-owned, UPI) aur 'Booking/Order Online' button par merchant ka direct WhatsApp order link set karo." },
  { week: 1, taskKey: "DIRECTORIES_FIXED", taskLabel: "JD, Sulekha, IndiaMart, Zomato/Swiggy, Magicpin, Facebook — NAP 100% GBP se match karo" },

  // Phase 2 (Days 6–30): WhatsApp Daily Engine
  { week: 2, taskKey: "QR_STANDEE_DEPLOYED", taskLabel: "CustomerPilot QR Standee cash counter / billing point par physically place karo (Reward honest review with photo, no 5-star mandate)" },
  { week: 2, taskKey: "WHATSAPP_ENGINE_LIVE", taskLabel: "Automated Zero-Ban review requests (with HELP fallback) + Loyalty Stamp + Photo verification — live confirm karo" },
  { week: 2, taskKey: "AUTO_REPLY_RUNNING", taskLabel: "Verify: first 3 real reviews aa gaye aur 30-min ke andar auto-reply post hua" },
  { week: 2, taskKey: "GEO_AI_LISTICLE_PUBLISHED", taskLabel: "Outside-GBP GEO AI Mentions: Medium/Quora/LinkedIn par 'Top 5 [Category] in [Locality, City]' guide post karo with CustomerPilot mini-website link taaki ChatGPT aur Gemini dukan ko Top 3 me recommend karein." },

  // Phase 3 (Days 31–45): Map Traffic Booster
  { week: 3, taskKey: "TRAFFIC_BROADCAST_1", taskLabel: "Day 31: First weekend Map Traffic Offer 300–500 customers ko send karo" },
  { week: 3, taskKey: "TRAFFIC_BROADCAST_2", taskLabel: "Day 38: Second weekend broadcast (Month-end offer) send karo" },
  { week: 3, taskKey: "TOP3_CONFIRMED", taskLabel: "Day 45: Map grid screenshot lo — Top 3 me hai? GBP status 'TOP3_LOCKED' karo" },
]


export interface MasterChecklistItem {
  stage: "STEP_ZERO" | "WEEK_1" | "WEEK_2" | "WEEK_3" | "WEEK_4";
  stageName: string;
  id: string; // e.g. "s0_1", "w1_1"
  actionItem: string;
  verificationMetric: string;
  algorithmWeight: string;
  daysRange: string;
}

export const MASTER_30DAY_SPRINT_CHECKLIST: MasterChecklistItem[] = [
  // Step Zero (Day 0)
  {
    stage: "STEP_ZERO",
    stageName: "Step Zero: Baseline & Competitor Gap Audit",
    id: "s0_1",
    actionItem: "Audit current GBP rank across Top 5 keywords from 3 GPS pins.",
    verificationMetric: "Log Pin A (0.5km), B (2.0km), and C (3.5km) positions at 2 PM and 10:30 PM.",
    algorithmWeight: "Baseline Protocol",
    daysRange: "Day 0"
  },
  {
    stage: "STEP_ZERO",
    stageName: "Step Zero: Baseline & Competitor Gap Audit",
    id: "s0_2",
    actionItem: "Record current Top 3 competitors for each target keyword.",
    verificationMetric: "Document Primary Category, total reviews, and distance.",
    algorithmWeight: "Intelligence Gathering",
    daysRange: "Day 0"
  },
  {
    stage: "STEP_ZERO",
    stageName: "Step Zero: Baseline & Competitor Gap Audit",
    id: "s0_3",
    actionItem: "Calculate review volume and 'Mentioned in' keyword gaps.",
    verificationMetric: "Determine exact deficit to overtake position #3.",
    algorithmWeight: "Gap Quantification",
    daysRange: "Day 0"
  },
  // Week 1 (Days 1–7)
  {
    stage: "WEEK_1",
    stageName: "Week 1: Keyword Architecture & On-Page Foundations",
    id: "w1_1",
    actionItem: "Lock Top 5 high-intent transactional local keywords.",
    verificationMetric: "3 Core Categories + 2 High-Margin Niches approved.",
    algorithmWeight: "51% Algorithmic Weight",
    daysRange: "Days 1–7"
  },
  {
    stage: "WEEK_1",
    stageName: "Week 1: Keyword Architecture & On-Page Foundations",
    id: "w1_2",
    actionItem: "Synchronize Primary Category and 3–4 Secondary Categories.",
    verificationMetric: "Profile completeness marked 100% in dashboard.",
    algorithmWeight: "32% GBP Core Signals",
    daysRange: "Days 1–7"
  },
  {
    stage: "WEEK_1",
    stageName: "Week 1: Keyword Architecture & On-Page Foundations",
    id: "w1_3",
    actionItem: "Populate Products & Services with 300-char localized copy.",
    verificationMetric: "All top items linked with pricing and photos.",
    algorithmWeight: "On-Page Signals",
    daysRange: "Days 1–7"
  },
  {
    stage: "WEEK_1",
    stageName: "Week 1: Keyword Architecture & On-Page Foundations",
    id: "w1_4",
    actionItem: "Deploy LocalBusiness JSON-LD schema on merchant website.",
    verificationMetric: "Schema Validator confirms zero errors/warnings.",
    algorithmWeight: "19% On-Page Signals",
    daysRange: "Days 1–7"
  },
  // Week 2 (Days 8–15)
  {
    stage: "WEEK_2",
    stageName: "Week 2: Review Velocity & Semantic Seeding Engine",
    id: "w2_1",
    actionItem: "Deploy Smart QR Review Standee at billing counter.",
    verificationMetric: "Velocity established: 1–2 fresh reviews daily.",
    algorithmWeight: "16% Review Velocity",
    daysRange: "Days 8–15"
  },
  {
    stage: "WEEK_2",
    stageName: "Week 2: Review Velocity & Semantic Seeding Engine",
    id: "w2_2",
    actionItem: "Enforce Mobile Data Rule and seed user photo attachments.",
    verificationMetric: "≥10 photo reviews published without IP flag.",
    algorithmWeight: "Anti-Ban Protection",
    daysRange: "Days 8–15"
  },
  {
    stage: "WEEK_2",
    stageName: "Week 2: Review Velocity & Semantic Seeding Engine",
    id: "w2_3",
    actionItem: "Execute 100% Owner responses within 24 hours.",
    verificationMetric: "All responses incorporate secondary SEO context.",
    algorithmWeight: "Google Activity Signal",
    daysRange: "Days 8–15"
  },
  // Week 3 (Days 16–22)
  {
    stage: "WEEK_3",
    stageName: "Week 3: Directory Authority & Media Freshness",
    id: "w3_1",
    actionItem: "Submit and verify NAP across Tier-1 directories.",
    verificationMetric: "Exact character match across 30+ platforms.",
    algorithmWeight: "7% Citation Signals",
    daysRange: "Days 16–22"
  },
  {
    stage: "WEEK_3",
    stageName: "Week 3: Directory Authority & Media Freshness",
    id: "w3_2",
    actionItem: "Pre-seed 5 local keyword queries in the GBP Q&A section.",
    verificationMetric: "Official answers posted by verified Owner badge.",
    algorithmWeight: "AEO & Justifications",
    daysRange: "Days 16–22"
  },
  {
    stage: "WEEK_3",
    stageName: "Week 3: Directory Authority & Media Freshness",
    id: "w3_3",
    actionItem: "Upload 15+ authentic smartphone photos and 2 vertical videos.",
    verificationMetric: "Signage, interior, and counter indexed by Google Vision.",
    algorithmWeight: "Media Freshness & Vision AI",
    daysRange: "Days 16–22"
  },
  // Week 4 (Days 23–30)
  {
    stage: "WEEK_4",
    stageName: "Week 4: Behavioral Signals & Day-30 Geo-Grid Audit",
    id: "w4_1",
    actionItem: "Publish bi-weekly GBP Offer Posts (Tuesday and Friday).",
    verificationMetric: "High CTR CTA button configured and tracked.",
    algorithmWeight: "Zero-Gap Freshness",
    daysRange: "Days 23–30"
  },
  {
    stage: "WEEK_4",
    stageName: "Week 4: Behavioral Signals & Day-30 Geo-Grid Audit",
    id: "w4_2",
    actionItem: "Broadcast WhatsApp VIP Club offer linking to Maps listing.",
    verificationMetric: "Surge in direction requests and mobile calls logged.",
    algorithmWeight: "8% Behavioral Signals",
    daysRange: "Days 23–30"
  },
  {
    stage: "WEEK_4",
    stageName: "Week 4: Behavioral Signals & Day-30 Geo-Grid Audit",
    id: "w4_3",
    actionItem: "Execute Day-30 Geo-Grid Scan across 5 km × 5 km area.",
    verificationMetric: "Verify Top 3 Local Pack ranking against Day 0 logs.",
    algorithmWeight: "Final Verification",
    daysRange: "Days 23–30"
  }
];
