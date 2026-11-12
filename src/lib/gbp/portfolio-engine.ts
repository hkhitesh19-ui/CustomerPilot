import { db } from "@/lib/db";
import { getMerchantTrackedKeywords } from "./keyword-bank";

/**
 * Module 6: 10-Keyword Weighted Selection & Locked Portfolio Engine
 * Blueprint 6-Pillar Formula:
 * 1. Genuine service relevance – 25%
 * 2. Customer enquiry/booking intent – 25%
 * 3. Local demand evidence – 15%
 * 4. Current ranking opportunity – 15%
 * 5. Business profitability & capacity – 10%
 * 6. Geographic competition – 10%
 *
 * Suggested Portfolio Breakdown:
 * - 5 Opportunity Keywords (Ranks 4-9 with fast Top 3 acceleration)
 * - 3 High-Value Service Keywords (Direct transactional core revenue drivers)
 * - 2 Long-Term Strategic Keywords (City-wide high-volume authority anchors)
 */

export interface KeywordScoreResult {
  keyword: string;
  keywordType: "GEO" | "SEO" | "AEO";
  targetLocality: string | null;
  searchVolume: number;
  currentRank: number;
  baselineRank: number;
  relevanceScore: number;     // max 25
  intentScore: number;        // max 25
  demandScore: number;        // max 15
  opportunityScore: number;   // max 15
  profitabilityScore: number; // max 10
  competitionScore: number;   // max 10
  commercialScore: number;    // sum 0 to 100
  portfolioCategory: "OPPORTUNITY" | "HIGH_VALUE" | "STRATEGIC";
  isPortfolioTarget: boolean;
}

export function computeKeyword6PillarScore(
  kw: {
    keyword: string;
    type: "GEO" | "SEO" | "AEO" | string;
    searchVolume: number;
    currentRank: number;
    baselineRank: number;
  }
): {
  relevanceScore: number;
  intentScore: number;
  demandScore: number;
  opportunityScore: number;
  profitabilityScore: number;
  competitionScore: number;
  commercialScore: number;
} {
  const kLower = kw.keyword.toLowerCase();

  // 1. Service Relevance (Max 25 pts)
  // Exact core services get maximum relevance
  let relevanceScore = 20;
  if (kLower.includes("cake") || kLower.includes("bakery") || kLower.includes("gmb") || kLower.includes("profile")) {
    relevanceScore = 25;
  } else if (kLower.includes("delivery") || kLower.includes("shop") || kLower.includes("agency")) {
    relevanceScore = 22;
  }

  // 2. Customer Enquiry / Booking Intent (Max 25 pts)
  // Commercial intent queries: "order", "online", "price", "delivery", "near me", "where to get"
  let intentScore = 15;
  if (
    kLower.includes("order") ||
    kLower.includes("delivery") ||
    kLower.includes("best") ||
    kLower.includes("near me") ||
    kLower.includes("where")
  ) {
    intentScore = 24;
  } else if (kLower.includes("shop") || kLower.includes("store") || kLower.includes("live")) {
    intentScore = 20;
  } else if (kw.type === "AEO") {
    intentScore = 23;
  }

  // 3. Local Demand Evidence (Max 15 pts)
  // Based on monthly search volume bracket
  let demandScore = 5;
  if (kw.searchVolume >= 2000) demandScore = 15;
  else if (kw.searchVolume >= 1200) demandScore = 13;
  else if (kw.searchVolume >= 700) demandScore = 10;
  else if (kw.searchVolume >= 400) demandScore = 8;
  else demandScore = 6;

  // 4. Current Ranking Opportunity (Max 15 pts)
  // Highest opportunity is for keywords in striking distance (Rank 4 to 8) -> easy jump to Top 3
  let opportunityScore = 8;
  if (kw.currentRank >= 4 && kw.currentRank <= 7) {
    opportunityScore = 15; // Golden striking distance
  } else if (kw.currentRank <= 3) {
    opportunityScore = 12; // Already in top 3, maintenance
  } else if (kw.currentRank >= 8 && kw.currentRank <= 12) {
    opportunityScore = 10;
  } else {
    opportunityScore = 6;
  }

  // 5. Business Profitability & Capacity (Max 10 pts)
  // High-ticket customization or premium queries
  let profitabilityScore = 7;
  if (
    kLower.includes("truffle") ||
    kLower.includes("custom") ||
    kLower.includes("designer") ||
    kLower.includes("birthday") ||
    kLower.includes("optimization") ||
    kLower.includes("software")
  ) {
    profitabilityScore = 10;
  } else if (kLower.includes("fresh") || kLower.includes("eggless")) {
    profitabilityScore = 8;
  }

  // 6. Geographic Competition (Max 10 pts)
  // Hyperlocal landmark queries face lower domain competition and higher conversion
  let competitionScore = 6;
  if (kw.type === "GEO") {
    competitionScore = 9; // High local convertibility
  } else if (kw.type === "AEO") {
    competitionScore = 8; // Emerging AI voice queries with low saturation
  } else {
    competitionScore = 7;
  }

  const commercialScore =
    relevanceScore +
    intentScore +
    demandScore +
    opportunityScore +
    profitabilityScore +
    competitionScore;

  return {
    relevanceScore,
    intentScore,
    demandScore,
    opportunityScore,
    profitabilityScore,
    competitionScore,
    commercialScore,
  };
}

