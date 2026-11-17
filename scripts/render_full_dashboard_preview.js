const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  const logoBase64 = fs.readFileSync(path.join(__dirname, "../public/uploads/shreenath_logo_downloaded.png")).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  const qrBase64 = fs.readFileSync(path.join(__dirname, "../public/shreenath_store_logo_qr_test.png")).toString("base64");
  const qrSrc = `data:image/png;base64,${qrBase64}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #f8fafc; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="p-6">
  <!-- Top Bar Mockup -->
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-2">
        <span class="bg-black/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">SUPERADMIN MODE</span>
        <span>Viewing & managing: <strong>Shreenath Rajwadi Silk Palace</strong></span>
      </div>
      <span class="text-[11px] opacity-80">CustomerPilot Dashboard v2.4</span>
    </div>

    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm">💬</div>
          <h1 class="text-xl font-black text-slate-900">WhatsApp Group Booster</h1>
          <span class="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-extrabold">Simple & Fast Mode</span>
        </div>
        <p class="text-xs text-slate-500">Permanent fast-hosted dynamic QR code for direct 0-second redirection into your WhatsApp community group.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs">
          <span>🖨️ Print Standee (A4/A5)</span>
        </button>
      </div>
    </div>

    <!-- Main Grid: Left Standee Preview + Right Destination Control -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- LEFT: Standee Preview Column (5 cols) -->
      <div class="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col items-center">
        <div class="w-full flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-base">🪟</span>
            <span class="text-sm font-extrabold text-slate-900">Counter Standee Preview</span>
          </div>
          <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">READY TO PRINT</span>
        </div>

        <!-- Dedicated Store Logo Control Tile -->
        <div class="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/70">
          <div class="flex items-center gap-2">
            <img src="${logoSrc}" class="w-8 h-8 object-contain rounded-lg border border-slate-200 bg-white" />
            <div class="text-left">
              <div class="text-[11px] font-bold text-slate-800">Store Brand Logo Active</div>
              <div class="text-[9px] text-teal-700 font-semibold">Rendered in Ultra HD on Standee</div>
            </div>
          </div>
          <button class="h-6 px-2.5 text-[10px] font-bold rounded-lg bg-white border border-teal-500 text-teal-700 shadow-2xs">
            Change
          </button>
        </div>

        <!-- ACRYLIC STANDY MOCKUP (Updated Hero Size: 165px) -->
        <div class="w-full max-w-[340px] bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-2xl space-y-3.5 text-center relative ring-4 ring-slate-900/5">
          <!-- Logo & Header -->
          <div class="space-y-2 flex flex-col items-center w-full">
            <div class="w-full flex items-center justify-center py-1">
              <img src="${logoSrc}" class="max-h-[165px] max-w-[300px] w-auto h-auto object-contain rounded-2xl drop-shadow-md" />
            </div>
            <div class="inline-block px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black tracking-wide shadow-sm">
              Scan n Join Whatsapp Group
            </div>
          </div>

          <!-- QR Box -->
          <div class="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
            <img src="${qrSrc}" class="w-44 h-44 object-contain" />
          </div>

          <!-- Scan instructions -->
          <div class="space-y-0.5">
            <div class="text-xs font-black text-slate-900 tracking-tight">SCAN WITH ANY SCANNER</div>
            <div class="text-[10px] text-slate-500">Scan to join our official WhatsApp Community</div>
          </div>

          <!-- Footer -->
          <div class="pt-2.5 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-600">
            <span class="text-slate-500 font-medium">Powered by</span>
            <span class="text-slate-900 font-extrabold">CustomerPilot.in :</span>
            <span class="text-emerald-700 font-bold">🟢</span>
            <span class="font-extrabold text-slate-900 tracking-tight">+91 9033304707</span>
          </div>
        </div>

        <!-- LOGO DISPLAY CONTROLS BLOCK -->
        <div class="w-full p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-extrabold text-teal-950 text-[11px]">Logo Display Size:</span>
            <div class="flex items-center gap-1">
              <button class="px-2 py-1 text-[10px] font-bold rounded-lg bg-white text-slate-600 border border-slate-200">
                Medium (105px)
              </button>
              <button class="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white text-slate-600 border border-slate-200">
                Large (135px) ✨
              </button>
              <button class="px-2 py-1 text-[10px] font-bold rounded-lg bg-teal-700 text-white shadow-xs font-extrabold">
                Hero X-Large (165px) 🚀
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between pt-1.5 border-t border-teal-200/50 text-[11px]">
            <span class="text-slate-600 font-medium">Store name text below logo:</span>
            <button class="px-2.5 py-0.5 text-[10px] font-bold rounded-md border bg-white text-slate-600 border-slate-300">
              Logo Only (Clean)
            </button>
          </div>
        </div>

        <!-- Download Buttons -->
        <div class="w-full grid grid-cols-2 gap-2 pt-1">
          <button class="py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-xs">
            ⬇️ Download QR
          </button>
          <button class="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs">
            🖨️ Download Standee
          </button>
        </div>
      </div>

      <!-- RIGHT: Destination Control Center (7 cols) -->
      <div class="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-extrabold text-slate-900">Destination Control Center</h2>
            <p class="text-xs text-slate-500">Update where customers land when they scan your printed counter QR.</p>
          </div>
          <span class="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">🔗 Test Link</span>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-700">WhatsApp Group Invite URL</label>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 break-all">
            https://chat.whatsapp.com/JkoU8G1Sr6mJVKZONEIE60
          </div>
        </div>

        <div class="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
          <div class="flex items-center gap-2 text-emerald-900 text-xs font-black">
            <span>⚡ Direct 0-Second Redirect (Simple & Fast Mode)</span>
          </div>
          <p class="text-xs text-emerald-800">
            Zero friction. Customer immediately opens your WhatsApp community group invite on their phone camera. Maximum join conversion (95%+).
          </p>
        </div>

        <!-- Analytics -->
        <div class="grid grid-cols-3 gap-3 pt-3">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div class="text-[10px] font-bold text-slate-500 uppercase">Total Scans</div>
            <div class="text-xl font-black text-slate-900">5</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div class="text-[10px] font-bold text-slate-500 uppercase">Mobile Traffic</div>
            <div class="text-xl font-black text-slate-900">96%</div>
          </div>
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <div class="text-[10px] font-bold text-emerald-700 uppercase">Engine Health</div>
            <div class="text-xl font-black text-emerald-700">100% HEALTHY</div>
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

  const outPath = path.join(__dirname, "../public/wa_booster_full_dashboard_preview.png");
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved full dashboard preview to: ${outPath}`);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
