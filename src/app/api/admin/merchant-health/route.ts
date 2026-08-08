import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { calculateMerchantHealthScore } from "@/lib/merchant-health"

export async function GET() {
  try {
    const merchants = await db.merchant.findMany({ select: { id: true, name: true } })

    const healthScores = await Promise.all(
      merchants.map(m => calculateMerchantHealthScore(m.id))
    )

    return NextResponse.json({
      success: true,
      totalMerchants: merchants.length,
      healthScores,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
