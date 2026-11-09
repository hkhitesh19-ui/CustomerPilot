/**
 * src/lib/auditCalculator.ts
 * 
 * CustomerPilot / RankPilot AI™ — Revenue Leak & Competitor Spy Calculation Engine
 * Reference: RankPilot AI™ Master Playbook Section 3.2, 3.3 & 3.5
 * 
 * 100% Deterministic — Zero database dependencies, mathematical purity.
 */

export interface RevenueLeakInput {
  monthlySearchVolume: number;   // e.g. 2,500
  currentGridRankAvg: number;    // e.g. 18
  conversionRate?: number;       // Default 0.20 (20% actions convert to orders)
  averageOrderValueINR: number;  // e.g. 500 INR
}

export interface RevenueLeakOutput {
  top3ClickShare: number;
  currentClickShare: number;
  top3PotentialActionsMonthly: number;
  currentActionsMonthly: number;
  missedActionsMonthly: number;
  lostOrdersMonthly: number;
  monthlyRevenueLeakINR: number;
  annualRevenueLeakINR: number;
}

/**
 * Industry local CTR benchmarks (Section 3.2)
 * Rank #1: 24.0%
 * Rank #2: 15.0%
 * Rank #3: 10.0%
 * Rank #4 to #10: 3.0%
 * Rank #11 to #20: 1.2%
 * Rank > 20: 0.4%
 */
export function getClickShareByRank(rank: number): number {
  if (rank <= 1) return 0.240;   // 24.0%
  if (rank === 2) return 0.150;  // 15.0%
  if (rank === 3) return 0.100;  // 10.0%
  if (rank <= 10) return 0.030;  // 3.0%
  if (rank <= 20) return 0.012;  // 1.2%
  return 0.004;                  // 0.4% for rank > 20
}

/**
 * Calculates monthly and annual revenue leaks caused by ranking below the Top 3 Local Pack.
 * Worked Example (Playbook Page 7):
 * V = 2,500, rank = 18, Cconv = 0.20, AOV = 500
 * -> Atop3 = 400 actions/mo, Acurrent = 30 actions/mo, deltaA = 370 missed actions
 * -> Lorders = 74 orders/mo, monthlyLeak = 37,000 INR, annualLeak = 4,44,000 INR
 */
export function calculateRevenueLeak(input: RevenueLeakInput): RevenueLeakOutput {
  const top3ClickShare = 0.160; // Conservative Mean: (24 + 15 + 10) / 3 = 16.33% -> 16.0%
  const currentClickShare = getClickShareByRank(input.currentGridRankAvg);
  const conversionRate = input.conversionRate ?? 0.20;

  const top3PotentialActionsMonthly = Math.round(input.monthlySearchVolume * top3ClickShare);
  const currentActionsMonthly = Math.round(input.monthlySearchVolume * currentClickShare);
  const missedActionsMonthly = Math.max(0, top3PotentialActionsMonthly - currentActionsMonthly);

  const lostOrdersMonthly = Math.round(missedActionsMonthly * conversionRate);
  const monthlyRevenueLeakINR = lostOrdersMonthly * input.averageOrderValueINR;
  const annualRevenueLeakINR = monthlyRevenueLeakINR * 12;

  return {
    top3ClickShare,
    currentClickShare,
    top3PotentialActionsMonthly,
    currentActionsMonthly,
    missedActionsMonthly,
    lostOrdersMonthly,
    monthlyRevenueLeakINR,
    annualRevenueLeakINR,
  };
}

export interface CompetitorSpyInput {
  primaryCategoryMatchesTop1: boolean;
  merchantSecondaryCategoryCount: number;
  top3AvgSecondaryCategoryCount: number;

  merchantTotalReviews: number;
  top3AvgTotalReviews: number;
  merchantReviewsLast30Days: number;
  top3AvgReviewsLast30Days: number;

  merchantKeywordMentionsInSample: number;
  top3AvgKeywordMentionsInSample: number;

  hasDedicatedWebsite: boolean;
  hasLocalBusinessSchema: boolean;
  hasFaqSchemaAndH1Locality: boolean;

