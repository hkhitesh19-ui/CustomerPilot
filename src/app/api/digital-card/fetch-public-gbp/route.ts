import { NextRequest, NextResponse } from "next/server"
import { searchGooglePlaces, getPlaceDetails } from "@/lib/google-places-api"

/** Attempt to resolve a short/redirect URL to its final destination */
async function resolveRedirectUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return res.url || url
  } catch {
    return url
  }
}

/** Extract business name from a full Google Maps URL */
function extractBusinessNameFromUrl(mapsUrl: string): string | null {
  // Standard place URL: /maps/place/BusinessName/@...
  const placeMatch = mapsUrl.match(/\/maps\/place\/([^/@?]+)/)
  if (placeMatch && placeMatch[1]) {
    const decoded = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ")
    // If it looks like a URL, reject it
    if (decoded.startsWith("http")) return null
    return decoded
  }

  // Query string: ?q=BusinessName
  const qMatch = mapsUrl.match(/[?&]q=([^&]+)/)
  if (qMatch && qMatch[1]) {
    const decoded = decodeURIComponent(qMatch[1]).replace(/\+/g, " ")
    if (decoded.startsWith("http")) return null
    return decoded
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, mapsUrl } = body

    let searchQuery = (query || mapsUrl || "").trim()

    if (!searchQuery) {
      return NextResponse.json(
        { success: false, error: "Please provide a Business Name or Google Maps Link" },
        { status: 400 }
      )
    }

    // Try Google Places API first if configured
    if (process.env.GOOGLE_PLACES_API_KEY) {
      try {
        const searchRes = await searchGooglePlaces(searchQuery)
        if (searchRes.results && searchRes.results.length > 0) {
          const topResult = searchRes.results[0]
          const details = await getPlaceDetails(topResult.placeId)

          const categories = (details.types || [])
            .filter((t) => !["point_of_interest", "establishment"].includes(t))
            .map((t) => t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
            .slice(0, 4)
            .join(" • ")

          return NextResponse.json({
            success: true,
            source: "google_places_api",
            details: {
              displayName: details.displayName.text,
              locationShort: details.shortAddress || details.formattedAddress.split(",")[0],
              locationState: details.formattedAddress.split(",").slice(1, 3).join(",").trim(),
              phoneNumber: details.nationalPhoneNumber || "",
              googleRating: details.rating || 4.6,
              googleReviewsCnt: details.userRatingCount || 100,
              subCategories: categories || "",
              googleMapsUrl: details.googleMapsUri,
              websiteUrl: details.websiteUri || "",
              businessHours: details.currentOpeningHours?.openNow
                ? "Open Daily • 9:00 AM – 12:00 AM"
                : "Open Daily • 9:00 AM – 12:00 AM",
              deliveryInfo: "Delivery Available • Local City Only",
            },
          })
        }
      } catch (apiErr) {
        console.warn("[FETCH_GBP_API_FALLBACK]", apiErr)
      }
    }

    // ─── Public Smart Parser Fallback (No OAuth or API key required) ──────────

    // STEP 1: If query looks like a URL, try to resolve short URLs first
    const isUrl = searchQuery.startsWith("http://") || searchQuery.startsWith("https://")

    if (isUrl) {
      // Short URL patterns that require redirect resolution
      const isShortUrl =
        searchQuery.includes("share.google") ||
        searchQuery.includes("maps.app.goo.gl") ||
        searchQuery.includes("goo.gl")

      if (isShortUrl) {
        console.log("[FETCH_GBP] Short URL detected, resolving redirect...")
        searchQuery = await resolveRedirectUrl(searchQuery)
        console.log("[FETCH_GBP] Resolved to:", searchQuery)
      }

      // STEP 2: Try to extract business name from the (possibly resolved) URL
      const businessName = extractBusinessNameFromUrl(searchQuery)

      if (!businessName) {
        // Could not parse a valid business name from the URL
        return NextResponse.json(
          {
            success: false,
            error:
              "Could not extract business name from this link. Please paste a full Google Maps place URL (e.g., maps.google.com/maps/place/YourBusiness/...) or just type your business name directly.",
          },
          { status: 422 }
        )
      }

      // STEP 3: Build a clean location hint from the name
      const words = businessName.split(" ")
      const locationHint = words.length > 1 ? words[words.length - 1] : businessName

      return NextResponse.json({
        success: true,
        source: "public_smart_parser",
        partial: true, // Signal to frontend: this is partial/approximate — confirm before saving
        details: {
          displayName: businessName,
          locationShort: `${locationHint}`,
          locationState: "India",
          phoneNumber: "",
          googleRating: null,
          googleReviewsCnt: null,
          subCategories: "",
          googleMapsUrl: searchQuery,
          websiteUrl: "",
          businessHours: "",
          deliveryInfo: "",
        },
      })
    }

    // STEP 4: Plain text business name search — return as-is with empty placeholders
    // (no fabricated data like fake ratings, fake categories, fake phone numbers)
    return NextResponse.json({
      success: true,
      source: "manual_entry",
      partial: true,
      details: {
        displayName: searchQuery,
        locationShort: "",
        locationState: "India",
        phoneNumber: "",
        googleRating: null,
        googleReviewsCnt: null,
        subCategories: "",
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(searchQuery)}`,
        websiteUrl: "",
        businessHours: "",
        deliveryInfo: "",
      },
    })
  } catch (error: any) {
    console.error("[API_FETCH_PUBLIC_GBP]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
