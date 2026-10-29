const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
  });
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  console.log("Navigating to https://customerpilot.in/q/wallet/cmvavfgdj0pekkvtmrdtlioc4...");
  const resp = await page.goto('https://customerpilot.in/q/wallet/cmvavfgdj0pekkvtmrdtlioc4', { waitUntil: 'load', timeout: 30000 });
  console.log("Response status:", resp.status());
  
  await page.waitForTimeout(3000);
  
  const screenshotPath = 'scratch/verified_ishanvi_vinayak_wallet.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved to ${screenshotPath}`);
  
  const content = await page.content();
  console.log("Has Vinayak in HTML?:", content.includes("Vinayak"));
  console.log("Has Ishanvi in HTML?:", content.includes("Ishanvi"));
  
  await browser.close();
})();
