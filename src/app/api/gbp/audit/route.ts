import { NextRequest } from "next/server"
import { ok, err } from "@/lib/api"
import { searchPlaces } from "@/lib/google-places-api"
import { calculateGbpAudit, RealCompetitorInput } from "@/lib/gbp-audit-engine"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessName, category = "Retail Store", locality = "Vadodara", currentReviews = 0, currentRank = 0 } = body

    if (!businessName || typeof businessName !== "string" || !businessName.trim()) {
      return err("Business Name is required for audit", 400)
    }

    const cleanName = businessName.trim()
    const cleanCat = category.trim()
    const cleanLoc = locality.trim()

    // 1. Google Places API lookup:
    let realPlace: any = null
    let realCompetitors: RealCompetitorInput[] = []
    let detectedRank = Number(currentRank) || 0
    let isLiveGoogleData = false
    const isPlacesEnabled = process.env.GBP_PLACES_ENABLED !== "false"

    if (isPlacesEnabled) {
      try {
        // Query A: Search for the merchant's own business profile
        const placesResult = await searchPlaces(`${cleanName} ${cleanLoc}`)
        if (placesResult?.results && placesResult.results.length > 0) {
          realPlace = placesResult.results[0]
        }

        // Query B: Search for real local competitors in the same category & locality
        const competitorResult = await searchPlaces(`${cleanCat} in ${cleanLoc}`)
        if (competitorResult?.results && competitorResult.results.length > 0) {
          isLiveGoogleData = true

          // Detect merchant's rank among local search results if not explicitly provided
          const userLower = cleanName.toLowerCase()
          const userIndex = competitorResult.results.findIndex((r: any) => {
            const rName = (r.displayName?.text || "").toLowerCase()
            return (realPlace?.placeId && r.placeId === realPlace.placeId) ||
                   rName.includes(userLower) || userLower.includes(rName)
          })

          if (userIndex !== -1 && !detectedRank) {
            detectedRank = userIndex + 1
          }

          realCompetitors = competitorResult.results.map((r: any, idx: number) => ({
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
        // Fallback gracefully to algorithmic analysis
        console.warn("[GBP Audit] Places API lookup fallback:", e)
      }
    }

    // 2. Pure Mathematical Diagnostic Calculation with Ground-Truth Data
    const auditData = calculateGbpAudit({
      businessName: cleanName,
      category: cleanCat,
      locality: cleanLoc,
      currentReviews: Number(currentReviews) || 0,
      currentRank: detectedRank,
      realPlace,
      realCompetitors,
      isLiveGoogleData,
      dataSource: isLiveGoogleData
        ? "Official Google Maps Platform (Real-Time Places Index)"
        : "Algorithmic Local Pack Benchmark (Simulated)"
    })

    return ok(auditData)
  } catch (error: any) {
    console.error("[GBP Audit API Error]:", error)
    return err(error?.message || "Failed to calculate GBP diagnostic audit", 500)
  }
}
