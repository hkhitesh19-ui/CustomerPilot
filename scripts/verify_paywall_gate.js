const { PrismaClient } = require('@prisma/client');
const { chromium } = require('playwright');

async function testPaywallGate() {
  const prisma = new PrismaClient();
  try {
    const pastDate = new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString();
    await prisma.digitalBusinessCard.update({
      where: { slug: 'playwright-test-bakery-9759' },
      data: { theme: JSON.stringify({ isTrial: true, trialEndsAt: pastDate }) }
    });
    console.log("Card 'playwright-test-bakery-9759' updated with expired trial date.");

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/c/playwright-test-bakery-9759", { waitUntil: "domcontentloaded", timeout: 20000 });
    
    const bodyText = await page.textContent("body");
    const hasExpiredBadge = bodyText.includes("3-Day Free Trial Expired");
    const hasStarterPrice = bodyText.includes("349");
    const hasProPrice = bodyText.includes("499");
    const hasLifetimePrice = bodyText.includes("1,499");
    const hasWhatsAppSubscribe = bodyText.includes("WhatsApp");

    console.log("3-Day Free Trial Expired badge rendered:", hasExpiredBadge ? "✅ PASS" : "❌ FAIL");
    console.log("Subscription plans rendered (₹349, ₹499, ₹1,499):", (hasStarterPrice && hasProPrice && hasLifetimePrice) ? "✅ PASS" : "❌ FAIL");
    console.log("WhatsApp subscription button rendered:", hasWhatsAppSubscribe ? "✅ PASS" : "❌ FAIL");

    await page.screenshot({ path: "scratch_paywall_expired_card.png" });
    console.log("📸 Saved screenshot: scratch_paywall_expired_card.png");

    await browser.close();

    if (!hasExpiredBadge || !hasStarterPrice || !hasProPrice || !hasLifetimePrice) {
      throw new Error("Paywall assertions failed!");
    }
    console.log("\n✅ PAYWALL EXPIRATION GATE 100% VERIFIED!");
  } finally {
    await prisma.$disconnect();
  }
}

testPaywallGate().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
