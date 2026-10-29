const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  
  console.log('Navigating to login with callbackUrl...');
  await page.goto('http://localhost:3000/login?callbackUrl=%2Fdashboard%2Fsettings%23sec-reward-setup');
  await page.fill('input[type="email"]', 'admin@customerpilot.in');
  await page.fill('input[type="password"]', 'Admin@CustomerPilot2026!');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard/settings#sec-reward-setup', { timeout: 15000 });
  console.log('Successfully arrived at URL:', page.url());
  
  // Wait for loading spinner to disappear
  await page.waitForSelector('text=Loading reward setup...', { state: 'detached', timeout: 15000 });
  console.log('Loading spinner detached!');
  
  // Verify fields in Step A
  const titleInput = await page.locator('input#card-name, input[placeholder*="VIP"]').first();
  console.log('Title input visible:', await titleInput.isVisible());
  
  // Scroll down to Step A / Step B
  const rewardSection = page.locator('#sec-reward-setup');
  await rewardSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'reward_setup_fully_loaded.png' });
  console.log('Saved screenshot to reward_setup_fully_loaded.png');
  
  await browser.close();
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
