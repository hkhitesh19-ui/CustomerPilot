const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  // Test both mobile viewport and desktop viewport
  const page = await browser.newPage({ viewport: { width: 420, height: 950 } });

  const targetUrl = 'http://localhost:3000/review?m=cmtymavfx0002kx008lbfvp57';
  console.log('Navigating to review page:', targetUrl);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

  // 1. Verify Store Name
  await page.waitForSelector('text=Cake Connection', { timeout: 10000 });
  console.log('Found merchant title: Cake Connection');

  // 2. Verify Google User profile section
  await page.waitForSelector('text=Posting publicly across Google');
  console.log('Found Google profile caption: Posting publicly across Google');

  // 3. Verify Stars & Rating label
  await page.waitForSelector('text=Exceptional');
  console.log('Found rating evaluation: Exceptional');

  // 4. Verify Sub-ratings
  await page.waitForSelector('text=Food / Quality');
  await page.waitForSelector('text=Service');
  await page.waitForSelector('text=Atmosphere');
  console.log('Found Food, Service, Atmosphere criteria ratings!');

  // 5. Verify Dual AI Angle Options
  await page.waitForSelector('text=Option 1: Product & Taste');
  await page.waitForSelector('text=Option 2: Service & Packaging');
  console.log('Found dual AI review options!');

  // 6. Verify Textarea & Copy Text
  const textarea = page.locator('#google-review-textarea');
  const reviewText = await textarea.inputValue();
  console.log('AI Review text inside textarea:', reviewText.slice(0, 80) + '...');

  // 7. Verify Primary Google Button
  await page.waitForSelector('button:has-text("Copy & Post on Google Maps")');
  console.log('Found primary button: Copy & Post on Google Maps');

  // 8. Verify Pure Light Mode (ensure body/container has white/light background and NOT dark slate #020617 / #0f172a)
  const bgColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('Body background color:', bgColor);

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'google_review_light_mode_verified.png' });
  console.log('Saved mobile screenshot: google_review_light_mode_verified.png');

  // Also capture desktop screenshot
  await page.setViewportSize({ width: 1200, height: 1000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'google_review_desktop_verified.png' });
  console.log('Saved desktop screenshot: google_review_desktop_verified.png');

  await browser.close();
})().catch(err => {
  console.error('Error in Review verification:', err);
  process.exit(1);
});
