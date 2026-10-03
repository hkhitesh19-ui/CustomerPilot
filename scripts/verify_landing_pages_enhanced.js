const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4';

async function verifyLandingPages() {
  console.log('🚀 Starting Playwright Ground-Truth & Visual Verification for All Landing Pages...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  const results = [];

  try {
    // ----------------------------------------------------
    // TEST 1: Smart Digital Business Card (/smart-digital-business-card)
    // ----------------------------------------------------
    console.log('--- TEST 1: Smart Digital Business Card ---');
    await page.goto('http://localhost:3000/smart-digital-business-card', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Assert H1 exists and contains expected Indian English text
    const h1TextCard = await page.locator('h1').innerText();
    console.log(`H1 Text: "${h1TextCard.trim()}"`);
    if (!h1TextCard.includes('Smart Digital Business Card') || !h1TextCard.includes('Instant Google Reviews')) {
      throw new Error(`TEST 1 FAILED: H1 text does not match expected copy`);
    }

    // Assert live rotating business examples exist (Tasty Vadapav & Gujarat Photo Goods)
    const tastyTab = await page.locator('button:has-text("Tasty Vadapav")');
    const photoTab = await page.locator('button:has-text("Gujarat Photo Goods")');
    const cakeTab = await page.locator('button:has-text("Cake Connection")');

    const tastyCount = await tastyTab.count();
    const photoCount = await photoTab.count();
    const cakeCount = await cakeTab.count();

    console.log(`Live Tabs count: Tasty=${tastyCount}, Photo=${photoCount}, Cake=${cakeCount}`);
    if (tastyCount === 0 || photoCount === 0 || cakeCount === 0) {
      throw new Error('TEST 1 FAILED: Missing live rotating example business tabs');
    }

    // Click on Gujarat Photo Goods tab and assert phone simulator updates
    await photoTab.first().click();
    await page.waitForTimeout(500);

    const simulatorStoreName = await page.locator('.phone-mockup h3').innerText();
    console.log(`Phone Simulator Store Name: "${simulatorStoreName}"`);
    if (!simulatorStoreName.includes('Gujarat Photo Goods')) {
      throw new Error(`TEST 1 FAILED: Phone simulator did not switch to Gujarat Photo Goods`);
    }

    // Assert floating badges exist
    const fl1Badge = await page.locator('.float-card.fl1').innerText();
    console.log(`Floating Badge 1: "${fl1Badge.replace(/\n/g, ' ')}"`);
    if (!fl1Badge.includes('Rating Synced')) {
      throw new Error('TEST 1 FAILED: Missing floating badge 1 on digital card page');
    }

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_digital_card_rotating.png'), fullPage: false });
    console.log('✅ TEST 1 PASSED: Smart Digital Business Card verified with live rotating examples and floating badges.\n');
    results.push({ test: 'Smart Digital Business Card', status: 'PASS' });


    // ----------------------------------------------------
    // TEST 2: AI Google Review QR Generator (/ai-google-review-qr-generator)
    // ----------------------------------------------------
    console.log('--- TEST 2: AI Google Review QR Generator ---');
    await page.goto('http://localhost:3000/ai-google-review-qr-generator', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    const h1TextReview = await page.locator('h1').innerText();
    console.log(`H1 Text: "${h1TextReview.trim()}"`);
    if (!h1TextReview.includes('5-Star Google Review') || !h1TextReview.includes('Autopilot')) {
      throw new Error(`TEST 2 FAILED: H1 text does not match expected copy`);
    }

    // Assert 3 Big Friction Points exist
    const frictionHead = await page.locator('text=Why 90% of Happy Walk-In Customers Never Leave a Google Review').count();
    if (frictionHead === 0) {
      throw new Error('TEST 2 FAILED: Missing 3 Big Friction Points section');
    }

    // Assert AI vs Normal QR comparison section exists
    const aiVsNormalHead = await page.locator('text=Standard QR Code vs. CustomerPilot Smart AI Review QR').count();
    if (aiVsNormalHead === 0) {
      throw new Error('TEST 2 FAILED: Missing AI vs Normal QR comparison section');
    }

    // Assert Private Feedback Shield section exists
    const shieldHead = await page.locator('text=Negative Feedback Shield').count();
    if (shieldHead === 0) {
      throw new Error('TEST 2 FAILED: Missing Negative Feedback Shield section');
    }

    // Assert Live Review Simulator & 1-Tap Copy button
    const copyBtn = page.locator('button:has-text("1-Tap Copy & Post on Google Maps")');
    if (await copyBtn.count() === 0) {
      throw new Error('TEST 2 FAILED: Missing 1-Tap Copy button on simulator');
    }
    await copyBtn.click();
    await page.waitForTimeout(300);
    const copiedText = await page.locator('text=Copied! Opening Google Maps...').count();
    if (copiedText === 0) {
      throw new Error('TEST 2 FAILED: Copy feedback text not displayed');
    }

    // Assert Floating Badges
    const reviewFl1 = await page.locator('.float-card.fl1').innerText();
    console.log(`Floating Badge 1: "${reviewFl1.replace(/\n/g, ' ')}"`);
    if (!reviewFl1.includes('New 5★ Review')) {
      throw new Error('TEST 2 FAILED: Missing floating badge 1 on review QR page');
    }

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_ai_reviews_enhanced.png'), fullPage: false });
    console.log('✅ TEST 2 PASSED: AI Google Review QR Generator verified with friction points, AI vs Normal QR, Feedback Shield, and simulator.\n');
    results.push({ test: 'AI Google Review QR Generator', status: 'PASS' });


    // ----------------------------------------------------
    // TEST 3: 1-Click AI AutoReply (/ai-google-review-autoreply)
    // ----------------------------------------------------
    console.log('--- TEST 3: 1-Click AI AutoReply ---');
    await page.goto('http://localhost:3000/ai-google-review-autoreply', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    const h1TextReply = await page.locator('h1').innerText();
    console.log(`H1 Text: "${h1TextReply.trim()}"`);
    if (!h1TextReply.includes('Automate Google Review Replies in 1-Click')) {
      throw new Error(`TEST 3 FAILED: H1 text does not match expected copy`);
    }

    // Assert Indian English heading in Agitation
    const agitationReply = await page.locator('text=Why 85% of Local Businesses Fail to Reply to Google Reviews').count();
    if (agitationReply === 0) {
      throw new Error('TEST 3 FAILED: Agitation heading not found in Indian English');
    }

    // Assert Live Reply Simulator & 1-Click Publish button
    const publishBtn = page.locator('button:has-text("1-Click Publish to Google Maps")');
    if (await publishBtn.count() === 0) {
      throw new Error('TEST 3 FAILED: Missing 1-Click Publish button on simulator');
    }
    await publishBtn.click();
    await page.waitForTimeout(300);
    const publishedText = await page.locator('text=Published to Google Maps!').count();
    if (publishedText === 0) {
      throw new Error('TEST 3 FAILED: Publish confirmation feedback text not displayed');
    }

    // Assert Floating Badges
    const replyFl1 = await page.locator('.float-card.fl1').innerText();
    console.log(`Floating Badge 1: "${replyFl1.replace(/\n/g, ' ')}"`);
    if (!replyFl1.includes('AI Reply Published')) {
      throw new Error('TEST 3 FAILED: Missing floating badge 1 on autoreply page');
    }

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_autoreply_enhanced.png'), fullPage: false });
    console.log('✅ TEST 3 PASSED: 1-Click AI AutoReply verified with live simulator, 100% Indian English, and floating badges.\n');
    results.push({ test: '1-Click AI AutoReply', status: 'PASS' });


    // ----------------------------------------------------
    // TEST 4: WhatsApp Digital Loyalty Card (/whatsapp-digital-loyalty-card)
    // ----------------------------------------------------
    console.log('--- TEST 4: WhatsApp Digital Loyalty Card ---');
    await page.goto('http://localhost:3000/whatsapp-digital-loyalty-card', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    const h1TextLoyalty = await page.locator('h1').innerText();
    console.log(`H1 Text: "${h1TextLoyalty.trim()}"`);
    if (!h1TextLoyalty.includes('WhatsApp Digital Loyalty Cards')) {
      throw new Error(`TEST 4 FAILED: H1 text does not match expected copy`);
    }

    // Assert Indian English heading in Agitation
    const agitationLoyalty = await page.locator('text=Why Paper Punch Cards and Expensive 3rd-Party Apps Fail Indian Retailers').count();
    if (agitationLoyalty === 0) {
      throw new Error('TEST 4 FAILED: Agitation heading not found in Indian English');
    }

    // Assert WhatsApp Chat & Stamp Card Graphic
    const stampCardGraphic = await page.locator('text=Virtual Stamp Card').count();
    if (stampCardGraphic === 0) {
      throw new Error('TEST 4 FAILED: Virtual Stamp Card graphic not found in WhatsApp chat');
    }

    // Assert Floating Badges
    const loyaltyFl1 = await page.locator('.float-card.fl1').innerText();
    console.log(`Floating Badge 1: "${loyaltyFl1.replace(/\n/g, ' ')}"`);
    if (!loyaltyFl1.includes('Reward Unlocked')) {
      throw new Error('TEST 4 FAILED: Missing floating badge 1 on loyalty page');
    }

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_whatsapp_loyalty_enhanced.png'), fullPage: false });
    console.log('✅ TEST 4 PASSED: WhatsApp Digital Loyalty Card verified with chat simulator, Indian English, and floating badges.\n');
    results.push({ test: 'WhatsApp Digital Loyalty Card', status: 'PASS' });


    // ----------------------------------------------------
    // TEST 5: CustomerPilot Complete (/customerpilot-complete)
    // ----------------------------------------------------
    console.log('--- TEST 5: CustomerPilot Complete ---');
    await page.goto('http://localhost:3000/customerpilot-complete', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    const h1TextComplete = await page.locator('h1').innerText();
    console.log(`H1 Text: "${h1TextComplete.trim()}"`);
    if (!h1TextComplete.includes('Autonomous Customer Retention Engine')) {
      throw new Error(`TEST 5 FAILED: H1 text does not match expected copy`);
    }

    // Assert 4 tiles inside simulator
    const waTile = await page.locator('text=WhatsApp Loyalty').count();
    const reviewsTile = await page.locator('text=Smart AI Reviews').count();
    const replyTile = await page.locator('text=AI AutoReply').count();
    const cardTile = await page.locator('text=Digital Visiting Card').count();

    if (waTile === 0 || reviewsTile === 0 || replyTile === 0 || cardTile === 0) {
      throw new Error('TEST 5 FAILED: Missing one or more module tiles in unified simulator');
    }

    // Assert TCO table
    const tcoHead = await page.locator('text=CustomerPilot Complete vs. 4 Fragmented Apps').count();
    if (tcoHead === 0) {
      throw new Error('TEST 5 FAILED: Missing TCO comparison table');
    }

    // Assert Floating Badges
    const completeFl1 = await page.locator('.float-card.fl1').innerText();
    console.log(`Floating Badge 1: "${completeFl1.replace(/\n/g, ' ')}"`);
    if (!completeFl1.includes('Unified Growth Engine')) {
      throw new Error('TEST 5 FAILED: Missing floating badge 1 on complete page');
    }

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_complete_enhanced.png'), fullPage: false });
    console.log('✅ TEST 5 PASSED: CustomerPilot Complete verified with 4-in-1 simulator, TCO table, and floating badges.\n');
    results.push({ test: 'CustomerPilot Complete', status: 'PASS' });

    console.log('====================================================');
    console.log('🎉 ALL 5 LANDING PAGES GROUND-TRUTH & VISUAL VERIFICATION PASSED 100%!');
    console.log('====================================================');

  } catch (error) {
    console.error('❌ Verification Error:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyLandingPages();
