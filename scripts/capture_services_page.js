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
  await page.waitForTimeout(2500);

  // 1. Hero Viewport Screenshot
  const heroPath = path.join(__dirname, "../public/services_hero_viewport.png");
  await page.screenshot({ path: heroPath });
  fs.copyFileSync(heroPath, path.join(ARTIFACT_DIR, "services_hero_viewport.png"));
  console.log("Saved hero screenshot to:", heroPath);

  // 2. Interactive Customer Loop Section (#how-it-works)
  const loopEl = page.locator("#how-it-works");
  if (await loopEl.count() > 0) {
    const loopPath = path.join(__dirname, "../public/services_customer_loop.png");
    await loopEl.screenshot({ path: loopPath });
    fs.copyFileSync(loopPath, path.join(ARTIFACT_DIR, "services_customer_loop.png"));
    console.log("Saved interactive customer loop screenshot to:", loopPath);
  }

  // 3. 8 Core Modules Grid Section (#modules)
  const modulesEl = page.locator("#modules");
  if (await modulesEl.count() > 0) {
    const modulesPath = path.join(__dirname, "../public/services_core_modules.png");
    await modulesEl.screenshot({ path: modulesPath });
    fs.copyFileSync(modulesPath, path.join(ARTIFACT_DIR, "services_core_modules.png"));
    console.log("Saved 8 core modules screenshot to:", modulesPath);
  }

  // 4. ROI Calculator & Comparison Section (#roi-calculator)
  const roiEl = page.locator("#roi-calculator");
  if (await roiEl.count() > 0) {
    const roiPath = path.join(__dirname, "../public/services_roi_calculator.png");
    await roiEl.screenshot({ path: roiPath });
    fs.copyFileSync(roiPath, path.join(ARTIFACT_DIR, "services_roi_calculator.png"));
    console.log("Saved ROI calculator screenshot to:", roiPath);
  }

  // 5. Full Page Screenshot
  const fullPath = path.join(__dirname, "../public/services_page_full.png");
  await page.screenshot({ path: fullPath, fullPage: true });
  fs.copyFileSync(fullPath, path.join(ARTIFACT_DIR, "services_page_full.png"));
  console.log("Saved full page screenshot to:", fullPath);

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch(err => {
  console.error("Capture failed:", err);
  process.exit(1);
});
