const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4';

async function verifyPageFaq(page, url, pageName, enExpected, hiExpected) {
  console.log(`\n========================================`);
  console.log(`[TESTING] ${pageName} FAQ at ${url}`);
  console.log(`========================================`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load');
  await page.waitForTimeout(1500);

  // Scroll to FAQ section
  const faqSection = page.locator('#faq-section, #faq');
  await faqSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // 1. Assert Default Language is English (Indian English)
  console.log(`  🔍 Checking DEFAULT language state...`);
  const enButton = page.locator('button:has-text("English (Indian English)")');
  await enButton.waitFor({ state: 'visible', timeout: 10000 });
  
  const contentBefore = await page.content();
  if (!contentBefore.includes(enExpected)) {
    throw new Error(`[FAIL] English default text not found: "${enExpected}" on ${url}`);
  }
  console.log(`  ✅ English text confirmed active by default: "${enExpected}"`);

  // Capture English screenshot
  const enScreenshotPath = path.join(ARTIFACT_DIR, `faq_${pageName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_en.png`);
  await page.screenshot({ path: enScreenshotPath, fullPage: false });
  console.log(`  📸 Saved screenshot: ${enScreenshotPath}`);

  // 2. Click Hinglish toggle
  console.log(`  🔄 Clicking "🗣️ Hinglish" toggle...`);
  const hiButton = page.locator('button:has-text("Hinglish")');
  await hiButton.click();
  await page.waitForTimeout(800);

  // Assert Hinglish content appears
  const contentHi = await page.content();
  if (!contentHi.includes(hiExpected)) {
    throw new Error(`[FAIL] Hinglish text not found after toggle: "${hiExpected}" on ${url}`);
  }
  console.log(`  ✅ Hinglish text confirmed active after click: "${hiExpected}"`);

  // Capture Hinglish screenshot
  const hiScreenshotPath = path.join(ARTIFACT_DIR, `faq_${pageName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_hinglish.png`);
  await page.screenshot({ path: hiScreenshotPath, fullPage: false });
  console.log(`  📸 Saved screenshot: ${hiScreenshotPath}`);

  // 3. Switch back to English to verify reversible reactivity
  console.log(`  🔄 Clicking back to "🇮🇳 English (Indian English)"...`);
  await enButton.click();
  await page.waitForTimeout(800);

  const contentBack = await page.content();
  if (!contentBack.includes(enExpected)) {
    throw new Error(`[FAIL] Could not toggle back to English: "${enExpected}" on ${url}`);
  }
  console.log(`  ✅ Successfully toggled back to English default.`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  let passCount = 0;
  let totalTests = 4;

  try {
    // 1. WhatsApp Digital Loyalty Card Page
    await verifyPageFaq(
      page,
      'http://localhost:3000/whatsapp-digital-loyalty-card',
      'whatsapp_loyalty',
      'How to create a digital loyalty card for my retail shop or restaurant?',
      'Shop ke liye digital loyalty card kaise banaye?'
    );
    passCount++;

    // 2. Smart Digital Business Card Page
    await verifyPageFaq(
      page,
      'http://localhost:3000/smart-digital-business-card',
      'smart_digital_card',
      'How to create a smart digital visiting card with QR code for my business?',
      'Dukan ya business ke liye digital visiting card kaise banaye?'
    );
    passCount++;

    // 3. Competitor Interception Page (Stamp Me)
    await verifyPageFaq(
      page,
      'http://localhost:3000/vs/stamp-me',
      'stamp_me_vs',
      'Why are Indian retailers switching from Stamp Me to CustomerPilot?',
      'Indian retailers Stamp Me chhod kar CustomerPilot par kyu switch kar rahe hain?'
    );
    passCount++;

    // 4. Main Homepage FAQ Section
    await verifyPageFaq(
      page,
      'http://localhost:3000#faq',
      'homepage',
      'What is CustomerPilot, and how does it grow my local business?',
      'CustomerPilot kya hai, aur ye mere local business ko kaise grow karta hai?'
    );
    passCount++;

    console.log(`\n========================================================`);
    console.log(`🎉 ALL ${passCount}/${totalTests} DUAL-LANGUAGE FAQ TESTS PASSED WITH 100% SUCCESS!`);
    console.log(`========================================================\n`);
  } catch (error) {
    console.error(`\n❌ TEST FAILED:`, error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
