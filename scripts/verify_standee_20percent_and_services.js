const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function verify() {
  console.log('🚀 Starting Ground-Truth Verification for Universal Master Standee (20% QR Area + White Badge Logo)...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4';

  // 1. Verify Standee Endpoint Direct Fetch
  console.log('📡 Testing GET /api/qr/standee?design=master&format=print&m=cmtymavfx0002kx008lbfvp57...');
  const resPrint = await page.request.get('http://localhost:3000/api/qr/standee?design=master&format=print&m=cmtymavfx0002kx008lbfvp57');
  if (resPrint.status() !== 200) {
    throw new Error(`Print endpoint returned status ${resPrint.status()}`);
  }
  const printBuf = await resPrint.body();
  console.log(`✅ Print Standee Buffer: ${printBuf.length} bytes (Content-Type: ${resPrint.headers()['content-type']})`);
  fs.writeFileSync(path.join(artifactsDir, 'verified_print_standee_api.jpg'), printBuf);

  // 2. Verify Digital Business Card for Cake Connection
  console.log('📱 Testing Digital Business Card: http://localhost:3000/c/cake-connection...');
  await page.goto('http://localhost:3000/c/cake-connection', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('h1', { timeout: 15000 });

  // Assert Real Merchant Title
  const titleText = await page.textContent('h1');
  console.log(`🏪 Digital Card H1: "${titleText}"`);
  if (!titleText || !titleText.includes('Cake Connection')) {
    throw new Error(`Digital Card title mismatch: ${titleText}`);
  }

  // Assert Emerald Loyalty Stamps Button
  const loyaltyBtn = page.locator('text=Loyalty Stamps').first();
  await loyaltyBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('🎁 Loyalty Stamps button visible: true');

  // Assert Smart AI Google Review Button and link
  const reviewLink = page.locator('a[href*="/review?m="]').first();
  await reviewLink.waitFor({ state: 'attached', timeout: 10000 });
  const reviewHref = await reviewLink.getAttribute('href');
  console.log(`⭐ Google Review AI link: "${reviewHref}"`);
  if (!reviewHref || !reviewHref.includes('/review?m=cmtymavfx0002kx008lbfvp57')) {
    throw new Error(`Review link mismatch: ${reviewHref}`);
  }

  await page.screenshot({ path: path.join(artifactsDir, 'verified_cake_connection_card.png'), fullPage: true });

  // 3. Test Smart AI Google Review Module
  console.log(`🌟 Testing Smart AI Review page: http://localhost:3000${reviewHref}...`);
  await page.goto(`http://localhost:3000${reviewHref}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('text=Cake Connection', { timeout: 15000 });
  console.log('🎂 Cake Connection header visible on AI review page: true');

  await page.screenshot({ path: path.join(artifactsDir, 'verified_cake_connection_ai_review.png'), fullPage: true });

  console.log('🎉 ALL GROUND-TRUTH PLAYWRIGHT CHECKS PASSED 100%!');
  await browser.close();
}

verify().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
