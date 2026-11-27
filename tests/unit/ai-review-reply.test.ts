import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  buildPersonalizedRuleBasedDrafts,
  generateAIReviewReplyDrafts,
  getRotatingSeoKeywords,
  resolveReplyCategory,
} from "@/lib/ai-review-reply"

const NON_BAKERY_CATEGORIES = [
  { key: "optical_store", name: "Alfa Opticals", cat: "optical_store", review: "Got my blue-cut glasses for coding, super comfortable." },
  { key: "saree_palace", name: "Shreenath Rajwadi Silk Palace", cat: "saree_palace", review: "Bought a pure Kanjivaram silk saree for my sister's wedding." },
  { key: "pet_clinic", name: "Maw & Paw Vet Clinic", cat: "pet_clinic", review: "Gentle vet doctor for our puppy's 7-in-1 vaccination." },
  { key: "dental_clinic", name: "Smile Studio Dental Clinic", cat: "dental_clinic", review: "Painless root canal in a clean clinic." },
  { key: "beauty_parlour", name: "Glow & Glam Ladies Beauty Parlour", cat: "beauty_parlour", review: "Painless eyebrow threading and relaxing facial." },
  { key: "restaurant", name: "Shreeji Family Dining & Kitchen", cat: "restaurant", review: "Dal makhani and butter naan were fresh and tasty." },
  { key: "salon_men", name: "Urban Cut Men's Salon & Grooming", cat: "salon_men", review: "Sharp skin fade haircut and beard trim." },
  { key: "car_wash", name: "Sparkle Auto Detailing & Car Wash", cat: "car_wash", review: "Complete snow foam exterior wash made my car shine." },
  { key: "saas_agency", name: "CustomerPilot Technology Solutions", cat: "saas_agency", review: "WhatsApp digital loyalty wallet doubled our repeat visits." },
]

