import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { placeId, placeName, address, googleReviewUrl, cid, mapsUri } = body;

    if (!placeId) {
      return err("placeId is required", 400);
    }

    const merchantIdHeader = req.headers.get("x-merchant-id");
    const merchantIdCookie = req.cookies.get("merchant_id")?.value;
    let merchantId = merchantIdHeader || merchantIdCookie;

    if (!merchantId) {
      const first = await db.merchant.findFirst({ orderBy: { createdAt: "desc" } });
      if (first) merchantId = first.id;
    }

    if (!merchantId) {
      return err("Merchant not found", 404);
    }

    const merchantRecord = await db.merchant.findUnique({ where: { id: merchantId } });
    const fallbackStoreName = merchantRecord?.businessName || merchantRecord?.name || "Store Location";

    const finalReviewUrl = googleReviewUrl || `https://search.google.com/local/writereview?placeid=${placeId}`;

    // Update connection
    const updated = await db.merchantGoogleConnection.upsert({
      where: { merchantId },
      update: {
        placeId,
        placeName: placeName || fallbackStoreName,
        address: address || merchantRecord?.address || "Store Location",
        googleReviewUrl: finalReviewUrl,
        connectionType: "oauth",
        verified: true,
        syncStatus: "active",
        lastSyncedAt: new Date()
      },
      create: {
        merchantId,
        placeId,
        placeName: placeName || fallbackStoreName,
        address: address || merchantRecord?.address || "Store Location",
        googleReviewUrl: finalReviewUrl,
        connectionType: "oauth",
        verified: true,
        syncStatus: "active",
        lastSyncedAt: new Date()
      }
    });

    // Fetch live Google Maps rating and review count if Google Places API key is present
    let fetchedRating: number | null = null;
    let fetchedReviewCount: number | null = null;
    const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (placeId && placesApiKey) {
      try {
        const placeRes = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total&key=${placesApiKey}`);
        if (placeRes.ok) {
          const placeData = await placeRes.json();
          if (placeData.result) {
            if (typeof placeData.result.rating === "number") fetchedRating = placeData.result.rating;
            if (typeof placeData.result.user_ratings_total === "number") fetchedReviewCount = placeData.result.user_ratings_total;
          }
        }
      } catch (e) {
        console.warn("[Google Select Location] Places API fetch error:", e);
      }
    }

    // Update merchant record address, review link, and baseline reviews
    await (db.merchant as any).update({
      where: { id: merchantId },
      data: {
        ...(address ? { address } : {}),
        googleReviewLink: finalReviewUrl,
        ...(fetchedRating !== null ? { baselineRating: fetchedRating } : {}),
        ...(fetchedReviewCount !== null ? { baselineReviewCount: fetchedReviewCount, baselineCapturedAt: new Date() } : {})
      }
    }).catch(() => {});

    return ok({
      message: "Trial location selected successfully",
      location: {
        placeId: updated.placeId,
        placeName: updated.placeName,
        address: updated.address,
        googleReviewUrl: updated.googleReviewUrl,
        cid: cid || "",
        mapsUri: mapsUri || finalReviewUrl
      }
    });
  } catch (error: any) {
    console.error("[Select Location] Error:", error);
    return err(error.message, 500);
  }
}
