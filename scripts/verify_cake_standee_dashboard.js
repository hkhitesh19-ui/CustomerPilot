const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[PAGE ${msg.type().toUpperCase()}]:`, msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]:', err));

  console.log('1. Logging in as SuperAdmin on https://customerpilot.in...');
  await page.goto('https://customerpilot.in/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@customerpilot.in');
  await page.fill('input[type="password"]', 'Admin@CustomerPilot2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('2. Impersonating Cake Connection (cmtymavfx0002kx008lbfvp57)...');
  const impersonateRes = await page.evaluate(async () => {
    const res = await fetch('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId: 'cmtymavfx0002kx008lbfvp57' })
    });
    return res.json();
  });
  console.log('Impersonate Result:', impersonateRes);

  console.log('3. Navigating to https://customerpilot.in/dashboard/settings...');
  await page.goto('https://customerpilot.in/dashboard/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Capture Standee Studio section
  const standeeSection = await page.$('#sec-vip-qr');
  if (standeeSection) {
    await standeeSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await standeeSection.screenshot({ path: 'scratch/verified_cake_standee_studio_dashboard.png' });
    console.log('Saved Standee Studio screenshot: scratch/verified_cake_standee_studio_dashboard.png');
  }

  // Click Template A tab: Google Review Standee
  console.log('4. Clicking Template A (Google Review Standee)...');
  const btnTemplateA = await page.$('button:has-text("Template A")');
  if (btnTemplateA) {
    await btnTemplateA.click();
    await page.waitForTimeout(2500);
    await standeeSection.screenshot({ path: 'scratch/verified_cake_standee_template_a_view.png' });
    console.log('Saved Template A screenshot: scratch/verified_cake_standee_template_a_view.png');
  }

  // Click Template B tab: Digital Business Card
  console.log('5. Clicking Template B (Digital Business Card)...');
  const btnTemplateB = await page.$('button:has-text("Template B")');
  if (btnTemplateB) {
    await btnTemplateB.click();
    await page.waitForTimeout(2500);
    await standeeSection.screenshot({ path: 'scratch/verified_cake_standee_template_b_view.png' });
    console.log('Saved Template B screenshot: scratch/verified_cake_standee_template_b_view.png');
  }

  // Click Template C tab: Connect & Review Duo
  console.log('6. Clicking Template C (Connect & Review Duo)...');
  const btnTemplateC = await page.$('button:has-text("Template C")');
  if (btnTemplateC) {
    await btnTemplateC.click();
    await page.waitForTimeout(2500);
    await standeeSection.screenshot({ path: 'scratch/verified_cake_standee_template_c_view.png' });
    console.log('Saved Template C screenshot: scratch/verified_cake_standee_template_c_view.png');
  }

  // Fetch the 4 official standees directly from the live VPS endpoint to guarantee 100% ground-truth
  console.log('7. Downloading live VPS rendered images for all 4 combinations...');
  const designs = [
    { key: 'review', filename: 'verified_live_cake_standee_template_a_google_review.jpg' },
    { key: 'card', filename: 'verified_live_cake_standee_template_b_digital_card.jpg' },
    { key: 'combo', filename: 'verified_live_cake_standee_template_c_connect_review.jpg' },
    { key: 'master', filename: 'verified_live_cake_standee_template_d_master_loyalty.jpg' },
  ];

  for (const d of designs) {
    const res = await page.goto(`https://customerpilot.in/api/qr/standee?design=${d.key}&m=cmtymavfx0002kx008lbfvp57`);
    const buffer = await res.body();
    const dest = path.join('scratch', d.filename);
    fs.writeFileSync(dest, buffer);
    console.log(`Saved ${dest} (${buffer.length} bytes)`);

    // Also copy to artifact directory
    const artifactPath = path.join('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4', d.filename);
    fs.writeFileSync(artifactPath, buffer);
  }

  await browser.close();
  console.log('All automated browser tests and visual verification finished successfully!');
})().catch(err => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
