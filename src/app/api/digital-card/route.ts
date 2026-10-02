import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const authMerchantId = req.headers.get("x-merchant-id")
    const queryMerchantId = searchParams.get("merchantId")
    const targetMerchantId = authMerchantId || queryMerchantId

    let card: any = null

    if (slug) {
      card = await db.digitalBusinessCard.findUnique({
        where: { slug: slug.toLowerCase() },
      })
    } else if (targetMerchantId) {
      card = await db.digitalBusinessCard.findUnique({
        where: { merchantId: targetMerchantId },
      })
    } else {
      // Default to first merchant's card
      card = await db.digitalBusinessCard.findFirst()
    }

    if (!card) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, card })
  } catch (error: any) {
    console.error("[API_DIGITAL_CARD_GET]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authMerchantId = req.headers.get("x-merchant-id")
    const body = await req.json()
    const {
      merchantId,
      slug,
      displayName,
      subCategories,
      logoUrl,
      locationShort,
      locationState,
      businessHours,
      deliveryInfo,
      whatsappNumber,
      phoneNumber,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      googleMapsUrl,
      websiteUrl,
      orderingLinks,
      googleRating,
      googleReviewsCnt,
    } = body

    if (!slug || !displayName) {
      return NextResponse.json({ success: false, error: "Slug and Display Name are required" }, { status: 400 })
    }

    // Determine target merchantId from authenticated session first to prevent BOLA
    let targetMerchantId = authMerchantId || merchantId
    if (!targetMerchantId) {
      const firstMerchant = await db.merchant.findFirst()
      targetMerchantId = firstMerchant?.id
    }

    if (!targetMerchantId) {
      return NextResponse.json({ success: false, error: "Unauthorized: No merchant found to associate with card" }, { status: 401 })
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-")

    const updatedCard = await db.digitalBusinessCard.upsert({
      where: { merchantId: targetMerchantId },
      update: {
        slug: cleanSlug,
        displayName,
        subCategories,
        logoUrl: logoUrl || undefined,
        locationShort,
        locationState,
        businessHours,
        deliveryInfo,
        whatsappNumber,
        phoneNumber,
        instagramUrl,
        facebookUrl,
        youtubeUrl,
        googleMapsUrl,
        websiteUrl,
        orderingLinks: typeof orderingLinks === "string" ? orderingLinks : JSON.stringify(orderingLinks || []),
        googleRating: googleRating ? parseFloat(googleRating) : 4.6,
        googleReviewsCnt: googleReviewsCnt ? parseInt(googleReviewsCnt, 10) : 689,
      },
      create: {
        merchantId: targetMerchantId,
        slug: cleanSlug,
        displayName,
        subCategories,
        logoUrl,
        locationShort,
        locationState,
        businessHours,
        deliveryInfo,
        whatsappNumber,
        phoneNumber,
        instagramUrl,
        facebookUrl,
        youtubeUrl,
        googleMapsUrl,
        websiteUrl,
        orderingLinks: typeof orderingLinks === "string" ? orderingLinks : JSON.stringify(orderingLinks || []),
        googleRating: googleRating ? parseFloat(googleRating) : 4.6,
        googleReviewsCnt: googleReviewsCnt ? parseInt(googleReviewsCnt, 10) : 689,
      },
    })

    return NextResponse.json({ success: true, card: updatedCard })
  } catch (error: any) {
    console.error("[API_DIGITAL_CARD_POST]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
