import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { calculateCustomerPilotSuccessScore } from "@/lib/merchant-intelligence"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const merchantId = searchParams.get("merchantId")

    let targetMerchantId = merchantId
    if (!targetMerchantId) {
      const firstMerchant = await db.merchant.findFirst()
      targetMerchantId = firstMerchant?.id || ""
    }

    if (!targetMerchantId) {
      return NextResponse.json({ success: false, error: "No merchant found" }, { status: 404 })
    }

    const scoreData = await calculateCustomerPilotSuccessScore(targetMerchantId)

    return NextResponse.json({
      success: true,
      data: scoreData,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
