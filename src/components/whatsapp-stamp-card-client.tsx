"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function WhatsAppStampCardClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <div className="space-y-4 text-center">
        <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-semibold border border-green-500/20">
          Feature Deep-Dive: WhatsApp Pipeline
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">The 100% App-Free WhatsApp Stamp Card</h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          No apps to download. No passwords to remember. Instant mobile check-in via WhatsApp.
        </p>
      </div>

      <div className="space-y-6 border p-6 rounded-2xl bg-card">
        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-600 font-bold text-lg">1</div>
          <div>
            <h3 className="font-bold text-lg">Customer Scans Store QR</h3>
            <p className="text-xs text-muted-foreground mt-1">Available on counter stands, dining tables, window posters, packaging stickers, and cake box seals.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-600 font-bold text-lg">2</div>
          <div>
            <h3 className="font-bold text-lg">Instant Registration & Queue Check-in</h3>
            <p className="text-xs text-muted-foreground mt-1">WhatsApp opens automatically with an opt-in message. Customer enters the merchant's live queue in &lt;5 seconds.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600 font-bold text-lg">3</div>
          <div>
            <h3 className="font-bold text-lg">5-Second Tap-to-Claim Billing</h3>
            <p className="text-xs text-muted-foreground mt-1">Cashiers tap the customer name on their mobile or tablet screen. Stamps and reward progress are instantly sent to the customer's WhatsApp.</p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/register">
          <Button size="lg">
            Try WhatsApp Stamp Cards Free <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
