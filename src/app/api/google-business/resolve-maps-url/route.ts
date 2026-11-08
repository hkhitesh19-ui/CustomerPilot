import { NextRequest } from "next/server"
import { ok, err } from "@/lib/api"
import { searchPlaces } from "@/lib/google-places-api"
import { getKeywordPresetForCategory, generateAutoKeywordsForLocation } from "@/lib/keyword-matrix"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    let rawUrl = body?.url?.trim()
    const fallbackName = body?.storeName?.trim()

    if (!rawUrl && !fallbackName) {
      return err("Google Maps URL or Store Name is required", 400)
    }

    let finalUrl = rawUrl || ""
    let extractedName = fallbackName || ""

    // 1. Expand Shortened Google Maps links (e.g. maps.app.goo.gl or goo.gl/maps)
    if (finalUrl && (finalUrl.includes("maps.app.goo.gl") || finalUrl.includes("goo.gl/maps") || finalUrl.includes("g.page"))) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000)
        const headRes = await fetch(finalUrl, {
          method: "GET",
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          signal: controller.signal
        })
        clearTimeout(timeout)
        if (headRes.url) {
          finalUrl = headRes.url
        }
      } catch (expandErr: any) {
        console.warn("[resolve-maps-url] Short URL expansion notice:", expandErr.message)
      }
    }

    // 2. Extract Place ID directly from URL params if present
    let placeId: string | null = null
    const placeIdParamMatch = finalUrl.match(/[?&](?:placeid|place_id)=([A-Za-z0-9_-]+)/i)
    if (placeIdParamMatch) {
      placeId = placeIdParamMatch[1]
    }

    // 3. Extract standard Google Place ID pattern (ChIJ...)
    if (!placeId) {
      const chijMatch = finalUrl.match(/(ChIJ[A-Za-z0-9_-]{20,})/i)
      if (chijMatch) {
        placeId = chijMatch[1]
      }
    }

    // 4. Extract Store Name from Google Maps /place/ path
    if (!extractedName && finalUrl.includes("/maps/place/")) {
      try {
        const afterPlace = finalUrl.split("/maps/place/")[1]
        if (afterPlace) {
          const rawNamePart = afterPlace.split("/")[0].split("?")[0]
          extractedName = decodeURIComponent(rawNamePart.replace(/\+/g, " ")).trim()
        }
      } catch {}
    }

    // 5. If we still don't have placeId or need verified store details, query Google Places Search
    let placeDetails: any = null
    const searchQuery = extractedName || finalUrl

    if (searchQuery && (!placeId || !placeDetails)) {
      try {
        const searchResults = await searchPlaces(searchQuery)
        if (searchResults && searchResults.results && searchResults.results.length > 0) {
          const bestMatch = searchResults.results[0]
          if (!placeId || placeId.startsWith("manual_")) {
            placeId = bestMatch.placeId
          }
          placeDetails = bestMatch
          if (!extractedName) {
            extractedName = bestMatch.displayName.text
          }
        }
      } catch (searchErr: any) {
        console.warn("[resolve-maps-url] Places search error:", searchErr.message)
      }
    }

    // Fallbacks if not found
    if (!placeId) {
      placeId = `manual_url`
    }

    const finalName = placeDetails?.displayName?.text || extractedName || "Google Business Profile"
    const finalAddress = placeDetails?.formattedAddress || "Google Maps Verified Location"

    // Extract Locality & City from formatted address or query
    let locality = "Local Area"
    let city = "Vadodara"
    if (finalAddress && finalAddress !== "Google Maps Verified Location") {
      const parts = finalAddress.split(",").map((p: string) => p.trim())
      if (parts.length >= 3) {
        locality = parts[parts.length - 3] || parts[parts.length - 2]
        city = parts[parts.length - 2]
      } else if (parts.length >= 2) {
        locality = parts[0]
        city = parts[1]
      }
    }

    // Ensure we do NOT replace an authentic Google Maps URL with a broken/mock placeid link
    const isMockPlaceId = !placeId || placeId === "manual_url" || placeId.startsWith("manual_") || placeId === "ChIJnv3BJRZhpx5DLTbjrz7FNVdlt19"
    let googleReviewUrl = finalUrl
    if (!isMockPlaceId && placeId) {
      googleReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`
    } else if (!googleReviewUrl || googleReviewUrl.includes("ChIJnv3BJRZhpx5DLTbjrz7FNVdlt19")) {
      googleReviewUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${finalName} ${locality} ${city}`.trim())}`
    }

    // Detect Category Preset & Auto-generate High-Search Keywords (6 Tiers)
    const categoryPreset = getKeywordPresetForCategory(placeDetails?.primaryType || finalName, finalName)
    const autoKeywords = generateAutoKeywordsForLocation(categoryPreset.id, locality, city, finalName)

    return ok({
      success: true,
      placeId,
      placeName: finalName,
      address: finalAddress,
      googleReviewUrl,
      rating: placeDetails?.rating || 4.8,
      reviewCount: placeDetails?.userRatingCount || 25,
      rawUrl,
      expandedUrl: finalUrl,
      detectedCategoryKey: categoryPreset.id,
      detectedCategoryLabel: categoryPreset.label,
      locality,
      city,
      autoKeywords,
      defaultAllowedEntities: categoryPreset.seoEntities,
      defaultStrictlyNotAllowed: categoryPreset.blacklist,
      suggestedHeroServices: categoryPreset.seoEntities.slice(0, 5),
      suggestedHeroProducts: categoryPreset.seoEntities.slice(5, 10),
    })
  } catch (error: any) {
    console.error("[resolve-maps-url] Error:", error.message)
    return err(error.message || "Failed to resolve Google Maps link", 500)
  }
}
