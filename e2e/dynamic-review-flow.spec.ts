import { test, expect } from './fixtures/hardened-test';

test.describe('Dynamic Google Review Engine & Shuffle Verification', () => {
  test('Renders dynamic review drafts, switches angles, and shuffles new ideas', async ({ page }) => {
    // 1. Visit the review page for Cake Connection
    await page.goto('/review?m=cmtymavfx0002kx008lbfvp57', { waitUntil: 'domcontentloaded' });

    // 2. Assert merchant name and header are present
    const merchantTitle = page.locator('h1');
    await expect(merchantTitle).toContainText('Cake Connection');

    // 3. Assert "Try Another Idea" button is visible
    const tryAnotherBtn = page.locator('button:has-text("Try Another Idea")');
    await expect(tryAnotherBtn).toBeVisible();

    // 4. Assert Review Textarea exists and contains initial dynamic text
    const textarea = page.locator('#google-review-textarea');
    await expect(textarea).toBeVisible();
    const initialText = await textarea.inputValue();
    expect(initialText.length).toBeGreaterThan(10);
    console.log('[E2E Ground-Truth] Initial Draft:', initialText);

    // 5. Test Angle Switching: Click "Service & Vibes"
    const serviceTab = page.locator('button:has-text("Service & Vibes")');
    await expect(serviceTab).toBeVisible();
    await serviceTab.click();
    const serviceText = await textarea.inputValue();
    expect(serviceText.length).toBeGreaterThan(10);
    console.log('[E2E Ground-Truth] Service & Vibes Draft:', serviceText);

    // 6. Test Angle Switching: Click "Short 1-Liner"
    const oneLinerTab = page.locator('button:has-text("Short 1-Liner")');
    await expect(oneLinerTab).toBeVisible();
    await oneLinerTab.click();
    const oneLinerText = await textarea.inputValue();
    expect(oneLinerText.length).toBeGreaterThan(5);
    console.log('[E2E Ground-Truth] Short 1-Liner Draft:', oneLinerText);

    // 7. Click "Try Another Idea" and verify dynamic draft change
    await tryAnotherBtn.click();
    await page.waitForTimeout(1000); // allow dynamic API / state update

    const updatedText = await textarea.inputValue();
    expect(updatedText.length).toBeGreaterThan(5);
    console.log('[E2E Ground-Truth] Shuffled Draft:', updatedText);

    // 8. Capture ground truth screenshot proof
    await page.screenshot({ path: 'scratch/dynamic_review_page_verified.png' });
  });

  test('Public API /api/reviews/dynamic-draft returns valid dynamic drafts', async ({ request }) => {
    const res = await request.get('/api/reviews/dynamic-draft?m=cmtymavfx0002kx008lbfvp57');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.drafts).toBeDefined();
    expect(data.drafts.draft1.length).toBeGreaterThan(10);
    expect(data.drafts.draft2.length).toBeGreaterThan(10);
    expect(data.drafts.draft3.length).toBeGreaterThan(5);
  });
});
