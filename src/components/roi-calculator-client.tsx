"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Types ─────────────────────────────────────────────────────────────────
interface CalcValues {
  cpd: number    // customers / day
  days: number   // days / month
  bill: number   // average bill ₹
  cur: number    // current repeat %
  rec: number    // % who return (recovery rate)
  stamps: number // stamps needed
  rew: number    // reward menu value ₹
  food: number   // food cost %
  fee: number    // CustomerPilot fee / year
  g: number      // extra customers from Google %
  ref: number    // % loyal customers who refer
  per: number    // new customers each referrer brings
}

interface CalcFlags {
  ref: boolean
  g: boolean
}

// ─── Defaults ──────────────────────────────────────────────────────────────
const DEFAULTS: CalcValues = {
  cpd: 30, days: 30, bill: 300, cur: 50, rec: 30,
  stamps: 5, rew: 200, food: 50, fee: 2249,
  g: 3.5, ref: 10, per: 4,
}

// ─── Helpers ───────────────────────────────────────────────────────────────
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

// ─── Input Slider Row ──────────────────────────────────────────────────────
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
    <div className="mb-3">
      <div className="flex justify-between items-center gap-2 mb-1">
        <label htmlFor={`n_${id}`} className="text-[0.88rem] text-slate-700 dark:text-slate-300">{label}</label>
        <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2 py-0.5 min-w-[90px]">
          {unit === "₹" && <span className="text-[0.78rem] text-slate-500">₹</span>}
          <input
            type="number"
            id={`n_${id}`}
            min={min}
            step={step}
            value={value}
            onChange={e => handleChange(e.target.value)}
            className="w-16 bg-transparent border-0 text-right font-bold text-[0.95rem] text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          {unit === "%" && <span className="text-[0.78rem] text-slate-500">%</span>}
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
        className="w-full accent-indigo-600 cursor-pointer"
      />
    </div>
  )
}

