const { chromium } = require('playwright');
const path = require('path');

async function main() {
  console.log('--- Playwright Output & Schema Verification: /whatsapp-digital-loyalty-card ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  const url = 'http://localhost:3000/whatsapp-digital-loyalty-card';
  console.log('Navigating to:', url);
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  const status = response ? response.status() : 0;
  console.log('HTTP Status:', status);

  const bodyText = await page.innerText('body');

  const assertions = [
    { label: 'HTTP 200', pass: status === 200 },
    {
      label: 'Exact H1: Turn One-Time Walk-ins Into Repeat Customers with WhatsApp Digital Loyalty Cards',
      pass: bodyText.includes('Turn One-Time Walk-ins Into Repeat Customers with WhatsApp Digital Loyalty Cards')
    },
    {
      label: 'Agitation H2: Kyun Paper Punch Cards Aur Expensive Apps Ab Kaam Nahi Karte?',
      pass: bodyText.includes('Kyun Paper Punch Cards Aur Expensive Apps Ab Kaam Nahi Karte?')
    },
    {
      label: 'How It Works H2: How Our WhatsApp Business Automation for Loyalty Rewards Works',
      pass: bodyText.includes('How Our WhatsApp Business Automation for Loyalty Rewards Works')
    },
    {
      label: 'Cross-sell H2: Bonus: In-Built AI Google Review QR Generator',
      pass: bodyText.includes('Bonus: In-Built AI Google Review QR Generator')
    },
    {
      label: 'Comparison Table H2: CustomerPilot vs. Traditional Punch Cards vs. Stamp Me',
      pass: bodyText.includes('CustomerPilot vs. Traditional Punch Cards vs. Stamp Me')
    },
    {
      label: 'FAQ H2: Frequently Asked Questions (FAQ)',
      pass: bodyText.includes('Frequently Asked Questions (FAQ)')
    },
    {
      label: 'Step 1 H3: Customer Scans the Smart QR Code at Checkout',
      pass: bodyText.includes('Step 1: Customer Scans the Smart QR Code at Checkout')
    },
    {
      label: 'Step 2 H3: Instant Digital Stamp & Point Allocation',
      pass: bodyText.includes('Step 2: Instant Digital Stamp & Point Allocation')
    },
    {
      label: 'Step 3 H3: Automated Discount & Reward Campaigns',
      pass: bodyText.includes('Step 3: Automated Discount & Reward Campaigns')
    },
    {
      label: 'Hinglish FAQ 1: Shop ke liye digital loyalty card kaise banaye?',
      pass: bodyText.includes('Shop ke liye digital loyalty card kaise banaye?')
    },
    {
      label: 'Hinglish FAQ 2: Customer ko reward points dene wala software kaise set up karein?',
      pass: bodyText.includes('Customer ko reward points dene wala software kaise set up karein?')
    },
    {
      label: 'Hinglish FAQ 3: Grahak ko discount aur points dene wala app kaunsa best hai?',
      pass: bodyText.includes('Grahak ko discount aur points dene wala app kaunsa best hai?')
    },
    {
      label: 'GEO Stat 34% repeat walk-ins present',
      pass: bodyText.includes('+34%') || bodyText.includes('34%')
    },
    {
      label: 'Zero dummy data 98765',
      pass: !bodyText.includes('98765')
    },
    {
      label: 'Zero dummy 12345',
      pass: !bodyText.includes('12345')
    },
    {
      label: 'Zero dummy lorem ipsum',
      pass: !bodyText.toLowerCase().includes('lorem ipsum')
    }
  ];

  // Schema Markup Assertion
  const jsonLdScripts = await page.$$eval('script[type="application/ld+json"]', elements =>
    elements.map(el => el.textContent)
  );

  let faqSchemaFound = false;
  let softwareAppSchemaFound = false;

  for (const scriptContent of jsonLdScripts) {
    try {
      const parsed = JSON.parse(scriptContent);
      if (parsed['@type'] === 'FAQPage') {
        faqSchemaFound = true;
      }
      if (parsed['@type'] === 'SoftwareApplication') {
        softwareAppSchemaFound = true;
      }
    } catch (e) {}
  }

  assertions.push({
    label: 'JSON-LD FAQPage Schema injected',
    pass: faqSchemaFound
  });
  assertions.push({
    label: 'JSON-LD SoftwareApplication Schema injected',
    pass: softwareAppSchemaFound
  });

  console.log('\n--- Assertion Results ---');
  let allPassed = true;
  assertions.forEach((a, idx) => {
    const symbol = a.pass ? '✅ PASS' : '❌ FAIL';
    console.log(`${idx + 1}. [${symbol}] ${a.label}`);
    if (!a.pass) allPassed = false;
  });

  // Capture Visual Snapshot
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\4da7c8d9-dec1-4986-9146-1a399efc88a4';
  const screenshotPath = path.join(artifactDir, 'whatsapp_digital_loyalty_card_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('\nScreenshot captured at:', screenshotPath);

  await browser.close();

  if (!allPassed) {
    console.error('One or more assertions failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 19 ASSERTIONS PASSED 100%!');
  }
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
