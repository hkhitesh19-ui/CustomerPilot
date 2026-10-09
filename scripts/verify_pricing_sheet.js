const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 3200 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/pricing with domcontentloaded...");
  await page.goto("http://localhost:3000/pricing", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2500);

  // 1. Check title & headers
  const title = await page.textContent("h1");
  console.log("Page H1:", title);

  const subTitle = await page.locator("text=Pick a product, compare tenures, build your bundle — all prices live").first().textContent();
  console.log("Subtitle:", subTitle);

  // 2. Check 3 sections:
  const section1 = await page.locator("text=Your Bundle").first().textContent();
  console.log("Section 1 header found:", section1);

  const section2 = await page.locator("text=Compare all tenures").first().textContent();
  console.log("Section 2 header found:", section2);

  const section3 = await page.locator("text=Standalone services — 6 Months & 1 Year (with total)").first().textContent();
  console.log("Section 3 header found:", section3);

  // 3. Ground-Truth Data Assertions for Verified Price Sheet:
  const content = await page.content();

  const assertions = [
    { label: "Lifetime Card ₹1,499", test: content.includes("1,499") },
    { label: "Lifetime Card MRP ₹3,999", test: content.includes("3,999") },
    { label: "Complete 6 Months ₹2,499", test: content.includes("2,499") },
    { label: "Complete 6 Months MRP ₹4,998", test: content.includes("4,998") },
    { label: "Complete 12 Months ₹4,899", test: content.includes("4,899") },
    { label: "Complete 12 Months MRP ₹9,798", test: content.includes("9,798") },
    { label: "Complete Monthly ₹449", test: content.includes("449") },
    { label: "Standalone 6M Total ₹2,246", test: content.includes("2,246") },
    { label: "Standalone 6M MRP ₹4,495", test: content.includes("4,495") },
    { label: "Standalone 1Y Total ₹3,396", test: content.includes("3,396") },
    { label: "Standalone 1Y MRP ₹6,995", test: content.includes("6,995") },
    { label: "Loyalty 6M ₹799", test: content.includes("799") },
    { label: "Loyalty 1Y ₹1,299", test: content.includes("1,299") },
    { label: "Digital Card 6M ₹349", test: content.includes("349") },
    { label: "Digital Card 1Y ₹499", test: content.includes("499") },
    { label: "Reviews 6M ₹549", test: content.includes("549") },
    { label: "Difference Complete ₹253", test: content.includes("253") },
    { label: "Difference Complete ₹1,503", test: content.includes("1,503") }
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

  // 4. Check prohibited words
  const hasNfc = /NFC/i.test(content);
  const hasStandee = /Standee/i.test(content);
  console.log("\n--- Prohibited Terms Check ---");
  console.log("Has NFC word:", hasNfc ? "❌ DETECTED" : "✅ 0 DETECTED");
  console.log("Has Standee word:", hasStandee ? "❌ DETECTED" : "✅ 0 DETECTED");

  // 5. Capture screenshot
  const screenshotPath = "C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4/verified_pricing_studio_v4_sheet.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("\nScreenshot saved to:", screenshotPath);

  await browser.close();

  if (!allPassed || hasNfc || hasStandee) {
    console.error("Some assertions failed!");
    process.exit(1);
  }
  console.log("\n🎉 ALL VERIFICATION ASSERTIONS PASSED 100%!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
