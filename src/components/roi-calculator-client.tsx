"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, ArrowLeft, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand-logo"

// ─── Types ─────────────────────────────────────────────────────────────────
interface CalcValues {
  cpd: number    // customers / day (e.g. 35)
  days: number   // days / month (e.g. 30)
  bill: number   // average bill ₹ (e.g. 350)
  cur: number    // current repeat % (e.g. 45)
  rec: number    // % who return (recovery rate, e.g. 20)
  stamps: number // stamps needed (e.g. 15)
  rew: number    // reward menu value ₹ (e.g. 250)
  food: number   // food cost % (e.g. 50)
  fee: number    // CustomerPilot fee / year (e.g. 3499)
  g: number      // extra customers from Google % (e.g. 1.25)
  ref: number    // % loyal customers who refer (e.g. 10)
  per: number    // new customers each referrer brings (e.g. 1)
  storyTags: number // story tags / month (e.g. 15)
  storyReach: number // followers who convert to customer per tag (e.g. 0.75)
}

interface CalcFlags {
  ref: boolean
  g: boolean
  insta: boolean
}

// ─── Defaults (Conservative & Realistic Spec from Live ROI Calculator 2) ─────
const DEFAULTS: CalcValues = {
  cpd: 35,
  days: 30,
  bill: 350,
  cur: 45,
  rec: 20,
  stamps: 15,
  rew: 250,
  food: 50,
  fee: 3499,
  g: 1.2,          // ~12.6 customers/month (~150/year)
  ref: 10,         // 10% loyal customers refer
  per: 1,          // 1 new customer per referrer
  storyTags: 15,   // 15 story tags / month
  storyReach: 0.75 // ~11 new customers/month (~135/year)
}

// ─── Number Format Helpers ───────────────────────────────────────────────────
function n0(x: number): string {
  return Math.round(x).toLocaleString("en-IN")
}
function inr(x: number): string {
  return (x < 0 ? "−" : "") + "₹" + n0(Math.abs(x))
}
function lk(x: number): string {
  return Math.abs(x) >= 1e5
    ? (x < 0 ? "−" : "") + "₹" + (Math.abs(x) / 1e5).toFixed(2) + " lakh"
    : inr(x)
}
function pc(x: number): string {
  return (Math.round(x * 10) / 10) + "%"
}

// ─── Input Slider Row ────────────────────────────────────────────────────────
function SliderRow({
  id, label, min, max, step, unit, value, onChange,
}: {
  id: string; label: string; min: number; max: number; step: number; unit: string; value: number
  onChange: (id: string, v: number) => void
}) {
  const handleChange = (raw: string) => {
    const v = Math.max(min, Math.min(max, parseFloat(raw) || 0))
    onChange(id, v)
  }
  return (
    <div className="mb-3.5">
      <div className="flex justify-between items-center gap-2 mb-1.5">
        <label htmlFor={`n_${id}`} className="text-xs sm:text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 min-w-[92px] shadow-xs">
          {unit === "₹" && <span className="text-xs text-slate-400 font-semibold">₹</span>}
          <input
            type="number"
            id={`n_${id}`}
            min={min}
            step={step}
            value={value}
            onChange={e => handleChange(e.target.value)}
            className="w-16 bg-transparent border-0 text-right font-bold text-sm text-slate-900 focus:outline-hidden"
          />
          {unit === "%" && <span className="text-xs text-slate-400 font-semibold">%</span>}
        </div>
      </div>
      <input
        type="range"
        id={`r_${id}`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => handleChange(e.target.value)}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
      />
    </div>
  )
}

