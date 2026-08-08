"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function ComparePOSClient() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <div className="space-y-4 text-center">
        <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-semibold border border-blue-500/20">
          Comparison
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">CustomerPilot vs. Traditional POS Loyalty</h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Why 80% of merchants prefer a zero-hardware, WhatsApp-first retention system over complex POS software.
        </p>
      </div>

      <div className="border rounded-2xl bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b text-xs uppercase text-muted-foreground font-bold">
            <tr>
              <th className="p-4">Feature</th>
              <th className="p-4 text-indigo-600">CustomerPilot</th>
              <th className="p-4">Traditional POS Add-on</th>
            </tr>
          </thead>
          <tbody className="divide-y text-xs">
            <tr>
              <td className="p-4 font-semibold">POS Integration Required</td>
              <td className="p-4 font-bold text-green-600">No (Works with any POS/UPI)</td>
              <td className="p-4 text-red-500">Yes (Requires expensive upgrades)</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">Customer App Download</td>
              <td className="p-4 font-bold text-green-600">No (100% WhatsApp Native)</td>
              <td className="p-4 text-red-500">Yes (High drop-off rate)</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">Cashier Interaction Time</td>
              <td className="p-4 font-bold text-green-600">5 Seconds (Tap-to-Claim)</td>
              <td className="p-4 text-red-500">45-60 Seconds (Manual Entry)</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold">Google Review Automation</td>
              <td className="p-4 font-bold text-green-600">Included (Gemini AI Replies)</td>
              <td className="p-4 text-red-500">Not Available</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center pt-4">
        <Link href="/register">
          <Button size="lg">
            Switch to CustomerPilot <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
