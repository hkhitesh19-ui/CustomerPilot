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

  // 2. Check sections on pricing:
  const section1 = await page.locator("text=CustomerPilot Complete").first().textContent();
  console.log("Complete section found:", section1?.trim());

  const section3 = await page.locator("text=Or choose exactly what you need").first().textContent();
  console.log("Standalone section found:", section3?.trim());

  // 3. Ground-Truth Data Assertions for Pricing:
  const content = await page.content();

  const assertions = [
    { label: "H1 contains 'Simple, Flexible Pricing'", test: title.includes("Simple, Flexible") && title.includes("Pricing") },
    { label: "No Feature grid on pricing page", test: !content.includes("How CustomerPilot Helps You Grow Your Business") },
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

  // Take pricing screenshot
  const screenshotPath = "C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4/verified_pricing_extracted_html.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("\nFull pricing page screenshot saved to:", screenshotPath);

  // 4. Verify Homepage has feature grid above FAQ
  console.log("\nNavigating to http://localhost:3000/ to verify Feature Grid above FAQ...");
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(3000);
  const homeContent = await page.content();

  const homeFeatureGrid = homeContent.includes("How CustomerPilot Helps You Grow Your Business");
  const homeFaq = homeContent.includes("Frequently Asked Questions");
  const featureIndex = homeContent.indexOf("How CustomerPilot Helps You Grow Your Business");
  const faqIndex = homeContent.indexOf("Frequently Asked Questions");

  const homeAssertions = [
    { label: "Homepage contains 'How CustomerPilot Helps You Grow Your Business'", test: homeFeatureGrid },
    { label: "Feature grid is positioned BEFORE FAQ on Homepage", test: featureIndex !== -1 && faqIndex !== -1 && featureIndex < faqIndex }
  ];

  console.log("\n--- Homepage Feature Grid Assertions ---");
  for (const a of homeAssertions) {
    if (a.test) {
      console.log(`✅ PASS: ${a.label}`);
    } else {
      console.log(`❌ FAIL: ${a.label}`);
      allPassed = false;
    }
  }

  // Take homepage screenshot showing feature grid
  const homeScreenshotPath = "C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4/verified_homepage_feature_grid.png";
  await page.screenshot({ path: homeScreenshotPath, fullPage: false });
  console.log("\nHomepage screenshot saved to:", homeScreenshotPath);

  await browser.close();
  if (!allPassed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Playwright verification error:", err);
  process.exit(1);
});
