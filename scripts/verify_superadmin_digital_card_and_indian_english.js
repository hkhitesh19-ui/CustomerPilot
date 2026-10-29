require('dotenv').config();
const { chromium } = require('playwright');
const { SignJWT } = require('jose');

const JWT_SECRET = process.env.JWT_SECRET || 'cpilot_jwt_secret_change_this_in_production_2026!';
const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('🚀 Starting Ground-Truth Verification for SuperAdmin Digital Card & Indian English Copy...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Track console errors
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  try {
    // =========================================================================
    // STEP 1: Verify Indian English Copy on /smart-digital-business-card#create-card
    // =========================================================================
    console.log('\n📝 STEP 1: Verifying Indian English copy on /smart-digital-business-card#create-card...');
    await page.goto(`${BASE_URL}/smart-digital-business-card#create-card`, { waitUntil: 'networkidle' });

    const createCardSection = page.locator('#create-card');
    await createCardSection.waitFor({ state: 'visible', timeout: 10000 });

    const sectionText = await createCardSection.innerText();

    // Assert key Indian English phrases
    const expectedPhrases = [
      'Create Your Smart Digital Business Card in 60 Seconds',
      'No complex signup or password needed',
      'Google Review Short Link',
      '3-Day Free Trial',
      'Step-by-Step Guide: How to Find Your Google Review Short Link',
      'Simple 3-step process to get your official review link from Google Business Profile',
      'Search Your Store on Google',
      'Click "Ask for reviews"',
      'Copy and Paste Your Short Review Link',
      'Enter your store or brand details below — zero signup required',
      'Copy your short link using the 3-step guide above and paste it here',
      'Your digital card goes live instantly upon generation'
    ];

    for (const phrase of expectedPhrases) {
      if (!sectionText.includes(phrase)) {
        throw new Error(`❌ Missing expected Indian English phrase in #create-card: "${phrase}"`);
      }
      console.log(`  ✅ Verified phrase: "${phrase}"`);
    }

    // Assert ZERO Hinglish words in the generator section
    const forbiddenHinglish = [
      'Koi signup ya password ki zaroorat',
      'Kaha Se Milegi',
      'kholein',
      'karein',
      'apni dukan',
      'Aapka Smart Digital Business Card Live Hai',
      'ghante',
      'bilkul free chalega',
      'nahi kategi'
    ];

    for (const badWord of forbiddenHinglish) {
      if (sectionText.includes(badWord)) {
        throw new Error(`❌ Detected forbidden Hinglish string in #create-card: "${badWord}"`);
      }
    }
    console.log('  ✅ 100% Zero Hinglish strings detected in #create-card section!');

    // =========================================================================
    // STEP 2: Verify /api/pricing/plans includes Smart Digital Business Card plans
    // =========================================================================
    console.log('\n💰 STEP 2: Verifying Pricing API has all plans including Digital Business Card...');
    const plansRes = await fetch(`${BASE_URL}/api/pricing/plans`);
    const plansData = await plansRes.json();

    if (!plansData.ok || !Array.isArray(plansData.data?.plans)) {
      throw new Error(`❌ Failed to fetch /api/pricing/plans: ${JSON.stringify(plansData)}`);
    }

    const plans = plansData.data.plans;
    console.log(`  ✅ Total plans returned: ${plans.length}`);

    const card6mo = plans.find(p => p.planKey === 'card_6mo');
    const cardYearly = plans.find(p => p.planKey === 'card_yearly');
    const cardLifetime = plans.find(p => p.planKey === 'card_lifetime');

    if (!card6mo || card6mo.price !== 349) {
      throw new Error(`❌ card_6mo missing or incorrect price: ${JSON.stringify(card6mo)}`);
    }
    console.log(`  ✅ card_6mo plan verified: ₹${card6mo.price} (6 Months)`);

    if (!cardYearly || cardYearly.price !== 499) {
      throw new Error(`❌ card_yearly missing or incorrect price: ${JSON.stringify(cardYearly)}`);
    }
    console.log(`  ✅ card_yearly plan verified: ₹${cardYearly.price} (1 Year)`);

    if (!cardLifetime || cardLifetime.price !== 1499) {
      throw new Error(`❌ card_lifetime missing or incorrect price: ${JSON.stringify(cardLifetime)}`);
    }
    console.log(`  ✅ card_lifetime plan verified: ₹${cardLifetime.price} (Lifetime Deal)`);

    // =========================================================================
    // STEP 3: Verify SuperAdmin Card Generation on Behalf of Merchant via API
    // =========================================================================
    console.log('\n👑 STEP 3: Testing SuperAdmin on-behalf generation via /api/admin/digital-cards...');
    const adminToken = await new SignJWT({ userId: 'admin_test_1', email: 'admin@customerpilot.in', role: 'super_admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    const testSlug = `sharma-sweets-admin-test-${Date.now().toString().slice(-4)}`;
    const testPayload = {
      merchantId: 'new',
      displayName: 'Sharma Sweets & Cafe Vadodara',
      slug: testSlug,
      subCategories: 'Sweets • Snacks • Pure Veg • Cafe',
      locationShort: 'Alkapuri, Vadodara',
      locationState: 'Gujarat, India',
      businessHours: 'Open Daily: 9:00 AM – 10:00 PM',
      deliveryInfo: 'Vadodara Citywide Delivery',
      phoneNumber: '+91 90333 04707',
      whatsappNumber: '919033304707',
      googleReviewLink: 'https://g.page/r/CbXxYtest/review',
      googleRating: 4.9,
      googleReviewsCnt: 420,
      instagramUrl: 'https://instagram.com/sharmasweets_vadodara',
      facebookUrl: 'https://facebook.com/sharmasweets',
      zomatoUrl: 'https://zomato.com/vadodara/sharma-sweets',
      swiggyUrl: 'https://swiggy.com/vadodara/sharma-sweets',
      websiteUrl: 'https://sharmasweets.in',
      statusMode: 'TRIAL',
      trialDays: 3,
      isActive: true,
    };

    const adminPostRes = await fetch(`${BASE_URL}/api/admin/digital-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testPayload),
    });

    const adminPostData = await adminPostRes.json();
    if (!adminPostData.success || !adminPostData.card) {
      throw new Error(`❌ SuperAdmin card generation failed: ${JSON.stringify(adminPostData)}`);
    }
    console.log(`  ✅ SuperAdmin generated card successfully on behalf of merchant! Slug: ${adminPostData.slug}`);

    // =========================================================================
    // STEP 4: Live Headless Assertion of the Generated Card (/c/[slug])
    // =========================================================================
    console.log(`\n📱 STEP 4: Loading live card at ${BASE_URL}/c/${adminPostData.slug}...`);
    await page.goto(`${BASE_URL}/c/${adminPostData.slug}`, { waitUntil: 'networkidle' });

    // Assert Real Store Name
    const storeNameEl = page.locator('h1, [data-testid="phone-store-name"], h2').filter({ hasText: 'Sharma Sweets & Cafe Vadodara' }).first();
    await storeNameEl.waitFor({ state: 'visible', timeout: 8000 });
    console.log('  ✅ Live Card displays authentic Business Display Name: "Sharma Sweets & Cafe Vadodara"');

    // Assert 3-Pill Status Bar
    const locationPill = page.locator('text=Alkapuri').first();
    await locationPill.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✅ Location pill displays: "Alkapuri"');

    // Assert Calling & WhatsApp Links
    const callButton = page.locator('a[href*="9033304707"]');
    await callButton.first().waitFor({ state: 'attached', timeout: 5000 });
    console.log('  ✅ Calling button attached with phone: "+91 90333 04707"');

    const waButton = page.locator('a[href*="919033304707"]');
    await waButton.first().waitFor({ state: 'attached', timeout: 5000 });
    console.log('  ✅ WhatsApp button attached with phone: "919033304707"');

    // Assert 3-Day Free Trial Active Banner
    const trialBanner = page.locator('text=3-Day Free Trial Active').first();
    await trialBanner.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✅ 3-Day Free Trial active countdown pill banner rendered cleanly!');

    // Capture visual snapshot
    await page.screenshot({ path: 'scripts/superadmin_generated_card_output.png', fullPage: true });
    console.log('  📸 Screenshot saved: scripts/superadmin_generated_card_output.png');

    // Cleanup: delete the test card
    const deleteRes = await fetch(`${BASE_URL}/api/admin/digital-cards?slug=${adminPostData.slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteData = await deleteRes.json();
    if (deleteData.success) {
      console.log('  🧹 Cleaned up temporary test card.');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL GROUND-TRUTH & SUPERADMIN ASSERTIONS PASSED 100%!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

runVerification().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
