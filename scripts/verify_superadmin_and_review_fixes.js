const { chromium } = require('playwright');
const { SignJWT } = require('jose');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const assert = require('assert');

dotenv.config();
const prisma = new PrismaClient();

(async () => {
  console.log('=== STARTING TRIPLE-ENGINE PLAYWRIGHT VERIFICATION ===');
  const JWT_SECRET = process.env.JWT_SECRET || 'cpilot_jwt_secret_change_this_in_production_2026!';
  const token = await new SignJWT({
    userId: 'cmssr7v8i0000kxsv6obva334',
    email: 'admin@customerpilot.in',
    role: 'super_admin',
    merchantId: 'admin_merchant',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(new TextEncoder().encode(JWT_SECRET));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([
    {
      name: 'token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    }
  ]);

  // ─────────────────────────────────────────────────────────────
  // TEST 1: SuperAdmin Default Settings Persistence
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- TEST 1: SuperAdmin Default Settings Persistence ---');
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:3000/super-admin?tab=default-settings', { waitUntil: 'domcontentloaded' });
  await adminPage.waitForSelector('#global-card-name', { timeout: 30000 });

  const testTitle = 'Grand Master Gold Club ' + Date.now().toString().slice(-4);
  const testReward = 'Free Deluxe Truffle Cake';
  console.log(`Setting Card Title to: "${testTitle}", Reward to: "${testReward}"`);

  await adminPage.fill('#global-card-name', testTitle);
  await adminPage.fill('#global-reward-name', testReward);
  await adminPage.fill('#global-stamp-val', '450');
  await adminPage.fill('#global-stamps-req', '9');

  // Click Save Global Defaults
  const saveBtn = adminPage.getByRole('button', { name: 'Save Global Defaults' }).first();
  await saveBtn.click();
  await adminPage.waitForTimeout(2500);

  // Reload page and check that values PERSIST
  console.log('Reloading /super-admin?tab=default-settings to verify persistence...');
  await adminPage.goto('http://localhost:3000/super-admin?tab=default-settings', { waitUntil: 'domcontentloaded' });
  await adminPage.waitForSelector('#global-card-name', { timeout: 30000 });

  const persistedTitle = await adminPage.inputValue('#global-card-name');
  const persistedReward = await adminPage.inputValue('#global-reward-name');
  const persistedStampVal = await adminPage.inputValue('#global-stamp-val');
  const persistedStampsReq = await adminPage.inputValue('#global-stamps-req');

  console.log(`Loaded after reload -> Card Name: "${persistedTitle}", Reward: "${persistedReward}", StampVal: ${persistedStampVal}, StampsReq: ${persistedStampsReq}`);
  assert.strictEqual(persistedTitle, testTitle, 'Card Name must persist across page reload!');
  assert.strictEqual(persistedReward, testReward, 'Reward Name must persist across page reload!');
  assert.strictEqual(persistedStampVal, '450', 'Stamp Value must persist across page reload!');
  assert.strictEqual(persistedStampsReq, '9', 'Stamps Required must persist across page reload!');
  console.log('✅ PASS: SuperAdmin Settings Persistence successfully verified!');

  // Click "Apply to All Merchants"
  console.log('\nClicking "Apply to All Merchants"...');
  const applyBtn = adminPage.getByRole('button', { name: 'Apply to All Merchants' }).first();
  await applyBtn.click();
  await adminPage.waitForTimeout(2500);

  // Verify DB active stamp cards have updated
  const activeCards = await prisma.stampCard.findMany({ where: { active: true } });
  console.log(`Found ${activeCards.length} active stamp cards in DB.`);
  const sampleCard = activeCards[0];
  console.log(`Sample card in DB: name="${sampleCard?.name}", rewardName="${sampleCard?.rewardName}", stampsReq=${sampleCard?.stampsRequired}`);
  assert.strictEqual(sampleCard?.name, testTitle, 'Active stamp card name must match applied default!');
  assert.strictEqual(sampleCard?.rewardName, testReward, 'Active stamp card reward must match applied default!');
  console.log('✅ PASS: "Apply to All Merchants" verified in database!');

  await adminPage.screenshot({ path: 'scratch/superadmin_saved_verified.png' });
  await adminPage.close();

  // ─────────────────────────────────────────────────────────────
  // TEST 2: Smart AI Google Review Screen Elements Verification
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- TEST 2: Smart AI Google Review Screen Verification ---');
  const reviewPage = await context.newPage();
  await reviewPage.goto('http://localhost:3000/review?m=cmtymavfx0002kx008lbfvp57', { waitUntil: 'domcontentloaded' });
  await reviewPage.waitForSelector('textarea#google-review-textarea', { timeout: 15000 });

  const pageContent = await reviewPage.content();

  // 1. Assert Photo Bonus Hint Card is REMOVED
  const hasPhotoBonusCard = pageContent.includes('Want +') && pageContent.includes('Extra Photo Bonus Stamps');
  console.log('Photo bonus hint card present:', hasPhotoBonusCard);
  assert.strictEqual(hasPhotoBonusCard, false, 'Photo bonus hint card must be completely REMOVED!');

  // 2. Assert simulated profile and sub-scores are REMOVED
  const hasHiteshProfile = pageContent.includes('Hitesh Kumar');
  const hasPublicPosting = pageContent.includes('Posting publicly across Google');
  const hasExceptional = pageContent.includes('Exceptional');
  const hasFoodQuality = pageContent.includes('Food / Quality');
  const hasAtmosphere = pageContent.includes('Atmosphere');

  console.log('Profile "Hitesh Kumar" present:', hasHiteshProfile);
  console.log('Public posting text present:', hasPublicPosting);
  console.log('Exceptional text present:', hasExceptional);
  console.log('Food/Quality subscore present:', hasFoodQuality);
  console.log('Atmosphere subscore present:', hasAtmosphere);

  assert.strictEqual(hasHiteshProfile, false, '"Hitesh Kumar" profile header must be removed!');
  assert.strictEqual(hasPublicPosting, false, '"Posting publicly across Google" must be removed!');
  assert.strictEqual(hasExceptional, false, '"Exceptional" rating text must be removed!');
  assert.strictEqual(hasFoodQuality, false, '"Food / Quality" subscore must be removed!');
  assert.strictEqual(hasAtmosphere, false, '"Atmosphere" subscore must be removed!');

  // 3. Assert necessary elements ARE present
  const hasTextarea = await reviewPage.locator('textarea#google-review-textarea').isVisible();
  const hasCopyPostBtn = await reviewPage.getByRole('button', { name: /Copy & Post on Google Maps/i }).isVisible();
  const hasDualAngles = await reviewPage.getByText(/Option 1: Product & Taste/i).isVisible();

  console.log('Review Textarea visible:', hasTextarea);
  console.log('Copy & Post CTA visible:', hasCopyPostBtn);
  console.log('Dual AI Angles visible:', hasDualAngles);

  assert.strictEqual(hasTextarea, true, 'Review textarea must be visible!');
  assert.strictEqual(hasCopyPostBtn, true, 'Copy & Post CTA must be visible!');
  assert.strictEqual(hasDualAngles, true, 'Dual AI Angle chips must be visible!');

  await reviewPage.screenshot({ path: 'scratch/clean_google_review_verified.png' });
  console.log('Screenshot captured to scratch/clean_google_review_verified.png');
  console.log('✅ PASS: Smart AI Google Review screen verified with 100% precision!');

  await reviewPage.close();
  await browser.close();
  await prisma.$disconnect();

  console.log('\n=== ALL PLAYWRIGHT GROUND-TRUTH TESTS PASSED (100%) ===\n');
})();
