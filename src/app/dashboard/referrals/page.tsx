"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, Copy, MessageCircle } from "lucide-react"

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation this would fetch from /api/merchant-referrals
    setIsLoading(false)
  }, [])

  const generateCode = async () => {
    // POST to /api/merchant-referrals
    setReferralCode("BUSINESS_XYZ")
  }

  const copyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(`customerpilot.in/r/${referralCode}`)
      alert("Copied to clipboard")
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Share2 className="h-8 w-8 text-indigo-400" />
          Refer a Business
        </h1>
        <p className="text-slate-400 mt-2">Earn credits by referring other business owners.</p>
      </div>

      <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30 shadow-xl overflow-hidden">
        <CardContent className="p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Grow Your Business Network</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-indigo-200 mb-8">
            <div className="bg-indigo-950/50 px-4 py-2 rounded-xl">1. Refer a business owner</div>
            <div className="bg-indigo-950/50 px-4 py-2 rounded-xl">2. Friend gets ₹100 benefit</div>
            <div className="bg-indigo-950/50 px-4 py-2 rounded-xl font-bold text-white border border-indigo-400/50">3. You earn ₹100 credit</div>
          </div>

          {!referralCode ? (
            <Button onClick={generateCode} className="bg-indigo-600 hover:bg-indigo-500 text-lg px-8 py-6 h-auto">
              Generate Referral Link
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-slate-900 border border-slate-700 px-6 py-4 rounded-xl flex items-center gap-4 text-xl">
                <span className="font-mono text-slate-300">customerpilot.in/r/{referralCode}</span>
                <Button variant="ghost" size="icon" onClick={copyCode} className="text-slate-400 hover:text-white">
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <Button className="bg-green-600 hover:bg-green-500 text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> Share via WhatsApp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-slate-900/60 border-slate-800/60 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-200">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400 text-center py-8">
              No referrals yet.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60">
          <CardHeader>
            <CardTitle className="text-slate-200">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="text-5xl font-bold text-emerald-400 mb-2">₹0</div>
            <div className="text-slate-400">Credit Earned</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
