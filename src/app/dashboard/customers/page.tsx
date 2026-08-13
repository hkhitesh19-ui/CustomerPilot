"use client"

import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Search,
  Star,
  MessageCircle,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  Wallet,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Flame,
  Zap,
  CheckCircle2,
  RefreshCw,
  Gift,
  Receipt,
  Sparkles,
  ChevronRight,
  X,
  Phone,
  Trash2
} from "lucide-react"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { getVipTierForSpend, VIP_TIER_LABELS, VIP_TIER_ICONS } from "@/lib/vip-engine"
import { computeChurnRisk } from "@/lib/utils/churn-math"
import Link from "next/link"

export default function CustomersPage() {
  const { data, isLoading, refetch } = useDashboardState()
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "at_risk" | "vip" | "repeat">("all")
  const [sortBy, setSortBy] = useState<"recent" | "spend" | "visits" | "stamps" | "name" | "churn" | "contact">("recent")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE customer "${customerName}"?\n\nThis will wipe out all visits, bills, stamps, stamp cards, queue records, and WhatsApp messages for fresh manual testing.`)) {
      return
    }

    try {
      setDeletingId(customerId)
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE"
      })
      const result = await res.json()
      if (result.ok) {
        alert(`✅ Customer "${customerName}" deleted successfully! All history reset.`)
        if (selectedCustomer?.id === customerId) setSelectedCustomer(null)
        refetch()
      } else {
        alert(`❌ Error deleting customer: ${result.error}`)
      }
    } catch (e: any) {
      alert(`❌ Error deleting customer: ${e.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSort = (field: "recent" | "spend" | "visits" | "stamps" | "name" | "churn" | "contact") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <span className="text-slate-600 opacity-50 ml-1">↕</span>
    return <span className="text-indigo-400 ml-1 font-extrabold">{sortOrder === "desc" ? "↓" : "↑"}</span>
  }

  const now = useMemo(() => new Date(), [])

  // Process & Enrich Customer Data with Real DB Connections
  const enrichedCustomers = useMemo(() => {
    if (!data?.customers) return []

    const bills = data.bills || []
    const customerStampCards = data.customerStampCards || []
    const stampCards = data.stampCards || []
    const redemptions = data.redemptions || []
    const defaultTemplate = stampCards[0] || { stampsRequired: 6, rewardName: "Free Reward" }

    return data.customers.map((c: any) => {
      // 1. Bills & Total Visits
      const customerBills = bills
        .filter((b: any) => b.customerId === c.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      const totalVisits = customerBills.length > 0
        ? customerBills.length
        : ((c.lifetimeSpend || 0) > 0 ? 1 : 0)

      // 2. Last Visit & Recency (Days calculation)
      const latestBillDate = customerBills[0]?.createdAt
      const lastActiveDate = latestBillDate
        ? new Date(latestBillDate)
        : (c.lastActiveAt ? new Date(c.lastActiveAt) : new Date(c.createdAt))

      const diffTime = Math.max(0, now.getTime() - lastActiveDate.getTime())
      const daysSinceLastVisit = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      let recencyLabel = "Today"
      if (daysSinceLastVisit === 0) recencyLabel = "Today (0d)"
      else if (daysSinceLastVisit === 1) recencyLabel = "Yesterday (1d)"
      else recencyLabel = `${daysSinceLastVisit}d ago`

      // 3. Stamp Cards & Progress Matrix
      const activeCard = customerStampCards.find(
        (sc: any) => sc.customerId === c.id && !sc.completed && !sc.redeemed
      )
      const activeTemplate = activeCard
        ? stampCards.find((t: any) => t.id === activeCard.stampCardId) || defaultTemplate
        : defaultTemplate
      
      const stampsRequired = activeTemplate.stampsRequired || 6
      const currentStamps = activeCard
        ? activeCard.stampsCollected
        : ((c.lifetimeStamps || 0) % stampsRequired)

      const completedCardsCount = customerStampCards.filter(
        (sc: any) => sc.customerId === c.id && sc.completed
      ).length

      const customerRedemptions = redemptions.filter((r: any) => r.customerId === c.id)

      // 4. VIP Tier
      const vipConfig = getVipTierForSpend(c.lifetimeSpend || 0)
      const tierName = vipConfig.name
      const tierLabel = VIP_TIER_LABELS[tierName] || "Regular"
      const tierIcon = VIP_TIER_ICONS[tierName] || "👤"

      // 5. Churn Risk Engine
      const churnScore = computeChurnRisk({
        lastActiveAt: lastActiveDate,
        lifetimeStamps: c.lifetimeStamps || 0,
        lifetimeSpend: c.lifetimeSpend || 0,
        now,
      })

      let churnStatus: { label: string; badge: string; dot: string } = {
        label: "Active",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-400",
      }
      if (daysSinceLastVisit > 60 || churnScore >= 70) {
        churnStatus = {
          label: "Dormant",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          dot: "bg-rose-400",
        }
      } else if (daysSinceLastVisit > 25 || churnScore >= 40) {
        churnStatus = {
          label: "At Risk",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          dot: "bg-amber-400",
        }
      } else if (daysSinceLastVisit > 7) {
        churnStatus = {
          label: "Engaged",
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          dot: "bg-blue-400",
        }
      }

      // 6. Average Ticket Size
      const avgTicket = totalVisits > 0 ? Math.round((c.lifetimeSpend || 0) / totalVisits) : (c.lifetimeSpend || 0)

      return {
        ...c,
        totalVisits,
        customerBills,
        lastActiveDate,
        daysSinceLastVisit,
        recencyLabel,
        activeCard,
        activeTemplate,
        stampsRequired,
        currentStamps,
        completedCardsCount,
        customerRedemptions,
        vipConfig,
        tierName,
        tierLabel,
        tierIcon,
        churnScore,
        churnStatus,
        avgTicket,
      }
    })
  }, [data, now])

  // Top-Level KPI Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalCustomers = enrichedCustomers.length
    const totalRevenue = enrichedCustomers.reduce((acc, c) => acc + (c.lifetimeSpend || 0), 0)
    const avgLTV = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0
    const totalStamps = enrichedCustomers.reduce((acc, c) => acc + (c.lifetimeStamps || 0), 0)
    const repeatCustomers = enrichedCustomers.filter((c) => c.totalVisits > 1)
    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers.length / totalCustomers) * 100) : 0
    const activeCustomers = enrichedCustomers.filter((c) => c.daysSinceLastVisit <= 14)
    const atRiskCustomers = enrichedCustomers.filter((c) => c.daysSinceLastVisit > 25)
    const totalVisitsCount = enrichedCustomers.reduce((acc, c) => acc + c.totalVisits, 0)
    const avgBasketSize = totalVisitsCount > 0 ? Math.round(totalRevenue / totalVisitsCount) : avgLTV

    return {
      totalCustomers,
      totalRevenue,
      avgLTV,
      totalStamps,
      repeatCustomersCount: repeatCustomers.length,
      repeatRate,
      activeCustomersCount: activeCustomers.length,
      atRiskCustomersCount: atRiskCustomers.length,
      totalVisitsCount,
      avgBasketSize,
    }
  }, [enrichedCustomers])

  // Filtered & Sorted Customer List
  const filteredCustomers = useMemo(() => {
    return enrichedCustomers
      .filter((c: any) => {
        const matchesSearch =
          (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (c.phone || "").includes(search)

        if (!matchesSearch) return false

        if (activeFilter === "active") return c.daysSinceLastVisit <= 14
        if (activeFilter === "at_risk") return c.daysSinceLastVisit > 25
        if (activeFilter === "vip") return c.tierName !== "none"
        if (activeFilter === "repeat") return c.totalVisits > 1

        return true
      })
      .sort((a: any, b: any) => {
        let cmp = 0
        if (sortBy === "recent") cmp = b.daysSinceLastVisit - a.daysSinceLastVisit // Default desc = lowest days (most recent)
        else if (sortBy === "spend") cmp = (a.lifetimeSpend || 0) - (b.lifetimeSpend || 0)
        else if (sortBy === "visits") cmp = a.totalVisits - b.totalVisits
        else if (sortBy === "stamps") cmp = (a.lifetimeStamps || 0) - (b.lifetimeStamps || 0)
        else if (sortBy === "name") cmp = (b.name || "").localeCompare(a.name || "") // Default desc = A-Z
        else if (sortBy === "churn") cmp = a.churnScore - b.churnScore
        else if (sortBy === "contact") cmp = (b.phone || "").localeCompare(a.phone || "")
        
        return sortOrder === "asc" ? cmp : -cmp
      })
  }, [enrichedCustomers, search, activeFilter, sortBy, sortOrder])

  // Export CSV Function
  const handleExportCSV = () => {
    const headers = [
      "Customer Name",
      "Phone",
      "WhatsApp Opt-In",
      "Total Visits",
      "Lifetime Spend (INR)",
      "Avg Ticket Size (INR)",
      "Current Active Stamps",
      "Lifetime Stamps",
      "VIP Tier",
      "Days Since Last Visit",
      "Last Visit Date",
      "Churn Status",
      "Joined Date",
    ]

    const rows = filteredCustomers.map((c) => [
      `"${c.name || "Guest"}"`,
      `"${c.phone}"`,
      c.whatsappOptIn ? "Yes" : "No",
      c.totalVisits,
      c.lifetimeSpend || 0,
      c.avgTicket,
      `${c.currentStamps}/${c.stampsRequired}`,
      c.lifetimeStamps || 0,
      c.tierLabel,
      c.daysSinceLastVisit,
      `"${new Date(c.lastActiveDate).toLocaleDateString()}"`,
      c.churnStatus.label,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `customerpilot_crm_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <div className="h-10 bg-slate-800/40 rounded-xl animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 max-w-lg mx-auto mt-12">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <p className="text-slate-200 font-semibold mb-2">Failed to load CRM data</p>
        <p className="text-slate-400 text-sm mb-4">Please verify your session and permissions.</p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
          Login Again
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* SuperAnalytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Customers CRM
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SuperAnalytics
              </span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1.5 ml-1">
            Real-time customer intelligence, visit frequency, loyalty stamp progress, and churn risk tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 px-3.5 py-2 rounded-xl transition-all hover:text-white"
            title="Refresh Live Data"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Top 4 KPI SuperAnalytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Customer Base */}
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-indigo-500/40 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Customers</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-white">{summaryMetrics.totalCustomers}</span>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {summaryMetrics.repeatRate}% Repeat
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Repeat Guests: <strong className="text-slate-200">{summaryMetrics.repeatCustomersCount}</strong></span>
              <span>Total Visits: <strong className="text-indigo-300">{summaryMetrics.totalVisitsCount}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Lifetime Value & Revenue */}
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue (LTV)</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-emerald-400">
                ₹{summaryMetrics.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Avg LTV: <strong className="text-slate-200">₹{summaryMetrics.avgLTV.toLocaleString()}</strong></span>
              <span>Avg Ticket: <strong className="text-emerald-300">₹{summaryMetrics.avgBasketSize.toLocaleString()}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Stamps & Loyalty Velocity */}
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-amber-500/40 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stamps Issued</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Star className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-400">{summaryMetrics.totalStamps}</span>
              <span className="text-xs text-slate-400">Total Awarded</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Stamps / Customer: <strong className="text-slate-200">
                {summaryMetrics.totalCustomers > 0 ? (summaryMetrics.totalStamps / summaryMetrics.totalCustomers).toFixed(1) : 0}
              </strong></span>
              <span className="text-amber-300 font-medium">Active Loyalty</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Customer Retention & Churn Health */}
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-blue-500/40 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Retention Health</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-white">{summaryMetrics.activeCustomersCount}</span>
              <span className="text-xs text-emerald-400 font-medium">Active (&le;14d)</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>At Risk (&gt;25d): <strong className={summaryMetrics.atRiskCustomersCount > 0 ? "text-amber-400" : "text-slate-200"}>{summaryMetrics.atRiskCustomersCount}</strong></span>
              <span className="text-emerald-400 font-semibold">100% Engaged</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main CRM Workspace Container */}
      <Card className="bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden rounded-3xl">
        {/* Filter, Search & Sort Control Bar */}
        <CardHeader className="bg-slate-900/90 border-b border-slate-800/80 p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/60 w-fit">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === "all"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All Customers ({enrichedCustomers.length})
              </button>
              <button
                onClick={() => setActiveFilter("active")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === "active"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-emerald-300"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active ({summaryMetrics.activeCustomersCount})
              </button>
              <button
                onClick={() => setActiveFilter("repeat")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === "repeat"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-indigo-300"
                }`}
              >
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                Repeat ({summaryMetrics.repeatCustomersCount})
              </button>
              <button
                onClick={() => setActiveFilter("vip")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === "vip"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "text-slate-400 hover:text-amber-300"
                }`}
              >
                <Award className="h-3.5 w-3.5 text-amber-400" />
                VIP Members ({enrichedCustomers.filter((c) => c.tierName !== "none").length})
              </button>
              <button
                onClick={() => setActiveFilter("at_risk")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === "at_risk"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "text-slate-400 hover:text-rose-300"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                At Risk ({summaryMetrics.atRiskCustomersCount})
              </button>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-950/80 border-slate-800 text-slate-200 placeholder:text-slate-500 text-xs rounded-xl focus:border-indigo-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Sort controls moved to table headers */}
            </div>
          </div>
        </CardHeader>

        {/* Content: SuperAnalytics Table */}
        <CardContent className="p-0">
          {/* Desktop High-Density SuperAnalytics Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] font-bold uppercase tracking-wider bg-slate-950/60 text-slate-400 border-b border-slate-800/80">
                <tr>
                  <th className="px-5 py-4 cursor-pointer hover:text-indigo-300 hover:bg-slate-800/40 transition-all select-none" onClick={() => handleSort("name")}>
                    Customer &amp; Tier {getSortIcon("name")}
                  </th>
                  <th className="px-4 py-4 cursor-pointer hover:text-indigo-300 hover:bg-slate-800/40 transition-all select-none" onClick={() => handleSort("contact")}>
                    Contact {getSortIcon("contact")}
                  </th>
                  <th className="px-4 py-4 text-center cursor-pointer hover:text-indigo-300 hover:bg-slate-800/40 transition-all select-none" onClick={() => handleSort("visits")}>
                    Total Visits {getSortIcon("visits")}
                  </th>
                  <th className="px-5 py-4 cursor-pointer hover:text-indigo-300 hover:bg-slate-800/40 transition-all select-none" onClick={() => handleSort("stamps")}>
                    Stamps Progress {getSortIcon("stamps")}
                  </th>
                  <th className="px-4 py-4 cursor-pointer hover:text-indigo-300 hover:bg-slate-800/40 transition-all select-none" onClick={() => handleSort("spend")}>
                    Lifetime Spend {getSortIcon("spend")}
                  </th>
                  <th className="px-4 py-4 cursor-pointer hover:text-indigo-300 hover:bg-slate-800/40 transition-all select-none" onClick={() => handleSort("recent")}>
                    Last Visit &amp; Recency {getSortIcon("recent")}
                  </th>
                  <th className="px-4 py-4 text-center cursor-pointer hover:text-indigo-300 hover:bg-slate-800/40 transition-all select-none" onClick={() => handleSort("churn")}>
                    Churn Risk {getSortIcon("churn")}
                  </th>
                  <th className="px-5 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer: any) => {
                    const initials = (customer.name || "G")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()

                    const cleanPhone = customer.phone.replace(/[^0-9]/g, "")
                    const waLink = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(customer.name || "there")},%20thanks%20for%20being%20a%20valued%20customer%20at%20our%20store!`

                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        {/* 1. Customer & Tier */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-600/20 flex-shrink-0 border border-indigo-400/30">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                                {customer.name || "Guest Customer"}
                                {customer.totalVisits > 1 && (
                                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                                    <Flame className="h-2.5 w-2.5" /> Repeat
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                  <span>{customer.tierIcon}</span>
                                  {customer.tierLabel}
                                </span>
                                {customer.whatsappOptIn && (
                                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                                    WhatsApp
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Contact */}
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="font-mono text-xs text-slate-300 font-semibold">{customer.phone}</div>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline mt-0.5"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Direct Chat
                          </a>
                        </td>

                        {/* 3. Total Visits */}
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 py-1 px-3 rounded-xl font-extrabold text-sm shadow-sm">
                              {customer.totalVisits} {customer.totalVisits === 1 ? "Visit" : "Visits"}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1">
                              {customer.totalVisits > 1 ? "Loyal Visitor" : "New Guest"}
                            </span>
                          </div>
                        </td>

                        {/* 4. Stamps Progress Matrix */}
                        <td className="px-5 py-4">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-amber-400 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400" />
                                {customer.currentStamps} / {customer.stampsRequired} Stamps
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {customer.stampsRequired - customer.currentStamps > 0
                                  ? `${customer.stampsRequired - customer.currentStamps} left for reward`
                                  : "Reward Ready! 🎁"}
                              </span>
                            </div>
                            {/* Visual Micro-Stamp Dots */}
                            <div className="flex items-center gap-1.5">
                              {Array.from({ length: customer.stampsRequired }).map((_, idx) => {
                                const isFilled = idx < customer.currentStamps
                                return (
                                  <div
                                    key={idx}
                                    className={`h-3 w-3 rounded-full transition-all duration-300 flex items-center justify-center ${
                                      isFilled
                                        ? "bg-amber-400 shadow-sm shadow-amber-400/50 border border-amber-300 scale-105"
                                        : "bg-slate-800 border border-slate-700"
                                    }`}
                                    title={isFilled ? `Stamp #${idx + 1} Earned` : `Stamp #${idx + 1} Pending`}
                                  />
                                )
                              })}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1.5">
                              ★ {customer.lifetimeStamps} Total Lifetime Stamps
                            </div>
                          </div>
                        </td>

                        {/* 5. Lifetime Spend */}
                        <td className="px-4 py-4">
                          <div className="font-extrabold text-sm text-slate-100">
                            ₹{(customer.lifetimeSpend || 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Avg: ₹{customer.avgTicket.toLocaleString()} / visit
                          </div>
                        </td>

                        {/* 6. Last Visit & Recency */}
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {customer.recencyLabel}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(customer.lastActiveDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>

                        {/* 7. Churn Risk */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${customer.churnStatus.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${customer.churnStatus.dot}`} />
                            {customer.churnStatus.label}
                          </span>
                        </td>

                        {/* 8. Quick Actions */}
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/q/wallet/${customer.id}`} target="_blank">
                              <button
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all shadow-sm"
                                title="Open Live Customer Wallet Card"
                              >
                                <Wallet className="h-3.5 w-3.5" />
                                Wallet
                              </button>
                            </Link>
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-xl transition-all"
                              title="View Invoices and History"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id, customer.name || customer.phone)}
                              disabled={deletingId === customer.id}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-600/30 border border-rose-500/30 px-2.5 py-1.5 rounded-xl transition-all disabled:opacity-50"
                              title="Delete Customer & Wipe History for Reset"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                              {deletingId === customer.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-500">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Users className="h-8 w-8 text-slate-600 mx-auto" />
                        <p className="text-slate-300 font-semibold text-sm">No customers matched your filter</p>
                        <p className="text-xs text-slate-500">Try clearing your search query or switching tabs.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card SuperAnalytics View */}
          <div className="lg:hidden divide-y divide-slate-800/60">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer: any) => {
                const initials = (customer.name || "G")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                const cleanPhone = customer.phone.replace(/[^0-9]/g, "")
                const waLink = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(customer.name || "there")},%20thanks%20for%20being%20a%20valued%20customer!`

                return (
                  <div
                    key={customer.id}
                    className="p-5 flex flex-col gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-md border border-indigo-400/30 flex-shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-base flex items-center gap-2">
                            {customer.name || "Guest Customer"}
                            {customer.totalVisits > 1 && (
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold">
                                Repeat
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400 font-mono font-medium">{customer.phone}</span>
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border ${customer.churnStatus.badge}`}
                            >
                              {customer.churnStatus.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-semibold px-2 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                        {customer.tierIcon} {customer.tierLabel}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Total Visits</span>
                        <div className="text-sm font-extrabold text-indigo-400 mt-0.5">
                          {customer.totalVisits} {customer.totalVisits === 1 ? "Visit" : "Visits"}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Spend</span>
                        <div className="text-sm font-extrabold text-slate-100 mt-0.5">
                          ₹{(customer.lifetimeSpend || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Last Visit</span>
                        <div className="text-xs font-semibold text-slate-300 mt-1">
                          {customer.recencyLabel}
                        </div>
                      </div>
                    </div>

                    {/* Stamp Progress */}
                    <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {customer.currentStamps} / {customer.stampsRequired} Stamps
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {customer.stampsRequired - customer.currentStamps > 0
                            ? `${customer.stampsRequired - customer.currentStamps} more for reward`
                            : "Reward Ready!"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: customer.stampsRequired }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-3 flex-1 rounded-full ${
                              idx < customer.currentStamps
                                ? "bg-amber-400 shadow-sm shadow-amber-400/50"
                                : "bg-slate-800 border border-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/q/wallet/${customer.id}`} target="_blank" className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 py-2 rounded-xl transition-all">
                          <Wallet className="h-3.5 w-3.5" />
                          Wallet Card
                        </button>
                      </Link>
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 py-2 rounded-xl transition-all">
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </button>
                      </a>
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id, customer.name || customer.phone)}
                        disabled={deletingId === customer.id}
                        className="p-2 text-xs font-semibold text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-600/30 rounded-xl border border-rose-500/30 disabled:opacity-50"
                        title="Delete Customer & Reset Data"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">
                No customers found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Full Detail Slide-Over / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg border border-indigo-400/30">
                  {(selectedCustomer.name || "G").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedCustomer.name || "Guest Customer"}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedCustomer.tierIcon} {selectedCustomer.tierLabel}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Visits</span>
                <p className="text-lg font-extrabold text-indigo-400 mt-0.5">{selectedCustomer.totalVisits}</p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Lifetime Spend</span>
                <p className="text-lg font-extrabold text-emerald-400 mt-0.5">
                  ₹{(selectedCustomer.lifetimeSpend || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Stamps</span>
                <p className="text-lg font-extrabold text-amber-400 mt-0.5">{selectedCustomer.lifetimeStamps || 0}</p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Last Visited</span>
                <p className="text-xs font-bold text-slate-200 mt-1">{selectedCustomer.recencyLabel}</p>
              </div>
            </div>

            {/* Purchase & Invoice History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-indigo-400" />
                Verified Bills &amp; Purchases ({selectedCustomer.customerBills?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedCustomer.customerBills && selectedCustomer.customerBills.length > 0 ? (
                  selectedCustomer.customerBills.map((bill: any) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{bill.number || "Invoice"}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(bill.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {bill.notes ? ` • ${bill.notes}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-400 text-sm">₹{bill.amount.toLocaleString()}</span>
                        <div className="text-[10px] text-amber-400">+{bill.stampsAwarded || 1} Stamp</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-950/40 rounded-xl">
                    No individual bill items recorded yet.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <Link href={`/q/wallet/${selectedCustomer.id}`} target="_blank" className="flex-1">
                <button className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all">
                  <Wallet className="h-4 w-4" />
                  Open Wallet in New Tab
                  <ExternalLink className="h-3 w-3 ml-1" />
                </button>
              </Link>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
