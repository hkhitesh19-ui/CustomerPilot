import re

def main():
    path = "src/components/pricing/pricing-studio.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update COMPLETE_TIERS
    old_complete_tiers = """export const COMPLETE_TIERS = [
  { t: "6 Months", d: 180, s: 2499, m: 2499, planKey: "growth_180", badge: "6 Months", isPostpaid: false },
  { t: "12 Months", d: 365, s: 3499, m: 3499, planKey: "enterprise_365", badge: "Best Value", isPostpaid: false }
]"""

    new_complete_tiers = """export const COMPLETE_TIERS = [
  { t: "6 Months", d: 180, s: 1899, m: 1899, planKey: "growth_180", badge: "6 Months", isPostpaid: false },
  { t: "12 Months", d: 365, s: 2499, m: 2499, planKey: "enterprise_365", badge: "Best Value", isPostpaid: false }
]"""
    content = content.replace(old_complete_tiers, new_complete_tiers)

    # 2. Update GEAR_COMBOS
    # Find start of GEAR_COMBOS and end of GEAR_COMBOS array
    gear_start = content.find("export const GEAR_COMBOS: GearComboDefinition[] = [")
    gear_end = content.find("export const getGearSavings1Yr =")

    if gear_start == -1 or gear_end == -1:
        print("ERROR: Could not locate GEAR_COMBOS")
        return

    new_gears = """export const GEAR_COMBOS: GearComboDefinition[] = [
  {
    gearKey: "gear_1",
    name: "Gear 1 : Smart Digital Business Card + Smart AI Google Review System",
    subtitle: "Interactive digital business card plus autonomous AI Google review acceleration for local stores.",
    badge: "⭐ Gear 1 · Card + Reviews",
    iconBg: "bg-emerald-600",
    modulesIncluded: ["card", "star"],
    tenures: {
      180: { offer: 899, regular: 899, planKey: "gear1_6mo" },
      365: { offer: 1249, regular: 1249, planKey: "gear1_yearly" }
    }
  },
  {
    gearKey: "gear_2",
    name: "Gear 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System",
    subtitle: "High-retention combo: WhatsApp automated loyalty stamps plus interactive digital business card.",
    badge: "🚀 Gear 2 · Card + Loyalty",
    iconBg: "bg-purple-600",
    modulesIncluded: ["card", "loyalty"],
    tenures: {
      180: { offer: 1499, regular: 1499, planKey: "gear2_6mo" },
      365: { offer: 2249, regular: 2249, planKey: "gear2_yearly" }
    }
  },
  {
    gearKey: "gear_3",
    name: "Gear 3 : WhatsApp Digital Loyalty + Smart AI Google Review System + Smart Digital Business Card",
    subtitle: "Trio retention suite: Digital card, WhatsApp loyalty stamps, and smart AI Google reviews.",
    badge: "⚡ Gear 3 · Power Trio",
    iconBg: "bg-blue-600",
    modulesIncluded: ["card", "loyalty", "star"],
    tenures: {
      180: { offer: 1799, regular: 1799, planKey: "gear3_6mo" },
      365: { offer: 2499, regular: 2499, planKey: "gear3_yearly" }
    }
  },
  {
    gearKey: "gear_4",
    name: "Gear 4 : All 4 Core Engines",
    subtitle: "Smart Digital Business Card + WhatsApp Digital Loyalty + Smart AI Google Review System + AutoReply to GoogleReview.",
    badge: "👑 Gear 4 · All 4 Core Engines",
    iconBg: "bg-indigo-600",
    modulesIncluded: ["card", "loyalty", "star", "chat"],
    tenures: {
      180: { offer: 1899, regular: 1899, planKey: "growth_180" },
      365: { offer: 2499, regular: 2499, planKey: "enterprise_365" }
    }
  },
  {
    gearKey: "gear_5",
    name: "Gear 5 : CustomerPilot All-in-One Enterprise",
    subtitle: "All 8 Engines: Card, Loyalty, Reviews, AutoReply, Dynamic QR Studio, WhatsApp Group Booster, Smart POS Billing & Invoicing, and 24/7 AI WhatsApp ChatBot.",
    badge: "💎 Gear 5 · All-in-One Enterprise",
    iconBg: "bg-rose-600",
    modulesIncluded: ["card", "loyalty", "star", "chat", "qr_lite", "wa_booster", "smart_billing", "chatbot"],
    tenures: {
      30: { offer: 999, regular: 999, planKey: "gear5_monthly" },
      365: { offer: 9999, regular: 9999, planKey: "gear5_yearly" }
    }
  }
]

"""
    content = content[:gear_start] + new_gears + content[gear_end:]

    # 3. Update STANDALONE_SERVICES
    serv_start = content.find("export const STANDALONE_SERVICES = [")
    serv_end = content.find("// Formatting helpers")

    if serv_start == -1 or serv_end == -1:
        print("ERROR: Could not locate STANDALONE_SERVICES")
        return

    new_services = """export const STANDALONE_SERVICES = [
  {
    i: "star",
    n: "Smart AI Google Review System",
    t: "Autonomous WhatsApp review collection with AI-drafted, SEO-optimized 5-star customer reviews.",
    planKey6Mo: "reviews_6mo",
    planKey1Yr: "reviews_yearly",
    p: { 180: [649, 1099], 365: [999, 999] } as Record<number, [number, number]>,
    iconBg: "bg-amber-500",
    colorText: "text-amber-500 dark:text-amber-400"
  },
  {
    i: "loyalty",
    n: "WhatsApp Digital Loyalty Membership Club",
    t: "Automated WhatsApp loyalty stamp cards, milestone rewards, and customer VIP tier progression club.",
    planKey6Mo: "loyalty_6mo",
    planKey1Yr: "loyalty_yearly",
    p: { 180: [1199, 1999], 365: [1999, 1999] } as Record<number, [number, number]>,
    iconBg: "bg-purple-600",
    colorText: "text-purple-600 dark:text-purple-400"
  },
  {
    i: "card",
    n: "Smart Digital Business Card",
    t: "Interactive Smart QR digital card with 1-tap contact saving, catalog links, and instant review collection.",
    planKey6Mo: "card_6mo",
    planKey1Yr: "card_yearly",
    p: { 180: [349, 699], 365: [549, 549] } as Record<number, [number, number]>,
    lt: [1499, 3999] as [number, number],
    planKeyLt: "card_lifetime",
    iconBg: "bg-indigo-600",
    colorText: "text-indigo-600 dark:text-indigo-400"
  },
  {
    i: "chat",
    n: "AutoReply to GoogleReview",
    t: "AI-drafted, SEO-rich owner replies published in 1-click to Google Maps via official Google OAuth.",
    planKey6Mo: "autoreply_6mo",
    planKey1Yr: "autoreply_yearly",
    p: { 180: [649, 1099], 365: [999, 999] } as Record<number, [number, number]>,
    iconBg: "bg-blue-600",
    colorText: "text-blue-600 dark:text-blue-400"
  },
  {
    i: "qr_lite",
    n: "Dynamic QR Studio (QR Tiger Alternative)",
    t: "Self-hosted permanent dynamic QR with unlimited destination updates, 0 paid APIs, and scan analytics.",
    planKey6Mo: "qr_lite_monthly",
    planKey1Yr: "qr_lite_yearly",
    p: { 180: [499, 999], 365: [699, 1499] } as Record<number, [number, number]>,
    iconBg: "bg-emerald-600",
    colorText: "text-emerald-600 dark:text-emerald-400"
  },
  {
    i: "wa_booster",
    n: "WhatsApp Group Booster & Lead Capture",
    t: "Dynamic QR with pre-redirect customer registration form, capturing Name + WhatsApp into CRM.",
    planKey6Mo: "wa_booster_monthly",
    planKey1Yr: "wa_booster_yearly",
    p: { 180: [1499, 2999], 365: [2499, 4999] } as Record<number, [number, number]>,
    iconBg: "bg-teal-600",
    colorText: "text-teal-600 dark:text-teal-400"
  },
  {
    i: "smart_billing",
    n: "Smart POS Billing & WhatsApp Invoicing Pro",
    t: "Mobile POS billing with auto GST, 1-click thermal print + automated WhatsApp PDF invoice delivery.",
    planKey6Mo: "smart_billing_monthly",
    planKey1Yr: "smart_billing_yearly",
    p: { 180: [2999, 5999], 365: [4999, 9999] } as Record<number, [number, number]>,
    iconBg: "bg-indigo-600",
    colorText: "text-indigo-600 dark:text-indigo-400"
  },
  {
    i: "chatbot",
    n: "24/7 AI WhatsApp ChatBot",
    t: "Multilingual AI assistant answering customer queries, qualifying leads, and routing inquiries 24/7.",
    planKey6Mo: "gear5_monthly",
    planKey1Yr: "gear5_monthly",
    p: { 180: [999, 999], 365: [999, 999] } as Record<number, [number, number]>,
    iconBg: "bg-rose-600",
    colorText: "text-rose-600 dark:text-rose-400"
  }
]

"""
    content = content[:serv_start] + new_services + content[serv_end:]

    # 4. Update Card Thematic Styles (cardBorder, badgeTheme, primaryBtnTheme, primaryBoxBg)
    style_pattern = r'const cardBorder =[\s\S]+?const primaryBoxBg =[\s\S]+?bg-amber-50/50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60"'
    
    new_style_block = """const cardBorder =
              combo.gearKey === "gear_5"
                ? "border-2 border-rose-500/70 dark:border-rose-500/80 shadow-md hover:shadow-xl hover:shadow-rose-500/10 ring-1 ring-rose-500/20"
                : combo.gearKey === "gear_4"
                ? "border-2 border-indigo-600 dark:border-indigo-500 shadow-md hover:shadow-xl hover:shadow-indigo-500/10"
                : combo.gearKey === "gear_3"
                ? "border-2 border-blue-500/50 dark:border-blue-600/70 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                : combo.gearKey === "gear_2"
                ? "border-2 border-purple-500/50 dark:border-purple-600/70 shadow-sm hover:shadow-lg hover:shadow-purple-500/10"
                : "border-2 border-emerald-500/50 dark:border-emerald-600/70 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10"

            const badgeTheme =
              combo.gearKey === "gear_5"
                ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800"
                : combo.gearKey === "gear_4"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800"
                : combo.gearKey === "gear_3"
                ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800"
                : combo.gearKey === "gear_2"
                ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800"

            const primaryBtnTheme =
              combo.gearKey === "gear_5"
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                : combo.gearKey === "gear_4"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                : combo.gearKey === "gear_3"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                : combo.gearKey === "gear_2"
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"

            const primaryBoxBg =
              combo.gearKey === "gear_5"
                ? "bg-rose-50/50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/60"
                : combo.gearKey === "gear_4"
                ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800/60"
                : combo.gearKey === "gear_3"
                ? "bg-blue-50/50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/60"
                : combo.gearKey === "gear_2"
                ? "bg-purple-50/50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/60"
                : "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60\""""

    content = re.sub(style_pattern, new_style_block, content)

    # 5. In the card JSX pricing tiers section, handle Gear 5 which has both 365 (₹9,999/yr) and 30 (₹999/mo):
    # Let's inspect how pricing tiers are rendered:
    old_pricing_block = """                {/* Pricing Tiers Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {isMonthly ? (
                    /* ─── Gear 6 Monthly Plan ─── */
                    <div className={`p-4 rounded-2xl border transition-all ${primaryBoxBg}`}>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Monthly Subscription
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                          30 Days
                        </span>
                      </div>

                      {/* Price Line */}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {inr(p30)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          / month
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-auto">
                          {dy(p30, 30)}
                        </span>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectGearCombo(combo, 30)}
                        className={`w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-black shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5 ${primaryBtnTheme}`}
                      >
                        <span>Choose Monthly Plan ({inr(p30)}/mo)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* ─── 1 Year Plan (Featured Primary Offer) ─── */}
                      <div className={`p-4 rounded-2xl border transition-all ${primaryBoxBg}`}>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            1 Year Plan
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-700">
                            365 Days
                          </span>
                        </div>

                        {/* Price Line */}
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {inr(p365)}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-auto">
                            {dy(p365, 365)}
                          </span>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 365)}
                          className={`w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-black shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5 ${primaryBtnTheme}`}
                        >
                          <span>Choose 1 Year Plan ({inr(p365)})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* ─── 6 Months Plan (Secondary Option) ─── */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            6 Months Plan
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {inr(p180)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {dy(p180, 180)}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 180)}
                          className="w-full mt-2.5 py-2 px-3 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Choose 6 Months Plan ({inr(p180)})</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>"""

    new_pricing_block = """                {/* Pricing Tiers Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {combo.gearKey === "gear_5" ? (
                    /* ─── Gear 5 Enterprise (1 Year + Monthly) ─── */
                    <>
                      {/* 1 Year Enterprise */}
                      <div className={`p-4 rounded-2xl border transition-all ${primaryBoxBg}`}>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            1 Year Enterprise Plan
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                            365 Days
                          </span>
                        </div>

                        {/* Price Line */}
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {inr(p365)}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-auto">
                            {dy(p365, 365)}
                          </span>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 365)}
                          className={`w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-black shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5 ${primaryBtnTheme}`}
                        >
                          <span>Choose 1 Year Enterprise ({inr(p365)}/yr)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Monthly Enterprise Option */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            Monthly Enterprise
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {inr(p30)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              / month
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 30)}
                          className="w-full mt-2.5 py-2 px-3 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Choose Monthly ({inr(p30)}/mo)</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* ─── 1 Year Plan (Featured Primary Offer) ─── */}
                      <div className={`p-4 rounded-2xl border transition-all ${primaryBoxBg}`}>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            1 Year Plan
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-700">
                            365 Days
                          </span>
                        </div>

                        {/* Price Line */}
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {inr(p365)}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-auto">
                            {dy(p365, 365)}
                          </span>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 365)}
                          className={`w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-black shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5 ${primaryBtnTheme}`}
                        >
                          <span>Choose 1 Year Plan ({inr(p365)})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* ─── 6 Months Plan (Secondary Option) ─── */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            6 Months Plan
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {inr(p180)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {dy(p180, 180)}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 180)}
                          className="w-full mt-2.5 py-2 px-3 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Choose 6 Months Plan ({inr(p180)})</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>"""

    content = content.replace(old_pricing_block, new_pricing_block)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    print("SUCCESS: Updated src/components/pricing/pricing-studio.tsx")

if __name__ == "__main__":
    main()
