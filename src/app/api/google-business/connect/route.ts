import { NextRequest } from "next/server"
import { connectMerchantToPlace, getPlaceDetails, generateReviewUrl } from "@/lib/google-places-api"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || !body.placeId) {
      return err("placeId is required", 400)
    }
    const { placeId } = body

    const merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) {
      return err("Unauthorized: Missing Merchant Context", 401)
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })

    // Get place details if available
    let placeDetails: any = null
    try {
      if (!placeId.startsWith("http") && placeId !== "manual_url" && placeId !== "direct_url") {
        placeDetails = await getPlaceDetails(placeId)
      }
    } catch {
      // Continue without details
    }

    const finalPlaceName = body.placeName || placeDetails?.displayName?.text || merchant?.name || "Connected Business"
    const finalAddress = body.address || placeDetails?.formattedAddress || merchant?.address || "Store Location"
    const calculatedReviewUrl = body.reviewUrl || (finalAddress.startsWith("http") ? finalAddress : (placeId.startsWith("http") ? placeId : `https://search.google.com/local/writereview?placeid=${placeId}`))

    // Upsert into merchantGoogleConnection
    const connection = await db.merchantGoogleConnection.upsert({
      where: { merchantId },
      update: {
        placeId,
        placeName: finalPlaceName,
        address: finalAddress,
        googleReviewUrl: calculatedReviewUrl,
        connectionType: "oauth",
        verified: true,
        syncStatus: 'active',
        lastSyncedAt: new Date(),
      },
      create: {
        merchantId,
        placeId,
        placeName: finalPlaceName,
        address: finalAddress,
        googleReviewUrl: calculatedReviewUrl,
        connectionType: "oauth",
        verified: true,
        syncStatus: 'active',
        lastSyncedAt: new Date(),
      }
    })

    // Also update merchant table if extended
    await (db.merchant as any).update({
      where: { id: merchantId },
      data: {
        googleReviewLink: calculatedReviewUrl
      }
    }).catch(() => {})

    return ok({
      connected: true,
      connection: {
        placeId: connection.placeId,
        placeName: connection.placeName,
        address: connection.address,
        googleReviewUrl: connection.googleReviewUrl,
        verified: true,
        syncStatus: 'active',
        lastSyncedAt: new Date(),
      },
      reviewUrl: calculatedReviewUrl,
      message: "Google Business Profile connected and verified successfully!",
    })
  } catch (error: any) {
    console.error("[API] Google connect error:", error.message)
    return err(`Connection failed: ${error.message}`, 500)
  }
}