  merchantPhotoCount: number;
  top3AvgPhotoCount: number;
  ownerReviewReplyRate: number; // 0.0 to 1.0
}

export interface CompetitorSpyScoreResult {
  categoryAlignmentScore: number;       // Max 25
  reviewVolumeAndVelocityScore: number; // Max 30
  keywordDensityScore: number;          // Max 20
  websiteSchemaAeoScore: number;        // Max 15
  visualEngagementScore: number;        // Max 10
  totalScore: number;                   // Max 100
  grade: "CRITICAL_VISIBILITY_LEAK" | "MODERATE_LEAK" | "TOP3_COMPETITIVE";
}

/**
 * 100-Point Competitor Spy Scoring Engine (Section 3.3)
 */
export function calculateCompetitorSpyScore(input: CompetitorSpyInput): CompetitorSpyScoreResult {
  // 1. Category Alignment (Max 25 Pts)
  const primaryPts = input.primaryCategoryMatchesTop1 ? 15 : 0;
  const secRatio = input.top3AvgSecondaryCategoryCount > 0
    ? (input.merchantSecondaryCategoryCount / input.top3AvgSecondaryCategoryCount)
    : 1;
  const secondaryPts = Math.min(10, Math.round(secRatio * 10));
  const categoryAlignmentScore = primaryPts + secondaryPts;

  // 2. Review Volume & 30-Day Velocity (Max 30 Pts)
  const totalRevRatio = input.top3AvgTotalReviews > 0
    ? (input.merchantTotalReviews / input.top3AvgTotalReviews)
    : 1;
  const totalRevPts = Math.min(10, Math.round(totalRevRatio * 10));

  const velocityRatio = input.top3AvgReviewsLast30Days > 0
    ? (input.merchantReviewsLast30Days / input.top3AvgReviewsLast30Days)
    : 1;
  const velocityPts = Math.min(20, Math.round(velocityRatio * 20));
  const reviewVolumeAndVelocityScore = totalRevPts + velocityPts;

  // 3. Review Keyword Density (Max 20 Pts)
  const kwRatio = input.top3AvgKeywordMentionsInSample > 0
    ? (input.merchantKeywordMentionsInSample / input.top3AvgKeywordMentionsInSample)
    : 1;
  const keywordDensityScore = Math.min(20, Math.round(kwRatio * 20));

  // 4. Website, Schema & AEO Readiness (Max 15 Pts)
  let websiteSchemaAeoScore = 0;
  if (input.hasDedicatedWebsite) websiteSchemaAeoScore += 5;
  if (input.hasLocalBusinessSchema) websiteSchemaAeoScore += 5;
  if (input.hasFaqSchemaAndH1Locality) websiteSchemaAeoScore += 5;

  // 5. Visual & Owner Engagement (Max 10 Pts)
  const photoRatio = input.top3AvgPhotoCount > 0
    ? (input.merchantPhotoCount / input.top3AvgPhotoCount)
    : 1;
  const photoPts = Math.min(5, Math.round(photoRatio * 5));
  const replyPts = Math.min(5, Math.round(Math.max(0, Math.min(1, input.ownerReviewReplyRate)) * 5));
  const visualEngagementScore = photoPts + replyPts;

  const totalScore = categoryAlignmentScore +
    reviewVolumeAndVelocityScore +
    keywordDensityScore +
    websiteSchemaAeoScore +
    visualEngagementScore;

  let grade: "CRITICAL_VISIBILITY_LEAK" | "MODERATE_LEAK" | "TOP3_COMPETITIVE" = "CRITICAL_VISIBILITY_LEAK";
  if (totalScore >= 70) {
    grade = "TOP3_COMPETITIVE";
  } else if (totalScore >= 40) {
    grade = "MODERATE_LEAK";
  }

  return {
    categoryAlignmentScore,
    reviewVolumeAndVelocityScore,
    keywordDensityScore,
    websiteSchemaAeoScore,
    visualEngagementScore,
    totalScore,
    grade,
  };
}
