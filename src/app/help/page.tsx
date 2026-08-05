"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, MessageSquare, Award, BookOpen } from "lucide-react"

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Help Center & Knowledge Base</h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Everything you need to launch and scale your merchant VIP club.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <QrCode className="w-6 h-6 text-indigo-500" />
            <h3 className="font-bold">Printing & Positioning QR Codes</h3>
            <p className="text-xs text-muted-foreground">Best practices for printing counter stands, table standees, and cake box seals.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <MessageSquare className="w-6 h-6 text-green-500" />
            <h3 className="font-bold">WhatsApp Verification & Evolution Setup</h3>
            <p className="text-xs text-muted-foreground">Connecting your merchant phone number for automated WhatsApp notifications.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h3 className="font-bold">Configuring Reward Cards & Stamps</h3>
            <p className="text-xs text-muted-foreground">Setting purchase thresholds, reward descriptions, and Google review bonus stamps.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-2">
            <BookOpen className="w-6 h-6 text-purple-500" />
            <h3 className="font-bold">Cashier 5-Second Claim Tutorial</h3>
            <p className="text-xs text-muted-foreground">Training cashiers to quickly tap and confirm customer stamps during checkout.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
