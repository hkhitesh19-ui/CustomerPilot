import { db } from "@/lib/db"

export interface ResolvedReferrer {
  id: string
  name: string
  phone: string
  referralCode: string
}

/**
 * Authoritative Referrer Resolver (Exact Match Only)
 * Zero fuzzy guessing, zero phone-suffix collisions, strict mathematical certainty.
 */
export async function resolveReferrerCustomer(
  merchantId: string,
  rawRef?: string | null
): Promise<ResolvedReferrer | null> {
  if (!rawRef || typeof rawRef !== "string") return null
  const cleanRef = rawRef.trim().toUpperCase()
  if (!cleanRef) return null

  // STRICT EXACT MATCH ONLY
  const customer = await db.customer.findFirst({
    where: {
      merchantId,
      referralCode: cleanRef,
      deletedAt: null,
    },
    select: { id: true, name: true, phone: true, referralCode: true },
  })

  if (customer && customer.referralCode) {
    return {
      id: customer.id,
      name: customer.name || "A VIP Member",
      phone: customer.phone,
      referralCode: customer.referralCode,
    }
  }

  return null
}
