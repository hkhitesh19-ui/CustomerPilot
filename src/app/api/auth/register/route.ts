import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SignJWT } from 'jose';
import { createHash } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';

// Simple SHA-256 hash (no bcrypt dep needed for SQLite dev)
function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'cpilot_salt_2026').digest('hex');
}

export async function POST(req: Request) {
  try {
    const { 
      businessName, ownerName, email, password, 
      businessType, businessAddress, whatsappPhone 
    } = await req.json();

    // Validation 1: Required fields
    if (!businessName || !businessName.trim()) {
      return NextResponse.json({ error: 'Business Name is required' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email ID is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = whatsappPhone ? whatsappPhone.trim() : '';

    // Validation 2: Check if User already exists with email
    const existingUser = await db.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json({ 
        error: `An account with email '${cleanEmail}' already exists. Please login instead.` 
      }, { status: 400 });
    }

    // Validation 3: Check if Merchant already exists with WhatsApp phone
    if (cleanPhone) {
      const existingMerchantPhone = await db.merchant.findFirst({
        where: { whatsappPhone: cleanPhone }
      });
      if (existingMerchantPhone) {
        return NextResponse.json({ 
          error: `WhatsApp number '${cleanPhone}' is already registered with '${existingMerchantPhone.name}'. Please login or use a different number.` 
        }, { status: 400 });
      }
    }

    const hashedPassword = hashPassword(password);

    // Create User with password
    const user = await db.user.create({
      data: { 
        email: cleanEmail,
        name: ownerName || businessName,
        password: hashedPassword,
        role: 'merchant',
      },
    });

    // Create Merchant linked to User
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7-day trial

    const merchant = await db.merchant.create({
      data: {
        userId: user.id,
        name: businessName,
        ownerName: ownerName || '',
        email: cleanEmail,
        businessType: businessType || 'bakery',
        address: businessAddress || '',
        whatsappPhone: cleanPhone,
        plan: 'trial',
        status: 'active',
        trialEndsAt,
        onboardingCompleted: false,
        currentStep: 1,
      },
    });

    // Create initial OnboardingStep records
    const onboardingSteps = [
      { stepKey: 'business_info', label: 'Business Information' },
      { stepKey: 'whatsapp_verify', label: 'WhatsApp Verification' },
      { stepKey: 'google_business', label: 'Google Business Profile' },
      { stepKey: 'logo_upload', label: 'Logo Upload' },
      { stepKey: 'reward_setup', label: 'Reward Card Setup' },
      { stepKey: 'qr_code', label: 'QR Code Generation' },
      { stepKey: 'print_standee', label: 'Print Standee' },
      { stepKey: 'system_test', label: 'Live System Test' },
    ];

    await db.onboardingStep.createMany({
      data: onboardingSteps.map(s => ({
        merchantId: merchant.id,
        stepKey: s.stepKey,
        label: s.label,
        completed: false,
      })),
    });

    // Create default StampCard for merchant
    await db.stampCard.create({
      data: {
        merchantId: merchant.id,
        name: `${businessName} VIP Club`,
        stampsRequired: 10,
        rewardName: 'FREE Special Treat',
        stampValue: 500,
        googleReviewBonus: 1,
        photoBonus: 2,
        active: true,
      },
    });

    // Sign JWT with userId + merchantId + role
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ 
      userId: user.id, 
      merchantId: merchant.id,
      role: user.role,
      email: user.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({ 
      success: true, 
      merchantId: merchant.id,
      redirectTo: '/dashboard',
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
    console.error('[Register Error]', error);
    
    // Handle Prisma Unique Constraint Error (P2002)
    if (error.code === 'P2002') {
      const field = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'field';
      return NextResponse.json({ 
        error: `Registration failed: An account with this ${field} already exists. Please login or use different details.` 
      }, { status: 400 });
    }

    let errorMessage = 'An unexpected server error occurred during account creation. Please try again.';
    
    if (error?.message) {
      const msgStr = error.message.toLowerCase();
      if (msgStr.includes('turbopack') || msgStr.includes('does not exist') || msgStr.includes('prisma')) {
         errorMessage = 'Database sync issue detected. Please run "npm run db:push" and restart your server.';
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
