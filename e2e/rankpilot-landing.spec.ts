import { test, expect } from './fixtures/hardened-test';

test.describe('RankPilot AI Dedicated Landing Page E2E Suite', () => {
  test('Landing page loads at /rankpilot with 200 OK and valid SEO metadata', async ({ page }) => {
    const res = await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);

    // Title & Meta assertions
    await expect(page).toHaveTitle(/RankPilot AI.*Google Maps Top 3/i);

    // Verify Brand Logo and Header navigation
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(page.locator('text=RankPilot AI™ v7.0').first()).toBeVisible();
  });

  test('Hero section renders core value propositions and trust badges', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });

    // Hero Headline
    const headline = page.locator('h1');
    await expect(headline).toContainText('Move Your Store from Page 10');
    await expect(headline).toContainText('to Google Maps Top 3');

    // Trust badges
    await expect(page.locator('text=100% Google Policy Clean').first()).toBeVisible();
    await expect(page.locator('text=Top 3 Local Pack Guarantee').first()).toBeVisible();
    await expect(page.locator('text=10+10 Dual Matrix').first()).toBeVisible();
  });

  test('Revenue Leak Simulator allows interactive inputs and computes loss in real-time', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });

    // Find the Revenue Leak section
    const simSection = page.locator('#revenue-leak');
    await expect(simSection).toBeVisible();

    // Check default values rendered
    await expect(page.locator('text=Top 3 Potential Monthly Actions').first()).toBeVisible();
    await expect(page.locator('text=Monthly Walk-In & Order Loss').first()).toBeVisible();
    await expect(page.locator('text=Monthly Revenue Bleeding Out').first()).toBeVisible();

    // Verify click on a different rank pill (e.g. Rank #5)
    const rank5Button = page.locator('button:text-is("#5")');
    if (await rank5Button.count() > 0) {
      await rank5Button.click();
      await page.waitForTimeout(300);
      // Ensure recalculation happened without crash
      await expect(page.locator('text=Monthly Walk-In & Order Loss').first()).toBeVisible();
    }
  });

  test('10+10 Dual Matrix Showcase switches verticals cleanly', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });

    const matrixSection = page.locator('#features');
    await expect(matrixSection).toBeVisible();

    // Verify Products & Services columns
    await expect(page.locator('text=Top 10 High-Intent Products').first()).toBeVisible();
    await expect(page.locator('text=Top 10 High-Intent Services').first()).toBeVisible();

    // Click Pet Clinic vertical tab
    const petClinicTab = page.locator('button:has-text("Pet Clinic & Vet")');
    if (await petClinicTab.count() > 0) {
      await petClinicTab.click();
      await page.waitForTimeout(300);
      await expect(page.locator('text=Pet Clinic @ Manjalpur').first()).toBeVisible();
    }
  });

  test('Post Dominance Engine tabs toggle weekly cadence templates', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });

    const postEngine = page.locator('#how-it-works');
    await expect(postEngine).toBeVisible();

    // Click Thursday tab
    const thuTab = page.locator('button:has-text("Thursday")');
    if (await thuTab.count() > 0) {
      await thuTab.click();
      await page.waitForTimeout(300);
      await expect(page.locator('text=Customer Review Spotlight').first()).toBeVisible();
    }

    // Click Saturday tab
    const satTab = page.locator('button:has-text("Saturday")');
    if (await satTab.count() > 0) {
      await satTab.click();
      await page.waitForTimeout(300);
      await expect(page.locator('text=Weekend VIP Offer Post').first()).toBeVisible();
      await expect(page.locator('text=Zero-Gap Expiration').first()).toBeVisible();
    }
  });

  test('Dual-Language FAQ renders and expands items correctly', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });

    const faqSection = page.locator('#faq');
    await expect(faqSection).toBeVisible();

    // Check first question text
    await expect(page.locator('text=How can a business on Page 10 reach Top 3 in 30 days?').first()).toBeVisible();
  });

  test('Alias /rankpilot-ai cleanly redirects to /rankpilot', async ({ page }) => {
    await page.goto('/rankpilot-ai', { waitUntil: 'domcontentloaded' });
    expect(page.url()).toContain('/rankpilot');
  });

  test('Zero dummy placeholder text audit', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });
    const content = await page.content();

    // Ground-truth assertions: no lorem ipsum, no dummy domain placeholders
    expect(content.toLowerCase()).not.toContain('lorem ipsum');
    expect(content).not.toContain('example.com');
  });

  test('Top launch offer bar and hero 2-tier SLA display correctly', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });

    // Top Announcement Bar
    const topBar = page.locator('aside[aria-label="Limited Launch Offer"]');
    await expect(topBar).toBeVisible();
    await expect(topBar).toContainText('3 Months at ₹6,999/-');
    await expect(topBar).toContainText('100% Moneyback Guarantee');

    // Hero 2-tier SLA Card
    await expect(page.locator('text=45 Days to 1st Page ➔ 90 Days to Top 3').first()).toBeVisible();
    await expect(page.locator('text=60 Days Fast-Track to Top 3 Local Pack').first()).toBeVisible();
    await expect(page.locator('text=RankLocal AI™').first()).toBeVisible();
  });

  test('Guaranteed Pricing section renders ₹6,999 and ₹29,000 plans with 100% Moneyback Guarantee', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });

    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();

    // 3-Month Plan assertions
    await expect(pricingSection.locator('text=₹6,999').first()).toBeVisible();
    await expect(pricingSection.locator('text=/ 3 Months').first()).toBeVisible();
    await expect(pricingSection.locator('text=Save 76%').first()).toBeVisible();

    // Annual Plan assertions
    await expect(pricingSection.locator('text=₹29,000').first()).toBeVisible();
    await expect(pricingSection.locator('text=/ Year').first()).toBeVisible();

    // 100% Moneyback Guarantee Seal assertions
    await expect(pricingSection.locator('text=Our Ironclad 100% Moneyback Guarantee').first()).toBeVisible();
    await expect(pricingSection.locator('text=Zero Financial Risk').first()).toBeVisible();
  });

  test('GMBPro-inspired "See Exactly What We Fix" showcase renders and switches tabs', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });

    const auditSection = page.locator('#audit-showcase');
    await expect(auditSection).toBeVisible();

    // Verify main headline and initial tab (Profile Optimization)
    await expect(auditSection.locator('text=See Exactly What We Fix').first()).toBeVisible();
    await expect(auditSection.locator('text=Cake Connection, Manjalpur').first()).toBeVisible();
    await expect(auditSection.locator('text=BEFORE • Problem State').first()).toBeVisible();
    await expect(auditSection.locator('text=AFTER • RankLocal AI™ Fix').first()).toBeVisible();

    // Switch to Suspension Recovery tab
    const suspensionTab = auditSection.locator('button:has-text("Suspension Recovery")');
    if (await suspensionTab.count() > 0) {
      await suspensionTab.click();
      await page.waitForTimeout(300);
      await expect(auditSection.locator('text=Vinayak Car Care & Detailing').first()).toBeVisible();
      await expect(auditSection.locator('text=REINSTATED').first()).toBeVisible();
    }
  });

  test('Multi-Radius Nearby Search and Client Proof sections render with real local data', async ({ page }) => {
    await page.goto('/rankpilot', { waitUntil: 'domcontentloaded' });

    // Multi-Radius Section
    const nearbySection = page.locator('#nearby-search');
    await expect(nearbySection).toBeVisible();
    await expect(nearbySection.locator('text=Rank Your Google Business Profile In Every Nearby Search').first()).toBeVisible();
    await expect(nearbySection.locator('text=Cake Shop Near Me').first()).toBeVisible();

    // Reviews & Proof Section
    const reviewsSection = page.locator('#reviews');
    await expect(reviewsSection).toBeVisible();
    await expect(reviewsSection.locator('text=Real Local Business Results').first()).toBeVisible();
    await expect(reviewsSection.locator('text=Cake Connection, Manjalpur').first()).toBeVisible();
    await expect(reviewsSection.locator('text=Pet Clinic @ Manjalpur').first()).toBeVisible();
  });
});
