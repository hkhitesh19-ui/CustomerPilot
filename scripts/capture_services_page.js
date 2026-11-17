const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/Admin/.gemini/antigravity/brain/644025c9-aa09-4142-baa8-0670b6c179d2";

async function capture() {
  console.log("Launching headless browser to capture http://localhost:3000/services...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/services...");
  const response = await page.goto("http://localhost:3000/services", {
    waitUntil: "domcontentloaded",
    timeout: 90000
  });

  console.log("Page response status:", response.status());

  console.log("Waiting for main hero heading...");
  await page.waitForSelector("h1", { timeout: 60000 });
  await page.waitForTimeout(3000);

  // 1. Hero Viewport Screenshot
  const heroPath = path.join(__dirname, "../public/services_hero_viewport.png");
  await page.screenshot({ path: heroPath });
  fs.copyFileSync(heroPath, path.join(ARTIFACT_DIR, "services_hero_viewport.png"));
  console.log("Saved hero screenshot to:", heroPath);

  // 2. Full Page Screenshot
  const fullPath = path.join(__dirname, "../public/services_page_full.png");
  await page.screenshot({ path: fullPath, fullPage: true });
  fs.copyFileSync(fullPath, path.join(ARTIFACT_DIR, "services_page_full.png"));
  console.log("Saved full page screenshot to:", fullPath);

  // 3. Scroll to Flywheel section and capture
  const flywheelEl = await page.locator("section:has-text('The CustomerPilot Flywheel')").first();
  if (await flywheelEl.count() > 0) {
    const flywheelPath = path.join(__dirname, "../public/services_flywheel_section.png");
    await flywheelEl.screenshot({ path: flywheelPath });
    fs.copyFileSync(flywheelPath, path.join(ARTIFACT_DIR, "services_flywheel_section.png"));
    console.log("Saved flywheel section screenshot to:", flywheelPath);
  }

  // 4. Scroll to 8 Core Services Grid and capture
  const gridEl = await page.locator("section:has-text('Explore All 8 CustomerPilot Services')").first();
  if (await gridEl.count() > 0) {
    const gridPath = path.join(__dirname, "../public/services_grid_section.png");
    await gridEl.screenshot({ path: gridPath });
    fs.copyFileSync(gridPath, path.join(ARTIFACT_DIR, "services_grid_section.png"));
    console.log("Saved 8-services grid screenshot to:", gridPath);
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch(err => {
  console.error("Capture failed:", err);
  process.exit(1);
});
