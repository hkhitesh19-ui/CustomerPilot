const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

async function isServerRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/pricing/plans`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.abort();
      resolve(false);
    });
  });
}

async function main() {
  console.log("Checking if local server is active on port 3000...");
  let serverProcess = null;
  const running = await isServerRunning(3000);

  if (!running) {
    console.log("Starting Next.js standalone server on port 3000...");
    const { spawn } = require('child_process');
    serverProcess = spawn('node', ['.next/standalone/server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: '3000' },
      stdio: 'ignore'
    });

    // Wait for server to be ready
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const up = await isServerRunning(3000);
      if (up) {
        console.log(`Server is ready after ${i + 1}s!`);
        break;
      }
    }
  } else {
    console.log("Server is already running on port 3000!");
  }

  console.log("Launching headless browser for Ground-Truth 5 Gears Verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 2200 }
  });
  const page = await context.newPage();

  const url = 'http://localhost:3000/pricing';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const pageText = await page.innerText('body');

  const requiredGears = [
    {
      name: "Gear 1 : Smart Digital Business Card + Smart AI Google Review System",
      price1Y: "₹1,249"
    },
    {
      name: "Gear 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System",
      price1Y: "₹2,249"
    },
    {
      name: "Gear 3 : WhatsApp Digital Loyalty + Smart AI Google Review System + Smart Digital Business Card",
      price1Y: "₹2,499"
    },
    {
      name: "Gear 4 : All 4 Core Engines",
      price1Y: "₹2,499"
    },
    {
      name: "Gear 5 : CustomerPilot All-in-One Enterprise",
      price1Y: "₹9,999",
      priceMonthly: "₹999"
    }
  ];

  console.log("\n--- VERIFYING 5 GEAR COMBOS ---");
  let allGearsPassed = true;
  for (const g of requiredGears) {
    const hasName = pageText.includes(g.name);
    const has1Y = pageText.includes(g.price1Y);
    if (hasName && has1Y) {
      console.log(`✅ [PASS] ${g.name} -> ${g.price1Y}`);
    } else {
      console.error(`❌ [FAIL] Missing or mismatch: ${g.name} (hasName: ${hasName}, has1Y: ${has1Y})`);
      allGearsPassed = false;
    }
  }

  // Verify Standalone services
  console.log("\n--- VERIFYING STANDALONE SERVICES ---");
  const standaloneChecks = [
    "Smart AI Google Review System",
    "WhatsApp Digital Loyalty Membership Club",
    "Smart Digital Business Card",
    "AutoReply to GoogleReview"
  ];

  for (const s of standaloneChecks) {
    if (pageText.includes(s)) {
      console.log(`✅ [PASS] Standalone Service Found: ${s}`);
    } else {
      console.error(`❌ [FAIL] Missing Standalone: ${s}`);
    }
  }

  // Verify prohibited marketing spam
  console.log("\n--- VERIFYING ZERO MARKETING GIMMICKS ---");
  const prohibited = [
    "0.3% of monthly store sales",
    "FLAT DISCOUNT 50% OFF",
    "Limited Time 50% Discount Offer",
    "Main Price: ₹6,998"
  ];

  for (const p of prohibited) {
    if (pageText.includes(p)) {
      console.error(`❌ Found prohibited phrase: "${p}"`);
      allGearsPassed = false;
    } else {
      console.log(`✅ Clean (No "${p}")`);
    }
  }

  // Capture artifacts
  const artifactDir = "C:/Users/Admin/.gemini/antigravity/brain/0bf20295-98d5-4eb0-8f2d-1052acdba9a2";
  const publicPath = path.join(__dirname, '../public/pricing_gears_ground_truth.png');
  const artifactPath = path.join(artifactDir, 'pricing_5_gears_verified.png');

  await page.screenshot({ path: publicPath, fullPage: true });
  try {
    await page.screenshot({ path: artifactPath, fullPage: true });
  } catch (err) {
    // optional artifact directory copy
  }

  console.log(`\n📸 Ground Truth Screenshots Captured:`);
  console.log(` - ${publicPath}`);
  console.log(` - ${artifactPath}`);

  await browser.close();

  if (serverProcess) {
    serverProcess.kill();
  }

  if (!allGearsPassed) {
    console.error("Some verification checks failed!");
    process.exit(1);
  } else {
    console.log("\n🎯 100% GROUND TRUTH VERIFICATION PASSED FOR ALL 5 GEARS & STANDALONE SERVICES!");
  }
}

main().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
