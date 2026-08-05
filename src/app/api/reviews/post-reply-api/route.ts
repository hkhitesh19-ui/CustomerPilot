import { NextResponse } from "next/server"
import { postGoogleReviewReplyWithQuotaProtection } from "@/lib/google-places-api"

export async function POST(req: Request) {
  try {
    const { reviewId, comment } = await req.json()

    const result = await postGoogleReviewReplyWithQuotaProtection({
      merchantId: "demo-merchant",
      reviewName: `accounts/demo/locations/demo/reviews/${reviewId}`,
      comment: comment || "Thank you for visiting Cake Connection!",
      accessToken: "demo-access-token",
    })

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ success: false, status: "FAILED", error: e?.message || "Internal error" }, { status: 500 })
  }
}
