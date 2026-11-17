import { describe, it, expect } from "vitest"
import {
  getCleanMerchantName,
  extractCustomerFirstName,
  getRotatingSeoKeywords,
  buildPersonalizedRuleBasedDrafts,
  generateAIReviewReplyDrafts,
  VADODARA_CAKE_SEO_KEYWORDS
} from "@/lib/ai-review-reply"

describe("Pillar 3 — AI Google Review Reply Personalization & Overwrite Protection", () => {
  describe("1. Store Name Cleaning (getCleanMerchantName)", () => {
    it("cleans long keyword-stuffed Cake Connection title to strictly 'Cake Connection'", () => {
      const longTitle = "Cake Connection-Live Cake : Online Cake Delivery in Vadodara"
      expect(getCleanMerchantName(longTitle)).toBe("Cake Connection")
    })

    it("cleans other store names with parenthesis or dashes", () => {
      expect(getCleanMerchantName("Maw & Paw ( Best Pet Shop, Pet Grooming, Pets Cafe )")).toBe("Maw & Paw")
      expect(getCleanMerchantName("Shreenath Rajwadi - Silk Palace")).toBe("Shreenath Rajwadi")
    })

    it("handles null or undefined gracefully", () => {
      expect(getCleanMerchantName(null)).toBe("Cake Connection")
      expect(getCleanMerchantName(undefined)).toBe("Cake Connection")
    })
  })

  describe("2. Reviewer Name Extraction (extractCustomerFirstName)", () => {
    it("extracts first name from full customer name", () => {
      expect(extractCustomerFirstName("Nidhi Surti")).toBe("Nidhi")
      expect(extractCustomerFirstName("Rohit Soni")).toBe("Rohit")
      expect(extractCustomerFirstName("Deepal Patel")).toBe("Deepal")
    })

    it("ignores generic Google anonymous placeholders", () => {
      expect(extractCustomerFirstName("Google User")).toBe("")
      expect(extractCustomerFirstName("Local Guide")).toBe("")
      expect(extractCustomerFirstName("")).toBe("")
    })
  })

  describe("3. Rotating SEO Keywords (getRotatingSeoKeywords)", () => {
    it("provides 3 distinct SEO keywords without duplicates", () => {
      const [kw1, kw2, kw3] = getRotatingSeoKeywords("review_seed_001")
      expect(kw1).toBeDefined()
      expect(kw2).toBeDefined()
      expect(kw3).toBeDefined()
      expect(kw1).not.toBe(kw2)
      expect(kw2).not.toBe(kw3)
      expect(kw1).not.toBe(kw3)
      expect(VADODARA_CAKE_SEO_KEYWORDS).toContain(kw1)
      expect(VADODARA_CAKE_SEO_KEYWORDS).toContain(kw2)
      expect(VADODARA_CAKE_SEO_KEYWORDS).toContain(kw3)
    })
  })

  describe("4. Nidhi Surti 5-Star Personalized Review Drafts", () => {
    const nidhiReview = {
      merchantName: "Cake Connection-Live Cake : Online Cake Delivery in Vadodara",
      reviewerName: "Nidhi Surti",
      customerReview: "Ordered a customize wedding cake for a friend and it was so pretty and fresh. They were friendly as I went 1 week earlier to order. Delivered to the venue on time and safely. Must recommend if anyone want customize cake in budget.",
      rating: 5,
      locationOrArea: "Vadodara"
    }

    it("generates 3 customized, non-robotic drafts addressing Nidhi personally with clean store name", async () => {
      const drafts = await generateAIReviewReplyDrafts(nidhiReview)

      expect(drafts.draft1).toBeDefined()
      expect(drafts.draft2).toBeDefined()
      expect(drafts.draft3).toBeDefined()

      // Must address Nidhi by name
      expect(drafts.draft1).toMatch(/Nidhi/i)
      expect(drafts.draft2).toMatch(/Nidhi/i)
      expect(drafts.draft3).toMatch(/Nidhi/i)

      // Must use clean store name "Cake Connection", NEVER the long title
      expect(drafts.draft1).toContain("Cake Connection")
      expect(drafts.draft1).not.toContain("Online Cake Delivery in Vadodara")
      expect(drafts.draft2).toContain("Cake Connection")
      expect(drafts.draft2).not.toContain("Online Cake Delivery in Vadodara")
      expect(drafts.draft3).toContain("Cake Connection")
      expect(drafts.draft3).not.toContain("Online Cake Delivery in Vadodara")

      // Must mirror the product and experience
      expect(drafts.draft1.toLowerCase()).toMatch(/wedding cake|customized/i)
      expect(drafts.draft2.toLowerCase()).toMatch(/wedding cake|celebration|customized/i)
      expect(drafts.draft3.toLowerCase()).toMatch(/wedding cake|friend|celebration/i)

      // Drafts must be distinct
      expect(drafts.draft1).not.toBe(drafts.draft2)
      expect(drafts.draft2).not.toBe(drafts.draft3)
    })
  })
})
