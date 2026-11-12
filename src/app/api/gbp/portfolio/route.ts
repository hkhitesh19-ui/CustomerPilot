import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMerchantTrackedKeywords } from "@/lib/gbp/keyword-bank";
import { partitionTop10Portfolio, computeKeyword6PillarScore } from "@/lib/gbp/portfolio-engine";

export const dynamic = "force-dynamic";

/**
 * Module 6: 10-Keyword Target Portfolio API
 * Manages the 6-pillar weighted selection, locking, and performance monitoring.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");

    if (!merchantId) {
      return NextResponse.json({ ok: false, error: "merchantId is required" }, { status: 400 });
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, name: true, city: true, businessType: true, gbpServiceTrack: true },
    });

    if (!merchant) {
      return NextResponse.json({ ok: false, error: "Merchant not found" }, { status: 404 });
    }

    // 1. Fetch keywords from DB
    let dbKeywords = await db.merchantTrackedKeyword.findMany({
      where: { merchantId },
      orderBy: [{ isPortfolioTarget: "desc" }, { commercialScore: "desc" }],
    });

    // Auto-seed if 0 in DB
    if (dbKeywords.length === 0) {
      const defaults = getMerchantTrackedKeywords(merchant);
      const partitioned = partitionTop10Portfolio(
        defaults.map((d) => ({
          keyword: d.keyword,
          type: d.type,
          searchVolume: d.searchVolume,
          currentRank: d.currentRank,
          baselineRank: d.baselineRank,
          locality: d.locality,
        }))
      );

      for (const p of partitioned) {
        await db.merchantTrackedKeyword.create({
          data: {
            merchantId,
            keyword: p.keyword,
            keywordType: p.keywordType,
            targetLocality: p.targetLocality,
            targetCity: merchant.city || "Vadodara",
            searchVolume: p.searchVolume,
            baselineRank: p.baselineRank,
            isPortfolioTarget: p.isPortfolioTarget,
            portfolioCategory: p.portfolioCategory,
            commercialScore: p.commercialScore,
            relevanceScore: p.relevanceScore,
            intentScore: p.intentScore,
            demandScore: p.demandScore,
            opportunityScore: p.opportunityScore,
            profitabilityScore: p.profitabilityScore,
            competitionScore: p.competitionScore,
            portfolioLockedAt: p.isPortfolioTarget ? new Date() : null,
          },
        });
      }

      dbKeywords = await db.merchantTrackedKeyword.findMany({
        where: { merchantId },
        orderBy: [{ isPortfolioTarget: "desc" }, { commercialScore: "desc" }],
      });
    }

    // Check if portfolio targets are already set
    let portfolio = dbKeywords.filter((k) => k.isPortfolioTarget);

    // If none are tagged as portfolio target, auto-compute and update
    if (portfolio.length === 0) {
      const partitioned = partitionTop10Portfolio(
        dbKeywords.map((d) => ({
          keyword: d.keyword,
          type: d.keywordType,
          searchVolume: d.searchVolume,
          currentRank: d.baselineRank,
          baselineRank: d.baselineRank,
          locality: d.targetLocality,
        }))
      );

      for (const p of partitioned) {
        await db.merchantTrackedKeyword.update({
          where: {
            merchantId_keyword: {
              merchantId,
              keyword: p.keyword,
            },
          },
          data: {
            isPortfolioTarget: p.isPortfolioTarget,
            portfolioCategory: p.isPortfolioTarget ? p.portfolioCategory : null,
            commercialScore: p.commercialScore,
            relevanceScore: p.relevanceScore,
            intentScore: p.intentScore,
            demandScore: p.demandScore,
            opportunityScore: p.opportunityScore,
            profitabilityScore: p.profitabilityScore,
            competitionScore: p.competitionScore,
            portfolioLockedAt: p.isPortfolioTarget ? new Date() : null,
          },
        });
      }

      dbKeywords = await db.merchantTrackedKeyword.findMany({
        where: { merchantId },
        orderBy: [{ isPortfolioTarget: "desc" }, { commercialScore: "desc" }],
      });
      portfolio = dbKeywords.filter((k) => k.isPortfolioTarget);
    }

    // Fetch latest daily ranks to attach current ranking
    const latestRanks = await db.gbpKeywordDailyRank.findMany({
      where: { merchantId },
      orderBy: { capturedAt: "desc" },
      take: 100,
    });
    const rankMap = new Map<string, number>();
    for (const lr of latestRanks) {
      if (!rankMap.has(lr.keyword)) {
        rankMap.set(lr.keyword, lr.rankPosition);
      }
    }

    // Attach real live rank
    const enrichedPortfolio = portfolio.map((k) => {
      const liveRank = rankMap.get(k.keyword) || k.baselineRank;
      const rankDelta = k.baselineRank - liveRank;
      return {
        ...k,
        currentRank: liveRank,
        rankDelta,
      };
    });

    const opportunityCount = enrichedPortfolio.filter((k) => k.portfolioCategory === "OPPORTUNITY").length;
    const highValueCount = enrichedPortfolio.filter((k) => k.portfolioCategory === "HIGH_VALUE").length;
    const strategicCount = enrichedPortfolio.filter((k) => k.portfolioCategory === "STRATEGIC").length;
    const lockedAt = enrichedPortfolio[0]?.portfolioLockedAt || new Date().toISOString();

    return NextResponse.json({
      ok: true,
      merchant: {
        id: merchant.id,
        name: merchant.name,
      },
      isLocked: true,
      lockedAt,
      portfolioCount: enrichedPortfolio.length,
      portfolioClusters: {
        opportunity: {
          count: opportunityCount,
          target: 5,
          label: "Opportunity Keywords (Striking Distance)",
          keywords: enrichedPortfolio.filter((k) => k.portfolioCategory === "OPPORTUNITY"),
        },
        highValue: {
          count: highValueCount,
          target: 3,
          label: "High-Value Service Keywords (Core Revenue)",
          keywords: enrichedPortfolio.filter((k) => k.portfolioCategory === "HIGH_VALUE"),
        },
        strategic: {
          count: strategicCount,
          target: 2,
          label: "Long-Term Strategic Keywords (City Authority)",
          keywords: enrichedPortfolio.filter((k) => k.portfolioCategory === "STRATEGIC"),
        },
      },
      portfolio: enrichedPortfolio,
      allKeywords: dbKeywords.map((k) => ({
        ...k,
        currentRank: rankMap.get(k.keyword) || k.baselineRank,
      })),
    });
  } catch (error: any) {
    console.error("[GBP_PORTFOLIO_GET_ERROR]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to fetch portfolio" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantId, action, targetKeywords } = body;

    if (!merchantId) {
      return NextResponse.json({ ok: false, error: "merchantId is required" }, { status: 400 });
    }

    if (action === "LOCK_CUSTOM" && Array.isArray(targetKeywords)) {
      // Reset all
      await db.merchantTrackedKeyword.updateMany({
        where: { merchantId },
        data: { isPortfolioTarget: false },
      });

      // Update selected
      for (const item of targetKeywords) {
        await db.merchantTrackedKeyword.update({
          where: {
            merchantId_keyword: {
              merchantId,
              keyword: item.keyword,
            },
          },
          data: {
            isPortfolioTarget: true,
            portfolioCategory: item.portfolioCategory || "OPPORTUNITY",
            portfolioLockedAt: new Date(),
          },
        });
      }

      return NextResponse.json({ ok: true, message: "Target 10-keyword portfolio successfully locked" });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[GBP_PORTFOLIO_POST_ERROR]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to update portfolio" }, { status: 500 });
  }
}
