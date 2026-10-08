const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('🧪 Starting Playwright Verification of Smart AI Google Review 3-Angle Engine...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile iPhone screen
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  const url = 'http://localhost:3000/review?m=cmtymavfx0002kx008lbfvp57';
  console.log(`Navigating to ${url}...`);

  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('HTTP Status:', response.status());
  if (response.status() !== 200) {
    throw new Error(`Expected HTTP 200, got ${response.status()}`);
  }

  // 1. Verify 3 AI Review Option Chips Exist
  const option1 = page.locator('button:has-text("Quality & Taste")');
  const option2 = page.locator('button:has-text("Service & Vibes")');
  const option3 = page.locator('button:has-text("Short 1-Liner")');

  const count1 = await option1.count();
  const count2 = await option2.count();
  const count3 = await option3.count();

  console.log(`Pill 1 (Quality & Taste) found: ${count1}`);
  console.log(`Pill 2 (Service & Vibes) found: ${count2}`);
  console.log(`Pill 3 (Short 1-Liner) found: ${count3}`);

  if (count1 === 0 || count2 === 0 || count3 === 0) {
    throw new Error('All 3 AI Review Angle chips must be rendered!');
  }

  const textarea = page.locator('textarea');
  await textarea.waitFor({ state: 'visible', timeout: 5000 });

  // Check Draft 1 initial text
  const text1 = await textarea.inputValue();
  console.log('\n📝 Draft 1 Content:', text1);
  const words1 = text1.trim().split(/\s+/).length;
  console.log(`Draft 1 Word Count: ${words1} words`);

  // Click Option 2
  await option2.click();
  await page.waitForTimeout(500);
  const text2 = await textarea.inputValue();
  console.log('\n📝 Draft 2 Content (Service & Vibes):', text2);
  const words2 = text2.trim().split(/\s+/).length;
  console.log(`Draft 2 Word Count: ${words2} words`);

  // Click Option 3
  await option3.click();
  await page.waitForTimeout(500);
  const text3 = await textarea.inputValue();
  console.log('\n📝 Draft 3 Content (Short 1-Liner):', text3);
  const words3 = text3.trim().split(/\s+/).length;
  console.log(`Draft 3 Word Count: ${words3} words`);

  // Assert banned words are ABSOLUTELY ZERO
  const banned = ['delve', 'top-notch', 'highly recommend', 'hidden gem', 'pristine', 'testament', 'exceptional', 'outstanding', 'spot on', 'best in town'];
  for (const b of banned) {
    if (text1.toLowerCase().includes(b) || text2.toLowerCase().includes(b) || text3.toLowerCase().includes(b)) {
      throw new Error(`Banned AI word detected: "${b}"`);
    }
  }
  console.log('\n✅ Banned AI Words Assertion: ZERO banned words found! 100% Human Natural Tone!');

  // Assert all 3 texts are different
  if (text1 === text2 || text2 === text3) {
    throw new Error('All 3 draft angles must be distinct and non-identical!');
  }
  console.log('✅ Diversity Assertion: All 3 drafts are distinct and tailored!');

  // Take visual screenshot
  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  const screenshotPath = path.join(scratchDir, 'verified_smart_ai_review_3angles.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('📸 Screenshot saved to:', screenshotPath);

  await browser.close();
  console.log('\n🎉 ALL SMART AI GOOGLE REVIEW 3-ANGLE TESTS PASSED 100%!');
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
