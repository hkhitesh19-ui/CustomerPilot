"use client"

import { useState, useEffect } from "react"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Store, Clock, MapPin, User, Tag, Globe, CheckCircle2 } from "lucide-react"
import { WhatsAppVerification } from "@/components/whatsapp-verification"
import { GoogleBusinessIntegration } from "@/components/google-business-integration"
import { BrandingSettings } from "@/components/branding-settings"
import { RewardSetupCard } from "@/components/reward-setup-card"
import { QRGenerator } from "@/components/qr-generator"
import { GoLiveValidator } from "@/components/go-live-validator"

export default function SettingsPage() {
  const { data, isLoading } = useDashboardState()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    businessType: "",
    address: "",
    businessTiming: "",
    category: "",
    timezone: "",
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  useEffect(() => {
    if (data?.merchant) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: data.merchant.name || "",
        ownerName: data.merchant.ownerName || "",
        businessType: data.merchant.businessType || "",
        address: data.merchant.address || "",
        businessTiming: data.merchant.businessTiming || "",
        category: data.merchant.category || "",
        timezone: data.merchant.timezone || "Asia/Kolkata",
      })
    }
  }, [data?.merchant])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("saving")
    try {
      const res = await fetch("/api/merchant/update", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-merchant-id": data?.merchant?.id || ""
        },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Failed to save")
      
      setSaveStatus("saved")
      toast({
        title: "Settings Saved",
        description: "Your business information has been updated.",
      })
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not save settings.",
        variant: "destructive",
      })
      setSaveStatus("idle")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="p-8 animate-pulse text-muted-foreground">Loading settings...</div>

  return (
    <div className="space-y-6 max-w-4xl relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10 pointer-events-none" />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Merchant Setup</h1>
        <p className="text-slate-400 mt-2">Configure your core business identity and presence.</p>
      </div>

      <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <CardHeader className="bg-slate-900/40 border-b border-slate-800/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-200">Business Information</CardTitle>
              <CardDescription className="text-slate-400">This information is publicly visible to customers on digital receipts and QR pages.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {saveStatus === "saved" && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Saved</span>}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Store className="w-4 h-4"/> Business Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="E.g., Central Cafe"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><User className="w-4 h-4"/> Owner Name</Label>
              <Input 
                value={formData.ownerName} 
                onChange={(e) => handleChange("ownerName", e.target.value)}
                placeholder="E.g., John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Tag className="w-4 h-4"/> Business Type</Label>
              <Select value={formData.businessType} onValueChange={(v) => handleChange("businessType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESTAURANT">Restaurant / Cafe</SelectItem>
                  <SelectItem value="RETAIL">Retail Store</SelectItem>
                  <SelectItem value="SALON">Salon / Spa</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Globe className="w-4 h-4"/> Category</Label>
              <Input 
                value={formData.category} 
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="E.g., Italian Cuisine, Barber Shop"
              />
            </div>
            
          </div>
        </CardContent>
      </Card>

      <WhatsAppVerification merchantId={data?.merchant?.id || ""} />
      <GoogleBusinessIntegration merchantId={data?.merchant?.id || ""} />
      <BrandingSettings merchantId={data?.merchant?.id || ""} />
      <RewardSetupCard merchantId={data?.merchant?.id || ""} />
      <QRGenerator merchantId={data?.merchant?.id || ""} />
      <GoLiveValidator merchantId={data?.merchant?.id || ""} />
    </div>
  )
}
