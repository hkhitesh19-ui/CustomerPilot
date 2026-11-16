const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log("Launching headless browser to verify LIVE VPS https://customerpilot.in/pricing...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 2600 }
  });
  const page = await context.newPage();

  const url = 'https://customerpilot.in/pricing';
  console.log(`Navigating to ${url}...`);
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  console.log(`HTTP Status: ${response.status()}`);
  await page.waitForTimeout(3000);

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

  console.log("\n--- VERIFYING 5 CANONICAL GEAR COMBOS ON LIVE VPS ---");
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
  console.log("\n--- VERIFYING STANDALONE SERVICES ON LIVE VPS ---");
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
      allGearsPassed = false;
    }
  }

  // Verify prohibited marketing spam
  console.log("\n--- VERIFYING ZERO MARKETING GIMMICKS ON LIVE VPS ---");
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

  // Visual snapshot
  const screenshotPath = path.join(__dirname, '../public/live_pricing_5_gears_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\nScreenshot captured at: ${screenshotPath}`);

  // Copy to brain artifacts
  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/0bf20295-98d5-4eb0-8f2d-1052acdba9a2';
  try {
    fs.copyFileSync(screenshotPath, path.join(artifactDir, 'live_pricing_5_gears_verified.png'));
    console.log(`Copied artifact to ${artifactDir}/live_pricing_5_gears_verified.png`);
  } catch (e) {
    console.warn("Could not copy artifact:", e.message);
  }

  await browser.close();

  if (!allGearsPassed) {
    console.error("❌ Live verification failed: Some checks failed!");
    process.exit(1);
  }

  console.log("\n🎯 100% GROUND TRUTH VERIFICATION PASSED FOR ALL 5 GEARS & STANDALONE SERVICES ON LIVE PRODUCTION VPS!");
}

main().catch(err => {
  console.error("Error during live verification:", err);
  process.exit(1);
});
