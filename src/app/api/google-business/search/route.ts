// GET /api/google-business/search?q=business+name
// Search for businesses using Google Places API (or z-ai fallback)
import { NextRequest } from "next/server"
import { searchPlaces } from "@/lib/google-places-api"
import { ok, err } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get("q")
    const location = url.searchParams.get("location") // Optional: lat,lng
    const type = url.searchParams.get("type") // Optional business type filter

    if (!query || query.trim().length < 2) {
      return err("Search query (q) is required, minimum 2 characters", 400)
    }

    // Parse optional location bias
    let locationBias: { lat: number; lng: number } | undefined
    if (location) {
      const [lat, lng] = location.split(",").map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        locationBias = { lat, lng }
      }
    }

    // Perform search using Google Places API (with z-ai fallback)
    const results = await searchPlaces(query, {
      location: locationBias,
      radius: 25000, // 25km radius
      language: "en",
      includedTypes: type ? [type] : undefined,
    })

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
      // API info for transparency
      apiInfo: {
        provider: process.env.GOOGLE_PLACES_API_KEY ? "google_places_api" : "z_ai_search_fallback",
        officialPlaceIds: !results.results.some(r => r.placeId.startsWith("manual_")),
      },
    })
  } catch (error: any) {
    console.error("[API] Google search error:", error.message)
    
    if (error.message.includes("SEARCH_QUERY_REQUIRED")) {
      return err(error.message, 400)
    }
    
    return err(`Search failed: ${error.message}`, 500)
  }
}
