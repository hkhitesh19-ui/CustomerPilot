import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SignJWT } from 'jose';
import { createHash } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'cpilot_salt_2026').digest('hex');
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email ID is required' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Find user by email
    const user = await db.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return NextResponse.json({ 
        error: `No account found with email '${cleanEmail}'. Please check your email or click 'Start FREE Trial' to sign up.` 
      }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ 
        error: 'No password set for this account. Please reset your password or sign up.' 
      }, { status: 401 });
    }

    // 2. Verify password hash
    const hashedInput = hashPassword(password);
    if (hashedInput !== user.password) {
      return NextResponse.json({ 
        error: 'Incorrect password. Please try again.' 
      }, { status: 401 });
    }

    // 3. Find linked merchant (support userId link OR email fallback)
    let merchant = await db.merchant.findUnique({ where: { userId: user.id } }).catch(() => null);
    if (!merchant) {
      merchant = await db.merchant.findFirst({ where: { email: cleanEmail } });
    }

    if (!merchant && user.role !== 'super_admin') {
      return NextResponse.json({ 
        error: 'No merchant business profile linked to this user. Please complete signup.' 
      }, { status: 404 });
    }

    // Ensure merchant is linked to user.id if merchant exists
    if (merchant && !merchant.userId) {
      await db.merchant.update({
        where: { id: merchant.id },
        data: { userId: user.id }
      }).catch(() => {});
    }

    // 4. Sign JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ 
      userId: user.id, 
      merchantId: merchant?.id || 'admin_merchant',
      role: user.role,
      email: user.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // Determine redirect based on user role
    const redirectTo = user.role === 'super_admin'
      ? '/super-admin'
      : (merchant?.onboardingCompleted ? '/dashboard' : `/onboarding?step=${merchant?.currentStep || 1}`);

    const response = NextResponse.json({ 
      success: true, 
      merchantId: merchant?.id || null,
      role: user.role,
      onboardingCompleted: merchant?.onboardingCompleted ?? true,
      currentStep: merchant?.currentStep ?? 1,
      redirectTo,
    });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[Login Error]', error);
    
    let errorMessage = 'An unexpected server error occurred during login. Please try again.';
    
    // Check for common Prisma/Next.js Dev Server errors to give helpful hints without exposing raw stack trace
    if (error?.message) {
      const msgStr = error.message.toLowerCase();
      if (msgStr.includes('turbopack') || msgStr.includes('does not exist') || msgStr.includes('prisma')) {
         errorMessage = 'Database sync issue detected. Please run "npm run db:push" and restart your server.';
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
