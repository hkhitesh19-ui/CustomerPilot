import { hasModule } from "@/lib/feature-gate"
import { db } from "@/lib/db"
import { ReviewEditor } from "@/components/review/ReviewEditor"
import { generateDynamicReviewDraft } from "@/lib/dynamic-review-engine"
import { resolveMerchantKeywordProfile } from "@/lib/keyword-matrix"

export const dynamic = "force-dynamic"

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const customerId = typeof params.c === "string" ? params.c : undefined
  const merchantId = typeof params.m === "string" ? params.m : undefined

  if (!merchantId) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 text-center">
        <div className="p-6 bg-white border border-[#DADCE0] rounded-2xl shadow-xs text-sm font-medium text-[#5F6368] max-w-sm">
          Invalid Review Link. Merchant ID is required.
        </div>
      </div>
    )
  }

  const merchant = await db.merchant.findUnique({
    where: { id: merchantId }
  })

  if (!merchant) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 text-center">
        <div className="p-6 bg-white border border-[#DADCE0] rounded-2xl shadow-xs text-sm font-medium text-[#5F6368] max-w-sm">
          Store not found. Please verify the QR code.
        </div>
      </div>
    )
  }

  const googleConnection = await db.merchantGoogleConnection.findUnique({
    where: { merchantId: merchantId }
  })

  const customer = customerId
    ? await db.customer.findUnique({
        where: { id: customerId },
        include: { bills: { orderBy: { createdAt: "desc" }, take: 5 } }
      })
    : null

  const rawItemParam = typeof params.item === "string" ? params.item : (typeof params.product === "string" ? params.product : undefined)
  // Extract actual purchased product from customer bills if available, or URL param
  let productName = rawItemParam?.trim() || ""
  if (!productName && customer) {
    for (const bill of customer.bills || []) {
      if (bill.notes) {
        const match = bill.notes.match(/Product:\s*([^|]+)/i)
        if (match && match[1]?.trim()) {
          productName = match[1].trim()
          break
        } else if (!bill.notes.includes("Visit #") && !bill.notes.includes("Approved by")) {
          productName = bill.notes.trim()
          break
        }
      }
    }
  }

  // Fetch authentic merchant menu items for dynamic spotlight rotation
  const menuItems = (db as any).menuItem?.findMany
    ? await (db as any).menuItem.findMany({
    where: { merchantId: merchant.id, isAvailable: true },
    select: { name: true },
    take: 20
  }).catch(() => [])
    : []

  const businessCategory = merchant.businessType?.trim() || merchant.category?.trim() || "Retail Store"
  const menuItemNames = menuItems.map((m: { name: string }) => m.name)

  // Resolve keywordProfile & extract Top 5 Hero Chips for customer 1-tap review
  const kwProfile = resolveMerchantKeywordProfile({
    id: merchant.id,
    name: merchant.name,
    category: merchant.category,
    businessType: merchant.businessType,
    city: merchant.city || undefined,
    address: merchant.address || undefined,
    keywordProfile: (merchant as any).keywordProfile || null
  })

  // Extract up to 10 Bestseller Services and up to 10 Bestseller Products
  const heroServices: string[] = Array.isArray(kwProfile.heroServices) && kwProfile.heroServices.length > 0
    ? kwProfile.heroServices.slice(0, 10)
    : []

  const heroProducts: string[] = Array.isArray(kwProfile.heroProducts) && kwProfile.heroProducts.length > 0
    ? kwProfile.heroProducts.slice(0, 10)
    : []

  let heroChips: string[] = [...heroServices, ...heroProducts]
  if (heroChips.length === 0 && kwProfile.allowedSeoEntities) {
    heroChips = kwProfile.allowedSeoEntities.slice(0, 10)
  }
  if (productName && !heroChips.includes(productName)) {
    heroChips.unshift(productName)
  }

  // Fetch authentic real past Google reviews for few-shot style inspiration
  const realReviews = (db as any).googleBusinessReview?.findMany
    ? await (db as any).googleBusinessReview.findMany({
        where: { merchantId: merchant.id, rating: { gte: 4 }, comment: { not: null } },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { comment: true }
      }).catch(() => [])
    : []
  const pastPublicReviews: string[] = realReviews
    .map((r: { comment: string | null }) => r.comment!)
    .filter((c: string) => typeof c === "string" && c.trim().length > 10)

  // Generate dynamic, anti-repetitive AI / multi-angle rotating drafts
  const draftOptions = await generateDynamicReviewDraft({
    businessCategory: kwProfile.categoryKey || businessCategory,
    businessType: merchant.businessType || undefined,
    productName,
    merchantName: merchant.name,
    menuItems: menuItemNames,
    seed: Math.random().toString(36),
    merchantKeywordProfile: (merchant as any).keywordProfile || null,
    merchantCity: merchant.city || undefined,
    merchantAddress: merchant.address || undefined,
    pastPublicReviews
  })

  const dynamicDraft = draftOptions.draft1

  let googlePlaceId: string | null = googleConnection?.placeId || null
  let googleReviewLink: string | null = googleConnection?.googleReviewUrl || merchant.googleReviewLink || null

  if (!googlePlaceId && googleReviewLink && googleReviewLink.includes("placeid=")) {
    try {
      const match = googleReviewLink.match(/placeid=([^&]+)/)
      if (match && match[1]) {
        googlePlaceId = match[1]
      }
    } catch (_) {}
  }

  if (googlePlaceId === "manual_url" || googlePlaceId === "ChIJnv3BJRZhpx5DLTbjrz7FNVdlt19") {
    googleReviewLink = googleConnection?.address || googleConnection?.googleReviewUrl || merchant.googleReviewLink || null
    googlePlaceId = null
  }

  // Fail-safe Google Maps Search fallback if no review link or placeId exists
  const fallbackMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${merchant.name} ${merchant.address || merchant.city || ''}`.trim())}`
  if (googleReviewLink && googleReviewLink.includes("ChIJnv3BJRZhpx5DLTbjrz7FNVdlt19")) {
    googleReviewLink = fallbackMapsSearchUrl
    googlePlaceId = null
  }
  if (!googleReviewLink && !googlePlaceId) {
    googleReviewLink = fallbackMapsSearchUrl
  }

  // Fetch existing review if customer already posted previously
  const existingReview = customerId
    ? await db.review.findFirst({
        where: { merchantId, customerId },
        orderBy: { createdAt: "desc" }
      })
    : null

  // Fetch active stamp card configuration to display exact bonus stamps
  const stampCard = await db.stampCard.findFirst({
    where: { merchantId, active: true }
  })
  const isLoyaltyEnabled = hasModule(merchant, "LOYALTY") && !!stampCard?.active
  const googleReviewBonus = stampCard?.googleReviewBonus ?? 1
  const photoBonus = stampCard?.photoBonus ?? 2
  const existingReviewText = existingReview?.finalText || existingReview?.aiDraft || null
  const hasPreviousPhoto = !!(existingReview?.photoUrl)

  return (
    <ReviewEditor 
      initialDraft={dynamicDraft}
      draftOptions={draftOptions}
      existingReviewText={existingReviewText}
      merchant={{
        id: merchant.id,
        name: merchant.name,
        address: merchant.address,
        logoUrl: merchant.logoUrl,
        googleReviewLink: googleReviewLink,
        googlePlaceId: googlePlaceId
      }} 
      customer={{
        id: customer?.id || "",
        name: customer?.name || "VIP"
      }} 
      bonusInfo={{
        googleReviewBonus,
        photoBonus,
        hasPreviousPhoto,
        rewardName: stampCard?.rewardName || "FREE Reward",
        stampsRequired: stampCard?.stampsRequired || 10
      }}
      category={businessCategory}
      productName={productName}
      isLoyaltyEnabled={isLoyaltyEnabled}
      heroChips={heroChips}
      heroServices={heroServices}
      heroProducts={heroProducts}
    />
  )
}
