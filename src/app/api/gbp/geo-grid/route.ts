import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generate5x5GeoGrid, GeoGridScanResult } from "@/lib/gbp/geo-grid-engine";
import { getMerchantTrackedKeywords } from "@/lib/gbp/keyword-bank";

export const dynamic = "force-dynamic";

/**
 * Module 1 & 4: 5x5 Geo-Grid Ranking API
 * Endpoint: /api/gbp/geo-grid
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");
    let keyword = searchParams.get("keyword");
    const radiusKm = parseFloat(searchParams.get("radiusKm") || "5.0");
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    if (!merchantId) {
      return NextResponse.json({ ok: false, error: "merchantId is required" }, { status: 400 });
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, name: true, city: true, address: true },
    });

    if (!merchant) {
      return NextResponse.json({ ok: false, error: "Merchant not found" }, { status: 404 });
    }

    // 1. Get tracked keywords list for dropdown selection
    const trackedKeywords = await db.merchantTrackedKeyword.findMany({
      where: { merchantId },
      orderBy: [{ isPortfolioTarget: "desc" }, { searchVolume: "desc" }],
      select: {
        keyword: true,
        keywordType: true,
        searchVolume: true,
        baselineRank: true,
        isPortfolioTarget: true,
        portfolioCategory: true,
      },
    });

    // If keyword is not specified, default to first tracked keyword or fallback
    if (!keyword) {
      if (trackedKeywords.length > 0) {
        keyword = trackedKeywords[0].keyword;
      } else {
        const defaults = getMerchantTrackedKeywords(merchant);
        keyword = defaults[0]?.keyword || "cake shop in manjalpur";
      }
    }

    // Determine current live rank for this keyword
    const latestRankRecord = await db.gbpKeywordDailyRank.findFirst({
      where: { merchantId, keyword },
      orderBy: { capturedAt: "desc" },
    });

    const baseRank = latestRankRecord?.rankPosition || 2;

    // 2. Check if a recent scan exists in DB (unless forceRefresh requested)
    let scanRecord: any = null;
    if (!forceRefresh) {
      scanRecord = await db.gbpGeoGridScan.findFirst({
        where: { merchantId, keyword },
        orderBy: { scannedAt: "desc" },
      });
    }

    let scanResult: GeoGridScanResult;

    if (scanRecord && !forceRefresh) {
      try {
        const points = JSON.parse(scanRecord.pointsJson);
        scanResult = {
          merchantId: scanRecord.merchantId,
          keyword: scanRecord.keyword,
          centerLat: scanRecord.centerLat,
          centerLng: scanRecord.centerLng,
          radiusKm: scanRecord.radiusKm,
          gridSize: scanRecord.gridSize,
          top3CoveragePct: scanRecord.top3CoveragePct,
          top10CoveragePct: scanRecord.top10CoveragePct,
          avgRank: scanRecord.avgRank,
          centerRank: baseRank,
          points,
          scannedAt: scanRecord.scannedAt.toISOString(),
        };
      } catch (parseErr) {
        // Fallback to recalculate if corrupted
        scanResult = generate5x5GeoGrid({
          merchantId,
          merchantName: merchant.name,
          keyword,
          baseRank,
          radiusKm,
        });
      }
    } else {
      // Calculate fresh 25-point scan
      scanResult = generate5x5GeoGrid({
        merchantId,
        merchantName: merchant.name,
        keyword,
        baseRank,
        radiusKm,
      });

      // Persist to DB
      await db.gbpGeoGridScan.create({
        data: {
          merchantId,
          keyword,
          centerLat: scanResult.centerLat,
          centerLng: scanResult.centerLng,
          radiusKm: scanResult.radiusKm,
          gridSize: scanResult.gridSize,
          top3CoveragePct: scanResult.top3CoveragePct,
          top10CoveragePct: scanResult.top10CoveragePct,
          avgRank: scanResult.avgRank,
          pointsJson: JSON.stringify(scanResult.points),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        city: merchant.city || "Vadodara",
        address: merchant.address || "Eva Mall, Manjalpur, Vadodara",
      },
      availableKeywords: trackedKeywords.map((k) => ({
        keyword: k.keyword,
        type: k.keywordType,
        searchVolume: k.searchVolume,
        isPortfolioTarget: k.isPortfolioTarget,
        portfolioCategory: k.portfolioCategory,
      })),
      scan: scanResult,
    });
  } catch (error: any) {
    console.error("[GEO_GRID_GET_ERROR]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to load geo grid" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantId, keyword, radiusKm = 5.0 } = body;

    if (!merchantId || !keyword) {
      return NextResponse.json({ ok: false, error: "merchantId and keyword are required" }, { status: 400 });
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, name: true },
    });

    if (!merchant) {
      return NextResponse.json({ ok: false, error: "Merchant not found" }, { status: 404 });
    }

    const latestRankRecord = await db.gbpKeywordDailyRank.findFirst({
      where: { merchantId, keyword },
      orderBy: { capturedAt: "desc" },
    });

    const baseRank = latestRankRecord?.rankPosition || 2;

    const scanResult = generate5x5GeoGrid({
      merchantId,
      merchantName: merchant.name,
      keyword,
      baseRank,
      radiusKm: parseFloat(radiusKm),
    });

    const saved = await db.gbpGeoGridScan.create({
      data: {
        merchantId,
        keyword,
        centerLat: scanResult.centerLat,
        centerLng: scanResult.centerLng,
        radiusKm: scanResult.radiusKm,
        gridSize: scanResult.gridSize,
        top3CoveragePct: scanResult.top3CoveragePct,
        top10CoveragePct: scanResult.top10CoveragePct,
        avgRank: scanResult.avgRank,
        pointsJson: JSON.stringify(scanResult.points),
      },
    });

    return NextResponse.json({
      ok: true,
      scanId: saved.id,
      scan: scanResult,
      message: `25-point Geo-Grid scan refreshed for "${keyword}"`,
    });
  } catch (error: any) {
    console.error("[GEO_GRID_POST_ERROR]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to run geo grid scan" }, { status: 500 });
  }
}