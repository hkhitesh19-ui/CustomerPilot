"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scissors, Sparkles, Award, ArrowRight } from "lucide-react"

export function SalonLoyaltyClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      <div className="space-y-4 text-center">
        <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-semibold border border-purple-500/20">
          Industry Solution: Salons, Spas & Beauty Clinics
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Build a High-Value VIP Club for Your Salon</h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Reward haircut, styling, and spa clients with automated WhatsApp rewards and VIP tiers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Scissors className="w-8 h-8 text-purple-500" />
            <h3 className="font-bold text-lg">Service Stamp Cards</h3>
            <p className="text-xs text-muted-foreground">Collect stamps on haircuts, spa treatments, and hair color services for free luxury upgrades.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Award className="w-8 h-8 text-amber-500" />
            <h3 className="font-bold text-lg">VIP Tier Upgrades</h3>
            <p className="text-xs text-muted-foreground">Silver, Gold, and Platinum members earn double stamps on premium treatment packages.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            <h3 className="font-bold text-lg">Birthday Special Treats</h3>
            <p className="text-xs text-muted-foreground">Automated WhatsApp greetings offering a 20% discount on birthday pampering sessions.</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <Link href="/register">
          <Button size="lg">
            Start 14-Day Salon Trial <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
