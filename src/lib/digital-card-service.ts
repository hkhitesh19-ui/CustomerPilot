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
    const category = (merchant.category || "").toLowerCase()
    const mName = (merchant.name || "").toLowerCase()
    const isPet = (
      !mName.includes("pethapur") && !mName.includes("carpet") && !mName.includes("petlad") && !category.includes("saree") && !category.includes("cloth") &&
      (
        businessType.includes("pet_shop") || businessType.includes("pet_clinic") ||
        category.includes("pet shop") || category.includes("pet store") || category.includes("veterin") || category.includes("animal hospital") ||
        (/\b(pet|pets|dog|dogs|cat|cats|puppy|puppies|animal|animals|paw|paws)\b/i.test(`${businessType} ${category} ${mName}`))
      )
    )
    
    const subCategories =
      isPet
        ? "Pet Shop • Pet Grooming • Pet Food • Accessories • Pet Cafe"
        : businessType.includes("fashion") || businessType.includes("clothing") || businessType.includes("apparel") || category.includes("saree") || category.includes("cloth") || mName.includes("saree") || mName.includes("silk")
        ? "Silk Sarees • Bridal Lehengas • Ethnic Wear • Designer Collection"
        : businessType.includes("bakery") || businessType.includes("cake")
        ? "Cakes • Desserts • Bakery & Confectionery"
        : businessType.includes("restaurant") || businessType.includes("cafe")
        ? "Fine Dining • Multi-Cuisine • Express Delivery"
        : `${merchant.name} • Official VIP Store`

    const defaultOrderingLinks = isPet ? JSON.stringify([
      { platform: "whatsapp", label: "WhatsApp", sublabel: "Pet Supplies", url: `https://wa.me/${(merchant.whatsappPhone || "").replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(merchant.name)}%2C%20I%20want%20to%20order%20pet%20supplies`, color: "#16a34a" },
      { platform: "catalog", label: "Pet Food", sublabel: "View All", url: "#", color: "#7c3aed" },
      { platform: "grooming", label: "Grooming", sublabel: "Book Spa", url: `https://wa.me/${(merchant.whatsappPhone || "").replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20want%20to%20book%20a%20grooming%20session`, color: "#0284c7" },
      { platform: "website", label: "Website", sublabel: "Store", url: "#", color: "#2563eb" },
      { platform: "directions", label: "Store Visit", sublabel: "Find Us", url: merchant.googleReviewLink || "#", color: "#d97706" }
    ]) : "[]"

    // 4. Provision fresh DigitalBusinessCard
    return await db.digitalBusinessCard.create({
      data: {
        merchantId: merchant.id,
        slug: cleanSlug,
        displayName: merchant.name || "Our Store",
        subCategories: subCategories,
        logoUrl: merchant.logoUrl || null,
        coverUrl: merchant.coverUrl || null,
        locationShort: merchant.city || "Vadodara",
        locationState: (merchant as any).state || "Gujarat, India",
        whatsappNumber: merchant.whatsappPhone || null,
        phoneNumber: (merchant as any).phone || merchant.whatsappPhone || null,
        email: merchant.email || null,
        instagramUrl: `https://www.instagram.com/${cleanSlug.replace(/-/g, "")}/`,
        facebookUrl: `https://www.facebook.com/${cleanSlug.replace(/-/g, "")}/`,
        googleRating: merchant.baselineRating || 5.0,
        googleReviewsCnt: merchant.baselineReviewCount || 1,
        googlePlaceId: (merchant as any).googlePlaceId || null,
        googleMapsUrl: merchant.googleReviewLink || null,
        theme: JSON.stringify({
          style: "champagne_luxury",
          googleReviewLink: merchant.googleReviewLink || null,
          email: merchant.email || null,
        }),
        isActive: true,
        orderingLinks: defaultOrderingLinks,
        businessHours: isPet ? "Open Daily • 10:00 AM – 09:30 PM" : "10:30 AM - 09:30 PM",
        deliveryInfo: isPet ? "Store Walk-in & Express Home Delivery" : "Store Walk-in & Express Delivery Available",
      },
    })
  } catch (error) {
    console.error("Error in getOrCreateDigitalBusinessCard:", error)
    return null
  }
}

function normalizeCompactSlug(value: string): string {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

/**
 * Self-healing Digital Business Card slug resolver.
 * Prevents printed QR standees from breaking with 404 when a merchant later edits
 * hyphens/punctuation in their slug (e.g. "maw-paw" <-> "mawpaw", "cake-connection" <-> "cakeconnection").
 */
export async function resolveDigitalCardBySlug(rawSlug: string) {
  const cleanSlug = decodeURIComponent(String(rawSlug || "")).toLowerCase().trim()
  if (!cleanSlug) return null

  // 1. Fast exact slug match
  const exact = await db.digitalBusinessCard.findUnique({
    where: { slug: cleanSlug },
    include: { merchant: true },
  })
  if (exact) return exact

  const targetCompact = normalizeCompactSlug(cleanSlug)
  if (!targetCompact) return null

  // 2. Hyphen/punctuation-insensitive match against existing DigitalBusinessCards (slug or displayName)
  const allCards = await db.digitalBusinessCard.findMany({
    include: { merchant: true },
  })
  const fuzzyCard = allCards.find((c) => {
    const slugCompact = normalizeCompactSlug(c.slug)
    const nameCompact = normalizeCompactSlug(c.displayName)
    return slugCompact === targetCompact || nameCompact === targetCompact
  })
  if (fuzzyCard) return fuzzyCard

  // 3. Fallback match against Merchant name (full or short title before "(", ":", "|") or merchantId
  const merchants = await db.merchant.findMany()
  const matchingMerchant = merchants.find((m) => {
    if (m.id === cleanSlug) return true
    const fullName = String(m.name || "")
    const shortName = fullName.split(/\s*(?:\(|:|\||—|–)\s*/)[0] || fullName
    const fullKebab = fullName.toLowerCase().trim().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
    return (
      fullKebab === cleanSlug ||
      normalizeCompactSlug(fullName) === targetCompact ||
      normalizeCompactSlug(shortName) === targetCompact
    )
  })

  if (matchingMerchant) {
    const createdOrExisting = await getOrCreateDigitalBusinessCard(matchingMerchant.id)
    if (createdOrExisting) {
      return await db.digitalBusinessCard.findUnique({
        where: { id: createdOrExisting.id },
        include: { merchant: true },
      })
    }
  }

  return null
}
