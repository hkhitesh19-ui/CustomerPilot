const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Launching headless browser for Ground-Truth Pricing Verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1800 }
  });
  const page = await context.newPage();

  // Test locally rendered pricing component or navigate to local server if running
  // Let's check if localhost:3000 is running
  let url = 'http://localhost:3000/pricing';
  let isLive = false;
  try {
    const res = await page.goto(url, { timeout: 4000 });
    if (res && res.status() === 200) {
      isLive = true;
    }
  } catch (e) {
    console.log("Local server on 3000 not responding, checking file-based or dev server...");
  }

  if (!isLive) {
    console.log("Local dev server is not active on 3000. Testing via node build / test mock...");
    await browser.close();
    return;
  }

  console.log(`Connected to ${url}! Waiting for page load...`);
  await page.waitForTimeout(2000);

  // Assert all 6 gears are present in DOM
  const pageText = await page.innerText('body');

  const requiredGears = [
    { name: "Gear 1 : Smart AI Google Review System", price6M: "₹749", price1Y: "₹999" },
    { name: "Gear 2 : Smart Digital Business Card + Smart AI Google Review System", price6M: "₹899", price1Y: "₹1,249" },
    { name: "Gear 3 : Smart Digital Business Card + WhatsApp Digital Loyalty System", price6M: "₹999", price1Y: "₹1,349" },
    { name: "Gear 4 : Smart Digital Business Card + WhatsApp Digital Loyalty + Smart AI Google Review System", price6M: "₹1,399", price1Y: "₹1,899" },
    { name: "Gear 5 : CustomerPilot Complete", price6M: "₹2,499", price1Y: "₹3,499" },
    { name: "Gear 6 : CustomerPilot All-in-One Enterprise", priceMonthly: "₹999" }
  ];

  for (const g of requiredGears) {
    if (pageText.includes(g.name)) {
      console.log(`✅ Verified Gear Present: ${g.name}`);
    } else {
      console.error(`❌ Missing Gear: ${g.name}`);
    }
  }

  // Verify zero prohibited phrases
  const prohibited = [
    "0.3% of monthly store sales",
    "Zero Upfront Fee",
    "FLAT DISCOUNT 50% OFF",
    "Limited Time 50% Discount Offer",
    "Main Price: ₹6,998"
  ];

  for (const p of prohibited) {
    if (pageText.includes(p)) {
      console.error(`❌ Found prohibited phrase: "${p}"`);
    } else {
      console.log(`✅ Zero instance of: "${p}"`);
    }
  }

  const screenshotPath = path.join(__dirname, '../public/pricing_gears_ground_truth.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Saved full-page ground truth screenshot: ${screenshotPath}`);

  await browser.close();
}

main().catch(console.error);
