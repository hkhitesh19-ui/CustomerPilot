import { NextResponse } from "next/server"
import { generateAIReviewReply } from "@/lib/ai-review-reply"

export async function POST(req: Request) {
  try {
    const { reviewerName, rating, comment } = await req.json()

    const reply = await generateAIReviewReply({
      merchantName: "Cake Connection",
      locationOrArea: "Vadodara",
      category: "bakery",
      customerReview: comment || "Great products and service!",
    })

    return NextResponse.json({ ok: true, reply })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to generate AI reply" }, { status: 500 })
  }
}
