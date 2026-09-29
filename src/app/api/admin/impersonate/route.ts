import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}
const JWT_SECRET = process.env.JWT_SECRET;

async function checkSuperAdminPermission(): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { ok: false, error: 'Unauthorized: No token provided' };

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    // Allow if role is super_admin OR if currently impersonating from super_admin
    if (payload.role === 'super_admin' || payload.impersonatedBy === 'super_admin') {
      return { ok: true };
    }
    return { ok: false, error: 'Forbidden: Super Admin access required' };
  } catch {
    return { ok: false, error: 'Unauthorized: Invalid token' };
  }
}

export async function POST(req: Request) {
  const perm = await checkSuperAdminPermission();
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { merchantId, action } = body;

    const secret = new TextEncoder().encode(JWT_SECRET);

    // ACTION: Exit Impersonation back to Super Admin
    if (action === 'exit') {
      const adminToken = await new SignJWT({
        userId: 'super_admin_master',
        merchantId: 'admin_merchant',
        role: 'super_admin',
        email: 'admin@customerpilot.in'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(secret);

      const response = NextResponse.json({
        success: true,
        message: 'Exited impersonation. Returned to Super Admin.',
        redirectTo: '/super-admin'
      });

      response.cookies.set('token', adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set('cp_impersonation', '', {
        path: '/',
        maxAge: 0
      });

      return response;
    }

    // ACTION: Impersonate Merchant
    if (!merchantId) {
      return NextResponse.json({ error: 'merchantId is required' }, { status: 400 });
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      include: { user: true }
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const merchantToken = await new SignJWT({
      userId: merchant.userId || merchant.id,
      merchantId: merchant.id,
      role: 'merchant',
      email: merchant.email || merchant.user?.email || 'merchant@customerpilot.in',
      impersonatedBy: 'super_admin',
      merchantName: merchant.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);

    // Determine redirect destination
    let redirectTo = '/dashboard';
    if (!merchant.onboardingCompleted) {
      redirectTo = `/onboarding?step=${merchant.currentStep || 1}`;
    }

    const response = NextResponse.json({
      success: true,
      message: `Now impersonating ${merchant.name}`,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        onboardingCompleted: merchant.onboardingCompleted,
        currentStep: merchant.currentStep
      },
      redirectTo
    });

    response.cookies.set('token', merchantToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    response.cookies.set('cp_impersonation', JSON.stringify({
      merchantId: merchant.id,
      merchantName: merchant.name,
      active: true
    }), {
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    console.error('[Impersonate API Error]', error);
    return NextResponse.json({ error: error.message || 'Failed to impersonate merchant' }, { status: 500 });
  }
}
