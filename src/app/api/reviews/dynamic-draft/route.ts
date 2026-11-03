import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateDynamicReviewDraft } from "@/lib/dynamic-review-engine"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const merchantId = searchParams.get("m")
    const customerId = searchParams.get("c") || undefined
    const productParam = searchParams.get("product") || undefined

    if (!merchantId) {
      return NextResponse.json({ error: "merchantId is required" }, { status: 400 })
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId }
    })

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    // Try fetching authentic merchant menu items for spotlight rotation
    const menuItems = await db.menuItem.findMany({
      where: { merchantId: merchant.id, isAvailable: true },
      select: { name: true },
      take: 20
    }).catch(() => [])

    let productName = productParam || ""
    if (!productName && customerId) {
      const customer = await db.customer.findUnique({
        where: { id: customerId },
        include: { bills: { orderBy: { createdAt: "desc" }, take: 3 } }
      }).catch(() => null)

      if (customer?.bills?.[0]?.notes) {
        const match = customer.bills[0].notes.match(/Product:\s*([^|]+)/i)
        if (match?.[1]?.trim()) {
          productName = match[1].trim()
        }
      }
    }

    const businessCategory = merchant.category?.trim() || merchant.businessType || "Retail Store"
    const menuItemNames = menuItems.map((m: { name: string }) => m.name)

    const drafts = await generateDynamicReviewDraft({
      businessCategory,
      productName,
      merchantName: merchant.name,
      menuItems: menuItemNames,
      seed: Math.random().toString(36)
    })

    return NextResponse.json({
      success: true,
      drafts
    })
  } catch (err: any) {
    console.error("[dynamic-draft API error]", err)
    return NextResponse.json({ error: "Failed to generate dynamic draft" }, { status: 500 })
  }
}
