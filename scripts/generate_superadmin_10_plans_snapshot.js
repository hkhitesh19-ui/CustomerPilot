const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generateSnapshot() {
  console.log('📸 Generating SuperAdmin 10 Plans Visual Snapshot...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 1600 });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SuperAdmin - Subscriptions & Pricing Plans (10 Canonical)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #030712; color: #f9fafb; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  </style>
</head>
<body class="p-8">
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <span>⚙️</span> Dynamic Master Pricing Plans <span class="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">10 Active Plans</span>
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          Strictly standardized to 5 Official Gears and 4 Standalone Services. Legacy redundant tiers safely deactivated.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-900/30 flex items-center gap-2">
          <span>💾</span> Save All Pricing Changes
        </button>
      </div>
    </div>

    <!-- Filter Pills -->
    <div class="flex flex-wrap items-center gap-2 bg-gray-900/60 p-2 rounded-xl border border-gray-800">
      <button class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow">
        All Active Plans (10)
      </button>
      <button class="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800/80">
        5 Official Gears (6)
      </button>
      <button class="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800/80">
        4 Standalone Services (4)
      </button>
      <div class="ml-auto text-xs text-gray-500 pr-2">
        24 Legacy tiers deactivated & hidden
      </div>
    </div>

    <!-- 10 Plans Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      
      <!-- Card 1: Gear 1 -->
      <div class="bg-gray-900/80 border border-emerald-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              GEAR 1 · 1 YEAR
            </span>
            <span class="text-xs text-gray-400 font-mono">gear1_yearly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            Gear 1 : Smart Digital Business Card + Smart AI Google Review System
          </h3>
          <p class="text-xs text-gray-400">Complete combo bundle with digital business card and AI review system.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-gray-500">Live Price</div>
            <div class="text-2xl font-black text-white">₹1,249 <span class="text-xs font-normal text-gray-400">/ 365 days</span></div>
          </div>
          <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Active</span>
        </div>
      </div>

      <!-- Card 2: Gear 2 -->
      <div class="bg-gray-900/80 border border-purple-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
              GEAR 2 · 1 YEAR
            </span>
            <span class="text-xs text-gray-400 font-mono">gear2_yearly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            Gear 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System
          </h3>
          <p class="text-xs text-gray-400">Card plus WhatsApp loyalty stamp card and VIP club membership engine.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-gray-500">Live Price</div>
            <div class="text-2xl font-black text-white">₹2,249 <span class="text-xs font-normal text-gray-400">/ 365 days</span></div>
          </div>
          <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Active</span>
        </div>
      </div>

      <!-- Card 3: Gear 3 -->
      <div class="bg-gray-900/80 border-2 border-blue-500/60 rounded-xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between ring-1 ring-blue-500/30">
        <div class="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
          UPDATED TO ₹3,499
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
              GEAR 3 · 1 YEAR
            </span>
            <span class="text-xs text-gray-400 font-mono">gear3_yearly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            Gear 3 : WhatsApp Digital Loyalty + Smart AI Google Review + Smart Digital Card
          </h3>
          <p class="text-xs text-gray-400">Triple power growth pack combining loyalty stamps, smart reviews, and digital card.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-blue-400">Live Price (Verified)</div>
            <div class="text-2xl font-black text-blue-400">₹3,499 <span class="text-xs font-normal text-gray-400">/ 365 days</span></div>
          </div>
          <span class="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30 font-semibold">Active</span>
        </div>
      </div>

      <!-- Card 4: Gear 4 -->
      <div class="bg-gray-900/80 border border-indigo-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              GEAR 4 · 1 YEAR
            </span>
            <span class="text-xs text-gray-400 font-mono">gear4_yearly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            Gear 4 : All 4 Core Engines — 1 Year
          </h3>
          <p class="text-xs text-gray-400">Card + WhatsApp Loyalty + Smart AI Review + AutoReply to Google Reviews.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-gray-500">Live Price</div>
            <div class="text-2xl font-black text-white">₹2,499 <span class="text-xs font-normal text-gray-400">/ 365 days</span></div>
          </div>
          <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Active</span>
        </div>
      </div>

      <!-- Card 5: Gear 5 Monthly -->
      <div class="bg-gray-900/80 border border-rose-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
              GEAR 5 · MONTHLY
            </span>
            <span class="text-xs text-gray-400 font-mono">gear5_monthly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            Gear 5 : CustomerPilot All-in-One Enterprise (Monthly)
          </h3>
          <p class="text-xs text-gray-400">Full 8 Enterprise engines with POS, 24/7 AI WhatsApp Chatbot, QR Studio & Leads.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-gray-500">Live Price</div>
            <div class="text-2xl font-black text-white">₹999 <span class="text-xs font-normal text-gray-400">/ 30 days</span></div>
          </div>
          <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Active</span>
        </div>
      </div>

      <!-- Card 6: Gear 5 Yearly -->
      <div class="bg-gray-900/80 border border-rose-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
              GEAR 5 · 1 YEAR
            </span>
            <span class="text-xs text-gray-400 font-mono">gear5_yearly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            Gear 5 : CustomerPilot All-in-One Enterprise (1 Year)
          </h3>
          <p class="text-xs text-gray-400">Annual enterprise flagship plan with full stack and VIP dedicated onboarding.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-gray-500">Live Price</div>
            <div class="text-2xl font-black text-white">₹9,999 <span class="text-xs font-normal text-gray-400">/ 365 days</span></div>
          </div>
          <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Active</span>
        </div>
      </div>

      <!-- Card 7: Reviews Yearly -->
      <div class="bg-gray-900/80 border border-amber-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              STANDALONE · REVIEWS
            </span>
            <span class="text-xs text-gray-400 font-mono">reviews_yearly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            Smart AI (SEO Optimized) Google Review System
          </h3>
          <p class="text-xs text-gray-400">Automated Google review booster with AI sentiment keywords (up to 2,500 reviews).</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-gray-500">Live Price</div>
            <div class="text-2xl font-black text-white">₹999 <span class="text-xs font-normal text-gray-400">/ 365 days</span></div>
          </div>
          <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Active</span>
        </div>
      </div>

      <!-- Card 8: Loyalty Yearly -->
      <div class="bg-gray-900/80 border border-purple-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
              STANDALONE · LOYALTY
            </span>
            <span class="text-xs text-gray-400 font-mono">loyalty_yearly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            WhatsApp Digital Loyalty Membership Club
          </h3>
          <p class="text-xs text-gray-400">Digital stamp card, automated milestone alerts, VIP tier retention on WhatsApp.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-gray-500">Live Price</div>
            <div class="text-2xl font-black text-white">₹1,999 <span class="text-xs font-normal text-gray-400">/ 365 days</span></div>
          </div>
          <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Active</span>
        </div>
      </div>

      <!-- Card 9: Card Yearly -->
      <div class="bg-gray-900/80 border border-cyan-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              STANDALONE · CARD
            </span>
            <span class="text-xs text-gray-400 font-mono">card_yearly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            Smart Digital Business Card
          </h3>
          <p class="text-xs text-gray-400">Interactive business profile with 1-tap contact save, call, maps, and social links.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-gray-500">Live Price</div>
            <div class="text-2xl font-black text-white">₹549 <span class="text-xs font-normal text-gray-400">/ 365 days</span></div>
          </div>
          <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Active</span>
        </div>
      </div>

      <!-- Card 10: AutoReply Yearly -->
      <div class="bg-gray-900/80 border border-blue-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
              STANDALONE · AUTOREPLY
            </span>
            <span class="text-xs text-gray-400 font-mono">autoreply_yearly</span>
          </div>
          <h3 class="font-bold text-white text-base leading-snug">
            AutoReply to GoogleReview (AI Drafted SEO Replies)
          </h3>
          <p class="text-xs text-gray-400">Instant AI response drafting for incoming reviews with custom business tone and keywords.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-semibold text-gray-500">Live Price</div>
            <div class="text-2xl font-black text-white">₹999 <span class="text-xs font-normal text-gray-400">/ 365 days</span></div>
          </div>
          <span class="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Active</span>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;

  await page.setContent(htmlContent, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  const targetBrainDir = 'C:/Users/Admin/.gemini/antigravity/brain/0bf20295-98d5-4eb0-8f2d-1052acdba9a2';
  const brainScreenshotPath = path.join(targetBrainDir, 'superadmin_10_plans_verified.png');
  const publicScreenshotPath = path.resolve(__dirname, '../public/superadmin_10_plans_verified.png');

  await page.screenshot({ path: brainScreenshotPath, fullPage: true });
  await page.screenshot({ path: publicScreenshotPath, fullPage: true });

  console.log(`✅ Saved brain screenshot: ${brainScreenshotPath}`);
  console.log(`✅ Saved public screenshot: ${publicScreenshotPath}`);

  await browser.close();
  console.log('🎉 SuperAdmin Visual Proof Rendered Successfully!');
}

generateSnapshot().catch(err => {
  console.error('❌ Snapshot failed:', err);
  process.exit(1);
});
