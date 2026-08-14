"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Layout, Palette, FileText, Users, CreditCard, Flag, Bell,
  Image as ImageIcon, Brain, BarChart3, Heart, Database, Download,
  Settings, Globe, Shield, Code, Zap, Crown, Store, Check, X, Search,
  MessageSquare, RefreshCw, RotateCcw, Activity, Server, Cpu, Sparkles,
  Layers, ArrowUpRight, Lock, CheckCircle2, ChevronRight
} from "lucide-react"
import { WhatsAppTemplateManager } from "@/components/whatsapp-template-manager"
import { SubscriptionPlansManager } from "@/components/super-admin/subscription-plans-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// ============================================================
// CustomerPilot V6.5 — Super Admin Command Center
// Enterprise-Grade Dark Glassmorphism Command Operations System
// ============================================================

export default function SuperAdminPage() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const navCategories = [
    {
      title: "CORE OPERATIONS",
      items: [
        { id: "dashboard", label: "Command Center", icon: BarChart3, badge: "LIVE" },
        { id: "merchants", label: "Merchants Fleet", icon: Store },
        { id: "subscriptions", label: "Subscriptions & Pricing", icon: CreditCard },
        { id: "analytics", label: "Global Intelligence", icon: Globe },
      ]
    },
    {
      title: "PLATFORM & CMS",
      items: [
        { id: "website", label: "Website Studio", icon: Layout },
        { id: "theme", label: "Design System", icon: Palette },
        { id: "cms", label: "Global Copy Studio", icon: FileText },
        { id: "ai", label: "AI Generator Studio", icon: Brain },
        { id: "media", label: "Media Asset Vault", icon: ImageIcon },
      ]
    },
    {
      title: "SYSTEM CONTROL",
      items: [
        { id: "features", label: "Feature Toggles", icon: Flag },
        { id: "templates", label: "WhatsApp Engine", icon: MessageSquare },
        { id: "notifications", label: "Notification Channels", icon: Bell },
        { id: "permissions", label: "RBAC Matrix", icon: Shield },
        { id: "audit", label: "Security Audit Log", icon: Database },
        { id: "settings", label: "System Health & DR", icon: Settings },
        { id: "docs", label: "Architecture Docs", icon: Code },
      ]
    }
  ]

  const allItems = navCategories.flatMap(c => c.items)
  const currentNav = allItems.find(item => item.id === activeSection)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sleek Dark Glassmorphism Sidebar */}
      <aside className="w-72 bg-slate-900/80 border-r border-slate-800/80 backdrop-blur-2xl flex-shrink-0 hidden lg:flex flex-col justify-between sticky top-0 h-screen z-20">
        <div>
          {/* SuperAdmin Brand Header */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="/cplogo.png" alt="CustomerPilot" className="h-10 w-auto object-contain rounded-xl shadow-lg border border-slate-700/50 p-1 bg-slate-900" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  Super Admin
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    V6.5
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1 mt-0.5">
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400" /> Executive Command
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items Grouped */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            {navCategories.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-extrabold tracking-wider uppercase text-slate-500 mb-2">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/40"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          isActive ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-300">Cluster Node #1</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">42ms Latency</span>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 min-h-screen">
        {/* Top Floating Glass Header */}
        <header className="bg-slate-900/80 border-b border-slate-800/80 px-6 h-16 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3">
            {currentNav && <currentNav.icon className="w-5 h-5 text-indigo-400" />}
            <h1 className="font-extrabold text-white text-lg tracking-tight">
              {currentNav?.label || "Command Center"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>System Health: <strong className="text-emerald-400">100% Operational</strong></span>
            </div>
            <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              V6.5 Enterprise Active
            </Badge>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

// ============================================================
// Command Center Dashboard Component
// ============================================================
function CommandCenterDashboard() {
  const kpis = [
    { label: "Total Merchants Fleet", value: "15,247", change: "+248", color: "from-emerald-500 to-teal-600", textColor: "text-emerald-400" },
    { label: "Active Free Trials", value: "1,892", change: "+156", color: "from-blue-500 to-indigo-600", textColor: "text-blue-400" },
    { label: "Monthly Recurring Revenue", value: "₹2.4Cr", change: "+12%", color: "from-purple-500 to-indigo-600", textColor: "text-purple-400" },
    { label: "Live Queues Today", value: "847K", change: "+34%", color: "from-amber-500 to-orange-600", textColor: "text-amber-400" },
    { label: "Rewards Unlocked", value: "192K", change: "+28%", color: "from-rose-500 to-pink-600", textColor: "text-rose-400" },
    { label: "Google Reviews Generated", value: "12.4K", change: "+18%", color: "from-cyan-500 to-blue-600", textColor: "text-cyan-400" },
  ]

  return (
    <div className="space-y-6">
      {/* 6 High-Impact Glass KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all duration-300 shadow-xl">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.color}`} />
            <CardContent className="p-4">
              <div className="text-[11px] font-semibold text-slate-400 tracking-tight">{kpi.label}</div>
              <div className="text-2xl font-black text-white mt-1.5 tracking-tight">{kpi.value}</div>
              <div className={`text-xs font-bold ${kpi.textColor} mt-1 flex items-center gap-1`}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                {kpi.change} <span className="text-[10px] text-slate-500 font-normal">today</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Industry Market Share Chart */}
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-slate-800/60 pb-4">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-400" /> Active Industry Share Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { name: "Bakery & Confectionery 🥐", count: 4892, pct: 32, gradient: "from-amber-500 to-orange-500" },
                { name: "Cafes & Coffee Shops ☕", count: 3214, pct: 21, gradient: "from-indigo-500 to-purple-500" },
                { name: "Restaurants & Dining 🍔", count: 2541, pct: 17, gradient: "from-emerald-500 to-teal-500" },
                { name: "Salons & Wellness ✂️", count: 1876, pct: 12, gradient: "from-pink-500 to-rose-500" },
                { name: "Retail & Fashion Outlets 🛍️", count: 1421, pct: 9, gradient: "from-blue-500 to-cyan-500" },
              ].map((ind, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{ind.name}</span>
                    <span className="text-slate-400">{ind.count} Merchants ({ind.pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className={`h-full bg-gradient-to-r ${ind.gradient} rounded-full transition-all duration-500`} style={{ width: `${ind.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Cluster Matrix */}
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-slate-800/60 pb-4">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" /> Infrastructure Node Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "API Latency", value: "42ms", status: "Healthy" },
                { label: "DB Connection Pool", value: "18/100 Active", status: "Healthy" },
                { label: "Cron Automation Runners", value: "7/7 Jobs OK", status: "Healthy" },
                { label: "DLQ Error Depth", value: "0 Failed", status: "Healthy" },
                { label: "WhatsApp Gateway Queue", value: "23 Pending", status: "Healthy" },
                { label: "Automated DB Backup", value: "Passed (3:00 AM)", status: "Healthy" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-white">{item.value}</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {item.status}
                    </span>
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
// Website Builder Component
// ============================================================
function WebsiteBuilder() {
  const [heroHeadline, setHeroHeadline] = useState("Turn Every Walk-in Into a Lifetime Customer")
  const [ctaText, setCtaText] = useState("Start Free Trial")
  const [accentColor, setAccentColor] = useState("#6366f1")

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-slate-800/60">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Layout className="w-4 h-4 text-indigo-400" /> Marketing Visual Copy Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="text-xs text-slate-300 font-semibold mb-1.5 block">Hero Headline</Label>
            <Input value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} className="bg-slate-950 border-slate-800 text-white text-xs" />
          </div>
          <div>
            <Label className="text-xs text-slate-300 font-semibold mb-1.5 block">CTA Button Text</Label>
            <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="bg-slate-950 border-slate-800 text-white text-xs" />
          </div>
          <div>
            <Label className="text-xs text-slate-300 font-semibold mb-1.5 block">Accent Theme Color</Label>
            <div className="flex gap-2.5 mt-2">
              {["#6366f1", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"].map((c) => (
                <button
                  key={c}
                  onClick={() => setAccentColor(c)}
                  className={`w-9 h-9 rounded-xl transition-all ${accentColor === c ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : "opacity-80 hover:opacity-100"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-800/60">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
              <Check className="w-4 h-4 mr-1.5" /> Publish Live To Web
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">Preview</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-950 border-slate-800/80 shadow-xl">
        <CardHeader className="border-b border-slate-800/60">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" /> Real-time Live Render Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-8 border border-slate-800/80 space-y-4 shadow-2xl">
            <div className="text-2xl font-black text-white tracking-tight leading-tight">{heroHeadline}</div>
            <div className="text-xs text-slate-400 leading-relaxed">Customer scans QR. Staff awards stamp. Repeat visits automated via WhatsApp AI.</div>
            <button
              className="px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all"
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
// Theme Builder Component
// ============================================================
function ThemeBuilder() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { name: "Primary Font", options: ["Inter", "Geist", "Poppins"], icon: FileText },
        { name: "Heading Theme", options: ["Slate Dark", "Obsidian Glass", "Indigo Night"], icon: Palette },
        { name: "Button Radius", options: ["8px", "12px", "16px", "24px"], icon: Zap },
        { name: "Shadow Style", options: ["Subtle Glow", "Medium Ambient", "Dramatic 3D"], icon: Layout },
        { name: "Container Spacing", options: ["16px Compact", "24px Balanced", "32px Spacing"], icon: Layout },
        { name: "Icon System", options: ["Lucide React", "Heroicons V2", "Phosphor Dark"], icon: Crown },
      ].map((control, i) => (
        <Card key={i} className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-slate-800/60 pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <control.icon className="w-4 h-4 text-indigo-400" /> {control.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {control.options.map((opt, j) => (
                <button
                  key={j}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-white transition-all"
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
// CMS Panel Component
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
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <div className="text-sm font-medium text-slate-300">Loading Global Section Copy Studio...</div>
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
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📝</span>
              Global Section Copy & Text Studio
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Edit, update, and manage text copy across Merchant Onboarding Forms, Review Pages, and Marketing Landing Pages in real time.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Input
              placeholder="Search section text or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 text-xs pl-9 focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-slate-900/20 text-slate-950" : "bg-slate-800 text-slate-400"
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
          <Card key={item.key} className="bg-slate-900/80 border-slate-800/80 shadow-xl flex flex-col justify-between transition-all hover:border-slate-700">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {item.section.replace('_', ' ')} • {item.category}
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-100">{item.label}</CardTitle>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{item.key}</div>
                </div>
                {item.isCustomized ? (
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5">
                    Customized
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-500 border-slate-800 text-[10px] px-2 py-0.5">
                    Default
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1">
              <div>
                <Label className="text-xs text-slate-400 mb-1.5 block font-medium">Editable Content Text</Label>
                {item.value.length > 50 ? (
                  <textarea
                    rows={3}
                    value={editedValues[item.key] ?? item.value}
                    onChange={(e) => setEditedValues({ ...editedValues, [item.key]: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
                  />
                ) : (
                  <Input
                    value={editedValues[item.key] ?? item.value}
                    onChange={(e) => setEditedValues({ ...editedValues, [item.key]: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs font-medium focus:border-emerald-500"
                  />
                )}
              </div>

              {/* Live Render Preview Box */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Live Visual Render Preview</div>
                <div className="text-xs text-slate-200 font-sans italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                  "{editedValues[item.key] ?? item.value}"
                </div>
              </div>
            </CardContent>

            <div className="p-4 pt-0 border-t border-slate-800/40 flex items-center justify-between mt-auto">
              <Button
                size="sm"
                variant="ghost"
                disabled={!item.isCustomized || savingKey === item.key}
                onClick={() => handleReset(item.key)}
                className="text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 px-3"
              >
                Reset Default
              </Button>
              <Button
                size="sm"
                disabled={savingKey === item.key || editedValues[item.key] === item.value}
                onClick={() => handleSave(item.key)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 shadow-lg shadow-emerald-500/20"
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
// Merchant Management Component
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
      <Card className="bg-slate-900/80 border-slate-800 text-white">
        <CardContent className="p-12 text-center text-slate-400">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
          Loading real merchant database...
        </CardContent>
      </Card>
    )
  }

  if (merchants.length === 0) {
    return (
      <Card className="bg-slate-900/80 border-slate-800 text-white">
        <CardContent className="p-12 text-center text-slate-400">
          No registered merchants found in database.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-950 border-b border-slate-800/80">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase">Merchant</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase">Owner & WhatsApp</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase">Plan</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase">Review Delay</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="text-right p-4 text-xs font-bold text-slate-400 uppercase">Customers</th>
                  <th className="text-right p-4 text-xs font-bold text-slate-400 uppercase">Bills</th>
                  <th className="text-right p-4 text-xs font-bold text-slate-400 uppercase">MRR</th>
                  <th className="text-right p-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {merchants.map((m: any, i: number) => (
                  <tr key={m.id || i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {m.name}
                      <div className="text-[11px] text-slate-500 font-mono">ID: {m.id}</div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div>{m.ownerName}</div>
                      <div className="text-xs text-slate-400 font-mono">{m.whatsappPhone}</div>
                    </td>
                    <td className="p-4 font-extrabold text-indigo-400">{m.plan}</td>
                    <td className="p-4 text-slate-300 font-mono text-xs">{m.googleReviewDelayMinutes ?? 30} mins</td>
                    <td className="p-4">
                      <Badge variant="outline" className={
                        m.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                        m.status === "Trial" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                        "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }>{m.status}</Badge>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-200">{m.customers}</td>
                    <td className="p-4 text-right text-slate-400">{m.bills}</td>
                    <td className="p-4 text-right font-extrabold text-emerald-400">₹{m.mrr.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button size="sm" onClick={() => handleOpenEdit(m)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md">
                        ⚙️ Edit Rules
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  👑 SuperAdmin Rule Override — {selectedMerchant.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Modify Reward Rules, Bonus Stamps, and 10-Level Loyalty Cycle Categories for this merchant.</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedMerchant(null)} className="text-slate-400 hover:text-white">✕</Button>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> All merchant rules updated successfully in Database!
              </div>
            )}

            {/* Reward Card Rules */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">🎁 Reward Card & Bonus Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-slate-400">Reward Description</Label>
                  <Input
                    value={editForm.rewardName}
                    onChange={(e) => setEditForm({ ...editForm, rewardName: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Min Purchase / Stamp (₹)</Label>
                  <Input
                    type="number"
                    value={editForm.stampValue}
                    onChange={(e) => setEditForm({ ...editForm, stampValue: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Stamp Goal (Stamps)</Label>
                  <Input
                    type="number"
                    value={editForm.stampsRequired}
                    onChange={(e) => setEditForm({ ...editForm, stampsRequired: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Google Review Bonus Stamps</Label>
                  <Input
                    type="number"
                    value={editForm.googleReviewBonus}
                    onChange={(e) => setEditForm({ ...editForm, googleReviewBonus: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Photo Review Bonus Stamps</Label>
                  <Input
                    type="number"
                    value={editForm.photoBonus}
                    onChange={(e) => setEditForm({ ...editForm, photoBonus: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Next Level Kickstart Stamps</Label>
                  <Input
                    type="number"
                    value={editForm.vipUpgradeBonusStamps}
                    onChange={(e) => setEditForm({ ...editForm, vipUpgradeBonusStamps: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Loyalty Cycle Categories */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">👑 10-Level Loyalty Cycle Category Titles</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {editForm.categories?.map((cat: string, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <Label className="text-[11px] text-amber-400 font-extrabold">Level {idx + 1}</Label>
                    <Input
                      value={cat}
                      onChange={(e) => {
                        const copy = [...editForm.categories]
                        copy[idx] = e.target.value
                        setEditForm({ ...editForm, categories: copy })
                      }}
                      className="bg-slate-950 border-slate-800 text-white text-xs font-semibold"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="outline" onClick={() => setSelectedMerchant(null)} className="border-slate-700 text-slate-300">Cancel</Button>
              <Button onClick={handleSaveMerchantRules} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg">
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
// Subscription Management Component
// ============================================================
function SubscriptionManagement() {
  return <SubscriptionPlansManager />
}

// ============================================================
// Feature Flags Component
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
        <Card key={key} className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="font-extrabold text-sm text-white capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {value ? "Active & enabled for all merchants" : "Disabled globally in feature gates"}
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
// AI Content Studio Component
// ============================================================
function AIContentStudio() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-slate-800/60">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" /> AI Content Generation Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {[
            { type: "Marketing Email Campaigns", desc: "Generate campaign emails for merchants" },
            { type: "WhatsApp Journey Templates", desc: "Create new engagement templates" },
            { type: "SEO Blog Posts & Guides", desc: "SEO-optimized content generation" },
            { type: "Landing Page Copy", desc: "Auto-generate from industry brief" },
            { type: "Social Media Posts", desc: "Instagram, Facebook, Twitter copy" },
            { type: "Performance Ad Copy", desc: "Google Ads, Meta Ads" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div>
                <div className="font-bold text-sm text-white">{item.type}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
              </div>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">Generate</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-slate-800/60">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" /> Multi-Language AI Translation Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <p className="text-xs text-slate-400">1-click translate all customer-facing templates to regional languages:</p>
            {["Hindi (हिंदी)", "Gujarati (ગુજરાતી)", "Marathi (मराठी)", "Tamil (தமிழ்)", "Telugu (తెలుగు)", "Bengali (বাংলা)", "English"].map((lang, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-xs font-bold text-slate-200">{lang}</span>
                <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-white hover:bg-indigo-600/20 text-xs font-semibold">Translate</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Notification Center Component
// ============================================================
function NotificationCenter() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { channel: "Email Broadcasts", sent: 45230, delivered: 44980, rate: "99.4%" },
          { channel: "WhatsApp Evolution Gateway", sent: 892140, delivered: 887230, rate: "99.4%" },
          { channel: "Push Notifications", sent: 12450, delivered: 11890, rate: "95.5%" },
        ].map((ch, i) => (
          <Card key={i} className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-5">
              <div className="font-extrabold text-sm text-white mb-3">{ch.channel}</div>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between"><span className="text-slate-400">Total Sent</span><span className="text-slate-200">{ch.sent.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Delivered</span><span className="text-slate-200">{ch.delivered.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Delivery Rate</span><span className="text-emerald-400 font-extrabold">{ch.rate}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Media Library Component
// ============================================================
function MediaLibrary() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-center shadow-lg group hover:border-indigo-500/50 transition-all">
          <ImageIcon className="w-8 h-8 text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </div>
      ))}
      <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all">
        <Download className="w-6 h-6 text-indigo-400" />
        <span className="text-xs font-bold text-slate-400 mt-2">Upload Asset</span>
      </div>
    </div>
  )
}

// ============================================================
// Global Analytics Component
// ============================================================
function GlobalAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <div className="text-xs font-semibold text-slate-400">Top Performing City</div>
            <div className="text-3xl font-black text-white mt-1">Mumbai</div>
            <div className="text-xs text-indigo-400 mt-1 font-semibold">3,247 active merchants</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <div className="text-xs font-semibold text-slate-400">Avg Claims / Merchant</div>
            <div className="text-3xl font-black text-white mt-1">847/day</div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold">+12% vs last week</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <div className="text-xs font-semibold text-slate-400">Platform Churn Rate</div>
            <div className="text-3xl font-black text-white mt-1">2.1%</div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold">-0.3% vs last month</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================
// Permission Builder Component
// ============================================================
function PermissionBuilder() {
  const roles = ["Owner", "Manager", "Cashier", "Support Agent", "Super Admin"]
  const permissions = [
    "View Dashboard", "Create Bills", "Void Bills", "Approve Referrals",
    "Manage Staff", "View Audit Log", "Manage Settings", "Owner Override",
    "Export Data", "Manage Subscriptions",
  ]

  return (
    <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-2xl">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase">Permission Matrix</th>
                {roles.map((r) => (
                  <th key={r} className="text-center p-4 text-xs font-bold text-slate-400 uppercase">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {permissions.map((p, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-semibold text-slate-200">{p}</td>
                  {roles.map((r, j) => (
                    <td key={j} className="text-center p-4">
                      <input type="checkbox" defaultChecked={j <= 2 || (j === 4 && i < 8)} className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500" />
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
// Audit Explorer Component
// ============================================================
function AuditExplorer() {
  return (
    <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-2xl">
      <CardContent className="p-6">
        <div className="space-y-3">
          {[
            { action: "WEBSITE_PUBLISHED", actor: "admin@customerpilot.io", time: "2 min ago" },
            { action: "FEATURE_FLAG_TOGGLED", actor: "admin@customerpilot.io", time: "15 min ago" },
            { action: "MERCHANT_SUSPENDED", actor: "support@customerpilot.io", time: "1 hour ago" },
            { action: "THEME_UPDATED", actor: "admin@customerpilot.io", time: "3 hours ago" },
            { action: "CMS_PAGE_PUBLISHED", actor: "content@customerpilot.io", time: "5 hours ago" },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-[10px] bg-slate-900 text-indigo-300 border-indigo-500/30">{log.action}</Badge>
                <span className="text-xs font-semibold text-slate-300">{log.actor}</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">{log.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// System Settings Component
// ============================================================
function SystemSettings() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-slate-800/60">
          <CardTitle className="text-base font-bold text-white">Runtime Environment</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">Node Engine</span><span className="text-slate-200 font-mono">v24.11.0</span></div>
          <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">Database Engine</span><span className="text-slate-200 font-mono">SQLite / Prisma Client 6.11</span></div>
          <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">API Gateway</span><span className="text-slate-200 font-mono">Next.js App Router Proxy</span></div>
          <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">WhatsApp Gateway</span><span className="text-slate-200 font-mono">Evolution API v2</span></div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-slate-800/60">
          <CardTitle className="text-base font-bold text-white">Backup & Disaster Recovery</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">Automated Backup</span><span className="text-slate-200 font-mono">3:00 AM Today (Passed)</span></div>
          <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">Snapshot Storage Size</span><span className="text-slate-200 font-mono">2.4 GB</span></div>
          <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">RPO Threshold</span><span className="text-slate-200 font-mono">24 Hours</span></div>
          <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">RTO Threshold</span><span className="text-slate-200 font-mono">4 Hours</span></div>
          <Button size="sm" className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md">Trigger Instant Backup</Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Documentation Panel Component
// ============================================================
function DocumentationPanel() {
  const docs = [
    {
      title: "Developer Technical Manual",
      desc: "17 chapters — API endpoints, DB models, state machines, cron jobs. For developers building integrations.",
      chapters: 17,
      icon: Code,
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      title: "Production Operating Policies",
      desc: "12 policies — Rule migration, VIP eligibility, review lifecycle, campaign priority, fraud detection, customer merge, ownership transfer.",
      chapters: 12,
      icon: Shield,
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    {
      title: "Enterprise Infrastructure Hardening",
      desc: "12 points — Idempotency, distributed locking, cron DLQ, multi-device sessions, WhatsApp failure, backup/DR, API versioning.",
      chapters: 12,
      icon: Shield,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      title: "V6.5 / V7 Platform Roadmap",
      desc: "15 items — Reservation heartbeat, customer cancel, queue capacity, scan spam protection, multi-branch, WebSocket sync.",
      chapters: 15,
      icon: Flag,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
        <p className="text-xs text-amber-300 font-semibold leading-relaxed">
          🔒 <strong>Internal SuperAdmin Documentation Vault.</strong> These technical specifications and architectural blueprints are for platform administrators and core developers.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {docs.map((doc, i) => (
          <Card key={i} className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${doc.color} border flex items-center justify-center flex-shrink-0`}>
                  <doc.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-white text-sm">{doc.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{doc.desc}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-[10px] text-indigo-300 border-indigo-500/30">{doc.chapters} chapters</Badge>
                    <Button size="sm" variant="outline" className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800">View Manual</Button>
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
      <Card className="bg-slate-900/80 border-slate-800 text-white">
        <CardContent className="p-12 text-center text-slate-400">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
          Loading system default templates & merchant overrides...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400">System Default Base Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{data?.systemDefaults?.length || 0} Base Templates</div>
            <p className="text-xs text-slate-400 mt-1">Global baselines used if no custom override exists</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400">Merchant Custom Overrides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-400">{data?.overridesCount || 0} Active Overrides</div>
            <p className="text-xs text-slate-400 mt-1">Active merchant personalized journey templates</p>
          </CardContent>
        </Card>
      </div>

      <WhatsAppTemplateManager merchantId="system" />

      <Card className="bg-slate-900/80 border-slate-800/80 shadow-2xl mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Active Merchant Custom Overrides
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.merchantOverrides || data.merchantOverrides.length === 0 ? (
            <div className="text-center p-6 text-slate-500 text-xs font-semibold">
              No merchant custom overrides saved yet. All merchants are using System Default journey templates.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-950 border-b border-slate-800 text-left text-xs text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="p-3">Merchant</th>
                    <th className="p-3">Template Key</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Custom Wording Preview</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                  {data.merchantOverrides.map((ov: any) => (
                    <tr key={ov.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">
                        {ov.merchant?.name || ov.merchantId}
                        <div className="text-[10px] text-slate-500 font-normal">{ov.merchant?.ownerName}</div>
                      </td>
                      <td className="p-3 font-mono text-emerald-400 font-semibold">{ov.templateKey}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                          v{ov.version}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-slate-400 max-w-md truncate">{ov.messageBody}</td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetMerchant(ov.merchantId, ov.templateKey)}
                          className="h-7 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
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
