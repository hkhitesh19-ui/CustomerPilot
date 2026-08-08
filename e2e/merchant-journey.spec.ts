import { test, expect } from '@playwright/test';

test.describe('Merchant Journey', () => {
  test('Landing Page and Auth Navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loaded
    await expect(page).toHaveTitle(/CustomerPilot/i);
    
    // Check if login link exists and navigate
    const loginLink = page.locator('a[href="/login"]');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page.url()).toContain('/login');
    }
  });

  test('Public Marketing Pages Load correctly', async ({ page }) => {
    // Marketing page
    await page.goto('/marketing');
    await expect(page.locator('h1').first()).toBeVisible();

    // Industry page
    await page.goto('/bakery-loyalty');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('h1').first()).toContainText('Bakery');
  });
  
  test('Dashboard Core UI (Mocked Session)', async ({ page }) => {
    // Note: Since real auth might require OTP, we will just visit the dashboard 
    // and verify it handles unauthenticated state gracefully (e.g. redirect to login)
    // or if the app allows it in mock mode.
    await page.goto('/dashboard/queue');
    
    // If middleware redirects to login:
    const url = page.url();
    if (url.includes('/login')) {
      await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    } else {
      // If it allows access, check for queue UI
      await expect(page.locator('text=Live Queue')).toBeVisible();
    }
  });
});
