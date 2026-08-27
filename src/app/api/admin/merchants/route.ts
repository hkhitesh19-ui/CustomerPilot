import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function requireSuperAdmin(): Promise<{ error: NextResponse } | null> {
  if (!process.env.JWT_SECRET) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    if (payload.role !== 'super_admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    return null;
  } catch {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
}

export async function GET(req: Request) {
  const authError = await requireSuperAdmin();
  if (authError) return authError.error;
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const merchantId = searchParams.get('merchantId')

    // If fetching customers for a specific merchant
    if (action === 'customers' && merchantId) {
      const customers = await db.customer.findMany({
        where: { merchantId, deletedAt: null },
        include: {
          _count: {
            select: {
              stamps: true,
              bills: true,
              redemptions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
      });

      return NextResponse.json({
        success: true,
        customers: customers.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          stamps: c.lifetimeStamps || c._count.stamps,
          spend: c.lifetimeSpend,
          visits: c._count.bills,
          createdAt: c.createdAt,
          vipTier: c.vipTier,
          status: c.status
        }))
      });
    }

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10)))
    const skip = (page - 1) * pageSize

    const [total, merchants] = await Promise.all([
      db.merchant.count(),
      db.merchant.findMany({
        include: {
          stampCards: { where: { active: true }, orderBy: { updatedAt: 'desc' }, take: 1 },
          _count: {
            select: {
              customers: { where: { deletedAt: null } },
              bills: true,
              reviews: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip,
      }),
    ]);

    const formattedMerchants = merchants.map((m) => ({
      id: m.id,
      name: m.name || 'Unnamed Business',
      ownerName: m.ownerName || 'N/A',
      whatsappPhone: m.whatsappPhone || 'N/A',
      plan: (m.plan || 'trial').toUpperCase(),
      status: (m.status || 'active').charAt(0).toUpperCase() + (m.status || 'active').slice(1),
      googleReviewDelayMinutes: m.googleReviewDelayMinutes ?? 30,
      vipUpgradeBonusStamps: m.vipUpgradeBonusStamps ?? 1,
      loyaltyCategoryNames: m.loyaltyCategoryNames || null,
      stampCard: m.stampCards[0] || null,
      customers: m._count.customers,
      bills: m._count.bills,
      reviews: m._count.reviews,
      mrr: m.plan === 'pro' ? 2499 : m.plan === 'enterprise' ? 9999 : 0,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({
      success: true,
      merchants: formattedMerchants,
      pagination: {
        total,
        page,
        pageSize,
        hasMore: skip + merchants.length < total,
      },
    });
  } catch (error: any) {
    console.error('[Admin Merchants API Error]', error);
    return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authError = await requireSuperAdmin();
  if (authError) return authError.error;

  try {
    const body = await req.json();
    const { action, merchantId, customerId } = body;

    if (action === 'reset_customers' && merchantId) {
      const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
      if (!merchant) {
        return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
      }

      await db.$transaction(async (tx) => {
        // 1. Delete all WhatsApp messages
        await tx.whatsAppMessage.deleteMany({ where: { merchantId } });
        // 2. Delete waiting queue entries
        await tx.waitingCustomer.deleteMany({ where: { merchantId } });
        // 3. Delete stamps
        await tx.stamp.deleteMany({ where: { merchantId } });
        // 4. Delete redemptions
        await tx.redemption.deleteMany({ where: { merchantId } });
        // 5. Delete bills
        await tx.bill.deleteMany({ where: { merchantId } });
        // 6. Delete reviews
        await tx.review.deleteMany({ where: { merchantId } });
        // 7. Delete customer stamp cards
        await tx.customerStampCard.deleteMany({ where: { merchantId } });
        // 8. Delete achievements
        await tx.achievement.deleteMany({ where: { customer: { merchantId } } });
        // 9. Delete birthdays
        await tx.birthday.deleteMany({ where: { merchantId } });
        // 10. Delete referrals
        await tx.referral.deleteMany({ where: { merchantId } });
        // 11. Delete all customers
        await tx.customer.deleteMany({ where: { merchantId } });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully wiped all customer history for "${merchant.name}". Customers, stamps, and bills reset to 0.`
      });
    }

    if (action === 'delete_customer' && customerId) {
      const customer = await db.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      await db.$transaction(async (tx) => {
        await tx.whatsAppMessage.deleteMany({ where: { customerId } });
        await tx.waitingCustomer.deleteMany({ where: { customerId } });
        await tx.stamp.deleteMany({ where: { customerId } });
        await tx.redemption.deleteMany({ where: { customerId } });
        await tx.bill.deleteMany({ where: { customerId } });
        await tx.review.deleteMany({ where: { customerId } });
        await tx.customerStampCard.deleteMany({ where: { customerId } });
        await tx.achievement.deleteMany({ where: { customerId } });
        await tx.birthday.deleteMany({ where: { customerId } });
        await tx.referral.deleteMany({ where: { OR: [{ referrerCustomerId: customerId }, { friendCustomerId: customerId }] } });
        await tx.customer.delete({ where: { id: customerId } });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully deleted customer ${customer.name || customer.phone}.`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Merchants POST Action Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to process action' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await requireSuperAdmin();
  if (authError) return authError.error;

  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get('id') || searchParams.get('merchantId');

    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // 1. Communications & Logs
      await tx.whatsAppMessage.deleteMany({ where: { merchantId } });
      await tx.campaignDeliveryLog.deleteMany({ where: { merchantId } });
      await tx.cardRuleChangeLog.deleteMany({ where: { merchantId } });
      await tx.ownerOverrideLog.deleteMany({ where: { merchantId } });
      await tx.customerMergeLog.deleteMany({ where: { merchantId } });
      await tx.merchantTransferLog.deleteMany({ where: { merchantId } });
      await tx.winBackEscalation.deleteMany({ where: { merchantId } });
      await tx.fraudAlert.deleteMany({ where: { merchantId } });
      await tx.auditLog.deleteMany({ where: { merchantId } });
      await tx.incident.deleteMany({ where: { merchantId } });
      await tx.supportTicket.deleteMany({ where: { merchantId } });

      // 2. Core Activities & Queue
      await tx.waitingCustomer.deleteMany({ where: { merchantId } });
      await tx.stamp.deleteMany({ where: { merchantId } });
      await tx.redemption.deleteMany({ where: { merchantId } });
      await tx.bill.deleteMany({ where: { merchantId } });
      await tx.referral.deleteMany({ where: { merchantId } });
      await tx.merchantReferral.deleteMany({
        where: { OR: [{ referrerMerchantId: merchantId }, { referredMerchantId: merchantId }] }
      });
      await tx.growthReport.deleteMany({ where: { merchantId } });
      await tx.growthSnapshot.deleteMany({ where: { merchantId } });
      await tx.review.deleteMany({ where: { merchantId } });
      await tx.googleBusinessReview.deleteMany({ where: { merchantId } });
      await tx.merchantGoogleConnection.deleteMany({ where: { merchantId } });
      await tx.rewardWaitlist.deleteMany({ where: { merchantId } });
      await tx.birthday.deleteMany({ where: { merchantId } });
      await tx.customerStampCard.deleteMany({ where: { merchantId } });
      await tx.achievement.deleteMany({ where: { customer: { merchantId } } });

      // 3. Customers
      await tx.customer.deleteMany({ where: { merchantId } });

      // 4. Configuration & Rules
      await tx.stampCard.deleteMany({ where: { merchantId } });
      await tx.reward.deleteMany({ where: { merchantId } });
      await tx.vipTier.deleteMany({ where: { merchantId } });
      await tx.messageTemplate.deleteMany({ where: { merchantId } });
      await tx.onboardingStep.deleteMany({ where: { merchantId } });
      await tx.subscription.deleteMany({ where: { merchantId } });
      await tx.staff.deleteMany({ where: { merchantId } });

      // 5. Delete Merchant
      await tx.merchant.delete({ where: { id: merchantId } });

      // 6. Delete associated User if not Super Admin
      if (merchant.userId) {
        const user = await tx.user.findUnique({ where: { id: merchant.userId } });
        if (user && user.role !== 'super_admin') {
          await tx.user.delete({ where: { id: merchant.userId } });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Merchant "${merchant.name}" (ID: ${merchantId}) and all associated records have been permanently deleted.`
    });
  } catch (error: any) {
    console.error('[Admin Merchant DELETE Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to delete merchant' }, { status: 500 });
  }
}
