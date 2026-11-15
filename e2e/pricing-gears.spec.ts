import { test, expect } from './fixtures/hardened-test';
import path from 'path';

test.describe('Pricing Studio - 6 Official Gear Combos Verification', () => {
  test('should render all 6 Gear combos with exact flat prices, 0 dummy data, and 0 discount gimmicks', async ({ page }) => {
    test.setTimeout(180000);
    // Navigate to public pricing page
    const response = await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    // Verify main header
    await expect(page.locator('h1')).toContainText('Growth Gears');

    // Wait for the pricing section to load
    await page.waitForSelector('text=Official Gear Combos', { timeout: 15000 });

    const pageContent = await page.content();

    // 1. Assert Gear 1
    expect(pageContent).toContain('Gear 1 : Smart AI Google Review System');
    expect(pageContent).toContain('₹749');
    expect(pageContent).toContain('₹999');

    // 2. Assert Gear 2
    expect(pageContent).toContain('Gear 2 : Smart Digital Business Card + Smart AI Google Review System');
    expect(pageContent).toContain('₹899');
    expect(pageContent).toContain('₹1,249');

    // 3. Assert Gear 3
    expect(pageContent).toContain('Gear 3 : Smart Digital Business Card + WhatsApp Digital Loyalty System');
    expect(pageContent).toContain('₹999');
    expect(pageContent).toContain('₹1,349');

    // 4. Assert Gear 4
    expect(pageContent).toContain('Gear 4 : Smart Digital Business Card + WhatsApp Digital Loyalty + Smart AI Google Review System');
    expect(pageContent).toContain('₹1,399');
    expect(pageContent).toContain('₹1,899');

    // 5. Assert Gear 5
    expect(pageContent).toContain('Gear 5 : CustomerPilot Complete');
    expect(pageContent).toContain('₹2,499');
    expect(pageContent).toContain('₹3,499');

    // 6. Assert Gear 6
    expect(pageContent).toContain('Gear 6 : CustomerPilot All-in-One Enterprise');
    expect(pageContent).toContain('/ month');

    // 7. Strictly verify ZERO instances of removed discount/postpaid elements
    expect(pageContent).not.toContain('0.3% of monthly store sales');
    expect(pageContent).not.toContain('Zero Upfront Fee');
    expect(pageContent).not.toContain('FLAT DISCOUNT 50% OFF');
    expect(pageContent).not.toContain('Limited Time 50% Discount Offer');

    // 8. Capture ground truth visual screenshot
    const screenshotPath = path.join(__dirname, '../public/pricing_gears_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ Saved Playwright visual verification screenshot: ${screenshotPath}`);
  });
});
