import { test, expect } from './fixtures/hardened-test';

test.describe('Public Free AI Google Review Generator - 2-Tier Category Taxonomy', () => {
  test('Renders 8 Main Industry Groups, interactive Sub-Categories, auto-fills presets & generates reviews', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for Next dev compile + interactions on Windows
    // 1. Navigate to the redesigned public generator page
    await page.goto('/free-ai-google-review-generator', { waitUntil: 'domcontentloaded', timeout: 120000 });

    // 2. Assert page header & direct answer snippet
    await expect(page.locator('h1')).toContainText('Free AI Google Review Generator');

    // 3. Assert 8 Main Industry Group Tabs exist
    const mainGroups = [
      'Food & Dining',
      'Healthcare & Veterinary',
      'Beauty & Grooming',
      'Automotive & Detailing',
      'Retail & Shopping',
      'Services & Professional',
      'Education & Coaching',
      'Fitness & Sports'
    ];
    for (const group of mainGroups) {
      await expect(page.locator(`button:has-text("${group}")`)).toBeVisible();
    }

    // 4. Test Sub-Category: Fast Food & Street Snacks
    const fastFoodBtn = page.locator('button:has-text("Fast Food & Street Snacks")');
    await expect(fastFoodBtn).toBeVisible();
    await fastFoodBtn.click();
    await page.waitForTimeout(400);

    const storeInput = page.locator('#store-name-input');
    await expect(storeInput).toHaveValue('Tasty Vadapav & Dabeli Center');

    const highlightInput = page.locator('#experience-input');
    const highlightVal = await highlightInput.inputValue();
    expect(highlightVal).toContain('Vadapav');

    // Assert 3 Generated Reviews exist and mention Fast Food
    const reviewCards = page.locator('.grid.md\\:grid-cols-3 > div');
    await expect(reviewCards).toHaveCount(3);
    const option1Text = await reviewCards.nth(0).innerText();
    expect(option1Text).toContain('Tasty Vadapav & Dabeli Center');

    // 5. Test Switching Main Category to "Healthcare & Veterinary"
    const healthcareBtn = page.locator('button:has-text("Healthcare & Veterinary")');
    await healthcareBtn.click();
    await page.waitForTimeout(400);

    // Assert Dental Clinic & Pet Clinic pills appear
    const dentalBtn = page.locator('button:has-text("Dental Clinic & Orthodontist")');
    const petBtn = page.locator('button:has-text("Pet Clinic & Veterinary Hospital")');
    await expect(dentalBtn).toBeVisible();
    await expect(petBtn).toBeVisible();

    // 6. Click Dental Clinic & verify auto-fill
    await dentalBtn.click();
    await page.waitForTimeout(400);
    await expect(storeInput).toHaveValue('Smile Studio Dental Clinic');
    const dentalReviewText = await reviewCards.nth(0).innerText();
    expect(dentalReviewText).toContain('Smile Studio Dental Clinic');

    // 7. Click Pet Clinic & verify auto-fill
    await petBtn.click();
    await page.waitForTimeout(400);
    await expect(storeInput).toHaveValue('Paws & Care Veterinary Clinic');
    const petReviewText = await reviewCards.nth(0).innerText();
    expect(petReviewText).toContain('Paws & Care Veterinary Clinic');

    // 8. Switch back to Food & Dining and test Pizza & Non-Veg
    await page.locator('button:has-text("Food & Dining")').click();
    await page.waitForTimeout(400);

    const pizzaBtn = page.locator('button:has-text("Pizza Restaurant & Pizzeria")');
    await expect(pizzaBtn).toBeVisible();
    await pizzaBtn.click();
    await page.waitForTimeout(400);
    await expect(storeInput).toHaveValue('Artisan Wood-Fired Pizzeria');

    const nonVegBtn = page.locator('button:has-text("Non-Veg Restaurant & Biryani House")');
    await expect(nonVegBtn).toBeVisible();
    await nonVegBtn.click();
    await page.waitForTimeout(400);
    await expect(storeInput).toHaveValue('Lazeez Biryani & Kebabs');

    // 9. Capture screenshot proof
    await page.screenshot({ path: 'scratch/free_review_generator_taxonomy_verified.png' });
    console.log('[E2E Ground-Truth] Captured scratch/free_review_generator_taxonomy_verified.png');
  });
});
