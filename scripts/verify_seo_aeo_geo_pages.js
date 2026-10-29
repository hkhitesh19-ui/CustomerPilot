const { chromium } = require('playwright');
const path = require('path');

async function main() {
  console.log('--- Playwright Output & Ground-Truth Verification for SEO/AEO/GEO Pages ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4';
  let allPassed = true;

  // 1. Verify /vs/stamp-me
  console.log('\n[1] Verifying /vs/stamp-me...');
  const res1 = await page.goto('http://localhost:3000/vs/stamp-me', { waitUntil: 'networkidle', timeout: 30000 });
  const body1 = await page.innerText('body');
  const scripts1 = await page.$$eval('script[type="application/ld+json"]', els => els.map(e => e.textContent));
  const hasFaq1 = scripts1.some(s => {
    try { return JSON.parse(s)['@type'] === 'FAQPage'; } catch { return false; }
  });

  const assertions1 = [
    { label: '/vs/stamp-me HTTP 200', pass: res1.status() === 200 },
    { label: 'Hero mentions Stamp Me Alternative', pass: body1.includes('Stamp Me Alternative') },
    { label: 'Pricing mentions ₹49,000+ vs ₹2,249', pass: body1.includes('₹49,000+') && body1.includes('₹2,249') },
    { label: 'Savings ₹46,751 visible', pass: body1.includes('₹46,751') },
    { label: 'Feature comparison table rendered', pass: body1.includes('App Download Requirement') && body1.includes('Zero — 100% Native on WhatsApp') },
    { label: 'FAQPage JSON-LD schema injected', pass: hasFaq1 },
    { label: 'Zero dummy 98765', pass: !body1.includes('98765') },
    { label: 'Zero dummy 12345', pass: !body1.includes('12345') }
  ];

  assertions1.forEach((a, i) => {
    const symbol = a.pass ? '✅ PASS' : '❌ FAIL';
    console.log(`  1.${i + 1} [${symbol}] ${a.label}`);
    if (!a.pass) allPassed = false;
  });

  await page.screenshot({ path: path.join(artifactDir, 'stamp_me_vs_verified.png'), fullPage: true });

  // 2. Verify /customerpilot-vs-stamp-me alias
  console.log('\n[2] Verifying /customerpilot-vs-stamp-me alias...');
  const res2 = await page.goto('http://localhost:3000/customerpilot-vs-stamp-me', { waitUntil: 'networkidle', timeout: 30000 });
  const body2 = await page.innerText('body');
  const pass2 = res2.status() === 200 && body2.includes('Stamp Me Alternative');
  console.log(`  2.1 [${pass2 ? '✅ PASS' : '❌ FAIL'}] Alias route renders Stamp Me comparison`);
  if (!pass2) allPassed = false;

  // 3. Verify /smart-digital-business-card
  console.log('\n[3] Verifying /smart-digital-business-card...');
  const res3 = await page.goto('http://localhost:3000/smart-digital-business-card', { waitUntil: 'networkidle', timeout: 30000 });
  const body3 = await page.innerText('body');
  const scripts3 = await page.$$eval('script[type="application/ld+json"]', els => els.map(e => e.textContent));
  const hasFaq3 = scripts3.some(s => {
    try { return JSON.parse(s)['@type'] === 'FAQPage'; } catch { return false; }
  });

  const assertions3 = [
    { label: '/smart-digital-business-card HTTP 200', pass: res3.status() === 200 },
    { label: 'H1: Smart Digital Business Card with QR Code & Instant Google Reviews', pass: body3.includes('Smart Digital Business Card with QR Code & Instant Google Reviews') },
    { label: 'Feature 1-Tap Save Contact (vCard) visible', pass: body3.includes('1-Tap Save Contact (vCard)') },
    { label: 'Feature Direct Google Review Modal visible', pass: body3.includes('Direct Google Review Modal') },
    { label: 'Comparison table: CustomerPilot Smart Card vs. Traditional Paper Cards vs. Linktree', pass: body3.includes('CustomerPilot Smart Card vs. Traditional Paper Cards vs. Linktree') },
    { label: 'Hinglish FAQ 1 visible', pass: body3.includes('Dukan ya business ke liye digital visiting card kaise banaye?') },
    { label: 'Hinglish FAQ 2 visible', pass: body3.includes('CustomerPilot digital card me kya kya features hote hain?') },
    { label: 'FAQPage JSON-LD schema injected', pass: hasFaq3 },
    { label: 'Zero dummy 98765', pass: !body3.includes('98765') },
    { label: 'Zero dummy 12345', pass: !body3.includes('12345') }
  ];

  assertions3.forEach((a, i) => {
    const symbol = a.pass ? '✅ PASS' : '❌ FAIL';
    console.log(`  3.${i + 1} [${symbol}] ${a.label}`);
    if (!a.pass) allPassed = false;
  });

  await page.screenshot({ path: path.join(artifactDir, 'smart_digital_business_card_verified.png'), fullPage: true });

  await browser.close();

  if (!allPassed) {
    console.error('\n❌ Verification failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL VERIFICATION ASSERTIONS FOR STEP 1, 2, AND 3 PASSED 100%!');
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
