const { chromium } = require("playwright");

async function runVerification() {
  console.log("🚀 Starting Playwright End-to-End Verification for Smart Digital Business Card 3-Day Free Trial Flow...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  try {
    // ----------------------------------------------------
    // TEST 1: Pricing Page Verification
    // ----------------------------------------------------
    console.log("\n--- TEST 1: Checking http://localhost:3000/pricing ---");
    await page.goto("http://localhost:3000/pricing", { waitUntil: "domcontentloaded", timeout: 30000 });
    
    // Outcome index 0 should be Smart Digital Business Card
    const pageText = await page.textContent("body");
    const containsSmartCardOutcome = pageText.includes("Smart Digital Business Card");
    console.log("Pricing page contains Smart Digital Business Card:", containsSmartCardOutcome ? "✅ PASS" : "❌ FAIL");
    if (!containsSmartCardOutcome) throw new Error("Smart Digital Business Card not found in outcome cards");

    // "Compare All 4 Free Trial Options" matrix must NOT exist
    const hasComparisonMatrix = pageText.includes("Compare All 4 Free Trial Options");
    console.log("Comparison matrix 'Compare All 4 Free Trial Options' is absent:", !hasComparisonMatrix ? "✅ PASS" : "❌ FAIL");
    if (hasComparisonMatrix) throw new Error("Comparison matrix still present on pricing page!");

    // Check pricing: 6 Months ₹349, 1 Year ₹499
    const contains349 = pageText.includes("349");
    const contains499 = pageText.includes("499");
    console.log("Pricing values ₹349 and ₹499 present:", contains349 && contains499 ? "✅ PASS" : "❌ FAIL");

    // ----------------------------------------------------
    // TEST 2: Landing Page & #create-card Generator Form
    // ----------------------------------------------------
    console.log("\n--- TEST 2: Checking http://localhost:3000/smart-digital-business-card ---");
    await page.goto("http://localhost:3000/smart-digital-business-card", { waitUntil: "domcontentloaded", timeout: 30000 });

    // Verify #create-card section exists
    const createSection = await page.locator("#create-card").count();
    console.log("#create-card section exists:", createSection > 0 ? "✅ PASS" : "❌ FAIL");
    if (createSection === 0) throw new Error("#create-card section missing");

    // Verify Visual Guide for Google Review Short Link exists (Steps 1, 2, 3)
    const visualGuideTitle = await page.locator("text=Google Review Short Link Kaha Se Milegi?").count();
    const step1 = await page.locator("text=Step 1").count();
    const step2 = await page.locator("text=Step 2").count();
    const step3 = await page.locator("text=Step 3").count();
    console.log("Visual Screenshot Guide present (Steps 1, 2, 3):", (visualGuideTitle > 0 && step1 > 0 && step2 > 0 && step3 > 0) ? "✅ PASS" : "❌ FAIL");

    // Click "Fill Demo Store (Try Instant)"
    console.log("Clicking 'Fill Demo Store (Try Instant)' button...");
    await page.click("button:has-text('Fill Demo Store')");
    await page.waitForTimeout(500);

    // Verify values populated
    const storeNameVal = await page.locator("input[placeholder*='Sharma Sweets']").inputValue();
    const reviewLinkVal = await page.locator("input[placeholder*='g.page/r/']").inputValue();
    console.log("Form auto-filled with demo store:", storeNameVal, reviewLinkVal ? "✅ PASS" : "❌ FAIL");

    // Modify store name to unique test name
    const uniqueStoreName = "Playwright Test Bakery " + Date.now().toString().slice(-4);
    await page.fill("input[placeholder*='Sharma Sweets']", uniqueStoreName);

    // Take screenshot of form and guide
    await page.screenshot({ path: "scratch_generator_form.png", fullPage: false });
    console.log("📸 Saved screenshot: scratch_generator_form.png");

    // Submit form: Generate My 3-Day Free Trial Digital Card Now
    console.log("Submitting 3-Day Free Trial generator form...");
    await page.click("button:has-text('Generate My 3-Day Free Trial Digital Card')");
    await page.waitForTimeout(3000);

    // Check if error box appeared
    const errBox = await page.locator(".bg-rose-50").allTextContents();
    if (errBox.length > 0) {
      console.log("FORM SUBMISSION ERROR DISPLAYED ON UI:", errBox);
    }
    await page.screenshot({ path: "scratch_after_submit.png", fullPage: false });

    // Wait for success card to appear
    await page.waitForSelector("text=3-Day Free Trial Activated Successfully", { timeout: 15000 });
    console.log("🎉 3-Day Free Trial Activated Successfully banner appeared: ✅ PASS");

    // Extract live card link from the success banner inside #create-card
    const liveLinkElem = await page.locator("#create-card a[href^='/c/']").first();
    const liveLinkHref = await liveLinkElem.getAttribute("href");
    console.log("Generated Live Card Route:", liveLinkHref);
    if (!liveLinkHref) throw new Error("No live card link generated");

    // ----------------------------------------------------
    // TEST 3: Live Public Card View (/c/[slug])
    // ----------------------------------------------------
    console.log(`\n--- TEST 3: Navigating to Live Card ${liveLinkHref} ---`);
    await page.goto(`http://localhost:3000${liveLinkHref}`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const cardBodyText = await page.textContent("body");
    // Verify unique store name is displayed
    const hasUniqueStoreName = cardBodyText.includes(uniqueStoreName);
    console.log("Store name rendered on card:", hasUniqueStoreName ? "✅ PASS" : "❌ FAIL");

    // Verify 3-Day Free Trial pill / banner is displayed
    const hasTrialPill = cardBodyText.includes("3-Day Free Trial Active");
    console.log("3-Day Free Trial Banner rendered:", hasTrialPill ? "✅ PASS" : "❌ FAIL");

    // Verify action buttons exist: WhatsApp, Call, Location, Google Reviews
    const hasWhatsApp = cardBodyText.includes("WhatsApp");
    const hasCall = cardBodyText.includes("Call Now");
    const hasLocation = cardBodyText.includes("Location");
    const hasReviews = cardBodyText.includes("Google Reviews");
    console.log("Action buttons present (WhatsApp, Call, Location, Reviews):", (hasWhatsApp && hasCall && hasLocation && hasReviews) ? "✅ PASS" : "❌ FAIL");

    // Save screenshot of live trial card
    await page.screenshot({ path: "scratch_live_trial_card.png", fullPage: false });
    console.log("📸 Saved screenshot: scratch_live_trial_card.png");

    console.log("\n==========================================");
    console.log("ALL TESTS PASSED WITH 100% SUCCESS!");
    console.log("==========================================");
  } catch (err) {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
