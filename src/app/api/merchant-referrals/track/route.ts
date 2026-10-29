import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")
    
    const { referralCode, merchantId } = body
    if (!referralCode || !merchantId) {
      return err("Missing referralCode or merchantId", 400)
    }

    // Find the referral record
    const referral = await db.merchantReferral.findUnique({
      where: { referralCode }
    })

    if (!referral) {
      return err("Invalid referral code", 404)
    }

    // If it's a generic one with no referredMerchantId, we can just update it.
    // Or if it already has one, we might need to create a new record.
    // Let's assume the one we created in the main API acts as a master or we just update the generic one.
    // Actually, if a merchant shares a link, multiple people could sign up. 
    // The prompt says: "When a new merchant signs up via referral, call this to link them. Updates MerchantReferral status from INVITED to SIGNED_UP, sets referredMerchantId."
    // We'll update the existing INVITED record if it has no referredMerchantId, 
    // or create a new one if the existing one is already taken by another signup.
    
    let targetReferral = await db.merchantReferral.findFirst({
      where: { referralCode, referredMerchantId: null }
    })

    if (targetReferral) {
      await db.merchantReferral.update({
        where: { id: targetReferral.id },
        data: {
          status: "SIGNED_UP",
          referredMerchantId: merchantId,
          convertedAt: new Date()
        }
      })
    } else {
      // Create a new one for this specific signup
      await db.merchantReferral.create({
        data: {
          referrerMerchantId: referral.referrerMerchantId,
          referredMerchantId: merchantId,
          referralCode: `${referralCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`, // Need unique code for schema
          status: "SIGNED_UP",
          convertedAt: new Date()
        }
      })
    }

    return ok({ message: "Referral tracked successfully" })
  } catch (error) {
    console.error('[Merchant Referrals Track Error]', error)
    return err('Failed to track referral', 500)
  }
}
