import { test, expect } from './fixtures/hardened-test';

test.describe('Cake Connection GBP Optimization & Post Lifecycle Verification', () => {
  test('Cake Connection 100-Point Audit & Competitor Spam Purge Verification', async ({ page }) => {
    // 1. Visit the dedicated GBP ranking landing page
    await page.goto('/google-business-profile-ranking', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Google Business Profile Top 3 Rank Accelerator/i);

    // 2. Click "Run Free 100-Point Audit Now" (preset for Cake Connection)
    const heroBtn = page.locator('button:has-text("Run Free 100-Point Audit Now")');
    await expect(heroBtn).toBeVisible();
    await heroBtn.click();

    // 3. Await scorecard calculation
    const scorecardBreakdown = page.locator('text=6-Pillar Deep Audit Breakdown');
    await expect(scorecardBreakdown).toBeVisible({ timeout: 20000 });

    // 4. Assert Cake Connection scorecard (67/100)
    const scoreCardLocator = page.locator('text=/100').first().locator('..');
    await expect(scoreCardLocator).toBeVisible();
    const scoreFullText = (await scoreCardLocator.innerText()).replace(/\s+/g, '');
    expect(scoreFullText).toBe('67/100');

    // 5. Assert all 6 diagnostic pillars rendered
    const pillarPointsPills = page.locator('text=/\\d+\\/\\d+ pts/');
    await expect(pillarPointsPills).toHaveCount(6);

    // 6. Assert competitor benchmark pack includes Cake Connection and competitors
    await expect(page.locator('text=Your Shop').first()).toBeVisible();
    await expect(page.locator('text=Keyword Spammer')).toBeVisible();

    // Take verified screenshot
    await page.screenshot({ path: 'scratch/cake_connection_audit_verified.png' });
  });

  test('Cake Connection Weekly 3-Post Engine API & Lifecycle Verification', async ({ request }) => {
    const merchantId = 'cmviz7pqm0000uwzgi7jr4xoo';

    // 1. Fetch posts for Cake Connection
    const postsRes = await request.get(`/api/gbp/posts?merchantId=${merchantId}`);
    expect(postsRes.status()).toBe(200);
    const postsData = await postsRes.json();
    expect(postsData.success).toBe(true);
    expect(postsData.posts.length).toBe(3);

    const tuesdayPost = postsData.posts.find((p: any) => p.scheduledDay === 'TUESDAY');
    const thursdayPost = postsData.posts.find((p: any) => p.scheduledDay === 'THURSDAY');
    const saturdayPost = postsData.posts.find((p: any) => p.scheduledDay === 'SATURDAY');

    expect(tuesdayPost).toBeDefined();
    expect(thursdayPost).toBeDefined();
    expect(saturdayPost).toBeDefined();

    // 2. Tuesday Post Assertions
    expect(tuesdayPost.postType).toBe('PRODUCT_SPOTLIGHT');
    expect(tuesdayPost.caption).toContain('Cake Connection');
    expect(tuesdayPost.ctaType).toBe('ORDER');
    expect(tuesdayPost.status).toBe('POSTED'); // Operator posted in optimization script

    // 3. Thursday Post Assertions (Customized)
    expect(thursdayPost.postType).toBe('SOCIAL_PROOF');
    expect(thursdayPost.caption).toContain('⭐⭐⭐⭐⭐');
    expect(thursdayPost.caption).toContain('Belgian Chocolate Truffle');

    // 4. Saturday Post Assertions (Regenerated)
    expect(saturdayPost.postType).toBe('WEEKEND_OFFER');
    expect(saturdayPost.status).toBe('AWAITING_APPROVAL');
    expect(saturdayPost.revisionCount).toBe(1);
    expect(saturdayPost.merchantFeedback).toBe('Feature freshly baked sourdough loaves and celebratory family hamper instead');
    expect(saturdayPost.couponCode).toBeDefined();

    // 5. Zero Dummy Data Assertions
    for (const post of postsData.posts) {
      expect(post.caption).not.toContain('lorem ipsum');
      expect(post.caption).not.toContain('undefined');
      expect(post.caption).not.toContain('12345');
      expect(post.caption.length).toBeGreaterThan(60);
    }
  });
});
