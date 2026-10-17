const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[PAGE ${msg.type().toUpperCase()}]:`, msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]:', err));

  console.log('1. Logging in as SuperAdmin...');
  await page.goto('https://customerpilot.in/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@customerpilot.in');
  await page.fill('input[type="password"]', 'Admin@CustomerPilot2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('2. Opening super-admin?tab=merchants...');
  await page.goto('https://customerpilot.in/super-admin?tab=merchants', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'scratch/verified_superadmin_vinayak_live.png' });
  console.log('Saved superadmin screenshot: scratch/verified_superadmin_vinayak_live.png');

  console.log('3. Impersonating Vinayak Fashion...');
  const impersonateRes = await page.evaluate(async () => {
    const res = await fetch('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId: 'cmvaruybf0n9akvtmbog4k7u7' })
    });
    return res.json();
  });
  console.log('Impersonate Result:', impersonateRes);

  console.log('4. Navigating to returned redirectTo URL:', impersonateRes.redirectTo);
  await page.goto('https://customerpilot.in' + (impersonateRes.redirectTo || '/dashboard'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('Current URL after impersonation:', page.url());

  console.log('5. Navigating to /dashboard/settings...');
  await page.goto('https://customerpilot.in/dashboard/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'scratch/verified_vinayak_dashboard_settings.png' });
  console.log('Saved dashboard settings screenshot: scratch/verified_vinayak_dashboard_settings.png');

  // Also capture close-up of standee card
  const standeeImg = await page.$('img[alt*="Universal Master QR Code"]');
  if (standeeImg) {
    await standeeImg.screenshot({ path: 'scratch/verified_vinayak_standee_element.png' });
    console.log('Saved standee element screenshot: scratch/verified_vinayak_standee_element.png');
  }

  // Also fetch live standee image directly via HTTP
  const response = await page.goto('https://customerpilot.in/api/qr/standee?design=master&m=cmvaruybf0n9akvtmbog4k7u7');
  const buffer = await response.body();
  const fs = require('fs');
  fs.writeFileSync('scratch/live_vps_vinayak_standee.jpg', buffer);
  console.log('Saved direct standee response: scratch/live_vps_vinayak_standee.jpg');

  await browser.close();
  console.log('Verification script completed!');
})().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
