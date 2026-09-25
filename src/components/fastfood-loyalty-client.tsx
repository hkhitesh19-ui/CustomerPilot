"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FAQPageJsonLd } from "@/components/seo/json-ld"
import { Zap, UtensilsCrossed, Star, ArrowRight, Clock, ShieldCheck, Repeat } from "lucide-react"

const FAQS = [
  {
    question: "How does fast food loyalty software on WhatsApp speed up checkout during rush hours?",
    answer: "Customers simply point their camera at the acrylic counter QR standee while waiting in line or at pickup. Registration takes under 5 seconds with zero app downloads or OTP typing, keeping your cashier billing line moving at top speed."
  },
  {
    question: "How to increase repeat customers in a QSR or street food shop without an app?",
    answer: "With CustomerPilot, customers collect digital stamps directly inside WhatsApp. Automated win-back reminders and combo offers trigger after 3 to 7 days of inactivity, turning casual one-time fast food buyers into loyal daily repeat diners."
  },
  {
    question: "Can QSR outlets collect 5-star Google reviews automatically?",
    answer: "Yes! Satisfied diners receive an automated post-meal WhatsApp prompt with an AI-crafted review draft. When they post it on Google Maps, CustomerPilot auto-verifies and awards bonus loyalty stamps to their digital wallet."
  }
]

export function FastFoodLoyaltyClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <FAQPageJsonLd faqs={FAQS} />
      
      {/* Hero Header */}
      <div className="space-y-4 text-center pt-4">
        <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold border border-amber-500/20 inline-flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Industry Solution: Fast Food, QSR & Street Food Outlets
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto">
          Fast Food Loyalty Software WhatsApp: Turn One-Time Buyers into Daily Repeat Eaters
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Instant 5-second check-in on WhatsApp to boost repeat fast-food orders. Zero app download friction, zero billing delays, and automated 5-star Google reviews on autopilot.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 shadow-lg shadow-indigo-500/20">
              Start 3 Days Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/features/whatsapp-stamp-card">
            <Button size="lg" variant="outline" className="font-medium h-12">
              How WhatsApp Cards Work
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border hover:border-amber-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">5-Second Counter Scan</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fast food counters cannot afford cashier delays. Customers scan the counter standee QR, and cashiers tap to claim in 5 seconds without changing your existing POS or UPI setup.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-indigo-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Automated Repeat Offers</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customer hasn't ordered in 5 days? Automated WhatsApp re-engagement delivers personalized meal combo rewards, driving 35%+ higher repeat order frequency.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-emerald-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">1-Click Google Reviews</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Auto-prompt diners with AI-generated review drafts after ordering. Boost your Google Maps ranking for &ldquo;Best Burgers / Pizza / Chaat Near Me&rdquo; on autopilot.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI & Merchant Ultimate Benefit Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-background to-purple-950/20 p-8 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Why QSRs Choose WhatsApp Stamp Cards Over Plastic Cards & Apps
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          85% of retail app downloads are deleted within 48 hours. WhatsApp is already on 100% of Indian smartphones. CustomerPilot lets fast food brands own their customer database directly without paying 25% commissions to food aggregators.
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-semibold">
              Activate Fast Food Loyalty Free for 3 Days
            </Button>
          </Link>
        </div>
      </div>

      {/* Interlinked Related Solutions */}
      <div className="border-t border-border pt-8">
        <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground text-center mb-4">
          Explore Other Industry Retention Solutions
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link href="/restaurant-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Fine Dining & Regional Restaurants &rarr;
          </Link>
          <Link href="/cafe-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Cafes & Coffee Shops &rarr;
          </Link>
          <Link href="/bakery-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Bakeries & Cake Shops &rarr;
          </Link>
          <Link href="/salon-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Salons & Spas &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
