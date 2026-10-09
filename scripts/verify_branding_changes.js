const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('--- STARTING PLAYWRIGHT VERIFICATION ---');

  // Test 1: /pricing
  console.log('\n[1/4] Verifying http://localhost:3000/pricing');
  await page.goto('http://localhost:3000/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  let content = await page.content();
  
  // Check 1.1: Simple, Transparent Pricing badge removed
  if (content.includes('Simple, Transparent Pricing')) {
    console.error('FAIL: Found "Simple, Transparent Pricing" on /pricing');
    process.exit(1);
  } else {
    console.log('PASS: "Simple, Transparent Pricing" badge completely removed.');
  }

  // Check 1.2: Pricing Studio v4 removed
  if (content.includes('Pricing Studio v4') || content.includes('Studio v4')) {
    console.error('FAIL: Found "Studio v4" on /pricing');
    process.exit(1);
  } else {
    console.log('PASS: "Studio v4" completely removed from /pricing.');
  }

  // Check 1.3: NFC removed
  if (content.includes('NFC')) {
    console.error('FAIL: Found "NFC" on /pricing');
    process.exit(1);
  } else {
    console.log('PASS: Zero "NFC" on /pricing.');
  }

  await page.screenshot({ path: 'scratch/verified_branding_pricing.png', fullPage: false });
  console.log('Saved screenshot: scratch/verified_branding_pricing.png');

  // Test 2: /whatsapp-digital-loyalty-card
  console.log('\n[2/4] Verifying http://localhost:3000/whatsapp-digital-loyalty-card');
  await page.goto('http://localhost:3000/whatsapp-digital-loyalty-card', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  content = await page.content();

  // Check 2.1: Renamed headline
  const expectedHeading = 'How Our WhatsApp Digital Loyalty Stamps System Works in 3 Simple Steps';
  if (!content.includes(expectedHeading)) {
    console.error('FAIL: Expected heading not found on /whatsapp-digital-loyalty-card');
    process.exit(1);
  } else {
    console.log(`PASS: Found exact heading: "${expectedHeading}"`);
  }

  // Check 2.2: NFC removed
  if (content.includes('NFC')) {
    console.error('FAIL: Found "NFC" on /whatsapp-digital-loyalty-card');
    process.exit(1);
  } else {
    console.log('PASS: Zero "NFC" on /whatsapp-digital-loyalty-card.');
  }

  await page.screenshot({ path: 'scratch/verified_branding_loyalty.png', fullPage: false });
  console.log('Saved screenshot: scratch/verified_branding_loyalty.png');

  // Test 3: /ai-google-review-qr-generator
  console.log('\n[3/4] Verifying http://localhost:3000/ai-google-review-qr-generator');
  await page.goto('http://localhost:3000/ai-google-review-qr-generator', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  content = await page.content();

  // Check 3.1: H1 renamed
  const h1Text = await page.locator('h1').innerText();
  console.log('H1 Text:', h1Text);
  if (!h1Text.includes('Smart Ai Google Review QR')) {
    console.error('FAIL: H1 does not contain "Smart Ai Google Review QR"');
    process.exit(1);
  } else {
    console.log('PASS: H1 matches "Smart Ai Google Review QR".');
  }

  // Check 3.2: Acrylic QR Standee removed
  if (content.includes('Acrylic QR Standee') || content.includes('acrylic counter standee') || content.includes('Acrylic Counter Standee')) {
    console.error('FAIL: Found Acrylic QR Standee on /ai-google-review-qr-generator');
    process.exit(1);
  } else {
    console.log('PASS: Zero "Acrylic QR Standee" on /ai-google-review-qr-generator.');
  }

  // Check 3.3: NFC removed
  if (content.includes('NFC')) {
    console.error('FAIL: Found "NFC" on /ai-google-review-qr-generator');
    process.exit(1);
  } else {
    console.log('PASS: Zero "NFC" on /ai-google-review-qr-generator.');
  }

  await page.screenshot({ path: 'scratch/verified_branding_ai_review.png', fullPage: false });
  console.log('Saved screenshot: scratch/verified_branding_ai_review.png');

  // Test 4: /smart-digital-business-card
  console.log('\n[4/4] Verifying http://localhost:3000/smart-digital-business-card');
  await page.goto('http://localhost:3000/smart-digital-business-card', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  content = await page.content();

  if (content.includes('NFC')) {
    console.error('FAIL: Found "NFC" on /smart-digital-business-card');
    process.exit(1);
  } else {
    console.log('PASS: Zero "NFC" on /smart-digital-business-card.');
  }

  await page.screenshot({ path: 'scratch/verified_branding_digital_card.png', fullPage: false });
  console.log('Saved screenshot: scratch/verified_branding_digital_card.png');

  console.log('\n--- ALL PLAYWRIGHT BRANDING VERIFICATIONS PASSED 100% ---');
  await browser.close();
})();
