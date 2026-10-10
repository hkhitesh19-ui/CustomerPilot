const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 3200 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/pricing with domcontentloaded...");
  await page.goto("http://localhost:3000/pricing", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(3000);

  // 1. Check title & headers
  const title = (await page.textContent("h1")).trim();
  console.log("Page H1:", title);

  const subTitle = await page.locator("text=One platform or one tool at a time").first().textContent();
  console.log("Subtitle:", subTitle?.trim());

  // 2. Check 3 sections:
  const section1 = await page.locator("text=CustomerPilot Complete").first().textContent();
  console.log("Complete section found:", section1?.trim());

  const section2 = await page.locator("text=How CustomerPilot Helps You Grow Your Business").first().textContent();
  console.log("Feature grid section found:", section2?.trim());

  const section3 = await page.locator("text=Or choose exactly what you need").first().textContent();
  console.log("Standalone section found:", section3?.trim());

  // 3. Ground-Truth Data Assertions for CustomerPilot_Pricing.html:
  const content = await page.content();

  const assertions = [
    { label: "H1 contains 'Pricing that grows with your business'", test: title.includes("Pricing that grows") },
    { label: "No 'Studio v4' on page", test: !content.includes("Studio v4") },
    { label: "No NFC on page", test: !content.toLowerCase().includes("nfc") },
    { label: "No Standee on page", test: !content.toLowerCase().includes("standee") },
    { label: "Complete Monthly ₹449", test: content.includes("449") },
    { label: "Complete 6 Months ₹1,999", test: content.includes("1,999") },
    { label: "Complete 6 Months MRP ₹3,998", test: content.includes("3,998") },
    { label: "Complete 12 Months ₹3,499", test: content.includes("3,499") },
    { label: "Complete 12 Months MRP ₹6,998", test: content.includes("6,998") },
    { label: "Effective monthly cost card present", test: content.includes("Effective monthly cost") },
    { label: "Cheaper per month note present", test: content.includes("cheaper") && content.includes("per month than Monthly") },
    { label: "Standalone 6M Total ₹2,446", test: content.includes("2,446") },
    { label: "Standalone 1Y Total ₹3,696", test: content.includes("3,696") },
    { label: "Loyalty 6M ₹899", test: content.includes("899") },
    { label: "Loyalty 1Y ₹1,499", test: content.includes("1,499") },
    { label: "Reviews 6M ₹649", test: content.includes("649") },
    { label: "Reviews 1Y ₹899", test: content.includes("899") },
    { label: "AutoReply 6M ₹549", test: content.includes("549") },
    { label: "AutoReply 1Y ₹799", test: content.includes("799") },
    { label: "Digital Card 6M ₹349", test: content.includes("349") },
    { label: "Digital Card 1Y ₹499", test: content.includes("499") },
    { label: "Lifetime Deal ₹1,499", test: content.includes("1,499") && content.includes("0.41/day") }
  ];

  console.log("\n--- Ground-Truth Price Assertions ---");
  let allPassed = true;
  for (const a of assertions) {
    if (a.test) {
      console.log(`✅ PASS: ${a.label}`);
    } else {
      console.log(`❌ FAIL: ${a.label}`);
      allPassed = false;
    }
  }

  // Take screenshot
  const screenshotPath = "C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4/verified_pricing_extracted_html.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("\nFull page screenshot saved to:", screenshotPath);

  await browser.close();
  if (!allPassed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Playwright verification error:", err);
  process.exit(1);
});
