// GET /api/reviews — list all reviews (for the Reviews view).
// Query: page (1-indexed), pageSize (max 100)
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function GET(req: NextRequest) {
  const merchant = await requireMerchant()
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10)))
  const skip = (page - 1) * pageSize

  const [total, reviews] = await Promise.all([
    db.review.count({ where: { merchantId: merchant.id } }),
    db.review.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
    }),
  ])

  return ok({
    reviews,
    pagination: { total, page, pageSize, hasMore: skip + reviews.length < total },
  })
}
