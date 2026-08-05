"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FAQPageJsonLd } from "@/components/seo/json-ld"
import { QrCode, Crown, Utensils, ArrowRight } from "lucide-react"

const FAQS = [
  { question: "Where should QR codes be placed in a restaurant?", answer: "Place acrylic QR standees on dining tables and billing counters for maximum customer engagement." },
  { question: "Can cashiers claim rewards without interrupting billing?", answer: "Yes. Cashiers only spend 5 seconds tapping customer check-ins on the CustomerPilot Tap-to-Claim screen." }
]

export default function RestaurantLoyaltyPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      <FAQPageJsonLd faqs={FAQS} />
      <div className="space-y-4 text-center">
        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-xs font-semibold border border-indigo-500/20">
          Industry Solution: Fine Dining & Casual Restaurants
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Convert Diners into Loyal Weekly Repeat Customers</h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Table QR standees, instant WhatsApp check-ins, and visit-based Gold & Platinum VIP multiplier tiers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Utensils className="w-8 h-8 text-indigo-500" />
            <h3 className="font-bold text-lg">Table Standee QR</h3>
            <p className="text-xs text-muted-foreground">Diners scan at the table while waiting for food. Instant check-in without app downloads.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Crown className="w-8 h-8 text-amber-500" />
            <h3 className="font-bold text-lg">Gold & Platinum VIP Tiers</h3>
            <p className="text-xs text-muted-foreground">Frequent diners earn 1.5x to 2x stamp multipliers, driving higher average order values.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <QrCode className="w-8 h-8 text-green-500" />
            <h3 className="font-bold text-lg">5-Second Cashier Claim</h3>
            <p className="text-xs text-muted-foreground">Works alongside any POS or UPI system. Tap customer name &rarr; Enter amount &rarr; Stamp awarded.</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <Link href="/register">
          <Button size="lg">
            Start 14-Day Restaurant Trial <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