// ─── Stat Tile ─────────────────────────────────────────────────────────────
function Tile({ value, label, variant = "default" }: { value: string; label: string; variant?: "default" | "good" | "warn" }) {
  const colors = {
    default: "bg-indigo-50 dark:bg-indigo-950/30",
    good: "bg-emerald-50 dark:bg-emerald-950/30",
    warn: "bg-amber-50 dark:bg-amber-950/30",
  }
  const textColors = {
    default: "text-indigo-700 dark:text-indigo-300",
    good: "text-emerald-700 dark:text-emerald-300",
    warn: "text-amber-700 dark:text-amber-300",
  }
  return (
    <div className={`${colors[variant]} rounded-2xl p-3 text-center`}>
      <div className={`text-[1.25rem] font-black leading-tight ${textColors[variant]}`}>{value}</div>
      <div className="text-[0.76rem] text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}

// ─── Waterfall Row ─────────────────────────────────────────────────────────
function WaterfallRow({ label, value, barPct, color }: { label: string; value: string; barPct: number; color: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr_90px] gap-2 items-center my-2 text-[0.84rem]">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-[22px] overflow-hidden">
        <div
          className="h-full rounded-lg transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, barPct))}%`, background: color }}
        />
      </div>
      <span className="text-right font-bold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  )
}

// ─── Donut Ring ─────────────────────────────────────────────────────────────
function RepeatDonut({ cur, rate }: { cur: number; rate: number }) {
  const RC = 314.16
  const curDash = Math.min(100, cur) / 100 * RC
  const rateDash = Math.min(100, rate) / 100 * RC
  return (
    <div className="relative w-[140px] h-[140px] flex-none">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--cp-line, #e2e8f0)" strokeWidth="12" />
        <circle cx="60" cy="60" r="50" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${rateDash} ${RC}`} className="transition-all duration-300" />
        <circle cx="60" cy="60" r="50" fill="none" stroke="#6366f1" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${curDash} ${RC}`} className="transition-all duration-300" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[1.7rem] font-black text-slate-900 dark:text-slate-100 leading-none">{pc(rate)}</span>
        <span className="text-[0.7rem] text-slate-500">repeat rate</span>
      </div>
    </div>
  )
}

// ─── Dot Grid ──────────────────────────────────────────────────────────────
function DotGrid({ cur, rate }: { cur: number; rate: number }) {
  const a = Math.round(cur / 5)
  const p = Math.round(Math.min(100, rate) / 5)
  return (
    <div className="grid grid-cols-10 gap-[5px] max-w-[280px] flex-1 min-w-[200px]">
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className={`aspect-square rounded-full flex items-center justify-center text-[0.72rem] transition-all duration-200 ${
            i < a
              ? "bg-indigo-500 text-white"
              : i < p
              ? "bg-emerald-500 text-white shadow-[0_0_0_3px_rgba(34,197,94,0.3)]"
              : "bg-slate-200 dark:bg-slate-700 opacity-70"
          }`}
        >
          👤
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function RoiCalculatorClient() {
  const [V, setV] = useState<CalcValues>({ ...DEFAULTS })
  const [F, setF] = useState<CalcFlags>({ ref: true, g: false })

  // Derived calculations
  const calc = useCallback(() => {
    const { cpd, days, bill, cur, rec, stamps, rew, food, fee, g } = V
    const st = Math.max(1, stamps)
    const month = cpd * days
    const rep = month * cur / 100
    const non = month - rep
    const recd = non * rec / 100
    const proj = rep + recd
    const rate = month > 0 ? proj / month * 100 : 0
    const sm = recd * bill
    const sy = sm * 12
    const vy = recd * 12
    const rm = proj / st
    const ry = rm * 12
    const rf = ry * rew
    const rc = rf * food / 100
    const gm = month * g / 100
    const gy = gm * 12
    const gs = gy * bill
    const lc = recd * 12
    const rr = lc * V.ref / 100
    const rn = rr * V.per
    const rs = rn * bill
    const refS = F.ref ? rs : 0
    const gS = F.g ? gs : 0
    const tot = sy + refS + gS
    const fc = tot * food / 100
    const left = tot - fc - rc - fee
    const nv = vy + (F.ref ? rn : 0) + (F.g ? gy : 0)
    const burden = bill > 0 ? rew * food / 100 / (st * bill) * 100 : 0
    const roiX = fee > 0 ? Math.max(0, left / fee) : 0
    const mg = bill * (1 - food / 100)
    const breakEven = fee > 0 && mg > 0 ? Math.ceil(fee / mg) : 0

    return {
      month, rep, non, recd, proj, rate, sm, sy, vy,
      rm, ry, rf, rc, gm, gy, gs, lc, rr, rn, rs,
      refS, gS, tot, fc, left, nv, burden, roiX, mg, breakEven,
      pctRepeat: sy > 0 && tot > 0 ? sy / tot * 100 : 0,
      pctRef: refS > 0 && tot > 0 ? refS / tot * 100 : 0,
      pctG: gS > 0 && tot > 0 ? gS / tot * 100 : 0,
    }
  }, [V, F])

  const R = calc()

  const handleChange = (id: string, v: number) => {
    setV(prev => ({ ...prev, [id]: v }))
  }

  const handleReset = () => {
    setV({ ...DEFAULTS })
    setF({ ref: true, g: false })
  }

  const setReferralPreset = (ref: number, per: number) => {
    setV(prev => ({ ...prev, ref, per }))
  }

  const inputGroups = [
    {
      label: "🏪 Your business",
      fields: [
        { id: "cpd", label: "Customers / day", min: 1, max: 300, step: 1, unit: "" },
        { id: "days", label: "Days / month", min: 1, max: 31, step: 1, unit: "" },
        { id: "bill", label: "Average bill", min: 10, max: 3000, step: 10, unit: "₹" },
        { id: "cur", label: "Current repeat customers", min: 0, max: 100, step: 1, unit: "%" },
      ],
    },
    {
      label: "🎁 Loyalty reward",
      fields: [
        { id: "stamps", label: "Stamps needed for reward", min: 1, max: 20, step: 1, unit: "" },
        { id: "rew", label: "Reward menu value", min: 10, max: 1500, step: 10, unit: "₹" },
        { id: "food", label: "Food cost", min: 0, max: 100, step: 1, unit: "%" },
      ],
    },
    {
      label: "💳 CustomerPilot & Google",
      fields: [
        { id: "fee", label: "Fee / year", min: 0, max: 20000, step: 50, unit: "₹" },
        { id: "g", label: "Extra customers from Google", min: 0, max: 15, step: 0.5, unit: "%" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#f3f5fb] dark:bg-[#0b1020] text-slate-900 dark:text-slate-100 font-sans">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="font-black text-lg text-indigo-600 dark:text-indigo-400">🚀 CustomerPilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full font-semibold">
              Live ROI Calculator
            </span>
            <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 rounded-xl hidden sm:flex">
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-16">

        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <div className="mt-5 rounded-3xl bg-gradient-to-br from-[#312e81] via-[#6d28d9] to-[#db2777] text-white p-6 sm:p-8 text-center shadow-xl">
          <p className="text-sm opacity-90 mb-1">This is the extra sales opportunity you could unlock every year</p>
          <div id="hero-roi-total" className="text-[clamp(2.2rem,8vw,3.5rem)] font-black leading-tight my-2">
            {lk(R.tot)}
          </div>
          <p className="text-sm opacity-90">
            Invest just <strong>{inr(V.fee)}</strong> / year &nbsp;•&nbsp; Estimated Return ~<strong>{lk(R.left)}</strong> / year
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-sm">
              Repeat rate <strong>{pc(V.cur)} → {pc(R.rate)}</strong>
            </span>
            <span className="bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-sm">
              Extra visits <strong>{n0(R.nv)}</strong> / year
            </span>
          </div>
        </div>

        {/* ── Sticky Mini-Summary ──────────────────────────────────────────── */}
        <div className="sticky top-14 z-40 grid grid-cols-3 gap-2 bg-[#f3f5fb] dark:bg-[#0b1020] py-3">
          {[
            { label: "Repeat rate", value: pc(R.rate) },
            { label: "Extra sales / year", value: lk(R.tot) },
            { label: "Savings / year", value: lk(R.left) },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 text-center shadow-sm">
              <div className="text-[0.68rem] text-slate-500 dark:text-slate-400">{item.label}</div>
              <div className="font-black text-[1.0rem] text-indigo-600 dark:text-indigo-400 leading-tight">{item.value}</div>
            </div>
          ))}
        </div>

        {/* ── Main 2-column Layout ─────────────────────────────────────────── */}
        <div className="lg:grid lg:grid-cols-[340px_1fr] lg:gap-5 lg:items-start mt-4 space-y-4 lg:space-y-0">

          {/* ── LEFT SIDEBAR: Controls ─────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-[calc(3.5rem+56px+8px)] space-y-4">

            {/* Recovery Rate — Primary Slider */}
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 dark:border-indigo-400 rounded-2xl p-5 shadow-md bg-gradient-to-b from-indigo-50/60 dark:from-indigo-950/30 to-white dark:to-slate-900">
              <h2 className="text-[1.05rem] font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-lg">🎯</span>
                Repeat rate: <span className="text-indigo-600 dark:text-indigo-400">{pc(V.cur)}</span> →{" "}
                <span className="text-emerald-600 dark:text-emerald-400">{pc(R.rate)}</span>
              </h2>
              <p className="text-[0.82rem] text-slate-500 dark:text-slate-400 mb-3">
                Of the customers who don&apos;t return, how many can you win back?{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">+{pc(R.rate - V.cur)} points</strong>
              </p>
              <SliderRow id="rec" label="% who return" min={0} max={100} step={1} unit="%" value={V.rec} onChange={handleChange} />
            </div>

            {/* Input Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">✏️</span>
                Enter your own numbers
              </h2>
              {inputGroups.map(group => (
                <div key={group.label}>
                  <div className="text-[0.72rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-4 mb-1">{group.label}</div>
                  {group.fields.map(f => (
                    <SliderRow key={f.id} {...f} value={V[f.id as keyof CalcValues]} onChange={handleChange} />
                  ))}
                </div>
              ))}
              <div className="flex justify-between items-center mt-3 text-[0.82rem] text-slate-500 dark:text-slate-400">
                <span>Monthly customers: <strong className="text-slate-900 dark:text-slate-100">{n0(R.month)}</strong></span>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 border border-indigo-400 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-full text-[0.82rem] hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>
          </aside>

          {/* ── RIGHT MAIN: Results ────────────────────────────────────────── */}
          <main className="space-y-4">

            {/* Section: Repeat Customers */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-black flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-lg">🔁</span>
                Repeat customers
              </h2>
              <p className="text-[0.82rem] text-slate-500 dark:text-slate-400 mb-4">
                Earlier <strong>{pc(V.cur)}</strong> returned → now <strong>{pc(R.rate)}</strong> will return
              </p>
              {/* Donut + Dots */}
              <div className="flex items-center gap-6 flex-wrap justify-center mb-4">
                <RepeatDonut cur={V.cur} rate={R.rate} />
                <DotGrid cur={V.cur} rate={R.rate} />
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[0.74rem] text-slate-500 dark:text-slate-400 mb-4">
                <span><i className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1" />Already repeating</span>
                <span><i className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1" />Won back by CustomerPilot</span>
                <span><i className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300 mr-1" />Don&apos;t return</span>
                <span>1 dot = 5%</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Tile value={n0(R.non)} label="don't return / month" />
                <Tile value={`+${n0(R.recd)}`} label="new repeat / month" variant="good" />
                <Tile value={n0(R.proj)} label="total repeat / month" variant="good" />
                <Tile value={`+${pc(R.rate - V.cur)}`} label="rise in repeat rate" />
              </div>
            </section>

            {/* Section: Extra Sales */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-black flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-lg">💰</span>
                Extra sales from repeat visits
              </h2>
              <p className="text-[0.82rem] text-slate-500 dark:text-slate-400 mb-4">Recovered customers × your average bill</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Tile value={n0(R.recd)} label="extra visits / month" />
                <Tile value={inr(R.sm)} label="extra sales / month" />
                <Tile value={n0(R.vy)} label="extra visits / year" />
                <Tile value={lk(R.sy)} label="extra sales / year" variant="good" />
              </div>
            </section>

            {/* Section: Reward Cost */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-black flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-lg">🎁</span>
                Cost of rewards
              </h2>
              <p className="text-[0.82rem] text-slate-500 dark:text-slate-400 mb-4">Not menu value — your actual food cost</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Tile value={n0(R.rm)} label="rewards / month" />
                <Tile value={n0(R.ry)} label="rewards / year" />
                <Tile value={lk(R.rf)} label="menu value / year" />
                <Tile value={lk(R.rc)} label="actual food cost / year" variant="warn" />
              </div>
              <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-[0.82rem] text-slate-700 dark:text-slate-300">
                Reward burden: <strong>{pc(R.burden)}</strong> — this share of value goes to the reward on every purchase cycle.
              </div>
            </section>

            {/* Section: Total Sales & Savings */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-black flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-lg">📊</span>
                Total sales and savings
              </h2>
              {/* Toggles */}
              <div className="flex flex-wrap gap-4 text-[0.85rem] mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={F.ref}
                    onChange={e => setF(p => ({ ...p, ref: e.target.checked }))}
                    className="accent-indigo-600 w-4 h-4"
                  />
                  Include referral sales
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={F.g}
                    onChange={e => setF(p => ({ ...p, g: e.target.checked }))}
                    className="accent-indigo-600 w-4 h-4"
                  />
                  Include Google sales
                </label>
              </div>
              {/* Stacked bar */}
              <div className="flex h-5 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 mb-1">
                <div className="h-full transition-all duration-300" style={{ width: `${R.pctRepeat}%`, background: "#4f46e5" }} />
                <div className="h-full transition-all duration-300" style={{ width: `${R.pctRef}%`, background: "#22c55e" }} />
                <div className="h-full transition-all duration-300" style={{ width: `${R.pctG}%`, background: "#f59e0b" }} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[0.76rem] text-slate-500 dark:text-slate-400 mb-4">
                <span><i className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-600 mr-1" />Repeat <strong>{pc(R.pctRepeat)}</strong></span>
                <span><i className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-1" />Referral <strong>{pc(R.pctRef)}</strong></span>
                <span><i className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 mr-1" />Google <strong>{pc(R.pctG)}</strong></span>
              </div>
              {/* Waterfall */}
              <WaterfallRow label="Repeat sales" value={lk(R.sy)} barPct={R.tot > 0 ? R.sy / R.tot * 100 : 0} color="#4f46e5" />
              <WaterfallRow label="+ Referral sales" value={lk(R.refS)} barPct={R.tot > 0 ? R.refS / R.tot * 100 : 0} color="#22c55e" />
              <WaterfallRow label="+ Google sales" value={lk(R.gS)} barPct={R.tot > 0 ? R.gS / R.tot * 100 : 0} color="#f59e0b" />
              <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-2 mt-1">
                <WaterfallRow label="= Total sales" value={lk(R.tot)} barPct={100} color="#0f766e" />
              </div>
              <WaterfallRow label="− Food cost" value={lk(R.fc)} barPct={R.tot > 0 ? R.fc / R.tot * 100 : 0} color="#ea580c" />
              <WaterfallRow label="− Reward cost" value={lk(R.rc)} barPct={R.tot > 0 ? R.rc / R.tot * 100 : 0} color="#ca8a04" />
              <WaterfallRow label="− CustomerPilot" value={inr(V.fee)} barPct={R.tot > 0 ? V.fee / R.tot * 100 : 0} color="#dc2626" />

              {/* Savings block */}
              <div className="mt-4 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 dark:border-emerald-600 rounded-2xl p-4 text-center">
                <p className="text-[0.84rem] text-slate-700 dark:text-slate-300">
                  = Extra Profit Opportunity using CustomerPilot <strong>{inr(V.fee)}</strong>/year
                </p>
                <div
                  className="text-[2rem] font-black my-2 transition-colors"
                  style={{ color: R.left < 0 ? "#b91c1c" : "#15803d" }}
                >
                  {lk(R.left)}
                </div>
                {V.fee > 0 && (
                  <span className="inline-block bg-emerald-600 text-white rounded-full px-4 py-1 text-[0.82rem] font-bold">
                    ≈ {R.roiX.toFixed(0)}x return on your CustomerPilot fee
                  </span>
                )}
              </div>
              <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 text-[0.8rem] text-slate-600 dark:text-slate-400">
                This is not net profit — rent, salaries, electricity, GST, payment charges and wastage are not included.
              </div>
            </section>

            {/* Section: Google Reviews */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-black flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-lg">⭐</span>
                New customers from Google Reviews
              </h2>
              <p className="text-[0.82rem] text-slate-500 dark:text-slate-400 mb-4">Better, more reviews = more visibility on Google</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Tile value={n0(R.gm)} label="new customers / month" />
                <Tile value={n0(R.gy)} label="new customers / year" />
                <Tile value={lk(R.gs)} label="potential sales / year" variant="good" />
              </div>
              <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-[0.82rem] text-slate-700 dark:text-slate-300">
                Repeat + Google total opportunity: <strong>{lk(R.sy + R.gs)}</strong> / year (may overlap). Track referrals separately.
              </div>
            </section>

            {/* Section: Referrals */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-black flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-lg">🤝</span>
                Referrals: loyal customers → new customers
              </h2>
              <p className="text-[0.82rem] text-slate-500 dark:text-slate-400 mb-3">
                Loyal customers recovered × % who refer × new customers each referrer brings
              </p>
              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "Conservative", ref: 10, per: 1 },
                  { label: "Average", ref: 20, per: 2 },
                  { label: "Strong", ref: 30, per: 3 },
                  { label: "3–5 assumption", ref: 100, per: 4 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setReferralPreset(preset.ref, preset.per)}
                    className="px-3 py-1 border border-indigo-400 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-full text-[0.76rem] hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <SliderRow id="ref" label="% of loyal customers who refer" min={0} max={100} step={1} unit="%" value={V.ref} onChange={handleChange} />
              <SliderRow id="per" label="New customers each referrer brings (per 365 days)" min={0} max={10} step={0.5} unit="" value={V.per} onChange={handleChange} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <Tile value={n0(R.lc)} label="loyal customers / year" />
                <Tile value={n0(R.rr)} label="customers who refer" />
                <Tile value={n0(R.rn)} label="new customers / year" variant="good" />
                <Tile value={lk(R.rs)} label="potential sales / year (1 visit)" variant="good" />
              </div>
              <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-[0.8rem] text-slate-600 dark:text-slate-400">
                On average, each loyal customer brings ~<strong>{(V.ref * V.per / 100).toFixed(2)}</strong> new customer (over 365 days).{" "}
                {V.ref >= 60 && (
                  <span className="text-amber-700 dark:text-amber-400">
                    ⚠️ Best case: assumes every loyal customer refers — real-world rates are usually much lower.{" "}
                  </span>
                )}
                <br />
                These referral sales are added into &quot;Total sales&quot; and &quot;Savings&quot; above. Turn the toggle off above to avoid double-counting with Google.
              </div>
            </section>

            {/* Section: Extra Benefits */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-black flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-lg">✨</span>
                Extra benefits — beyond just sales
              </h2>
              <p className="text-[0.82rem] text-slate-500 dark:text-slate-400 mb-4">
                Things CustomerPilot does for you behind the scenes, every single day
              </p>
              <ul className="space-y-2">
                {[
                  { icon: "🗂️", title: "Customer database, built automatically", desc: "Every scan saves name, visits & spend — no manual Excel or register needed." },
                  { icon: "💬", title: "WhatsApp reminders, sent for you", desc: "Inactive customers get nudged automatically — no staff follow-up required." },
                  { icon: "⭐", title: "Google reviews, requested on autopilot", desc: "Happy repeat customers are prompted for a review at the right moment." },
                  { icon: "📊", title: "Live dashboard, always up to date", desc: "See repeat rate, top customers & rewards claimed anytime, on any device." },
                  { icon: "🔒", title: "Your data, safely backed up", desc: "No risk of a lost register or a staff member's personal phone holding your customer list." },
                  { icon: "🕒", title: "Time saved for staff", desc: "No manual stamping registers or counting — one scan does it all." },
                ].map(item => (
                  <li key={item.title} className="flex gap-3 items-start bg-indigo-50 dark:bg-indigo-950/30 rounded-xl px-4 py-3">
                    <span className="text-xl flex-none">{item.icon}</span>
                    <div>
                      <div className="font-bold text-[0.9rem] text-slate-900 dark:text-slate-100">{item.title}</div>
                      <div className="text-[0.8rem] text-slate-500 dark:text-slate-400">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── CTA Block ─────────────────────────────────────────────────── */}
            <div className="rounded-3xl bg-gradient-to-br from-[#15803d] to-[#0f766e] text-white p-6 sm:p-8 text-center shadow-xl">
              <p className="text-sm opacity-90 mb-3 font-semibold">Your cost vs your opportunity</p>
              <div className="flex justify-center items-center gap-6 flex-wrap mb-4">
                <div className="bg-white/15 rounded-2xl px-6 py-3 text-center">
                  <div className="text-xs opacity-80">CustomerPilot</div>
                  <div className="text-[1.7rem] font-black leading-tight">{inr(V.fee)}</div>
                  <div className="text-xs opacity-80">/ year</div>
                </div>
                <div className="text-2xl opacity-60">vs</div>
                <div className="bg-white/15 rounded-2xl px-6 py-3 text-center">
                  <div className="text-xs opacity-80">Potential extra sales</div>
                  <div className="text-[1.7rem] font-black leading-tight">{lk(R.tot)}</div>
                  <div className="text-xs opacity-80">/ year</div>
                </div>
              </div>
              {V.fee > 0 && R.mg > 0 && R.breakEven > 0 && (
                <p className="text-sm opacity-90 mb-5">
                  You need only ~<strong>{n0(R.breakEven)} extra visits / year</strong> (~{n0(Math.max(1, Math.ceil(R.breakEven / 12)))} / month) to cover the fee.
                  Every ₹1 of fee opens up ~₹{(R.tot / V.fee).toFixed(0)} of sales opportunity.
                </p>
              )}
              <Button asChild size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 font-black text-sm px-8 py-4 rounded-2xl shadow-lg">
                <Link href="/signup">
                  Start Free Trial — No Credit Card <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

          </main>
        </div>

        {/* Footer */}
        <footer className="text-center text-[0.75rem] text-slate-400 dark:text-slate-600 pt-8 pb-4">
          Illustrative projection — based on the numbers you entered. No sales are guaranteed. Please don&apos;t incentivise reviews with rewards.
        </footer>
      </div>
    </div>
  )
}
