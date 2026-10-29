const { chromium } = require('playwright');
const { SignJWT } = require('jose');
const dotenv = require('dotenv');
const assert = require('assert');

dotenv.config();

(async () => {
  console.log('=== VERIFYING UNIVERSAL SETTINGS IN SUPERADMIN & MERCHANT DASHBOARD ===');
  const JWT_SECRET = process.env.JWT_SECRET || 'cpilot_jwt_secret_change_this_in_production_2026!';
  
  // SuperAdmin Token
  const adminToken = await new SignJWT({
    userId: 'cmssr7v8i0000kxsv6obva334',
    email: 'admin@customerpilot.in',
    role: 'super_admin',
    merchantId: 'admin_merchant',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(new TextEncoder().encode(JWT_SECRET));

  // Merchant Token (Cake Connection)
  const merchantToken = await new SignJWT({
    userId: 'cmtymavfq0000kx009x36jn4l',
    email: 'order.cakeconnection@gmail.com',
    role: 'merchant',
    merchantId: 'cmtymavfx0002kx008lbfvp57',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(new TextEncoder().encode(JWT_SECRET));

  const browser = await chromium.launch({ headless: true });

  // ─────────────────────────────────────────────────────────────
  // PART 1: SuperAdmin Default Settings Manager Check
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PART 1: SuperAdmin Default Settings Manager Check ---');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await adminContext.addCookies([
    {
      name: 'token',
      value: adminToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    }
  ]);
  const adminPage = await adminContext.newPage();
  await adminPage.goto('http://localhost:3000/super-admin?tab=default-settings', { waitUntil: 'domcontentloaded' });
  await adminPage.waitForSelector('#global-card-name', { timeout: 30000 });

  const cardName = await adminPage.inputValue('#global-card-name');
  const rewardName = await adminPage.inputValue('#global-reward-name');
  const stampVal = await adminPage.inputValue('#global-stamp-val');
  const stampsReq = await adminPage.inputValue('#global-stamps-req');
  const validityDays = await adminPage.inputValue('#global-validity');

  console.log(`SuperAdmin Fields:
  - Card Name: "${cardName}"
  - Reward Name: "${rewardName}"
  - Stamp Value: ₹${stampVal}
  - Stamps Required: ${stampsReq}
  - Validity Days: ${validityDays}
  `);

  assert.strictEqual(stampVal, '300', 'Stamp Value must be 300');
  assert.strictEqual(stampsReq, '10', 'Stamps Required must be 10');
  assert.strictEqual(validityDays, '180', 'Validity Days must be 180');
  assert.strictEqual(rewardName, '1 Free Cake', 'Reward Name must be 1 Free Cake');

  // Check Joining Bonus status text
  const joiningText = await adminPage.locator('text=ACTIVE (+1 Stamps on Join)').isVisible();
  console.log('Joining Bonus (+1 Stamps on Join) badge visible:', joiningText);
  assert.strictEqual(joiningText, true, 'Badge must say ACTIVE (+1 Stamps on Join)');

  // Helper text checks
  const helper300 = await adminPage.locator('text=Every ₹300 = 1 Stamp').isVisible();
  console.log('Helper "Every ₹300 = 1 Stamp" visible:', helper300);
  assert.strictEqual(helper300, true, 'Helper text for ₹300 must be visible');

  await adminPage.screenshot({ path: 'scratch/superadmin_universal_settings_verified.png' });
  console.log('Screenshot saved to scratch/superadmin_universal_settings_verified.png');
  await adminPage.close();
  await adminContext.close();

  // ─────────────────────────────────────────────────────────────
  // PART 2: Merchant Dashboard Reward Setup Check
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- PART 2: Merchant Dashboard Reward Setup Check ---');
  const merchantContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await merchantContext.addCookies([
    {
      name: 'token',
      value: merchantToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    }
  ]);
  const merchantPage = await merchantContext.newPage();
  merchantPage.on('console', msg => console.log('PAGE LOG:', msg.text()));
  merchantPage.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000/dashboard/settings#sec-reward-setup ...');
  await merchantPage.goto('http://localhost:3000/dashboard/settings#sec-reward-setup', { waitUntil: 'domcontentloaded' });
  console.log('Current URL:', merchantPage.url());

  try {
    await merchantPage.waitForSelector('#reward-name', { timeout: 30000 });
  } catch (err) {
    console.log('Timed out waiting for #reward-name. Current URL:', merchantPage.url());
    await merchantPage.screenshot({ path: 'scratch/merchant_dashboard_timeout.png' });
    throw err;
  }

  const mReward = await merchantPage.inputValue('#reward-name');
  const mStampsReq = await merchantPage.inputValue('#stamps-req');
  const mStampVal = await merchantPage.inputValue('#stamp-val');
  const mValidity = await merchantPage.inputValue('#validity');

  console.log(`Merchant Dashboard Fields:
  - Reward Name: "${mReward}"
  - Stamps Required: ${mStampsReq}
  - Stamp Value: ₹${mStampVal}
  - Validity Days: ${mValidity}
  `);

  assert.strictEqual(mReward, '1 Free Cake', 'Merchant reward must be 1 Free Cake');
  assert.strictEqual(mStampsReq, '10', 'Merchant stamps required must be 10');
  assert.strictEqual(mStampVal, '300', 'Merchant stamp value must be 300');
  assert.strictEqual(mValidity, '180', 'Merchant validity must be 180');

  const rewardSection = merchantPage.locator('#sec-reward-setup');
  await rewardSection.scrollIntoViewIfNeeded();
  await merchantPage.waitForTimeout(1000);
  await rewardSection.screenshot({ path: 'scratch/merchant_reward_setup_universal_verified.png' });
  console.log('Screenshot saved to scratch/merchant_reward_setup_universal_verified.png');
  await merchantPage.close();
  await merchantContext.close();

  await browser.close();
  console.log('\n=== ALL PLAYWRIGHT ASSERTIONS PASSED (100%) ===\n');
})();
