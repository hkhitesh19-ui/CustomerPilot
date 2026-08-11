import { NextResponse } from 'next/server';
import { requireMerchant, err } from '@/lib/api';

export async function GET() {
  try {
    const merchant = await requireMerchant();
    return NextResponse.json({ 
      trialEndsAt: merchant.trialEndsAt, 
      plan: merchant.plan,
      isExpired: merchant.trialEndsAt ? new Date(merchant.trialEndsAt) < new Date() : false
    });
  } catch (error) {
    return err("Unauthorized", 401);
  }
}
