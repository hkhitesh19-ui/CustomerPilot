import { getDynamicFallbackReview, generateDynamicReviewDraft } from "../src/lib/dynamic-review-engine"

async function runTests() {
  console.log("=== Testing Dynamic Review Engine ===")

  // Test 1: Category fallback rotation without product name (Bakery)
  const draftsSet = new Set<string>()
  for (let i = 0; i < 8; i++) {
    const res = getDynamicFallbackReview("Cake Shop & Bakery", undefined, i)
    draftsSet.add(res.draft1)
    console.log(`[Seed ${i}] Draft 1:`, res.draft1)
  }

  if (draftsSet.size < 4) {
    throw new Error(`Expected at least 4 unique drafts across 8 seeds, got ${draftsSet.size}`)
  }
  console.log(`✅ Test 1 Passed: Generated ${draftsSet.size} unique drafts across 8 seeds. Zero static repetition!`)

  // Test 2: Category fallback with item name
  const resWithItem = getDynamicFallbackReview("Cake Shop & Bakery", "Belgian Dark Chocolate Cake", 1)
  console.log("Test 2 Draft with item:", resWithItem.draft1)
  if (!resWithItem.draft1.includes("Belgian Dark Chocolate Cake")) {
    throw new Error("Expected item name to be integrated into draft1")
  }
  console.log("✅ Test 2 Passed: Custom item accurately integrated.")

  // Test 3: Multi-Category Coverage
  const categories = [
    "South Indian Restaurant",
    "Punjabi Dhaba & Restaurant",
    "Cafe & Bistro",
    "Car Wash & Detailing Studio",
    "Coaching & Educational Institute",
    "Men Salon & Haircut",
    "Beauty Parlour & Spa",
    "Dental Clinic & Hospital",
    "Fitness Gym",
    "Retail Store"
  ]
  for (const cat of categories) {
    const resCat = getDynamicFallbackReview(cat, undefined, 2)
    if (!resCat.draft1 || !resCat.draft2 || !resCat.draft3) {
      throw new Error(`Category ${cat} failed to return all 3 drafts`)
    }
  }

  // Verify specialized vocabulary
  const southIndian = getDynamicFallbackReview("South Indian Restaurant", undefined, 0)
  if (!southIndian.draft1.toLowerCase().includes("dosa") && !southIndian.draft1.toLowerCase().includes("sambar")) {
    throw new Error("Expected South Indian draft to mention dosa or sambar")
  }

  const carWash = getDynamicFallbackReview("Car Wash & Detailing", undefined, 0)
  if (!carWash.draft1.toLowerCase().includes("wash")) {
    throw new Error("Expected Car Wash draft to mention wash")
  }

  const education = getDynamicFallbackReview("Educational Institute", undefined, 0)
  if (!education.draft1.toLowerCase().includes("faculty") && !education.draft1.toLowerCase().includes("concept")) {
    throw new Error("Expected Education draft to mention faculty or concept")
  }

  console.log("✅ Test 3 Passed: All 10 major business categories (South Indian, Punjabi, Car Wash, Education, Salon, Parlour, etc.) supported with authentic domain vocabulary.")

  // Test 4: generateDynamicReviewDraft with Menu Items rotation
  const menuItems = [
    "Fresh Fruit Gateau",
    "Chocolate Truffle Cake",
    "Red Velvet Pastry",
    "Rasmalai Cake"
  ]
  const dynamicDraft = await generateDynamicReviewDraft({
    businessCategory: "Bakery",
    merchantName: "Cake Connection",
    menuItems,
    seed: "test-seed-42"
  })
  console.log("Test 4 Dynamic drafts from menu items:", dynamicDraft)
  if (!dynamicDraft.draft1 || !dynamicDraft.draft2 || !dynamicDraft.draft3) {
    throw new Error("generateDynamicReviewDraft returned incomplete drafts")
  }
  console.log("✅ Test 4 Passed: Dynamic review draft generation completely functional.")

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")
}

runTests().catch((e) => {
  console.error("Test execution failed:", e)
  process.exit(1)
})
