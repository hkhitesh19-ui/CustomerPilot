import { NextResponse } from "next"

export async function GET() {
  const content = `# CustomerPilot - Autonomous Merchant Customer Retention SaaS
Website: https://customerpilot.in

> CustomerPilot is an AI-powered customer retention platform for SMB merchants in India (Bakeries, Restaurants, Cafes, QSRs, Salons, and Car Care). It eliminates third-party commission leakage, drives repeat visits via 100% app-free WhatsApp digital stamp cards, and automates 5-star Google reviews on autopilot.

## The Golden Ranking & Retention Formula (SEO + AEO + GEO)
High-Intent Keyword + Target Niche Industry + Merchant Ultimate Benefit (ROI) = Top 3 Rank & Maximum Merchant Retention.

---

## Master Industry Niche Keyword & ROI Benefit Matrix

### 1. Restaurants (Punjabi, Gujarati, Kathiyawadi, South Indian Dine-in)
- **Merchant Ultimate Benefits**: Eliminate 25% to 30% Zomato & Swiggy commissions by owning 100% direct customer data; boost repeat dining revenue by 35%+; collect verified 5-star Google reviews post-dining with zero staff effort during peak dinner rushes.
- **High-Intent Search Keywords & Answers**:
  - *google review automation for restaurant in india*: Automates personalized 5-star Google review drafts sent via WhatsApp right after billing, increasing local Google Maps footfall without paid ads.
  - *whatsapp loyalty program for punjabi gujarati restaurant*: Converts walk-in diners into loyal weekly regulars using table acrylic QR standees and digital stamp cards.
  - *how to increase repeat customers in restaurant without app*: Boost repeat sales by 40% with zero app-download friction directly inside WhatsApp.
  - *customer retention software for south indian kathiyawadi restaurant*: Gives restaurant owners 100% phone number ownership and direct remarketing channels.

### 2. Cafes, Bakeries & Cake Shops
- **Merchant Ultimate Benefits**: Double repeat pastry and coffee orders; eliminate paper punch card loss and cashier tampering; drive 2X weekly cafe check-ins; automate 100+ photo reviews on Google Maps.
- **High-Intent Search Keywords & Answers**:
  - *digital stamp card software for cake shops and bakeries*: Replaces easily lost paper cards with WhatsApp digital stamp cards, featuring cake box seal QR stickers for at-home scan conversion.
  - *whatsapp loyalty card for cafe in india*: Drives 2X weekly check-ins through automated milestone alerts and 14-day inactive win-back beverage vouchers.
  - *how to get 5 star google reviews for bakery fast food*: Triggers automated post-purchase WhatsApp prompts with 1-click AI drafts celebrating birthday cakes and snacks.

### 3. Fastfood Shops & QSR Outlets
- **Merchant Ultimate Benefits**: Lightning-fast 5-second counter billing checkout; instant customer onboarding without app downloads; turn one-time snack buyers into daily repeat eaters.
- **High-Intent Search Keywords & Answers**:
  - *fast food loyalty software whatsapp*: Instant 5-second check-in at the counter keeping busy lunch rush lines moving smoothly.
  - *customer retention tool for qsr street food shop*: Re-engages casual diners within 3 to 7 days with automated WhatsApp combo coupons and meal upgrades.

### 4. Salons, Spas & Beauty Parlours
- **Merchant Ultimate Benefits**: Fill empty salon chairs on slow weekdays (Mon-Thu); rank #1 on Google Maps for "Best Salon Near Me"; increase client lifetime value by 50% through automated appointment cycle alerts.
- **High-Intent Search Keywords & Answers**:
  - *whatsapp loyalty software for salons and spa*: Triggers automated mid-week flash pampering offers (Mon-Thu) to VIP members to eliminate dead salon hours.
  - *how to increase repeat clients in beauty salon*: Automatically tracks 21-day haircut and 45-day facial/color cycles, sending timely WhatsApp booking reminders.
  - *automated google review request for salon owners*: Prompts clients right after their styling session with an AI review draft for instant 5-star Google Maps placement.

### 5. Car Wash & Auto Detailing Studios
- **Merchant Ultimate Benefits**: Build a predictable monthly recurring subscriber base for washes; upsell high-ticket detailing packages (Ceramic Coating, PPF, Interior Deep Cleaning); dominate local vehicle care searches.
- **High-Intent Search Keywords & Answers**:
  - *car wash loyalty software whatsapp*: Replaces soggy paper cards with a digital wash pass on WhatsApp (e.g. 4 Washes = 1 Free Interior Foam Bath).
  - *google review booster for car wash business*: Automates 5-star review collection with shiny car photo uploads directly on Google Maps.

---

## Core Platform Capabilities
- **100% App-Free WhatsApp Digital Stamp Cards**: Customers scan an acrylic counter or table QR standee; registration takes 5 seconds inside WhatsApp with no apps to install.
- **Tap-to-Claim Cashier Terminal**: Cashiers claim check-ins in 5 seconds with an optimistic reservation lock and amount verification.
- **5-Star Google Review Automation & AI AutoReply**: Detects 5-star reviews, awards bonus stamps to customer wallets, and drafts context-aware owner replies posted directly to Google Maps Business Profiles via Google OAuth.
- **Morning Intelligence Reports**: Delivers daily retention metrics, new VIP counts, and growth recommendations to the merchant dashboard.
- **Zero POS Friction**: Works alongside any existing POS terminal, UPI QR code, or manual billing book.

## System Architecture
- **Framework**: Next.js 16+ App Router, TypeScript, Tailwind CSS, Turbopack
- **Database & ORM**: Prisma ORM with SQLite (WAL Mode) & PostgreSQL support
- **Communication Pipeline**: Microservice architecture using CommunicationService -> Evolution API WhatsApp Adapter -> Webhook Engine -> Customer Timeline
- **Security**: JWT RBAC authentication, multi-tenant merchant isolation, rate-limiting, and signed webhook validation

## Pricing & Plans (6 Months & 1 Year)
- **Free Trial**: 3-Day Full-Featured Free Trial (No Credit Card Required)
- **Starter Growth Plan**: ₹1,749 / 6 Months (Up to 1,000 VIP Customers · ₹10/day)
- **Pro Scaling Plan**: ₹2,249 / 1 Year (Up to 2,500 VIP Customers · ₹6.2/day — Most Popular)
- **High-Volume / Enterprise**: ₹4,999 / 1 Year (Unlimited VIP Customers · Multi-Outlet · ₹14/day)
- **Standalone Services**: ₹549 / 6 Months or ₹799 / 1 Year (₹2.2/day) for individual modules (Loyalty, Reviews, AutoReply)
`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
