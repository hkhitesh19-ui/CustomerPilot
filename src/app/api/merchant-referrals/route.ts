import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    
    const referrals = await db.merchantReferral.findMany({
      where: { referrerMerchantId: merchant.id },
      include: {
        referredMerchant: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    
    return ok({ referrals })
  } catch (error) {
    console.error('[Merchant Referrals GET Error]', error)
    return err('Failed to fetch referrals', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    
    if (merchant.merchantReferralCode) {
      return ok({ code: merchant.merchantReferralCode })
    }

    // Generate unique code
    const firstWord = merchant.name.split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase()
    const code = `${firstWord}-${randomChars}`

    // Update merchant
    const updatedMerchant = await db.merchant.update({
      where: { id: merchant.id },
      data: { merchantReferralCode: code }
    })

    // Create a generic MerchantReferral record representing this code/invite link
    await db.merchantReferral.create({
      data: {
        referrerMerchantId: merchant.id,
        referralCode: code,
        status: "INVITED"
      }
    })

    return ok({ code: updatedMerchant.merchantReferralCode })
  } catch (error) {
    console.error('[Merchant Referrals POST Error]', error)
    return err('Failed to generate referral code', 500)
  }
}
