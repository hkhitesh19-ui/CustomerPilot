const fs = require("fs");
const path = require("path");

const pagePath = path.join(__dirname, "../src/app/page.tsx");
const home2Dir = path.join(__dirname, "../src/app/home2");
const home2Path = path.join(home2Dir, "page.tsx");

const pageContent = fs.readFileSync(pagePath, "utf8");

const newSection = `
      {/* ============ WHY MERCHANTS CHOOSE CUSTOMERPILOT (New High-Impact Section) ============ */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80" id="why-merchants">
        <div className="wrap">
          <div className="sec-head max-w-3xl mx-auto text-center">
            <span className="eyebrow inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs shadow-xs">
              ⚡ Store Owner Advantage
            </span>
            <h2 className="sec-h text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mt-4 leading-tight">
              Built for Real Store Growth. Zero Fluff.
            </h2>
            <p className="sec-sub text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Designed to retain your walk-ins, save staff time, and automate 5-star reputation on Google Maps.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {/* Pillar 1: 100% App-Free Customer Retention */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl font-bold">
                  🎁
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  3x Higher Customer Adoption
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">100% App-Free Customer Retention</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Customers never have to download heavy apps or remember passwords. The digital loyalty card lives directly inside their WhatsApp, ensuring maximum customer participation.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Works on every smartphone camera instantly
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  No app download friction or sign-up drop-offs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Turns 1-time visitors into 10x regular customers
                </li>
              </ul>
            </div>

            {/* Pillar 2: 1-Click Google Maps Reputation Engine */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-2xl font-bold">
                  ⭐
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                  Rank #1 on Google Maps
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">1-Click Google Reputation Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Effortlessly collect authentic 5-star customer reviews right after purchase. AI automatically drafts appreciative, context-aware owner responses ready for 1-click publishing.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Automated WhatsApp review prompts after checkout
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  AI drafts thoughtful owner responses in 1 second
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Skyrockets neighborhood search visibility & foot traffic
                </li>
              </ul>
            </div>

            {/* Pillar 3: 98% Open-Rate WhatsApp Marketing */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-2xl font-bold">
                  📱
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  98% Message Open Rate
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">98% Open-Rate WhatsApp Automation</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SMS and promotional emails get lost in spam folders. Direct WhatsApp loyalty triggers deliver unmatched engagement for birthday rewards and automated customer win-backs.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Delivers messages where customers actually look
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Automated birthday greetings and reward perks
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  14-day inactivity win-back reminders that drive repeat visits
                </li>
              </ul>
            </div>

            {/* Pillar 4: Zero Staff Friction (5-Second Cashier Tap) */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center text-2xl font-bold">
                  ⏱️
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                  5-Second Cashier Speed
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Zero Staff Friction & Time Saved</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Billing counters remain fast and smooth. Cashiers do not have to manually type long phone numbers or navigate complex software. One tap on a phone or tablet awards the stamp.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  5-second tap-to-claim checkout speed
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Zero training required for counter staff
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Works seamlessly with Cash, UPI, Cards, or No Bill
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Comparison Strip */}
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-extrabold text-slate-900 text-lg">Traditional Methods vs. CustomerPilot</h4>
              <p className="text-xs text-slate-500">Stop wasting money on lost paper cards, ignored SMS promos, and expensive POS add-ons.</p>
            </div>
            <Link href="/signup">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md">
                Start 7 Days Free Trial Today →
              </Button>
            </Link>
          </div>
        </div>
      </section>
`;

const target = "{/* ============ HOW IT WORKS ============ */}";
if (!pageContent.includes(target)) {
  console.error("Target string not found in page.tsx");
  process.exit(1);
}

const home2Content = pageContent.replace(target, newSection + "\n      " + target);

if (!fs.existsSync(home2Dir)) {
  fs.mkdirSync(home2Dir, { recursive: true });
}

fs.writeFileSync(home2Path, home2Content, "utf8");
console.log("Successfully created src/app/home2/page.tsx");
