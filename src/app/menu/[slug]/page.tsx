import { notFound } from "next/navigation"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { MenuView, MenuItemData } from "@/components/menu-view"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cleanSlug = slug.toLowerCase().trim()

  const card = await db.digitalBusinessCard.findUnique({
    where: { slug: cleanSlug },
    include: { merchant: true },
  })

  const merchant = card?.merchant || (await db.merchant.findFirst({
    where: {
      OR: [
        { id: cleanSlug },
        { name: { contains: cleanSlug.replace(/-/g, " ") } },
      ],
    },
  }))

  const storeName = merchant?.name || "Online Menu"

  return {
    title: `${storeName} · Online Ordering Menu (Zomato-Style)`,
    description: `Order fresh items directly from ${storeName} on WhatsApp. Instant delivery & pickup options.`,
    openGraph: {
      title: `${storeName} · Live Online Menu`,
      description: `Browse menu, check prices, and order directly on WhatsApp.`,
      images: [merchant?.logoUrl || "https://customerpilot.in/cplogo.png"],
    },
  }
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params
  const cleanSlug = slug.toLowerCase().trim()

  // 1. Resolve merchant by Digital Card slug or merchant ID or Name slug
  const card = await db.digitalBusinessCard.findUnique({
    where: { slug: cleanSlug },
    include: { merchant: true },
  })

  let merchant: any = card?.merchant

  if (!merchant) {
    const allMerchants = await db.merchant.findMany()
    const matched = allMerchants.find(m => {
      const generatedSlug = (m.name || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
      return generatedSlug === cleanSlug || m.id === cleanSlug
    })
    merchant = matched || null
  }

  if (!merchant) {
    return notFound()
  }

  // 2. Fetch available Menu Items
  const items = await db.menuItem.findMany({
    where: {
      merchantId: merchant.id,
      isAvailable: true,
    },
    orderBy: [
      { category: "asc" },
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  })

  // Group items by category
  const categoryMap: Record<string, MenuItemData[]> = {}
  for (const item of items) {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = []
    }
    categoryMap[item.category].push({
      id: item.id,
      merchantId: item.merchantId,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price,
      originalPrice: item.originalPrice,
      imageUrl: item.imageUrl,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      sortOrder: item.sortOrder,
      tags: item.tags,
    })
  }

  const initialCategories = Object.entries(categoryMap).map(([name, catItems]) => ({
    name,
    items: catItems,
  }))

  const merchantData = {
    id: merchant.id,
    name: merchant.name,
    whatsappPhone: merchant.whatsappPhone,
    logoUrl: merchant.logoUrl,
    address: merchant.address,
    city: merchant.city || (card ? card.locationShort : null),
    businessTiming: merchant.businessTiming || (card ? card.businessHours : null),
    rating: card?.googleRating || 4.8,
    reviewsCount: card?.googleReviewsCnt || 120,
    slug: card?.slug || cleanSlug,
  }

  return (
    <MenuView
      merchant={merchantData}
      initialCategories={initialCategories}
    />
  )
}
