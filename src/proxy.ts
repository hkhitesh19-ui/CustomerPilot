import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/jwt-secret';

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(getJwtSecret());
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

  // SECURITY DEFENSE-IN-DEPTH: Strip any client-supplied internal identity headers
  // to prevent spoofing of x-merchant-id or x-user-role
  const sanitizedHeaders = new Headers(request.headers);
  sanitizedHeaders.delete('x-merchant-id');
  sanitizedHeaders.delete('x-user-id');
  sanitizedHeaders.delete('x-user-role');

  // ─── Protect /dashboard routes ───────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    try {
      const payload = await verifyToken(token);
      // Inject verified identity headers for downstream use
      const merchantId = resolveMerchantId(payload, request);
      if (merchantId) {
        sanitizedHeaders.set('x-merchant-id', merchantId);
      }
      sanitizedHeaders.set('x-user-id', payload.userId as string);
      sanitizedHeaders.set('x-user-role', payload.role as string);
      return NextResponse.next({ request: { headers: sanitizedHeaders } });
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
      return NextResponse.next({ request: { headers: sanitizedHeaders } });
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
      return NextResponse.next({ request: { headers: sanitizedHeaders } });
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
    '/api/gbp/audit',
    '/api/gbp/posts/card',
    '/api/gbp/agent',
    '/api/menu',
    // SECURITY FIX: /api/payments/ removed from public — payments require merchant auth
    // Both create-order and verify are called from the authenticated /dashboard context
  ];

  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => {
        if (prefix === '/api/menu') {
      // Allow GET on public menu (e.g. /api/menu/[merchantId])
      return pathname.startsWith('/api/menu') && request.method === 'GET' && !pathname.includes('/items');
    }
    if (prefix === '/api/digital-card') {
      // Allow GET (card viewing) and POST (zero-signup 3-day free trial card generation)
      return pathname.startsWith('/api/digital-card') && (request.method === 'GET' || request.method === 'POST');
    }
    return pathname.startsWith(prefix);
  });

  if (pathname.startsWith('/api/')) {
    if (!isPublicApi) {
      if (!token) {
        const authHeader = request.headers.get('authorization');
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        if (!bearerToken) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }
    }

    const actualToken = token || request.headers.get('authorization')?.substring(7) || '';
    if (actualToken) {
      try {
        const payload = await verifyToken(actualToken);
        const merchantId = resolveMerchantId(payload, request);
        if (merchantId) {
          sanitizedHeaders.set('x-merchant-id', merchantId);
        }
        if (payload.userId) {
          sanitizedHeaders.set('x-user-id', payload.userId as string);
        }
        if (payload.role) {
          sanitizedHeaders.set('x-user-role', payload.role as string);
        }
        return NextResponse.next({ request: { headers: sanitizedHeaders } });
      } catch {
        if (!isPublicApi) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
      }
    }

    // Forward with sanitized headers (client-supplied x-merchant-id / x-user-role stripped)
    return NextResponse.next({ request: { headers: sanitizedHeaders } });
  }

  return NextResponse.next({ request: { headers: sanitizedHeaders } });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/super-admin/:path*',
    '/api/:path*',
  ],
};
