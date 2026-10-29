import { NextRequest, NextResponse } from "next/server"
import { generateAIReviewReply } from "@/lib/ai-review-reply"

// In-memory rate limiter for demo endpoint (no auth required)
const ipCallMap = new Map<string, { count: number; resetAt: number }>()
const DEMO_LIMIT = 8 // max 8 calls per IP per hour

function getDemoRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = ipCallMap.get(ip)

  if (!entry || entry.resetAt < now) {
    ipCallMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return { allowed: true, remaining: DEMO_LIMIT - 1 }
  }

  if (entry.count >= DEMO_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: DEMO_LIMIT - entry.count }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
                req.headers.get("x-real-ip") ?? "unknown"

    const { allowed, remaining } = getDemoRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Demo limit reached. Please sign up for unlimited AI replies.", signupUrl: "/signup" },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })

    const { rating, comment, businessName, businessCategory } = body

    const reply = await generateAIReviewReply({
      merchantName: businessName || "Cake Connection",
      locationOrArea: "Vadodara, Gujarat",
      category: businessCategory || "fresh cakes and bakery products",
      customerReview: String(comment || "Great experience!").slice(0, 800),
      rating: Number(rating ?? 5)
    })

    return NextResponse.json({ ok: true, reply, remaining })
  } catch (e: any) {
    console.error("[Demo AI Reply] Error:", e?.message)
    return NextResponse.json(
      { ok: false, error: "AI generation failed. Please try again.", reply: "Thank you for your feedback! We value your experience and look forward to serving you again soon at Cake Connection, Vadodara." },
      { status: 200 }
    )
  }
}
