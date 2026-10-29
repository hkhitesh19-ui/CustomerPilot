import { NextResponse } from "next/server";
import { getAuthenticatedMerchant } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const merchant = await getAuthenticatedMerchant();
    if (!merchant) {
      return NextResponse.json({ ok: false, authenticated: false });
    }

    return NextResponse.json({
      success: true,
      ok: true,
      authenticated: true,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
        whatsappPhone: merchant.whatsappPhone,
        plan: merchant.plan,
        trialEndsAt: merchant.trialEndsAt,
        enabledModules: merchant.enabledModules,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, authenticated: false, error: error?.message || "Session error" });
  }
}
