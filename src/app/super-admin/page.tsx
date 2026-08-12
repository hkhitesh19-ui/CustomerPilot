"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Layout, Palette, FileText, Users, CreditCard, Flag, Bell,
  Image as ImageIcon, Brain, BarChart3, Heart, Database, Download,
  Settings, Globe, Shield, Code, Zap, Crown, Store, Check, X, Search, MessageSquare, RefreshCw, RotateCcw
} from "lucide-react"
import { WhatsAppTemplateManager } from "@/components/whatsapp-template-manager"
import { SubscriptionPlansManager } from "@/components/super-admin/subscription-plans-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

// ============================================================
// CustomerPilot — Super Admin Command Center
// Enterprise-grade no-code visual operating system
// ============================================================

export default function SuperAdminPage() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const navItems = [
    { id: "dashboard", label: "Command Center", icon: BarChart3 },
    { id: "website", label: "Website Builder", icon: Layout },
    { id: "theme", label: "Theme Builder", icon: Palette },
    { id: "cms", label: "CMS / Content", icon: FileText },
    { id: "merchants", label: "Merchants", icon: Store },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { id: "features", label: "Feature Flags", icon: Flag },
    { id: "ai", label: "AI Content Studio", icon: Brain },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "templates", label: "WhatsApp Templates", icon: MessageSquare },
    { id: "media", label: "Media Library", icon: ImageIcon },
    { id: "analytics", label: "Global Analytics", icon: Globe },
    { id: "permissions", label: "Permissions", icon: Shield },
    { id: "audit", label: "Audit Log", icon: Database },
    { id: "settings", label: "System Settings", icon: Settings },
    { id: "docs", label: "Documentation", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex-shrink-0 hidden md:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src="/cplogo.png" alt="CustomerPilot" className="h-10 w-auto object-contain rounded-lg shadow-sm" />
            <div>
              <div className="font-bold text-sm text-stone-100">Super Admin</div>
              <div className="text-[11px] text-emerald-400 font-medium">Command Center</div>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === item.id ? "bg-white/10 text-white" : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-stone-200 px-6 h-16 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="font-bold text-stone-900 text-lg capitalize">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              System Healthy
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              All Systems Operational
            </Badge>
          </div>
        </header>

        <div className="p-6">
          {activeSection === "dashboard" && <CommandCenterDashboard />}
          {activeSection === "website" && <WebsiteBuilder />}
          {activeSection === "theme" && <ThemeBuilder />}
          {activeSection === "cms" && <CMSPanel />}
          {activeSection === "merchants" && <MerchantManagement />}
          {activeSection === "subscriptions" && <SubscriptionManagement />}
          {activeSection === "features" && <FeatureFlags />}
          {activeSection === "ai" && <AIContentStudio />}
          {activeSection === "notifications" && <NotificationCenter />}
          {activeSection === "templates" && <AdminTemplateManagement />}
          {activeSection === "media" && <MediaLibrary />}
          {activeSection === "analytics" && <GlobalAnalytics />}
          {activeSection === "permissions" && <PermissionBuilder />}
          {activeSection === "audit" && <AuditExplorer />}
          {activeSection === "settings" && <SystemSettings />}
          {activeSection === "docs" && <DocumentationPanel />}
        </div>
      </main>
    </div>
  )
}

