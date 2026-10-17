import { notFound } from "next/navigation"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { DigitalCardView, DigitalCardData } from "@/components/digital-card-view"
import { getOrCreateDigitalBusinessCard } from "@/lib/digital-card-service"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cleanSlug = slug.toLowerCase()

  let card = await db.digitalBusinessCard.findUnique({
    where: { slug: cleanSlug },
  })

  if (!card) {
    const merchants = await db.merchant.findMany()
    const matchingMerchant = merchants.find((m) => {
      const s = (m.name || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
      return s === cleanSlug || m.id === cleanSlug
    })
    if (matchingMerchant) {
      card = await getOrCreateDigitalBusinessCard(matchingMerchant.id)
    }
  }

  if (!card) {
    return {
      title: "Digital Business Card | CustomerPilot",
      description: "Official Live Digital Business Card with quick orders, contacts and location.",
    }
  }

  const isFood = (card.subCategories || "").toLowerCase().includes("cake") ||
                 (card.subCategories || "").toLowerCase().includes("food") ||
                 (card.subCategories || "").toLowerCase().includes("bakery") ||
                 (card.subCategories || "").toLowerCase().includes("dessert")

  const actionText = isFood
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
      images: [card.logoUrl || "https://customerpilot.in/cplogo.png"],
    },
  }
}

export default async function PublicDigitalCardPage({ params }: PageProps) {
  const { slug } = await params
  const cleanSlug = slug.toLowerCase()

  let card = await db.digitalBusinessCard.findUnique({
    where: { slug: cleanSlug },
    include: { merchant: true },
  })

  if (!card) {
    const merchants = await db.merchant.findMany()
    const matchingMerchant = merchants.find((m) => {
      const s = (m.name || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
      return s === cleanSlug || m.id === cleanSlug
    })
    if (matchingMerchant) {
      card = await getOrCreateDigitalBusinessCard(matchingMerchant.id)
      if (card) {
        card = await db.digitalBusinessCard.findUnique({
          where: { id: card.id },
          include: { merchant: true },
        })
      }
    }
  }

  if (!card) {
    notFound()
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
    logoUrl: card.logoUrl,
    coverUrl: card.coverUrl,
    locationShort: card.locationShort,
    locationState: card.locationState,
    businessHours: card.businessHours,
    deliveryInfo: card.deliveryInfo,
    whatsappNumber: card.whatsappNumber,
    phoneNumber: card.phoneNumber,
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

  return <DigitalCardView card={cardData} />
}
