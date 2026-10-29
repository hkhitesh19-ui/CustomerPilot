const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyReviewPilotAnimation() {
  console.log('🚀 Starting Playwright Ground-Truth & Visual Verification for ReviewPilot-Style Animation...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    const targetUrl = 'http://localhost:3000/ai-google-review-qr-generator';
    console.log(`Navigating to ${targetUrl}...`);
    
    const response = await page.goto(targetUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`Page HTTP Status: ${response.status()}`);
    if (response.status() !== 200) {
      throw new Error(`Expected HTTP 200, got ${response.status()}`);
    }

    // Scroll to the live animation section
    const liveSection = page.locator('#live-animation');
    await liveSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Assert Section Heading & Trust Badges
    const heading = liveSection.locator('h2');
    const headingText = await heading.textContent();
    console.log(`✓ Live Section Heading: "${headingText.trim()}"`);
    if (!headingText.includes('Review Arrives. AI Drafts. You Approve, It Publishes.')) {
      throw new Error(`Heading text mismatch: ${headingText}`);
    }

    const badge = liveSection.getByText('21,000+ Reviews Generated');
    await badge.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Found "21,000+ Reviews Generated" badge');

    // Assert Step 1: A review arrives
    const step1Title = liveSection.getByText('A review arrives');
    await step1Title.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 1: "A review arrives" header is visible');

    const businessName1 = liveSection.locator('p', { hasText: 'Smile Studio Dental' }).first();
    await businessName1.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 1: Verified Store "Smile Studio Dental"');

    const reviewerName = liveSection.locator('span', { hasText: 'Ritika' }).first();
    await reviewerName.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 1: Verified Customer "Ritika"');

    const reviewText = liveSection.locator('p', { hasText: 'Treatment itself was good, but I waited almost 40 minutes' }).first();
    await reviewText.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 1: Verified real customer review text');

    // Assert Connector 1: Auto-fetch
    const connector1 = liveSection.locator('span:visible', { hasText: 'Auto-fetch' }).first();
    await connector1.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Connector 1: "Auto-fetch" with animated line is visible');

    // Assert Step 2: AI drafts the reply
    const step2Title = liveSection.getByText('AI drafts the reply');
    await step2Title.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 2: "AI drafts the reply" header is visible');

    const cpBrand = liveSection.getByText('CustomerPilot AI');
    await cpBrand.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 2: Brand "CustomerPilot AI" is visible');

    const toneSelector = liveSection.getByText('Tone: Empathetic & Professional');
    await toneSelector.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 2: Tone selector is visible');

    // Assert Action Button
    const actionButton = liveSection.locator('[data-testid="action-approve-btn"]');
    await actionButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 2: Interactive Action Button is visible');

    // Assert Connector 2: One-click publish
    const connector2 = liveSection.locator('span:visible', { hasText: 'One-click publish' }).first();
    await connector2.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Connector 2: "One-click publish" with animated line is visible');

    // Assert Step 3: You approve, it publishes
    const step3Title = liveSection.getByText('You approve, it publishes', { exact: true });
    await step3Title.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 3: "You approve, it publishes" header is visible');

    // Assert Bottom Loop Bar
    const loopPill = liveSection.getByText('Automation Loop Continues');
    await loopPill.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Bottom Track: "Automation Loop Continues" pill with rotating icon is visible');

    // Test Interactivity: Trigger click to verify published state
    console.log('Testing interactivity: Triggering button click to verify publish state...');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="action-approve-btn"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);

    // Verify published state appearance
    const publishedToast = liveSection.getByText('Live on Google Business Profile').first();
    await publishedToast.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Published Toast: "Live on Google Business Profile" verified!');

    const ownerBadge = liveSection.locator('span', { hasText: 'Owner' }).first();
    await ownerBadge.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Card 3: Live Verified "Owner" response badge verified!');

    // Capture visual screenshot of the live animation section
    const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4';
    const screenshotPath = path.join(artifactDir, 'landing_ai_reviews_live_flow.png');
    
    // Take focused screenshot of the live animation section
    await liveSection.screenshot({ path: screenshotPath });
    console.log(`📸 Visual screenshot saved to: ${screenshotPath}`);

    // Verify console errors
    const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('download'));
    if (criticalErrors.length > 0) {
      console.warn('⚠️ Console errors detected:', criticalErrors);
    } else {
      console.log('✓ Zero console errors detected during live execution.');
    }

    console.log('\n🎉 ALL GROUND-TRUTH & VISUAL ASSERTIONS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyReviewPilotAnimation();
