import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { searchPlaces } from "@/lib/google-places-api"
import { ok, err } from "@/lib/api"
import QRCode from "qrcode"

export const dynamic = "force-dynamic"

function extractCity(address?: string | null): string {
  if (!address) return "Vadodara"
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 3) {
    const candidate = parts[parts.length - 3]
    if (candidate && !/\d/.test(candidate) && candidate.length > 2) return candidate
  }
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 2]
    return candidate.replace(/\b\d{5,6}\b/g, "").trim() || "Vadodara"
  }
  return parts[0] || "Vadodara"
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { query, customPhone, customCategory } = body

    if (!query || typeof query !== "string" || !query.trim()) {
      return err("Google Business Profile link or business name is required", 400)
    }

    const cleanQuery = query.trim()

    // 1. Search Google Places API
    const placesResult = await searchPlaces(cleanQuery)
    if (!placesResult?.results || placesResult.results.length === 0) {
      return err(`No matching Google Business Profile found for: "${cleanQuery}"`, 404)
    }

    const topMatch = placesResult.results.find((p) => p.placeId && !p.placeId.startsWith("manual_")) || placesResult.results[0]
    if (!topMatch?.placeId) {
      return err("Could not resolve a valid Google Place ID from the query", 404)
    }

    const placeId = topMatch.placeId
    const storeName = topMatch.displayName?.text || cleanQuery
    const address = topMatch.formattedAddress || ""
    const city = extractCity(address)
    const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`
    const category = customCategory || "Retail Store"

    // 2. Check if a merchant already has this placeId
    let merchant: any = null
    const existingConn = await db.merchantGoogleConnection.findFirst({
      where: { placeId }
    })

    if (existingConn?.merchantId) {
      merchant = await db.merchant.findUnique({
        where: { id: existingConn.merchantId }
      })
    }

    // 3. If no existing merchant, check by name/city or auto-provision with 3 Days Free Trial
    const trialEndsAtDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

    if (!merchant) {
      merchant = await db.merchant.create({
        data: {
          name: storeName,
          address,
          city,
          businessType: category.toLowerCase().slice(0, 20),
          category,
          whatsappPhone: customPhone || null,
          googleReviewLink: reviewUrl,
          baselineRating: topMatch.rating || 0,
          baselineReviewCount: topMatch.userRatingCount || 0,
          plan: "trial",
          trialEndsAt: trialEndsAtDate,
          onboardingCompleted: true,
          status: "active"
        }
      })
    } else {
      // Update Google review link & baseline and guarantee active 3 days free trial
      const activeTrialExpiry = merchant.trialEndsAt && new Date(merchant.trialEndsAt) > new Date()
        ? merchant.trialEndsAt
        : trialEndsAtDate

      merchant = await db.merchant.update({
        where: { id: merchant.id },
        data: {
          googleReviewLink: reviewUrl,
          baselineRating: topMatch.rating || merchant.baselineRating,
          baselineReviewCount: topMatch.userRatingCount || merchant.baselineReviewCount,
          address: merchant.address || address,
          city: merchant.city || city,
          trialEndsAt: activeTrialExpiry,
          plan: merchant.plan || "trial"
        }
      })
    }

    // 4. Ensure MerchantGoogleConnection exists
    await db.merchantGoogleConnection.upsert({
      where: { merchantId: merchant.id },
      create: {
        merchantId: merchant.id,
        placeId,
        placeName: storeName,
        address,
        googleReviewUrl: reviewUrl,
        verified: false
      },
      update: {
        placeId,
        placeName: storeName,
        address,
        googleReviewUrl: reviewUrl
      }
    })

    // 5. Generate Smart AI Review QR code
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in"
    const smartReviewUrl = `${baseUrl}/review?m=${merchant.id}`
    const standeeUrl = `${baseUrl}/dashboard/standee?m=${merchant.id}`

    const qrCodeBase64 = await QRCode.toDataURL(smartReviewUrl, {
      width: 1024,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF"
      }
    })

    return ok({
      merchantId: merchant.id,
      merchantName: merchant.name,
      address,
      city,
      rating: topMatch.rating || null,
      reviewCount: topMatch.userRatingCount || null,
      placeId,
      googleReviewUrl: reviewUrl,
      smartReviewUrl,
      standeeUrl,
      qrCodeBase64
    })
  } catch (e: any) {
    return err(e.message || "Failed to generate quick review QR from GBP", 500)
  }
}
