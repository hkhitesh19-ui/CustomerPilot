import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';

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

  // ─── Protect /api/dashboard/* ────────────────────────────────
  if (pathname.startsWith('/api/dashboard')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const payload = await verifyToken(token);
      const headers = new Headers(request.headers);
      headers.set('x-merchant-id', payload.merchantId as string);
      headers.set('x-user-id', payload.userId as string);
      headers.set('x-user-role', payload.role as string);
      return NextResponse.next({ request: { headers } });
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  // ─── Protect /api/state (merchant data) ──────────────────────
  if (pathname.startsWith('/api/state')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const payload = await verifyToken(token);
      const headers = new Headers(request.headers);
      headers.set('x-merchant-id', payload.merchantId as string);
      headers.set('x-user-role', payload.role as string);
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
    '/api/dashboard/:path*',
    '/api/state/:path*',
  ],
};
