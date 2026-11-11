import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { searchPlaces } from "@/lib/google-places-api"
import { calculateGbpAudit, RealCompetitorInput } from "@/lib/gbp-audit-engine"
import { captureGbpSerpScreenshot } from "@/lib/gbp-screenshot-engine"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const merchantId = searchParams.get("merchantId")

    if (!merchantId) {
      return err("merchantId query param is required", 400)
    }

    const reports = await db.gbpAuditReport.findMany({
      where: { merchantId },
      orderBy: { createdAt: "asc" }
    })

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        category: true,
        city: true,
        address: true,
        baselineReviewCount: true,
        baselineRating: true,
        baselineScreenshotUrl: true,
        baselineCapturedAt: true,
        gbpServiceTrack: true,
        gbpProfileStatus: true,
        gbpTrackStartedAt: true
      }
    })

    return ok({ reports, merchant })
  } catch (error: any) {
    console.error("[GBP Audit Reports] GET error:", error)
    return err("Failed to fetch audit reports: " + (error?.message || error), 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      merchantId,
      reportType = "DAY_0_BASELINE",
      reportPeriod = "DAY_0",
      customKeyword,
      forceFreshScreenshot = false
    } = body

    if (!merchantId) {
      return err("merchantId is required", 400)
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId }
    })

    if (!merchant) {
      return err("Merchant not found", 404)
    }

    const cleanName = merchant.name.trim()
    const cleanCat = merchant.category || "Retail Store"
    const cleanLoc = merchant.address || merchant.city || "Vadodara"

    // 1. Google Places API lookup:
    let realPlace: any = null
    let realCompetitors: RealCompetitorInput[] = []
    let detectedRank = 0
    let isLiveGoogleData = false

    try {
      const placesResult = await searchPlaces(`${cleanName} ${cleanLoc}`)
      if (placesResult?.results && placesResult.results.length > 0) {
        realPlace = placesResult.results[0]
      }

      const competitorResult = await searchPlaces(`${cleanCat} in ${cleanLoc}`)
      if (competitorResult?.results && competitorResult.results.length > 0) {
        isLiveGoogleData = true
        const userLower = cleanName.toLowerCase()
        const userIndex = competitorResult.results.findIndex((r: any) => {
          const rName = (r.displayName?.text || "").toLowerCase()
          return (realPlace?.placeId && r.placeId === realPlace.placeId) ||
                 rName.includes(userLower) || userLower.includes(rName)
        })

        if (userIndex !== -1) {
          detectedRank = userIndex + 1
        }

        realCompetitors = competitorResult.results.slice(0, 5).map((r: any, idx: number) => ({
          name: r.displayName?.text || "Local Competitor",
          rating: Number(r.rating) || 4.2,
          reviews: Number(r.userRatingCount) || 0,
          placeId: r.placeId,
          types: r.types || [],
          formattedAddress: r.formattedAddress || "",
          rank: idx + 1
        }))
      }
    } catch (e) {
      console.warn("[GBP Audit Reports] Places lookup fallback:", e)
    }

    // 2. Calculate Audit Scores
    const auditCalc = calculateGbpAudit({
      businessName: cleanName,
      category: cleanCat,
      locality: cleanLoc,
      currentReviews: Number(merchant.gbpReviewCount) || Number(merchant.baselineReviewCount) || 0,
      currentRank: detectedRank || 1,
      realPlace,
      realCompetitors,
      isLiveGoogleData
    })

    const daysSinceStart = merchant.gbpTrackStartedAt
      ? Math.floor((Date.now() - new Date(merchant.gbpTrackStartedAt).getTime()) / 86400000)
      : 0

    // 3. Capture Real-Time Screenshot
    const screenshotRes = await captureGbpSerpScreenshot({
      merchantId,
      businessName: cleanName,
      category: cleanCat,
      locality: cleanLoc,
      currentRank: detectedRank || (reportType === "DAY_0_BASELINE" ? 10 : 3),
      reviewCount: auditCalc.business.currentReviews || 42,
      rating: auditCalc.business.currentRating || 4.6,
      reportPeriod
    })

    // 4. Upsert Audit Report Record in Database
    const existing = await db.gbpAuditReport.findUnique({
      where: {
        merchantId_reportType_reportPeriod: {
          merchantId,
          reportType,
          reportPeriod
        }
      }
    })

    const reportData = {
      merchantId,
      reportType,
      reportPeriod,
      daysSinceOnboarding: daysSinceStart,
      rankScore: auditCalc.audit.overallScore || 75,
      currentRank: detectedRank || (reportType === "DAY_0_BASELINE" ? 10 : 3),
      baselineRank: merchant.baselineReviewCount ? 10 : (detectedRank || 10),
      totalReviews: auditCalc.business.currentReviews,
      starRating: auditCalc.business.currentRating,
      gridScore: reportType === "DAY_0_BASELINE" ? 1 : 7,
      primaryKeyword: customKeyword || `${cleanCat} in ${cleanLoc}`,
      locality: cleanLoc,
      competitorsJson: JSON.stringify(realCompetitors),
      revenueLeakEst: 18500,
      screenshotUrl: screenshotRes.screenshotUrl,
      reportSummary: `Audit completed for ${cleanName}. Identified HIGH optimization opportunity in ${cleanLoc}.`,
      actionItemsJson: JSON.stringify([]),
      pdfDownloadUrl: `/api/gbp/audit-reports/export?merchantId=${merchantId}&period=${reportPeriod}`
    }

    let savedReport: any
    if (existing) {
      savedReport = await db.gbpAuditReport.update({
        where: { id: existing.id },
        data: reportData
      })
    } else {
      savedReport = await db.gbpAuditReport.create({
        data: reportData
      })
    }

    // 5. If Day 0 Baseline, sync Merchant baseline fields
    if (reportType === "DAY_0_BASELINE") {
      await db.merchant.update({
        where: { id: merchantId },
        data: {
          baselineReviewCount: auditCalc.business.currentReviews,
          baselineRating: auditCalc.business.currentRating,
          baselineScreenshotUrl: screenshotRes.screenshotUrl,
          baselineCapturedAt: new Date()
        }
      })
    }

    return ok({
      report: savedReport,
      auditCalc,
      screenshot: screenshotRes
    })
  } catch (error: any) {
    console.error("[GBP Audit Reports] POST error:", error)
    return err("Failed to generate audit report: " + (error?.message || error), 500)
  }
}
