// POST /api/payments/verify — Verify Razorpay payment signature (HMAC-SHA256)
// Called after Razorpay checkout completes, to activate merchant subscription.
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }
import { NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import { db } from '@/lib/db'
import { ok, err, requireMerchant } from '@/lib/api'

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON body', 400)

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body as {
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
    plan?: string
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return err('razorpay_order_id, razorpay_payment_id, and razorpay_signature are required', 400)
  }

  // ── CRITICAL: Razorpay HMAC-SHA256 signature verification ─────────────────
  // Without this check, anyone can POST fake IDs and activate any subscription.
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    console.error('[payments/verify] RAZORPAY_KEY_SECRET env var not set')
    return err('Payment verification not configured', 500)
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    console.warn('[payments/verify] Invalid Razorpay signature — possible fraud attempt', {
      merchantId: merchant.id,
      razorpay_order_id,
    })
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: 'SYSTEM',
        actorId: merchant.id,
        action: 'PAYMENT_SIGNATURE_INVALID',
        entity: 'Subscription',
        metadata: JSON.stringify({ razorpay_order_id, razorpay_payment_id }),
      },
    }).catch(() => {})
    return err('Payment signature verification failed', 400)
  }

  // ── Signature is valid — activate subscription ─────────────────────────────
  const validPlans = ['starter', 'growth', 'enterprise', 'trial']
  const planName = validPlans.includes(plan ?? '') ? plan! : 'starter'

  // Find the Plan record by name
  const planRecord = await db.plan.findFirst({ where: { name: planName, active: true } })

  // Find existing subscription for this merchant
  const existingSubscription = await db.subscription.findFirst({
    where: { merchantId: merchant.id }
  })

  let subscription
  if (existingSubscription) {
    subscription = await db.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        planId: planRecord?.id ?? existingSubscription.planId,
        status: 'active',
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    })
  } else {
    if (!planRecord) {
      return err(`Plan "${planName}" not found. Please contact support.`, 404)
    }
    subscription = await db.subscription.create({
      data: {
        merchantId: merchant.id,
        planId: planRecord.id,
        amount: planRecord.price,
        currency: planRecord.currency,
        status: 'active',
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: 'SYSTEM',
      actorId: merchant.id,
      action: 'SUBSCRIPTION_ACTIVATED',
      entity: 'Subscription',
      entityId: subscription.id,
      metadata: JSON.stringify({
        plan: planName,
        razorpay_order_id,
        razorpay_payment_id,
      }),
    },
  }).catch(() => {})

  return ok({ subscription, message: `${planName} plan activated successfully` })
}
