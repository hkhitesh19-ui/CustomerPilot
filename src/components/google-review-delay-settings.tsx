"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Clock, CheckCircle2, Star, Sparkles } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"

export const DELAY_OPTIONS = [
  { label: "Immediately", value: 0 },
  { label: "5 Minutes", value: 5 },
  { label: "15 Minutes", value: 15 },
  { label: "30 Minutes", value: 30 },
  { label: "45 Minutes", value: 45 },
  { label: "1 Hour", value: 60 },
  { label: "2 Hours", value: 120 },
  { label: "3 Hours", value: 180 },
  { label: "4 Hours", value: 240 },
  { label: "6 Hours", value: 360 },
  { label: "8 Hours", value: 480 },
  { label: "12 Hours", value: 720 },
  { label: "24 Hours", value: 1440 },
]

export function GoogleReviewDelaySettings({ merchantId, embedded = false }: { merchantId: string; embedded?: boolean }) {
  const { data, refetch } = useDashboardState()
  const { toast } = useToast()

  const [delayMinutes, setDelayMinutes] = useState<number>(30)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  useEffect(() => {
    if (data?.merchant?.googleReviewDelayMinutes !== undefined) {
      setDelayMinutes(data.merchant.googleReviewDelayMinutes)
    }
  }, [data?.merchant?.googleReviewDelayMinutes])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("saving")
    try {
      const res = await fetch("/api/merchant/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": merchantId || data?.merchant?.id || "",
        },
        body: JSON.stringify({ googleReviewDelayMinutes: delayMinutes }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save review delay setting")
      }

      setSaveStatus("saved")
      toast({
        title: "Google Review Delay Updated",
        description: `WhatsApp review request timer set to ${
          DELAY_OPTIONS.find((o) => o.value === delayMinutes)?.label || `${delayMinutes} mins`
        } after purchase approval.`,
      })
      refetch()
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (err: any) {
      toast({
        title: "Error Saving Setting",
        description: err.message || "Could not update Google Review delay.",
        variant: "destructive",
      })
      setSaveStatus("idle")
    } finally {
      setIsSaving(false)
    }
  }

  if (embedded) {
    return (
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Google Review Prompt Timers
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Choose how long CustomerPilot should wait before automatically sending the Google Review request on WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            When should the Google Review WhatsApp message be sent after purchase approval?
          </Label>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Select
              value={String(delayMinutes)}
              onValueChange={(val) => setDelayMinutes(Number(val))}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full sm:w-80 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-10 focus:ring-emerald-500/20 text-xs">
                <SelectValue placeholder="Select review delay" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-72">
                {DELAY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)} className="focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white cursor-pointer text-xs">
                    {opt.label} {opt.value === 30 ? "(Recommended Default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 h-10"
            >
              {isSaving ? (
                "Saving..."
              ) : saveStatus === "saved" ? (
                <span className="flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </span>
              ) : (
                "Save Timer"
              )}
            </Button>
          </div>

          <div className="text-[11px] text-slate-500">
            Internal storage: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{delayMinutes}</span> minutes delay
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/60 border-amber-500/20 dark:border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Star className="w-24 h-24 text-amber-400" />
      </div>

      <CardHeader className="bg-amber-50/40 dark:bg-slate-900/40 border-b border-amber-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Google Review Prompt Timers
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-0.5">
              Choose how long CustomerPilot should wait before automatically sending the Google Review request.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            When should the Google Review WhatsApp message be sent after purchase approval?
          </Label>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every business type has a different ideal review request timing (e.g., Restaurants: 15–30 mins, Salons: 1–3 hrs, Spas/Clinics: 4–24 hrs).
          </p>

          <Select
            value={String(delayMinutes)}
            onValueChange={(val) => setDelayMinutes(Number(val))}
            disabled={isSaving}
          >
            <SelectTrigger className="w-full bg-white dark:bg-slate-950/60 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-11 focus:ring-emerald-500/20">
              <SelectValue placeholder="Select review delay" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-72">
              {DELAY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)} className="focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white cursor-pointer">
                  {opt.label} {opt.value === 30 ? "(Recommended Default)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/40">
          <div className="text-xs text-slate-500">
            Internal storage: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{delayMinutes}</span> minutes
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/20 min-w-[120px]"
          >
            {isSaving ? (
              "Saving..."
            ) : saveStatus === "saved" ? (
              <span className="flex items-center gap-1.5 text-white">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            ) : (
              "Save Setting"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
