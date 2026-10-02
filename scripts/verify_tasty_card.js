const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/c/tasty-vadapav...');
  const res = await page.goto('http://localhost:3000/c/tasty-vadapav', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  console.log('HTTP Status:', res.status());

  await page.waitForSelector('h1', { timeout: 30000 });
  await page.waitForTimeout(2000);

  const bodyText = await page.innerText('body');

  console.log('\n--- GROUND TRUTH DATA & DESIGN VERIFICATION (TASTY VADAPAV) ---');
  const assertions = [
    { label: 'Store Name (Tasty Vadapav)', pass: /Tasty Vadapav/i.test(bodyText) },
    { label: 'Rating 4.4', pass: bodyText.includes('4.4') },
    { label: 'Location Nizampura, Vadodara', pass: bodyText.includes('Nizampura') },
    { label: 'Timings 9:00 AM – 9:00 PM', pass: bodyText.includes('9:00 PM') },
    { label: 'Delivery Zomato & Swiggy', pass: bodyText.includes('Zomato') && bodyText.includes('Swiggy') },
    { label: 'Zero Dummy 98765 Placeholders', pass: !bodyText.includes('98765') },
    { label: 'Online Ordering Platforms header', pass: /online ordering platforms/i.test(bodyText) },
    { label: 'Save Contact text present', pass: /save contact/i.test(bodyText) },
    { label: 'Real phone 99746 20201 present', pass: bodyText.includes('99746 20201') || bodyText.includes('9974620201') },
  ];

  let allPassed = true;
  for (const a of assertions) {
    console.log(`${a.pass ? '✅' : '❌'} ${a.label}`);
    if (!a.pass) allPassed = false;
  }

  // Check font family on the h1 element
  const h1Font = await page.$eval('h1', el => window.getComputedStyle(el).fontFamily);
  console.log('H1 Font Family:', h1Font);
  const fontPass = h1Font.toLowerCase().includes('times new roman') || h1Font.toLowerCase().includes('times');
  console.log(`${fontPass ? '✅' : '❌'} H1 uses Times New Roman font (${h1Font})`);
  if (!fontPass) allPassed = false;

  // Check logo image is rendered
  const logoVisible = await page.$eval('img[alt="Tasty Vadapav"]', el => el.complete && el.naturalWidth > 0);
  console.log(`${logoVisible ? '✅' : '❌'} Real logo image loaded successfully`);
  if (!logoVisible) allPassed = false;

  // Hide Next.js dev indicator from visual snapshot
  await page.addStyleTag({ content: 'nextjs-portal, [data-nextjs-toast], #__next-build-watcher, [class*="nextjs-toast"] { display: none !important; }' });
  await page.waitForTimeout(500);

  // Take screenshot of mobile card
  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4/tasty_vadapav_card_verified.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`\nScreenshot captured: ${screenshotPath}`);

  await browser.close();

  if (!allPassed) {
    console.error('\n❌ FAILED: Some assertions did not pass!');
    process.exit(1);
  } else {
    console.log('\n✅ 100% GROUND-TRUTH & DESIGN SPEC VERIFIED FOR TASTY VADAPAV!');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
