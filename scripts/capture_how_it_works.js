const { chromium } = require('playwright');
const path = require('path');
const ARTIFACTS_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  await page.goto('http://localhost:3000/smart-digital-business-card');
  await page.waitForLoadState('load');
  const howSection = page.locator('section:has-text("How Your Smart Digital Business Card Works")');
  await howSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'how_it_works_digital_card.png') });

  await page.goto('http://localhost:3000/whatsapp-digital-loyalty-card');
  await page.waitForLoadState('load');
  const loyaltySection = page.locator('section:has-text("How Our WhatsApp Loyalty Engine Works in 3 Simple Steps")');
  await loyaltySection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'how_it_works_whatsapp_loyalty.png') });

  await browser.close();
  console.log('How it works screenshots captured successfully!');
})();
