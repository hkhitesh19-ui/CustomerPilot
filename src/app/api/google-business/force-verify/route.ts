import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

// POST /api/google-business/force-verify
// Forces verified=true on an existing MerchantGoogleConnection (MVP/Demo use)
export async function POST(req: NextRequest) {
  const merchantId = req.headers.get("x-merchant-id")
  if (!merchantId) return err("Unauthorized", 401)

  try {
    const connection = await db.merchantGoogleConnection.findUnique({
      where: { merchantId }
    })

    if (!connection) {
      return err("No Google Business connection found. Please connect first.", 404)
    }

    await db.merchantGoogleConnection.update({
      where: { merchantId },
      data: {
        verified: true,
        syncStatus: "active",
        lastSyncedAt: new Date()
      }
    })

    return ok({
      verified: true,
      placeName: connection.placeName,
      message: "Google Business connection verified successfully!"
    })
  } catch (error: any) {
    return err(error.message || "Failed to verify", 500)
  }
}
