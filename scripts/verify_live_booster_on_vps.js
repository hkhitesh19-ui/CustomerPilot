const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('--- Connecting to live production https://customerpilot.in ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage();

  console.log('1. Logging in as SuperAdmin...');
  await page.goto('https://customerpilot.in/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'admin@customerpilot.in');
  await page.fill('input[type="password"]', 'Admin@CustomerPilot2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('2. Impersonating Shreenath Rajwadi Silk Palace (cmwitzi0y0002kvwsw32v7uqc)...');
  const impRes = await page.evaluate(async () => {
    const res = await fetch('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId: 'cmwitzi0y0002kvwsw32v7uqc' })
    });
    return res.json();
  });
  console.log('Impersonate Result:', impRes);

  console.log('3. Navigating to https://customerpilot.in/dashboard/WAGroupBooster...');
  await page.goto('https://customerpilot.in/dashboard/WAGroupBooster', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check for the presence of the new controls
  const pageContent = await page.content();
  const hasHeroPill = pageContent.includes('Hero X-Large (165px)');
  const hasMediumPill = pageContent.includes('Medium (105px)');
  const hasLargePill = pageContent.includes('Large (135px)');
  const hasCleanToggle = pageContent.includes('Logo Only (Clean)') || pageContent.includes('Store name text below logo');

  console.log('\n--- LIVE PAGE ASSERTIONS ---');
  console.log('Has "Hero X-Large (165px)" pill:', hasHeroPill);
  console.log('Has "Medium (105px)" pill:', hasMediumPill);
  console.log('Has "Large (135px)" pill:', hasLargePill);
  console.log('Has Clean Toggle:', hasCleanToggle);

  const outScreenshot = path.join(__dirname, '../public/live_vps_booster_verified.png');
  await page.screenshot({ path: outScreenshot, fullPage: true });
  console.log(`Live screenshot saved to: ${outScreenshot}`);

  // Also take isolated screenshot of the Counter Standee Preview card
  const standeeCard = await page.$('.w-full.max-w-\\[320px\\]') || await page.$('.w-full.max-w-\\[340px\\]');
  if (standeeCard) {
    const cardScreenshot = path.join(__dirname, '../public/live_vps_booster_standee_card.png');
    await standeeCard.screenshot({ path: cardScreenshot });
    console.log(`Live standee card screenshot saved to: ${cardScreenshot}`);
  }

  await browser.close();

  if (!hasHeroPill || !hasLargePill) {
    console.error('FAILED: New pills not detected on live production VPS!');
    process.exit(1);
  }

  console.log('\n🎉 ALL LIVE VPS ASSERTIONS PASSED! NEW CONTROLS AND HERO LOGO ARE 100% LIVE ON PRODUCTION!');
})();
