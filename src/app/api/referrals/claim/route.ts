import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/utils"
import { resolveReferrerCustomer } from "@/lib/referral-resolver"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
    }

    const { referralCode, friendPhone, friendName, merchantSlug, merchantId: rawMerchantId } = body

    if (!referralCode || typeof referralCode !== "string") {
      return NextResponse.json({ success: false, error: "Referral code is required" }, { status: 400 })
    }

    if (!friendPhone || typeof friendPhone !== "string") {
      return NextResponse.json({ success: false, error: "Friend phone number is required" }, { status: 400 })
    }

    const normalizedFriendPhone = normalizePhone(friendPhone)
    if (!normalizedFriendPhone || normalizedFriendPhone.length < 10) {
      return NextResponse.json({ success: false, error: "Please enter a valid 10-digit mobile number" }, { status: 400 })
    }

    const cleanRefCode = referralCode.trim().toUpperCase()

    // 1. Resolve merchant
    let merchant: import("@prisma/client").Merchant | null = null
    if (rawMerchantId) {
      merchant = await db.merchant.findUnique({ where: { id: rawMerchantId } })
    } else if (merchantSlug) {
      const card = await db.digitalBusinessCard.findUnique({
        where: { slug: merchantSlug },
        include: { merchant: true }
      })
      merchant = card?.merchant || null
    }

    // 2. Resolve target merchant
    const targetMerchantId = rawMerchantId || merchant?.id
    let activeMerchant = merchant
    if (!activeMerchant && targetMerchantId) {
      activeMerchant = await db.merchant.findUnique({ where: { id: targetMerchantId } })
    }

    if (!activeMerchant) {
      return NextResponse.json({ success: false, error: "Merchant not found", granted: false }, { status: 404 })
    }

    // 3. Resolve referrer customer with strict exact match
    const referrer = await resolveReferrerCustomer(activeMerchant.id, cleanRefCode)

    // Security Gate: Unknown or fake codes MUST NOT grant stamps and MUST NOT create a pending pass!
    if (!referrer) {
      return NextResponse.json({
        success: false,
        granted: false,
        error: "Invalid or expired referral code. No bonus stamps granted."
      }, { status: 200 })
    }

    // 4. Anti-abuse: Self-referral prevention
    const referrerPhone = normalizePhone(referrer.phone) || referrer.phone
    if (referrerPhone === normalizedFriendPhone || referrerPhone.slice(-10) === normalizedFriendPhone.slice(-10)) {
      return NextResponse.json({ success: false, error: "Self-referral is not allowed. Please share this pass with a friend!" }, { status: 400 })
    }

    // 4. Check if friend is already an established customer with past orders/stamps
    const existingFriendCustomer = await db.customer.findFirst({
      where: {
        merchantId: activeMerchant.id,
        OR: [
          { phone: normalizedFriendPhone },
          { phone: normalizedFriendPhone.slice(-10) },
          { phone: `+${normalizedFriendPhone}` }
        ],
        deletedAt: null
      }
    })

    if (existingFriendCustomer && (existingFriendCustomer.lifetimeStamps > 0 || existingFriendCustomer.lifetimeSpend > 0)) {
      return NextResponse.json({ 
        success: false, 
        error: "You are already an active VIP member at this store! Referral welcome bonuses are reserved for first-time visitors." 
      }, { status: 409 })
    }

    // 5. Check if friend already has a referral for this merchant
    const last10 = normalizedFriendPhone.slice(-10)
    const existingReferral = await db.referral.findFirst({
      where: {
        merchantId: activeMerchant.id,
        OR: [
          { friendPhone: normalizedFriendPhone },
          { friendPhone: last10 },
          { friendPhone: `+${normalizedFriendPhone}` },
          { friendPhone: `91${last10}` }
        ]
      },
      include: { referrer: { select: { name: true } } }
    })

    if (existingReferral) {
      if (existingReferral.status === "approved") {
        return NextResponse.json({ 
          success: false, 
          error: "Your referral welcome bonus has already been used for this store." 
        }, { status: 409 })
      }
      // If already pending, return success (idempotent)
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        referrerName: existingReferral.referrer?.name || referrer.name,
        merchantName: activeMerchant.name,
        message: "Your VIP Pass is already active! Scan the counter QR during your visit to claim your bonus stamp."
      })
    }

    // 6. Create pending referral row
    const referral = await db.referral.create({
      data: {
        merchantId: activeMerchant.id,
        referrerId: referrer.id,
        friendPhone: normalizedFriendPhone,
        friendCustomerId: existingFriendCustomer ? existingFriendCustomer.id : null,
        status: "pending",
        rewardType: "stamps",
        rewardAmount: 1
      }
    })

    // If friend customer already exists in db, update referredById
    if (existingFriendCustomer) {
      await db.customer.update({
        where: { id: existingFriendCustomer.id },
        data: {
          referredById: referrer.id,
          acquisitionChan: "referral"
        }
      }).catch(() => {})
    }

    // 7. Send instant WhatsApp confirmation to friend (if Evolution configured)
    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
    const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY
    const instanceName = activeMerchant.whatsappInstanceName

    if (EVOLUTION_API_URL && EVOLUTION_API_KEY && instanceName) {
      const welcomeMsg = `🎉 *VIP Pass Activated!* 🎂\n\n` +
        `Hi! Aapka VIP Welcome Pass *${activeMerchant.name}* ke liye activate ho gaya hai (Gifted by *${referrer.name}*)! 🎁\n\n` +
        `⭐ *Aapko kya milega:*\n` +
        `• 1st visit par *+1 Extra Free Bonus Stamp* bilkul Free 🎁\n` +
        `• Digital Stamp Card & Special VIP Perks ✨\n\n` +
        `🏪 *Shop Par Kaise Use Karein:*\n` +
        `Jab aap shop visit karein, counter par laga Loyalty QR scan karein — aapka Free Bonus Stamp automatic credit ho jayega! ❤️`

      fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
        body: JSON.stringify({ number: normalizedFriendPhone, text: welcomeMsg })
      }).catch((e: any) => console.warn("[Referral Claim] WhatsApp notify error:", e.message))
    }

    return NextResponse.json({
      success: true,
      granted: true,
      referralId: referral.id,
      referrerName: referrer.name,
      merchantName: activeMerchant.name,
      message: "VIP Pass activated successfully! Scan the counter QR code at the shop to receive your bonus stamp."
    })
  } catch (error: any) {
    console.error("[Referral Claim Error]", error)
    return NextResponse.json({ success: false, error: "Failed to claim referral pass" }, { status: 500 })
  }
}
