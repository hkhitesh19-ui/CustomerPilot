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
