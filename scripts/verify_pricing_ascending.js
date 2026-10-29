const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 2600 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/pricing with domcontentloaded...");
  await page.goto("http://localhost:3000/pricing", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);

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

  // 3. Check prohibited words
  const pageContent = await page.content();
  const hasNfc = /NFC/i.test(pageContent);
  const hasStandee = /Standee/i.test(pageContent);
  console.log("Has NFC word:", hasNfc);
  console.log("Has Standee word:", hasStandee);

  // 4. Capture screenshot
  await page.screenshot({ path: "C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4/verified_pricing_studio_v4_ascending.png", fullPage: true });
  console.log("Screenshot captured successfully!");

  await browser.close();
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
