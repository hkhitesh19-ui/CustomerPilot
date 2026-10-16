const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log("=== Starting Playwright Ground-Truth Test for WhatsApp QR Code ===");
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  const timestamp = Date.now();
  const testEmail = `test_qr_${timestamp}@example.com`;
  const testPhone = `9825${Math.floor(100000 + Math.random() * 900000)}`;

  console.log(`Navigating to https://customerpilot.in/signup...`);
  await page.goto('https://customerpilot.in/signup', { waitUntil: 'networkidle' });

  console.log("Filling signup form with exact placeholders...");
  await page.fill('input[placeholder="e.g. Cake Connection"]', `Test Store QR ${timestamp}`);
  await page.fill('input[placeholder="e.g. Hitesh"]', `Test Owner`);
  await page.fill('input[placeholder="e.g. 919876543210"]', testPhone);
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', `Test@${timestamp}`);

  console.log("Submitting signup form...");
  const submitBtn = await page.locator('button[type="submit"]');
  await submitBtn.click();

  console.log("Waiting for navigation to /onboarding...");
  await page.waitForURL(/.*\/onboarding.*/, { timeout: 30000 });
  console.log("Current URL:", page.url());

  // Wait for onboarding page to load
  await page.waitForSelector('text=CustomerPilot Setup', { timeout: 20000 });
  console.log("Onboarding page loaded successfully.");

  // Check current step. If step 1 (business_info), click 'Next Step' or 'Continue'
  const nextBtn = page.locator('button:has-text("Next Step"), button:has-text("Save & Continue"), button:has-text("Continue")');
  if (await nextBtn.isVisible()) {
    console.log("Clicking Next to advance to Step 2 (WhatsApp)...");
    await nextBtn.first().click();
  }

  // Wait for WhatsApp step
  console.log("Waiting for 'Connect Store WhatsApp' step...");
  await page.waitForSelector('text=Connect Store WhatsApp', { timeout: 20000 });

  // Wait for QR code image to render
  console.log("Waiting for WhatsApp QR code image to appear...");
  const qrImage = page.locator('img[alt="WhatsApp Pair QR Code"]');
  await qrImage.waitFor({ state: 'visible', timeout: 35000 });

  const qrSrc = await qrImage.getAttribute('src');
  console.log("QR Code src found! Prefix:", qrSrc ? qrSrc.slice(0, 50) : "null");
  console.log("QR Code src length:", qrSrc ? qrSrc.length : 0);

  if (!qrSrc || !qrSrc.startsWith("data:image/png;base64,") || qrSrc.length < 500) {
    throw new Error(`Invalid QR code src: ${qrSrc}`);
  }

  console.log("✅ QR Code successfully rendered with valid base64 data!");

  // Capture screenshot of the QR code screen
  const screenshotPath = path.join(__dirname, '..', 'scratch', 'verified_whatsapp_qr_code_onboarding.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("Visual snapshot saved to:", screenshotPath);

  // Also copy to artifacts directory for user presentation
  const artifactDir = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4";
  const artifactScreenshot = path.join(artifactDir, "verified_whatsapp_qr_code_onboarding.png");
  try {
    fs.copyFileSync(screenshotPath, artifactScreenshot);
    console.log("Artifact snapshot copied to:", artifactScreenshot);
  } catch (e) {
    console.log("Could not copy to artifact dir:", e.message);
  }

  await browser.close();
  console.log("=== Playwright Test Passed Successfully ===");
}

main().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
