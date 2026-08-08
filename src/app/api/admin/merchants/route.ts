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
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '50', 10)))
    const skip = (page - 1) * pageSize

    const [total, merchants] = await Promise.all([
      db.merchant.count(),
      db.merchant.findMany({
        include: {
          _count: {
            select: {
              customers: true,
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
