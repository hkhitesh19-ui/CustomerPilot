const { chromium } = require("playwright");

(async () => {
  console.log("Testing Live Audit Real Competitors on https://customerpilot.in/google-business-profile-ranking...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();

  await page.goto("https://customerpilot.in/google-business-profile-ranking", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);

  const heroBtn = page.locator('button:has-text("Run Free 100-Point Audit Now")');
  await heroBtn.click();
  console.log("✓ Clicked 'Run Free 100-Point Audit Now'");

  // Wait for competitor section
  await page.waitForSelector('[data-testid="competitor-row"]', { timeout: 30000 });
  console.log("✓ Competitor section rendered!");

  const competitorRows = await page.locator('[data-testid="competitor-row"]').allInnerTexts();
  console.log("\n=== LIVE COMPETITORS RENDERED ON SCREEN ===");
  competitorRows.forEach((row, i) => {
    console.log(`[Row ${i+1}]:\n${row}\n---`);
  });

  const fullText = competitorRows.join(" ");
  const hasNiniOrAtulOrChocolate = fullText.includes("Nini") || fullText.includes("Atul") || fullText.includes("Chocolate") || fullText.includes("Bakery planet") || fullText.includes("Theobroma");
  const hasKeratin = fullText.toLowerCase().includes("keratin makeup");
  const hasLiveBadge = (await page.locator("body").innerText()).includes("Live Google Maps Places Index");

  console.log("\nAssertions:");
  console.log("  Real Local Competitors visible:", hasNiniOrAtulOrChocolate);
  console.log("  Fake 'Keratin Makeup' eliminated:", !hasKeratin);
  console.log("  Live Google Places badge visible:", hasLiveBadge);

  await page.screenshot({ path: "scratch/live_real_competitors_proof.png", fullPage: false });
  console.log("📸 Saved proof screenshot: scratch/live_real_competitors_proof.png");

  await browser.close();
  if (hasNiniOrAtulOrChocolate && !hasKeratin) {
    console.log("🎉 SUCCESS: Real Google Places competitors verified on live website!");
    process.exit(0);
  } else {
    console.error("❌ FAILED: Still showing fake competitors!");
    process.exit(1);
  }
})();
