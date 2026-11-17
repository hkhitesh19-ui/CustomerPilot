import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/jwt-secret";
import { getOrCreateDigitalBusinessCard } from "@/lib/digital-card-service"


async function getMerchantIdFromReq(req: NextRequest): Promise<string | null> {
  const headerId = req.headers.get("x-merchant-id")
  if (headerId && headerId !== "admin_merchant") return headerId

  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "")
  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()))
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
    const parsedUrl = new URL(req.url)
    const searchParams = parsedUrl.searchParams
    const slug = searchParams.get("slug")
    const resolvedMerchantId = await getMerchantIdFromReq(req)
    const queryMerchantId = searchParams.get("merchantId")
    const targetMerchantId = resolvedMerchantId || queryMerchantId

    let card: any = null

    if (slug) {
      card = await db.digitalBusinessCard.findUnique({
        where: { slug: slug.toLowerCase() },
        include: { merchant: { select: { email: true, whatsappPhone: true } } },
      })
    } else if (targetMerchantId) {
      card = await db.digitalBusinessCard.findUnique({
        where: { merchantId: targetMerchantId },
        include: { merchant: { select: { email: true, whatsappPhone: true } } },
      })
      if (!card) {
        card = await getOrCreateDigitalBusinessCard(targetMerchantId)
      }
    } else {
      // Default to first merchant's card
      card = await db.digitalBusinessCard.findFirst({
        include: { merchant: { select: { email: true, whatsappPhone: true } } },
      })
    }

    if (!card) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 })
    }

    let parsedThemeMeta: any = {}
    try {
      if (card.theme && typeof card.theme === "string" && card.theme.startsWith("{")) {
        parsedThemeMeta = JSON.parse(card.theme)
      }
    } catch {}

    const resolvedEmail = card.email || parsedThemeMeta?.email || card.merchant?.email || null
    card.email = resolvedEmail

    const isVcardFormat = searchParams.get("format") === "vcard" || searchParams.get("vcard") === "true"
    if (isVcardFormat) {
      const safeDisplayName = card.displayName.replace(/[\r\n]+/g, " ").trim()
      const cleanPhone = (card.phoneNumber || card.whatsappNumber || "").replace(/[^0-9+]/g, "")
      const cleanWhatsapp = (card.whatsappNumber || card.phoneNumber || "").replace(/[^0-9+]/g, "")
      const safeSubCategories = (card.subCategories || "Local Business").replace(/[\r\n]+/g, " ").trim()
      const safeLocationShort = (card.locationShort || "").replace(/[\r\n]+/g, " ").trim()
      const safeLocationState = (card.locationState || "India").replace(/[\r\n]+/g, " ").trim()
      const cardUrl = `https://customerpilot.in/c/${card.slug}`
      const fileName = `${safeDisplayName.replace(/\s+/g, "_")}.vcf`

      let absoluteLogoUrl = ""
      if (card.logoUrl) {
        absoluteLogoUrl = card.logoUrl.startsWith("http")
          ? card.logoUrl
          : `https://customerpilot.in${card.logoUrl.startsWith("/") ? "" : "/"}${card.logoUrl}`
      }

      const nameParts = safeDisplayName.split(" ")
      const givenName = nameParts[0] || safeDisplayName
      const familyName = nameParts.slice(1).join(" ") || ""

      const vcardLines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "PRODID:-//CustomerPilot//Smart Digital Business Card//EN",
        `FN;CHARSET=UTF-8:${safeDisplayName}`,
        `N;CHARSET=UTF-8:${familyName};${givenName};;;`,
        `ORG;CHARSET=UTF-8:${safeDisplayName}`,
        `TITLE;CHARSET=UTF-8:${safeSubCategories}`,
        "ROLE:Business",
      ]

      if (cleanPhone) {
        vcardLines.push(`TEL;TYPE=CELL,VOICE,pref:${cleanPhone}`)
        vcardLines.push(`TEL;TYPE=WORK,VOICE:${cleanPhone}`)
      }

      if (cleanWhatsapp) {
        vcardLines.push(`TEL;TYPE=WHATSAPP:${cleanWhatsapp}`)
        vcardLines.push(`X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${cleanWhatsapp.replace(/[^0-9]/g, "")}`)
      }

      if (resolvedEmail) {
        vcardLines.push(`EMAIL;TYPE=INTERNET,WORK:${resolvedEmail}`)
        vcardLines.push(`EMAIL;TYPE=PREF,INTERNET:${resolvedEmail}`)
      }

      if (card.instagramUrl) {
        vcardLines.push(`X-SOCIALPROFILE;TYPE=instagram:${card.instagramUrl}`)
      }
      if (card.facebookUrl) {
        vcardLines.push(`X-SOCIALPROFILE;TYPE=facebook:${card.facebookUrl}`)
      }

      if (safeLocationShort || safeLocationState) {
        vcardLines.push(`ADR;TYPE=WORK,POSTAL,PARCEL;CHARSET=UTF-8:;;${safeLocationShort};${safeLocationState};;;India`)
      }

      vcardLines.push(`URL;TYPE=WORK:${cardUrl}`)
      if (card.websiteUrl) {
        vcardLines.push(`URL;TYPE=WEBSITE:${card.websiteUrl}`)
      }

      const note = `${safeDisplayName} - ${safeSubCategories}\\n📍 ${safeLocationShort}, ${safeLocationState}\\n🕒 ${card.businessHours || "Open Daily"}\\n🔗 Digital Card: ${cardUrl}`
      vcardLines.push(`NOTE;CHARSET=UTF-8:${note}`)

      if (absoluteLogoUrl) {
        vcardLines.push(`PHOTO;VALUE=URI:${absoluteLogoUrl}`)
      }

      vcardLines.push("END:VCARD")
      const vcardContent = vcardLines.join("\r\n")

      return new NextResponse(vcardContent, {
        status: 200,
        headers: {
          "Content-Type": "text/vcard; charset=utf-8",
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      })
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
      email,
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
      upiId,
      upiPayeeName,
      enableFoodDelivery,
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
    if (email !== undefined) {
      parsedTheme.email = email ? String(email).trim() : null
    }
    if (enableFoodDelivery !== undefined) {
      parsedTheme.enableFoodDelivery = Boolean(enableFoodDelivery)
    }
    if (upiId !== undefined) {
      parsedTheme.upiId = upiId ? String(upiId).trim() : null
    }
    if (upiPayeeName !== undefined) {
      parsedTheme.upiPayeeName = upiPayeeName ? String(upiPayeeName).trim() : null
    }
    if (!existingCard && !parsedTheme.trialEndsAt) {
      parsedTheme.isTrial = true
      parsedTheme.trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
    const themeData = JSON.stringify(parsedTheme)

    // Detect if this is a Pet Business (Pet store, clinic, grooming, supplies)
    const categoryText = `${subCategories || ""} ${displayName || ""}`.toLowerCase()
    const isPetCategory = categoryText.includes("pet") || categoryText.includes("dog") || categoryText.includes("cat") || categoryText.includes("puppy") || categoryText.includes("animal") || categoryText.includes("vet") || categoryText.includes("grooming")
    const allowFoodDelivery = Boolean(enableFoodDelivery)

    // Construct ordering links
    let finalOrderingLinks = orderingLinks
    if (
      zomatoUrl !== undefined ||
      swiggyUrl !== undefined ||
      websiteUrl !== undefined ||
      otherOrderUrl !== undefined ||
      whatsappNumber !== undefined
    ) {
      const linksArr: Array<{ platform: string; label: string; sublabel?: string; url: string; color?: string }> = []
      
      if (websiteUrl && websiteUrl.trim()) {
        linksArr.push({ platform: "website", label: isPetCategory ? "Online Store" : "Website", sublabel: isPetCategory ? "Explore" : "Order Now", url: websiteUrl.trim(), color: "#2563eb" })
      }
      if (whatsappNumber && whatsappNumber.trim()) {
        linksArr.push({
          platform: "whatsapp",
          label: "WhatsApp",
          sublabel: isPetCategory ? "Pet Supplies" : "Order Now",
          url: `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(displayName)}%2C%20${encodeURIComponent(isPetCategory ? "I want to inquire about pet supplies" : "I want to order")}`,
          color: "#16a34a"
        })
      }
      // ONLY add Zomato and Swiggy if NOT a pet category, or if food delivery is explicitly enabled
      if (!isPetCategory || allowFoodDelivery) {
        if (zomatoUrl && zomatoUrl.trim()) {
          linksArr.push({ platform: "zomato", label: "Zomato", sublabel: "Order Now", url: zomatoUrl.trim(), color: "#ef4444" })
        }
        if (swiggyUrl && swiggyUrl.trim()) {
          linksArr.push({ platform: "swiggy", label: "Swiggy", sublabel: "Order Now", url: swiggyUrl.trim(), color: "#f97316" })
        }
      }
      if (otherOrderUrl && otherOrderUrl.trim()) {
        linksArr.push({
          platform: "easycater",
          label: otherOrderLabel?.trim() || (isPetCategory ? "Pet Catalog" : "Catalog"),
          sublabel: "Order Now",
          url: otherOrderUrl.trim(),
          color: "#7c3aed"
        })
      }

      // If pet category and list is empty or minimal, supply pet store action channels
      if (isPetCategory && linksArr.length === 0) {
        if (whatsappNumber && whatsappNumber.trim()) {
          linksArr.push({
            platform: "whatsapp",
            label: "WhatsApp",
            sublabel: "Pet Supplies",
            url: `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(displayName)}%2C%20I%20have%20an%20inquiry`,
            color: "#16a34a"
          })
        }
        linksArr.push({
          platform: "catalog",
          label: "Pet Food",
          sublabel: "View All",
          url: websiteUrl || "#",
          color: "#7c3aed"
        })
        linksArr.push({
          platform: "grooming",
          label: "Grooming",
          sublabel: "Book Spa",
          url: whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20want%20to%20book%20a%20grooming%20session` : "#",
          color: "#0284c7"
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
    const effectiveEmail = email !== undefined ? (email ? String(email).trim() : null) : undefined

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
        email: effectiveEmail,
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
        email: effectiveEmail !== undefined ? effectiveEmail : null,
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