// ============================================================
// Command Center Dashboard
// ============================================================
function CommandCenterDashboard() {
  const kpis = [
    { label: "Total Merchants", value: "15,247", change: "+248", color: "text-emerald-600" },
    { label: "Active Trials", value: "1,892", change: "+156", color: "text-blue-600" },
    { label: "MRR", value: "₹2.4Cr", change: "+12%", color: "text-emerald-600" },
    { label: "Queues Today", value: "847K", change: "+34%", color: "text-purple-600" },
    { label: "Rewards Today", value: "192K", change: "+28%", color: "text-amber-600" },
    { label: "Reviews Today", value: "12.4K", change: "+18%", color: "text-rose-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-stone-500">{kpi.label}</div>
                <div className="text-2xl font-bold text-stone-900 mt-1">{kpi.value}</div>
                <div className={`text-xs ${kpi.color} mt-1`}>{kpi.change} today</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Industries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Bakery", count: 4892, pct: 32 },
                { name: "Cafe", count: 3214, pct: 21 },
                { name: "Restaurant", count: 2541, pct: 17 },
                { name: "Salon", count: 1876, pct: 12 },
                { name: "Retail", count: 1421, pct: 9 },
              ].map((ind, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-24 text-sm">{ind.name}</div>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500" style={{ width: `${ind.pct}%` }} />
                  </div>
                  <div className="text-sm text-stone-500 w-12 text-right">{ind.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "API Latency", value: "42ms", status: "ok" },
                { label: "DB Connections", value: "18/100", status: "ok" },
                { label: "Cron Jobs", value: "7/7 OK", status: "ok" },
                { label: "DLQ Depth", value: "0", status: "ok" },
                { label: "WhatsApp Queue", value: "23", status: "ok" },
                { label: "Backup Status", value: "Last 3AM", status: "ok" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                  <span className="text-xs text-stone-600">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{item.value}</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================
// Website Builder
// ============================================================
function WebsiteBuilder() {
  const [heroHeadline, setHeroHeadline] = useState("Turn Every Walk-in Into a Lifetime Customer")
  const [ctaText, setCtaText] = useState("Start Free Trial")
  const [accentColor, setAccentColor] = useState("#f59e0b")

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layout className="w-4 h-4" /> Visual Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hero Headline</Label>
            <Input value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} />
          </div>
          <div>
            <Label>CTA Button Text</Label>
            <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
          </div>
          <div>
            <Label>Accent Color</Label>
            <div className="flex gap-2 mt-2">
              {["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"].map((c) => (
                <button
                  key={c}
                  onClick={() => setAccentColor(c)}
                  className={`w-8 h-8 rounded-lg ${accentColor === c ? "ring-2 ring-offset-2 ring-stone-900" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="bg-stone-900 text-white">
              <Check className="w-4 h-4 mr-1" /> Publish
            </Button>
            <Button variant="outline">Preview</Button>
            <Button variant="ghost">Rollback</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-stone-50">
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-xl p-8 border border-stone-200">
            <div className="text-2xl font-bold text-stone-900 mb-2">{heroHeadline}</div>
            <div className="text-sm text-stone-500 mb-4">Customer scans QR. You tap. Reward delivered.</div>
            <button
              className="px-6 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: accentColor }}
            >
              {ctaText}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Theme Builder
// ============================================================
function ThemeBuilder() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { name: "Primary Font", options: ["Inter", "Geist", "Poppins"], icon: FileText },
        { name: "Heading Color", options: ["#1c1917", "#0f172a", "#1e293b"], icon: Palette },
        { name: "Button Radius", options: ["8px", "12px", "16px", "24px"], icon: Zap },
        { name: "Shadow Style", options: ["Subtle", "Medium", "Dramatic"], icon: Layout },
        { name: "Card Padding", options: ["16px", "24px", "32px"], icon: Layout },
        { name: "Icon Set", options: ["Lucide", "Heroicons", "Phosphor"], icon: Crown },
      ].map((control, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <control.icon className="w-4 h-4" /> {control.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {control.options.map((opt, j) => (
                <button
                  key={j}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 hover:border-stone-900 hover:bg-stone-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================================
// CMS Panel — Modern Visual Copy Studio & Global Text Editor
// Matches Merchant Dashboard Design System
// ============================================================
function CMSPanel() {
  const [contentList, setContentList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const fetchContent = () => {
    setLoading(true)
    fetch("/api/admin/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContentList(data.content || [])
          const initialMap: Record<string, string> = {}
          data.content.forEach((item: any) => {
            initialMap[item.key] = item.value
          })
          setEditedValues(initialMap)
        }
      })
      .catch((err) => console.error("Error fetching content:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchContent()
  }, [])

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleSave = async (key: string) => {
    setSavingKey(key)
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: editedValues[key] }),
      })
      const data = await res.json()
      if (data.success) {
        triggerToast("✅ Section text updated & persisted live in database!")
        fetchContent()
      }
    } catch (err) {
      console.error("Failed to save content:", err)
    } finally {
      setSavingKey(null)
    }
  }

  const handleReset = async (key: string) => {
    setSavingKey(key)
    try {
      const res = await fetch(`/api/admin/content?key=${key}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        triggerToast("🔄 Section text reset to system default!")
        fetchContent()
      }
    } catch (err) {
      console.error("Failed to reset content:", err)
    } finally {
      setSavingKey(null)
    }
  }

  const filteredItems = contentList.filter((item) => {
    const matchesTab = activeTab === "all" || item.section === activeTab
    const matchesSearch =
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  if (loading) {
    return (
      <Card className="bg-stone-900 text-white border-stone-800">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <div className="text-sm font-medium text-stone-300">Loading Global Section Copy Studio...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-900/90 text-emerald-100 border border-emerald-500/30 px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-sm backdrop-blur-md"
        >
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white font-bold ml-4">✕</button>
        </motion.div>
      )}

      {/* Header & Controls Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📝</span>
              Global Section Copy & Text Studio
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Edit, update, and manage text copy across Merchant Onboarding Forms, Review Pages, and Marketing Landing Pages in real time.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Input
              placeholder="Search section text or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-stone-950 border-stone-800 text-stone-200 placeholder:text-stone-500 text-xs pl-9 focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800">
          {[
            { id: "all", label: "All Sections", count: contentList.length },
            { id: "onboarding", label: "📝 Merchant Setup Forms (Steps 1-5)", count: contentList.filter(i => i.section === 'onboarding').length },
            { id: "review_page", label: "📌 Customer Review Landing Page", count: contentList.filter(i => i.section === 'review_page').length },
            { id: "landing_page", label: "🌐 Public Marketing Landing Page", count: contentList.filter(i => i.section === 'landing_page').length },
            { id: "dashboard", label: "🏪 Merchant Dashboard Settings", count: contentList.filter(i => i.section === 'dashboard').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20"
                  : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200 hover:bg-stone-800/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-stone-900/20 text-stone-950" : "bg-stone-800 text-stone-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Editor Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.key} className="bg-stone-900 border-stone-800 shadow-xl flex flex-col justify-between transition-all hover:border-stone-700">
            <CardHeader className="pb-3 border-b border-stone-800/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {item.section.replace('_', ' ')} • {item.category}
                  </div>
                  <CardTitle className="text-sm font-bold text-stone-100">{item.label}</CardTitle>
                  <div className="text-[11px] font-mono text-stone-500 mt-0.5">{item.key}</div>
                </div>
                {item.isCustomized ? (
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5">
                    Customized
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-stone-500 border-stone-800 text-[10px] px-2 py-0.5">
                    Default
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1">
              <div>
                <Label className="text-xs text-stone-400 mb-1.5 block font-medium">Editable Content Text</Label>
                {item.value.length > 50 ? (
                  <textarea
                    rows={3}
                    value={editedValues[item.key] ?? item.value}
                    onChange={(e) => setEditedValues({ ...editedValues, [item.key]: e.target.value })}
                    className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
                  />
                ) : (
                  <Input
                    value={editedValues[item.key] ?? item.value}
                    onChange={(e) => setEditedValues({ ...editedValues, [item.key]: e.target.value })}
                    className="bg-stone-950 border-stone-800 text-stone-100 text-xs font-medium focus:border-emerald-500"
                  />
                )}
              </div>

              {/* Live Render Preview Box */}
              <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Live Visual Render Preview</div>
                <div className="text-xs text-stone-200 font-sans italic bg-stone-900/60 p-2 rounded border border-stone-800/40">
                  "{editedValues[item.key] ?? item.value}"
                </div>
              </div>
            </CardContent>

            <div className="p-4 pt-0 border-t border-stone-800/40 flex items-center justify-between mt-auto">
              <Button
                size="sm"
                variant="ghost"
                disabled={!item.isCustomized || savingKey === item.key}
                onClick={() => handleReset(item.key)}
                className="text-xs text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 px-3"
              >
                Reset Default
              </Button>
              <Button
                size="sm"
                disabled={savingKey === item.key || editedValues[item.key] === item.value}
                onClick={() => handleSave(item.key)}
                className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs px-4 shadow-lg shadow-emerald-500/20"
              >
                {savingKey === item.key ? "Saving..." : "Save & Update Live"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Merchant Management (Live Database Integration + SuperAdmin Overrides)
// ============================================================
function MerchantManagement() {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const loadMerchants = () => {
    fetch("/api/admin/merchants")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMerchants(data.merchants || [])
        }
      })
      .catch((err) => console.error("Error fetching admin merchants:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMerchants()
  }, [])

  const handleOpenEdit = (m: any) => {
    setSelectedMerchant(m)
    let cats = ["VIP", "Silver", "Gold", "Platinum", "Diamond", "Royal", "Elite", "Prestige", "Ambassador", "Legend"]
    if (m.loyaltyCategoryNames) {
      try {
        const parsed = JSON.parse(m.loyaltyCategoryNames)
        if (Array.isArray(parsed) && parsed.length >= 10) cats = parsed
      } catch {}
    }
    setEditForm({
      vipUpgradeBonusStamps: m.vipUpgradeBonusStamps ?? 1,
      googleReviewBonus: m.stampCard?.googleReviewBonus ?? 1,
      photoBonus: m.stampCard?.photoBonus ?? 2,
      stampValue: m.stampCard?.stampValue ?? 450,
      stampsRequired: m.stampCard?.stampsRequired ?? 9,
      validityDays: m.stampCard?.validityDays ?? 100,
      rewardName: m.stampCard?.rewardName || "FREE 500gm Cake",
      categories: cats
    })
  }

  const handleSaveMerchantRules = async () => {
    if (!selectedMerchant) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      await fetch("/api/merchant/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": selectedMerchant.id
        },
        body: JSON.stringify({
          vipUpgradeBonusStamps: Number(editForm.vipUpgradeBonusStamps),
          loyaltyCategoryNames: JSON.stringify(editForm.categories)
        })
      })

      await fetch("/api/cards/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": selectedMerchant.id
        },
        body: JSON.stringify({
          id: selectedMerchant.stampCard?.id,
          name: selectedMerchant.stampCard?.name || "Loyalty Stamp Card",
          rewardName: editForm.rewardName,
          stampsRequired: Number(editForm.stampsRequired),
          stampValue: Number(editForm.stampValue),
          validityDays: Number(editForm.validityDays),
          googleReviewBonus: Number(editForm.googleReviewBonus),
          photoBonus: Number(editForm.photoBonus)
        })
      })

      setSaveSuccess(true)
      loadMerchants()
      setTimeout(() => {
        setSaveSuccess(false)
        setSelectedMerchant(null)
      }, 1200)
    } catch (e: any) {
      alert("Error saving rules: " + (e?.message || e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-stone-500">
          <div className="animate-spin w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full mx-auto mb-2" />
          Loading real merchant database...
        </CardContent>
      </Card>
    )
  }

  if (merchants.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-stone-500">
          No registered merchants found in database.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left p-4 text-xs font-medium text-stone-500 uppercase">Merchant</th>
                  <th className="text-left p-4 text-xs font-medium text-stone-500 uppercase">Owner & WhatsApp</th>
                  <th className="text-left p-4 text-xs font-medium text-stone-500 uppercase">Plan</th>
                  <th className="text-left p-4 text-xs font-medium text-stone-500 uppercase">Review Delay</th>
                  <th className="text-left p-4 text-xs font-medium text-stone-500 uppercase">Status</th>
                  <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">Customers</th>
                  <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">Bills</th>
                  <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">MRR</th>
                  <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">SuperAdmin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {merchants.map((m: any, i: number) => (
                  <tr key={m.id || i} className="hover:bg-stone-50">
                    <td className="p-4 font-medium text-sm text-stone-900">
                      {m.name}
                      <div className="text-[11px] text-stone-400 font-normal">ID: {m.id}</div>
                    </td>
                    <td className="p-4 text-sm text-stone-600">
                      <div>{m.ownerName}</div>
                      <div className="text-xs text-stone-400">{m.whatsappPhone}</div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-stone-700">{m.plan}</td>
                    <td className="p-4 text-sm text-stone-600 font-mono">{m.googleReviewDelayMinutes ?? 30} mins</td>
                    <td className="p-4">
                      <Badge variant="outline" className={
                        m.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        m.status === "Trial" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-rose-50 text-rose-700 border-rose-200"
                      }>{m.status}</Badge>
                    </td>
                    <td className="p-4 text-right text-sm font-medium">{m.customers}</td>
                    <td className="p-4 text-right text-sm text-stone-600">{m.bills}</td>
                    <td className="p-4 text-right text-sm font-medium text-emerald-600">₹{m.mrr.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(m)}>
                        ⚙️ Edit Rules
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(`/dashboard`, '_blank')}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SuperAdmin Rule Override Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  👑 SuperAdmin Rule Override — {selectedMerchant.name}
                </h3>
                <p className="text-xs text-stone-500">Modify Reward Rules, Bonus Stamps, and 10-Level Loyalty Cycle Categories for this merchant.</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedMerchant(null)}>✕</Button>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4" /> All merchant rules updated successfully in Database!
              </div>
            )}

            {/* Step 5 Rules */}
            <div className="space-y-4">
              <h4 className="font-semibold text-stone-800 text-sm border-b pb-1">🎁 Step 5: Reward Card & Bonus Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-stone-600">Reward Description</Label>
                  <Input
                    value={editForm.rewardName}
                    onChange={(e) => setEditForm({ ...editForm, rewardName: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-stone-600">Min Purchase / Stamp (₹)</Label>
                  <Input
                    type="number"
                    value={editForm.stampValue}
                    onChange={(e) => setEditForm({ ...editForm, stampValue: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-stone-600">Stamp Goal (Stamps)</Label>
                  <Input
                    type="number"
                    value={editForm.stampsRequired}
                    onChange={(e) => setEditForm({ ...editForm, stampsRequired: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-stone-600">Google Review Bonus Stamps</Label>
                  <Input
                    type="number"
                    value={editForm.googleReviewBonus}
                    onChange={(e) => setEditForm({ ...editForm, googleReviewBonus: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-stone-600">Photo Review Bonus Stamps</Label>
                  <Input
                    type="number"
                    value={editForm.photoBonus}
                    onChange={(e) => setEditForm({ ...editForm, photoBonus: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-stone-600">VIP Upgrade Bonus Stamps</Label>
                  <Input
                    type="number"
                    value={editForm.vipUpgradeBonusStamps}
                    onChange={(e) => setEditForm({ ...editForm, vipUpgradeBonusStamps: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Step 6 Rules */}
            <div className="space-y-4">
              <h4 className="font-semibold text-stone-800 text-sm border-b pb-1">👑 Step 6: 10-Level Loyalty Cycle Category Titles</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {editForm.categories?.map((cat: string, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <Label className="text-[11px] text-amber-700 font-semibold">Level {idx + 1}</Label>
                    <Input
                      value={cat}
                      onChange={(e) => {
                        const copy = [...editForm.categories]
                        copy[idx] = e.target.value
                        setEditForm({ ...editForm, categories: copy })
                      }}
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
              <Button variant="outline" onClick={() => setSelectedMerchant(null)}>Cancel</Button>
              <Button onClick={handleSaveMerchantRules} disabled={saving} className="bg-stone-900 text-white hover:bg-stone-800">
                {saving ? "Saving to DB..." : "💾 Save Merchant Rules (SuperAdmin)"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Subscription Management
// ============================================================
function SubscriptionManagement() {
  return <SubscriptionPlansManager />
}

// ============================================================
// Feature Flags
// ============================================================
function FeatureFlags() {
  const [flags, setFlags] = useState({
    queue: true,
    reviewEngine: true,
    birthdayEngine: true,
    vipTiers: true,
    aiInsights: false,
    multiBranch: false,
    webSocket: false,
    smartDisplay: false,
  })

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Object.entries(flags).map(([key, value]) => (
        <Card key={key}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
              <div className="text-xs text-stone-500">
                {value ? "Enabled globally" : "Disabled globally"}
              </div>
            </div>
            <Switch
              checked={value}
              onCheckedChange={(v) => setFlags({ ...flags, [key]: v })}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================================
// AI Content Studio
// ============================================================
function AIContentStudio() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4" /> AI Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { type: "Marketing Emails", desc: "Generate campaign emails for merchants" },
            { type: "WhatsApp Templates", desc: "Create new message templates" },
            { type: "Blog Posts", desc: "SEO-optimized content generation" },
            { type: "Landing Pages", desc: "Auto-generate from brief" },
            { type: "Social Media Posts", desc: "Instagram, Facebook, Twitter" },
            { type: "Ad Copy", desc: "Google Ads, Meta Ads" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
              <div>
                <div className="font-medium text-sm">{item.type}</div>
                <div className="text-xs text-stone-500">{item.desc}</div>
              </div>
              <Button size="sm" variant="outline">Generate</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Translation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-stone-500">1-click translate all content to:</p>
            {["Hindi", "Gujarati", "Marathi", "Tamil", "Telugu", "Bengali", "English"].map((lang, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-stone-200">
                <span className="text-sm">{lang}</span>
                <Button size="sm" variant="ghost">Translate</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Notification Center
// ============================================================
function NotificationCenter() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { channel: "Email", sent: 45230, delivered: 44980, rate: "99.4%" },
          { channel: "WhatsApp", sent: 892140, delivered: 887230, rate: "99.4%" },
          { channel: "Push", sent: 12450, delivered: 11890, rate: "95.5%" },
        ].map((ch, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="font-medium text-sm mb-2">{ch.channel}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-stone-500">Sent</span><span>{ch.sent.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Delivered</span><span>{ch.delivered.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Rate</span><span className="text-emerald-600 font-medium">{ch.rate}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Media Library
// ============================================================
function MediaLibrary() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-stone-400" />
        </div>
      ))}
      <div className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-stone-900">
        <Download className="w-6 h-6 text-stone-400" />
        <span className="text-xs text-stone-500 mt-1">Upload</span>
      </div>
    </div>
  )
}

// ============================================================
// Global Analytics
// ============================================================
function GlobalAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-stone-500">Top City</div>
            <div className="text-2xl font-bold mt-1">Mumbai</div>
            <div className="text-xs text-stone-400">3,247 merchants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-stone-500">Avg Claims/Merchant</div>
            <div className="text-2xl font-bold mt-1">847/day</div>
            <div className="text-xs text-emerald-600">+12% vs last week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-stone-500">Churn Rate</div>
            <div className="text-2xl font-bold mt-1">2.1%</div>
            <div className="text-xs text-emerald-600">-0.3% vs last month</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================
// Permission Builder
// ============================================================
function PermissionBuilder() {
  const roles = ["Owner", "Manager", "Cashier", "Support Agent", "Super Admin"]
  const permissions = [
    "View Dashboard", "Create Bills", "Void Bills", "Approve Referrals",
    "Manage Staff", "View Audit Log", "Manage Settings", "Owner Override",
    "Export Data", "Manage Subscriptions",
  ]

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b">
              <tr>
                <th className="text-left p-4 text-xs font-medium text-stone-500 uppercase">Permission</th>
                {roles.map((r) => (
                  <th key={r} className="text-center p-4 text-xs font-medium text-stone-500 uppercase">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {permissions.map((p, i) => (
                <tr key={i} className="hover:bg-stone-50">
                  <td className="p-4 text-sm">{p}</td>
                  {roles.map((r, j) => (
                    <td key={j} className="text-center p-4">
                      <input type="checkbox" defaultChecked={j <= 2 || (j === 4 && i < 8)} className="w-4 h-4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Audit Explorer
// ============================================================
function AuditExplorer() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          {[
            { action: "WEBSITE_PUBLISHED", actor: "admin@customerpilot.io", time: "2 min ago" },
            { action: "FEATURE_FLAG_TOGGLED", actor: "admin@customerpilot.io", time: "15 min ago" },
            { action: "MERCHANT_SUSPENDED", actor: "support@customerpilot.io", time: "1 hour ago" },
            { action: "THEME_UPDATED", actor: "admin@customerpilot.io", time: "3 hours ago" },
            { action: "CMS_PAGE_PUBLISHED", actor: "content@customerpilot.io", time: "5 hours ago" },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-[10px]">{log.action}</Badge>
                <span className="text-sm text-stone-600">{log.actor}</span>
              </div>
              <span className="text-xs text-stone-400">{log.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// System Settings
// ============================================================
function SystemSettings() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-sm text-stone-500">Node Version</span><span className="text-sm font-medium">v24.11.0</span></div>
          <div className="flex justify-between"><span className="text-sm text-stone-500">Database</span><span className="text-sm font-medium">PostgreSQL 16</span></div>
          <div className="flex justify-between"><span className="text-sm text-stone-500">Redis Cache</span><span className="text-sm font-medium">v7.2</span></div>
          <div className="flex justify-between"><span className="text-sm text-stone-500">CDN</span><span className="text-sm font-medium">Cloudflare</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup & Recovery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-sm text-stone-500">Last Backup</span><span className="text-sm font-medium">3:00 AM today</span></div>
          <div className="flex justify-between"><span className="text-sm text-stone-500">Backup Size</span><span className="text-sm font-medium">2.4 GB</span></div>
          <div className="flex justify-between"><span className="text-sm text-stone-500">RPO</span><span className="text-sm font-medium">24 hours</span></div>
          <div className="flex justify-between"><span className="text-sm text-stone-500">RTO</span><span className="text-sm font-medium">4 hours</span></div>
          <Button size="sm" variant="outline" className="mt-2">Trigger Manual Backup</Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Documentation Panel (moved from Merchant Dashboard)
// Contains: Developer Manual, Production Policies, Enterprise Hardening, V6.5 Roadmap
// ============================================================
function DocumentationPanel() {
  const docs = [
    {
      title: "Developer Manual",
      desc: "17 chapters — API endpoints, DB models, state machines, cron jobs. For developers building integrations.",
      chapters: 17,
      icon: Code,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Production Policies",
      desc: "12 policies — Rule migration, VIP eligibility, review lifecycle, campaign priority, fraud detection, customer merge, ownership transfer, and more.",
      chapters: 12,
      icon: Shield,
      color: "bg-rose-100 text-rose-700",
    },
    {
      title: "Enterprise Hardening",
      desc: "12 points — Idempotency, distributed locking, cron DLQ, multi-device sessions, WhatsApp failure, backup/DR, API versioning, feature licensing.",
      chapters: 12,
      icon: Shield,
      color: "bg-amber-100 text-amber-700",
    },
    {
      title: "V6.5 / V7 Roadmap",
      desc: "15 items — Reservation heartbeat, customer cancel, queue capacity, scan spam protection, multi-branch, WebSocket sync, AI queue assistant, smart counter display.",
      chapters: 15,
      icon: Flag,
      color: "bg-purple-100 text-purple-700",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Internal Documentation.</strong> These documents are for the CustomerPilot team (developers, ops, QA).
          They have been moved out of the Merchant Dashboard to keep it clean and business-focused.
          Merchants only see the "Help & Guide" tab.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {docs.map((doc, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${doc.color} flex items-center justify-center flex-shrink-0`}>
                  <doc.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-900 mb-1">{doc.title}</h3>
                  <p className="text-sm text-stone-500 mb-3">{doc.desc}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{doc.chapters} chapters</Badge>
                    <Button size="sm" variant="outline">View Document</Button>
                    <Button size="sm" variant="ghost">Download PDF</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Super Admin WhatsApp Template Management Control Center
// ============================================================
function AdminTemplateManagement() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadAdminTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/templates")
      const result = await res.json()
      if (result.success) {
        setData(result)
      }
    } catch (e) {
      console.error("Error loading admin templates:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminTemplates()
  }, [])

  const handleResetMerchant = async (merchantId: string, templateKey: string) => {
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, templateKey }),
      })
      if (res.ok) {
        loadAdminTemplates()
      }
    } catch (e) {
      console.error("Failed to reset merchant override:", e)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-stone-500">
          <div className="animate-spin w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full mx-auto mb-2" />
          Loading system default templates & merchant overrides...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">System Default Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">{data?.systemDefaults?.length || 0} Base Templates</div>
            <p className="text-xs text-stone-500 mt-1">Global baselines used if no custom override exists</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">Merchant Custom Overrides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{data?.overridesCount || 0} Overrides</div>
            <p className="text-xs text-stone-500 mt-1">Active merchant personalized journey templates</p>
          </CardContent>
        </Card>
      </div>

      <WhatsAppTemplateManager merchantId="system" />

      <Card className="bg-white border-stone-200 mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Active Merchant Custom Overrides
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.merchantOverrides || data.merchantOverrides.length === 0 ? (
            <div className="text-center p-6 text-stone-400 text-sm">
              No merchant custom overrides saved yet. All merchants are using System Default journey templates.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200 text-left text-xs text-stone-500 uppercase font-medium">
                  <tr>
                    <th className="p-3">Merchant</th>
                    <th className="p-3">Template Key</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Custom Wording Preview</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                  {data.merchantOverrides.map((ov: any) => (
                    <tr key={ov.id} className="hover:bg-stone-50">
                      <td className="p-3 font-semibold text-stone-900">
                        {ov.merchant?.name || ov.merchantId}
                        <div className="text-[10px] text-stone-400 font-normal">{ov.merchant?.ownerName}</div>
                      </td>
                      <td className="p-3 font-mono text-emerald-700">{ov.templateKey}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          v{ov.version}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-stone-600 max-w-md truncate">{ov.messageBody}</td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetMerchant(ov.merchantId, ov.templateKey)}
                          className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" /> Force Reset
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

