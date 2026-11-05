"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Receipt, Sparkles, CheckCircle2, ShieldCheck, CreditCard, Percent, FileText } from "lucide-react"

interface BillingSettings {
  itemizedBillingEnabled: boolean
  defaultGstRate: number
  gstType: "CGST_SGST" | "IGST" | "EXEMPT"
  gstin: string
  invoicePrefix: string
  terms: string
  thankYouMessage?: string
}

export function ItemizedBillingSettingsCard({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<BillingSettings>({
    itemizedBillingEnabled: false,
    defaultGstRate: 0,
    gstType: "CGST_SGST",
    gstin: "",
    invoicePrefix: "INV-",
    terms: "Thank you for shopping with us! Goods once sold will not be returned.",
    thankYouMessage: "🙏 Thank you for your visit! Please visit again.",
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        const res = await fetch("/api/billing/settings", {
          headers: { "x-merchant-id": merchantId },
        })
        const data = await res.json()
        if (data?.data?.settings) {
          setSettings(data.data.settings)
        }
      } catch (e) {
        console.error("Failed to load billing settings:", e)
      } finally {
        setLoading(false)
      }
    }
    if (merchantId) {
      loadSettings()
    }
  }, [merchantId])

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch("/api/billing/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": merchantId,
        },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to save settings")

      toast({
        title: "Billing Settings Saved",
        description: settings.itemizedBillingEnabled
          ? "Itemized WhatsApp Billing & GST Invoice Engine is now ACTIVE in LiveQueue."
          : "Itemized Billing disabled. LiveQueue will use standard Quick Amount mode.",
      })
    } catch (err: any) {
      toast({
        title: "Error Saving Settings",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <CardHeader className="p-6">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-900 rounded" />
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-md bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <CardHeader className="p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Itemized WhatsApp Billing &amp; GST POS Engine
                </CardTitle>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  100% Free Module
                </span>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Cashier item selection, discount calculation, GST tax split, and automated clean Tax Invoice PDF dispatch via WhatsApp.
              </CardDescription>
            </div>
          </div>

          {/* Master Enable/Disable Switch */}
          <div className="flex items-center gap-3 self-end sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {settings.itemizedBillingEnabled ? "Module Active" : "Module Disabled"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.itemizedBillingEnabled}
              onClick={() => setSettings(prev => ({ ...prev, itemizedBillingEnabled: !prev.itemizedBillingEnabled }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.itemizedBillingEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.itemizedBillingEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2 space-y-6">
        {/* Module Explanation Box */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Strict Loyalty-Isolation Guarantee:</strong> Jab yeh module active hoga, toh customer ke WhatsApp par bheja gaya bill <strong>100% official Tax Invoice</strong> hoga. Usme koi bhi VIP loyalty reward update ya promotional stamps ka text mix nahi hoga.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Zero Cost to Merchant:</strong> Yeh module aapke business ke liye <strong>Purna nishulk (100% Free)</strong> hai. Is switch ko enable karne ke baad LiveQueue me itemized product picker aur GST tax selector automatically open ho jayega.
            </p>
          </div>
        </div>

        {/* Configuration Fields (Visible when enabled or for setup) */}
        {settings.itemizedBillingEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
            {/* Default GST Rate */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-600" /> Default GST Rate
              </Label>
              <Select
                value={String(settings.defaultGstRate)}
                onValueChange={(val) => setSettings(prev => ({ ...prev, defaultGstRate: Number(val) }))}
              >
                <SelectTrigger className="h-10 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select GST Rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (Non-GST / Exempt)</SelectItem>
                  <SelectItem value="5">5% (2.5% CGST + 2.5% SGST)</SelectItem>
                  <SelectItem value="12">12% (6% CGST + 6% SGST)</SelectItem>
                  <SelectItem value="18">18% (9% CGST + 9% SGST)</SelectItem>
                  <SelectItem value="28">28% (14% CGST + 14% SGST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Merchant GSTIN */}
            <div className="space-y-1.5">
              <Label htmlFor="gstinInput" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> GSTIN Number <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="gstinInput"
                placeholder="e.g. 24AAAAA0000A1Z5"
                value={settings.gstin}
                onChange={(e) => setSettings(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                className="h-10 text-xs uppercase font-mono tracking-wider bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            {/* Invoice Prefix */}
            <div className="space-y-1.5">
              <Label htmlFor="invoicePrefixInput" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-600" /> Invoice Prefix
              </Label>
              <Input
                id="invoicePrefixInput"
                placeholder="e.g. INV- or CC-"
                value={settings.invoicePrefix}
                onChange={(e) => setSettings(prev => ({ ...prev, invoicePrefix: e.target.value.toUpperCase() }))}
                className="h-10 text-xs uppercase font-mono tracking-wider bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            {/* Invoice Terms & Conditions */}
            <div className="sm:col-span-3 space-y-1.5">
              <Label htmlFor="termsInput" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Invoice Footer Terms &amp; Policy (Terms &amp; Conditions)
              </Label>
              <Input
                id="termsInput"
                placeholder="e.g. Thank you for shopping with us! Goods once sold will not be returned."
                value={settings.terms}
                onChange={(e) => setSettings(prev => ({ ...prev, terms: e.target.value }))}
                className="h-10 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            {/* Custom Thank You Message */}
            <div className="sm:col-span-3 space-y-1.5">
              <Label htmlFor="thanksInput" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                WhatsApp Message Custom Thank You Note
              </Label>
              <Input
                id="thanksInput"
                placeholder="e.g. 🙏 Thank you for your visit! Please visit again."
                value={settings.thankYouMessage || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, thankYouMessage: e.target.value }))}
                className="h-10 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                💡 <strong>Auto-Title Rule:</strong> Agar GSTIN entered hai toh bill ka title automatically <strong>Tax Invoice</strong> hoga. Agar GSTIN khali hai toh automatically <strong>Invoice</strong> hoga.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 h-10 shadow-md"
          >
            {saving ? "Saving Configuration..." : "Save Billing Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
