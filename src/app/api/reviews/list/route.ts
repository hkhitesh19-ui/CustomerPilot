import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const reviews = await db.googleBusinessReview.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ ok: true, reviews })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to fetch reviews" }, { status: 500 })
  }
}