// ─── Stat Tile ───────────────────────────────────────────────────────────────
function Tile({ value, label, variant = "default" }: { value: string; label: string; variant?: "default" | "good" | "warn" }) {
  const styles = {
    default: "bg-slate-50 border-slate-200 text-slate-900",
    good: "bg-emerald-50/80 border-emerald-200/80 text-emerald-950",
    warn: "bg-amber-50/80 border-amber-200/80 text-amber-950",
  }
  const textStyles = {
    default: "text-slate-900",
    good: "text-emerald-700 font-extrabold",
    warn: "text-amber-700 font-extrabold",
  }
  return (
    <div className={`rounded-2xl p-3 sm:p-3.5 text-center border shadow-2xs ${styles[variant]}`}>
      <div className={`text-lg sm:text-xl font-black leading-tight ${textStyles[variant]}`}>{value}</div>
      <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">{label}</div>
    </div>
  )
}

// ─── Waterfall Row ───────────────────────────────────────────────────────────
function WaterfallRow({ label, value, barPct, color }: { label: string; value: string; barPct: number; color: string }) {
  return (
    <div className="grid grid-cols-[135px_1fr_95px] gap-2 items-center my-2 text-xs sm:text-sm">
      <span className="text-slate-700 font-medium">{label}</span>
      <div className="bg-slate-100 rounded-lg h-5 sm:h-6 overflow-hidden border border-slate-200/60">
        <div
          className="h-full rounded-md transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, barPct))}%`, background: color }}
        />
      </div>
      <span className="text-right font-bold text-slate-900">{value}</span>
    </div>
  )
}

// ─── Donut Ring ───────────────────────────────────────────────────────────────
function RepeatDonut({ cur, rate }: { cur: number; rate: number }) {
  const RC = 314.16
  const curDash = (Math.min(100, cur) / 100) * RC
  const rateDash = (Math.min(100, rate) / 100) * RC
  return (
    <div className="relative w-36 h-36 flex-none">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${rateDash} ${RC}`}
          className="transition-all duration-300"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#6366f1"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${curDash} ${RC}`}
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-slate-900 leading-none">{pc(rate)}</span>
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">repeat rate</span>
      </div>
    </div>
  )
}

