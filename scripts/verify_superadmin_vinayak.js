const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  console.log("Logging in as admin@customerpilot.in...");
  await page.goto('https://customerpilot.in/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@customerpilot.in');
  await page.fill('input[type="password"]', 'Admin@CustomerPilot2026!');
  await page.click('button:has-text("Login to Dashboard")');
  
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  
  if (!page.url().includes('/super-admin')) {
    await page.goto('https://customerpilot.in/super-admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
  }
  
  // Click on "Merchants Fleet"
  console.log("Clicking on 'Merchants Fleet' tab...");
  await page.click('button:has-text("Merchants Fleet")');
  await page.waitForTimeout(3000);
  
  // Search for "Vinayak"
  const searchInput = await page.$('input[placeholder*="Search by merchant"]');
  if (searchInput) {
    await searchInput.fill("Vinayak");
    await page.waitForTimeout(1000);
  }
  
  const content = await page.content();
  console.log("Has 'Vinayak Fashion'?:", content.includes("Vinayak Fashion"));
  console.log("Has '5.0'?:", content.includes("5.0"));
  console.log("Has '(1 reviews)'?:", content.includes("(1 reviews)") || content.includes("1 reviews"));
  
  const screenshotPath = 'scratch/verified_superadmin_vinayak_fleet_table.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot to ${screenshotPath}`);
  
  await browser.close();
})();
