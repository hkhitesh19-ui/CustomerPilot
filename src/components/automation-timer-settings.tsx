"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Clock, Calendar, Bell, AlertTriangle, HeartHandshake, CheckCircle2, RotateCcw, Sparkles } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"

export function AutomationTimerSettings({ merchantId }: { merchantId: string }) {
  const { data, refetch } = useDashboardState()
  const { toast } = useToast()

  const [timers, setTimers] = useState({
    winbackDays1: 30,
    winbackDays2: 60,
    winbackDays3: 90,
    expiryWarningDays: 7,
    almostThereInactivityDays: 7,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  useEffect(() => {
    if (data?.merchant) {
      setTimers({
        winbackDays1: (data.merchant as any).winbackDays1 ?? 30,
        winbackDays2: (data.merchant as any).winbackDays2 ?? 60,
        winbackDays3: (data.merchant as any).winbackDays3 ?? 90,
        expiryWarningDays: (data.merchant as any).expiryWarningDays ?? 7,
        almostThereInactivityDays: (data.merchant as any).almostThereInactivityDays ?? 7,
      })
    }
  }, [data?.merchant])

  const handleChange = (field: keyof typeof timers, value: string) => {
    const num = parseInt(value, 10)
    setTimers((prev) => ({
      ...prev,
      [field]: isNaN(num) ? "" : num,
    }))
    setSaveStatus("idle")
  }

  const handleResetDefaults = () => {
    setTimers({
      winbackDays1: 30,
      winbackDays2: 60,
      winbackDays3: 90,
      expiryWarningDays: 7,
      almostThereInactivityDays: 7,
    })
    setSaveStatus("idle")
  }

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
        body: JSON.stringify({
          winbackDays1: Number(timers.winbackDays1) || 30,
          winbackDays2: Number(timers.winbackDays2) || 60,
          winbackDays3: Number(timers.winbackDays3) || 90,
          expiryWarningDays: Number(timers.expiryWarningDays) || 7,
          almostThereInactivityDays: Number(timers.almostThereInactivityDays) || 7,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save automation timer settings")
      }

      setSaveStatus("saved")
      toast({
        title: "Automation Timers Saved",
        description: "Your custom reminder days & schedule have been updated successfully.",
      })
      if (refetch) refetch()
    } catch (error: any) {
      toast({
        title: "Error Saving Settings",
        description: error.message,
        variant: "destructive",
      })
      setSaveStatus("idle")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Custom Automation Timers & Reminder Days</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure exactly how many days of inactivity or expiry trigger automated WhatsApp journeys
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Win-back Section */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            <span>Inactive Customer Win-Back Campaigns</span>
          </div>
          <p className="text-xs text-slate-500">
            When a customer has not visited your store, send escalating WhatsApp retention offers at these milestones:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                1st Win-back Reminder
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={timers.winbackDays1}
                  onChange={(e) => handleChange("winbackDays1", e.target.value)}
                  className="w-24 bg-white dark:bg-slate-950 font-semibold text-center"
                />
                <span className="text-xs text-slate-500">Days inactive</span>
              </div>
              <p className="text-[10px] text-slate-400">Uses template: <code className="text-indigo-600">WINBACK_30_DAY</code></p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                2nd Win-back Reminder
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={timers.winbackDays2}
                  onChange={(e) => handleChange("winbackDays2", e.target.value)}
                  className="w-24 bg-white dark:bg-slate-950 font-semibold text-center"
                />
                <span className="text-xs text-slate-500">Days inactive</span>
              </div>
              <p className="text-[10px] text-slate-400">Uses template: <code className="text-indigo-600">WINBACK_60_DAY</code></p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                3rd Win-back Reminder
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={timers.winbackDays3}
                  onChange={(e) => handleChange("winbackDays3", e.target.value)}
                  className="w-24 bg-white dark:bg-slate-950 font-semibold text-center"
                />
                <span className="text-xs text-slate-500">Days inactive</span>
              </div>
              <p className="text-[10px] text-slate-400">Uses template: <code className="text-indigo-600">WINBACK_90_DAY</code></p>
            </div>
          </div>
        </div>

        {/* Expiry & Almost There Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expiry Warning */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Card Expiry Warning Alert</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Warn customers before their accumulated stamps expire so they come back to redeem their reward.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                min="1"
                max="60"
                value={timers.expiryWarningDays}
                onChange={(e) => handleChange("expiryWarningDays", e.target.value)}
                className="w-24 bg-white dark:bg-slate-950 font-semibold text-center"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">Days before card expiry</span>
            </div>
            <p className="text-[10px] text-slate-400">Uses template: <code className="text-indigo-600">EXPIRY_WARNING_7_DAY</code></p>
          </div>

          {/* Almost There Reminder */}
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-900 dark:text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>"Almost There" (2 Stamps Left)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Trigger urgency if a customer only needs 2 more stamps for a free reward and has paused visiting.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                min="1"
                max="60"
                value={timers.almostThereInactivityDays}
                onChange={(e) => handleChange("almostThereInactivityDays", e.target.value)}
                className="w-24 bg-white dark:bg-slate-950 font-semibold text-center"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">Days inactive (when 2 stamps left)</span>
            </div>
            <p className="text-[10px] text-slate-400">Uses template: <code className="text-indigo-600">ALMOST_THERE_REMINDER</code></p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500">
            {saveStatus === "saved" ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Timers updated and active in automation engine
              </span>
            ) : (
              <span>Changes take effect on the next scheduled cron cycle</span>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            {isSaving ? "Saving Timers..." : "Save Automation Timers"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
