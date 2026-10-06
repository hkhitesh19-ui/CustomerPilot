const { chromium } = require('playwright');
const { SignJWT } = require('jose');
const dotenv = require('dotenv');
const assert = require('assert');

dotenv.config();

(async () => {
  console.log('=== VERIFYING /roi-calculator page ===');

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

  // Wait for hero to load
  await page.waitForSelector('text=This is the extra sales opportunity', { timeout: 20000 });
  console.log('✅ Hero banner found');

  // Verify main sliders exist
  await page.waitForSelector('#r_cpd', { timeout: 10000 });
  console.log('✅ Slider #r_cpd found');

  await page.waitForSelector('#r_rec', { timeout: 5000 });
  console.log('✅ Slider #r_rec found');

  // Verify repeat section
  const repeatSection = await page.getByRole('heading', { name: '🔁 Repeat customers' }).isVisible();
  assert.strictEqual(repeatSection, true, 'Repeat customers section must be visible');
  console.log('✅ Repeat customers section visible');

  // Verify savings section
  const savingsSection = await page.getByRole('heading', { name: '📊 Total sales and savings' }).isVisible();
  assert.strictEqual(savingsSection, true, 'Total sales section must be visible');
  console.log('✅ Total sales section visible');

  // Verify extra benefits
  const benefitsSection = await page.getByRole('heading', { name: '✨ Extra benefits — beyond just sales' }).isVisible();
  assert.strictEqual(benefitsSection, true, 'Extra benefits section must be visible');
  console.log('✅ Extra benefits section visible');

  // Verify CTA
  const ctaButton = await page.locator('text=Start Free Trial').first().isVisible();
  assert.strictEqual(ctaButton, true, 'CTA Start Free Trial must be visible');
  console.log('✅ CTA button visible');

  // Check the computed hero ROI value is not empty
  const heroText = await page.locator('#hero-roi-total').textContent();
  console.log('Hero ROI value:', heroText);
  assert.ok(heroText && heroText.trim().length > 0, 'Hero ROI value must not be empty');
  console.log('✅ Hero ROI value rendered:', heroText.trim());

  // Screenshot
  await page.screenshot({ path: 'scratch/roi_calculator_verified.png', fullPage: false });
  console.log('Screenshot saved to scratch/roi_calculator_verified.png');

  await browser.close();
  console.log('\n=== ROI CALCULATOR PAGE — ALL ASSERTIONS PASSED ✅ ===');
})().catch(err => {
  console.error('VERIFICATION FAILED:', err.message);
  process.exit(1);
});
