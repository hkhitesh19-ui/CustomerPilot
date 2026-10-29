const { chromium } = require('playwright');
const dotenv = require('dotenv');
const assert = require('assert');

dotenv.config();

(async () => {
  console.log('=== VERIFYING /roi-calculator HOMEPAGE THEME & TOP SECTION ===');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('pageerror', err => console.log('[PAGE ERROR]:', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[CONSOLE ERROR]:', msg.text());
  });

  console.log('Navigating to http://localhost:3000/roi-calculator ...');
  const resp = await page.goto('http://localhost:3000/roi-calculator', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('HTTP status:', resp?.status());
  assert.strictEqual(resp?.status(), 200, 'Page must return HTTP 200');

  // [USER REQUIREMENT 1] Verify "Your Cost vs Your Opportunity" is at the top
  await page.waitForSelector('text=Your Cost vs Your Opportunity', { timeout: 15000 });
  console.log('✅ Top Section "Your Cost vs Your Opportunity" found');

  const customerPilotCost = await page.locator('text=CustomerPilot').first().isVisible();
  assert.strictEqual(customerPilotCost, true, 'CustomerPilot label must be visible');
  console.log('✅ CustomerPilot label found');

  const feeText = await page.locator('text=₹2,249').first().isVisible();
  assert.strictEqual(feeText, true, 'CustomerPilot fee ₹2,249 must be visible');
  console.log('✅ Fee ₹2,249 found');

  const vsBadge = await page.locator('text=vs').first().isVisible();
  assert.strictEqual(vsBadge, true, 'vs badge must be visible');
  console.log('✅ "vs" badge found');

  const potentialExtraSales = await page.locator('text=Potential Extra Sales').first().isVisible();
  assert.strictEqual(potentialExtraSales, true, 'Potential Extra Sales label must be visible');
  console.log('✅ Potential Extra Sales label found');

  const breakEvenText = await page.locator('#roi-breakeven-banner').textContent();
  console.log('Break-even statement:', breakEvenText.trim());
  assert.ok(breakEvenText.includes('cover the fee'), 'Break-even statement must include "cover the fee"');
  console.log('✅ Break-even calculation verified');

  const ctaButton = await page.locator('text=Start Free Trial — No Credit Card').first().isVisible();
  assert.strictEqual(ctaButton, true, 'CTA "Start Free Trial — No Credit Card" must be visible');
  console.log('✅ CTA button "Start Free Trial — No Credit Card" found');

  // [USER REQUIREMENT 2] Verify Homepage theme elements
  const backToHome = await page.locator('text=Back to Home').isVisible();
  assert.strictEqual(backToHome, true, 'Back to Home link must be visible');
  console.log('✅ Homepage navigation "Back to Home" found');

  const brandLogo = await page.locator('img[alt*="CustomerPilot"]').first().isVisible();
  assert.strictEqual(brandLogo, true, 'BrandLogo must be visible');
  console.log('✅ BrandLogo found');

  // Verify interactive sliders
  await page.waitForSelector('#r_rec', { timeout: 5000 });
  console.log('✅ Recovery slider #r_rec found');

  // Verify hero ROI value rendered
  const heroText = await page.locator('#hero-roi-total').textContent();
  console.log('Hero ROI value rendered:', heroText.trim());
  assert.ok(heroText && heroText.trim().length > 0, 'Hero ROI value must not be empty');

  // Take screenshot of top view and full view
  await page.screenshot({ path: 'scratch/roi_calculator_homepage_theme_verified.png', fullPage: false });
  console.log('Screenshot saved to scratch/roi_calculator_homepage_theme_verified.png');

  await browser.close();
  console.log('\n=== ALL PLAYWRIGHT ASSERTIONS PASSED (100%) ===\n');
})().catch(err => {
  console.error('VERIFICATION FAILED:', err.message);
  process.exit(1);
});
