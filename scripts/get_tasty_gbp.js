const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'en-IN',
    geolocation: { latitude: 22.3382, longitude: 73.1818 }, // Vadodara
    permissions: ['geolocation'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const url = 'https://www.google.com/maps/search/Tasty+Vadapav+Nizampura+Vadodara';
  console.log('Navigating to Google Maps:', url);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  const title = await page.title();
  console.log('Page Title:', title);

  // Extract rating & review count elements
  const data = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      snippet: text.slice(0, 1500)
    };
  });

  console.log('\n--- MAPS SNIPPET ---');
  console.log(data.snippet);

  await page.screenshot({ path: 'scripts/maps_screenshot.png' });
  console.log('Screenshot saved to scripts/maps_screenshot.png');

  await browser.close();
}

main().catch(console.error);
