"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, QrCode, Sparkles, ArrowRight } from "lucide-react"

export function CafeLoyaltyClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      <div className="space-y-4 text-center">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-semibold border border-amber-500/20">
          Industry Solution: Cafes & Coffee Shops
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">The Ultimate WhatsApp Coffee Punch Card</h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Replace paper punch cards with instant WhatsApp digital stamps. Customers never lose their loyalty cards again.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Coffee className="w-8 h-8 text-amber-600" />
            <h3 className="font-bold text-lg">Digital Punch Card</h3>
            <p className="text-xs text-muted-foreground">Every coffee purchase earns a stamp. Card progress is automatically delivered on WhatsApp.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <QrCode className="w-8 h-8 text-indigo-500" />
            <h3 className="font-bold text-lg">Counter Stand QR</h3>
            <p className="text-xs text-muted-foreground">Place at the espresso bar or checkout counter for lightning-fast customer check-ins.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Sparkles className="w-8 h-8 text-green-500" />
            <h3 className="font-bold text-lg">Win-Back Campaigns</h3>
            <p className="text-xs text-muted-foreground">Automatically send a 'We miss you' WhatsApp offer to coffee lovers who haven't visited in 14 days.</p>
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
