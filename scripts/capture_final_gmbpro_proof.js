const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\1d9045d6-cc0a-4a85-a44e-5de4891739b1';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/rankpilot...');
  await page.goto('http://localhost:3000/rankpilot', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Hero Flipper
  const heroFlipper = page.locator('section').first();
  if (await heroFlipper.count() > 0) {
    const heroPath = path.join(artifactDir, 'rankpilot_final_hero_flipper.png');
    await heroFlipper.screenshot({ path: heroPath });
    console.log(`Saved: ${heroPath}`);
  }

  // 2. Geo Grid (3x3 Radar Grid)
  const geoGrid = page.locator('#geo-grid');
  if (await geoGrid.count() > 0) {
    await geoGrid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const geoGridPath = path.join(artifactDir, 'rankpilot_final_geo_grid.png');
    await geoGrid.screenshot({ path: geoGridPath });
    console.log(`Saved: ${geoGridPath}`);
  }

  // 3. Nearby Search Radar (Concentric Circles + Sweep + Floating Pins)
  const nearbySearch = page.locator('#nearby-search');
  if (await nearbySearch.count() > 0) {
    await nearbySearch.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const nearbyPath = path.join(artifactDir, 'rankpilot_final_nearby_radar.png');
    await nearbySearch.screenshot({ path: nearbyPath });
    console.log(`Saved: ${nearbyPath}`);
  }

  // 4. Pricing Section (CustomerPilot Brand Gradient + 100% Moneyback Seal)
  const pricing = page.locator('#pricing');
  if (await pricing.count() > 0) {
    await pricing.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const pricingPath = path.join(artifactDir, 'rankpilot_final_pricing_gradient.png');
    await pricing.screenshot({ path: pricingPath });
    console.log(`Saved: ${pricingPath}`);
  }

  // 5. Full Page
  const fullPagePath = path.join(artifactDir, 'rankpilot_final_fullpage.png');
  await page.screenshot({ path: fullPagePath, fullPage: true });
  console.log(`Saved: ${fullPagePath}`);

  await browser.close();
  console.log('Capture complete!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
