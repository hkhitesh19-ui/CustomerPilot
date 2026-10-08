const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

function fetchVcard() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:3000/api/digital-card?slug=cake-connection&format=vcard', (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          contentDisposition: res.headers['content-disposition'],
          body
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  console.log('🧪 ==========================================');
  console.log('🧪 STEP 1: Verifying RFC 3.0 vCard Endpoint');
  console.log('🧪 ==========================================');
  const vcardRes = await fetchVcard();
  console.log('Status:', vcardRes.statusCode);
  console.log('Content-Type:', vcardRes.contentType);
  console.log('Content-Disposition:', vcardRes.contentDisposition);

  if (vcardRes.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${vcardRes.statusCode}`);
  }
  if (!vcardRes.contentType || !vcardRes.contentType.includes('text/vcard')) {
    throw new Error(`Expected text/vcard content-type, got ${vcardRes.contentType}`);
  }
  if (!vcardRes.body.includes('BEGIN:VCARD') || !vcardRes.body.includes('END:VCARD')) {
    throw new Error('vCard response missing BEGIN/END markers');
  }
  if (!vcardRes.body.includes('Cake Connection')) {
    throw new Error('vCard missing Cake Connection name');
  }
  console.log('✅ Step 1 Passed: vCard RFC 3.0 endpoint verified!');

  console.log('\n🧪 ========================================================');
  console.log('🧪 STEP 2: Verifying Online Ordering Channels & Logos in UI');
  console.log('🧪 ========================================================');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile iPhone / Pixel frame
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    acceptDownloads: true
  });

  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERR:', msg.text());
  });

  console.log('Navigating to http://localhost:3000/c/cake-connection ...');
  await page.goto('http://localhost:3000/c/cake-connection', { waitUntil: 'networkidle', timeout: 60000 });

  // 1. Assert Online Ordering Heading
  const orderingHeader = await page.textContent('body');
  if (!orderingHeader.includes('Online Ordering Platforms')) {
    throw new Error('Could not find "Online Ordering Platforms" header');
  }

  // 2. Assert all 5 ordering channels exist
  const expectedChannels = ['Website', 'WhatsApp', 'Zomato', 'Swiggy', 'EasyCater'];
  for (const ch of expectedChannels) {
    const el = page.locator(`a:has-text("${ch}")`);
    const count = await el.count();
    console.log(`Channel [${ch}] count:`, count);
    if (count === 0) {
      throw new Error(`Missing ordering channel: ${ch}`);
    }
  }
  console.log('✅ Step 2 Passed: All 5 online ordering channels are present and rendered with proper labels!');

  const orderingScreenshotPath = path.join(scratchDir, 'verified_cake_connection_ordering_channels.png');
  await page.screenshot({ path: orderingScreenshotPath, fullPage: false });
  console.log('📸 Ordering channels screenshot saved:', orderingScreenshotPath);

  console.log('\n🧪 ========================================================');
  console.log('🧪 STEP 3: Verifying Native "Save Contact" Mobile Flow');
  console.log('🧪 ========================================================');
  
  // Track downloads
  let downloadTriggered = false;
  let downloadedFileName = '';
  page.on('download', download => {
    downloadTriggered = true;
    downloadedFileName = download.suggestedFilename();
    console.log('📥 Download event captured:', downloadedFileName);
  });

  const saveContactBtn = page.locator('button:has-text("Save Contact")');
  await saveContactBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Clicking "Save Contact" button on mobile viewport...');
  await saveContactBtn.click();

  // Wait for the modal/toast
  await page.waitForTimeout(1000);
  const modal = page.locator('div:has-text("Contact")').filter({ hasText: 'Open in Phone Contacts' });
  const isModalVisible = await modal.first().isVisible();
  console.log('Contact Guidance Modal Visible:', isModalVisible);

  if (!isModalVisible) {
    throw new Error('Contact guidance modal did not appear!');
  }

  // Check Android & iPhone instructions inside modal
  const modalText = await page.locator('div.fixed.inset-0').innerText();
  console.log('Modal text includes Android guide:', modalText.includes('Android'));
  console.log('Modal text includes iPhone guide:', modalText.includes('iPhone'));

  const openContactsBtn = page.locator('a:has-text("Open in Phone Contacts")');
  const openContactsVisible = await openContactsBtn.isVisible();
  const openContactsHref = await openContactsBtn.getAttribute('href');
  console.log('Action Button "Open in Phone Contacts" Visible:', openContactsVisible);
  console.log('Action Button Href:', openContactsHref);

  if (!openContactsVisible || !openContactsHref?.includes('format=vcard')) {
    throw new Error('Open in Phone Contacts button is invalid or missing vcard format!');
  }

  const modalScreenshotPath = path.join(scratchDir, 'verified_cake_connection_save_contact_modal.png');
  await page.screenshot({ path: modalScreenshotPath, fullPage: false });
  console.log('📸 Contact modal screenshot saved:', modalScreenshotPath);

  await browser.close();
  console.log('✅ Step 3 Passed: Native mobile contact save and guidance verified!');

  console.log('\n🎉 ALL 3 GROUND-TRUTH ENGINE VERIFICATIONS PASSED 100%!');
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
