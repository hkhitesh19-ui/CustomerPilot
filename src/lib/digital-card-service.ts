import { db } from "@/lib/db"

/**
 * Ensures every merchant has an active Smart Digital Business Card.
 * Self-healing: If no record exists, automatically provisions one using verified merchant data.
 */
export async function getOrCreateDigitalBusinessCard(merchantId: string) {
  if (!merchantId) return null

  try {
    // 1. Check existing card
    const existing = await db.digitalBusinessCard.findFirst({
      where: { merchantId },
    })

    if (existing) {
      if (!existing.isActive) {
        return await db.digitalBusinessCard.update({
          where: { id: existing.id },
          data: { isActive: true },
        })
      }
      return existing
    }

    // 2. Fetch merchant details
    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
    })
    if (!merchant) return null

    // 3. Generate clean unique slug
    const baseSlug = (merchant.name || "store")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "store"

    let cleanSlug = baseSlug
    let counter = 1
    while (true) {
      const conflict = await db.digitalBusinessCard.findUnique({ where: { slug: cleanSlug } })
      if (!conflict || conflict.merchantId === merchant.id) break
      cleanSlug = `${baseSlug}-${counter}`
      counter++
    }

    const businessType = (merchant.businessType || "").toLowerCase()
    const subCategories =
      businessType.includes("fashion") || businessType.includes("clothing") || businessType.includes("apparel")
        ? "Ethnic & Western Wear • Designer Collections • Premium Fashion"
        : businessType.includes("bakery") || businessType.includes("cake")
        ? "Cakes • Desserts • Bakery & Confectionery"
        : businessType.includes("restaurant") || businessType.includes("cafe")
        ? "Fine Dining • Multi-Cuisine • Express Delivery"
        : `${merchant.name} • Official VIP Store`

    // 4. Provision fresh DigitalBusinessCard
    return await db.digitalBusinessCard.create({
      data: {
        merchantId: merchant.id,
        slug: cleanSlug,
        displayName: merchant.name || "Our Store",
        subCategories: subCategories,
        logoUrl: merchant.logoUrl || null,
        coverUrl: merchant.coverUrl || null,
        locationShort: merchant.city || "Kanpur",
        locationState: merchant.state || "Uttar Pradesh",
        whatsappNumber: merchant.whatsappPhone || null,
        phoneNumber: merchant.phone || merchant.whatsappPhone || null,
        googleRating: merchant.baselineRating || 5.0,
        googleReviewsCnt: merchant.baselineReviewCount || 1,
        googlePlaceId: merchant.googlePlaceId || null,
        googleMapsUrl: merchant.googleReviewLink || null,
        theme: JSON.stringify({
          style: "champagne_luxury",
          googleReviewLink: merchant.googleReviewLink || null,
        }),
        isActive: true,
        orderingLinks: "[]",
        businessHours: "10:30 AM - 09:30 PM",
        deliveryInfo: "Store Walk-in & Express Delivery Available",
      },
    })
  } catch (error) {
    console.error("Error in getOrCreateDigitalBusinessCard:", error)
    return null
  }
}
