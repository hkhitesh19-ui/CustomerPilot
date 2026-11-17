const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function generateComparison() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const logoBase64 = fs.readFileSync(path.join(__dirname, "../public/uploads/shreenath_logo_downloaded.png")).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; }
  </style>
</head>
<body class="p-8">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="text-center space-y-1">
      <h1 class="text-2xl font-black text-slate-900">WhatsApp Group Booster Standee — Store Logo Visual Verification</h1>
      <p class="text-sm text-slate-500">Comparing Old Constrained (40px) vs New Prominent Responsive Sizing (80px, 110px, 135px)</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start justify-center">
      <!-- 1. OLD TINY (40px) -->
      <div class="flex flex-col items-center">
        <span class="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full mb-3">❌ Old (40px) - Text Unreadable</span>
        <div class="w-full max-w-[290px] bg-white rounded-3xl p-5 border-4 border-slate-900 shadow-xl space-y-3 text-center">
          <div class="space-y-1 flex flex-col items-center">
            <img src="${logoSrc}" class="h-10 max-w-[130px] object-contain" />
            <div class="text-sm font-black text-slate-900 uppercase">SHREENATH RAJWADI SILK PALACE</div>
            <div class="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black">Scan n Join Whatsapp Group</div>
          </div>
          <div class="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
            <div class="w-36 h-36 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">QR Code</div>
          </div>
          <div class="text-xs font-black text-slate-900">SCAN WITH ANY SCANNER</div>
          <div class="pt-2 border-t text-[9px] font-bold text-slate-600">Powered by <strong>CustomerPilot.in :</strong> +91 9033304707</div>
        </div>
      </div>

      <!-- 2. NEW LARGE 110px (Default) -->
      <div class="flex flex-col items-center">
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full mb-3">✅ New Default (110px) - Ultra Crisp & Prominent</span>
        <div class="w-full max-w-[340px] bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-2xl space-y-3.5 text-center">
          <div class="space-y-2 flex flex-col items-center w-full">
            <div class="w-full flex items-center justify-center min-h-[112px] bg-slate-50/60 rounded-2xl p-2 border border-slate-100/90">
              <img src="${logoSrc}" class="max-h-28 max-w-[260px] w-auto h-auto object-contain drop-shadow-sm" />
            </div>
            <div class="inline-block px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black tracking-wide shadow-sm">Scan n Join Whatsapp Group</div>
          </div>
          <div class="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
            <div class="w-44 h-44 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">QR Code</div>
          </div>
          <div>
            <div class="text-xs font-black text-slate-900">SCAN WITH ANY SCANNER</div>
            <div class="text-[10px] text-slate-500">Scan to join our official WhatsApp Community</div>
          </div>
          <div class="pt-2.5 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-600">
            <span>Powered by <strong>CustomerPilot.in :</strong> 🟢 <strong>+91 9033304707</strong></span>
          </div>
        </div>
      </div>

      <!-- 3. NEW X-LARGE 135px -->
      <div class="flex flex-col items-center">
        <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-300 px-3 py-1 rounded-full mb-3">🚀 New X-Large (135px) - Maximum Brand Impact</span>
        <div class="w-full max-w-[340px] bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-2xl space-y-3.5 text-center">
          <div class="space-y-2 flex flex-col items-center w-full">
            <div class="w-full flex items-center justify-center min-h-[112px] bg-slate-50/60 rounded-2xl p-2 border border-slate-100/90">
              <img src="${logoSrc}" class="max-h-36 max-w-[280px] w-auto h-auto object-contain drop-shadow-sm" />
            </div>
            <div class="inline-block px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black tracking-wide shadow-sm">Scan n Join Whatsapp Group</div>
          </div>
          <div class="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
            <div class="w-44 h-44 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">QR Code</div>
          </div>
          <div>
            <div class="text-xs font-black text-slate-900">SCAN WITH ANY SCANNER</div>
            <div class="text-[10px] text-slate-500">Scan to join our official WhatsApp Community</div>
          </div>
          <div class="pt-2.5 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-600">
            <span>Powered by <strong>CustomerPilot.in :</strong> 🟢 <strong>+91 9033304707</strong></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(800);
  const outPath = path.join(__dirname, "../public/standee_logo_size_comparison.png");
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved screenshot to ${outPath}`);
  await browser.close();
}

generateComparison().catch(err => {
  console.error(err);
  process.exit(1);
});
