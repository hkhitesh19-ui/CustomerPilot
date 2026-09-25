"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FAQPageJsonLd } from "@/components/seo/json-ld"
import { Car, Sparkles, Star, ShieldCheck, Crown, ArrowRight, Repeat } from "lucide-react"

const FAQS = [
  {
    question: "How can a car wash or detailing studio build recurring monthly customers without paper punch cards?",
    answer: "CustomerPilot provides a 100% digital WhatsApp stamp card. Car owners scan an acrylic counter QR code upon every wash or detailing session. Stamps are tracked seamlessly in WhatsApp, unlocking free foam washes or interior detailing discounts after a set number of visits."
  },
  {
    question: "How does automated Google review collection help auto detailing businesses rank #1 on Google Maps?",
    answer: "Auto detailing is a high-ticket, trust-driven business. CustomerPilot automatically sends a post-service WhatsApp message prompting happy car owners to submit 5-star Google reviews with photos of their shiny vehicles, rocketing your studio to the top of Google Maps 'Best Car Detailing Near Me' local rankings."
  },
  {
    question: "Can we upsell high-ticket detailing packages like Ceramic Coating & PPF through WhatsApp loyalty?",
    answer: "Yes! As customers visit for routine washes, CustomerPilot tracks their loyalty status and automatically sends VIP exclusive upgrade offers for Ceramic Coating, Paint Protection Film (PPF), and premium deep interior detailing treatments."
  }
]

export function CarWashLoyaltyClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <FAQPageJsonLd faqs={FAQS} />

      {/* Hero Header */}
      <div className="space-y-4 text-center pt-4">
        <span className="px-3.5 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-500/20 inline-flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-blue-500" />
          Industry Solution: Car Washes, Auto Detailing Studios & Bike Care
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto">
          Car Wash Loyalty Software WhatsApp: Build Monthly Recurring Wash Subscribers & Detailing VIPs
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Build a loyal base of recurring wash members using automated WhatsApp stamp cards. Collect 100+ 5-star Google reviews on autopilot and upsell high-ticket ceramic coating & PPF detailing packages.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 shadow-lg shadow-indigo-500/20">
              Start 3 Days Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/features/google-review-automation">
            <Button size="lg" variant="outline" className="font-medium h-12">
              Explore Review Automation
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border hover:border-blue-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Monthly Wash Pass on WhatsApp</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ditch paper stamp cards that get soaked or lost in glove compartments. Customers earn digital wash stamps on WhatsApp: e.g., 4 Washes = 1 Free Interior Vacuum & Foam Bath.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-purple-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">High-Ticket Detailing Upsell</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Regular wash customers are your highest-converting detailing leads. Trigger VIP tier rewards that unlock exclusive member credits towards Ceramic Coating, PPF, and Leather Treatment.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-emerald-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Google Detailing Review Booster</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Auto-generate 5-star Google review drafts right after a wash or detailing job. Dominate &ldquo;Best Car Wash Near Me&rdquo; on Google Maps with authentic customer photos and glowing feedback.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI & Merchant Ultimate Benefit Banner */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-background to-indigo-950/20 p-8 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Turn One-Off Monsoon & Weekend Washers into 12-Month Loyalists
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Vehicle owners forget when they last washed their car. CustomerPilot's automated 14-day and 28-day WhatsApp reminder triggers bring them back like clockwork, giving your garage predictable monthly revenue.
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-semibold">
              Get Started with 3-Day Free Trial
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
          <Link href="/fastfood-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Fast Food & QSR &rarr;
          </Link>
          <Link href="/restaurant-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Fine Dining & Regional Restaurants &rarr;
          </Link>
          <Link href="/cafe-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Cafes & Coffee Shops &rarr;
          </Link>
          <Link href="/salon-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Salons & Spas &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
