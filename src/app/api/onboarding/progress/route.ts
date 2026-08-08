// POST /api/onboarding/progress — saves step completion to DB
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set');
const JWT_SECRET = process.env.JWT_SECRET;

async function getMerchantId(req: NextRequest): Promise<string | null> {
  // Try header first (injected by middleware)
  const fromHeader = req.headers.get('x-merchant-id');
  if (fromHeader) return fromHeader;

  // Try JWT cookie directly
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.merchantId as string;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const merchantId = await getMerchantId(req);
    if (!merchantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stepKey, completed = true, currentStep } = await req.json();

    if (!stepKey) {
      return NextResponse.json({ error: 'stepKey is required' }, { status: 400 });
    }

    // Mark step as completed in OnboardingStep table
    const existingStep = await db.onboardingStep.findFirst({
      where: { merchantId, stepKey }
    });

    if (existingStep) {
      await db.onboardingStep.update({
        where: { id: existingStep.id },
        data: {
          completed,
          completedAt: completed ? new Date() : null,
        },
      });
    } else {
      await db.onboardingStep.create({
        data: {
          merchantId,
          stepKey,
          completed,
          completedAt: completed ? new Date() : null,
        },
      });
    }

    // Update currentStep on Merchant record
    const updateData: any = {};
    if (currentStep !== undefined) {
      updateData.currentStep = currentStep;
    }

    // Check if all required steps are done → mark onboarding complete
    const completedSteps = await db.onboardingStep.count({
      where: { merchantId, completed: true }
    });
    
    if (completedSteps >= 8) {
      updateData.onboardingCompleted = true;
    }

    if (Object.keys(updateData).length > 0) {
      await db.merchant.update({
        where: { id: merchantId },
        data: updateData,
      });
    }

    return NextResponse.json({ 
      success: true, 
      stepKey, 
      completedSteps,
      onboardingCompleted: completedSteps >= 8 
    });
  } catch (error: any) {
    console.error('[OnboardingProgress Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const merchantId = await getMerchantId(req);
    if (!merchantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [merchant, steps] = await Promise.all([
      db.merchant.findUnique({ where: { id: merchantId }, select: { currentStep: true, onboardingCompleted: true } }),
      db.onboardingStep.findMany({ where: { merchantId }, orderBy: { createdAt: 'asc' } }),
    ]);

    return NextResponse.json({ 
      currentStep: merchant?.currentStep ?? 1,
      onboardingCompleted: merchant?.onboardingCompleted ?? false,
      steps 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
