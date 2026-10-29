require('dotenv').config();
const { chromium } = require('playwright');
const { SignJWT } = require('jose');

const JWT_SECRET = process.env.JWT_SECRET || 'cpilot_jwt_secret_change_this_in_production_2026!';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });

  // 1. Create SuperAdmin JWT token
  const adminToken = await new SignJWT({
    userId: 'admin_test_1',
    email: 'admin@customerpilot.in',
    role: 'super_admin'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(JWT_SECRET));

  // 2. Add cookie to browser context
  await context.addCookies([{
    name: 'token',
    value: adminToken,
    domain: 'localhost',
    path: '/'
  }]);

  const page = await context.newPage();

  console.log('Navigating to SuperAdmin Default Settings tab...');
  await page.goto('http://localhost:3000/super-admin?tab=default-settings', { waitUntil: 'domcontentloaded' });

  // 3. Verify left sidebar navigation item exists
  const navLink = page.locator('button:has-text("Default Merchant Settings")').first();
  await navLink.waitFor({ state: 'visible', timeout: 15000 });
  console.log('✅ Left Sidebar Link "Default Merchant Settings" is visible!');
  await navLink.click();
  console.log('Clicked "Default Merchant Settings" in left sidebar!');

  // 4. Verify Header
  const header = page.locator('text=Default Merchant Settings & Reward Rules').first();
  await header.waitFor({ state: 'visible', timeout: 15000 });
  console.log('✅ Header: "Default Merchant Settings & Reward Rules" verified!');

  // 5. Verify Step A
  await page.waitForSelector('text=Stamps Reward Card Rules Setup');
  console.log('✅ Step A: Stamps Reward Card Rules Setup verified!');

  // 6. Verify Step B
  await page.waitForSelector('text=Default Loyalty Cycle Categories (10 Levels)');
  console.log('✅ Step B: Default Loyalty Cycle Categories (10 Levels) verified!');

  // 7. Verify Step C
  await page.waitForSelector('text=Default System Automation & Nudge Rules');
  console.log('✅ Step C: Default System Automation & Nudge Rules verified!');

  // 8. Verify Form Inputs
  const cardNameInput = page.locator('#global-card-name');
  const cardName = await cardNameInput.inputValue();
  console.log('  Default Card Title:', cardName);

  const stampsReqInput = page.locator('#global-stamps-req');
  console.log('  Default Stamps Required:', await stampsReqInput.inputValue());

  // 9. Click "Save Global Defaults"
  const saveBtn = page.locator('button:has-text("Save Global Defaults")').first();
  await saveBtn.click();
  console.log('Clicked "Save Global Defaults"');

  // 10. Verify Toast
  await page.waitForSelector('text=Saved Successfully!', { timeout: 10000 });
  console.log('✅ Toast "Saved Successfully!" displayed!');

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'superadmin_default_merchant_settings_verified.png' });
  console.log('📸 Saved screenshot: superadmin_default_merchant_settings_verified.png');

  await browser.close();
  console.log('🎉 SuperAdmin Default Merchant Settings Test 100% PASSED!');
})().catch(err => {
  console.error('Error in SuperAdmin verification:', err);
  process.exit(1);
});
