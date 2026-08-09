"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Search, MapPin, Store, Star, ExternalLink, RefreshCw, Zap, ShieldCheck, Link2 } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import { BulkReplyModal } from "@/components/bulk-reply-modal"

export function GoogleBusinessIntegration({ merchantId }: { merchantId: string }) {
  const { data, refetch } = useDashboardState()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  
  const connection = data?.merchantGoogleConnections?.[0]
  const merchant = data?.merchant

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    // Allow direct URL connection
    if (searchQuery.trim().startsWith("http")) {
      const url = searchQuery.trim()
      setSearchResults([{
        placeId: "manual_url",
        name: merchant?.name || "My Google Business Profile",
        formattedAddress: url,
        isManualEntry: true
      }])
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(`/api/google-business/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { "x-merchant-id": merchantId }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to search")
      setSearchResults(json.results || [])
      if (json.results?.length === 0) {
        toast({ title: "No results", description: "Try searching with city name (e.g. 'Central Cafe Mumbai')" })
      }
    } catch (e: any) {
      toast({ title: "Search Error", description: e.message, variant: "destructive" })
    } finally {
      setIsSearching(false)
    }
  }

  const handleConnect = async (place: any) => {
    setIsConnecting(true)
    try {
      const res = await fetch("/api/google-business/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-merchant-id": merchantId },
        body: JSON.stringify({ 
          placeId: place.placeId, 
          placeName: place.name, 
          address: place.formattedAddress,
          reviewUrl: place.formattedAddress?.startsWith("http") ? place.formattedAddress : undefined
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to connect")
      
      toast({ title: "Connected!", description: json.message })
      setSearchResults([])
      setSearchQuery("")
      refetch()
    } catch (e: any) {
      toast({ title: "Connection Error", description: e.message, variant: "destructive" })
    } finally {
      setIsConnecting(false)
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Google Business Profile (GBP)
            </CardTitle>
            <CardDescription>
              Connect your Google Business Profile to auto-sync Google Reviews and enable instant AI replies.
            </CardDescription>
          </div>
          {connection && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live Connected
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {connection ? (
          <div className="p-5 border rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl">
                  <Store className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-100">
                      {(() => {
                        const rawName = connection.placeName || merchant?.name || "Connected Profile";
                        const match = rawName.match(/^[^:,;|]+/);
                        return match ? match[0].trim() : rawName;
                      })()}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                      Verified
                    </span>
                  </div>

                  <p className="text-slate-400 flex items-center gap-1 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {connection.address || "Live Location"}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                      <span className="text-slate-500 font-medium">Place ID:</span> 
                      <code className="text-emerald-400 font-mono text-[11px]">{connection.placeId || "Live API"}</code>
                    </span>

                    {(connection.googleReviewUrl || connection.address?.startsWith("http")) && (
                      <a 
                        href={connection.googleReviewUrl || connection.address} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-800/50 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Google Review Link
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                variant="destructive" 
                size="sm" 
                onClick={async () => {
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
                className="shrink-0"
              >
                Disconnect
              </Button>
            </div>
            
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Auto-Sync Active (Every 5 mins)
              </span>
              <BulkReplyModal merchantId={merchantId} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick 1-Click Connect Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={handleOAuth}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-blue-600 font-black text-[10px]">
                  G
                </div>
                <span>Sign In with Google (OAuth 2.0)</span>
              </Button>

              <Button 
                variant="outline"
                onClick={handleInstantConnect}
                className="border-emerald-600/40 hover:bg-emerald-950/30 text-emerald-400 font-semibold py-5 text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>⚡ Instant 1-Click Sandbox Connect</span>
              </Button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Or Paste Review Link</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Manual Link Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Paste Google Maps / Review Link (e.g., https://g.page/r/... or https://maps.app.goo.gl/...)" 
                  className="pl-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery} className="text-xs">
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Search className="w-3.5 h-3.5 mr-1.5" />}
                Verify & Connect
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 bg-slate-900/50 overflow-hidden">
                {searchResults.map((place) => (
                  <div key={place.placeId} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div>
                      <p className="font-semibold text-sm text-slate-200">{place.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-md">{place.formattedAddress}</p>
                    </div>
                    <Button size="sm" onClick={() => handleConnect(place)} disabled={isConnecting} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                      {isConnecting ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                      Connect Profile
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
