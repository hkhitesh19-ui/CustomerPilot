"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FAQPageJsonLd } from "@/components/seo/json-ld"
import { Coffee, QrCode, Sparkles, ArrowRight, Repeat, ShieldCheck, Star } from "lucide-react"

const FAQS = [
  {
    question: "How does a WhatsApp loyalty card for cafe in India drive 2X weekly check-ins?",
    answer: "Regular coffee drinkers love progress. CustomerPilot sends automated WhatsApp notifications when a customer is 1 or 2 stamps away from a free cappuccino, encouraging mid-week visits. Inactive customers receive a 14-day 'We Miss You' beverage voucher directly on WhatsApp."
  },
  {
    question: "Why should cafes replace paper punch cards with digital WhatsApp cards?",
    answer: "Customers lose or forget paper punch cards at home 70% of the time, and paper cards are prone to staff tampering. CustomerPilot's digital stamp card sits directly inside WhatsApp, requiring no app download and ensuring zero card loss or fraud."
  },
  {
    question: "How fast is counter check-in during busy cafe morning rushes?",
    answer: "Check-in takes only 5 seconds. The customer scans your counter QR Code with their phone camera while ordering, and the cashier validates the stamp with 1 tap on the CustomerPilot Tap-to-Claim screen."
  }
]

export function CafeLoyaltyClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <FAQPageJsonLd faqs={FAQS} />

      {/* Hero Header */}
      <div className="space-y-4 text-center pt-4">
        <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold border border-amber-500/20 inline-flex items-center gap-1.5">
          <Coffee className="w-3.5 h-3.5 text-amber-500" />
          Industry Solution: Cafes, Coffee Bars & Beverage Outlets
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto">
          WhatsApp Loyalty Card for Cafe in India: Drive 2X Weekly Check-ins on Autopilot
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Replace easily lost paper punch cards with instant digital WhatsApp stamps. Re-engage casual coffee lovers, prevent staff fraud, and automate 5-star Google review collection.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 shadow-lg shadow-indigo-500/20">
              Start 3 Days Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/features/whatsapp-stamp-card">
            <Button size="lg" variant="outline" className="font-medium h-12">
              See How Stamp Cards Work
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border hover:border-amber-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Zero-Loss Punch Card</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every espresso, cold brew, or sandwich purchase earns a digital stamp. Customer wallet updates instantly on WhatsApp with zero app installations.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-indigo-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Automated Win-Backs</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customer hasn't visited for 14 days? Trigger an automated &ldquo;Free Cookie with your next Cappuccino&rdquo; offer on WhatsApp to bring them back.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-emerald-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Google Review Multipliers</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Happy customers unlock extra loyalty stamps when posting 5-star Google reviews with photos of their latte art, boosting your local cafe visibility.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI & Merchant Ultimate Benefit Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-background to-orange-950/20 p-8 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Eliminate Paper Card Fraud & Grow Daily Footfall
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Paper loyalty cards are easily cheated, lost in wallets, and offer zero contact data. CustomerPilot builds your private WhatsApp marketing list of hundreds of loyal coffee regulars who return every week.
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-semibold">
              Activate Cafe Loyalty Free for 3 Days
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
          <Link href="/bakery-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Bakeries & Cake Shops &rarr;
          </Link>
          <Link href="/fastfood-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Fast Food & QSR &rarr;
          </Link>
          <Link href="/restaurant-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Fine Dining & Regional Restaurants &rarr;
          </Link>
          <Link href="/salon-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Salons & Spas &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
