"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Sparkles, CheckCircle2, RefreshCw, Award, MessageSquare, Clock, ShieldCheck } from "lucide-react"
import { PoweredByCustomerPilot } from "@/components/powered-by-customerpilot"

function JoinContent() {
  const searchParams = useSearchParams()
  const merchantId = searchParams.get("m") || ""
  const scanSource = searchParams.get("type") || "counter_qr"

  const { toast } = useToast()
  const defaultCard = {
    name: merchantId ? decodeURIComponent(merchantId) : "Cake Connection Live Cake",
    rewardName: "FREE Special Treat / Pastry",
    stampValue: 500,
    stampsRequired: 10,
    googleReviewBonus: 1,
  }

  const [stampCard, setStampCard] = useState<any>(defaultCard)
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)

  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [joinResult, setJoinResult] = useState<any>(null)

  useEffect(() => {
    let isMounted = true

    async function loadMerchantDetails() {
      if (!merchantId) return
      try {
        const res = await fetch(`/api/cards/setup`, {
          headers: { "x-merchant-id": merchantId }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.card && isMounted) {
            setStampCard({
              ...json.card,
              name: json.card.name || decodeURIComponent(merchantId),
            })
          }
        }
      } catch (e) {
        console.error("Failed to load custom card offer", e)
      }
    }

    loadMerchantDetails()
    return () => { isMounted = false }
  }, [merchantId])

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 10) {
      toast({ title: "Valid Phone Required", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" })
      return
    }

    setJoining(true)
    try {
      const res = await fetch("/api/queue/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, scanSource })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to join queue")

      setJoinResult(json.data || json)
      toast({ title: "Joined Successfully!", description: "You are now in the merchant live queue." })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-background to-background dark:from-indigo-950/20 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header / Brand Offer */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-xs font-semibold border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Instant Digital Loyalty Card
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Collect Stamps & Earn Rewards</h1>
          <p className="text-xs text-muted-foreground">Scan. Earn Stamps. Get Free Treats on Every Visit.</p>
        </div>

        {/* Offer Banner Card */}
        {stampCard && (
          <Card className="border-2 border-indigo-500/20 bg-card shadow-md overflow-hidden relative">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">{stampCard.name || "Loyalty Reward"}</p>
                <h3 className="text-lg font-bold">{stampCard.rewardName}</h3>
              </div>
              <Award className="w-8 h-8 opacity-90" />
            </div>
            <CardContent className="p-4 text-xs space-y-2 text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Earn Threshold:</span>
                <span className="font-semibold text-foreground">₹{stampCard.stampValue || 500} = 1 Stamp</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stamps Goal:</span>
                <span className="font-semibold text-foreground">{stampCard.stampsRequired || 10} Stamps</span>
              </div>
              {stampCard.googleReviewBonus > 0 && (
                <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-medium">
                  <span>Google Review Bonus:</span>
                  <span>+{stampCard.googleReviewBonus} Extra Stamp</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Join / Status Form */}
        {!joinResult ? (
          <Card className="border-emerald-500/30 bg-card shadow-lg border-2">
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-lg flex items-center justify-center gap-2 text-emerald-800">
                <MessageSquare className="w-5 h-5 text-emerald-600" /> Join via WhatsApp (1-Click)
              </CardTitle>
              <CardDescription className="text-xs">
                No app download or form filling required. Directly opens WhatsApp!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary 1-Click WhatsApp Deep Link Button */}
              <Button
                type="button"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-base shadow-md gap-2"
                onClick={() => {
                  const phone = "919033304707"
                  const bizName = stampCard?.name || "Cake Connection"
                  const msg = `🎉 Hi ${bizName}! I want to join the VIP Club & collect my first loyalty stamp!`
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank")
                }}
              >
                <MessageSquare className="w-5 h-5 fill-white" /> Activate VIP Pass on WhatsApp 💬
              </Button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-semibold uppercase">Or Check In Manually (Laptop Demo)</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <form onSubmit={handleJoinQueue} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs">Mobile Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <Button type="submit" variant="outline" className="w-full text-xs font-semibold" disabled={joining}>
                  {joining ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Check In & Earn Stamp
                </Button>
              </form>

              <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Verified VIP Program
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Live Queue Joined Card */
          <Card className="border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl text-green-700 dark:text-green-400">You Are In Queue!</CardTitle>
              <CardDescription className="text-xs">
                Welcome, {joinResult.customerName || "Valued Customer"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="p-4 bg-background rounded-xl border flex items-center justify-around">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Position</p>
                  <p className="text-2xl font-extrabold text-indigo-600">#{joinResult.position || 1}</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
                  <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Live Waiting
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                The merchant will tap to claim your reward & award stamps upon billing!
              </p>
            </CardContent>
          </Card>
        )}

      </div>
      <PoweredByCustomerPilot />
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading Scan Landing...</div>}>
      <JoinContent />
    </Suspense>
  )
}
