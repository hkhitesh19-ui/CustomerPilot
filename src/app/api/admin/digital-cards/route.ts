import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "cpilot_jwt_secret_change_this_in_production_2026!"

async function verifySuperAdmin(req: NextRequest): Promise<{ ok: boolean; error?: NextResponse }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return { ok: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    if (payload.role !== "super_admin") {
      return { ok: false, error: NextResponse.json({ error: "Forbidden: SuperAdmin access required" }, { status: 403 }) }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
}

export async function GET(req: NextRequest) {
  const auth = await verifySuperAdmin(req)
  if (!auth.ok) return auth.error!

  try {
    const { searchParams } = new URL(req.url)
    const merchantId = searchParams.get("merchantId")

    // If specific merchant requested
    if (merchantId) {
      const card = await db.digitalBusinessCard.findUnique({
        where: { merchantId },
        include: { merchant: true }
      })
      return NextResponse.json({ success: true, card })
    }

    // Otherwise return fleet overview of cards and merchants list for selector
    const [cards, merchants] = await Promise.all([
      db.digitalBusinessCard.findMany({
        include: {
          merchant: {
            select: { id: true, name: true, category: true, whatsappPhone: true, city: true, status: true, plan: true }
          }
        },
        orderBy: { updatedAt: "desc" }
      }),
      db.merchant.findMany({
        select: { id: true, name: true, category: true, whatsappPhone: true, city: true },
        orderBy: { name: "asc" },
        take: 500
      })
    ])

    return NextResponse.json({ success: true, cards, merchants })
  } catch (error: any) {
    console.error("[API_ADMIN_DIGITAL_CARDS_GET]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifySuperAdmin(req)
  if (!auth.ok) return auth.error!

  try {
    const body = await req.json()
    const {
      merchantId,
      displayName,
      slug,
      subCategories,
      logoUrl,
      locationShort,
      locationState,
      businessHours,
      deliveryInfo,
      phoneNumber,
      whatsappNumber,
      googleReviewLink,
      googleRating,
      googleReviewsCnt,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      websiteUrl,
      zomatoUrl,
      swiggyUrl,
      statusMode = "TRIAL", // "TRIAL" | "ACTIVE" | "LIFETIME"
      trialDays = 3,
      isActive = true
    } = body

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Business / Store Display Name is required" }, { status: 400 })
    }

    // Determine target merchant ID
    let targetMerchantId = merchantId
    if (!targetMerchantId || targetMerchantId === "new") {
      let existingMerchant: any = null
      if (whatsappNumber && whatsappNumber.trim().length > 0) {
        existingMerchant = await db.merchant.findUnique({
          where: { whatsappPhone: whatsappNumber.trim() }
        })
      }

      if (existingMerchant) {
        targetMerchantId = existingMerchant.id
      } else {
        // Create new merchant record
        const newMerchant = await db.merchant.create({
          data: {
            name: displayName.trim(),
            category: subCategories || "Retail Store",
            whatsappPhone: whatsappNumber ? whatsappNumber.trim() : null,
            city: locationShort ? locationShort.split(",").pop()?.trim() : "Vadodara",
            status: "active",
            plan: statusMode === "LIFETIME" ? "enterprise" : statusMode === "ACTIVE" ? "pro" : "free",
          }
        })
        targetMerchantId = newMerchant.id
      }
    }

    // Format clean, URL-safe slug
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

    // Calculate trial / subscription status & expiration
    let trialEndsAt: string
    let isTrial = false
    if (statusMode === "TRIAL") {
      isTrial = true
      trialEndsAt = new Date(Date.now() + (Number(trialDays) || 3) * 24 * 60 * 60 * 1000).toISOString()
    } else if (statusMode === "ACTIVE") {
      isTrial = false
      trialEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    } else {
      // LIFETIME
      isTrial = false
      trialEndsAt = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString()
    }

    const themeData = JSON.stringify({
      style: "champagne_luxury",
      isTrial,
      trialEndsAt,
      statusMode,
      googleReviewLink: googleReviewLink || null,
    })

    // Prepare ordering links array
    const orderingList: any[] = []
    if (zomatoUrl && zomatoUrl.trim()) orderingList.push({ platform: "Zomato", url: zomatoUrl.trim() })
    if (swiggyUrl && swiggyUrl.trim()) orderingList.push({ platform: "Swiggy", url: swiggyUrl.trim() })
    if (websiteUrl && websiteUrl.trim()) orderingList.push({ platform: "Website", url: websiteUrl.trim() })

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

    const updatedCard = await db.digitalBusinessCard.upsert({
      where: { merchantId: targetMerchantId },
      update: {
        slug: cleanSlug,
        displayName: displayName.trim(),
        subCategories: subCategories || null,
        logoUrl: logoUrl || undefined,
        locationShort: locationShort || null,
        locationState: locationState || "Gujarat, India",
        businessHours: businessHours || "Open Daily: 9:00 AM – 10:00 PM",
        deliveryInfo: deliveryInfo || "Delivery Available",
        whatsappNumber: whatsappNumber || null,
        phoneNumber: phoneNumber || null,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        youtubeUrl: youtubeUrl || null,
        googleMapsUrl: googleReviewLink || null,
        googlePlaceId: googleReviewLink || null,
        websiteUrl: websiteUrl || null,
        theme: themeData,
        orderingLinks: JSON.stringify(orderingList),
        googleRating: parsedRating,
        googleReviewsCnt: parsedReviewsCnt,
        isActive: Boolean(isActive),
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
        googleMapsUrl: googleReviewLink || null,
        googlePlaceId: googleReviewLink || null,
        websiteUrl: websiteUrl || null,
        theme: themeData,
        orderingLinks: JSON.stringify(orderingList),
        googleRating: parsedRating,
        googleReviewsCnt: parsedReviewsCnt,
        isActive: Boolean(isActive),
      }
    })

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const liveUrl = `${baseUrl}/c/${updatedCard.slug}`

    return NextResponse.json({
      success: true,
      card: updatedCard,
      slug: updatedCard.slug,
      liveUrl,
      message: `Smart Digital Business Card successfully generated for ${updatedCard.displayName}!`
    })
  } catch (error: any) {
    console.error("[API_ADMIN_DIGITAL_CARDS_POST]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifySuperAdmin(req)
  if (!auth.ok) return auth.error!

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const slug = searchParams.get("slug")

    if (!id && !slug) {
      return NextResponse.json({ success: false, error: "Card id or slug is required" }, { status: 400 })
    }

    if (id) {
      await db.digitalBusinessCard.delete({ where: { id } })
    } else if (slug) {
      await db.digitalBusinessCard.delete({ where: { slug } })
    }

    return NextResponse.json({ success: true, message: "Card deleted successfully" })
  } catch (error: any) {
    console.error("[API_ADMIN_DIGITAL_CARDS_DELETE]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
