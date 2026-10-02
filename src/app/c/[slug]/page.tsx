import { notFound } from "next/navigation"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { DigitalCardView, DigitalCardData } from "@/components/digital-card-view"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cleanSlug = slug.toLowerCase()

  const card = await db.digitalBusinessCard.findUnique({
    where: { slug: cleanSlug },
  })

  if (!card) {
    return {
      title: "Digital Business Card | CustomerPilot",
      description: "Official Live Digital Business Card with quick orders, contacts and location.",
    }
  }

  const title = `${card.displayName} • Official Digital Card`
  const description = `${card.locationShort || "Vadodara"} • ${card.googleRating || 4.6} ⭐ Google Rating. Order on Zomato, Swiggy, WhatsApp or Call Now.`

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

  // 1. Find the card by slug
  let card = await db.digitalBusinessCard.findUnique({
    where: { slug: cleanSlug },
  })

  // 2. Fallback: if not found, check if a merchant exists with similar name
  if (!card) {
    const merchant = await db.merchant.findFirst({
      where: {
        OR: [
          { name: { contains: "Cake Connection" } },
          { name: { contains: cleanSlug } },
        ],
      },
    })

    if (merchant) {
      const defaultOrdering = JSON.stringify([
        { platform: "website", label: "Website", sublabel: "Order Now", url: "https://cakeconnection.in", color: "#2563eb" },
        { platform: "whatsapp", label: "WhatsApp", sublabel: "Order Now", url: `https://wa.me/${merchant.whatsappPhone || "919876543210"}?text=Hi%20${encodeURIComponent(merchant.name)}%2C%20I%20want%20to%20place%20an%20order`, color: "#16a34a" },
        { platform: "zomato", label: "Zomato", sublabel: "Order Now", url: "https://www.zomato.com", color: "#ef4444" },
        { platform: "swiggy", label: "Swiggy", sublabel: "Order Now", url: "https://www.swiggy.com", color: "#f97316" },
        { platform: "easycater", label: "EasyCater", sublabel: "Order Now", url: "https://www.easycater.com", color: "#7c3aed" },
      ])

      card = await db.digitalBusinessCard.create({
        data: {
          merchantId: merchant.id,
          slug: cleanSlug,
          displayName: merchant.name || "Cake Connection",
          subCategories: "Cakes • Desserts • Flowers • Party Decor",
          logoUrl: merchant.logoUrl || "/uploads/1789267721286-IMG_20220502_WA0034.jpg",
          locationShort: "Manjalpur, Vadodara",
          locationState: "Gujarat, India",
          businessHours: "Open Daily • 9:00 AM – 12:00 AM",
          deliveryInfo: "Delivery Available • Vadodara Only",
          whatsappNumber: merchant.whatsappPhone || "919876543210",
          phoneNumber: "+91 98765 43210",
          instagramUrl: "https://instagram.com",
          facebookUrl: "https://facebook.com",
          youtubeUrl: "https://youtube.com",
          googleMapsUrl: "https://maps.google.com",
          websiteUrl: "https://cakeconnection.in",
          orderingLinks: defaultOrdering,
          googleRating: 4.6,
          googleReviewsCnt: 689,
        },
      })
    }
  }

  if (!card) {
    notFound()
  }

  const cardData: DigitalCardData = {
    id: card.id,
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
  }

  return <DigitalCardView card={cardData} />
}
