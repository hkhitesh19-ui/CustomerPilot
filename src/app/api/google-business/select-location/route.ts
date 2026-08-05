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

    const finalReviewUrl = googleReviewUrl || `https://search.google.com/local/writereview?placeid=${placeId}`;

    // Update connection
    const updated = await db.merchantGoogleConnection.upsert({
      where: { merchantId },
      update: {
        placeId,
        placeName: placeName || "Cake Connection",
        address: address || "Store Location",
        googleReviewUrl: finalReviewUrl,
        connectionType: "oauth",
        verified: true,
        syncStatus: "active",
        lastSyncedAt: new Date()
      },
      create: {
        merchantId,
        placeId,
        placeName: placeName || "Cake Connection",
        address: address || "Store Location",
        googleReviewUrl: finalReviewUrl,
        connectionType: "oauth",
        verified: true,
        syncStatus: "active",
        lastSyncedAt: new Date()
      }
    });

    // Update merchant record address & review link
    await (db.merchant as any).update({
      where: { id: merchantId },
      data: {
        address: address,
        googleReviewLink: finalReviewUrl
      }
    }).catch(() => {});

    return ok({
      message: "Trial location selected successfully",
      location: {
        placeId: updated.placeId,
        placeName: updated.placeName,
        address: updated.address,
        googleReviewUrl: updated.googleReviewUrl,
        cid: cid || "14873172342901454576",
        mapsUri: mapsUri || `https://maps.google.com/?cid=14873172342901454576`
      }
    });
  } catch (error: any) {
    console.error("[Select Location] Error:", error);
    return err(error.message, 500);
  }
}
