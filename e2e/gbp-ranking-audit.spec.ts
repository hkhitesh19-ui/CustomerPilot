import { test, expect } from './fixtures/hardened-test';

test.describe('Google Business Profile (GBP) Deep Deterministic & Error-Trap Verification', () => {
  test('Complete Interactive Audit Journey with Exact Deterministic Scores & Zero Console/Network Errors', async ({ page }) => {
    // 1. Visit the dedicated GBP ranking landing page
    await page.goto('/google-business-profile-ranking', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Google Business Profile Top 3 Rank Accelerator/i);

    // 2. Assert H1 and SGE / Voice Search snippet
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Google Maps Top 3');

    const sgeSnippet = page.locator('text=Google SGE & Voice Search Direct Answer Snippet');
    await expect(sgeSnippet).toBeVisible();

    // 3. Test Hero CTA: Click "Run Free 100-Point Audit Now"
    const heroBtn = page.locator('button:has-text("Run Free 100-Point Audit Now")');
    await expect(heroBtn).toBeVisible();
    await heroBtn.click();

    // 4. Await diagnostic computation & assert EXACT deterministic score for Cake Connection (67/100)
    const scorecardBreakdown = page.locator('text=6-Pillar Deep Audit Breakdown');
    await expect(scorecardBreakdown).toBeVisible({ timeout: 20000 });

    const scoreCardLocator = page.locator('text=/100').first().locator('..');
    await expect(scoreCardLocator).toBeVisible();
    const scoreFullText = (await scoreCardLocator.innerText()).replace(/\s+/g, '');
    
    // Deterministic mathematical assertion: Cake Connection (156 reviews) scores exactly 67/100
    expect(scoreFullText).toBe('67/100');

    // 5. Deep Count Assertions: Exactly 6 Diagnostic Pillars Rendered
    const pillarPointsPills = page.locator('text=/\\d+\\/\\d+ pts/');
    await expect(pillarPointsPills).toHaveCount(6);

    // Assert Action guidance exists on all 6 pillars
    const actionBadges = page.locator('text=Action:');
    await expect(actionBadges).toHaveCount(6);

    // 6. Deep Assertion: Competitor Local Pack Benchmark (Ranks #1, #2, #3 + Your Shop)
    await expect(page.locator('text=#1').first()).toBeVisible();
    await expect(page.locator('text=#2').first()).toBeVisible();
    await expect(page.locator('text=#3').first()).toBeVisible();
    await expect(page.locator('text=Your Shop').first()).toBeVisible();

    // Assert competitor keyword spam detection & redressal opportunity alert
    await expect(page.locator('text=Keyword Spammer')).toBeVisible();
    await expect(page.locator('text=Fast-Track Rank Opportunity: Competitor Violates Google Signboard Policy')).toBeVisible();

    // 7. Test Quick Test Preset Demo: "Smile Dental Clinic" (Different category & reviews)
    const dentalPresetBtn = page.locator('button:has-text("Smile Dental Clinic")');
    await expect(dentalPresetBtn).toBeVisible();
    await dentalPresetBtn.click();

    // Assert that the scorecard updates dynamically to Smile Dental Clinic
    const dentalHeader = page.locator('h3:has-text("Smile Dental Clinic")');
    await expect(dentalHeader).toBeVisible({ timeout: 15000 });

    // Assert that score updates deterministically to 70/100 for Smile Dental Clinic (48 reviews offline fallback: 18+19+15+6+8+4 = 70)
    const updatedScoreText = (await scoreCardLocator.innerText()).replace(/\s+/g, '');
    expect(updatedScoreText).toBe('70/100');

    // 8. Re-verify that all 6 pillars remain populated with valid points
    await expect(pillarPointsPills).toHaveCount(6);
  });

  test('GBP Permanent Alias /gbp-audit Returns Real HTTP 308 Permanent Redirect at Network Level', async ({ request }) => {
    // Check raw HTTP response without browser following redirects automatically
    const response = await request.get('/gbp-audit', { maxRedirects: 0 });
    
    // In Next.js App Router, permanentRedirect() emits HTTP 308 Permanent Redirect
    expect([301, 308]).toContain(response.status());
    const locationHeader = response.headers()['location'];
    expect(locationHeader).toMatch(/.*google-business-profile-ranking.*/);
  });
});
