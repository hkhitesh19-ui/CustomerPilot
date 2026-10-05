const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', msg => console.log('LOG:', msg.text()));

    console.log("Navigating to login with callbackUrl...");
    await page.goto('http://localhost:3000/login?callbackUrl=' + encodeURIComponent('/dashboard/settings#sec-reward-setup'));
    await page.fill('input[type="email"]', 'admin@customerpilot.in');
    await page.fill('input[type="password"]', 'Admin@CustomerPilot2026!');
    await page.click('button[type="submit"]');

    console.log("Waiting for navigation or URL change...");
    await page.waitForTimeout(4000);
    console.log("FINAL URL:", page.url());

    await page.screenshot({ path: 'final_url_proof.png' });
    await browser.close();
  } catch (err) {
    console.error("FATAL ERROR:", err);
  }
})();
