const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function verifyPricingCheckoutModal() {
  console.log("Launching headless browser to verify Pricing Checkout Modal & Razorpay flow...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log("Navigating to http://localhost:3000/pricing...");
    const res = await page.goto("http://localhost:3000/pricing", { waitUntil: "domcontentloaded", timeout: 15000 });
    if (res.status() !== 200) {
      throw new Error(`Expected HTTP 200, got ${res.status()}`);
    }
    console.log("✅ PASS: Pricing page loaded with HTTP 200");

    // 1. Scroll to Standalone modules table
    console.log("Scrolling to Standalone modules table...");
    const standaloneHeading = page.locator("text=Standalone modules").first();
    await standaloneHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 2. Click Add on Digital Loyalty Stamps & VIP Club 1 Year (₹1,499)
    console.log("Selecting Digital Loyalty Stamps 1 Year (₹1,499)...");
    const loyaltyRow = page.locator("tr", { hasText: "Digital Loyalty Stamps & VIP Club" });
    const add1YrButton = loyaltyRow.locator("button:has-text('Add')").nth(1); // 2nd Add button is 1 Year
    await add1YrButton.click();
    await page.waitForTimeout(800);

    // 3. Verify sticky bottom bar
    const bottomBar = page.locator("text=1 selected");
    await bottomBar.waitFor({ state: "visible", timeout: 5000 });
    const bottomBarText = await page.locator(".fixed.bottom-0").textContent();
    console.log("Bottom Bar Text:", bottomBarText);
    if (!bottomBarText.includes("₹1,499") || !bottomBarText.includes("Continue →")) {
      throw new Error(`Sticky bottom bar missing ₹1,499 or Continue button: ${bottomBarText}`);
    }
    console.log("✅ PASS: Sticky bottom bar displays '1 selected · ₹1,499' and 'Continue →'");

    // 4. Click Continue →
    console.log("Clicking Continue → to open Checkout Activation Modal...");
    const continueBtn = page.locator(".fixed.bottom-0 button:has-text('Continue →')");
    await continueBtn.click({ force: true });
    await page.waitForTimeout(1200);

    // 5. Verify CheckoutActivationModal
    const modalTitle = page.locator("text=Complete Order & Activate Account");
    await modalTitle.waitFor({ state: "visible", timeout: 5000 });
    console.log("✅ PASS: CheckoutActivationModal opened with title 'Complete Order & Activate Account'");

    // Verify modal items and total
    const modalContent = await page.locator("[role='dialog']").textContent();
    if (!modalContent.includes("Digital Loyalty Stamps & VIP Club") || !modalContent.includes("₹1,499")) {
      throw new Error(`Modal missing selected item or price: ${modalContent}`);
    }
    console.log("✅ PASS: Modal displays selected item and Total Payable Amount ₹1,499");

    // Verify Tab 1: Quick Signup & Pay
    const payButton = page.locator("button:has-text('Pay ₹1,499 via Razorpay & Open Account')");
    await payButton.waitFor({ state: "visible", timeout: 3000 });
    console.log("✅ PASS: Quick Signup & Pay form has 'Pay ₹1,499 via Razorpay & Open Account' action");

    // Capture screenshot of Signup tab modal
    const screenshotDir = "C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4";
    const modalSignupPath = path.join(screenshotDir, "verified_pricing_checkout_modal_signup.png");
    await page.screenshot({ path: modalSignupPath, fullPage: false });
    console.log(`Saved modal signup screenshot to: ${modalSignupPath}`);

    // 6. Switch to Tab 2: Already Registered? Sign In
    console.log("Switching to 'Already Registered? Sign In' tab...");
    const signInTab = page.locator("button:has-text('Already Registered? Sign In')");
    await signInTab.click();
    await page.waitForTimeout(500);

    const signInPayBtn = page.locator("button:has-text('Sign In & Pay ₹1,499')");
    await signInPayBtn.waitFor({ state: "visible", timeout: 3000 });
    console.log("✅ PASS: Sign In & Pay tab has 'Sign In & Pay ₹1,499' button");

    const modalLoginPath = path.join(screenshotDir, "verified_pricing_checkout_modal_login.png");
    await page.screenshot({ path: modalLoginPath, fullPage: false });
    console.log(`Saved modal login screenshot to: ${modalLoginPath}`);

    // 7. Close modal and test Lifetime Deal button
    console.log("Testing Lifetime Deal checkout button...");
    const closeBtn = page.locator("[role='dialog'] button:has-text('Close')").or(page.locator("[role='dialog'] [data-slot='dialog-close']"));
    await closeBtn.first().click();
    await page.waitForTimeout(800);

    const lifetimeBtn = page.locator("button:has-text('Get Lifetime Deal →')");
    await lifetimeBtn.scrollIntoViewIfNeeded();
    await lifetimeBtn.click();
    await page.waitForTimeout(1000);

    const modalLifetimeContent = await page.locator("[role='dialog']").textContent();
    if (!modalLifetimeContent.includes("Lifetime Deal") || !modalLifetimeContent.includes("₹1,499")) {
      throw new Error(`Modal missing Lifetime Deal or ₹1,499 price: ${modalLifetimeContent}`);
    }
    console.log("✅ PASS: Lifetime Deal opens CheckoutActivationModal with ₹1,499");

    console.log("\n==========================================");
    console.log("🎉 ALL CHECKOUT & PAYMENT MODAL TESTS PASSED!");
    console.log("==========================================\n");

  } catch (err) {
    console.error("❌ TEST FAILED:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyPricingCheckoutModal();
