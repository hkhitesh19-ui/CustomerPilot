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

  // Extract phone 4-digit token: e.g. "CP-4707" -> "4707", "CP-47075W60" -> "4707"
  const cpMatch = cleanRef.match(/CP-?(\d{4})/i)
  const digits = cleanRef.replace(/[^0-9]/g, "")
  const phone4 = cpMatch ? cpMatch[1] : (digits.length >= 4 ? digits.slice(0, 4) : digits.slice(-4))

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

  // 2b. Base Code match: if cleanRef has random suffix (e.g. CP-47075W60) and customer has CP-4707
  if (phone4.length === 4) {
    const baseCode = `CP-${phone4}`
    customer = await db.customer.findFirst({
      where: {
        merchantId,
        referralCode: baseCode,
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
  }

  // 3. Phone suffix match (e.g. CP-4707 or CP-47075W60 matches customer with phone ending in 4707)
  if (phone4.length === 4) {
    customer = await db.customer.findFirst({
      where: {
        merchantId,
        phone: { endsWith: phone4 },
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
