import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set');
const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // ─── Protect /dashboard routes ───────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const payload = await verifyToken(token);
      // Inject merchantId header for downstream API use
      const headers = new Headers(request.headers);
      headers.set('x-merchant-id', payload.merchantId as string);
      headers.set('x-user-id', payload.userId as string);
      headers.set('x-user-role', payload.role as string);
      return NextResponse.next({ request: { headers } });
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ─── Protect /onboarding routes ──────────────────────────────
  if (pathname.startsWith('/onboarding')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      await verifyToken(token);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ─── Protect /super-admin — require valid authenticated session ───
  if (pathname.startsWith('/super-admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      await verifyToken(token);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ─── Protect /api/* routes (except public ones) ───────────────
  const PUBLIC_API_PREFIXES = [
    '/api/auth/',
    '/api/webhook/',
    '/api/reviews/submit',
    '/api/reviews/draft',
    '/api/queue/join',
    '/api/queue/claim',
    '/api/queue/reserve',
    '/api/queue/validate-amount',
    '/api/qr/',
    '/api/seed',
    '/api/cron/',
    '/api/pricing/',
    '/api/legal/',
    '/api/coupons/',
    '/api/payments/',
  ];

  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (pathname.startsWith('/api/') && !isPublicApi) {
    if (!token) {
      const authHeader = request.headers.get('authorization');
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      if (!bearerToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    try {
      const actualToken = token || request.headers.get('authorization')?.substring(7) || '';
      const payload = await verifyToken(actualToken);
      const headers = new Headers(request.headers);
      if (payload.merchantId && payload.merchantId !== 'admin_merchant') {
        headers.set('x-merchant-id', payload.merchantId as string);
      }
      if (payload.userId) {
        headers.set('x-user-id', payload.userId as string);
      }
      if (payload.role) {
        headers.set('x-user-role', payload.role as string);
      }
      return NextResponse.next({ request: { headers } });
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/super-admin/:path*',
    '/api/:path*',
  ],
};
