"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FAQPageJsonLd } from "@/components/seo/json-ld"
import { Sparkles, QrCode, Award, ArrowRight, ShieldCheck, Star, Cake } from "lucide-react"

const FAQS = [
  {
    question: "How do cake box QR seals work?",
    answer: "Place high-res QR stickers directly on cake boxes and delivery bags. Customers scan the QR code when unboxing their cake at home with family, instantly joining your WhatsApp VIP club without downloading an app."
  },
  {
    question: "How does digital stamp card software for cake shops prevent paper card fraud?",
    answer: "Paper punch cards are frequently misplaced by customers or stamped fraudulently by staff. CustomerPilot's digital stamp card is tied securely to the customer's verified WhatsApp phone number with optimistic cashier PIN validation, completely eliminating card counterfeiting."
  },
  {
    question: "How to get 5 star google reviews for bakery fast food?",
    answer: "CustomerPilot automatically triggers a post-purchase WhatsApp message after a customer buys a cake or pastry, including an AI-generated draft review. In 1 tap, the customer publishes a 5-star Google review with photos of their celebratory cake, earning bonus loyalty stamps."
  },
  {
    question: "What is the recommended bakery reward default?",
    answer: "Spend ₹500 = 1 Stamp. 10 Stamps = FREE 500gm Birthday Cake (90-day validity). This proven blueprint drives a 40% increase in repeat pastry and snack purchases between birthdays."
  }
]

export function BakeryLoyaltyClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <FAQPageJsonLd faqs={FAQS} />

      {/* Hero Header */}
      <div className="space-y-4 text-center pt-4">
        <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold border border-amber-500/20 inline-flex items-center gap-1.5">
          <Cake className="w-3.5 h-3.5 text-amber-500" />
          Industry Solution: Bakeries, Cake Shops & Confectioneries
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto">
          Digital Stamp Card Software for Cake Shops & Bakeries: Double Your Repeat Orders
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Replace lost paper cards with WhatsApp digital stamp cards. Own 100% of your customer contacts and collect 100+ 5-star Google reviews on autopilot using 1-click AI drafts.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 shadow-lg shadow-indigo-500/20">
              Start 3 Days Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/case-studies/cake-connection">
            <Button size="lg" variant="outline" className="font-medium h-12">
              Read Cake Connection Case Study
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border hover:border-amber-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Cake Box Seal QR</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Printable QR stickers placed directly on cake boxes and delivery bags. Customers scan at home when celebrating, converting offline buyers into WhatsApp subscribers.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-indigo-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Zero-Fraud Digital Cards</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Paper punch cards get lost or forged. WhatsApp digital stamp cards live securely on the customer's phone, sending automated milestone cheers when they are 2 stamps away from a free cake.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-emerald-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">1-Click AI Google Reviews</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Award +2 bonus stamps when customers post 5-star Google reviews with photos of their birthday cakes. Automate 100+ verified 5-star ratings every single month.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI & Merchant Ultimate Benefit Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-background to-orange-950/20 p-8 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Turn Annual Birthday Buyers into Weekly Pastry & Bread Regulars
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Most cake buyers only visit once a year for birthdays. CustomerPilot's automated WhatsApp win-back campaigns and weekend pastry offers bring them back every 10 to 14 days, driving 40%+ higher bakery revenue.
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-semibold">
              Launch Bakery Loyalty in 5 Minutes
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
          <Link href="/cafe-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Cafes & Coffee Shops &rarr;
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
