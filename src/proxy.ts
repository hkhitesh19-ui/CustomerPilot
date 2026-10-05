import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'cpilot_jwt_secret_change_this_in_production_2026!';

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

function resolveMerchantId(payload: any, request: NextRequest): string | undefined {
  let merchantId = payload.merchantId as string | undefined;
  if (payload.role === 'super_admin' || merchantId === 'admin_merchant' || !merchantId) {
    const impCookie = request.cookies.get('cp_impersonation')?.value;
    if (impCookie) {
      try {
        const imp = JSON.parse(impCookie);
        if (imp?.merchantId) return imp.merchantId;
      } catch {}
    }
    // Default to primary merchant (Cake Connection) so super_admin can inspect dashboard seamlessly
    return 'cmtymavfx0002kx008lbfvp57';
  }
  return merchantId;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // ─── Protect /dashboard routes ───────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    try {
      const payload = await verifyToken(token);
      // Inject merchantId header for downstream API use
      const headers = new Headers(request.headers);
      const merchantId = resolveMerchantId(payload, request);
      if (merchantId) {
        headers.set('x-merchant-id', merchantId);
      }
      headers.set('x-user-id', payload.userId as string);
      headers.set('x-user-role', payload.role as string);
      return NextResponse.next({ request: { headers } });
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
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
      const payload = await verifyToken(token);
      if (payload.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ─── Protect /api/* routes (except public ones) ───────────────
  const PUBLIC_API_PREFIXES = [
    '/api/auth/',
    '/api/webhook/',
    '/api/reviews/',
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
    '/api/google-business/oauth',
    '/api/wallet/',
    '/api/whatsapp/',
    '/api/digital-card',
    // SECURITY FIX: /api/payments/ removed from public — payments require merchant auth
    // Both create-order and verify are called from the authenticated /dashboard context
  ];

  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => {
    if (prefix === '/api/digital-card') {
      // Allow GET (card viewing) and POST (zero-signup 3-day free trial card generation)
      return pathname.startsWith('/api/digital-card') && (request.method === 'GET' || request.method === 'POST');
    }
    return pathname.startsWith(prefix);
  });

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
      const merchantId = resolveMerchantId(payload, request);
      if (merchantId) {
        headers.set('x-merchant-id', merchantId);
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
