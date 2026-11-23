import { notFound } from "next/navigation"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { DigitalCardView, DigitalCardData } from "@/components/digital-card-view"
import { resolveDigitalCardBySlug } from "@/lib/digital-card-service"
import { resolveReferrerCustomer } from "@/lib/referral-resolver"

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const card = await resolveDigitalCardBySlug(slug)

  if (!card) {
    return {
      title: "Digital Business Card | CustomerPilot",
      description: "Official Live Digital Business Card with quick orders, contacts and location.",
    }
  }

  const isPet = ((card.subCategories || "") + " " + (card.displayName || "")).toLowerCase().match(/pet|dog|cat|puppy|animal|vet|grooming|paw/) !== null
  const isFood = !isPet && (
    (card.subCategories || "").toLowerCase().includes("cake") ||
    (card.subCategories || "").toLowerCase().includes("food") ||
    (card.subCategories || "").toLowerCase().includes("bakery") ||
    (card.subCategories || "").toLowerCase().includes("dessert") ||
    (card.subCategories || "").toLowerCase().includes("restaurant") ||
    (card.subCategories || "").toLowerCase().includes("cafe")
  )

  const actionText = isPet
    ? "Chat on WhatsApp, Browse Pet Food & Supplies Catalog, Book Grooming, or Call Now."
    : isFood
    ? "Order on Zomato, Swiggy, WhatsApp or Call Now."
    : "Chat on WhatsApp, Browse Official Catalog, Get Directions or Call Now."

  const title = `${card.displayName} • Official Digital Card`
  const description = `${card.locationShort || card.locationState || "Gujarat"} • ${card.googleRating || 4.8} ⭐ Google Rating. ${actionText}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://customerpilot.in/c/${card.slug}`,
      siteName: "CustomerPilot Digital Business Cards",
      images: [
        {
          url: card.logoUrl || "https://customerpilot.in/cplogo.png",
          width: 600,
          height: 600,
          alt: card.displayName,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card.logoUrl || card.merchant?.logoUrl || "https://customerpilot.in/cplogo.png"],
    },
  }
}

export default async function PublicDigitalCardPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = searchParams ? await searchParams : {}
  const rawRef = typeof sp?.ref === "string" ? sp.ref.trim().toUpperCase() : null

  const card = await resolveDigitalCardBySlug(slug)

  if (!card) {
    notFound()
  }

  let referralInfo: {
    referralCode: string
    referrerName: string
    referrerId?: string | null
  } | null = null

  if (rawRef) {
    const cleanRef = rawRef.trim().toUpperCase()
    const referrer = await resolveReferrerCustomer(card.merchantId, cleanRef)
    if (referrer) {
      referralInfo = {
        referralCode: referrer.referralCode,
        referrerName: referrer.name || "A VIP Member",
        referrerId: referrer.id
      }
    } else {
      // Neutral banner: shows code was entered, but referrer is unverified in DB.
      // CRITICAL: NEVER use empty string "" as referrerId.
      referralInfo = {
        referralCode: cleanRef,
        referrerName: "VIP Club",
        referrerId: null
      }
    }
  }

  // Ensure theme honors merchant's active plan and extended trialEndsAt from SuperAdmin
  let effectiveTheme = card.theme
  if (card.merchant) {
    const isSubscribed = card.merchant.plan && card.merchant.plan !== "trial"
    let themeObj: any = {}
    try {
      themeObj = typeof card.theme === "string" && card.theme.startsWith("{") ? JSON.parse(card.theme) : { baseTheme: card.theme }
    } catch (_) {
      themeObj = { baseTheme: card.theme }
    }
    if (isSubscribed) {
      themeObj.subscribed = true
    }
    if (card.merchant.trialEndsAt) {
      themeObj.trialEndsAt = card.merchant.trialEndsAt.toISOString()
    }
    effectiveTheme = JSON.stringify(themeObj)
  }

  const cardData: DigitalCardData = {
    id: card.id,
    merchantId: card.merchantId,
    slug: card.slug,
    displayName: card.displayName,
    subCategories: card.subCategories,
    logoUrl: card.logoUrl || card.merchant?.logoUrl || null,
    coverUrl: card.coverUrl || card.merchant?.coverUrl || null,
    locationShort: card.locationShort,
    locationState: card.locationState,
    businessHours: card.businessHours,
    deliveryInfo: card.deliveryInfo,
    whatsappNumber: card.whatsappNumber || card.merchant?.whatsappPhone || card.phoneNumber || "",
    phoneNumber: card.phoneNumber,
    email: card.email || (effectiveTheme && effectiveTheme.startsWith("{") ? (JSON.parse(effectiveTheme).email || null) : null) || card.merchant?.email || null,
    instagramUrl: card.instagramUrl,
    facebookUrl: card.facebookUrl,
    youtubeUrl: card.youtubeUrl,
    googleMapsUrl: card.googleMapsUrl,
    websiteUrl: card.websiteUrl,
    orderingLinks: card.orderingLinks,
    googleRating: card.googleRating,
    googleReviewsCnt: card.googleReviewsCnt,
    createdAt: card.createdAt,
    theme: effectiveTheme,
    googlePlaceId: card.googlePlaceId,
  }

  return <DigitalCardView card={cardData} referralInfo={referralInfo} />
}