describe("AI Review Reply Engine — Multi-Category, Rating-Aware & Zero-Leak", () => {
  const origEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    process.env = { ...origEnv }
  })

  it("resolves Men's Salon & Grooming as salon_men without Pet Clinic collision", () => {
    expect(resolveReplyCategory("salon_men", "Urban Cut Men's Salon & Grooming")).toBe("salon_men")
    expect(resolveReplyCategory("Men's Salon & Grooming", "Urban Cut")).toBe("salon_men")
    expect(resolveReplyCategory("pet_clinic", "Maw & Paw Vet Clinic")).toBe("pet_clinic")
  })

  it("never leaks cake, bakery, Vadodara, or on-time cake delivery across all 9 non-bakery categories (Tier-3)", () => {
    for (const biz of NON_BAKERY_CATEGORIES) {
      const res = buildPersonalizedRuleBasedDrafts({
        storeName: biz.name,
        location: "Surat",
        categoryStr: biz.cat,
        rating: 5,
        customerReview: biz.review,
        reviewerName: "Aarav Patel",
      })
      const joined = `${res.draft1} ${res.draft2} ${res.draft3} ${res.keywords.join(" ")}`
      expect(joined).not.toMatch(/\b(cake|bakery|baking|pastry|pastries|eggless|frosting|fondant)\b/i)
      expect(joined).not.toMatch(/Vadodara|Manjalpur/i)
      expect(joined).not.toMatch(/on[- ]?time\s+cake\s+delivery/i)
      expect(joined).not.toMatch(/🎂/)
      expect(joined).not.toMatch(/Dhanyawad/i)
      expect(res.engine_used).toBe("tier3_fallback")
    }
  })

  it("respects non-Vadodara cities dynamically without hardcoding Vadodara", () => {
    const res = buildPersonalizedRuleBasedDrafts({
      storeName: "Alfa Opticals",
      location: "Ahmedabad",
      categoryStr: "optical_store",
      rating: 5,
      customerReview: "Great progressive lenses.",
      reviewerName: "Meera Shah",
    })
    expect(res.draft1).toContain("Ahmedabad")
    expect(`${res.draft1} ${res.draft2} ${res.draft3}`).not.toMatch(/Vadodara/i)

    const kws = getRotatingSeoKeywords("seed1", "optical_store", "Rajkot", "Alfa Opticals")
    expect(kws.some((k) => k.includes("Rajkot"))).toBe(true)
    expect(kws.join(" ")).not.toMatch(/Vadodara|cake/i)
  })

  it("enforces Rating-Aware Sentiment Routing: 5-star vs 4-star vs 1-star/2-star/3-star", () => {
    const r5 = buildPersonalizedRuleBasedDrafts({
      storeName: "Smile Studio Dental Clinic",
      location: "Surat",
      categoryStr: "dental_clinic",
      rating: 5,
      customerReview: "Painless root canal!",
      reviewerName: "Priya",
    })
    expect(r5.draft1).toMatch(/5-star|thank you/i)

    const r4 = buildPersonalizedRuleBasedDrafts({
      storeName: "Smile Studio Dental Clinic",
      location: "Surat",
      categoryStr: "dental_clinic",
      rating: 4,
      customerReview: "Good root canal, waiting time was slightly long.",
      reviewerName: "Priya",
    })
    expect(r4.draft1).toMatch(/4-star/i)
    expect(r4.draft1).toMatch(/improve|5-star/i)

    for (const badRating of [1, 2, 3]) {
      const rBad = buildPersonalizedRuleBasedDrafts({
        storeName: "Smile Studio Dental Clinic",
        location: "Surat",
        categoryStr: "dental_clinic",
        rating: badRating,
        customerReview: "Had a long wait and billing confusion.",
        reviewerName: "Priya",
      })
      const joined = `${rBad.draft1} ${rBad.draft2} ${rBad.draft3}`
      expect(joined).not.toMatch(/\b(delighted|thrilled|glad you loved|wonderful 5-star|baking)\b/i)
      expect(joined).not.toMatch(/🎂|🎉|🥰/)
      expect(joined).toMatch(/apologize|sorry|regret/i)
      expect(joined).toMatch(/phone|WhatsApp|directly|manager|call/i)
      expect(rBad.keywords).toEqual([])
    }
  })

  it("scrubs NFKC Unicode hyphens & robotic fluff, and blocks LLM cake leaks via fallback guard", async () => {
    delete process.env.GEMINI_API_KEY
    process.env.AI_API_KEY = "test_groq_key"
    process.env.GROQ_API_KEY = "test_groq_key"

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                // draft_1 has NFKC Unicode hyphen spot‑on + robotic fluff
                draft_1: "Dear Aarav, thank you for your review of Alfa Opticals! We strive for excellence with spot\u2011on top\u2011tier glasses.",
                // draft_2 leaks cake -> must be caught & replaced by clean Tier-3 fallback
                draft_2: "Dear Aarav, thank you for ordering our customized designer cake at Alfa Opticals!",
                // draft_3 has broken grammar "that loved" -> must be caught & replaced
                draft_3: "Dear Aarav, delighted to hear that loved our glasses at Alfa Opticals!",
              }),
            },
          },
        ],
      }),
    } as any)

    const res = await generateAIReviewReplyDrafts({
      merchantName: "Alfa Opticals",
      locationOrArea: "Surat",
      category: "optical_store",
      customerReview: "Blue-cut glasses are great.",
      rating: 5,
      reviewerName: "Aarav",
    })

    expect(res.engine_used).toBe("groq")
    expect(res.draft1).not.toMatch(/\u2011/)
    expect(res.draft1).not.toMatch(/strive for excellence|top-tier|spot-on/i)
    expect(res.draft2).not.toMatch(/cake/i)
    expect(res.draft3).not.toMatch(/that loved/i)
  })

  it("falls back cleanly to tier3_fallback when LLM keys are absent", async () => {
    delete process.env.GEMINI_API_KEY
    delete process.env.AI_API_KEY
    delete process.env.GROQ_API_KEY

    const res = await generateAIReviewReplyDrafts({
      merchantName: "Sparkle Auto Detailing & Car Wash",
      locationOrArea: "Pune",
      category: "car_wash",
      customerReview: "Snow foam wash was very thorough.",
      rating: 5,
      reviewerName: "Rohan",
    })

    expect(res.engine_used).toBe("tier3_fallback")
    expect(res.model_used).toBe("tier3_static")
    expect(res.draft1).toContain("Sparkle Auto Detailing & Car Wash")
    expect(res.draft1).not.toMatch(/cake|Vadodara/i)
  })
})
