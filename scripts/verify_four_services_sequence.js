const { chromium } = require('playwright');
const path = require('path');

async function testFourServicesSequence() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to http://localhost:3000/...');
  const res = await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  if (res.status() !== 200) throw new Error('Status: ' + res.status());

  // Check 4 Cards Headings in the section
  const cardHeadings = await page.$$eval('#features .fcard h3', els => els.map(e => e.textContent.trim()));
  console.log('Detected Card Headings on Homepage:', cardHeadings);

  const expectedHeadings = [
    'Smart Digital Business Card',
    'Digital Loyalty & Stamps',
    'Smart Ai Google Reviews',
    '1-Click AI AutoReply'
  ];

  if (JSON.stringify(cardHeadings) !== JSON.stringify(expectedHeadings)) {
    throw new Error('Cards mismatch! Expected: ' + JSON.stringify(expectedHeadings) + ' but got: ' + JSON.stringify(cardHeadings));
  }
  console.log('✅ 4 Service Cards strictly match user sequence: (1) Smart Digital Business Card, (2) Digital Loyalty & Stamps, (3) Smart Ai Google Reviews, (4) 1-Click AI AutoReply!');

  // Take screenshot of the exact 4 cards section
  const featuresSection = await page.$('#features');
  const artifactDir = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4');
  await featuresSection.screenshot({ path: path.join(artifactDir, 'homepage_four_services_sequence.png') });
  console.log('✅ Screenshot captured: homepage_four_services_sequence.png');

  await browser.close();
}

testFourServicesSequence().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
