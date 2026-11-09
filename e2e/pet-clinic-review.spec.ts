import { test, expect } from './fixtures/hardened-test';

test.describe('Pet Clinic Ground-Truth Verification', () => {
  test('PET CLINIC @ MANJALPUR review flow has zero human doctor chips and pure veterinary reviews', async ({ page }) => {
    // Navigate to pet clinic review page
    const response = await page.goto('/review?m=cmw60b1in1jsckv9d3wwc0cb6', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    // Wait for review textarea to be populated
    const reviewTextarea = page.locator('#google-review-textarea');
    await expect(reviewTextarea).toBeVisible();

    // Check Hero Chips rendered on the screen (contains ⭐)
    const chipButtons = page.locator('button:has-text("⭐")');
    const chipCount = await chipButtons.count();
    expect(chipCount).toBeGreaterThan(0);

    const chipTexts: string[] = [];
    for (let i = 0; i < chipCount; i++) {
      chipTexts.push((await chipButtons.nth(i).innerText()).trim());
    }

    console.log('[Playwright Pet Clinic] Rendered Hero Chips:', chipTexts);

    // CRITICAL ASSERTION 1: Zero human doctor chips
    for (const chip of chipTexts) {
      expect(chip.toLowerCase()).not.toContain('mbbs');
      expect(chip.toLowerCase()).not.toContain('general physician');
      expect(chip.toLowerCase()).not.toContain('full body health');
      expect(chip.toLowerCase()).not.toContain('blood pressure');
      expect(chip.toLowerCase()).not.toContain('diabetes');
    }

    // CRITICAL ASSERTION 2: Authentic veterinary entities
    const hasVetKeywords = chipTexts.some(c => 
      c.toLowerCase().includes('vaccin') ||
      c.toLowerCase().includes('pet') ||
      c.toLowerCase().includes('rabies') ||
      c.toLowerCase().includes('deworm') ||
      c.toLowerCase().includes('flea')
    );
    expect(hasVetKeywords).toBe(true);

    // Verify initial draft text
    const initialDraft = await reviewTextarea.inputValue();
    console.log('[Playwright Pet Clinic] Initial Draft:', initialDraft);

    expect(initialDraft.length).toBeGreaterThan(20);
    // CRITICAL ASSERTION 3: Zero human illness / personal fever
    expect(initialDraft.toLowerCase()).not.toContain('my fever');
    expect(initialDraft.toLowerCase()).not.toContain('mera fever');
    expect(initialDraft.toLowerCase()).not.toContain('routine full body health');

    // Click on a veterinary chip
    const firstChip = chipButtons.first();
    const clickedChipText = await firstChip.innerText();
    console.log('[Playwright Pet Clinic] Clicking chip:', clickedChipText);
    await firstChip.click();
    await page.waitForTimeout(1000);

    const updatedDraft = await reviewTextarea.inputValue();
    console.log('[Playwright Pet Clinic] Updated Draft after Chip click:', updatedDraft);

    expect(updatedDraft.length).toBeGreaterThan(20);
    expect(updatedDraft.toLowerCase()).not.toContain('my fever');
    expect(updatedDraft.toLowerCase()).not.toContain('mera fever');

    // Capture screenshot proof
    await page.screenshot({ path: 'scratch/pet_clinic_verified_local.png' });
  });

  test('Dynamic-draft API returns authentic veterinary drafts for cmw60b1in1jsckv9d3wwc0cb6', async ({ request }) => {
    const res = await request.get('/api/reviews/dynamic-draft?m=cmw60b1in1jsckv9d3wwc0cb6');
    expect(res.status()).toBe(200);

    const json = await res.json();
    console.log('[Playwright Pet Clinic] Dynamic Draft API response:', json);

    expect(json.success).toBe(true);
    expect(json.drafts.draft1.toLowerCase()).not.toContain('my fever');
    expect(json.drafts.draft1.toLowerCase()).not.toContain('mera fever');
    expect(json.drafts.draft1.toLowerCase()).not.toContain('routine full body');
  });
});
