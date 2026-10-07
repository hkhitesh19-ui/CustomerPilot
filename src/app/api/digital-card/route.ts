import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "cpilot_jwt_secret_change_this_in_production_2026!"

async function getMerchantIdFromReq(req: NextRequest): Promise<string | null> {
  const headerId = req.headers.get("x-merchant-id")
  if (headerId && headerId !== "admin_merchant") return headerId

  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "")
  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
      const role = payload.role as string
      const tokenMerchantId = payload.merchantId as string
      if (role === "super_admin" || tokenMerchantId === "admin_merchant" || !tokenMerchantId) {
        const impCookie = req.cookies.get("cp_impersonation")?.value
        if (impCookie) {
          try {
            const imp = JSON.parse(impCookie)
            if (imp?.merchantId) return imp.merchantId
          } catch {}
        }
        return "cmtymavfx0002kx008lbfvp57"
      }
      return tokenMerchantId
    } catch {}
  }
  return null
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const resolvedMerchantId = await getMerchantIdFromReq(req)
    const queryMerchantId = searchParams.get("merchantId")
    const targetMerchantId = resolvedMerchantId || queryMerchantId

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
    const resolvedMerchantId = await getMerchantIdFromReq(req)
    const body = await req.json()
    const {
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
      zomatoUrl,
      swiggyUrl,
      otherOrderUrl,
      otherOrderLabel,
      orderingLinks,
      googleRating,
      googleReviewsCnt,
      theme,
    } = body

    if (!displayName) {
      return NextResponse.json({ success: false, error: "Display Name is required" }, { status: 400 })
    }

    // SECURITY & ISOLATION:
    // If authenticated via JWT/header, use resolvedMerchantId.
    // If unauthenticated (zero-signup guest trial), do NOT allow client-supplied merchantId.
    let targetMerchantId = resolvedMerchantId
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
    while (true) {
      const existing = await db.digitalBusinessCard.findUnique({ where: { slug: cleanSlug } })
      if (!existing || existing.merchantId === targetMerchantId) break
      cleanSlug = `${baseSlug}-${counter}`
      counter++
    }

    // Preserve existing theme metadata or initialize new
    const existingCard = await db.digitalBusinessCard.findUnique({ where: { merchantId: targetMerchantId } })
    let parsedTheme: any = {}
    if (existingCard?.theme && typeof existingCard.theme === "string" && existingCard.theme.startsWith("{")) {
      try {
        parsedTheme = JSON.parse(existingCard.theme)
      } catch {}
    } else if (typeof theme === "string" && theme.startsWith("{")) {
      try {
        parsedTheme = JSON.parse(theme)
      } catch {}
    }

    if (!parsedTheme.style) parsedTheme.style = "champagne_luxury"
    if (googleReviewLink !== undefined) {
      parsedTheme.googleReviewLink = googleReviewLink ? googleReviewLink.trim() : null
    }
    if (!existingCard && !parsedTheme.trialEndsAt) {
      parsedTheme.isTrial = true
      parsedTheme.trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
    const themeData = JSON.stringify(parsedTheme)

    // Construct ordering links
    let finalOrderingLinks = orderingLinks
    if (
      zomatoUrl !== undefined ||
      swiggyUrl !== undefined ||
      websiteUrl !== undefined ||
      otherOrderUrl !== undefined
    ) {
      const linksArr: Array<{ platform: string; label: string; sublabel?: string; url: string; color?: string }> = []
      if (websiteUrl && websiteUrl.trim()) {
        linksArr.push({ platform: "website", label: "Website", sublabel: "Order Now", url: websiteUrl.trim(), color: "#2563eb" })
      }
      if (whatsappNumber && whatsappNumber.trim()) {
        linksArr.push({
          platform: "whatsapp",
          label: "WhatsApp",
          sublabel: "Order Now",
          url: `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(displayName)}%2C%20I%20want%20to%20order`,
          color: "#16a34a"
        })
      }
      if (zomatoUrl && zomatoUrl.trim()) {
        linksArr.push({ platform: "zomato", label: "Zomato", sublabel: "Order Now", url: zomatoUrl.trim(), color: "#ef4444" })
      }
      if (swiggyUrl && swiggyUrl.trim()) {
        linksArr.push({ platform: "swiggy", label: "Swiggy", sublabel: "Order Now", url: swiggyUrl.trim(), color: "#f97316" })
      }
      if (otherOrderUrl && otherOrderUrl.trim()) {
        linksArr.push({
          platform: "easycater",
          label: otherOrderLabel?.trim() || "Catalog",
          sublabel: "Order Now",
          url: otherOrderUrl.trim(),
          color: "#7c3aed"
        })
      }
      finalOrderingLinks = JSON.stringify(linksArr)
    }

    // Safe number parsing
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

    const effectiveGoogleReviewLink = googleReviewLink ? googleReviewLink.trim() : undefined
    const effectiveGoogleMapsUrl = googleMapsUrl ? googleMapsUrl.trim() : (effectiveGoogleReviewLink || undefined)

    const updatedCard = await db.digitalBusinessCard.upsert({
      where: { merchantId: targetMerchantId },
      update: {
        slug: cleanSlug,
        displayName: displayName.trim(),
        subCategories: subCategories || null,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        locationShort: locationShort || null,
        locationState: locationState || "Gujarat, India",
        businessHours: businessHours || "Open Daily: 9:00 AM – 10:00 PM",
        deliveryInfo: deliveryInfo || "Delivery Available",
        whatsappNumber: whatsappNumber || null,
        phoneNumber: phoneNumber || null,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        youtubeUrl: youtubeUrl || null,
        googleMapsUrl: effectiveGoogleMapsUrl,
        googlePlaceId: effectiveGoogleReviewLink || undefined,
        websiteUrl: websiteUrl || null,
        theme: themeData,
        orderingLinks: typeof finalOrderingLinks === "string" ? finalOrderingLinks : JSON.stringify(finalOrderingLinks || []),
        googleRating: parsedRating,
        googleReviewsCnt: parsedReviewsCnt,
      },
      create: {
        merchantId: targetMerchantId,
        slug: cleanSlug,
        displayName: displayName.trim(),
        subCategories: subCategories || null,
        logoUrl: logoUrl || null,
        locationShort: locationShort || null,
        locationState: locationState || "Gujarat, India",
        businessHours: businessHours || "Open Daily: 9:00 AM – 10:00 PM",
        deliveryInfo: deliveryInfo || "Delivery Available",
        whatsappNumber: whatsappNumber || null,
        phoneNumber: phoneNumber || null,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        youtubeUrl: youtubeUrl || null,
        googleMapsUrl: effectiveGoogleMapsUrl,
        googlePlaceId: effectiveGoogleReviewLink || undefined,
        websiteUrl: websiteUrl || null,
        theme: themeData,
        orderingLinks: typeof finalOrderingLinks === "string" ? finalOrderingLinks : JSON.stringify(finalOrderingLinks || []),
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
