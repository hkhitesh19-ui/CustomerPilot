import type { Metadata } from "next"
import { VsPage, VsPageConfig } from "@/components/vs-page"

export const metadata: Metadata = {
  title: "Birdeye Alternative India 2025 — CustomerPilot: Affordable AI Google Review AutoReply for Local SMBs",
  description: "Comparing Birdeye vs CustomerPilot? Get autonomous AI Google review drafts and 1-Click AutoReply built for Indian local businesses at ₹2,249/yr — not enterprise pricing. WhatsApp-native loyalty included.",
  keywords: [
    "birdeye alternative india",
    "birdeye vs customerpilot",
    "affordable google review management india",
    "birdeye alternative for small business",
    "ai review reply india affordable",
    "google business profile automation local restaurant india"
  ],
  alternates: { canonical: "/vs/birdeye" },
  openGraph: {
    title: "Birdeye Alternative India — CustomerPilot: AI Google Reviews + WhatsApp Loyalty at ₹2,249/yr",
    description: "Side-by-side comparison of Birdeye vs CustomerPilot for Indian local F&B and retail businesses who want AI-powered Google review management without enterprise pricing.",
    url: "https://customerpilot.ai/vs/birdeye"
  }
}

const config: VsPageConfig = {
  competitor: "Birdeye",
  competitorShort: "Birdeye",
  headlineKeyword: "Birdeye Alternative",
  metaTitle: "Birdeye Alternative India",
  metaDescription: "",
  canonicalSlug: "/vs/birdeye",
  heroHeadline: "Looking for a Birdeye Alternative in India? Get Autonomous AI Google Reviews + WhatsApp Loyalty — Built for Local SMBs.",
  heroSubtext: "Birdeye is a powerful enterprise reputation management platform — but its pricing and US-centric feature set can be overkill for Indian local retail, bakeries, cafes, and restaurants. CustomerPilot is purpose-built for the Indian SMB market: WhatsApp-first loyalty, AI review replies, and 5-second QR onboarding.",
  coreProblem: "Birdeye excels at enterprise-scale reputation management for multi-location businesses with large marketing teams. However, for Indian local businesses (1–5 outlets), Birdeye's pricing starts at levels that are inaccessible to most SMBs, and many features like SMS campaigns, enterprise CRM integrations, and US-style review platforms (Yelp, Trustpilot) are irrelevant for the Indian market. CustomerPilot focuses on what Indian local businesses need: Google Maps review growth via WhatsApp automation, AI-crafted SEO-optimized reply drafts using AI, and a WhatsApp-native loyalty stamp system — all at ₹2,249/year with 50% launch discount.",
  pricingComparison: {
    competitorLabel: "Birdeye (Starter Plan, USD converted)",
    competitorCost: "₹60,000+",
    competitorPer: "₹164",
    cpCost: "₹2,249",
    cpPer: "₹6.2",
    savings: "₹57,751"
  },
  comparisonRows: [
    { feature: "Pricing", competitor: "₹60,000+/year (enterprise)", cp: "₹2,249/year (50% OFF launch price)", winner: "cp" },
    { feature: "Target Market", competitor: "US/Global enterprise, 10+ locations", cp: "Indian SMB, local F&B & retail, 1–5 outlets", winner: "cp" },
    { feature: "WhatsApp Loyalty Program", competitor: null, cp: "✅ Digital Stamps + VIP Wallet via WhatsApp", winner: "cp" },
    { feature: "Google Review AutoReply", competitor: "Template-based, requires manual trigger", cp: "Autonomous AI — contextual & SEO-optimized", winner: "cp" },
    { feature: "AI Review Draft for Customers", competitor: null, cp: "✅ AI pre-fills SEO review draft for customer to post", winner: "cp" },
    { feature: "Negative Review Smart Gate", competitor: "Survey form redirect", cp: "Private escalation to owner before it hits Google", winner: "cp" },
    { feature: "Customer App Required", competitor: "Web review widget (some mobile)", cp: "Zero — all inside WhatsApp chat", winner: "cp" },
    { feature: "India WhatsApp API Support", competitor: "Limited / US-focused integration", cp: "Native Evolution API for Indian WhatsApp numbers", winner: "cp" },
    { feature: "Counter Onboarding", competitor: "Complex setup, POS integration needed", cp: "One QR standee — zero POS needed, 5-second flow", winner: "cp" },
    { feature: "Data Ownership", competitor: "Platform-hosted, export limited", cp: "100% merchant-owned, 1-click CSV export", winner: "cp" },
  ],
  bestForCompetitor: "You're a large multi-location chain with a dedicated marketing team, US/global presence, and need enterprise-grade multi-platform review management across Google, Yelp, Trustpilot, Facebook — with CRM integrations.",
  bestForCP: "You're an Indian local business owner (bakery, cafe, restaurant, salon) with 1–5 outlets. You want more Google reviews this month, WhatsApp-native loyalty without any app downloads, and AI-powered replies — at a price that makes sense for an SMB budget."
}

export default function BirdeyeVsPage() {
  return <VsPage config={config} />
}
