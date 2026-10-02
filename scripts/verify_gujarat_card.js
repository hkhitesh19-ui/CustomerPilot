const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/c/gujarat-photo-goods...');
  const res = await page.goto('http://localhost:3000/c/gujarat-photo-goods', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  console.log('HTTP Status:', res.status());

  await page.waitForTimeout(2000);

  // Extract visible text
  const bodyText = await page.innerText('body');

  console.log('\n--- GROUND TRUTH DATA VERIFICATION ---');
  const assertions = [
    { label: 'Store Name (Gujarat Photo Goods)', pass: bodyText.includes('Gujarat Photo Goods') },
    { label: 'Rating 4.5', pass: bodyText.includes('4.5') },
    { label: 'Reviews 406', pass: bodyText.includes('406') },
    { label: 'Closes 7:30 PM', pass: bodyText.includes('7:30 PM') },
    { label: 'Ashram Road, Ellisbridge', pass: bodyText.includes('Ashram Road') },
    { label: 'No Old 4.9 Rating', pass: !bodyText.includes('4.9') },
    { label: 'No Old 1280 Reviews', pass: !bodyText.includes('1,280') && !bodyText.includes('1280') },
    { label: 'Zero Dummy 98765 Placeholders', pass: !bodyText.includes('98765') },
  ];

  let allPassed = true;
  for (const a of assertions) {
    console.log(`${a.pass ? '✅' : '❌'} ${a.label}`);
    if (!a.pass) allPassed = false;
  }

  // Take screenshot
  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4/gujarat_photo_goods_card.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`\nScreenshot captured: ${screenshotPath}`);

  await browser.close();

  if (!allPassed) {
    console.error('\n❌ FAILED: Some ground-truth assertions did not pass!');
    process.exit(1);
  } else {
    console.log('\n✅ 100% GROUND-TRUTH VERIFIED!');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
