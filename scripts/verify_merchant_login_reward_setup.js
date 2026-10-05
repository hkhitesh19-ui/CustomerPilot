const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1600 } });
  
  console.log('Testing direct merchant login...');
  await page.goto('http://localhost:3000/login?callbackUrl=%2Fdashboard%2Fsettings%23sec-reward-setup');
  await page.fill('input[type="email"]', 'order.cakeconnection@gmail.com');
  await page.fill('input[type="password"]', 'Admin@CustomerPilot2026!');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard/settings#sec-reward-setup', { timeout: 15000 });
  console.log('Direct merchant reached URL:', page.url());
  await page.waitForTimeout(3000);
  
  const secElement = await page.$('#sec-reward-setup');
  if (secElement) {
    const text = await secElement.innerText();
    console.log('Merchant Step A & Step B verified!');
    await secElement.screenshot({ path: 'merchant_reward_setup_section.png' });
    console.log('Saved screenshot to merchant_reward_setup_section.png');
  }
  
  await browser.close();
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
