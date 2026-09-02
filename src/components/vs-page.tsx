import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, X, ArrowUpRight } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export interface VsPageConfig {
  competitor: string
  competitorShort: string
  headlineKeyword: string
  metaTitle: string
  metaDescription: string
  canonicalSlug: string
  heroHeadline: string
  heroSubtext: string
  coreProblem: string
  pricingComparison: { competitorLabel: string; competitorCost: string; competitorPer: string; cpCost: string; cpPer: string; savings: string }
  comparisonRows: { feature: string; competitor: string | null; cp: string; winner: "cp" | "tie" | "competitor" }[]
  bestForCompetitor: string
  bestForCP: string
}

export function VsPage({ config }: { config: VsPageConfig }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/"><BrandLogo size="sm" /></Link>
          <Link href="/signup" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">Start Free Trial</Link>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-6">
              ⚡ {config.competitor} vs CustomerPilot — Honest Comparison
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {config.heroHeadline}
            </h1>
            <p className="mt-6 text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              {config.heroSubtext}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="w-full sm:w-auto inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all">
                Try CustomerPilot Free — 7 Days <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all">
                View 50% Off Pricing <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Core Argument ── */}
        <section className="py-14 sm:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-8">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">The Core Argument</div>
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed">{config.coreProblem}</p>
            </div>
          </div>
        </section>

        {/* ── Pricing Delta ── */}
        <section className="py-14 sm:py-16 bg-slate-50 border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Annual Cost Comparison</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{config.pricingComparison.competitorLabel}</div>
                <div className="text-3xl font-black text-slate-700">{config.pricingComparison.competitorCost}<span className="text-base font-normal text-slate-400">/year</span></div>
                <div className="text-sm text-slate-500 mt-1">{config.pricingComparison.competitorPer} per day</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-300 p-6 relative overflow-hidden">
                <div className="absolute top-3 right-3 text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">50% OFF</div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">CustomerPilot (Pro Plan)</div>
                <div className="text-3xl font-black text-emerald-700">{config.pricingComparison.cpCost}<span className="text-base font-normal text-emerald-500">/year</span></div>
                <div className="text-sm text-emerald-600 mt-1">{config.pricingComparison.cpPer} per day</div>
                <div className="mt-3 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full inline-block">
                  You save {config.pricingComparison.savings}/year
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Matrix ── */}
        <section className="py-14 sm:py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-10">
              {config.competitor} vs CustomerPilot — Feature Comparison
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-5 py-4 font-bold text-xs">Feature</th>
                    <th className="text-center px-4 py-4 font-bold text-xs text-slate-400">{config.competitor}</th>
                    <th className="text-center px-4 py-4 font-bold text-xs text-emerald-300">CustomerPilot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {config.comparisonRows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 text-xs">{row.feature}</td>
                      <td className="px-4 py-3.5 text-center text-xs">
                        {row.competitor === null ? (
                          <X className="w-4 h-4 text-red-400 mx-auto" />
                        ) : (
                          <span className={row.winner === "competitor" ? "font-bold text-blue-700" : "text-slate-400"}>{row.competitor}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs">
                        <span className={`font-bold ${row.winner === "cp" ? "text-emerald-700" : "text-slate-600"} flex items-center justify-center gap-1`}>
                          {row.winner === "cp" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          {row.cp}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Best For ── */}
        <section className="py-14 sm:py-16 bg-slate-50 border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Who Should Use What?</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Use {config.competitor} If...</div>
                <p className="text-slate-700 text-sm leading-relaxed">{config.bestForCompetitor}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Use CustomerPilot If...</div>
                <p className="text-emerald-900 text-sm leading-relaxed font-medium">{config.bestForCP}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 sm:py-20 bg-slate-900 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-black">Switch Today — Risk-Free 7-Day Trial</h2>
            <p className="text-slate-400 text-sm mt-3">No credit card. No app for customers. Setup in 3 minutes.</p>
            <Link href="/signup" className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm shadow-lg transition-all hover:scale-[1.02]">
              Start Free Trial Today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
