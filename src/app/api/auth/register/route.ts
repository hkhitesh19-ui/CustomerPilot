import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { applyAuthRateLimit } from '@/lib/rate-limiter';
import { generateMerchantIdNumber } from '@/lib/merchant-id-generator';
import { getIndustryLoyaltyRule } from '@/lib/industry-campaigns';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
  // Rate limit: max 10 registration attempts per IP per minute
  const limited = await applyAuthRateLimit(req as any);
  if (limited) return limited;
  try {
    const { 
      businessName, ownerName, email, password, 
      businessType, businessAddress, whatsappPhone,
      module // optional: "reviews", "loyalty", "autoreply" for fast-track onboarding
    } = await req.json();

    // Validation 1: Required fields
    if (!businessName || !businessName.trim()) {
      return NextResponse.json({ error: 'Business Name is required' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email ID is required' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = whatsappPhone ? whatsappPhone.trim() : '';

    // Determine if this is a fast-track module signup
    const MODULE_MAP: Record<string, string> = {
      reviews: "REVIEWS",
      loyalty: "LOYALTY",
      autoreply: "AUTOREPLY",
    };
    const isFastTrack = module && MODULE_MAP[module];
    const enabledModules = isFastTrack ? MODULE_MAP[module] : "LOYALTY,REVIEWS,AUTOREPLY";

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

    const hashedPassword = await bcrypt.hash(password, 12);

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
    trialEndsAt.setDate(trialEndsAt.getDate() + 3); // 3-day trial

    const merchantIdNumber = await generateMerchantIdNumber(db);

    const merchant = await db.merchant.create({
      data: {
        userId: user.id,
        merchantIdNumber,
        name: businessName,
        ownerName: ownerName || '',
        email: cleanEmail,
        businessType: businessType || 'bakery',
        address: businessAddress || '',
        whatsappPhone: cleanPhone || undefined,
        plan: 'trial',
        status: 'active',
        trialEndsAt,
        enabledModules,
        // Fast-track: skip onboarding for standalone module signups
        onboardingCompleted: !!isFastTrack,
        currentStep: isFastTrack ? 99 : 1,
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
        completed: !!isFastTrack, // Mark all as completed for fast-track
      })),
    });

    // Create default StampCard only if LOYALTY module is enabled
    if (!isFastTrack || module === 'loyalty') {
      const rule = getIndustryLoyaltyRule(businessType, businessName);
      await db.stampCard.create({
        data: {
          merchantId: merchant.id,
          name: rule.getCardTitle(businessName),
          stampsRequired: rule.stampsRequired,
          rewardName: rule.rewardName,
          stampValue: rule.stampValue,
          validityDays: rule.validityDays,
          googleReviewBonus: rule.googleReviewBonus,
          photoBonus: rule.photoBonus,
          joiningBonusEnabled: rule.joiningBonusEnabled,
          joiningBonusStamps: rule.joiningBonusStamps,
          color: rule.color,
          tierRewardsEnabled: false,
          active: true,
        },
      });
    }

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

    // Determine redirect based on module fast-track
    const MODULE_REDIRECTS: Record<string, string> = {
      reviews: '/dashboard/reviews',
      autoreply: '/dashboard/reviews',
      loyalty: '/dashboard',
    };
    const redirectTo = isFastTrack ? (MODULE_REDIRECTS[module] || '/dashboard') : '/dashboard';

    const response = NextResponse.json({ 
      success: true, 
      merchantId: merchant.id,
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
