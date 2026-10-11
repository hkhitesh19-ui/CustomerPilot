const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4';
const BASE_URL = 'http://localhost:3000';

async function verify() {
  console.log('🚀 Starting Verification for /pricing Big 50% OFF Banner & Zero Console TypeError...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  console.log(`Navigating to ${BASE_URL}/pricing ...`);
  const resp = await page.goto(`${BASE_URL}/pricing`, {
    waitUntil: 'commit',
    timeout: 60000
  });

  if (resp.status() !== 200) {
    throw new Error(`Expected 200 on /pricing, got ${resp.status()}`);
  }
  console.log('✅ /pricing loaded with HTTP 200');

  // Wait for Big 50% OFF Banner elements
  await page.waitForSelector('text=All Plans Locked at Flat Half Price!', { timeout: 45000 });
  console.log('✅ Found "All Plans Locked at Flat Half Price!" banner headline on /pricing');

  await page.waitForSelector('text=FLAT DISCOUNT', { timeout: 15000 });
  console.log('✅ Found "FLAT DISCOUNT" badge on /pricing');

  await page.waitForSelector('text=⚡ INSTANT SAVINGS LOCKED', { timeout: 15000 });
  console.log('✅ Found "⚡ INSTANT SAVINGS LOCKED" badge on /pricing');

  await page.waitForTimeout(1500);

  // Check if any "Failed to fetch" error occurred
  const failedToFetchErr = consoleErrors.find((e) => e.includes('Failed to fetch'));
  if (failedToFetchErr) {
    throw new Error(`Found Failed to fetch console error: ${failedToFetchErr}`);
  }
  console.log('✅ PASS: Zero "Failed to fetch" Console TypeError on /pricing!');

  const screenshotPath = path.join(ARTIFACT_DIR, 'verified_public_pricing_big_50_off_banner.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Captured /pricing screenshot: ${screenshotPath}`);

  await browser.close();
  console.log('\n🎉 ALL VERIFICATION CHECKS PASSED!');
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
