import { test, expect } from './fixtures/hardened-test';

test.describe('Strict Allowlist Contract Tests (Proving Every Entry is Active & Gated)', () => {
  // Allowlist Entry 1: /api/auth/me -> 401
  test('Allowlist Entry 1: Legitimate Unauthenticated Probe (/api/auth/me -> 401) is Allowed', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/auth/me' && !url.search) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Guest session' })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/google-business-profile-ranking');
    const status = await page.evaluate(async () => {
      const res = await fetch('/api/auth/me');
      return res.status;
    });

    expect(status).toBe(401);
  });

  // Allowlist Entry 2: /api/auth/logout -> 401
  test('Allowlist Entry 2: Explicit Logout Probe (/api/auth/logout -> 401) is Allowed', async ({ page }) => {
    await page.route('**/api/auth/logout', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/auth/logout' && !url.search) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'No active session to logout' })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/google-business-profile-ranking');
    const status = await page.evaluate(async () => {
      const res = await fetch('/api/auth/logout');
      return res.status;
    });

    expect(status).toBe(401);
  });

  // Allowlist Entry 3: /favicon.ico -> 404
  test('Allowlist Entry 3: Browser Icon Fallback (/favicon.ico -> 404) is Allowed', async ({ page }) => {
    await page.goto('/google-business-profile-ranking');
    const status = await page.evaluate(async () => {
      const res = await fetch('/favicon.ico');
      return res.status;
    });

    expect(status).toBe(404);
  });
});