/**
 * Auto-selects and partitions the top 10 keywords into 5 Opportunity, 3 High-Value, and 2 Strategic
 */
export function partitionTop10Portfolio(
  keywords: Array<{
    keyword: string;
    type: "GEO" | "SEO" | "AEO" | string;
    searchVolume: number;
    currentRank: number;
    baselineRank: number;
    locality?: string | null;
  }>
): KeywordScoreResult[] {
  // Compute scores for all keywords
  const scored = keywords.map((k) => {
    const scores = computeKeyword6PillarScore(k);
    return {
      keyword: k.keyword,
      keywordType: k.type as "GEO" | "SEO" | "AEO",
      targetLocality: k.locality || null,
      searchVolume: k.searchVolume,
      currentRank: k.currentRank,
      baselineRank: k.baselineRank,
      ...scores,
      portfolioCategory: "OPPORTUNITY" as "OPPORTUNITY" | "HIGH_VALUE" | "STRATEGIC",
      isPortfolioTarget: false,
    };
  });

  // Sort by commercialScore descending
  scored.sort((a, b) => b.commercialScore - a.commercialScore);

  // 1. Pick 3 High-Value Service Keywords (High search volume + high intent)
  const highValueCandidates = [...scored]
    .sort((a, b) => b.searchVolume * b.intentScore - a.searchVolume * a.intentScore)
    .slice(0, 3);
  const highValueKeywords = new Set(highValueCandidates.map((k) => k.keyword));

  // 2. Pick 2 Long-Term Strategic Keywords (Broad category or high competition city terms)
  const strategicCandidates = [...scored]
    .filter((k) => !highValueKeywords.has(k.keyword))
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 2);
  const strategicKeywords = new Set(strategicCandidates.map((k) => k.keyword));

  // 3. Pick 5 Opportunity Keywords (Ranks 4-9 in striking distance)
  const opportunityCandidates = [...scored]
    .filter((k) => !highValueKeywords.has(k.keyword) && !strategicKeywords.has(k.keyword))
    .sort((a, b) => b.opportunityScore - a.opportunityScore || b.commercialScore - a.commercialScore)
    .slice(0, 5);
  const opportunityKeywords = new Set(opportunityCandidates.map((k) => k.keyword));

  // Tag results
  return scored.map((k) => {
    if (highValueKeywords.has(k.keyword)) {
      return { ...k, isPortfolioTarget: true, portfolioCategory: "HIGH_VALUE" };
    }
    if (strategicKeywords.has(k.keyword)) {
      return { ...k, isPortfolioTarget: true, portfolioCategory: "STRATEGIC" };
    }
    if (opportunityKeywords.has(k.keyword)) {
      return { ...k, isPortfolioTarget: true, portfolioCategory: "OPPORTUNITY" };
    }
    return { ...k, isPortfolioTarget: false };
  });
}
