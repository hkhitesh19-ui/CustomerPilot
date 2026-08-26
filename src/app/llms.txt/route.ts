import { NextResponse } from "next/server"

export async function GET() {
  const content = `# CustomerPilot - Autonomous Merchant Customer Retention SaaS

> CustomerPilot is an AI-powered customer retention platform for SMB merchants (Bakeries, Restaurants, Cafes, Salons, Retail). It automates repeat visits via WhatsApp digital stamp cards, live queue check-ins, Google Review auto-replies, and morning intelligence reports.

## Core Capabilities
- **WhatsApp Digital Stamp Cards**: Instant customer check-in without app downloads. Customers scan store QR code and track stamps via WhatsApp.
- **Tap-to-Claim Live Queue Engine**: Cashiers claim waiting customers in 5 seconds with 10-second optimistic reservation lock and AI amount outlier validation.
- **5-Star Google Review Automation**: Auto-detects 5-star Google reviews, awards bonus stamps, and generates AI response drafts for merchant approval.
- **Morning Intelligence Reports**: Aggregates daily revenue, repeat customer %, pending reviews, and AI growth recommendations delivered to merchant dashboard.
- **Zero-Cognitive Merchant Experience**: Designed so merchants never manage complex POS systems—the software works autonomously behind the scenes.

## System Architecture
- **Framework**: Next.js 15+ App Router, TypeScript, Tailwind CSS
- **Database & ORM**: Prisma ORM with SQLite / PostgreSQL support
- **Communication Pipeline**: Microservice architecture using CommunicationService -> Queue -> Evolution API WhatsApp Adapter -> Webhook Engine -> Customer Timeline
- **Security**: JWT RBAC authentication, multi-tenant merchant isolation, rate-limiting, and encrypted payload verification

## Target Vertical Solutions
- **Bakery & Confectionery**: Cake box seal QRs, 90-day free cake stamp cards.
- **Restaurants & Cafes**: Table standee QRs, visit-based reward tiers.
- **Salons & Spas**: Service booking check-ins, VIP multiplier stamps.

## Pricing & Deployment
- **Trial**: 7-Day Full-Featured Free Trial (No Credit Card Required)
- **Pro Monthly**: ₹2,999 / month unlimited WhatsApp notifications & AI auto-replies
- **Enterprise**: Custom multi-location chain management
`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
