"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Award, ArrowRight } from "lucide-react"

export function GoogleReviewAutomationClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <div className="space-y-4 text-center">
        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-semibold border border-yellow-500/20">
          Feature Deep-Dive: Google Business Sync
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Automate 5-Star Reviews with AI Responses</h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Incentivize happy customers to post Google reviews while Gemini AI drafts personalized merchant replies in seconds.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-2xl bg-card space-y-2">
          <Award className="w-8 h-8 text-amber-500" />
          <h3 className="font-bold text-lg">Bonus Stamp Incentive</h3>
          <p className="text-xs text-muted-foreground">Customers who post a 5-star Google review earn +1 to +2 bonus stamps on their digital card instantly.</p>
        </div>

        <div className="p-6 border rounded-2xl bg-card space-y-2">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h3 className="font-bold text-lg">Gemini AI Reply Generator</h3>
          <p className="text-xs text-muted-foreground">AI drafts polite, keyword-rich replies tailored to customer feedback for 1-click merchant approval.</p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/register">
          <Button size="lg">
            Boost Google Reviews Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
