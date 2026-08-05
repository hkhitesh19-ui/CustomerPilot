import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const merchants = await db.merchant.findMany({
      include: {
        _count: {
          select: {
            customers: true,
            bills: true,
            reviews: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedMerchants = merchants.map((m) => ({
      id: m.id,
      name: m.name || 'Unnamed Business',
      ownerName: m.ownerName || 'N/A',
      whatsappPhone: m.whatsappPhone || 'N/A',
      plan: (m.plan || 'trial').toUpperCase(),
      status: (m.status || 'active').charAt(0).toUpperCase() + (m.status || 'active').slice(1),
      customers: m._count.customers,
      bills: m._count.bills,
      reviews: m._count.reviews,
      mrr: m.plan === 'pro' ? 2499 : m.plan === 'enterprise' ? 9999 : 0,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({
      success: true,
      merchants: formattedMerchants
    });
  } catch (error: any) {
    console.error('[Admin Merchants API Error]', error);
    return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 });
  }
}
