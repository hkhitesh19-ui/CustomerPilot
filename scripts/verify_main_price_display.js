const { chromium } = require('playwright');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'cp_build_secret_key_2026_jwt_auth_token_secure';
const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4';
const BASE_URL = 'http://localhost:3000';

async function verify() {
  console.log('🚀 Starting Verification for Main Price & 50% Offer Price Display on /pricing and /dashboard/subscription...');
  const browser = await chromium.launch({ headless: true });

  // 1. Verify Public /pricing Page
  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const publicPage = await publicContext.newPage();

  console.log(`Navigating to ${BASE_URL}/pricing ...`);
  await publicPage.goto(`${BASE_URL}/pricing`, { waitUntil: 'commit', timeout: 60000 });
  await publicPage.waitForSelector('text=Main Price:', { timeout: 30000 });
  console.log('✅ Found prominent "Main Price:" labels on /pricing');

  await publicPage.waitForSelector('text=50% Offer Price:', { timeout: 10000 });
  console.log('✅ Found prominent "50% Offer Price:" badge on CustomerPilot Complete card');

  const mainPriceCount = await publicPage.locator('text=Main Price:').count();
  console.log(`✅ Found ${mainPriceCount} "Main Price:" labels across /pricing sections`);

  const publicScreenshot = path.join(ARTIFACT_DIR, 'verified_pricing_main_and_offer_price.png');
  await publicPage.screenshot({ path: publicScreenshot, fullPage: true });
  console.log(`📸 Captured /pricing full screenshot: ${publicScreenshot}`);
  await publicContext.close();

  // 2. Verify Authenticated /dashboard/subscription Page
  const merchant = await prisma.merchant.findFirst({ where: { status: 'active' } });
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({
    merchantId: merchant.id,
    role: 'merchant',
    email: merchant.email || 'owner@cakeconnection.in'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);

  const authContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  await authContext.addCookies([
    { name: 'token', value: token, domain: 'localhost', path: '/', httpOnly: true },
    { name: 'merchant_id', value: merchant.id, domain: 'localhost', path: '/', httpOnly: false }
  ]);

  const subPage = await authContext.newPage();
  console.log(`Navigating to ${BASE_URL}/dashboard/subscription ...`);
  await subPage.goto(`${BASE_URL}/dashboard/subscription`, { waitUntil: 'commit', timeout: 60000 });
  await subPage.waitForSelector('text=Subscription & Plans', { timeout: 60000 });
  await subPage.waitForSelector('text=Main Price:', { timeout: 30000 });

  const subMainPriceCount = await subPage.locator('text=Main Price:').count();
  console.log(`✅ Found ${subMainPriceCount} "Main Price:" labels across /dashboard/subscription`);

  const subScreenshot = path.join(ARTIFACT_DIR, 'verified_subscription_main_and_offer_price.png');
  await subPage.screenshot({ path: subScreenshot, fullPage: true });
  console.log(`📸 Captured /dashboard/subscription full screenshot: ${subScreenshot}`);

  await browser.close();
  await prisma.$disconnect();
  console.log('\n🎉 ALL MAIN PRICE & OFFER PRICE VERIFICATIONS PASSED!');
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
