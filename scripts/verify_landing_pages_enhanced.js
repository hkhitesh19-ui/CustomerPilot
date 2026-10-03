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

    // Assert H1 exists
    const h1TextCard = await page.locator('h1').innerText();
    console.log(`H1 Text: "${h1TextCard.trim()}"`);
    if (!h1TextCard.includes('Smart Digital Business Card')) {
      throw new Error(`TEST 1 FAILED: H1 text does not match expected copy`);
    }

    // Assert Default Card is Cake Connection
    const initialStoreName = await page.locator('[data-testid="phone-store-name"]').innerText();
    console.log(`Initial Default Store in Phone: "${initialStoreName.trim()}"`);
    if (!initialStoreName.includes('Cake Connection')) {
      throw new Error(`TEST 1 FAILED: Default store is not Cake Connection, got "${initialStoreName}"`);
    }

    // Assert CTA button points to Cake Connection live card
    const ctaText = await page.locator('a:has-text("Open Live Card: Cake Connection")').count();
    if (ctaText === 0) {
      throw new Error('TEST 1 FAILED: Expected CTA button "Open Live Card: Cake Connection" not found');
    }

    // Assert Zero Obstructive Floating Cards covering phone
    const cardFloatCount = await page.locator('.float-card').count();
    console.log(`Floating Cards Count (should be 0): ${cardFloatCount}`);
    if (cardFloatCount !== 0) {
      throw new Error(`TEST 1 FAILED: Expected 0 floating cards covering phone, found ${cardFloatCount}`);
    }

    // Assert Phone Mockup exists with luxury chassis
    const phoneMockup = await page.locator('.phone-mockup').count();
    if (phoneMockup === 0) {
      throw new Error('TEST 1 FAILED: Phone mockup not found');
    }

    // Assert "How It Works" Section exists with Infographics & Steps 01, 02, 03
    const howItWorksHeading = await page.locator('text=How Your Smart Digital Business Card Works').count();
    const step01 = await page.locator('text=Step 1 • Touchpoint').count();
    const step02 = await page.locator('text=Step 2 • 1-Tap Save').count();
    const step03 = await page.locator('text=Step 3 • Action').count();
    console.log(`How It Works Heading: ${howItWorksHeading}, Steps: 01=${step01}, 02=${step02}, 03=${step03}`);
    if (howItWorksHeading === 0 || step01 === 0 || step02 === 0 || step03 === 0) {
      throw new Error('TEST 1 FAILED: Missing How It Works section or infographic steps');
    }

    // Test tab switching to Gujarat Photo Goods
    const photoTab = await page.locator('button:has-text("Gujarat Photo Goods")');
    await photoTab.first().click();
    await page.waitForTimeout(500);
    const switchedStoreName = await page.locator('[data-testid="phone-store-name"]').innerText();
    console.log(`Switched Store Name: "${switchedStoreName.trim()}"`);
    if (!switchedStoreName.includes('Gujarat Photo Goods')) {
      throw new Error('TEST 1 FAILED: Failed to switch to Gujarat Photo Goods');
    }

    // Switch back to Cake Connection
    const cakeTab = await page.locator('button:has-text("Cake Connection")');
    await cakeTab.first().click();
    await page.waitForTimeout(500);

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_digital_card_rotating.png'), fullPage: false });
    console.log('✅ TEST 1 PASSED: Cake Connection default, zero floating cards, $100k phone chassis & How It Works section verified.\n');
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

    // Assert Zero Obstructive Floating Cards
    const reviewFloatCount = await page.locator('.float-card').count();
    console.log(`Floating Cards Count (should be 0): ${reviewFloatCount}`);
    if (reviewFloatCount !== 0) {
      throw new Error(`TEST 2 FAILED: Expected 0 floating cards covering phone, found ${reviewFloatCount}`);
    }

    // Assert Phone Mockup exists
    if (await page.locator('.phone-mockup').count() === 0) {
      throw new Error('TEST 2 FAILED: Phone mockup not found');
    }

    // Assert "How It Works" Section exists with Infographics & Steps 01, 02, 03
    const reviewHowItWorks = await page.locator('text=How the Smart AI Review QR Works').count();
    const reviewStep01 = await page.locator('text=Step 1 • Standee Scan').count();
    const reviewStep02 = await page.locator('text=Step 2 • AI Draft').count();
    const reviewStep03 = await page.locator('text=Step 3 • Verified Review').count();
    console.log(`Review How It Works: ${reviewHowItWorks}, Steps: 01=${reviewStep01}, 02=${reviewStep02}, 03=${reviewStep03}`);
    if (reviewHowItWorks === 0 || reviewStep01 === 0 || reviewStep02 === 0 || reviewStep03 === 0) {
      throw new Error('TEST 2 FAILED: Missing Review How It Works section or infographic steps');
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

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_ai_reviews_enhanced.png'), fullPage: false });
    console.log('✅ TEST 2 PASSED: Zero floating cards, $100k phone chassis & How It Works section verified.\n');
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

    // Assert Zero Obstructive Floating Cards
    const replyFloatCount = await page.locator('.float-card').count();
    console.log(`Floating Cards Count (should be 0): ${replyFloatCount}`);
    if (replyFloatCount !== 0) {
      throw new Error(`TEST 3 FAILED: Expected 0 floating cards covering phone, found ${replyFloatCount}`);
    }

    // Assert Phone Mockup exists
    if (await page.locator('.phone-mockup').count() === 0) {
      throw new Error('TEST 3 FAILED: Phone mockup not found');
    }

    // Assert "How It Works" Section exists with Infographics & Steps 01, 02, 03
    const replyHowItWorks = await page.locator('text=How 1-Click AI AutoReply Works in 3 Simple Steps').count();
    const replyStep01 = await page.locator('text=Step 1 • Instant Catch').count();
    const replyStep02 = await page.locator('text=Step 2 • Gemini AI').count();
    const replyStep03 = await page.locator('text=Step 3 • 1-Click Post').count();
    console.log(`AutoReply How It Works: ${replyHowItWorks}, Steps: 01=${replyStep01}, 02=${replyStep02}, 03=${replyStep03}`);
    if (replyHowItWorks === 0 || replyStep01 === 0 || replyStep02 === 0 || replyStep03 === 0) {
      throw new Error('TEST 3 FAILED: Missing AutoReply How It Works section or infographic steps');
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

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_autoreply_enhanced.png'), fullPage: false });
    console.log('✅ TEST 3 PASSED: Zero floating cards, $100k phone chassis & How It Works section verified.\n');
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

    // Assert Zero Obstructive Floating Cards
    const loyaltyFloatCount = await page.locator('.float-card').count();
    console.log(`Floating Cards Count (should be 0): ${loyaltyFloatCount}`);
    if (loyaltyFloatCount !== 0) {
      throw new Error(`TEST 4 FAILED: Expected 0 floating cards covering phone, found ${loyaltyFloatCount}`);
    }

    // Assert Phone Mockup exists
    if (await page.locator('.phone-mockup').count() === 0) {
      throw new Error('TEST 4 FAILED: Phone mockup not found');
    }

    // Assert "How It Works" Section exists with Infographics & Steps 01, 02, 03
    const loyaltyHowItWorks = await page.locator('text=How Our WhatsApp Loyalty Engine Works in 3 Simple Steps').count();
    const loyaltyStep01 = await page.locator('text=Step 1 • Standee Scan').count();
    const loyaltyStep02 = await page.locator('text=Step 2 • Digital Stamp').count();
    const loyaltyStep03 = await page.locator('text=Step 3 • VIP Reward').count();
    console.log(`Loyalty How It Works: ${loyaltyHowItWorks}, Steps: 01=${loyaltyStep01}, 02=${loyaltyStep02}, 03=${loyaltyStep03}`);
    if (loyaltyHowItWorks === 0 || loyaltyStep01 === 0 || loyaltyStep02 === 0 || loyaltyStep03 === 0) {
      throw new Error('TEST 4 FAILED: Missing Loyalty How It Works section or infographic steps');
    }

    // Assert WhatsApp Chat & Stamp Card Graphic
    const stampCardGraphic = await page.locator('text=Virtual Stamp Card').count();
    if (stampCardGraphic === 0) {
      throw new Error('TEST 4 FAILED: Virtual Stamp Card graphic not found in WhatsApp chat');
    }

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_whatsapp_loyalty_enhanced.png'), fullPage: false });
    console.log('✅ TEST 4 PASSED: Zero floating cards, $100k phone chassis & How It Works section verified.\n');
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

    // Assert Zero Obstructive Floating Cards
    const completeFloatCount = await page.locator('.float-card').count();
    console.log(`Floating Cards Count (should be 0): ${completeFloatCount}`);
    if (completeFloatCount !== 0) {
      throw new Error(`TEST 5 FAILED: Expected 0 floating cards covering cockpit, found ${completeFloatCount}`);
    }

    // Assert Hub Mockup exists
    if (await page.locator('.hub-mockup').count() === 0) {
      throw new Error('TEST 5 FAILED: Hub cockpit mockup not found');
    }

    // Assert "How It Works" Section exists with Infographics & Steps 01, 02, 03
    const completeHowItWorks = await page.locator('text=How CustomerPilot Complete Runs Your Shop on Autopilot in 3 Steps').count();
    const completeStep01 = await page.locator('text=Step 1 • Standee Setup').count();
    const completeStep02 = await page.locator('text=Step 2 • 4-Engine Sync').count();
    const completeStep03 = await page.locator('text=Step 3 • Unified ROI').count();
    console.log(`Complete How It Works: ${completeHowItWorks}, Steps: 01=${completeStep01}, 02=${completeStep02}, 03=${completeStep03}`);
    if (completeHowItWorks === 0 || completeStep01 === 0 || completeStep02 === 0 || completeStep03 === 0) {
      throw new Error('TEST 5 FAILED: Missing Complete How It Works section or infographic steps');
    }

    // Assert 4 tiles inside cockpit simulator
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

    // Capture screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'landing_complete_enhanced.png'), fullPage: false });
    console.log('✅ TEST 5 PASSED: Zero floating cards, $100k cockpit chassis & How It Works section verified.\n');
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
