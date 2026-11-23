import { db } from "@/lib/db"

export interface ResolvedReferrer {
  id: string
  name: string
  phone: string
  referralCode: string
}

/**
 * Universal Self-Healing Referrer Resolver
 * Tier 1: Exact referralCode match (e.g. CP-4707)
 * Tier 2: Prefix referralCode match (e.g. CP-4707 matches CP-4707ABCD)
 * Tier 3: Phone suffix match (e.g. CP-4707 matches customer with phone ending in 4707)
 */
export async function resolveReferrerCustomer(
  merchantId: string,
  rawRef?: string | null
): Promise<ResolvedReferrer | null> {
  if (!rawRef || typeof rawRef !== "string") return null
  const cleanRef = rawRef.trim().toUpperCase()
  if (!cleanRef) return null

  const digits = cleanRef.replace(/[^0-9]/g, "")
  const last4 = digits.slice(-4)

  // 1. Exact referralCode match
  let customer = await db.customer.findFirst({
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

  // 2. Prefix match (e.g., CP-4707 matches CP-4707ABCD)
  customer = await db.customer.findFirst({
    where: {
      merchantId,
      referralCode: { startsWith: cleanRef },
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

  // 3. Phone suffix match (e.g. CP-4707 or 4707 matches customer with phone ending in 4707)
  if (last4.length === 4) {
    customer = await db.customer.findFirst({
      where: {
        merchantId,
        phone: { endsWith: last4 },
        deletedAt: null,
      },
      select: { id: true, name: true, phone: true, referralCode: true },
    })
    if (customer) {
      return {
        id: customer.id,
        name: customer.name || "A VIP Member",
        phone: customer.phone,
        referralCode: customer.referralCode || cleanRef,
      }
    }
  }

  return null
}
