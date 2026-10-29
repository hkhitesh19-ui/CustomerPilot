const fs = require("fs");
const path = require("path");

const pagePath = path.join(__dirname, "../src/app/page.tsx");
const pageContent = fs.readFileSync(pagePath, "utf8");

const growthSection = `
      {/* ============ BUSINESS GROWTH DASHBOARD SECTION ============ */}
      <section className="py-20 bg-white border-t border-slate-200/80" id="growth-insights">
        <div className="wrap">
          <div className="sec-head max-w-3xl mx-auto text-center">
            <span className="eyebrow inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs shadow-xs">
              📊 Business Growth Intelligence
            </span>
            <h2 className="sec-h text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mt-4 leading-tight">
              Know Which Customers Are Coming Back — And Why.
            </h2>
            <p className="sec-sub text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              CustomerPilot shows you the numbers that actually drive profit: customer growth, repeat visits, loyalty activity, and Google reputation — all in one simple view.
            </p>
          </div>

          {/* Clean Dashboard Snapshot Container */}
          <div className="max-w-5xl mx-auto mt-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-8">
            {/* Top Bar of the Dashboard Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">Real-Time Store Performance Snapshot</h3>
                  <p className="text-xs text-slate-400">Live walk-in analytics & loyalty retention metrics</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-emerald-400">
                <span>⚡ Updated automatically via WhatsApp</span>
              </div>
            </div>

            {/* 6 Key KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Card 1: Customer Growth */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer Growth</div>
                <div className="text-xl sm:text-2xl font-black text-white">1,248</div>
                <div className="text-[10px] font-bold text-emerald-400">↑ 18% this month</div>
              </div>

              {/* Card 2: Returning Customers */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Returning Regulars</div>
                <div className="text-xl sm:text-2xl font-black text-white">486</div>
                <div className="text-[10px] font-bold text-emerald-400">↑ 12% this month</div>
              </div>

              {/* Card 3: Loyalty Members */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Loyalty Members</div>
                <div className="text-xl sm:text-2xl font-black text-white">732</div>
                <div className="text-[10px] font-bold text-slate-400">58% of customers</div>
              </div>

              {/* Card 4: Google Reviews */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Google Reviews</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1">
                  4.8 <span className="text-sm">★</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-400">+64 new reviews</div>
              </div>

              {/* Card 5: Repeat Visits */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Repeat Visits</div>
                <div className="text-xl sm:text-2xl font-black text-white">326</div>
                <div className="text-[10px] font-bold text-emerald-400">This Month</div>
              </div>

              {/* Card 6: Rewards Redeemed */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rewards Claimed</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">184</div>
                <div className="text-[10px] font-bold text-slate-300">Customers Returned</div>
              </div>
            </div>

            {/* Lifecycle Conversion Funnel Strip */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Your Predictable Customer Lifecycle:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">1. New Walk-ins</div>
                  <div className="text-base font-bold text-white mt-0.5">1,248 Gained</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">2. Returning Customers</div>
                  <div className="text-base font-bold text-blue-400 mt-0.5">486 Returned</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">3. Loyal VIP Members</div>
                  <div className="text-base font-bold text-purple-400 mt-0.5">732 Active VIPs</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 font-medium">4. Repeat Revenue</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">₹2,84,000+ Added</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Growth Pillars (Actionable Explanations Below the Mockup) */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10">
            {/* Pillar 1: Track Repeat Business & Inactivity */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">
                🔄
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Track Repeat Business & Engagement</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Know which customers are active regulars and which are becoming inactive. Trigger automated 14-day WhatsApp win-backs before you lose them to competitors.
              </p>
            </div>

            {/* Pillar 2: Measure Loyalty Program ROI */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl">
                🎁
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Measure Loyalty Program & Rewards</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Track exact stamps collected, rewards earned, and free items redeemed. Understand which perks bring back the most customers without eroding your margins.
              </p>
            </div>

            {/* Pillar 3: Monitor Google Reputation & 1-Click AutoReplies */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl">
                ⭐
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Monitor Your Google Reputation</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Watch your 5-star review count climb every week. Ensure 100% of reviews get an AI-drafted owner response in 1-Click to rank higher on Google Maps.
              </p>
            </div>
          </div>
        </div>
      </section>
`;

const target = "{/* ============ FEATURES (The 3 Engines) ============ */}";
if (!pageContent.includes(target)) {
  console.error("Target string not found in page.tsx");
  process.exit(1);
}

const updatedContent = pageContent.replace(target, growthSection + "\n      " + target);
fs.writeFileSync(pagePath, updatedContent, "utf8");
console.log("Successfully inserted growth insights section into src/app/page.tsx");
