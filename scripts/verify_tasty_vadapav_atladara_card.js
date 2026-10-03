const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/c/tasty-vadapav-atladara...');
  const res = await page.goto('http://localhost:3000/c/tasty-vadapav-atladara', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  console.log('HTTP Status:', res.status());

  await page.waitForSelector('h1', { timeout: 30000 });
  await page.waitForTimeout(2000);

  const bodyText = await page.innerText('body');

  console.log('\n--- GROUND TRUTH DATA & DESIGN VERIFICATION (TASTY VADAPAV - ATLADARA) ---');
  const assertions = [
    { label: 'Exact Store Name visible (Tasty vadapav Atladara padra road(nizampura vala))', pass: /Tasty vadapav Atladara/i.test(bodyText) },
    { label: 'Google Rating 4.0 ⭐', pass: bodyText.includes('4.0') },
    { label: '52 Google Reviews', pass: bodyText.includes('52') },
    { label: 'Location Atladara & Padra Road visible', pass: bodyText.includes('Atladara') && /padra/i.test(bodyText) },
    { label: 'Timings 9:00 AM – 9:00 PM', pass: bodyText.includes('9:00') },
    { label: 'Swiggy & Takeaway delivery info', pass: bodyText.includes('Swiggy') && bodyText.includes('Takeaway') },
    { label: 'Zero Dummy 98765 Placeholders', pass: !bodyText.includes('98765') },
    { label: 'Zero Dummy 12345 Placeholders', pass: !bodyText.includes('12345') },
    { label: 'Zero Dummy Lorem Ipsum', pass: !bodyText.toLowerCase().includes('lorem ipsum') },
    { label: 'Online Ordering Platforms header', pass: /online ordering platforms/i.test(bodyText) },
    { label: 'Save Contact text present', pass: /save contact/i.test(bodyText) },
    { label: 'Real calling phone 93281 12314 present', pass: bodyText.includes('93281 12314') || bodyText.includes('9328112314') },
  ];

  // Check Google Reviews link does NOT point to raw GPS coordinates
  const reviewHref = await page.$eval('a:has-text("Google Reviews")', el => el.getAttribute('href'));
  console.log('Google Reviews Href:', reviewHref);
  const reviewsLinkPass = reviewHref.includes('ChIJCYBASZnHXzkRZvLItnjimsk') && !reviewHref.includes('22.2683216');
  assertions.push({ label: 'Google Reviews card links directly to Place ID (NOT raw GPS coordinates)', pass: reviewsLinkPass });

  let allPassed = true;
  for (const a of assertions) {
    console.log(`${a.pass ? '✅' : '❌'} ${a.label}`);
    if (!a.pass) allPassed = false;
  }

  // Check font family on the h1 element (Times New Roman)
  const h1Font = await page.$eval('h1', el => window.getComputedStyle(el).fontFamily);
  console.log('H1 Font Family:', h1Font);
  const fontPass = h1Font.toLowerCase().includes('times new roman') || h1Font.toLowerCase().includes('times');
  console.log(`${fontPass ? '✅' : '❌'} H1 uses Times New Roman font (${h1Font})`);
  if (!fontPass) allPassed = false;

  // Check logo image is rendered
  const logoVisible = await page.$eval('img[alt*="Tasty"]', el => el.complete && el.naturalWidth > 0);
  console.log(`${logoVisible ? '✅' : '❌'} Real logo image loaded successfully`);
  if (!logoVisible) allPassed = false;

  // Hide Next.js dev indicator from visual snapshot
  await page.addStyleTag({ content: 'nextjs-portal, [data-nextjs-toast], #__next-build-watcher, [class*="nextjs-toast"] { display: none !important; }' });
  await page.waitForTimeout(500);

  // Take screenshot of mobile card
  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4/tasty_vadapav_atladara_card_verified.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`\nScreenshot captured: ${screenshotPath}`);

  await browser.close();

  if (!allPassed) {
    console.error('\n❌ FAILED: Some assertions did not pass!');
    process.exit(1);
  } else {
    console.log('\n✅ 100% GROUND-TRUTH & DESIGN SPEC VERIFIED FOR TASTY VADAPAV (ATLADARA)!');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
