import { test, expect } from './fixtures/hardened-test';
import { resolveMerchantKeywordProfile, MASTER_KEYWORD_PRESETS } from '../src/lib/keyword-matrix';

test.describe('Dual Bestseller Review Studio & Customer Review Page E2E', () => {
  test('resolveMerchantKeywordProfile extracts up to 10 Bestseller Services and up to 10 Bestseller Products', async () => {
    const profile = resolveMerchantKeywordProfile({
      id: 'cmw60b1in1jsckv9d3wwc0cb6',
      name: 'PET CLINIC @ MANJALPUR',
      category: 'Healthcare & Clinics',
      businessType: 'pet_clinic',
      city: 'Vadodara'
    });

    console.log('[E2E Bestseller Unit] heroServices count:', profile.heroServices?.length);
    console.log('[E2E Bestseller Unit] heroProducts count:', profile.heroProducts?.length);

    expect(Array.isArray(profile.heroServices)).toBe(true);
    expect(profile.heroServices!.length).toBeGreaterThan(0);
    expect(profile.heroServices!.length).toBeLessThanOrEqual(10);

    expect(Array.isArray(profile.heroProducts)).toBe(true);
    expect(profile.heroProducts!.length).toBeGreaterThan(0);
    expect(profile.heroProducts!.length).toBeLessThanOrEqual(10);

    // Verify veterinary-specific entities (zero human doctor terms)
    for (const service of profile.heroServices!) {
      expect(service.toLowerCase()).not.toContain('mbbs');
      expect(service.toLowerCase()).not.toContain('general physician');
    }
  });

  test('Customer review page renders categorized chips and dynamically updates drafts on click', async ({ page }) => {
    const res = await page.goto('/review?m=cmw60b1in1jsckv9d3wwc0cb6', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);

    const textarea = page.locator('#google-review-textarea');
    await expect(textarea).toBeVisible();

    // Check for chips
    const chipButtons = page.locator('button:has-text("⭐")');
    const chipCount = await chipButtons.count();
    expect(chipCount).toBeGreaterThan(0);

    // Click the first service chip
    const firstChip = chipButtons.first();
    const chipName = (await firstChip.innerText()).replace(/^[^\w]+/, '').trim();
    console.log('[E2E Bestseller UI] Clicking service chip:', chipName);

    await firstChip.click();
    await page.waitForTimeout(1000);

    const updatedValue = await textarea.inputValue();
    console.log('[E2E Bestseller UI] Updated Draft:', updatedValue);
    expect(updatedValue.length).toBeGreaterThan(20);

    // Save proof screenshot
    await page.screenshot({ path: 'scratch/bestseller_studio_customer_view.png' });
  });

  test('Dynamic-draft API accepts targeted product/service item and returns tailored drafts', async ({ request }) => {
    const res = await request.get('/api/reviews/dynamic-draft?m=cmw60b1in1jsckv9d3wwc0cb6&product=Puppy%207-in-1%20vaccination');
    expect(res.status()).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.drafts.draft1.toLowerCase()).toContain('puppy');
    console.log('[E2E Bestseller Dynamic Draft]:', json.drafts.draft1);
  });
});
