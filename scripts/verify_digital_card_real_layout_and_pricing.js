const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4';

async function verifyDigitalCardAndPricing() {
  console.log('🚀 Starting Playwright Verification: Real Digital Card Layout & Official Pricing...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 950 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:3000/smart-digital-business-card...');
    await page.goto('http://localhost:3000/smart-digital-business-card', { waitUntil: 'load', timeout: 45000 });
    await page.waitForSelector('[data-testid="phone-store-name"]', { timeout: 20000 });
    // Wait for client React hydration
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // ==========================================
    // 1. VERIFY DEFAULT PHONE SIMULATOR (Cake Connection)
    // ==========================================
    console.log('--- 1. Verifying Authentic Cake Connection Layout inside Phone ---');

    // Store Name
    const storeName = await page.locator('[data-testid="phone-store-name"]').innerText();
    console.log(`Phone Store Name: "${storeName.trim()}"`);
    if (!storeName.includes('Cake Connection')) {
      throw new Error(`Expected Cake Connection as default, found "${storeName}"`);
    }

    // Logo Image
    const logoImg = await page.locator('.phone-mockup img[src*="1789267721286-IMG_20220502_WA0034.jpg"]');
    const hasLogo = await logoImg.count();
    console.log(`Cake Connection Logo in Phone Mockup: ${hasLogo > 0 ? 'FOUND' : 'NOT FOUND'}`);
    if (hasLogo === 0) {
      throw new Error('Cake Connection official logo not found in phone mockup');
    }

    // Tagline (Cakes • Desserts • Flowers • Party Decor)
    const tagline = await page.locator('.phone-mockup:has-text("Cakes • Desserts • Flowers • Party Decor")').count();
    console.log(`Tagline Found: ${tagline > 0}`);
    if (tagline === 0) {
      throw new Error('Authentic Cake Connection tagline not found in phone mockup');
    }

    // 3-Pill Status Bar (Manjalpur, Open Daily, Delivery)
    const pill1 = await page.locator('.phone-mockup:has-text("Manjalpur")').count();
    const pill2 = await page.locator('.phone-mockup:has-text("Open Daily")').count();
    const pill3 = await page.locator('.phone-mockup:has-text("Delivery")').count();
    console.log(`3-Pill Status: Manjalpur=${pill1 > 0}, Open Daily=${pill2 > 0}, Delivery=${pill3 > 0}`);
    if (pill1 === 0 || pill2 === 0 || pill3 === 0) {
      throw new Error('3-Pill status bar elements missing in phone mockup');
    }

    // Action Buttons (WhatsApp, Call Now, Instagram, Facebook, Location)
    const hasWaBtn = await page.locator('.phone-mockup a:has-text("WhatsApp")').count();
    const hasCallBtn = await page.locator('.phone-mockup a:has-text("Call Now")').count();
    const hasInstaBtn = await page.locator('.phone-mockup a:has-text("Instagram")').count();
    const hasFbBtn = await page.locator('.phone-mockup a:has-text("Facebook")').count();
    const hasLocBtn = await page.locator('.phone-mockup a:has-text("Location")').count();
    console.log(`Action Buttons: WA=${hasWaBtn}, Call=${hasCallBtn}, Insta=${hasInstaBtn}, FB=${hasFbBtn}, Loc=${hasLocBtn}`);
    if (hasWaBtn === 0 || hasCallBtn === 0 || hasInstaBtn === 0 || hasFbBtn === 0 || hasLocBtn === 0) {
      throw new Error('One or more action buttons missing in phone mockup');
    }

    // Online Ordering Platforms (Zomato, Swiggy, EasyCater, etc.)
    const hasOrdering = await page.locator('.phone-mockup:has-text("Online Ordering Platforms")').count();
    const hasZomato = await page.locator('.phone-mockup:has-text("Zomato")').count();
    const hasSwiggy = await page.locator('.phone-mockup:has-text("Swiggy")').count();
    console.log(`Ordering Section: Header=${hasOrdering > 0}, Zomato=${hasZomato > 0}, Swiggy=${hasSwiggy > 0}`);
    if (!hasOrdering || !hasZomato || !hasSwiggy) {
      throw new Error('Online Ordering platforms section missing or incomplete in phone mockup');
    }

    // Utility Cards (Google Reviews 4.6★, Share Card, Scan QR)
    const hasReviews = await page.locator('.phone-mockup:has-text("Google Reviews")').count();
    const hasShare = await page.locator('.phone-mockup:has-text("Share Card")').count();
    const hasScanQr = await page.locator('.phone-mockup:has-text("Scan QR")').count();
    console.log(`Utility Cards: Reviews=${hasReviews > 0}, Share=${hasShare > 0}, QR=${hasScanQr > 0}`);
    if (!hasReviews || !hasShare || !hasScanQr) {
      throw new Error('Utility cards missing in phone mockup');
    }

    // Sticky Save Contact Button
    const hasSaveContact = await page.locator('.phone-mockup:has-text("SAVE CONTACT")').count();
    console.log(`Sticky SAVE CONTACT Button: ${hasSaveContact > 0 ? 'FOUND' : 'NOT FOUND'}`);
    if (!hasSaveContact) {
      throw new Error('SAVE CONTACT button missing in phone mockup');
    }

    // Capture Hero & Phone Mockup Screenshot
    const heroSection = page.locator('section').first();
    const heroShotPath = path.join(ARTIFACTS_DIR, 'landing_digital_card_real_layout.png');
    await heroSection.screenshot({ path: heroShotPath });
    console.log(`📸 Saved screenshot to: ${heroShotPath}`);

    // ==========================================
    // 2. VERIFY TAB SWITCHING (Tasty Vadapav & Gujarat Photo Goods)
    // ==========================================
    console.log('\n--- 2. Verifying Interactive Tab Switcher ---');
    
    // Switch to Tasty Vadapav
    await page.click('button[role="tab"]:has-text("Tasty Vadapav")');
    await page.waitForTimeout(500);
    const tvName = await page.locator('[data-testid="phone-store-name"]').innerText();
    const tvLogo = await page.locator('.phone-mockup img[src*="tasty-vadapav-logo.png"]').count();
    console.log(`Switched to Tasty Vadapav: Name="${tvName.trim()}", LogoFound=${tvLogo > 0}`);
    if (!tvName.includes('Tasty Vadapav') || tvLogo === 0) {
      throw new Error('Tab switch to Tasty Vadapav failed');
    }

    // Switch to Gujarat Photo Goods
    await page.click('button[role="tab"]:has-text("Gujarat Photo Goods")');
    await page.waitForTimeout(500);
    const gpName = await page.locator('[data-testid="phone-store-name"]').innerText();
    const gpLogo = await page.locator('.phone-mockup img[src*="gujarat-photo-goods-logo.svg"]').count();
    console.log(`Switched to Gujarat Photo Goods: Name="${gpName.trim()}", LogoFound=${gpLogo > 0}`);
    if (!gpName.includes('Gujarat Photo Goods') || gpLogo === 0) {
      throw new Error('Tab switch to Gujarat Photo Goods failed');
    }

    // ==========================================
    // 3. VERIFY OFFICIAL PRICING PLANS SECTION
    // ==========================================
    console.log('\n--- 3. Verifying Official Pricing Section (#pricing) ---');

    const pricingSection = page.locator('#pricing');
    const pricingCount = await pricingSection.count();
    if (pricingCount === 0) {
      throw new Error('Pricing section #pricing not found');
    }

    // Plan 1: 6 Months (₹349)
    const plan1Price = await pricingSection.locator('text=₹349').count();
    const plan1Duration = await pricingSection.locator('text=6 Months Access').count();
    console.log(`Plan 1 (6 Months): Price ₹349 Found=${plan1Price > 0}, Duration Found=${plan1Duration > 0}`);
    if (plan1Price === 0 || plan1Duration === 0) {
      throw new Error('Plan 1 (6 Months: ₹349) not properly rendered');
    }

    // Plan 2: 1 Year (₹499)
    const plan2Price = await pricingSection.locator('text=₹499').count();
    const plan2Duration = await pricingSection.locator('text=12 Months (1 Year)').count();
    const plan2Popular = await pricingSection.locator('text=Most Popular • Best Annual Value').count();
    console.log(`Plan 2 (1 Year): Price ₹499 Found=${plan2Price > 0}, Duration Found=${plan2Duration > 0}, PopularBadge=${plan2Popular > 0}`);
    if (plan2Price === 0 || plan2Duration === 0 || plan2Popular === 0) {
      throw new Error('Plan 2 (1 Year: ₹499) not properly rendered');
    }

    // Plan 3: Lifetime (₹1499)
    const plan3Price = await pricingSection.locator('text=₹1499').count();
    const plan3Duration = await pricingSection.locator('text=Zero Renewal Fees').count();
    console.log(`Plan 3 (Lifetime): Price ₹1499 Found=${plan3Price > 0}, ZeroRenewals=${plan3Duration > 0}`);
    if (plan3Price === 0 || plan3Duration === 0) {
      throw new Error('Plan 3 (Lifetime: ₹1499) not properly rendered');
    }

    // Scroll to Pricing Section & Capture Screenshot
    await pricingSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const pricingShotPath = path.join(ARTIFACTS_DIR, 'landing_digital_card_pricing.png');
    await pricingSection.screenshot({ path: pricingShotPath });
    console.log(`📸 Saved pricing screenshot to: ${pricingShotPath}`);

    // Check for dummy data across entire page
    const pageContent = await page.content();
    const dummyMatches = pageContent.match(/lorem ipsum|example\.com|9876543210|dummy/gi) || [];
    console.log(`Dummy Data Matches: ${dummyMatches.length}`);
    if (dummyMatches.length > 0) {
      console.warn(`Warning: Potential dummy strings found: ${dummyMatches.slice(0, 5)}`);
    }

    console.log('\n🎉 ALL TESTS PASSED! Real Digital Card Layout and Official Pricing (₹349, ₹499, ₹1499) 100% VERIFIED!');
  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyDigitalCardAndPricing();
