"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FAQPageJsonLd } from "@/components/seo/json-ld"
import { Scissors, Sparkles, Award, ArrowRight, Calendar, Star, Clock } from "lucide-react"

const FAQS = [
  {
    question: "How to increase repeat clients in beauty salon?",
    answer: "Beauty services have a predictable cycle (haircut every 3-4 weeks, hair spa/color every 6-8 weeks). CustomerPilot tracks service history and sends automated WhatsApp reminders right when the client is due for their next appointment, increasing lifetime client value by 50%."
  },
  {
    question: "How do automated WhatsApp offers fill empty salon chairs on weekdays (Mon-Thu)?",
    answer: "Most salons are empty on Monday through Thursday. CustomerPilot lets you trigger automated mid-week VIP pampering vouchers (e.g., 'Complimentary Hair Spa with your Tuesday Keratin treatment') exclusively to your WhatsApp loyalty club members, boosting slow-day revenue."
  },
  {
    question: "How does CustomerPilot automate Google review requests for salon owners?",
    answer: "Right after a styling or spa session, the client receives a WhatsApp message with an AI-crafted draft review. With 1 click, they post their review on Google Maps—often with an after-haircut selfie—propelling your salon to #1 for 'Best Salon Near Me' searches."
  }
]

export function SalonLoyaltyClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <FAQPageJsonLd faqs={FAQS} />

      {/* Hero Header */}
      <div className="space-y-4 text-center pt-4">
        <span className="px-3.5 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-semibold border border-purple-500/20 inline-flex items-center gap-1.5">
          <Scissors className="w-3.5 h-3.5 text-purple-500" />
          Industry Solution: Hair Salons, Spas & Beauty Parlours
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto">
          WhatsApp Loyalty Software for Salons & Spas: Fill Weekday Chairs & Rank #1 on Google Maps
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Fill empty chairs on Monday to Thursday with automated WhatsApp re-engagement offers. Increase client lifetime value by 50% and collect verified 5-star Google reviews on autopilot.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 shadow-lg shadow-indigo-500/20">
              Start 3 Days Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/features/google-review-automation">
            <Button size="lg" variant="outline" className="font-medium h-12">
              Explore Review Generator
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border hover:border-purple-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Weekday Slow-Day Booster</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fill empty salon chairs on Monday to Thursday with automated WhatsApp flash offers and exclusive weekday pampering perks for VIP members.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-amber-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">VIP Tiers & Service Pass</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Silver, Gold, and Platinum loyalty tiers reward high-ticket services (Keratin, Balayage, Bridal Makeup) with bonus treatment vouchers and luxury upgrades.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-emerald-500/40 transition-all bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Rank #1 on Google Maps</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Auto-generate 5-star Google review drafts after every haircut or facial. Dominate &ldquo;Best Salon Near Me&rdquo; on Google Maps with genuine client selfies and ratings.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI & Merchant Ultimate Benefit Banner */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-background to-indigo-950/20 p-8 text-center space-y-4 shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Never Lose a High-Ticket Client to the Salon Down the Street
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Clients leave because nobody followed up. CustomerPilot automatically tracks days since their last haircut or facial, sending thoughtful WhatsApp appointment invitations before they decide to try a competitor.
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
          <Link href="/bakery-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Bakeries & Cake Shops &rarr;
          </Link>
          <Link href="/cafe-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Cafes & Coffee Shops &rarr;
          </Link>
          <Link href="/fastfood-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Fast Food & QSR &rarr;
          </Link>
          <Link href="/car-wash-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Car Wash & Auto Detailing &rarr;
          </Link>
          <Link href="/restaurant-loyalty" className="px-3 py-1.5 rounded-lg border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all">
            Fine Dining & Regional Restaurants &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
