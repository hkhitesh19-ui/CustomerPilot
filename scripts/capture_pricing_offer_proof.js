const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/rankpilot ...');
  await page.goto('http://localhost:3000/rankpilot', { waitUntil: 'networkidle' });

  const artifactDir = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/1d9045d6-cc0a-4a85-a44e-5de4891739b1');

  // 1. Top Offer & Hero Screenshot
  const heroPath = path.join(artifactDir, 'rankpilot_top_offer_hero.png');
  await page.screenshot({
    path: heroPath,
    clip: { x: 0, y: 0, width: 1440, height: 850 }
  });
  console.log('Saved:', heroPath);

  // 2. Roadmap Guaranteed SLA Stepper Screenshot
  const roadmapLocator = page.locator('#roadmap');
  const roadmapPath = path.join(artifactDir, 'rankpilot_roadmap_sla.png');
  await roadmapLocator.screenshot({ path: roadmapPath });
  console.log('Saved:', roadmapPath);

  // 3. Guaranteed Pricing & 100% Moneyback Section Screenshot
  const pricingLocator = page.locator('#pricing');
  const pricingPath = path.join(artifactDir, 'rankpilot_pricing_section.png');
  await pricingLocator.screenshot({ path: pricingPath });
  console.log('Saved:', pricingPath);

  await browser.close();
  console.log('Visual capture complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
