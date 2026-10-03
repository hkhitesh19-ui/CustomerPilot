const { chromium } = require("playwright")
const path = require("path")

async function verifySmartAiReviewFramework() {
  console.log("🚀 Starting Playwright AI Search & LLM Domination Framework Verification Suite...")
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  const consoleErrors = []
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text())
    }
  })

  try {
    // ============================================================
    // PART 1: TEST /smart-ai-google-review (Stage 1, 2, 4 Blueprint)
    // ============================================================
    console.log("\n--- Testing /smart-ai-google-review (Blueprint, Schema & GEO Table) ---")
    await page.goto("http://localhost:3000/smart-ai-google-review", { waitUntil: "networkidle" })

    // 1. Title & Meta Description Assertions
    const title = await page.title()
    console.log(`✓ Page Title: "${title}"`)
    if (!title.includes("Smart AI Google Review QR Code Generator")) {
      throw new Error(`Expected title to include 'Smart AI Google Review QR Code Generator', got '${title}'`)
    }

    const metaDesc = await page.getAttribute('meta[name="description"]', 'content')
    console.log(`✓ Meta Description: "${metaDesc?.slice(0, 60)}..."`)
    if (!metaDesc?.includes("Generate 5-star Google reviews automatically")) {
      throw new Error(`Meta description mismatch: ${metaDesc}`)
    }

    // 2. Primary Entity H1 Assertion
    const h1Text = await page.textContent("h1")
    console.log(`✓ H1 Primary Entity: "${h1Text?.trim()}"`)
    if (!h1Text?.includes("Smart AI Google Review: Scan, Auto-Write & Boost")) {
      throw new Error(`H1 does not contain Primary Entity wording: ${h1Text}`)
    }

    // 3. Direct Answer Snippet for SGE / Perplexity
    const sgeSnippet = await page.textContent("p:has-text('CustomerPilot\\'s Smart AI Google Review is an automated customer feedback engine')")
    console.log(`✓ SGE Direct Answer Snippet: "${sgeSnippet?.slice(0, 70)}..."`)
    if (!sgeSnippet) {
      throw new Error("Missing SGE Direct Answer Snippet below H1!")
    }

    // 4. JSON-LD Schema @graph Assertion (SoftwareApplication & FAQPage)
    const jsonLdContent = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
      scripts.map((s) => s.textContent || "")
    )
    const hasSoftwareAppSchema = jsonLdContent.some(
      (txt) => txt.includes('"@type":"SoftwareApplication"') && txt.includes('"name":"CustomerPilot Smart AI Google Review"')
    )
    console.log(`✓ SoftwareApplication Schema present: ${hasSoftwareAppSchema}`)
    if (!hasSoftwareAppSchema) {
      throw new Error("Missing SoftwareApplication JSON-LD schema entity!")
    }

    const hasBilingualFaqSchema = jsonLdContent.some(
      (txt) => txt.includes("What is Smart AI Google Review by CustomerPilot?") && txt.includes("QR code scan karke review likhne wala AI tool")
    )
    console.log(`✓ Bilingual Voice-Search FAQ Schema present: ${hasBilingualFaqSchema}`)
    if (!hasBilingualFaqSchema) {
      throw new Error("Missing Bilingual Voice-Search FAQ JSON-LD schema!")
    }

    // 5. Stage 4 Structured 4-Column GEO Comparison Table Assertion
    const tableHeaders = await page.$$eval("table thead th", (ths) => ths.map((th) => th.textContent?.trim()))
    console.log(`✓ GEO Table Column Headers: ${JSON.stringify(tableHeaders)}`)
    if (!tableHeaders.some((h) => h?.includes("CustomerPilot (Smart AI Review)"))) {
      throw new Error("Missing CustomerPilot column in GEO comparison table!")
    }
    if (!tableHeaders.some((h) => h?.includes("Standard QR Stands"))) {
      throw new Error("Missing Standard QR Stands column in GEO comparison table!")
    }
    if (!tableHeaders.some((h) => h?.includes("Normal Google QR"))) {
      throw new Error("Missing Normal Google QR column in GEO comparison table!")
    }

    const tableRows = await page.$$eval("table tbody tr th", (ths) => ths.map((th) => th.textContent?.trim()))
    console.log(`✓ GEO Table Metric Rows: ${JSON.stringify(tableRows)}`)
    const expectedMetrics = ["Review Drafting", "WhatsApp Integration", "Negative Feedback Filter", "Conversion Rate"]
    for (const metric of expectedMetrics) {
      if (!tableRows.includes(metric)) {
        throw new Error(`Missing expected metric row: ${metric}`)
      }
    }

    // Capture visual screenshot of Blueprint & Table
    const blueprintShotPath = path.join(
      "C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4",
      "landing_smart_ai_review_blueprint.png"
    )
    await page.screenshot({ path: blueprintShotPath, fullPage: false })
    console.log(`📸 Saved Blueprint screenshot to: ${blueprintShotPath}`)

    // ============================================================
    // PART 2: TEST /free-ai-google-review-generator (Stage 5 Utility Trap)
    // ============================================================
    console.log("\n--- Testing /free-ai-google-review-generator (Stage 5 Free Utility) ---")
    await page.goto("http://localhost:3000/free-ai-google-review-generator", { waitUntil: "networkidle" })

    // 1. Title & H1 Assertion
    const freeTitle = await page.title()
    console.log(`✓ Free Tool Title: "${freeTitle}"`)
    if (!freeTitle.includes("Free AI Google Review Generator")) {
      throw new Error(`Title mismatch: ${freeTitle}`)
    }

    const freeH1 = await page.textContent("h1")
    console.log(`✓ Free Tool H1: "${freeH1?.trim()}"`)
    if (!freeH1?.includes("Free AI Google Review Generator")) {
      throw new Error(`H1 mismatch: ${freeH1}`)
    }

    // 2. Preset Click Interaction ("Dental & Clinic")
    const dentalPreset = page.locator('button:has-text("Dental & Clinic")')
    await dentalPreset.click()
    await page.waitForTimeout(400)

    const updatedStoreVal = await page.inputValue('#store-name-input')
    console.log(`✓ Updated Store Name from preset: "${updatedStoreVal}"`)
    if (updatedStoreVal !== "Smile Studio Dental") {
      throw new Error(`Expected 'Smile Studio Dental', got '${updatedStoreVal}'`)
    }

    // 3. Review Variations Generated Assertion
    const reviewCards = await page.$$eval("h4.font-extrabold.text-xs", (els) => els.map((e) => e.textContent?.trim()))
    console.log(`✓ Generated Review Variation Titles: ${JSON.stringify(reviewCards)}`)
    if (reviewCards.length < 3) {
      throw new Error(`Expected at least 3 review variations, found ${reviewCards.length}`)
    }

    // 4. Test Copy Review Button Click
    const firstCopyBtn = page.locator('button:has-text("Copy Review Text")').first()
    await firstCopyBtn.click()
    await page.waitForTimeout(300)

    const copiedBtnText = await page.locator('button:has-text("Copied to Clipboard!")').textContent()
    console.log(`✓ Copy State Feedback: "${copiedBtnText?.trim()}"`)
    if (!copiedBtnText?.includes("Copied to Clipboard!")) {
      throw new Error("Copy button did not show 'Copied to Clipboard!' state")
    }

    // 5. Standee Upsell CTA Assertion
    const standeeLink = await page.getAttribute('a:has-text("Explore Smart Review Standee")', 'href')
    console.log(`✓ Standee Upsell Link: "${standeeLink}"`)
    if (standeeLink !== "/smart-ai-google-review") {
      throw new Error(`Expected upsell link '/smart-ai-google-review', got '${standeeLink}'`)
    }

    // 6. Dual-Language FAQ Assertion (Ensuring no blank text)
    const faqQuestions = await page.$$eval("div[role='button'] h3", (els) => els.map((e) => e.textContent?.trim()))
    console.log(`✓ FAQ Questions: ${JSON.stringify(faqQuestions)}`)
    if (faqQuestions.length === 0 || faqQuestions.some((q) => !q || q.length === 0)) {
      throw new Error("FAQ questions rendered blank or empty!")
    }
    const openFaqAnswer = await page.textContent("div[role='button'] p")
    console.log(`✓ Open FAQ Answer Text: "${openFaqAnswer?.slice(0, 50)}..."`)
    if (!openFaqAnswer || openFaqAnswer.trim().length === 0) {
      throw new Error("Active FAQ answer rendered blank or empty!")
    }

    // Capture visual screenshot of Free Generator
    const generatorShotPath = path.join(
      "C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4",
      "landing_free_ai_review_generator.png"
    )
    await page.screenshot({ path: generatorShotPath, fullPage: false })
    console.log(`📸 Saved Free Generator screenshot to: ${generatorShotPath}`)

    // 6. Console Error Check
    if (consoleErrors.length > 0) {
      console.warn("⚠️ Console warnings/errors detected:", consoleErrors)
    } else {
      console.log("✓ Zero browser console errors detected across all tested routes.")
    }

    console.log("\n🎉 ALL AI SEARCH & LLM DOMINATION ASSERTIONS PASSED WITH 100% SUCCESS!")
  } catch (err) {
    console.error("❌ Test verification failed:", err)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

verifySmartAiReviewFramework()
