import { test, expect } from './fixtures/hardened-test';

test.describe('Hybrid Web Check-In & Digital Card Zero-Drop Verification', () => {
  test('Cake Connection Digital Card links Loyalty Stamps CTA to /checkin and Check-In renders real store ground truth', async ({ page, errorLogs }) => {
    test.setTimeout(120000);

    // 1. Open Cake Connection Digital Business Card
    await page.goto('/c/cake-connection', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toContainText(/Cake Connection/i, { timeout: 30000 });

    const bodyText = (await page.locator('body').innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(100);
    expect(bodyText).toContain('Cake Connection');

    // Assert zero dummy placeholders anywhere on rendered page
    const lowerBody = bodyText.toLowerCase();
    expect(lowerBody).not.toContain('98765');
    expect(lowerBody).not.toContain('12345');
    expect(lowerBody).not.toContain('example.com');
    expect(lowerBody).not.toContain('lorem ipsum');

    // 2. Verify Loyalty Stamps CTA routes to /checkin instead of raw wa.me
    const loyaltyLink = page.locator('a', { hasText: 'Loyalty Stamps' }).first();
    await expect(loyaltyLink).toBeVisible();
    const href = await loyaltyLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('/checkin?m=cmtymavfx0002kx008lbfvp57');

    // 3. Navigate to /checkin via CTA click
    await Promise.all([
      page.waitForURL('**/checkin?**', { timeout: 30000 }),
      loyaltyLink.click(),
    ]);

    // Wait for store metadata hydration
    await expect(page.locator('h1').first()).toContainText(/Cake Connection/i, { timeout: 30000 });
    await expect(page.locator('text=Check In to Collect Stamps')).toBeVisible({ timeout: 30000 });

    const checkinText = (await page.locator('body').innerText()).toLowerCase();
    expect(checkinText).not.toContain('98765');
    expect(checkinText).not.toContain('12345');
    expect(checkinText).not.toContain('example.com');
    expect(checkinText).not.toContain('lorem ipsum');

    // 4. Visual Truncation Check — ensure primary buttons/headers are not clipped with ellipsis
    const clippedElements = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('button, a, h1, h2'));
      return els
        .filter((el) => {
          const style = window.getComputedStyle(el);
          return style.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 2;
        })
        .map((el) => el.textContent?.trim() || '');
    });
    expect(clippedElements).toEqual([]);

    // 5. Intercept POST /api/queue/web-checkin to verify full ticket UX cleanly without polluting dev DB
    await page.route('**/api/queue/web-checkin', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            data: {
              queueId: 'wc_e2e_test_1',
              customerId: 'cust_e2e_1',
              customerName: 'E2E Guest',
              phone: '919033304707',
              position: 1,
              expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              alreadyWaiting: false,
              isNewCustomer: false,
              merchantId: 'cmtymavfx0002kx008lbfvp57',
              merchantName: 'Cake Connection',
              waConfirmUrl: 'https://wa.me/917203824012?text=Hi%20Cake%20Connection!%20VIP%20Check-in%20Done%20%E2%9C%85',
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.fill('#checkin-phone', '9033304707');
    await page.fill('#checkin-name', 'E2E Guest');
    await page.getByRole('button', { name: /Check In & Earn VIP Stamps/i }).click();

    await expect(page.getByText(/You're in the Live Queue!/i)).toBeVisible();
    await expect(page.getByText('#1')).toBeVisible();
    await expect(page.getByText(/Open WhatsApp Confirmation/i)).toBeVisible();

    await page.screenshot({ path: 'scratch/web_checkin_verified.png', fullPage: true });

    // Confirm ZERO trapped console/page/network errors
    expect(errorLogs).toEqual([]);
  });
});
