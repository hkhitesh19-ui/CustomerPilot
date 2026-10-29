"use client"

import { useState, useEffect } from "react"
import {
  ShieldAlert, Sparkles, Navigation, CheckCircle2, Copy, Check,
  ExternalLink, ChevronRight, Flame, Target, MessageSquare,
  Clock, Share2, Award, AlertCircle, ArrowUpRight, Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RedressalDossier {
  competitorName: string
  googleMapsTitle: string
  actualStorefrontName: string
  mapsUrl: string
  violationType: string
  impactOnRank: string
  suggestedAction: string
  prefilledFormFields: {
    businessNameCausingHarm: string
    businessAddress: string
    publicUrl: string
    issueDescriptionEnglish: string
    issueDescriptionHinglish: string
  }
}

interface Gbp10DaySprintProps {
  merchantId: string
  merchantName: string
  currentRank?: number
  targetRank?: number
  locality?: string
}

export function Gbp10DaySprint({
  merchantId,
  merchantName,
  currentRank = 10,
  targetRank = 3,
  locality = "Eva The Mall, Manjalpur, Vadodara",
}: Gbp10DaySprintProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "lever1" | "lever2" | "lever3" | "lever4">("overview")
  const [dossiers, setDossiers] = useState<RedressalDossier[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [filedComplaints, setFiledComplaints] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [broadcastLoading, setBroadcastLoading] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDossiers() {
      try {
        const res = await fetch(`/api/gbp/redressal-dossier?merchantId=${merchantId}`)
        const data = await res.json()
        if (data.ok && data.data?.dossiers) {
          setDossiers(data.data.dossiers)
        }
      } catch (e) {
        console.error("Failed to load redressal dossiers:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchDossiers()
  }, [merchantId])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const toggleComplaintFiled = (compName: string) => {
    setFiledComplaints(prev => ({
      ...prev,
      [compName]: !prev[compName]
    }))
  }

  const handleTriggerDirectionsBroadcast = async () => {
    setBroadcastLoading(true)
    setBroadcastMessage(null)
    try {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(merchantName + ", " + locality)}`
      const res = await fetch("/api/gbp/map-traffic-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          offerText: "Eva The Mall store visit karke cake taste karein ya pick karein aur flat 10% off paayein!",
          mapsProfileUrl: mapsUrl,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setBroadcastMessage("✅ Map Directions Broadcast successfully queued for recent customers (Throttled safe send).")
      } else {
        setBroadcastMessage(`⚠️ Note: ${data.error || "Unable to queue broadcast"}`)
      }
    } catch (e) {
      setBroadcastMessage("Error connecting to broadcast API")
    } finally {
      setBroadcastLoading(false)
    }
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    merchantName + ", " + locality
  )}`

  return (
    <Card className="bg-slate-900/90 border-indigo-500/30 overflow-hidden shadow-2xl shadow-indigo-950/40">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-900/50 to-slate-900 border-b border-indigo-500/20 p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-2.5 py-0.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                10-DAY WAR SPRINT
              </Badge>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                Rank #{currentRank} ➔ Target: Top #{targetRank}
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              10-Day Local Top 3 Acceleration Plan
            </h2>
            <p className="text-xs md:text-sm text-slate-300">
              Aggressive 4-Lever algorithm assault to push {merchantName} into Google Maps Local 3-Pack in 10 Days.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-indigo-500/30">
            <Target className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Sprint Target</div>
              <div className="text-sm font-extrabold text-emerald-400">Day 1 of 10 Active</div>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mt-5">
          <Button
            size="sm"
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "bg-indigo-600 hover:bg-indigo-700 text-white font-bold" : "border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"}
          >
            📋 10-Day Timeline
          </Button>
          <Button
            size="sm"
            variant={activeTab === "lever1" ? "default" : "outline"}
            onClick={() => setActiveTab("lever1")}
            className={activeTab === "lever1" ? "bg-red-600 hover:bg-red-700 text-white font-bold" : "border-red-900/50 text-red-300 hover:bg-red-950/50 text-xs"}
          >
            ⚡ Lever 1: Competitor Purge (Atul & TCR)
          </Button>
          <Button
            size="sm"
            variant={activeTab === "lever2" ? "default" : "outline"}
            onClick={() => setActiveTab("lever2")}
            className={activeTab === "lever2" ? "bg-amber-600 hover:bg-amber-700 text-white font-bold" : "border-amber-900/50 text-amber-300 hover:bg-amber-950/50 text-xs"}
          >
            ⭐ Lever 2: Photo Reviews (35-50)
          </Button>
          <Button
            size="sm"
            variant={activeTab === "lever3" ? "default" : "outline"}
            onClick={() => setActiveTab("lever3")}
            className={activeTab === "lever3" ? "bg-blue-600 hover:bg-blue-700 text-white font-bold" : "border-blue-900/50 text-blue-300 hover:bg-blue-950/50 text-xs"}
          >
            📍 Lever 3: Directions CTR
          </Button>
          <Button
            size="sm"
            variant={activeTab === "lever4" ? "default" : "outline"}
            onClick={() => setActiveTab("lever4")}
            className={activeTab === "lever4" ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold" : "border-emerald-900/50 text-emerald-300 hover:bg-emerald-950/50 text-xs"}
          >
            ✅ Lever 4: Profile Saturation
          </Button>
        </div>
      </div>

      <CardContent className="p-5 space-y-6">
        {/* TAB 1: OVERVIEW & 10-DAY SPRINT TIMELINE */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 border border-red-500/30 p-3.5 rounded-xl">
                <div className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> LEVER 1
                </div>
                <div className="text-white font-bold text-sm mt-1">Competitor Redressal</div>
                <div className="text-slate-400 text-xs mt-0.5">Spam keywords stripped from Atul Bakery & The Chocolate Room (Day 1-5)</div>
              </div>

              <div className="bg-slate-950/60 border border-amber-500/30 p-3.5 rounded-xl">
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> LEVER 2
                </div>
                <div className="text-white font-bold text-sm mt-1">Review Velocity</div>
                <div className="text-slate-400 text-xs mt-0.5">35-50 fresh real cake photo reviews via WhatsApp Bonus Stamp (Day 1-10)</div>
              </div>

              <div className="bg-slate-950/60 border border-blue-500/30 p-3.5 rounded-xl">
                <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" /> LEVER 3
                </div>
                <div className="text-white font-bold text-sm mt-1">Local Directions CTR</div>
                <div className="text-slate-400 text-xs mt-0.5">50+ Google Maps direction requests from local users visiting Eva Mall (Day 3-8)</div>
              </div>

              <div className="bg-slate-950/60 border border-emerald-500/30 p-3.5 rounded-xl">
                <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> LEVER 4
                </div>
                <div className="text-white font-bold text-sm mt-1">Profile Saturation</div>
                <div className="text-slate-400 text-xs mt-0.5">20 cake catalog items, 4 categories, attributes, and 3 weekly posts (Day 1)</div>
              </div>
            </div>

            {/* Daily Execution Timeline Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 font-bold text-sm text-white flex items-center justify-between">
                <span>10-Day Step-by-Step Tactical Roadmap</span>
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px]">
                  Daily Sprints
                </Badge>
              </div>

              <div className="divide-y divide-slate-800/60 text-xs">
                {[
                  {
                    day: "Day 1 (Today)",
                    action: "Submit Google Business Redressal complaints against Atul Bakery & The Chocolate Room + Complete Profile Saturation",
                    owner: "Operator + Field Boy",
                    status: "ACTIVE / IN PROGRESS",
                    statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
                  },
                  {
                    day: "Day 2",
                    action: "Trigger WhatsApp Loyalty Bonus Stamp campaign to past 200 customers (Honest Review with photo = 1 Bonus Stamp)",
                    owner: "CustomerPilot Auto Engine",
                    status: "READY TO LAUNCH",
                    statusColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
                  },
                  {
                    day: "Day 3",
                    action: "First SEO Google Post live (Artisanal Chocolate Truffle at Eva The Mall) + Sync 20 Products catalog",
                    owner: "Weekly 3-Post Engine",
                    status: "SCHEDULED",
                    statusColor: "text-slate-400 bg-slate-800 border-slate-700",
                  },
                  {
                    day: "Day 4 - 5",
                    action: "Collect first 15-20 photo reviews. AI Owner Replies posted within 60 mins injecting 'Manjalpur' & 'Eva Mall' landmarks",
                    owner: "AI Review Auto-Reply",
                    status: "SCHEDULED",
                    statusColor: "text-slate-400 bg-slate-800 border-slate-700",
                  },
                  {
                    day: "Day 6 - 7",
                    action: "Broadcast 'Get Directions to Eva Mall Store & Claim 10% Off' link via WhatsApp (50+ real Maps direction signals)",
                    owner: "CustomerPilot Map Traffic",
                    status: "SCHEDULED",
                    statusColor: "text-slate-400 bg-slate-800 border-slate-700",
                  },
                  {
                    day: "Day 8",
                    action: "Google spam redressal takes effect: Atul Bakery & TCR lose keyword stuffing. Organic rank jumps #10 ➔ #5/#6",
                    owner: "Google Team Verification",
                    status: "PENDING REDRESSAL",
                    statusColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
                  },
                  {
                    day: "Day 9",
                    action: "Publish Weekend Offer Post on GBP ('WEEKENDVIP') + review count hits 35+ with high keyword density",
                    owner: "CustomerPilot Engine",
                    status: "SCHEDULED",
                    statusColor: "text-slate-400 bg-slate-800 border-slate-700",
                  },
                  {
                    day: "Day 10",
                    action: "Re-run 100-Point Diagnostic Audit & Local 3-Pack Verification on live Google Places API. Confirm Top 3 entry!",
                    owner: "CustomerPilot Audit Engine",
                    status: "FINAL AUDIT",
                    statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                  },
                ].map((row, idx) => (
                  <div key={idx} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-slate-900/40">
                    <div className="flex items-start gap-3">
                      <span className="font-extrabold text-white w-28 shrink-0">{row.day}</span>
                      <span className="text-slate-300 leading-relaxed">{row.action}</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto pl-31 md:pl-0">
                      <span className="text-[11px] text-slate-500">{row.owner}</span>
                      <Badge className={`text-[10px] border px-2 py-0.5 font-bold ${row.statusColor}`}>
                        {row.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEVER 1 - COMPETITOR REDRESSAL PURGE */}
        {activeTab === "lever1" && (
          <div className="space-y-5">
            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-red-400 font-extrabold text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Google Business Redressal Complaint Dossiers (Ready to Submit)
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Atul Bakery aur The Chocolate Room fake keywords ke sahare Top 5 me baithe hain. Inka redressal submit karne se 3-5 din me inka spam hatega aur Cake Connection automatically upar jump karega.
                </p>
              </div>
              <Button
                asChild
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0"
              >
                <a
                  href="https://support.google.com/business/contact/business_redressal_form"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  Open Google Redressal Form <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dossiers.map((dossier, i) => {
                const isFiled = filedComplaints[dossier.competitorName]
                return (
                  <Card key={i} className="bg-slate-950/80 border-slate-800 overflow-hidden">
                    <CardHeader className="bg-slate-900/60 pb-3 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                          #{i + 1}: {dossier.competitorName}
                        </CardTitle>
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px]">
                          {dossier.violationType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3.5 text-xs">
                      <div>
                        <div className="text-slate-400 font-semibold text-[11px]">Maps Stuffed Title:</div>
                        <div className="text-red-300 font-mono text-[11px] bg-red-950/30 p-2 rounded border border-red-900/40 mt-1">
                          "{dossier.googleMapsTitle}"
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 font-semibold text-[11px]">Actual Signboard Reads:</div>
                        <div className="text-emerald-400 font-bold bg-emerald-950/20 p-2 rounded border border-emerald-900/40 mt-1">
                          "{dossier.actualStorefrontName}"
                        </div>
                      </div>

                      <div className="text-slate-300 text-[11px]">
                        <strong>Impact:</strong> {dossier.impactOnRank}
                      </div>

                      {/* Prefilled Form Content */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="text-slate-400 font-bold text-[11px]">Prefilled Redressal Complaint Text:</div>
                        
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                          {dossier.prefilledFormFields.issueDescriptionEnglish}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => copyToClipboard(dossier.prefilledFormFields.issueDescriptionEnglish, `en-${i}`)}
                            className="w-full text-xs font-semibold flex items-center justify-center gap-1.5"
                          >
                            {copiedKey === `en-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === `en-${i}` ? "Copied English Text!" : "Copy English Text"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(dossier.prefilledFormFields.issueDescriptionHinglish, `hi-${i}`)}
                            className="w-full text-xs border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-1.5"
                          >
                            {copiedKey === `hi-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === `hi-${i}` ? "Copied Hindi!" : "Copy Hindi Text"}
                          </Button>
                        </div>
                      </div>

                      {/* Complaint Status Checkbox */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!isFiled}
                            onChange={() => toggleComplaintFiled(dossier.competitorName)}
                            className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span className={`text-xs font-semibold ${isFiled ? "text-emerald-400" : "text-slate-400"}`}>
                            {isFiled ? "✅ Redressal Submitted to Google" : "Mark as Submitted by Operator"}
                          </span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: LEVER 2 - REVIEW VELOCITY & KEYWORD-PHOTO INJECTION */}
        {activeTab === "lever2" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium">Sprint Target Reviews</div>
                <div className="text-2xl font-black text-amber-400 mt-1">35 - 50</div>
                <div className="text-[11px] text-slate-500 mt-0.5">3-5 fresh photo reviews/day</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium">Loyalty Incentive</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">+1 Bonus Stamp</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Auto-credited per verified photo review</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium">Policy Guardrail</div>
                <div className="text-2xl font-black text-blue-400 mt-1">Zero-Ban Safe</div>
                <div className="text-[11px] text-slate-500 mt-0.5">No 5-star gating, 'HELP' fallback included</div>
              </div>
            </div>

            {/* Target Keywords Injection Grid */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Target Keywords to Inject into Customer Reviews & AI Auto-Replies:
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Best live cake in Manjalpur",
                  "Fresh chocolate truffle cake near Eva Mall",
                  "Customized birthday cake delivery in Vadodara",
                  "Eggless fresh fruit cake Manjalpur",
                  "Live bakery counter Vadodara",
                  "Cake Connection Eva Mall",
                ].map((kw, i) => (
                  <Badge key={i} className="bg-indigo-950/60 text-indigo-300 border-indigo-700/50 text-xs px-3 py-1 font-semibold">
                    🔑 {kw}
                  </Badge>
                ))}
              </div>
            </div>

            {/* WhatsApp Campaign Preview */}
            <Card className="bg-slate-950/90 border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Live WhatsApp Review Campaign Message Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="bg-emerald-950/20 border border-emerald-900/50 p-3.5 rounded-xl text-emerald-200 font-sans leading-relaxed whitespace-pre-line">
                  {`Hi {Customer Name} ❤️

Hope you loved your visit to *Cake Connection (Eva The Mall, Manjalpur)*! 🎂✨

Share your honest Google review with a cake photo to unlock a 🎁 *Bonus Loyalty Stamp* on your VIP Card! Reply *YES* to get your 1-Click link.

Order me koi dikkat thi? Yahan *HELP* likh kar reply karein taaki maalik aapse seedha baat kar sakein.`}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Engine: <strong>CustomerPilot Zero-Ban Loyalty Review Dispatcher</strong></span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    Active & Automated ✅
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: LEVER 3 - LOCAL CTR & DIRECTIONS */}
        {activeTab === "lever3" && (
          <div className="space-y-5">
            <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4 space-y-2">
              <h3 className="text-blue-400 font-extrabold text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Google Maps Directions Click-Through Signal Generator
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Google local algorithm ranks businesses heavily based on how many people search and click <strong>"Directions"</strong> to visit the physical store. We trigger this by sending an in-store tasting invite to past customers with a 1-click direction link to Eva The Mall.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="text-slate-400 font-semibold">Live Google Maps Directions URL:</div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-blue-300 font-mono text-[11px] break-all">
                {directionsUrl}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    Test Google Maps Directions Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(directionsUrl, "dir-url")}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  {copiedKey === "dir-url" ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedKey === "dir-url" ? "Copied!" : "Copy Directions Link"}
                </Button>
              </div>
            </div>

            {/* Broadcast Trigger */}
            <Card className="bg-slate-950/90 border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Weekend Map Traffic Broadcast (Throttled 50/hour)</span>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">
                    Track B Feature
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="text-slate-300 leading-relaxed">
                  Broadcasts an in-store tasting & discount invite to past customers with the direct Google Maps Directions link. Automatically throttled to 50 WhatsApp messages per hour to protect WhatsApp health.
                </div>

                {broadcastMessage && (
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs">
                    {broadcastMessage}
                  </div>
                )}

                <Button
                  onClick={handleTriggerDirectionsBroadcast}
                  disabled={broadcastLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  {broadcastLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  {broadcastLoading ? "Queueing Broadcast..." : "Queue Weekend Map Directions Broadcast"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: LEVER 4 - PROFILE SATURATION */}
        {activeTab === "lever4" && (
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
              <h3 className="text-emerald-400 font-extrabold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                GBP Core Profile Saturation Checklist (Immediate 30 Mins)
              </h3>
              <p className="text-slate-300 mt-1">
                Ensures 100% algorithm density across categories, products catalog, and hidden AEO voice search attributes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  title: "1. Primary & Secondary Categories",
                  detail: "Primary: Bakery | Secondary: Cake Shop, Pastry Shop, Dessert Shop, Wedding Bakery",
                  status: "Configured ✅",
                  badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                },
                {
                  title: "2. 20-Item Products Catalog",
                  detail: "Belgian Truffle, Dutch Almond, Red Velvet, Fresh Fruit with photo, price & WhatsApp order link",
                  status: "Synced & Live ✅",
                  badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                },
                {
                  title: "3. Hidden AEO Voice Attributes",
                  detail: "Delivery: YES | Takeaway: YES | Wheelchair Accessible: YES | Same-Day Delivery: YES | UPI: YES",
                  status: "Toggled ON ✅",
                  badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                },
                {
                  title: "4. Advance Weekly 3-Post Engine",
                  detail: "Tue: Product Spotlight | Thu: Social Proof Review | Sat: Weekend 15% VIP Deal",
                  status: "Active & Queued ✅",
                  badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                },
              ].map((item, i) => (
                <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{item.title}</span>
                    <Badge className={`text-[10px] border px-2 py-0.5 ${item.badgeColor}`}>{item.status}</Badge>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
