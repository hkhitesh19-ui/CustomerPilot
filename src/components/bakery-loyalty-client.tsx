"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FAQPageJsonLd } from "@/components/seo/json-ld"
import { Sparkles, QrCode, Award, ArrowRight } from "lucide-react"

const FAQS = [
  { question: "How do cake box QR seals work?", answer: "Place high-res QR stickers on cake boxes. Customers scan when opening their cake box at home, instantly joining your WhatsApp VIP club." },
  { question: "What is the recommended bakery reward default?", answer: "₹500 purchase = 1 Stamp. 10 Stamps = FREE 500gm Cake (90-day validity)." }
]

export function BakeryLoyaltyClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      <FAQPageJsonLd faqs={FAQS} />
      <div className="space-y-4 text-center">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-semibold border border-amber-500/20">
          Industry Solution: Bakeries & Confectioneries
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Turn One-Time Cake Buyers into Lifetime VIP Customers</h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Automate repeat cake, pastry, and bread sales with branded cake box seal QR codes and instant WhatsApp stamp cards.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <QrCode className="w-8 h-8 text-indigo-500" />
            <h3 className="font-bold text-lg">Cake Box Seal QR</h3>
            <p className="text-xs text-muted-foreground">Printable QR stickers placed directly on cake boxes and delivery bags for home scan conversion.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Award className="w-8 h-8 text-amber-500" />
            <h3 className="font-bold text-lg">90-Day Free Cake Reward</h3>
            <p className="text-xs text-muted-foreground">Automated goal tracking: 10 stamps = FREE 500gm Birthday Cake, boosting repeat visits by 40%.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h3 className="font-bold text-lg">Google Review Bonus</h3>
            <p className="text-xs text-muted-foreground">Award +2 bonus stamps for 5-star Google reviews with photos of their birthday cakes.</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <Link href="/signup">
          <Button size="lg">
            Start 3 Days Free Trial Today <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
