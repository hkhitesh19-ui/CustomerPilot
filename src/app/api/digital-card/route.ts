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
      googleReviewLink,
      websiteUrl,
      orderingLinks,
      googleRating,
      googleReviewsCnt,
      theme,
    } = body

    if (!displayName) {
      return NextResponse.json({ success: false, error: "Display Name is required" }, { status: 400 })
    }

    // SECURITY & ISOLATION:
    // If authenticated via JWT, use authMerchantId.
    // If unauthenticated (zero-signup guest trial), do NOT allow client-supplied merchantId (IDOR prevention).
    // Instead, create an isolated lightweight guest merchant with null phone to prevent unique constraint crashes.
    let targetMerchantId = authMerchantId
    if (!targetMerchantId) {
      const guestMerchant = await db.merchant.create({
        data: {
          name: displayName,
          category: subCategories || "Retail Store",
          whatsappPhone: null,
          status: "active",
          plan: "free",
        },
      })
      targetMerchantId = guestMerchant.id
    }

    // Generate unique slug
    let baseSlug = (slug || displayName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "card"

    let cleanSlug = baseSlug
    let counter = 1
    // If updating an existing merchant's card, allow same slug if it belongs to this merchant
    while (true) {
      const existing = await db.digitalBusinessCard.findUnique({ where: { slug: cleanSlug } })
      if (!existing || existing.merchantId === targetMerchantId) break
      cleanSlug = `${baseSlug}-${counter}`
      counter++
    }

    // 3-Day Free Trial metadata
    const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    const themeData = typeof theme === "string" ? theme : JSON.stringify({
      style: "champagne_luxury",
      isTrial: true,
      trialEndsAt: trialEndsAt,
      googleReviewLink: googleReviewLink || null,
    })

    // Safe number parsing (prevents Prisma NaN crashes)
    const parsedRating = typeof googleRating === "number" && !isNaN(googleRating)
      ? Math.max(1, Math.min(5, googleRating))
      : (typeof googleRating === "string" && !isNaN(parseFloat(googleRating)))
        ? Math.max(1, Math.min(5, parseFloat(googleRating)))
        : 4.6

    const parsedReviewsCnt = typeof googleReviewsCnt === "number" && !isNaN(googleReviewsCnt)
      ? Math.max(0, Math.floor(googleReviewsCnt))
      : (typeof googleReviewsCnt === "string" && !isNaN(parseInt(googleReviewsCnt, 10)))
        ? Math.max(0, parseInt(googleReviewsCnt, 10))
        : 689

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
        googleMapsUrl: googleMapsUrl || googleReviewLink || undefined,
        googlePlaceId: googleReviewLink || undefined,
        websiteUrl,
        theme: themeData,
        orderingLinks: typeof orderingLinks === "string" ? orderingLinks : JSON.stringify(orderingLinks || []),
        googleRating: parsedRating,
        googleReviewsCnt: parsedReviewsCnt,
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
        googleMapsUrl: googleMapsUrl || googleReviewLink || undefined,
        googlePlaceId: googleReviewLink || undefined,
        websiteUrl,
        theme: themeData,
        orderingLinks: typeof orderingLinks === "string" ? orderingLinks : JSON.stringify(orderingLinks || []),
        googleRating: parsedRating,
        googleReviewsCnt: parsedReviewsCnt,
      },
    })

    return NextResponse.json({ success: true, card: updatedCard, slug: updatedCard.slug })
  } catch (error: any) {
    console.error("[API_DIGITAL_CARD_POST]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
