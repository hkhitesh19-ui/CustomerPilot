const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  // Load logo
  const logoBase64 = fs.readFileSync(path.join(__dirname, "../public/uploads/shreenath_logo_downloaded.png")).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  // Load a sample QR or generate SVG/data URL
  const qrBase64 = fs.readFileSync(path.join(__dirname, "../public/shreenath_store_logo_qr_test.png")).toString("base64");
  const qrSrc = `data:image/png;base64,${qrBase64}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #f1f5f9; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="p-8">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="text-center space-y-2">
      <span class="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-black uppercase tracking-wider rounded-full">CustomerPilot Standee Preview</span>
      <h1 class="text-3xl font-black text-slate-900">WhatsApp Group Booster — Bigger Logo Standee Options</h1>
      <p class="text-slate-600 text-sm max-w-2xl mx-auto">Real rendered visual proof comparing <strong>Large (135px)</strong> and <strong>X-Large (165px)</strong> against the old tiny 40px layout.</p>
    </div>

    <!-- COMPARISON ROW -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-center pt-4">

      <!-- 1. OLD TINY (40px) -->
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-3">
          <span>❌ Live VPS (Old 40px) — Text Cut Off</span>
        </div>
        <div class="w-full max-w-[310px] bg-white rounded-3xl p-5 border-4 border-slate-900 shadow-xl space-y-3 text-center">
          <div class="space-y-1.5 flex flex-col items-center">
            <img src="${logoSrc}" class="h-10 max-w-[130px] object-contain rounded-md" />
            <div class="text-xs font-black text-slate-900 uppercase">SHREENATH RAJWADI SILK PALACE</div>
            <div class="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black">Scan n Join Whatsapp Group</div>
          </div>
          <div class="p-2.5 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
            <img src="${qrSrc}" class="w-40 h-40 object-contain" />
          </div>
          <div class="space-y-0.5">
            <div class="text-xs font-black text-slate-900 tracking-tight">SCAN WITH ANY SCANNER</div>
            <div class="text-[10px] text-slate-500">Scan to join our official WhatsApp Community</div>
          </div>
          <div class="pt-2 border-t border-slate-200 flex items-center justify-center gap-1 text-[9px] font-bold text-slate-600">
            <span>Powered by <strong>CustomerPilot.in :</strong></span>
            <span class="font-extrabold text-slate-900">+91 9033304707</span>
          </div>
        </div>
      </div>

      <!-- 2. OPTION A: LARGE (135px) - BOLD & BALANCED -->
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold mb-3 ring-2 ring-emerald-500/20 shadow-sm">
          <span>✨ Option A: Large (135px) — Balanced & Clear</span>
        </div>
        <div class="w-full max-w-[340px] bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-2xl space-y-3.5 text-center relative ring-4 ring-emerald-500/10">
          <div class="space-y-2 flex flex-col items-center w-full">
            <!-- Large Logo (135px) -->
            <div class="w-full flex items-center justify-center py-1">
              <img src="${logoSrc}" class="max-h-[135px] max-w-[280px] w-auto h-auto object-contain rounded-xl drop-shadow-md" />
            </div>
            <div class="inline-block px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black tracking-wide shadow-sm">
              Scan n Join Whatsapp Group
            </div>
          </div>
          <div class="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
            <img src="${qrSrc}" class="w-44 h-44 object-contain" />
          </div>
          <div class="space-y-0.5">
            <div class="text-xs font-black text-slate-900 tracking-tight">SCAN WITH ANY SCANNER</div>
            <div class="text-[10px] text-slate-500">Scan to join our official WhatsApp Community</div>
          </div>
          <div class="pt-2.5 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-600">
            <span class="text-slate-500 font-medium">Powered by</span>
            <span class="text-slate-900 font-extrabold">CustomerPilot.in :</span>
            <span class="text-emerald-700 font-bold">🟢</span>
            <span class="font-extrabold text-slate-900 tracking-tight">+91 9033304707</span>
          </div>
        </div>
      </div>

      <!-- 3. OPTION B: X-LARGE HERO (165px) - MAXIMUM BRAND PROMINENCE -->
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold mb-3 ring-2 ring-indigo-500/20 shadow-sm">
          <span>🚀 Option B: X-Large Hero (165px) — Huge Impact</span>
        </div>
        <div class="w-full max-w-[340px] bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-2xl space-y-3.5 text-center relative ring-4 ring-indigo-500/10">
          <div class="space-y-2 flex flex-col items-center w-full">
            <!-- X-Large Logo (165px) -->
            <div class="w-full flex items-center justify-center py-1">
              <img src="${logoSrc}" class="max-h-[165px] max-w-[300px] w-auto h-auto object-contain rounded-2xl drop-shadow-md" />
            </div>
            <div class="inline-block px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black tracking-wide shadow-sm">
              Scan n Join Whatsapp Group
            </div>
          </div>
          <div class="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
            <img src="${qrSrc}" class="w-44 h-44 object-contain" />
          </div>
          <div class="space-y-0.5">
            <div class="text-xs font-black text-slate-900 tracking-tight">SCAN WITH ANY SCANNER</div>
            <div class="text-[10px] text-slate-500">Scan to join our official WhatsApp Community</div>
          </div>
          <div class="pt-2.5 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-600">
            <span class="text-slate-500 font-medium">Powered by</span>
            <span class="text-slate-900 font-extrabold">CustomerPilot.in :</span>
            <span class="text-emerald-700 font-bold">🟢</span>
            <span class="font-extrabold text-slate-900 tracking-tight">+91 9033304707</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(600);

  const outPath = path.join(__dirname, "../public/wa_booster_bigger_logo_comparison.png");
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved comparison screenshot to: ${outPath}`);

  // Also capture the isolated Standee Card for Option B (Hero 165px)
  const heroCard = await page.$(".ring-indigo-500\\/10");
  if (heroCard) {
    const heroCardPath = path.join(__dirname, "../public/wa_booster_standee_hero_card.png");
    await heroCard.screenshot({ path: heroCardPath });
    console.log(`Saved isolated hero standee card to: ${heroCardPath}`);
  }

  // Also capture isolated Option A (135px)
  const largeCard = await page.$(".ring-emerald-500\\/10");
  if (largeCard) {
    const largeCardPath = path.join(__dirname, "../public/wa_booster_standee_large_card.png");
    await largeCard.screenshot({ path: largeCardPath });
    console.log(`Saved isolated large standee card to: ${largeCardPath}`);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
