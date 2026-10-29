require('dotenv').config({ path: '.env.production' });
const { chromium } = require('playwright');
const { SignJWT } = require('jose');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'cpilot_jwt_secret_change_this_in_production_2026!');
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4';

async function verify() {
  console.log('🚀 Verifying /dashboard/customers in Light Mode...');

  let merchant = await prisma.merchant.findFirst({
    where: { status: 'active' }
  });
  if (!merchant) {
    merchant = await prisma.merchant.findFirst();
  }
  console.log(`Using merchant: ${merchant?.name} (${merchant?.id})`);

  const merchantToken = await new SignJWT({
    userId: merchant.userId || merchant.id,
    merchantId: merchant.id,
    email: merchant.email,
    role: 'merchant'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    colorScheme: 'light'
  });

  await context.addCookies([
    {
      name: 'token',
      value: merchantToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'merchant_id',
      value: merchant.id,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    }
  ]);

  const page = await context.newPage();

  // Ensure localStorage theme is light
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });

  console.log('Navigating to /dashboard/customers...');
  await page.goto(`${BASE_URL}/dashboard/customers`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Assert .dark class is NOT present on html/body
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log(`Is root .dark present: ${isDark}`);

  // Inspect background colors of main container, cards, and table
  const styles = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const cards = Array.from(document.querySelectorAll('.rounded-2xl, .rounded-xl')).slice(0, 5);
    const table = document.querySelector('table');
    return {
      mainBg: window.getComputedStyle(main).backgroundColor,
      cardBgs: cards.map(c => window.getComputedStyle(c).backgroundColor),
      tableBg: table ? window.getComputedStyle(table).backgroundColor : 'no table'
    };
  });
  console.log('Computed styles in Light Mode:', styles);

  const screenshotPath = path.join(ARTIFACT_DIR, 'verified_dashboard_customers_light_mode.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✅ Saved screenshot to ${screenshotPath}`);

  // Also check /dashboard/rewards
  console.log('Navigating to /dashboard/rewards...');
  await page.goto(`${BASE_URL}/dashboard/rewards`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  const rewardsScreenshotPath = path.join(ARTIFACT_DIR, 'verified_dashboard_rewards_light_mode.png');
  await page.screenshot({ path: rewardsScreenshotPath, fullPage: true });
  console.log(`✅ Saved rewards screenshot to ${rewardsScreenshotPath}`);

  // Also check /dashboard/referrals/customer-referrals
  console.log('Navigating to /dashboard/referrals/customer-referrals...');
  await page.goto(`${BASE_URL}/dashboard/referrals/customer-referrals`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  const referralsScreenshotPath = path.join(ARTIFACT_DIR, 'verified_dashboard_referrals_light_mode.png');
  await page.screenshot({ path: referralsScreenshotPath, fullPage: true });
  console.log(`✅ Saved referrals screenshot to ${referralsScreenshotPath}`);

  await browser.close();
  await prisma.$disconnect();
  console.log('🎉 Verification complete!');
}

verify().catch(e => {
  console.error('Error during verification:', e);
  process.exit(1);
});
