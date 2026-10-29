import { test, expect } from '../fixtures/hardened-test';

test.describe('Hardened Error Trap Multi-Vector Mutation Proofs (6 Vectors)', () => {
  // Vector 1: Trap must catch uncaught console.error
  test('Vector 1: Deliberate Console Error Must Trigger Trap Failure', async ({ page }) => {
    await page.goto('/google-business-profile-ranking');
    await page.evaluate(() => {
      console.error('PROBE_MUTATION_CONSOLE_ERROR: Deliberate JavaScript Syntax/Runtime Simulation');
    });
  });

  // Vector 2: Trap must catch unexpected HTTP 500 server crash
  test('Vector 2: Unexpected HTTP 500 API Crash Must Trigger Trap Failure', async ({ page }) => {
    await page.route('**/api/gbp/audit', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'PROBE_MUTATION_500: Database connection crashed' })
      });
    });

    await page.goto('/google-business-profile-ranking');
    const heroBtn = page.locator('button:has-text("Run Free 100-Point Audit Now")');
    await heroBtn.click();
    await page.waitForTimeout(2000);
  });

  // Vector 3: Trap must catch unwhitelisted 401 near-miss / query parameter bypass attempt
  test('Vector 3: Unwhitelisted 401 Near-Miss Query Param Must Trigger Trap Failure', async ({ page }) => {
    await page.route('**/api/auth/me?unauthorized_admin_probe=1', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'PROBE_MUTATION_NEAR_MISS_401: Unauthorized access' })
      });
    });

    await page.goto('/google-business-profile-ranking');
    await page.evaluate(() => {
      fetch('/api/auth/me?unauthorized_admin_probe=1').catch(() => {});
    });
    await page.waitForTimeout(1000);
  });

  // Vector 4: Trap must catch true uncaught exception / pageerror
  test('Vector 4: True Uncaught Page Exception (pageerror) Must Trigger Trap Failure', async ({ page }) => {
    await page.goto('/google-business-profile-ranking');
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('PROBE_MUTATION_PAGEERROR: Unhandled runtime exception in window event loop');
      }, 50);
    });
    await page.waitForTimeout(500);
  });

  // Vector 5: Trap must catch network-level dropped / aborted requests (requestfailed)
  test('Vector 5: Dropped Network Request (requestfailed) Must Trigger Trap Failure', async ({ page }) => {
    await page.route('**/api/telemetry/probe', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/google-business-profile-ranking');
    await page.evaluate(() => {
      fetch('/api/telemetry/probe').catch(() => {});
    });
    await page.waitForTimeout(500);
  });

  // Vector 6: Trap must catch foreign host matching internal path (Origin check)
  test('Vector 6: Foreign Origin 401 Bypass Probe Must Trigger Trap Failure', async ({ page }) => {
    await page.route('https://untrusted-foreign-host.com/api/auth/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'PROBE_MUTATION_FOREIGN_HOST_401' })
      });
    });

    await page.goto('/google-business-profile-ranking');
    await page.evaluate(() => {
      fetch('https://untrusted-foreign-host.com/api/auth/me').catch(() => {});
    });
    await page.waitForTimeout(500);
  });
});
