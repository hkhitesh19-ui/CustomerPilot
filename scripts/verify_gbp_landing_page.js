const { chromium } = require("playwright")

async function verifyGbpLandingPage() {
  console.log("=== Playwright GBP Landing Page Verification ===")
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    console.log("Navigating to http://localhost:3000/google-business-profile-ranking...")
    await page.goto("http://localhost:3000/google-business-profile-ranking", { timeout: 45000, waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle", { timeout: 45000 })
    
    // Check title
    const title = await page.title()
    console.log("Page Title:", title)

    // Check heading
    const h1 = await page.locator("h1").innerText()
    console.log("H1 Headline:", h1)

    // Verify SGE Direct Answer exists
    const sgeSnippet = await page.locator("text=Google SGE & Voice Search Direct Answer Snippet").isVisible()
    console.log("SGE Snippet Visible:", sgeSnippet)

    // Test Hero button "Run Free 100-Point Audit Now" click!
    console.log("Testing Hero Button 'Run Free 100-Point Audit Now' click...")
    const heroBtn = page.locator("button:has-text('Run Free 100-Point Audit Now')")
    await heroBtn.click()

    // Wait for audit scorecard result from Hero click
    console.log("Waiting for audit scorecard result triggered by Hero button...")
    await page.waitForSelector("text=6-Pillar Deep Audit Breakdown", { timeout: 20000 })
    console.log("✓ Audit Result rendered successfully from Hero button click!")

    // Verify Scorecard
    const scoreText = await page.locator("text=/100").innerText()
    console.log("Scorecard Text:", scoreText)

    // Verify Competitor Matrix
    const compMatrix = await page.locator("text=Local Pack Competitor Benchmark").isVisible()
    console.log("Competitor Matrix Visible:", compMatrix)

    // Now test Preset Demo click: "Aura Unisex Salon"
    console.log("Testing Preset Demo Click: 'Aura Unisex Salon'...")
    const presetBtn = page.locator("button:has-text('Aura Unisex Salon')")
    await presetBtn.click()

    // Wait for updated audit result heading
    await page.waitForTimeout(3000)
    const salonHeading = await page.locator("h3:has-text('Aura Unisex Salon')").isVisible()
    console.log("✓ Aura Unisex Salon Audit Visible:", salonHeading)

    // Test form submit button explicitly
    console.log("Testing Form Submit Button explicitly...")
    const submitBtn = page.locator("button:has-text('Run Free 100-Point Audit & Competitor Scan')")
    await submitBtn.click()
    await page.waitForTimeout(3000)
    console.log("✓ Form Submit Button executed smoothly!")

    // Capture visual screenshot
    await page.screenshot({ path: "scratch/gbp_landing_page_verified.png", fullPage: true })
    console.log("✓ Full page screenshot saved to scratch/gbp_landing_page_verified.png")

  } catch (err) {
    console.error("Test Error:", err.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

verifyGbpLandingPage()
