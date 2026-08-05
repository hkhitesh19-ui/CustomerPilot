// GET /api/google/places-search?q=query
import { NextRequest } from "next/server"
import { searchPlaces } from "@/lib/google-places-api"
import { ok, err } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get("q") || ""

    if (!query.trim()) {
      return err("Search query (q) is required", 400)
    }

    const results = await searchPlaces(query)

    return ok({
      query: results.searchQuery,
      totalResults: results.totalResults,
      hasMore: results.hasMore,
      timestamp: results.timestamp.toISOString(),
      results: results.results.map(place => ({
        placeId: place.placeId,
        name: place.displayName.text,
        address: place.formattedAddress,
        shortAddress: place.shortAddress,
        types: place.types,
        rating: place.rating,
        reviewCount: place.userRatingCount,
        isManualEntry: place.placeId.startsWith("manual_"),
      })),
    })
  } catch (error: any) {
    console.error("[API] Google places search error:", error.message)
    return err(error.message || "Failed to search Google Places", 500)
  }
}
