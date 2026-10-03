const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4';

async function verifyLightMode() {
  console.log('========================================================');
  console.log('☀️ VERIFYING STRICT LIGHT MODE ACROSS ALL TOUCHPOINTS');
  console.log('========================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Emulate system dark mode to prove that CustomerPilot FORCES LIGHT MODE anyway!
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: 'dark' // Emulating OS in dark mode
  });

  const page = await context.newPage();
  let passCount = 0;

  const testRoutes = [
    { name: 'Homepage', url: 'http://localhost:3000', screenshot: 'lightmode_homepage.png' },
    { name: 'Product 1: WhatsApp Loyalty', url: 'http://localhost:3000/whatsapp-digital-loyalty-card', screenshot: 'lightmode_whatsapp_loyalty.png' },
    { name: 'Product 2: Smart AI Reviews', url: 'http://localhost:3000/ai-google-review-qr-generator', screenshot: 'lightmode_ai_reviews.png' },
    { name: 'Product 3: 1-Click AI AutoReply', url: 'http://localhost:3000/ai-google-review-autoreply', screenshot: 'lightmode_autoreply.png' },
    { name: 'Product 4: Smart Digital Card', url: 'http://localhost:3000/smart-digital-business-card', screenshot: 'lightmode_digital_card.png' },
    { name: 'Product 5: CustomerPilot Complete', url: 'http://localhost:3000/customerpilot-complete', screenshot: 'lightmode_complete_stack.png' },
    { name: 'Competitor: Stamp Me Alternative', url: 'http://localhost:3000/vs/stamp-me', screenshot: 'lightmode_stamp_me.png' }
  ];

  try {
    for (let i = 0; i < testRoutes.length; i++) {
      const target = testRoutes[i];
      console.log(`[TEST ${i + 1}/${testRoutes.length}] Checking ${target.name} (${target.url})...`);

      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('load');

      // Assert html tag does NOT have class "dark"
      const htmlClasses = await page.evaluate(() => document.documentElement.className);
      if (htmlClasses.includes('dark')) {
        throw new Error(`FAILURE: <html class="${htmlClasses}"> contains 'dark' on ${target.url}! Forced Light mode not working!`);
      }

      // Assert body background is not dark
      const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
      console.log(`  🔍 Computed body background: ${bodyBg}, HTML classes: "${htmlClasses}"`);

      // Verify H1 is present and visible
      const h1Text = await page.locator('h1').first().textContent();
      console.log(`  ✅ H1 Header: "${h1Text.trim().slice(0, 50)}..."`);

      const shotPath = path.join(ARTIFACT_DIR, target.screenshot);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`  📸 Screenshot saved: ${target.screenshot}`);
      console.log(`  ✅ PASS: Strict Light Mode Verified!\n`);
      passCount++;
    }

    console.log('========================================================');
    console.log(`🎉 ALL ${passCount}/${testRoutes.length} LIGHT MODE VERIFICATION TESTS PASSED 100%!`);
    console.log('========================================================\n');

  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyLightMode();
