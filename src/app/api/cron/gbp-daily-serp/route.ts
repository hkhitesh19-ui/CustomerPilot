import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMerchantTrackedKeywords } from "@/lib/gbp/keyword-bank";
import { partitionTop10Portfolio } from "@/lib/gbp/portfolio-engine";
import {
  fetchLiveGoogleMapsRank,
  resolveMerchantCoordinates,
} from "@/lib/gbp/live-serp-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Daily 09:00 AM IST SERP & GEO Tracking Engine (Live Google Places API v1)
 * Runs daily at 09:00 AM IST (03:30 UTC).
 * Queries Google Places API (New v1) with GPS locationBias for every tracked keyword,
 * computes real rank movement delta vs yesterday, and persists to GbpKeywordDailyRank.
 */
export async function GET(req: NextRequest) {
  return handleDailyScan(req);
}

export async function POST(req: NextRequest) {
  return handleDailyScan(req);
}

async function handleDailyScan(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetMerchantId = searchParams.get("merchantId");
    const maxKeywordsPerMerchant = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "30", 10))
    );

    // Format today's date string in IST (Asia/Kolkata)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const todayStr = istDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const yesterdayDate = new Date(istDate.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

    // Target active GBP merchants (or a specific merchantId if passed)
    const whereClause: any = targetMerchantId
      ? { id: targetMerchantId }
      : {
          status: "active",
          OR: [
            { gbpServiceTrack: { in: ["TRACK_A_NEW", "TRACK_B_EXISTING"] } },
            { id: { in: ["cmtymavfx0002kx008lbfvp57", "customerpilot-hq"] } },
          ],
        };

    const merchants = await db.merchant.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        businessType: true,
        city: true,
        address: true,
        category: true,
        gbpServiceTrack: true,
        merchantGoogleConnections: {
          select: { placeId: true, gbpLocationId: true },
        },
      },
    });

    let totalKeywordsUpdated = 0;
    let totalLiveQueriesSucceeded = 0;
    let totalOfflineFallbacks = 0;
    let merchantsProcessed = 0;
    const merchantSummaries: Array<{
      merchantId: string;
      merchantName: string;
      keywordsScanned: number;
      liveQueries: number;
      top3Count: number;
      avgRank: number;
    }> = [];

    for (const merchant of merchants) {
      // 1. Ensure MerchantTrackedKeyword is seeded for this merchant
      let dbKeywords = await db.merchantTrackedKeyword.findMany({
        where: { merchantId: merchant.id, isActive: true },
        orderBy: [{ isPortfolioTarget: "desc" }, { searchVolume: "desc" }],
      });

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
          await db.merchantTrackedKeyword
            .upsert({
              where: {
                merchantId_keyword: {
                  merchantId: merchant.id,
                  keyword: p.keyword,
                },
              },
              create: {
                merchantId: merchant.id,
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
              update: {},
            })
            .catch(() => {});
        }

        dbKeywords = await db.merchantTrackedKeyword.findMany({
          where: { merchantId: merchant.id, isActive: true },
          orderBy: [{ isPortfolioTarget: "desc" }, { searchVolume: "desc" }],
        });
      }

      const keywordsToScan = dbKeywords.slice(0, maxKeywordsPerMerchant);
      const coords = resolveMerchantCoordinates(merchant);

      // Resolve real Google Place ID (ignore placeholder IDs)
      const rawPlaceId = merchant.merchantGoogleConnections?.placeId;
      const placeId =
        rawPlaceId && !rawPlaceId.includes("CustomerPilotVadodaraHQ")
          ? rawPlaceId
          : merchant.id === "customerpilot-hq" || merchant.id === "cmw1vwviv06f3kvwlkx62ghap"
          ? "ChIJnZHNfaa7HmwRceqGnkPiMJw"
          : merchant.id === "cmtymavfx0002kx008lbfvp57"
          ? "ChIJc7ija2zFXzkR8DbOxXEfaM4"
          : rawPlaceId;

      merchantsProcessed++;
      let mLiveCount = 0;
      let mTop3 = 0;
      let mRankSum = 0;
      let latestLiveReviewCount: number | null = null;
      let latestLiveRating: number | null = null;

      // Scan keywords sequentially in small batches of 4 to avoid rate-limiting Google Places API
      const batchSize = 4;
      for (let i = 0; i < keywordsToScan.length; i += batchSize) {
        const batch = keywordsToScan.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (kw) => {
            // Find most recent prior rank in DB for accurate delta calculation
            const prevRecord = await db.gbpKeywordDailyRank.findFirst({
              where: {
                merchantId: merchant.id,
                keyword: kw.keyword,
                snapshotDate: { lt: todayStr },
              },
              orderBy: { snapshotDate: "desc" },
            });

            const fallbackRank = prevRecord?.rankPosition || kw.baselineRank || 10;

            const liveResult = await fetchLiveGoogleMapsRank({
              keyword: kw.keyword,
              city: kw.targetCity || merchant.city || "Vadodara",
              placeId,
              businessName: merchant.name,
              lat: coords.lat,
              lng: coords.lng,
              radiusMeters: 5000,
              fallbackRank,
            });

            const previousRank = prevRecord ? prevRecord.rankPosition : kw.baselineRank;

            await db.gbpKeywordDailyRank.upsert({
              where: {
                merchantId_keyword_snapshotDate: {
                  merchantId: merchant.id,
                  keyword: kw.keyword,
                  snapshotDate: todayStr,
                },
              },
              create: {
                merchantId: merchant.id,
                keyword: kw.keyword,
                keywordType: kw.keywordType,
                rankPosition: liveResult.rankPosition,
                previousRank,
                searchVolume: kw.searchVolume,
                locality: kw.targetLocality || merchant.city || "Vadodara",
                targetCity: kw.targetCity || merchant.city || "Vadodara",
                serpFeature: kw.serpFeature,
                snapshotDate: todayStr,
                capturedAt: now,
              },
              update: {
                rankPosition: liveResult.rankPosition,
                previousRank,
                searchVolume: kw.searchVolume,
                locality: kw.targetLocality || merchant.city || "Vadodara",
                serpFeature: kw.serpFeature,
                capturedAt: now,
              },
            });

            return liveResult;
          })
        );

        for (const r of batchResults) {
          totalKeywordsUpdated++;
          mRankSum += r.rankPosition;
          if (r.rankPosition <= 3) mTop3++;
          if (r.dataSource === "GOOGLE_PLACES_V1_LIVE") {
            totalLiveQueriesSucceeded++;
            mLiveCount++;
          } else {
            totalOfflineFallbacks++;
          }
          if (r.merchantReviewCount !== null) latestLiveReviewCount = r.merchantReviewCount;
          if (r.merchantRating !== null) latestLiveRating = r.merchantRating;
        }
      }

      // Sync real live review count & rating onto Merchant record
      if (latestLiveReviewCount !== null || latestLiveRating !== null) {
        await db.merchant
          .update({
            where: { id: merchant.id },
            data: {
              ...(latestLiveReviewCount !== null ? { gbpReviewCount: latestLiveReviewCount } : {}),
              ...(latestLiveRating !== null ? { baselineRating: latestLiveRating } : {}),
            },
          })
          .catch(() => {});
      }

      merchantSummaries.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        keywordsScanned: keywordsToScan.length,
        liveQueries: mLiveCount,
        top3Count: mTop3,
        avgRank:
          keywordsToScan.length > 0
            ? Number((mRankSum / keywordsToScan.length).toFixed(1))
            : 0,
      });
    }

    return NextResponse.json({
      ok: true,
      success: true,
      message: `Daily 09:00 AM IST SERP scan completed (${totalLiveQueriesSucceeded} live Google Places queries, ${totalOfflineFallbacks} fallbacks)`,
      scanDate: todayStr,
      yesterdayRef: yesterdayStr,
      merchantsProcessed,
      totalKeywordsUpdated,
      totalLiveQueriesSucceeded,
      totalOfflineFallbacks,
      merchantSummaries,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("[CRON_DAILY_SERP_ERROR]", error);
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: error.message || "Failed to execute daily SERP scan",
      },
      { status: 500 }
    );
  }
}
