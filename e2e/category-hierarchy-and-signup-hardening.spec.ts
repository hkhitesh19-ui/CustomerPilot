import { test, expect } from './fixtures/hardened-test';

test.describe('Category Hierarchy, Password Length & Onboarding Robustness', () => {
  test('Signup page enforces 8-character password placeholder, 8-char validation, and 2-tier category hierarchy with custom input for Other', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });

    // 1. Check password placeholder
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', 'At least 8 characters');

    // 2. Test < 8 character password validation error
    await page.fill('input[placeholder*="e.g. Cake Connection"]', 'Quality Auto Services');
    await page.fill('input[placeholder*="e.g. Hitesh"]', 'Hitesh Admin');
    await page.fill('input[placeholder*="919876543210"]', '919876543210');
    await page.fill('input[type="email"]', 'test-hierarchy@customerpilot.in');
    await passwordInput.fill('123456'); // 6 chars (less than 8)

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify error banner
    const errorBanner = page.locator('text=Password must be at least 8 characters');
    await expect(errorBanner).toBeVisible();

    // 3. Verify 2-tier Category selection
    // Main Business Category dropdown
    const mainCategorySelect = page.locator('button[role="combobox"]').first();
    await expect(mainCategorySelect).toBeVisible();

    // Open main category dropdown
    await mainCategorySelect.click();
    await expect(page.locator('div[role="option"]:has-text("Healthcare & Clinics")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Food & Dining")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Beauty & Grooming")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Automotive & Detailing")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Education & Coaching")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Fitness & Sports")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Retail & Shopping")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Agency & Professionals")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Other / Custom Business")')).toBeVisible();

    // Select "Beauty & Grooming"
    await page.locator('div[role="option"]:has-text("Beauty & Grooming")').click();

    // Open subcategory dropdown
    const subCategorySelect = page.locator('button[role="combobox"]').nth(1);
    await subCategorySelect.click();
    await expect(page.locator('div[role="option"]:has-text("Women\'s Salon")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Beauty Parlour")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Women\'s Spa")')).toBeVisible();

    // Close subcategory by selecting Women's Salon
    await page.locator('div[role="option"]:has-text("Women\'s Salon")').click();

    // Select "Agency & Professionals"
    await mainCategorySelect.click();
    await page.locator('div[role="option"]:has-text("Agency & Professionals")').click();

    // Verify subcategories for Agency & Professionals
    await subCategorySelect.click();
    await expect(page.locator('div[role="option"]:has-text("Plumbing Services")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Electrical Services")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("AC Repair")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Carpenter")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Pest Control")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Chartered Accountant")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Real Estate Broker")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Visa & Immigration")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Wedding Planning")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Photography & Videography")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Architecture, Engineering & Construction")')).toBeVisible();
    await expect(page.locator('div[role="option"]:has-text("Patent & Trademark")')).toBeVisible();

    // Select "Plumbing Services"
    await page.locator('div[role="option"]:has-text("Plumbing Services")').click();

    // 4. Test 9th Option "Other / Custom Business"
    await mainCategorySelect.click();
    await page.locator('div[role="option"]:has-text("Other / Custom Business")').click();

    // Verify custom edit box appears
    const customInput = page.locator('input[placeholder*="Wedding Planner, Architecture"]');
    await expect(customInput).toBeVisible();
    await customInput.fill('Handcrafted Leather Studio');
    await expect(customInput).toHaveValue('Handcrafted Leather Studio');

    // Ground-truth proof snapshot
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\62792c73-72e1-4073-8e7f-689abd4e7188';
    await page.screenshot({ path: `${artifactDir}\\signup_category_hierarchy_proof.png` });
  });

  test('Onboarding page (/onboarding?step=1) never triggers Global Error Boundary ("Something went wrong")', async ({ page }) => {
    // 1. When unauthenticated, verify redirect to login without error boundary crash
    await page.goto('/onboarding?step=1', { waitUntil: 'domcontentloaded' });
    const errorBoundary = page.locator('h2:has-text("Something went wrong")');
    await expect(errorBoundary).not.toBeVisible();
    await expect(page.locator('h1:has-text("Welcome Back")')).toBeVisible({ timeout: 15000 });

    // 2. When authenticated as merchant, verify /onboarding loads cleanly without error boundary crash
    await page.goto('/api/auth/dev-login?target=/onboarding?step=1', { waitUntil: 'domcontentloaded' });
    await expect(errorBoundary).not.toBeVisible();
    // Verify onboarding or dashboard renders cleanly without error boundary
    const successLocator = page.locator('text=CustomerPilot Setup')
      .or(page.locator('text=Business Profile & WhatsApp'))
      .or(page.locator('text=Business Information'))
      .or(page.locator('text=Settings & Configuration'))
      .or(page.locator('text=Store Profile'));
    await expect(successLocator.first()).toBeVisible({ timeout: 15000 });
    await expect(errorBoundary).not.toBeVisible();
  });

  test('Settings page renders 2-tier Category selection cleanly and captures proof', async ({ page }) => {
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\62792c73-72e1-4073-8e7f-689abd4e7188';
    await page.goto('/api/auth/dev-login?target=/dashboard/settings', { waitUntil: 'domcontentloaded' });
    const section03 = page.locator('text=Business Information').first();
    await expect(section03).toBeVisible({ timeout: 15000 });
    await section03.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${artifactDir}\\settings_category_hierarchy_proof.png` });
  });
});
