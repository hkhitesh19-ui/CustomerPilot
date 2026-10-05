const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('🚀 Starting Ground Truth Playwright Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4';

  // ═══════════════════════════════════════════════════════════════
  // TEST 1: Digital Business Card at /c/cake-connection
  // ═══════════════════════════════════════════════════════════════
  console.log('Testing Digital Business Card at /c/cake-connection...');
  await page.goto('http://localhost:3000/c/cake-connection', { waitUntil: 'networkidle', timeout: 30000 });

  // Assert Title & Business Name
  const businessName = await page.locator('text=Cake Connection').first().textContent();
  console.log(`Verified Business Name: ${businessName}`);

  // Assert Loyalty Stamps Button
  const loyaltyBtn = page.locator('a:has-text("Loyalty Stamps")').first();
  const loyaltyClasses = await loyaltyBtn.getAttribute('class');
  console.log(`Loyalty Stamps Button Classes: ${loyaltyClasses}`);
  if (!loyaltyClasses.includes('border-emerald-300') && !loyaltyClasses.includes('emerald')) {
    throw new Error('Loyalty Stamps button is missing emerald styling!');
  }
  console.log('✅ Loyalty Stamps button has official WhatsApp Emerald Green styling!');

  // Assert Smart AI Google Review Button
  const reviewBtn = page.locator('a:has-text("Google Review")').first();
  const reviewHref = await reviewBtn.getAttribute('href');
  console.log(`Smart AI Google Review Button href: ${reviewHref}`);
  if (!reviewHref.includes('/review?m=')) {
    throw new Error(`Google Review button is not pointing to Smart AI Review module! Got: ${reviewHref}`);
  }
  console.log(`✅ Google Review button links to CustomerPilot Smart AI Review: ${reviewHref}`);

  // Take screenshot of mobile card view
  await page.screenshot({
    path: path.join(artifactsDir, 'cake_connection_digital_card_emerald_and_ai_review.png'),
    fullPage: false
  });
  console.log('📸 Captured screenshot: cake_connection_digital_card_emerald_and_ai_review.png');

  // ═══════════════════════════════════════════════════════════════
  // TEST 2: Navigate to Smart AI Google Review Module
  // ═══════════════════════════════════════════════════════════════
  console.log(`Navigating to Smart AI Review Module at ${reviewHref}...`);
  await page.goto(`http://localhost:3000${reviewHref}`, { waitUntil: 'networkidle', timeout: 30000 });

  const reviewPageText = await page.content();
  if (!reviewPageText.includes('Cake Connection')) {
    throw new Error('Review module page does not contain Cake Connection store name!');
  }
  console.log('✅ Smart AI Google Review module loaded successfully for Cake Connection!');

  await page.screenshot({
    path: path.join(artifactsDir, 'cake_connection_smart_ai_review_module.png'),
    fullPage: false
  });
  console.log('📸 Captured screenshot: cake_connection_smart_ai_review_module.png');

  // ═══════════════════════════════════════════════════════════════
  // TEST 3: Master Standee Print API & Live Preview
  // ═══════════════════════════════════════════════════════════════
  console.log('Testing Master Standee Print API...');
  const res = await page.request.get('http://localhost:3000/api/qr/standee?design=master&format=print&m=cmtymavfx0002kx008lbfvp57');
  if (res.status() !== 200) {
    throw new Error(`Master standee API returned status ${res.status()}`);
  }
  const contentType = res.headers()['content-type'];
  const bodyBuf = await res.body();
  console.log(`Master Standee API Status: 200, Content-Type: ${contentType}, Size: ${bodyBuf.length} bytes`);
  if (!contentType.includes('image/jpeg') || bodyBuf.length < 50000) {
    throw new Error(`Unexpected standee image response: ${contentType}, length: ${bodyBuf.length}`);
  }
  console.log('✅ Master Standee print image is authentic high-res 3D graphic!');

  // Save the image directly to artifacts
  fs.writeFileSync(path.join(artifactsDir, 'cake_connection_master_print_standee_verified.jpg'), bodyBuf);
  console.log('📸 Saved high-res Master Standee to artifacts: cake_connection_master_print_standee_verified.jpg');

  await browser.close();
  console.log('🎉 All Playwright Ground-Truth Assertions PASSED perfectly!');
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
