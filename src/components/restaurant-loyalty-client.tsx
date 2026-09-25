"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FAQPageJsonLd } from "@/components/seo/json-ld"
import { QrCode, Crown, Utensils, ArrowRight, ShieldCheck, TrendingUp, Star } from "lucide-react"

const FAQS = [
  {
    question: "How to increase repeat customers in restaurant without app?",
    answer: "By using CustomerPilot's WhatsApp digital stamp cards. Instead of forcing diners to download a heavy mobile app, customers scan your table acrylic QR standee and join your VIP club in 5 seconds directly on WhatsApp. Automated visit reminders and VIP multiplier rewards bring diners back 35%+ more frequently."
  },
  {
    question: "How does CustomerPilot help restaurants eliminate heavy Zomato and Swiggy commissions?",
    answer: "Food aggregators charge 25% to 30% commission and never share diner phone numbers with restaurant owners. CustomerPilot gives Punjabi, Gujarati, Kathiyawadi, and South Indian restaurants 100% customer data ownership. You can directly market to walk-in diners and offer direct dine-in or takeaway loyalty rewards without third-party commission leakage."
  },
  {
    question: "Can restaurants automate 5-star Google reviews during peak dining rush?",
    answer: "Yes. After the bill is settled, CustomerPilot triggers an automated, personalized WhatsApp message with an AI-crafted review draft. Diners publish 5-star Google reviews in 1 tap, boosting your local Google Maps ranking with zero cashier or waiter effort."
  },
  {
    question: "Where should QR codes be placed in a restaurant?",
    answer: "Place durable acrylic QR standees on dining tables so customers scan while awaiting their food, and a secondary QR standee at the billing checkout counter."
  }
]

export function RestaurantLoyaltyClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <FAQPageJsonLd faqs={FAQS} />
      
      {/* Hero Header */}
      <div className="space-y-4 text-center pt-4">
        <span className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20 inline-flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-indigo-500" />
          Industry Solution: Punjabi, Gujarati, Kathiyawadi & South Indian Restaurants
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto">
          Convert Walk-in Diners into Weekly Repeat Customers & Stop Paying 30% Delivery Commissions
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Own 100% of your diner data, automate 5-star Google reviews post-dining, and boost restaurant repeat revenue by 35%+ with zero app-download friction inside WhatsApp.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 shadow-lg shadow-indigo-500/20">
              Start 3 Days Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/features/google-review-automation">
            <Button size="lg" variant="outline" className="font-medium h-12">
              See Google Review Engine
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border hover:border-indigo-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Table Standee QR</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Diners scan the table standee while waiting for their food. Registration happens in 5 seconds over WhatsApp—no slow app downloads, no friction.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-amber-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">VIP Tiers & Multipliers</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Reward regular diners with Gold & Platinum tiers (1.5x to 2x stamp multipliers). High-value tables return faster and spend more per visit.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-emerald-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Auto 5-Star Reviews</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automate 5-star Google review collection after dining. Increase local footfall on Google Maps without spending a single rupee on paid ads.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI & Merchant Ultimate Benefit Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-background to-purple-950/20 p-8 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Own 100% Customer Data & Save Zomato / Swiggy Margins
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          When customers order through delivery aggregators, you lose up to 30% of your bill and zero diner data is shared. With CustomerPilot, every dine-in guest becomes your direct WhatsApp subscriber. Send automated anniversary, weekend, and festival greetings directly.
        </p>
        <div className="pt-2 flex justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-semibold">
              Reclaim Your Restaurant Data Today
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
          <Link href="/cafe-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Cafes & Coffee Shops &rarr;
          </Link>
          <Link href="/bakery-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Bakeries & Cake Shops &rarr;
          </Link>
          <Link href="/car-wash-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Car Wash & Auto Detailing &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
