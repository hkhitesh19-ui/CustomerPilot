import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { applyAuthRateLimit } from '@/lib/rate-limiter';
import { generateMerchantIdNumber } from '@/lib/merchant-id-generator';
import { getIndustryLoyaltyRule } from '@/lib/industry-campaigns';
import { getGlobalDefaultMerchantSettings } from '@/lib/default-merchant-settings';
import { normalizePhone } from '@/lib/utils';
import { getOrCreateDigitalBusinessCard } from '@/lib/digital-card-service';

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
    // Normalize phone at entry point — ensures 91XXXXXXXXXX format in DB from day 1
    const cleanPhone = normalizePhone(whatsappPhone) || '';

    // Determine opted module(s) (supports single: "reviews", "card", or combo: "card,reviews")
    const MODULE_KEY_MAP: Record<string, string> = {
      reviews: "REVIEWS",
      review: "REVIEWS",
      loyalty: "LOYALTY",
      autoreply: "AUTOREPLY",
      card: "DIGITAL_CARD",
      digital_card: "DIGITAL_CARD",
      digitalcard: "DIGITAL_CARD",
    };

    let resolvedModules = "";
    let isOptedService = false;

    if (module && typeof module === "string" && module.trim() !== "" && module.toLowerCase() !== "complete") {
      const parts = module.split(",").map(p => p.trim().toLowerCase()).filter(Boolean);
      const mappedParts = new Set<string>();
      for (const p of parts) {
        if (MODULE_KEY_MAP[p]) {
          mappedParts.add(MODULE_KEY_MAP[p]);
        }
      }
      if (mappedParts.size > 0) {
        resolvedModules = Array.from(mappedParts).join(",");
        isOptedService = true;
      }
    }

    const globalDefaults = await getGlobalDefaultMerchantSettings();

    if (!resolvedModules) {
      resolvedModules = globalDefaults?.enabledModules || "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD";
    }

    const hasLoyalty = resolvedModules.split(",").includes("LOYALTY");
    const hasReviews = resolvedModules.split(",").includes("REVIEWS");
    const hasCard = resolvedModules.split(",").includes("DIGITAL_CARD");
    const hasAutoReply = resolvedModules.split(",").includes("AUTOREPLY");

    // Fast-track: skip loyalty onboarding if merchant only opted for standalone non-loyalty modules
    const isFastTrack = isOptedService && !hasLoyalty;

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
        enabledModules: resolvedModules,
        googleReviewDelayMinutes: globalDefaults?.googleReviewDelayMinutes ?? 30,
        vipUpgradeBonusStamps: globalDefaults?.vipUpgradeBonusStamps ?? 1,
        loyaltyCategoryNames: JSON.stringify(globalDefaults?.loyaltyCategoryNames),
        winbackDays1: globalDefaults?.winbackDays1 ?? 30,
        winbackDays2: globalDefaults?.winbackDays2 ?? 60,
        winbackDays3: globalDefaults?.winbackDays3 ?? 90,
        expiryWarningDays: globalDefaults?.expiryWarningDays ?? 7,
        // Fast-track: skip onboarding for standalone non-loyalty module signups
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
      { stepKey: 'print_standee', label: 'Print QR Code' },
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
    if (hasLoyalty) {
      const rule = getIndustryLoyaltyRule(businessType, businessName);
      await db.stampCard.create({
        data: {
          merchantId: merchant.id,
          name: globalDefaults?.cardName || rule.getCardTitle(businessName),
          stampsRequired: globalDefaults?.stampsRequired ?? rule.stampsRequired,
          rewardName: globalDefaults?.rewardName || rule.rewardName,
          stampValue: globalDefaults?.stampValue ?? rule.stampValue,
          validityDays: globalDefaults?.validityDays ?? rule.validityDays,
          googleReviewBonus: globalDefaults?.googleReviewBonus ?? rule.googleReviewBonus,
          photoBonus: globalDefaults?.photoBonus ?? rule.photoBonus,
          joiningBonusEnabled: globalDefaults?.joiningBonusEnabled ?? rule.joiningBonusEnabled,
          joiningBonusStamps: globalDefaults?.joiningBonusStamps ?? rule.joiningBonusStamps,
          color: globalDefaults?.color || rule.color,
          tierRewardsEnabled: false,
          active: true,
        },
      });
    }

    // Auto-provision Digital Business Card if opted
    if (hasCard) {
      try {
        await getOrCreateDigitalBusinessCard(merchant.id);
      } catch (err) {
        console.warn("Failed to auto-provision digital business card during register:", err);
      }
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
    let redirectTo = '/dashboard';
    if (isFastTrack) {
      if (hasCard && !hasReviews && !hasAutoReply) {
        redirectTo = '/dashboard/digital-card';
      } else if (hasReviews || hasAutoReply) {
        redirectTo = '/dashboard/reviews';
      } else {
        redirectTo = '/dashboard';
      }
    }

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
