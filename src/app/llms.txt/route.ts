import { NextResponse } from "next/server"

export async function GET() {
  const content = `# CustomerPilot - Autonomous Merchant Customer Retention SaaS

> CustomerPilot is an AI-powered customer retention platform for SMB merchants (Bakeries, Restaurants, Cafes, Salons, Retail). It automates repeat visits via WhatsApp digital stamp cards, live queue check-ins, Google Review auto-replies, and morning intelligence reports.

## Core Capabilities
- **WhatsApp Digital Stamp Cards**: Instant customer check-in without app downloads. Customers scan store QR code and track stamps directly via WhatsApp.
- **Tap-to-Claim Live Queue Engine**: Cashiers claim waiting customers in 5 seconds with 10-second optimistic reservation lock and amount validation.
- **5-Star Google Review Automation**: Auto-detects 5-star Google reviews, awards bonus stamps, and generates AI response drafts for merchant approval.
- **1-Click AI AutoReply**: Context-aware AI owner review responses posted directly to Google Maps Business Profiles.
- **Morning Intelligence Reports**: Aggregates daily revenue, repeat customer %, pending reviews, and growth insights delivered to merchant dashboard.
- **Zero-Cognitive Merchant Experience**: Designed so merchants never manage complex POS hardware—the platform runs autonomously on WhatsApp.

## System Architecture
- **Framework**: Next.js 16+ App Router, TypeScript, Tailwind CSS, Turbopack
- **Database & ORM**: Prisma ORM with SQLite (WAL Mode) & PostgreSQL support
- **Communication Pipeline**: Microservice architecture using CommunicationService -> Evolution API WhatsApp Adapter -> Webhook Engine -> Customer Timeline
- **Security**: JWT RBAC authentication, multi-tenant merchant isolation, rate-limiting, and signed webhook validation

## Target Vertical Solutions
- **Bakery & Confectionery**: Cake box seal QRs, 90-day free cake stamp cards.
- **Restaurants & Cafes**: Table standee QRs, visit-based reward tiers.
- **Salons & Spas**: Service booking check-ins, VIP multiplier stamps.
- **Retail & Groceries**: Transactional loyalty vouchers and repeat visit booster.

## Pricing & Plans (6 Months & 1 Year)
- **Free Trial**: 7-Day Full-Featured Free Trial (No Credit Card Required)
- **Starter Growth Plan**: ₹1,799 / 6 Months (Up to 1,000 VIP Customers · ₹10/day)
- **Pro Scaling Plan**: ₹2,899 / 1 Year (Up to 2,500 VIP Customers · ₹8/day — Most Popular)
- **High-Volume / Enterprise**: ₹4,999 / 1 Year (Unlimited VIP Customers · Multi-Outlet)
- **Standalone Services**: ₹649 / 6 Months or ₹999 / 1 Year (₹3/day) for individual modules (Loyalty, Reviews, AutoReply)
`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