// ─── Dot Grid (20 Dots: 1 dot = 5%) ──────────────────────────────────────────
function DotGrid({ cur, rate }: { cur: number; rate: number }) {
  const a = Math.round(cur / 5)
  const p = Math.round(Math.min(100, rate) / 5)
  return (
    <div className="grid grid-cols-10 gap-1.5 max-w-[280px] flex-1 min-w-[200px]">
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className={`aspect-square rounded-full flex items-center justify-center text-[10px] transition-all duration-200 ${
            i < a
              ? "bg-indigo-600 text-white shadow-xs"
              : i < p
              ? "bg-emerald-500 text-white shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
              : "bg-slate-200 text-slate-400 opacity-70"
          }`}
          title={i < a ? "Already repeating" : i < p ? "Won back by CustomerPilot" : "Don't return"}
        >
          👤
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function RoiCalculatorClient() {
  const [V, setV] = useState<CalcValues>({ ...DEFAULTS })
  const [F, setF] = useState<CalcFlags>({ ref: true, g: true, insta: false })

  // Derived financial & customer retention modeling exactly as per Live ROI Calculator 2 spec
  const calc = useCallback(() => {
    const { cpd, days, bill, cur, rec, stamps, rew, food, fee, g, storyTags, storyReach } = V
    const st = Math.max(1, stamps)
    const month = cpd * days
    const rep = (month * cur) / 100
    const non = month - rep
    const recd = (non * rec) / 100
    const proj = rep + recd
    const rate = month > 0 ? (proj / month) * 100 : 0
    const sm = recd * bill
    const sy = sm * 12
    const vy = recd * 12
    const rm = proj / st
    const ry = rm * 12
    const rf = ry * rew
    const rc = (rf * food) / 100

    // Google Reviews Organic Influx
    const gm = (month * g) / 100
    const gy = gm * 12
    const gs = gy * bill

    // Referral Engine (loyal regulars who refer)
    const lc = recd * 12
    const rr = (lc * V.ref) / 100
    const rn = rr * V.per
    const rs = rn * bill
    // Referral bonus stamp cost (1 stamp referrer + 1 stamp friend = 2 stamps = (2/stamps) * rew * food%)
    const refBonusCost = rn > 0 ? rn * ((2 / st) * rew * (food / 100)) : 0

    // Instagram Story Tags Engine
    const instaNewMonth = storyTags * storyReach
    const instaNewYear = instaNewMonth * 12
    const instaSalesYear = instaNewYear * bill
    // Instagram bonus stamp cost (1 stamp per approved story tag = (1/stamps) * rew * food%)
    const instaBonusCost = (storyTags * 12) * ((1 / st) * rew * (food / 100))

    const refS = F.ref ? rs : 0
    const gS = F.g ? gs : 0
    const instaS = F.insta ? instaSalesYear : 0

    const tot = sy + refS + gS + instaS
    const fc = (tot * food) / 100
    const bonusCost = (F.ref ? refBonusCost : 0) + (F.insta ? instaBonusCost : 0)
    const left = tot - fc - rc - bonusCost - fee
    const nv = vy + (F.ref ? rn : 0) + (F.g ? gy : 0) + (F.insta ? instaNewYear : 0)
    const burden = bill > 0 ? (((rew * food) / 100) / (st * bill)) * 100 : 0
    const roiX = fee > 0 ? Math.max(0, left / fee) : 0
    const mg = bill * (1 - food / 100)
    const breakEven = fee > 0 && mg > 0 ? Math.ceil(fee / mg) : 0

    return {
      month, rep, non, recd, proj, rate, sm, sy, vy,
      rm, ry, rf, rc, gm, gy, gs, lc, rr, rn, rs,
      storyTags, instaNewYear, instaSalesYear, instaBonusCost, refBonusCost, bonusCost,
      refS, gS, instaS, tot, fc, left, nv, burden, roiX, mg, breakEven,
      pctRepeat: sy > 0 && tot > 0 ? (sy / tot) * 100 : 0,
      pctRef: refS > 0 && tot > 0 ? (refS / tot) * 100 : 0,
      pctG: gS > 0 && tot > 0 ? (gS / tot) * 100 : 0,
      pctInsta: instaS > 0 && tot > 0 ? (instaS / tot) * 100 : 0,
    }
  }, [V, F])

  const R = calc()

  const handleChange = (id: string, v: number) => {
    setV(prev => ({ ...prev, [id]: v }))
  }

  const handleReset = () => {
    setV({ ...DEFAULTS })
    setF({ ref: true, g: true, insta: false })
  }

  const setReferralPreset = (ref: number, per: number) => {
    setV(prev => ({ ...prev, ref, per }))
  }

  const inputGroups = [
    {
      label: "🏪 Your Store Traffic & Spend",
      fields: [
        { id: "cpd", label: "Walk-in customers / day", min: 1, max: 300, step: 1, unit: "" },
        { id: "days", label: "Days open / month", min: 1, max: 31, step: 1, unit: "" },
        { id: "bill", label: "Average bill amount", min: 10, max: 3000, step: 10, unit: "₹" },
        { id: "cur", label: "Current repeat customer %", min: 0, max: 100, step: 1, unit: "%" },
      ],
    },
    {
      label: "🎁 Loyalty Reward Settings",
      fields: [
        { id: "stamps", label: "Stamps needed for reward", min: 1, max: 25, step: 1, unit: "" },
        { id: "rew", label: "Reward menu value (MRP)", min: 10, max: 1500, step: 10, unit: "₹" },
        { id: "food", label: "Food / inventory cost %", min: 0, max: 100, step: 1, unit: "%" },
      ],
    },
    {
      label: "💳 Plan & Marketing Triggers",
      fields: [
        { id: "fee", label: "CustomerPilot annual plan fee", min: 0, max: 20000, step: 50, unit: "₹" },
        { id: "g", label: "Google Reviews new customer %", min: 0, max: 10, step: 0.1, unit: "%" },
        { id: "storyTags", label: "Instagram story tags / month", min: 0, max: 100, step: 1, unit: "" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between relative">
      {/* ── Background Aurora Glows (Matching Homepage Theme) ────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-96 -right-20 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[800px] -left-20 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      {/* ── Sticky Top Navigation ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-transform hover:scale-105"
            >
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────────────── */}
      <main className="w-full flex-1 relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20">

        {/* ================================================================= */}
        {/* HERO COMPARISON BLOCK: YOUR COST VS YOUR OPPORTUNITY               */}
        {/* ================================================================= */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
            {/* Ambient decorative glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Live ROI Calculator
              </div>

              {/* Big Title & Subtitle */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-2">
                Return On Investment
              </h1>
              <h2 className="text-lg sm:text-2xl font-bold text-emerald-400 mb-2">
                Your Investment Vs Your Earning Opportunity
              </h2>
              <p className="text-xs sm:text-base text-slate-300 mb-6">
                This is the extra sales opportunity you could unlock every year with CustomerPilot
              </p>

              {/* Cost vs Opportunity Comparison Cards */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 my-6">
                {/* Cost Card */}
                <div className="w-full sm:w-64 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-5 text-center shadow-lg transition-transform hover:scale-102">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">Your Investment</div>
                  <div className="text-3xl sm:text-4xl font-black text-white mt-1 mb-0.5">
                    {inr(V.fee)}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">/ year</div>
                </div>

                {/* VS Badge */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase shadow-md flex-none">
                  vs
                </div>

                {/* Opportunity Card */}
                <div className="w-full sm:w-72 bg-gradient-to-b from-emerald-500/20 to-emerald-600/30 backdrop-blur-md rounded-2xl border border-emerald-400/40 p-5 text-center shadow-lg transition-transform hover:scale-102">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">Potential Extra Sales</div>
                  <div id="hero-roi-total" className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-300 mt-1 mb-0.5">
                    {lk(R.tot)}
                  </div>
                  <div className="text-xs text-emerald-200/90 font-medium">/ year</div>
                </div>
              </div>

              {/* Dynamic Break-even Statement (Audited & Realistic) */}
              <div id="roi-breakeven-banner" className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 my-5 text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl mx-auto">
                {V.fee > 0 && R.mg > 0 && R.breakEven > 0 ? (
                  <>
                    You need only ~<strong className="text-emerald-300 font-extrabold">{n0(R.breakEven)} extra visits / year</strong> (~{n0(Math.max(1, Math.ceil(R.breakEven / 12)))} / month) to cover the fee. Every ₹1 of fee opens up ~<strong className="text-emerald-300 font-extrabold">₹{(R.tot / V.fee).toFixed(0)}</strong> of sales opportunity.
                  </>
                ) : (
                  <>Adjust your store numbers below to compute your live break-even point and multiplier.</>
                )}
              </div>

              {/* Primary Call to Action Button */}
              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base px-8 py-6 rounded-2xl shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Link href="/signup">
                    Start Free Trial — No Credit Card <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Sub-Pills Indicator */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 text-xs text-slate-300">
                <span className="bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 backdrop-blur-xs">
                  Repeat rate: <strong className="text-white">{pc(V.cur)} → {pc(R.rate)}</strong>
                </span>
                <span className="bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 backdrop-blur-xs">
                  Extra visits: <strong className="text-white">{n0(R.nv)} / year</strong>
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full px-3.5 py-1.5 font-bold backdrop-blur-xs">
                  Extra Profit Opportunity: ~{lk(R.left)} / year
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sticky Mini Summary Bar ──────────────────────────────────────── */}
        <div className="sticky top-16 sm:top-20 z-40 grid grid-cols-3 gap-2 sm:gap-3 py-3 bg-slate-50/80 backdrop-blur-md">
          {[
            { label: "Repeat Rate", value: pc(R.rate), color: "text-indigo-600" },
            { label: "Extra Sales / Year", value: lk(R.tot), color: "text-emerald-600 font-black" },
            { label: "Savings / Year", value: lk(R.left), color: "text-teal-600 font-black" },
          ].map(item => (
            <div
              key={item.label}
              className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 text-center shadow-2xs hover:shadow-xs transition"
            >
              <div className="text-[10px] sm:text-xs text-slate-500 font-semibold">{item.label}</div>
              <div className={`text-sm sm:text-base lg:text-lg font-bold leading-tight ${item.color}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Two-Column Layout (Controls + Live Results) ──────────────────── */}
        <div className="lg:grid lg:grid-cols-[360px_1fr] lg:gap-6 lg:items-start mt-4 space-y-5 lg:space-y-0">

          {/* ════ LEFT COLUMN: Controls & Sliders ════════════════════════════ */}
          <aside className="lg:sticky lg:top-36 space-y-4">

            {/* Target Recovery Win-back Hero Card */}
            <div className="bg-white border-2 border-emerald-500 rounded-3xl p-5 sm:p-6 shadow-sm bg-gradient-to-b from-emerald-50/60 to-white">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                  🎯
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Repeat Rate:{" "}
                  <span className="text-slate-500 line-through text-sm">{pc(V.cur)}</span>{" "}
                  ➔ <span className="text-emerald-600">{pc(R.rate)}</span>
                </h2>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Of the customers who don&apos;t return, how many can you win back?{" "}
                <strong className="text-emerald-700 font-bold">+{pc(R.rate - V.cur)} points</strong>
              </p>
              <SliderRow
                id="rec"
                label="% of lost walk-ins won back"
                min={0}
                max={100}
                step={1}
                unit="%"
                value={V.rec}
                onChange={handleChange}
              />
            </div>

            {/* Business Numbers Input Form */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold">
                    ✏️
                  </span>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Enter Your Own Numbers
                  </h2>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Reset to recommended defaults"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {inputGroups.map(group => (
                <div key={group.label} className="pt-3 border-t border-slate-100 first:border-0 first:pt-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {group.label}
                  </div>
                  {group.fields.map(f => (
                    <SliderRow
                      key={f.id}
                      {...f}
                      value={V[f.id as keyof CalcValues]}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              ))}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Monthly customers:</span>
                <span className="font-bold text-slate-900">{n0(R.month)}</span>
              </div>
            </div>
          </aside>

          {/* ════ RIGHT COLUMN: Output Breakdown Cards ═══════════════════════ */}
          <main className="space-y-5">

            {/* Section 1: Repeat Customers Visualizer */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                  🔁
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Repeat Customers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Earlier returned <strong>{pc(V.cur)}</strong> → now will return <strong>{pc(R.rate)}</strong>
                  </p>
                </div>
              </div>

              {/* Donut + 20-Dot Visualizer */}
              <div className="flex items-center gap-6 flex-wrap justify-center my-5 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <RepeatDonut cur={V.cur} rate={R.rate} />
                <DotGrid cur={V.cur} rate={R.rate} />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-xs text-slate-600 mb-4 font-medium">
                <span className="flex items-center gap-1.5">
                  <i className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                  Already repeating
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Won back by CustomerPilot
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  Don&apos;t return
                </span>
                <span className="text-slate-400 font-normal">1 dot = 5%</span>
              </div>

              {/* 4 Outcome Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Tile value={n0(R.non)} label="don't return / month" />
                <Tile value={`+${n0(R.recd)}`} label="new repeat / month" variant="good" />
                <Tile value={n0(R.proj)} label="total repeat / month" variant="good" />
                <Tile value={`+${pc(R.rate - V.cur)}`} label="rise in repeat rate" />
              </div>
            </section>

            {/* Section 2: Extra Sales from Repeat Visits */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                  💰
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Extra Sales from Repeat Visits
                  </h2>
                  <p className="text-xs text-slate-500">
                    Recovered customers × your average bill (₹{V.bill})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                <Tile value={n0(R.recd)} label="extra visits / month" />
                <Tile value={inr(R.sm)} label="extra sales / month" />
                <Tile value={n0(R.vy)} label="extra visits / year" />
                <Tile value={lk(R.sy)} label="extra sales / year" variant="good" />
              </div>
            </section>

            {/* Section 3: Cost of Rewards */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                  🎁
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Cost of Rewards
                  </h2>
                  <p className="text-xs text-slate-500">
                    Not menu value — your actual food cost ({V.food}%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                <Tile value={n0(R.rm)} label="rewards / month" />
                <Tile value={n0(R.ry)} label="rewards / year" />
                <Tile value={lk(R.rf)} label="menu value / year" />
                <Tile value={lk(R.rc)} label="actual food cost / year" variant="warn" />
              </div>

              <div className="mt-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-900 leading-relaxed">
                <strong>Reward burden: {pc(R.burden)}</strong> — this share of value goes to the reward on every purchase cycle.
              </div>
            </section>

            {/* Section 4: Total Sales and Savings Waterfall */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg">
                  📊
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Total Sales and Savings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Detailed financial waterfall deducting costs &amp; rewards
                  </p>
                </div>
              </div>

              {/* Toggles (Matching Live ROI Calculator 2 spec) */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700 my-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={F.ref}
                    onChange={e => setF(p => ({ ...p, ref: e.target.checked }))}
                    className="accent-emerald-600 w-4 h-4 rounded-sm"
                  />
                  Include referral sales
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={F.g}
                    onChange={e => setF(p => ({ ...p, g: e.target.checked }))}
                    className="accent-emerald-600 w-4 h-4 rounded-sm"
                  />
                  Include Google sales
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={F.insta}
                    onChange={e => setF(p => ({ ...p, insta: e.target.checked }))}
                    className="accent-emerald-600 w-4 h-4 rounded-sm"
                  />
                  Include Instagram sales
                </label>
              </div>

              {/* Stacked bar */}
              <div className="flex h-5 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 my-2">
                <div className="h-full transition-all duration-300" style={{ width: `${R.pctRepeat}%`, background: "#4f46e5" }} />
                <div className="h-full transition-all duration-300" style={{ width: `${R.pctRef}%`, background: "#10b981" }} />
                <div className="h-full transition-all duration-300" style={{ width: `${R.pctG}%`, background: "#f59e0b" }} />
                <div className="h-full transition-all duration-300" style={{ width: `${R.pctInsta}%`, background: "#ec4899" }} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-4 font-medium">
                <span><i className="inline-block w-2.5 h-2.5 rounded-xs bg-indigo-600 mr-1" />Repeat: <strong>{pc(R.pctRepeat)}</strong></span>
                <span><i className="inline-block w-2.5 h-2.5 rounded-xs bg-emerald-500 mr-1" />Referral: <strong>{pc(R.pctRef)}</strong></span>
                <span><i className="inline-block w-2.5 h-2.5 rounded-xs bg-amber-500 mr-1" />Google: <strong>{pc(R.pctG)}</strong></span>
                <span><i className="inline-block w-2.5 h-2.5 rounded-xs bg-pink-500 mr-1" />Instagram: <strong>{pc(R.pctInsta)}</strong></span>
              </div>

              {/* Waterfall rows */}
              <div className="space-y-1">
                <WaterfallRow label="Repeat sales" value={lk(R.sy)} barPct={R.tot > 0 ? (R.sy / R.tot) * 100 : 0} color="#4f46e5" />
                <WaterfallRow label="+ Referral sales" value={lk(R.refS)} barPct={R.tot > 0 ? (R.refS / R.tot) * 100 : 0} color="#10b981" />
                <WaterfallRow label="+ Google sales" value={lk(R.gS)} barPct={R.tot > 0 ? (R.gS / R.tot) * 100 : 0} color="#f59e0b" />
                <WaterfallRow label="+ Instagram sales" value={lk(R.instaS)} barPct={R.tot > 0 ? (R.instaS / R.tot) * 100 : 0} color="#ec4899" />
                <div className="border-t border-dashed border-slate-300 pt-2 my-1">
                  <WaterfallRow label="= Total sales" value={lk(R.tot)} barPct={100} color="#0f766e" />
                </div>
                <WaterfallRow label="− Food cost" value={lk(R.fc)} barPct={R.tot > 0 ? (R.fc / R.tot) * 100 : 0} color="#ea580c" />
                <WaterfallRow label="− Reward cost" value={lk(R.rc)} barPct={R.tot > 0 ? (R.rc / R.tot) * 100 : 0} color="#ca8a04" />
                <WaterfallRow label="− Bonus stamp cost" value={lk(R.bonusCost)} barPct={R.tot > 0 ? (R.bonusCost / R.tot) * 100 : 0} color="#d97706" />
                <WaterfallRow label="− CustomerPilot" value={inr(V.fee)} barPct={R.tot > 0 ? (V.fee / R.tot) * 100 : 0} color="#dc2626" />
              </div>

              {/* Extra Profit Opportunity Highlight */}
              <div className="mt-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-2xl p-5 text-center shadow-xs">
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  = Extra Profit Opportunity using CustomerPilot /year
                </p>
                <div
                  className="text-3xl sm:text-4xl font-black my-2 transition-colors"
                  style={{ color: R.left < 0 ? "#b91c1c" : "#047857" }}
                >
                  {lk(R.left)}
                </div>
                {V.fee > 0 && (
                  <span className="inline-block bg-emerald-600 text-white rounded-full px-4 py-1 text-xs font-extrabold shadow-xs">
                    ≈ {R.roiX.toFixed(0)}x return on your software investment
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-400 text-center">
                This is not net profit — rent, salaries, electricity, GST, payment charges and wastage are not included.
              </p>
            </section>

            {/* Section 5: Google Reviews Discovery Impact */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg">
                  ⭐
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    New Customers from Google Reviews
                  </h2>
                  <p className="text-xs text-slate-500">
                    Better, more reviews = more visibility on Google
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
                <Tile value={n0(R.gm)} label="new customers / month" />
                <Tile value={n0(R.gy)} label="new customers / year" />
                <Tile value={lk(R.gs)} label="potential sales / year" variant="good" />
              </div>

              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                Repeat + Google total opportunity: <strong className="text-slate-900">{lk(R.sy + R.gs)}</strong> / year (may overlap). Track referrals separately.
              </div>
            </section>

            {/* Section 6: Word-of-Mouth Referrals Multiplier */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                  🤝
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Referrals: Loyal Customers → New Customers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Loyal customers recovered × % who refer × new customers each referrer brings
                  </p>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 my-3">
                {[
                  { label: "Conservative", ref: 10, per: 1 },
                  { label: "Average", ref: 20, per: 2 },
                  { label: "Strong", ref: 30, per: 3 },
                  { label: "All Refer", ref: 100, per: 4 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setReferralPreset(preset.ref, preset.per)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <SliderRow
                id="ref"
                label="% of loyal customers who refer"
                min={0}
                max={100}
                step={1}
                unit="%"
                value={V.ref}
                onChange={handleChange}
              />
              <SliderRow
                id="per"
                label="New customers each referrer brings"
                min={0}
                max={10}
                step={0.5}
                unit=""
                value={V.per}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                <Tile value={n0(R.lc)} label="loyal customers / year" />
                <Tile value={n0(R.rr)} label="customers who refer" />
                <Tile value={n0(R.rn)} label="new customers / year" variant="good" />
                <Tile value={lk(R.rs)} label="potential sales / year (1 visit)" variant="good" />
              </div>

              <div className="mt-3.5 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
                On average, each loyal customer brings ~<strong className="text-slate-900 font-bold">{((R.rn / Math.max(1, R.lc))).toFixed(2)}</strong> new customer (over 365 days).
                <br />
                Referral bonus-stamp cost (actual food cost): <strong className="text-slate-900 font-bold">{inr(R.refBonusCost)}</strong> / year, deducted in Savings.
                <br />
                These referral sales are added into &ldquo;Total sales&rdquo; and &ldquo;Savings&rdquo; above (one new customer = one visit). Turn the toggle off above to avoid double-counting with Google. For real numbers, ask new customers &ldquo;Who referred you?&rdquo;
              </div>
            </section>

            {/* Section 7: Instagram Story Tags Engine (from Live ROI Calculator 2 spec) */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-lg">
                  📸
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Instagram Story Tags: Customers → New Customers
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customers who tag your story earn bonus stamps; their followers discover you
                  </p>
                </div>
              </div>

              <div className="my-3">
                <SliderRow
                  id="storyTags"
                  label="Approved story tags / month"
                  min={0}
                  max={100}
                  step={1}
                  unit=""
                  value={V.storyTags}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                <Tile value={n0(V.storyTags)} label="story tags / month" />
                <Tile value={n0(R.instaNewYear)} label="new customers / year" variant="good" />
                <Tile value={inr(R.instaBonusCost)} label="bonus stamp cost / year" variant="warn" />
                <Tile value={lk(R.instaSalesYear)} label="potential sales / year (1 visit)" variant="good" />
              </div>

              <div className="mt-3.5 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
                Instagram reach is not tracked by CustomerPilot — treat this as an estimate. Default OFF; turn on the toggle above to include it in Total sales and Savings.
              </div>
            </section>

            {/* Section 8: Beyond Sales — Intangible Software Benefits */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                  ✨
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Extra Benefits — Beyond Just Sales
                  </h2>
                  <p className="text-xs text-slate-500">
                    Things CustomerPilot does for you behind the scenes, every single day
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 mt-4">
                {[
                  { icon: "🗂️", title: "Customer database, built automatically", desc: "Every scan saves name, visits & spend — no manual Excel or register needed." },
                  { icon: "💬", title: "WhatsApp reminders, sent for you", desc: "Inactive customers get nudged automatically — no staff follow-up required." },
                  { icon: "⭐", title: "Google reviews, requested on autopilot", desc: "Happy repeat customers are prompted for a review at the right moment." },
                  { icon: "📊", title: "Live dashboard, always up to date", desc: "See repeat rate, top customers & rewards claimed anytime, on any device." },
                  { icon: "🔒", title: "Your data, safely backed up", desc: "No risk of a lost register or a staff member's personal phone holding your customer list." },
                  { icon: "🕒", title: "Time saved for staff", desc: "No manual stamping registers or counting — one scan does it all." },
                ].map(item => (
                  <li key={item.title} className="flex gap-3 items-start bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                    <span className="text-xl flex-none">{item.icon}</span>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Bottom Final Sign-Up Card */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center shadow-lg">
              <h3 className="text-xl sm:text-2xl font-black mb-2">
                Your Investment Vs Your Earning Opportunity
              </h3>
              <div className="flex justify-center items-center gap-6 my-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-emerald-200">Your Investment</div>
                  <div className="text-2xl sm:text-3xl font-black">{inr(V.fee)}</div>
                  <div className="text-[11px] text-emerald-200">/ year</div>
                </div>
                <div className="text-xl font-black text-emerald-300">vs</div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-emerald-200">Potential Extra Sales</div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{lk(R.tot)}</div>
                  <div className="text-[11px] text-emerald-200">/ year</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto mb-5 leading-relaxed">
                Illustrative projection — based on the numbers you entered. No sales are guaranteed. Please don&apos;t incentivise reviews with rewards.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-800 hover:bg-emerald-50 font-black text-sm px-8 py-5 rounded-2xl shadow-md transition-transform hover:scale-105"
              >
                <Link href="/signup">
                  Start 3-Day Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

          </main>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CustomerPilot. All rights reserved. Built for Indian Retail Merchants.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-900 transition">Home</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
            <Link href="/whatsapp-digital-loyalty-card" className="hover:text-slate-900 transition">WhatsApp Loyalty</Link>
            <Link href="/smart-ai-google-review" className="hover:text-slate-900 transition">AI Google Reviews</Link>
            <Link href="/signup" className="hover:text-slate-900 font-bold transition text-emerald-600">Free Trial</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
