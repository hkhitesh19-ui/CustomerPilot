import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { searchPlaces } from "@/lib/google-places-api"
import { ok, err } from "@/lib/api"

export const dynamic = "force-dynamic"

function extractCityFromAddress(address?: string | null): string {
  if (!address) return ""
  const parts = address.split(",").map(p => p.trim()).filter(Boolean)

  // Skip known non-city tail values: country names, state+pincode combos
  const SKIP_TOKENS = ["india", "gujarat", "maharashtra", "rajasthan", "karnataka", "kerala", "tamil nadu",
    "andhra pradesh", "telangana", "west bengal", "uttar pradesh", "madhya pradesh", "bihar", "jharkhand",
    "odisha", "assam", "punjab", "haryana", "himachal pradesh", "uttarakhand", "goa", "chhattisgarh",
    "tripura", "meghalaya", "manipur", "nagaland", "arunachal pradesh", "mizoram", "sikkim",
    "jammu & kashmir", "jammu and kashmir", "ladakh", "delhi", "chandigarh", "puducherry"]

  // Walk from end towards start, skip: Country, State, Pincode combos
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]
    const lower = p.toLowerCase().replace(/\s+/g, " ").trim()
    // Skip purely numeric (pincodes)
    if (/^\d+$/.test(p)) continue
    // Skip parts that are ONLY a known state/country name
    if (SKIP_TOKENS.some(tok => lower === tok)) continue
    // Skip "State Pincode" combos like "Gujarat 390011"
    if (SKIP_TOKENS.some(tok => lower.startsWith(tok + " ")) && /\d/.test(p)) continue
    // This is likely the city
    return p.replace(/\b\d{5,6}\b/g, "").trim()
  }
  return ""
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { merchantId, customQuery } = body

    if (!merchantId) {
      return err("merchantId is required", 400)
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId }
    })

    if (!merchant) {
      return err("Merchant not found", 404)
    }

    const searchQuery = customQuery?.trim() || [merchant.name, merchant.address, merchant.city].filter(Boolean).join(" ")
    if (!searchQuery.trim()) {
      return err("Unable to form search query. Business name or address missing.", 400)
    }

    const placesResult = await searchPlaces(searchQuery)
    if (!placesResult?.results || placesResult.results.length === 0) {
      return err(`No matching Google Places found for query: "${searchQuery}"`, 404)
    }

    // Pick top valid Google place
    const topMatch = placesResult.results.find(p => p.placeId && !p.placeId.startsWith("manual_")) || placesResult.results[0]
    if (!topMatch?.placeId || topMatch.placeId.startsWith("manual_")) {
      return err("Only manual placeholder returned from Google Places API", 404)
    }

    const reviewUrl = `https://search.google.com/local/writereview?placeid=${topMatch.placeId}`

    // Determine best city: skip "India", "N/A", blank — prefer Places API-derived city
    const INVALID_CITY_VALUES = ["india", "n/a", "", "vadodara"]
    const currentCityLower = (merchant.city || "").trim().toLowerCase()
    const shouldOverrideCity = INVALID_CITY_VALUES.includes(currentCityLower)
    const detectedCity = shouldOverrideCity
      ? (extractCityFromAddress(topMatch.formattedAddress) || merchant.city || "")
      : merchant.city

    // 1. Update Merchant record
    const updatedMerchant = await db.merchant.update({
      where: { id: merchantId },
      data: {
        city: detectedCity,
        address: merchant.address || topMatch.formattedAddress,
        googleReviewLink: reviewUrl,
        baselineRating: topMatch.rating || 0,
        baselineReviewCount: topMatch.userRatingCount || 0,
      }
    })

    // 2. Upsert MerchantGoogleConnection
    await db.merchantGoogleConnection.upsert({
      where: { merchantId: merchantId },
      create: {
        merchantId: merchantId,
        placeId: topMatch.placeId,
        placeName: topMatch.displayName?.text || merchant.name,
        address: topMatch.formattedAddress,
        googleReviewUrl: reviewUrl,
        verified: false
      },
      update: {
        placeId: topMatch.placeId,
        placeName: topMatch.displayName?.text || merchant.name,
        address: topMatch.formattedAddress,
        googleReviewUrl: reviewUrl
      }
    })

    return ok({
      merchant: updatedMerchant,
      matchedPlace: {
        placeId: topMatch.placeId,
        name: topMatch.displayName?.text,
        address: topMatch.formattedAddress,
        rating: topMatch.rating,
        reviewCount: topMatch.userRatingCount,
        reviewUrl
      }
    })
  } catch (error: any) {
    console.error("[Sync GBP Error]:", error)
    return err(error.message || "Failed to auto-sync Google Business Profile", 500)
  }
}
