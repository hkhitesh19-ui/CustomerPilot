const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('🧪 Starting Playwright Verification of Photo Bonus Highlight Banner...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile frame
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  const url = 'http://localhost:3000/review?m=cmtymavfx0002kx008lbfvp57';
  console.log(`Navigating to ${url}...`);

  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('HTTP Status:', response.status());
  if (response.status() !== 200) {
    throw new Error(`Expected HTTP 200, got ${response.status()}`);
  }

  // 1. Verify Photo Bonus Highlight Card exists
  const banner = page.locator('div:has-text("Bonus Stamps")').filter({ hasText: 'Product Photo or Shop Photo' });
  const isBannerVisible = await banner.first().isVisible();
  console.log('Photo Bonus Banner Visible:', isBannerVisible);

  if (!isBannerVisible) {
    throw new Error('Photo Bonus Banner was not found or not visible!');
  }

  const bannerText = await banner.first().innerText();
  console.log('\n📸 Banner text content:\n' + bannerText);

  if (!bannerText.includes('Product Photo') || !bannerText.includes('Shop Photo')) {
    throw new Error('Banner text missing "Product Photo" or "Shop Photo" keywords!');
  }

  // 2. Take visual screenshot
  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  const screenshotPath = path.join(scratchDir, 'verified_smart_ai_review_photo_bonus_highlight.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('\n📸 Screenshot saved to:', screenshotPath);

  await browser.close();
  console.log('🎉 Photo Bonus Highlight Banner verified 100% successfully!');
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
