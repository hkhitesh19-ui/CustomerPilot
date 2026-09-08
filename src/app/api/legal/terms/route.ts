import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const item = await db.systemContent.findUnique({
      where: { key: "MERCHANT_TERMS_AND_CONDITIONS" }
    })

    const content = item?.value || `
# CustomerPilot Merchant Terms of Service & Agreement

Welcome to CustomerPilot. By registering your business, generating a loyalty QR code, or subscribing to any paid plan, you agree to these Terms & Conditions.

### 1. Service Description
CustomerPilot provides an AI-powered customer retention, WhatsApp loyalty stamp card, and automated review management platform.

### 2. Merchant Responsibilities
- Maintain accurate business details.
- Honor customer rewards earned through loyalty stamps in good faith.
- Only message customers who have opted-in via your QR code.

### 3. Subscription & Billing
- 3-Day complimentary free trial for all new merchants.
- Paid plans (30 Days, 180 Days, 365 Days) billed securely via Razorpay.
- Subscriptions are non-refundable once activated.

### 4. Fair Use
No unsolicited spam or fraudulent manipulation of customer stamps.
    `.trim()

    return ok({ content, updatedAt: item?.updatedAt || new Date() })
  } catch (error: any) {
    return err(error.message || "Failed to fetch Terms & Conditions", 500)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { content } = body

    if (!content || typeof content !== "string") {
      return err("Content is required", 400)
    }

    const item = await db.systemContent.upsert({
      where: { key: "MERCHANT_TERMS_AND_CONDITIONS" },
      update: { value: content },
      create: {
        key: "MERCHANT_TERMS_AND_CONDITIONS",
        section: "legal",
        category: "terms",
        value: content
      }
    })

    return ok({ item, message: "Terms & Conditions updated successfully" })
  } catch (error: any) {
    return err(error.message || "Failed to update Terms & Conditions", 500)
  }
}
