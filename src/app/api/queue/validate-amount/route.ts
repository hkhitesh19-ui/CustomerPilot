// POST /api/queue/validate-amount — AI outlier detection on entered amount.
import { NextRequest } from "next/server"
import { ok, err, requireMerchant } from "@/lib/api"
import { validateAmount } from "@/lib/queue-engine"

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")
    const { amount } = body as { amount?: number }
    if (typeof amount !== "number" || amount <= 0) return err("amount must be a positive number")
    const result = await validateAmount({ merchantId: merchant.id, amount })
    return ok(result)
  } catch (error: unknown) {
    console.error('[Queue ValidateAmount Error]', error)
    return err('Failed to validate amount', 500)
  }
}
