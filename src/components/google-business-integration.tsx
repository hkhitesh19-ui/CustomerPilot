"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Search, MapPin, Store, Star, ExternalLink, RefreshCw, Zap, ShieldCheck, Link2, Sparkles } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import { BulkReplyModal } from "@/components/bulk-reply-modal"
import { GoogleReviewDelaySettings } from "@/components/google-review-delay-settings"

export function GoogleBusinessIntegration({ merchantId }: { merchantId: string }) {
  const { data, refetch } = useDashboardState()
  const { toast } = useToast()

  const [mapsUrlInput, setMapsUrlInput] = useState("")
  const [isResolving, setIsResolving] = useState(false)
  const [showUpdateBox, setShowUpdateBox] = useState(false)

  const connection = data?.merchantGoogleConnections?.[0]
  const merchant = data?.merchant

  // Suggestion 1A: Direct Google Maps Share Link Box (No Google Login Required)
  const handleAttachMapsLink = async () => {
    const raw = mapsUrlInput.trim()
    if (!raw) {
      toast({
        title: "Link Required",
        description: "Please paste your Google Maps share link (e.g. maps.app.goo.gl/...) or business name.",
        variant: "destructive"
      })
      return
    }

    setIsResolving(true)
    try {
      // 1. Resolve Maps URL or query to Place ID and verified store details
      const resolveRes = await fetch("/api/google-business/resolve-maps-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-merchant-id": merchantId },
        body: JSON.stringify({ url: raw, storeName: merchant?.name })
      })
      const resolved = await resolveRes.json().catch(() => null)

      if (!resolveRes.ok || !resolved?.data?.placeId) {
        throw new Error(resolved?.error || "Could not resolve Google Place ID from the provided link.")
      }

      const { placeId, placeName, address, googleReviewUrl } = resolved.data

      // 2. Connect and save to database
      const connectRes = await fetch("/api/google-business/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-merchant-id": merchantId },
        body: JSON.stringify({
          placeId,
          placeName,
          address,
          reviewUrl: googleReviewUrl
        }),
      })
      const connectJson = await connectRes.json().catch(() => null)
      if (!connectRes.ok) throw new Error(connectJson?.error || "Failed to attach location")

      toast({
        title: "Google Location Attached! ✅",
        description: `Connected to "${placeName}" with Place ID ${placeId.slice(0, 15)}...`
      })

      setMapsUrlInput("")
      setShowUpdateBox(false)
      refetch()
    } catch (e: any) {
      toast({
        title: "Connection Failed",
        description: e.message || "Please check the Google Maps link and try again.",
        variant: "destructive"
      })
    } finally {
      setIsResolving(false)
    }
  }

  const handleOAuth = () => {
    window.location.href = `/api/google-business/oauth?merchantId=${merchantId}`
  }

  const handleInstantConnect = () => {
    window.location.href = `/api/google-business/oauth?merchantId=${merchantId}&mode=instant`
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-slate-900 dark:text-slate-100 tracking-tight">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Star className="w-5 h-5 fill-amber-500" />
              </div>
              Google Business Profile Integration
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Connect your Google Business Profile to auto-sync reviews and generate targeted QR review standees.
            </CardDescription>
          </div>
          {connection && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live Connected
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {connection ? (
          <div className="p-5 border rounded-2xl bg-gradient-to-br from-blue-50/60 via-white to-slate-50 border-blue-200/60 dark:from-slate-900/80 dark:to-slate-950/80 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-400 rounded-xl">
                  <Store className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {(() => {
                        const rawName = connection.placeName || merchant?.name || "Connected Profile";
                        const match = rawName.match(/^[^:,;|]+/);
                        return match ? match[0].trim() : rawName;
                      })()}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/30">
                      Verified
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {connection.address || "Live Location"}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">Place ID:</span> 
                      <code className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">{connection.placeId || "Live API"}</code>
                    </span>

                    {(connection.googleReviewUrl || connection.address?.startsWith("http")) && (
                      <a 
                        href={connection.googleReviewUrl || connection.address} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/50 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Google Review Link
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowUpdateBox(!showUpdateBox)}
                  className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                >
                  <Link2 className="w-3.5 h-3.5 mr-1" />
                  {showUpdateBox ? "Hide Link Box" : "Change Maps Link"}
                </Button>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={async () => {
                    if (!confirm("Are you sure you want to disconnect this Google Business Profile?")) return
                    try {
                      await fetch(`/api/google-business/disconnect`, {
                        method: "POST",
                        headers: { "x-merchant-id": merchantId }
                      })
                      refetch()
                      toast({ title: "Disconnected", description: "Google Business Profile disconnected." })
                    } catch (e) {
                      toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" })
                    }
                  }}
                  className="text-xs"
                >
                  Disconnect
                </Button>
              </div>
            </div>

            {/* Optional Change Maps Link Drawer */}
            {showUpdateBox && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 mt-2">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Update location via direct Google Maps share URL (No Google Login required):
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Paste new Google Maps link (e.g. https://maps.app.goo.gl/...)" 
                      className="pl-9 text-xs h-9"
                      value={mapsUrlInput}
                      onChange={(e) => setMapsUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAttachMapsLink()}
                    />
                  </div>
                  <Button 
                    onClick={handleAttachMapsLink} 
                    disabled={isResolving || !mapsUrlInput} 
                    className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {isResolving ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                    Update Location
                  </Button>
                </div>
              </div>
            )}
            
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Auto-Sync Active (Every 5 mins)
              </span>
              <BulkReplyModal merchantId={merchantId} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary Recommended: Direct Google Maps Link Box */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800/60 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-200">
                      1-Click Connect via Google Maps Link (Zero Google Login Required)
                    </h4>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                      Merchant ke GBP Gmail se login kiye bina, shop ka Google Maps link paste karein. Place ID & Review Link instant auto-set ho jayega!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <Input 
                    placeholder="Paste Google Maps Share Link (e.g. https://maps.app.goo.gl/... or shop name)" 
                    className="pl-9 text-xs h-10 bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 focus:ring-emerald-500"
                    value={mapsUrlInput}
                    onChange={(e) => setMapsUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAttachMapsLink()}
                  />
                </div>
                <Button 
                  onClick={handleAttachMapsLink} 
                  disabled={isResolving || !mapsUrlInput} 
                  className="text-xs h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 shrink-0"
                >
                  {isResolving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Resolving Location...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Attach Location
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Or Connect with Google Account</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Quick 1-Click Connect Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={handleOAuth}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-blue-600 font-black text-[10px]">
                  G
                </div>
                <span>Sign In with GBP Google Account (OAuth 2.0)</span>
              </Button>

              <Button 
                variant="outline"
                onClick={handleInstantConnect}
                className="border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-4 text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>⚡ Instant Sandbox Demo Connect</span>
              </Button>
            </div>
          </div>
        )}

        {/* ── Merged Google Review Prompt Timers ── */}
        <GoogleReviewDelaySettings merchantId={merchantId} embedded={true} />
      </CardContent>
    </Card>
  )
}
