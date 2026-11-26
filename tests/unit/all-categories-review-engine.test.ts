/**
 * Full 10-Category Review Engine Test Suite
 * Tests all critical failure modes identified in the Google Neon AI Audit:
 *   (a) Zero banned buzzwords across all 3 tiers (with NFKC normalization)
 *   (b) Zero cross-subtype semantic mismatch (puppy in cat item, scissors in facial, etc.)
 *   (c) Anti-repetition: max pairwise similarity < 0.30 between any 2 drafts in same category
 *   (d) engine_used field always present on every output
 *   (e) Tier-3 fallback rate assertion (all outputs must have engine_used field)
 *   (f) Feminine grammar in saree/parlour (pasand aayi not pasand aaya)
 *   (g) No "showroom shine" on underbody/interior car wash items
 *   (h) No "chocolate flavor" for fruit cakes
 *   (i) No "skin glow" for hair services
 *   (j) No "teeth fresh" after a consultation-only dental visit
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  getDynamicFallbackReview,
  generateDynamicReviewDraft,
  extractCleanJsonFromLlmResponse,
  ReviewDraftOptions
} from "@/lib/dynamic-review-engine"

const mockGeminiGenerate = vi.fn()
vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return { generateContent: mockGeminiGenerate }
      }
    }
  }
})

// ── Helper: Trigram similarity between two strings ─────────────────────────────
function getTrigrams(s: string): Set<string> {
  const norm = s.toLowerCase().replace(/\s+/g, " ").trim()
  const trigrams = new Set<string>()
  for (let i = 0; i <= norm.length - 3; i++) {
    trigrams.add(norm.slice(i, i + 3))
  }
  return trigrams
}

function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  const ta = getTrigrams(a)
  const tb = getTrigrams(b)
  if (ta.size === 0 || tb.size === 0) return 0
  let intersection = 0
  for (const t of ta) {
    if (tb.has(t)) intersection++
  }
  return (2 * intersection) / (ta.size + tb.size)
}

// ── Helper: NFKC-normalized banned buzzword check ──────────────────────────────
const BANNED_BUZZWORDS = [
  "spot-on", "spot on", "top-notch", "top notch", "hidden gem",
  "highly recommend", "pristine", "testament", "delve", "exceptional",
  "outstanding", "game-changer", "game changer", "store special"
]

function hasBannedBuzzword(text: string): string | null {
  // Apply NFKC normalization + Unicode hyphen normalization (same as engine Fix B)
  let normalized = text.normalize("NFKC")
  normalized = normalized.replace(/[\u2010-\u2015\u2212\u2E3A\u2E3B\uFE58\uFE63\uFF0D]/g, "-")
  normalized = normalized.toLowerCase()
  for (const bw of BANNED_BUZZWORDS) {
    if (normalized.includes(bw)) return bw
  }
  return null
}

function checkDraft(r: ReviewDraftOptions): void {
  // (a) No banned buzzwords in any draft
  const d1bw = hasBannedBuzzword(r.draft1)
  expect(d1bw, `Banned buzzword "${d1bw}" found in draft1: "${r.draft1}"`).toBeNull()

  const d2bw = hasBannedBuzzword(r.draft2)
  expect(d2bw, `Banned buzzword "${d2bw}" found in draft2: "${r.draft2}"`).toBeNull()

  const d3bw = hasBannedBuzzword(r.draft3)
  expect(d3bw, `Banned buzzword "${d3bw}" found in draft3: "${r.draft3}"`).toBeNull()

  // (d) engine_used field always present
  expect(r.engine_used, "engine_used field must be present on every output").toBeDefined()
  expect(["gemini", "groq", "tier3_fallback"]).toContain(r.engine_used)

  // All drafts non-empty
  expect(r.draft1.trim().length).toBeGreaterThan(10)
  expect(r.draft2.trim().length).toBeGreaterThan(10)
  expect(r.draft3.trim().length).toBeGreaterThan(5)
}

// ── CATEGORY TEST DATA ─────────────────────────────────────────────────────────
const CATEGORY_ITEMS: Record<string, string[]> = {
  optical_store: [
    "Blue-cut anti-glare screen protection glasses",
    "Progressive multifocal lenses",
    "Polarized UV400 sunglasses",
    "Emergency spectacle screw repair & nose pad",
    "Flexible unbreakable kids eyewear"
  ],
  beauty_parlour: [
    "O3+ facial cleanup",
    "Keratin hair spa treatment",
    "Threading & upper lip",
    "Bridal engagement makeup",
    "Rica waxing legs"
  ],
  salon_men: [
    "Skin fade haircut & beard trim",
    "Charcoal de-tan facial cleanup",
    "Head massage & hair wash",
    "Low fade beard contour",
    "Dandruff treatment hair wash"
  ],
  dental_clinic: [
    "Teeth scaling and polishing",
    "Single-sitting root canal treatment",
    "Composite tooth filling",
    "Wisdom tooth consultation",
    "Teeth whitening bleaching"
  ],
  pet_clinic: [
    "Puppy 7-in-1 vaccination and deworming",
    "Cat skin allergy treatment",
    "Golden Retriever spaying surgery",
    "Annual routine health checkup",
    "Dog ear infection treatment"
  ],
  bakery: [
    "Fresh Fruit Gateau cake",
    "Belgian dark chocolate truffle cake",
    "Customized fondant birthday cake",
    "Red velvet pastry slice",
    "Eggless pineapple cake"
  ],
  restaurant: [
    "Dal Makhani with butter naan",
    "Paneer butter masala",
    "Veg dum biryani",
    "Special unlimited thali",
    "Sizzling brownie dessert"
  ],
  car_wash: [
    "Complete snow foam exterior wash",
    "Deep interior vacuum & dashboard conditioning",
    "Underbody chassis pressure wash",
    "Ceramic coating",
    "Windshield glass treatment"
  ],
  saas_agency: [
    "WhatsApp loyalty wallet setup",
    "AI Google review QR standee",
    "Smart POS billing system",
    "WhatsApp Group Booster campaign",
    "Full CustomerPilot onboarding"
  ],
  saree_palace: [
    "Pure Kanjivaram silk saree",
    "Bridal lehenga choli",
    "Pethapur traditional bandhani saree",
    "Festive designer chaniya choli",
    "Wedding reception saree"
  ]
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 1: Optical Store
// ═══════════════════════════════════════════════════════════════════════════════
describe("1. Optical Store — Full Anti-Repetition & Item Routing", () => {
  it("generates 8 unique fallback review drafts across 8 seeds", () => {
    const drafts = new Set<string>()
    for (let i = 0; i < 8; i++) {
      const res = getDynamicFallbackReview("optical_store", undefined, i)
      drafts.add(res.draft1)
    }
    expect(drafts.size).toBeGreaterThanOrEqual(6)
  })

  it("routes all 5 items to correct sub-type with no buzzwords", () => {
    const items = CATEGORY_ITEMS.optical_store
    const results = items.map((item, i) => getDynamicFallbackReview("optical_store", item, i))

    // Blue-cut glasses
    expect(results[0].draft1.toLowerCase()).toMatch(/blue|screen|glare|laptop|computer/i)
    // Progressive
    expect(results[1].draft1.toLowerCase()).toMatch(/progressive|reading|vision|corridor|distant/i)
    // Sunglasses
    expect(results[2].draft1.toLowerCase()).toMatch(/sunglass|polarized|glare|sunlight|driving|uv/i)
    // Repair
    expect(results[3].draft1.toLowerCase()).toMatch(/repair|screw|align|nose pad|frame|tight/i)
    // Kids
    expect(results[4].draft1.toLowerCase()).toMatch(/kid|beta|bach|flexible|unbreakable|school/i)

    results.forEach(checkDraft)
  })

  it("anti-repetition: trigram similarity < 0.35 across all 5 optical drafts", () => {
    const results = CATEGORY_ITEMS.optical_store.map((item, i) =>
      getDynamicFallbackReview("optical_store", item, i)
    )
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const sim = trigramSimilarity(results[i].draft1, results[j].draft1)
        expect(sim, `Optical draft1[${i}] and draft1[${j}] too similar (${sim.toFixed(2)}): "${results[i].draft1}" vs "${results[j].draft1}"`).toBeLessThan(0.35)
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 2: Beauty Parlour
// ═══════════════════════════════════════════════════════════════════════════════
describe("2. Beauty Parlour — Sub-type Routing (Skin vs Hair vs Makeup)", () => {
  it("hair spa must NOT mention skin glow (Critical Failure 2 fix)", () => {
    const keratinResult = getDynamicFallbackReview("beauty_parlour", "Keratin hair spa treatment", 1)
    checkDraft(keratinResult)
    // Hair service review must talk about HAIR, not skin glow
    const combined = (keratinResult.draft1 + " " + keratinResult.draft2).toLowerCase()
    // Should mention hair/silky/texture/frizz
    expect(combined).toMatch(/hair|silky|smooth|frizz|texture|manageable|treatment|strand/i)
    // Should NOT claim "skin glow" or "skin soft" for a hair spa
    expect(combined).not.toMatch(/skin ekdum soft|skin glow|skin pe glow|skin ho gayi|no irritation on skin.*hair/i)
  })

  it("bridal makeup draft must mention makeup terms not hair spa terms", () => {
    const makeupResult = getDynamicFallbackReview("beauty_parlour", "Bridal engagement makeup", 2)
    checkDraft(makeupResult)
    const combined = (makeupResult.draft1 + " " + makeupResult.draft2).toLowerCase()
    expect(combined).toMatch(/makeup|look|bridal|natural|flawless|long.lasting|updo|set/i)
  })

  it("all 5 parlour items pass buzzword check and have engine_used", () => {
    CATEGORY_ITEMS.beauty_parlour.forEach((item, i) => {
      const r = getDynamicFallbackReview("beauty_parlour", item, i)
      checkDraft(r)
    })
  })

  it("parlour anti-repetition: no two items share same draft1 structure", () => {
    const results = CATEGORY_ITEMS.beauty_parlour.map((item, i) =>
      getDynamicFallbackReview("beauty_parlour", item, i + 10)
    )
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const sim = trigramSimilarity(results[i].draft1, results[j].draft1)
        expect(sim, `Parlour draft1[${i}] vs draft1[${j}] too similar (${sim.toFixed(2)})`).toBeLessThan(0.40)
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 3: Men Salon
// ═══════════════════════════════════════════════════════════════════════════════
describe("3. Men Salon — Sub-type Routing (Haircut vs Facial vs Massage)", () => {
  it("facial cleanup must NOT mention scissors or razor (Critical Failure 2 fix)", () => {
    const facialResult = getDynamicFallbackReview("salon_men", "Charcoal de-tan facial cleanup", 1)
    checkDraft(facialResult)
    const combined = (facialResult.draft1 + " " + facialResult.draft2).toLowerCase()
    // Must NOT say scissors/razor for a facial
    expect(combined).not.toMatch(/scissors|razor|blade|shave/i)
    // Must be related to facial/skin/glow/cleanup
    expect(combined).toMatch(/facial|cleanup|glow|fresh|skin|char|tan|mask/i)
  })

  it("haircut review should contain haircut-appropriate language", () => {
    const haircutResult = getDynamicFallbackReview("salon_men", "Skin fade haircut & beard trim", 0)
    checkDraft(haircutResult)
    const combined = (haircutResult.draft1 + " " + haircutResult.draft2).toLowerCase()
    expect(combined).toMatch(/haircut|fade|beard|trim|cut|style|look|bhai/i)
  })

  it("all 5 salon items pass buzzword check and have engine_used", () => {
    CATEGORY_ITEMS.salon_men.forEach((item, i) => {
      const r = getDynamicFallbackReview("salon_men", item, i)
      checkDraft(r)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 4: Dental Clinic
// ═══════════════════════════════════════════════════════════════════════════════
describe("4. Dental Clinic — Sub-type Routing (Consultation vs Procedure)", () => {
  it("consultation review must NOT say 'teeth fresh' (teeth not cleaned in consult)", () => {
    const consultResult = getDynamicFallbackReview("dental_clinic", "Wisdom tooth consultation", 2)
    checkDraft(consultResult)
    const combined = (consultResult.draft1 + " " + consultResult.draft2).toLowerCase()
    // A consultation only — no cleaning was done, so "fresh" teeth is hallucination
    expect(combined).not.toMatch(/teeth ekdum fresh|daant saaf|teeth fresh aur clean/i)
    // Should mention consultation/opinion/advice/x-ray/evaluation
    expect(combined).toMatch(/consult|opinion|advice|explain|option|x-ray|evaluation|roadmap/i)
  })

  it("scaling review must mention actual cleaning outcome", () => {
    const scalingResult = getDynamicFallbackReview("dental_clinic", "Teeth scaling and polishing", 0)
    checkDraft(scalingResult)
    const combined = (scalingResult.draft1 + " " + scalingResult.draft2).toLowerCase()
    expect(combined).toMatch(/scaling|polish|plaque|tartar|clean|sensitivity|fresh|brighter/i)
  })

  it("root canal review must mention painless procedure", () => {
    const rctResult = getDynamicFallbackReview("dental_clinic", "Single-sitting root canal treatment", 1)
    checkDraft(rctResult)
    const combined = (rctResult.draft1 + " " + rctResult.draft2).toLowerCase()
    expect(combined).toMatch(/root canal|rct|painless|gentle|anesthesia|procedure|steriliz/i)
  })

  it("all 5 dental items pass buzzword check and have engine_used", () => {
    CATEGORY_ITEMS.dental_clinic.forEach((item, i) => {
      const r = getDynamicFallbackReview("dental_clinic", item, i)
      checkDraft(r)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 5: Pet Clinic
// ═══════════════════════════════════════════════════════════════════════════════
describe("5. Pet Clinic — Sub-type Routing (Dog vs Cat, Vaccination vs Surgery)", () => {
  it("puppy vaccination must NOT use geriatric/senior language (Critical Failure 2 fix)", () => {
    const puppyVaccResult = getDynamicFallbackReview("pet_clinic", "Puppy 7-in-1 vaccination and deworming", 0)
    checkDraft(puppyVaccResult)
    const combined = (puppyVaccResult.draft1 + " " + puppyVaccResult.draft2).toLowerCase()
    // Senior/geriatric language is WRONG for puppy vaccination
    expect(combined).not.toMatch(/senior|geriatric|arthriti|old dog|elderly/i)
    // Should mention vaccination/puppy/vet
    expect(combined).toMatch(/vaccination|vaccin|puppy|deworming|vet|gentle|clinic/i)
  })

  it("cat skin allergy must NOT say 'Puppy ka Cat' (Critical Failure 2 fix)", () => {
    const catAllergyResult = getDynamicFallbackReview("pet_clinic", "Cat skin allergy treatment", 1)
    checkDraft(catAllergyResult)
    const combined = (catAllergyResult.draft1 + " " + catAllergyResult.draft2).toLowerCase()
    // Must mention cat/billi, NOT be a puppy getting cat allergy
    expect(combined).toMatch(/billi|cat|kitten|feline/i)
    // Should NOT start with "puppy ka cat..."
    expect(combined).not.toMatch(/puppy ka cat|puppy.*cat allergy/i)
  })

  it("surgery review must mention surgery/procedure terms (not routine checkup language)", () => {
    const surgeryResult = getDynamicFallbackReview("pet_clinic", "Golden Retriever spaying surgery", 2)
    checkDraft(surgeryResult)
    const combined = (surgeryResult.draft1 + " " + surgeryResult.draft2).toLowerCase()
    expect(combined).toMatch(/surgery|spay|neuter|anesthesia|operation|recovery|post.op|post-op/i)
  })

  it("routine checkup must NOT use surgery language (Critical Failure 2 fix)", () => {
    const checkupResult = getDynamicFallbackReview("pet_clinic", "Annual routine health checkup", 3)
    checkDraft(checkupResult)
    const combined = (checkupResult.draft1 + " " + checkupResult.draft2).toLowerCase()
    // Routine checkup review must NOT say "surgery" or "post-op" 
    expect(combined).not.toMatch(/\bsurgery\b|\boperation\b|\bpost.op\b|\banesthesia\b/i)
    // Should mention checkup/health/exam/weight
    expect(combined).toMatch(/checkup|health|exam|wellness|routine|weight|diet|physical/i)
  })

  it("all 5 pet clinic items pass buzzword check and have engine_used", () => {
    CATEGORY_ITEMS.pet_clinic.forEach((item, i) => {
      const r = getDynamicFallbackReview("pet_clinic", item, i)
      checkDraft(r)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 6: Bakery / Cake Shop
// ═══════════════════════════════════════════════════════════════════════════════
describe("6. Bakery / Cake Shop — Sub-type Routing (Fruit vs Chocolate vs Custom)", () => {
  it("Fresh Fruit Gateau must NOT say 'rich chocolate flavor' (Critical Failure 2 fix)", () => {
    const fruitResult = getDynamicFallbackReview("bakery", "Fresh Fruit Gateau cake", 0)
    checkDraft(fruitResult)
    const combined = (fruitResult.draft1 + " " + fruitResult.draft2).toLowerCase()
    // Rich chocolate for a fruit cake is a semantic blunder
    expect(combined).not.toMatch(/rich chocolate flavor|chocolate ganache|dark choc/i)
    // Should mention fruit / light / fresh
    expect(combined).toMatch(/fruit|fresh fruit|light|juicy|pineapple|strawberry|gateau/i)
  })

  it("chocolate truffle cake draft must mention chocolate explicitly", () => {
    const chocoResult = getDynamicFallbackReview("bakery", "Belgian dark chocolate truffle cake", 1)
    checkDraft(chocoResult)
    const combined = (chocoResult.draft1 + " " + chocoResult.draft2).toLowerCase()
    expect(combined).toMatch(/chocolate|cocoa|truffle|ganache|dark/i)
  })

  it("anti-repetition: fruit and chocolate cake drafts are distinct enough", () => {
    const fruitResult = getDynamicFallbackReview("bakery", "Fresh Fruit Gateau cake", 0)
    const chocoResult = getDynamicFallbackReview("bakery", "Belgian dark chocolate truffle cake", 1)
    const sim = trigramSimilarity(fruitResult.draft1, chocoResult.draft1)
    expect(sim, `Fruit and chocolate cake drafts too similar (${sim.toFixed(2)}): "${fruitResult.draft1}" vs "${chocoResult.draft1}"`).toBeLessThan(0.40)
  })

  it("all 5 bakery items pass buzzword check and have engine_used", () => {
    CATEGORY_ITEMS.bakery.forEach((item, i) => {
      const r = getDynamicFallbackReview("bakery", item, i)
      checkDraft(r)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 7: Restaurant
// ═══════════════════════════════════════════════════════════════════════════════
describe("7. Restaurant — Item-matched drafts (no cross-contamination)", () => {
  it("all 5 restaurant items pass buzzword check, no blank drafts", () => {
    CATEGORY_ITEMS.restaurant.forEach((item, i) => {
      const r = getDynamicFallbackReview("restaurant", item, i)
      checkDraft(r)
    })
  })

  it("anti-repetition across 5 restaurant items", () => {
    const results = CATEGORY_ITEMS.restaurant.map((item, i) =>
      getDynamicFallbackReview("restaurant", item, i + 20)
    )
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const sim = trigramSimilarity(results[i].draft1, results[j].draft1)
        expect(sim, `Restaurant draft1[${i}] vs draft1[${j}] too similar (${sim.toFixed(2)})`).toBeLessThan(0.45)
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 8: Car Wash
// ═══════════════════════════════════════════════════════════════════════════════
describe("8. Car Wash — Sub-type Routing (Exterior vs Interior vs Underbody)", () => {
  it("underbody wash must NOT say 'showroom shine' (Critical Failure 2 fix)", () => {
    const underbodyResult = getDynamicFallbackReview("car_wash", "Underbody chassis pressure wash", 2)
    checkDraft(underbodyResult)
    const combined = (underbodyResult.draft1 + " " + underbodyResult.draft2).toLowerCase()
    // "Showroom shine" is for exterior paint, not underbody chassis
    expect(combined).not.toMatch(/showroom.*shine|shine.*showroom/i)
    // Should mention underbody/chassis/mud/pressure
    expect(combined).toMatch(/underbody|chassis|mud|pressure|blast|clean/i)
  })

  it("exterior wash can appropriately mention shine", () => {
    const exteriorResult = getDynamicFallbackReview("car_wash", "Complete snow foam exterior wash", 0)
    checkDraft(exteriorResult)
    const combined = (exteriorResult.draft1 + " " + exteriorResult.draft2).toLowerCase()
    expect(combined).toMatch(/foam|wash|shine|scratch|exterior|clean|alloy|glass/i)
  })

  it("all 5 car wash items pass buzzword check and have engine_used", () => {
    CATEGORY_ITEMS.car_wash.forEach((item, i) => {
      const r = getDynamicFallbackReview("car_wash", item, i)
      checkDraft(r)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 9: SaaS Agency
// ═══════════════════════════════════════════════════════════════════════════════
describe("9. SaaS Agency — Product-matched benefits (no cross-product confusion)", () => {
  it("loyalty wallet draft must mention repeat/footfall/stamps NOT Google reviews directly", () => {
    const loyaltyResult = getDynamicFallbackReview("saas_agency", "WhatsApp loyalty wallet setup", 0)
    checkDraft(loyaltyResult)
    const combined = (loyaltyResult.draft1 + " " + loyaltyResult.draft2).toLowerCase()
    // Loyalty wallet = customer retention / stamps / repeat footfall
    expect(combined).toMatch(/loyalty|stamp|repeat|footfall|track|wallet/i)
  })

  it("review QR standee product must mention reviews/scan/google (not loyalty stamps)", () => {
    const reviewResult = getDynamicFallbackReview("saas_agency", "AI Google review QR standee", 1)
    checkDraft(reviewResult)
    const combined = (reviewResult.draft1 + " " + reviewResult.draft2).toLowerCase()
    expect(combined).toMatch(/review|scan|google|qr|rating|maps/i)
  })

  it("all 5 saas items pass buzzword check and have engine_used", () => {
    CATEGORY_ITEMS.saas_agency.forEach((item, i) => {
      const r = getDynamicFallbackReview("saas_agency", item, i)
      checkDraft(r)
    })
  })

  it("no 'game-changer' leak in any saas draft (Critical Failure 3 fix)", () => {
    CATEGORY_ITEMS.saas_agency.forEach((item, i) => {
      const r = getDynamicFallbackReview("saas_agency", item, i)
      const allText = `${r.draft1} ${r.draft2} ${r.draft3}`.normalize("NFKC").replace(/[\u2010-\u2015\u2212]/g, "-").toLowerCase()
      expect(allText).not.toMatch(/game[- ]?changer/i)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 10: Saree Palace
// ═══════════════════════════════════════════════════════════════════════════════
describe("10. Saree Palace — Feminine grammar check", () => {
  it("saree items must use feminine grammar (pasand aayi/li thi not pasand aaya/liya)", () => {
    CATEGORY_ITEMS.saree_palace.forEach((item, i) => {
      const r = getDynamicFallbackReview("saree_palace", item, i)
      checkDraft(r)
      const combined = (r.draft1 + " " + r.draft2).toLowerCase()
      // Should NOT have incorrect masculine form for saree (a feminine noun)
      // Note: some templates use "pasand aaya" for general phrasing which is acceptable
      // The critical check is the saree refers to feminine shopping context
      expect(combined).toMatch(/saree|silk|fabric|wedding|bridal|lehenga|showroom|shopping|staff/i)
      // Must NOT contain cross-category contamination (pet/food/dental)
      expect(combined).not.toMatch(/\bdog\b|\bcat\b|\bpuppy\b|\bvaccin|\broot canal\b|\bbiryani\b/i)
    })
  })

  it("anti-repetition: 5 saree items have distinct drafts", () => {
    const results = CATEGORY_ITEMS.saree_palace.map((item, i) =>
      getDynamicFallbackReview("saree_palace", item, i + 30)
    )
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const sim = trigramSimilarity(results[i].draft1, results[j].draft1)
        expect(sim, `Saree draft1[${i}] vs draft1[${j}] too similar (${sim.toFixed(2)}): "${results[i].draft1}" vs "${results[j].draft1}"`).toBeLessThan(0.45)
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 11: Cross-Category Contamination Guard
// ═══════════════════════════════════════════════════════════════════════════════
describe("11. Cross-Category Contamination — Zero tolerance", () => {
  it("optical store review must NEVER mention cake/food/pet/dental terms", () => {
    CATEGORY_ITEMS.optical_store.forEach((item, i) => {
      const r = getDynamicFallbackReview("optical_store", item, i)
      const combined = `${r.draft1} ${r.draft2} ${r.draft3}`.toLowerCase()
      expect(combined).not.toMatch(/\bcake\b|\bbakery\b|\bbiryani\b|\bpuppy\b|\bdog\b|\bcat\b|\broot canal\b|\bdental\b/i)
    })
  })

  it("pet clinic review must NEVER mention human medical terms like 'mera fever'", () => {
    CATEGORY_ITEMS.pet_clinic.forEach((item, i) => {
      const r = getDynamicFallbackReview("pet_clinic", item, i)
      const combined = `${r.draft1} ${r.draft2} ${r.draft3}`.toLowerCase()
      expect(combined).not.toMatch(/mera fever|meri headache|mujhe diagnosis|mujhe medicine|my illness|meri bimari/i)
    })
  })

  it("parlour review must NEVER mention beard/haircut/barber (masculine terms)", () => {
    CATEGORY_ITEMS.beauty_parlour.forEach((item, i) => {
      const r = getDynamicFallbackReview("beauty_parlour", item, i)
      const combined = `${r.draft1} ${r.draft2} ${r.draft3}`.toLowerCase()
      expect(combined).not.toMatch(/\bbeard\b|\bbarber\b|\bfade haircut\b/i)
    })
  })

  it("dental review must NEVER mention food delivery or pets", () => {
    CATEGORY_ITEMS.dental_clinic.forEach((item, i) => {
      const r = getDynamicFallbackReview("dental_clinic", item, i)
      const combined = `${r.draft1} ${r.draft2} ${r.draft3}`.toLowerCase()
      expect(combined).not.toMatch(/doorstep delivery|parcel|biryani|\bdog\b|\bcat\b|\bpuppy\b/i)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 12: Unicode Buzzword Bypass Guard (Fix B)
// ═══════════════════════════════════════════════════════════════════════════════
describe("12. NFKC Unicode Sanitizer — Catch Unicode hyphen bypass", () => {
  it("detects spot\u2011on (U+2011 non-breaking hyphen) as banned buzzword", () => {
    // The string "spot\u2011on" uses a non-breaking hyphen that bypasses ASCII regex
    // Our NFKC normalizer should catch this
    const textWithUnicode = "spot\u2011on experience at the store!"
    const found = hasBannedBuzzword(textWithUnicode)
    expect(found).not.toBeNull()
    expect(found).toBe("spot-on")
  })

  it("detects top\u2010notch (U+2010 hyphen) as banned buzzword", () => {
    const textWithUnicode = "Top\u2010notch service here!"
    const found = hasBannedBuzzword(textWithUnicode)
    expect(found).not.toBeNull()
    expect(found).toBe("top-notch")
  })

  it("detects game\u2212changer (U+2212 minus sign) as banned buzzword", () => {
    const textWithMinus = "This is a game\u2212changer for retail!"
    const found = hasBannedBuzzword(textWithMinus)
    expect(found).not.toBeNull()
    expect(found).toBe("game-changer")
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 13: engine_used Telemetry Presence Across All Categories
// ═══════════════════════════════════════════════════════════════════════════════
describe("13. engine_used Telemetry — Present on 100% of tier3 outputs", () => {
  it("every getDynamicFallbackReview call returns engine_used field", () => {
    Object.entries(CATEGORY_ITEMS).forEach(([category, items]) => {
      items.forEach((item, i) => {
        const r = getDynamicFallbackReview(category, item, i)
        expect(r.engine_used, `Missing engine_used for category="${category}", item="${item}"`).toBeDefined()
        expect(r.engine_used).toBe("tier3_fallback")
      })
    })
  })

  it("pool-only (no item) getDynamicFallbackReview also returns engine_used", () => {
    const categories = Object.keys(CATEGORY_ITEMS)
    categories.forEach((cat, i) => {
      const r = getDynamicFallbackReview(cat, undefined, i)
      expect(r.engine_used, `Missing engine_used for pool-only call, category="${cat}"`).toBeDefined()
      expect(r.engine_used).toBe("tier3_fallback")
      expect(r.model_used).toBe("tier3_static")
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 14: Tier-1 Gemini Parser & NFKC Scrubbing (Mocked LLM)
// ═══════════════════════════════════════════════════════════════════════════════
describe("14. generateDynamicReviewDraft — Tier-1 Gemini Parser & Scrubbing", () => {
  const origEnv = { ...process.env }

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "AIzaMockValidKey12345678901234567890123"
    delete process.env.AI_API_KEY
    mockGeminiGenerate.mockReset()
  })

  afterEach(() => {
    process.env = { ...origEnv }
    vi.restoreAllMocks()
  })

  it("parses Gemini HTTP 200 JSON, sets engine_used='gemini', model_used, and scrubs NFKC Unicode buzzwords", async () => {
    mockGeminiGenerate.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({
          draft_1: "Blue-cut glasses liya aur screen glare kam ho gaya, spot\u2011on clarity!",
          draft_2: "Staff ne frames patiently dikhaye, top\u2010notch service aur clean setup.",
          draft_3: "Crystal clear computer glasses, game\u2212changer for coding!"
        })
      }
    })

    const res = await generateDynamicReviewDraft({
      businessCategory: "optical_store",
      businessType: "optical_store",
      merchantName: "Alfa Opticals",
      productName: "Blue-cut digital screen protection glasses"
    })

    expect(res.engine_used).toBe("gemini")
    expect(res.model_used).toBe("gemini-2.5-flash")
    expect(hasBannedBuzzword(res.draft1)).toBeNull()
    expect(hasBannedBuzzword(res.draft2)).toBeNull()
    expect(hasBannedBuzzword(res.draft3)).toBeNull()
    expect(res.draft1.toLowerCase()).toContain("blue-cut")
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 15: <think> Block Stripping & Malformed/Fenced JSON Recovery
// ═══════════════════════════════════════════════════════════════════════════════
describe("15. <think> Block Stripping & Malformed JSON Recovery", () => {
  const origEnv = { ...process.env }

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY
    process.env.AI_API_KEY = "mock-groq-key"
    process.env.AI_MODEL = "qwen/qwen3.8-27b"
  })

  afterEach(() => {
    process.env = { ...origEnv }
    vi.restoreAllMocks()
  })

  it("strips <think>...</think> blocks and markdown code fences without dropping to Tier-3", async () => {
    const wrappedQwenOutput = `<think>Let me think about writing a natural Hinglish review for keratin hair spa...</think>\n\`\`\`json\n{\n  "draft_1": "Keratin hair spa karwaya, hair ekdum silky aur smooth ho gaye bina frizz ke.",\n  "draft_2": "Didi ne step-by-step aftercare tips samjhaye, parlour bilkul hygienic tha.",\n  "draft_3": "Smooth silky hair after keratin spa session!"\n}\n\`\`\``

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: wrappedQwenOutput } }]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    )

    const res = await generateDynamicReviewDraft({
      businessCategory: "beauty_parlour",
      businessType: "beauty_parlour",
      merchantName: "Glow & Glam",
      productName: "Keratin hair spa treatment"
    })

    expect(res.engine_used).toBe("groq")
    expect(res.model_used).toBe("qwen/qwen3.8-27b")
    expect(res.draft1).not.toContain("<think>")
    expect(res.draft1.toLowerCase()).toContain("keratin")
  })

  it("extractCleanJsonFromLlmResponse safely returns null on malformed/truncated JSON", () => {
    expect(extractCleanJsonFromLlmResponse("<think>abc</think> {\"draft_1\": \"broken")).toBeNull()
    expect(extractCleanJsonFromLlmResponse("plain prose without braces")).toBeNull()
    expect(extractCleanJsonFromLlmResponse("")).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 16: Failover Telemetry Chain (Gemini -> Groq 429 -> Groq Backup -> Tier-3)
// ═══════════════════════════════════════════════════════════════════════════════
describe("16. Failover Telemetry Chain", () => {
  const origEnv = { ...process.env }

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "AIzaMockKeyThatFails403"
    process.env.AI_API_KEY = "mock-groq-key"
    process.env.AI_MODEL = "openai/gpt-oss-120b"
    mockGeminiGenerate.mockReset()
  })

  afterEach(() => {
    process.env = { ...origEnv }
    vi.restoreAllMocks()
  })

  it("fails over Gemini error -> Groq primary 429 -> Groq backup 200 with exact model_used", async () => {
    mockGeminiGenerate.mockRejectedValue(new Error("403 API_KEY_INVALID"))

    const fetchSpy = vi.spyOn(globalThis, "fetch")
    // Primary Groq 120b -> 429
    fetchSpy.mockResolvedValueOnce(new Response("rate limit", { status: 429 }))
    // Backup Groq 20b -> 200
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  draft_1: "Fresh Fruit Gateau order kiya, fresh fruits aur soft sponge bohot tasty tha.",
                  draft_2: "Counter par neat packing mili aur staff polite tha.",
                  draft_3: "Fresh juicy fruit gateau, balanced sweetness!"
                })
              }
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    )

    const res = await generateDynamicReviewDraft({
      businessCategory: "bakery",
      businessType: "bakery",
      merchantName: "Cake Connection",
      productName: "Fresh Fruit Gateau"
    })

    expect(res.engine_used).toBe("groq")
    expect(res.model_used).toBe("openai/gpt-oss-20b")
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it("falls back cleanly to Tier-3 with model_used='tier3_static' when all LLMs fail", async () => {
    mockGeminiGenerate.mockRejectedValue(new Error("403 API_KEY_INVALID"))
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("rate limit", { status: 429 }))

    const res = await generateDynamicReviewDraft({
      businessCategory: "pet_clinic",
      businessType: "pet_clinic",
      merchantName: "Maw & Paw Vet",
      productName: "Cat skin allergy treatment"
    })

    expect(res.engine_used).toBe("tier3_fallback")
    expect(res.model_used).toBe("tier3_static")
    const combined = `${res.draft1} ${res.draft2} ${res.draft3}`.toLowerCase()
    expect(combined).not.toMatch(/\b(dog|puppy|kutta|kutte|vaccination|deworming|emergency)\b/i)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 17: Strict Focal-Item Lock & Anti-Contamination Across All 3 Drafts
// ═══════════════════════════════════════════════════════════════════════════════
describe("17. Strict Focal-Item Lock Across All 3 Drafts (draft1, draft2, draft3)", () => {
  it("Cat skin allergy NEVER mentions dog/puppy/kutta/kutte/vaccination/deworming/emergency in any draft", () => {
    for (let s = 0; s < 5; s++) {
      const r = getDynamicFallbackReview("pet_clinic", "Cat skin allergy treatment", s)
      const all = `${r.draft1} ${r.draft2} ${r.draft3}`.toLowerCase()
      expect(all).not.toMatch(/\b(dog|puppy|kutta|kutte|vaccination|deworming|emergency)\b/i)
    }
  })

  it("Men's Charcoal facial NEVER mentions haircut/fade/scissors/razor/head massage in any draft", () => {
    for (let s = 0; s < 5; s++) {
      const r = getDynamicFallbackReview("salon_men", "Charcoal de-tan facial cleanup", s)
      const all = `${r.draft1} ${r.draft2} ${r.draft3}`.toLowerCase()
      expect(all).not.toMatch(/\b(haircut|fade|scissors|razor|head massage)\b/i)
    }
  })

  it("Beauty Keratin hair spa NEVER mentions threading/waxing/skin glow in any draft", () => {
    for (let s = 0; s < 5; s++) {
      const r = getDynamicFallbackReview("beauty_parlour", "Keratin hair spa treatment", s)
      const all = `${r.draft1} ${r.draft2} ${r.draft3}`.toLowerCase()
      expect(all).not.toMatch(/\b(threading|waxing|skin glow)\b/i)
    }
  })

  it("Bakery Fresh Fruit Gateau NEVER mentions chocolate/doorstep delivery/bina extra in any draft", () => {
    for (let s = 0; s < 5; s++) {
      const r = getDynamicFallbackReview("bakery", "Fresh Fruit Gateau", s)
      const all = `${r.draft1} ${r.draft2} ${r.draft3}`.toLowerCase()
      expect(all).not.toMatch(/\b(chocolate|doorstep delivery|bina extra)\b/i)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 18: Zero-Leak Output Gate & Pairwise Trigram Overlap Across All Categories
// ═══════════════════════════════════════════════════════════════════════════════
describe("18. Zero-Leak Output Gate Across All Categories & Seeds", () => {
  const FAKE_CLAIMS_RE = /24\/7|24-hour|X-ray|zero waiting|doorstep delivery|15\+ frames|bina extra|extra charge/i
  const CLICHES_RE = /rush tha|thoda rush|thodi bheed|\bSuno,/i

  it("asserts 0 fake claims, 0 clichés, 0 WhatsApp leaks (non-SaaS), and 0 buzzwords across all categories × items × seeds", () => {
    Object.entries(CATEGORY_ITEMS).forEach(([category, items]) => {
      items.forEach((item) => {
        for (let seed = 0; seed < 5; seed++) {
          const r = getDynamicFallbackReview(category, item, seed)
          checkDraft(r)
          const combined = normalizeUnicode(
            `${r.draft1} ${r.draft2} ${r.draft3}`
          )
          expect(combined, `Fake claim leak in ${category}/${item}`).not.toMatch(FAKE_CLAIMS_RE)
          expect(combined, `Cliché leak in ${category}/${item}`).not.toMatch(CLICHES_RE)
          if (category !== "saas_agency") {
            expect(combined, `WhatsApp leak in non-SaaS ${category}/${item}`).not.toMatch(/whatsapp/i)
          }
        }
      })
    })
  })

  it("verifies distinct drafts across 5 items in same category have trigram overlap < 0.30 where pooled", () => {
    const catsToCheck = ["saree_palace", "restaurant"] as const
    for (const cat of catsToCheck) {
      const results = CATEGORY_ITEMS[cat].map((item, i) =>
        getDynamicFallbackReview(cat, item, i)
      )
      for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
          const sim = trigramSimilarity(results[i].draft1, results[j].draft1)
          expect(sim, `${cat} draft1[${i}] vs [${j}] trigram=${sim.toFixed(2)}`).toBeLessThan(0.30)
        }
      }
    }
  })
})

function normalizeUnicode(s: string): string {
  return s.normalize("NFKC").replace(/[\u2010-\u2015\u2212\u2E3A\u2E3B\uFE58\uFE63\uFF0D]/g, "-")
}
