import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { fetchLiveGbpPerformance } from "@/lib/gbp/live-analytics-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/gbp/analytics?merchantId=...
 *
 * 100% Ground-Truth GBP Analytics API:
 * - Real 30-Day Telemetry & Discovery Keywords from Google Business Profile Performance API
 * - Real Latest Keyword Rankings from GbpKeywordDailyRank (captured by Daily 9 AM SERP Cron)
 * - Real Latest 5x5 Geo-Grid Points from GbpGeoGridScan
 * Zero hardcoded demo metrics.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");
    if (!merchantId) return err("merchantId is required", 400);

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      include: {
        merchantGoogleConnections: true,
      },
    });

    if (!merchant) return err("Merchant not found", 404);

    // 1. Fetch LIVE 30-day Google Business Profile Performance Telemetry
    const liveTelemetry = await fetchLiveGbpPerformance(merchantId);

    // 2. Fetch REAL latest keyword rankings from GbpKeywordDailyRank
    const latestRankRows = await db.gbpKeywordDailyRank.findMany({
      where: { merchantId },
      orderBy: [{ snapshotDate: "desc" }, { rankPosition: "asc" }],
      take: 40,
    });

    const latestDate = latestRankRows[0]?.snapshotDate || null;
    const latestDayRows = latestDate
      ? latestRankRows.filter((r) => r.snapshotDate === latestDate)
      : [];

    const keywords = latestDayRows.slice(0, 12).map((r) => ({
      keyword: r.keyword,
      currentRank: r.rankPosition,
      previousRank: r.previousRank,
      change: r.previousRank - r.rankPosition, // positive = rank improved
      searchVolume: r.searchVolume,
      intent: r.keywordType === "GEO" ? "Local" : r.keywordType === "AEO" ? "Conversational" : "Commercial",
      snapshotDate: r.snapshotDate,
    }));

    // 3. Fetch REAL latest Geo-Grid scan from GbpGeoGridScan
    const latestScan = await db.gbpGeoGridScan.findFirst({
      where: { merchantId },
      orderBy: { scannedAt: "desc" },
    });

    let geoGridPoints: Array<{
      point: string;
      area: string;
      rank: number;
      distance: string;
      isCenter?: boolean;
    }> = [];
    let top3Count = 0;
    let totalPoints = 0;
    let gridScorePct = 0;

    if (latestScan?.pointsJson) {
      try {
        const parsed: any[] = JSON.parse(latestScan.pointsJson);
        totalPoints = parsed.length;
        top3Count = parsed.filter((p) => Number(p.rank) <= 3).length;
        gridScorePct = Math.round(latestScan.top3CoveragePct || (totalPoints > 0 ? (top3Count / totalPoints) * 100 : 0));
        geoGridPoints = parsed.slice(0, 9).map((p) => ({
          point: p.bearing || "C",
          area: p.localityName || merchant.city || "Vadodara",
          rank: Number(p.rank) || 21,
          distance: `${p.distanceKm ?? 0} km`,
          isCenter: p.bearing === "CENTER",
        }));
      } catch {
        // Invalid JSON in scan record; return empty grid
      }
    }

    return ok({
      merchantId: merchant.id,
      merchantName: merchant.name,
      locality: merchant.address || merchant.city || "Vadodara",
      dataSource: liveTelemetry.dataSource,
      latestKeywordSnapshotDate: latestDate,
      keywords,
      topGoogleSearchKeywords: liveTelemetry.topSearchKeywords,
      geoGrid: {
        points: geoGridPoints,
        top3Count,
        totalPoints,
        gridScorePct,
        lastScannedAt: latestScan?.scannedAt?.toISOString() || null,
      },
      telemetry: {
        dataSource: liveTelemetry.dataSource,
        period: liveTelemetry.period,
        totalInteractions: liveTelemetry.totalInteractions,
        interactionsGrowthPct: liveTelemetry.interactionsGrowthPct,
        phoneCalls: liveTelemetry.phoneCalls,
        directions: liveTelemetry.directions,
        websiteClicks: liveTelemetry.websiteClicks,
        totalImpressions: liveTelemetry.totalImpressions,
        impressionsGrowthPct: liveTelemetry.impressionsGrowthPct,
        searchQueries: liveTelemetry.searchQueries,
        platforms: liveTelemetry.platforms,
        lastCapturedAt: liveTelemetry.lastCapturedAt,
        error: liveTelemetry.error,
      },
    });
  } catch (error: any) {
    console.error("[GBP Analytics API Error]:", error);
    return err("Failed to fetch GBP analytics", 500, { details: error.message });
  }
}
