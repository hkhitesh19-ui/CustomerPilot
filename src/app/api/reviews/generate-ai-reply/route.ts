import { NextRequest, NextResponse } from "next/server"
import { generateAIReviewReplyDrafts, getCleanMerchantName } from "@/lib/ai-review-reply"
import { getAuthenticatedMerchant } from "@/lib/api"
import { applyAiRateLimit } from "@/lib/rate-limiter"

export async function POST(req: NextRequest) {
  try {
    // Resolve merchant for rate limiting (keyed per merchant, not just IP)
    const merchant = await getAuthenticatedMerchant()
    const rateLimitKey = merchant?.id ?? (req.headers.get("x-forwarded-for") ?? "unknown")

    const limited = await applyAiRateLimit(rateLimitKey)
    if (limited) return limited

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })

    const { rating, comment, merchantName, locationOrArea, category, reviewerName } = body

    const cleanName = getCleanMerchantName(merchantName || merchant?.name || "Cake Connection")
    const drafts = await generateAIReviewReplyDrafts({
      merchantName: cleanName,
      locationOrArea: locationOrArea || merchant?.city || "Vadodara",
      category: category || merchant?.businessType || merchant?.category || "fresh cakes and bakery products",
      customerReview: String(comment || "Great products and service!").slice(0, 1000),
      rating: Number(rating || 5),
      reviewerName: reviewerName || ""
    })

    return NextResponse.json({
      ok: true,
      reply: drafts.draft1,
      drafts: [drafts.draft1, drafts.draft2, drafts.draft3],
      keywords: drafts.keywords
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to generate AI reply" }, { status: 500 })
  }
}
