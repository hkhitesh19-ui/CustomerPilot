import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { resolveMerchantKeywordProfile, MASTER_KEYWORD_PRESETS } from "@/lib/keyword-matrix";

export async function GET(req: NextRequest) {
  try {
    const queryMerchantId = req.nextUrl.searchParams.get("merchantId");
    const headerMerchantId = req.headers.get("x-merchant-id");
    const merchantId = queryMerchantId || headerMerchantId;
    if (!merchantId) return err("Merchant ID required", 400);

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        category: true,
        businessType: true,
        city: true,
        address: true,
        keywordProfile: true,
      }
    });

    if (!merchant) return err("Merchant not found", 404);

    const profile = resolveMerchantKeywordProfile(merchant);
    return ok({
      profile,
      presets: MASTER_KEYWORD_PRESETS
    });
  } catch (e: any) {
    console.error("[API keyword-profile GET] Error:", e);
    return err(e.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const merchantId = req.headers.get("x-merchant-id");
    if (!merchantId) return err("Unauthorized", 401);

    const body = await req.json().catch(() => null);
    if (!body || !body.profile) return err("Invalid payload: profile required", 400);

    const jsonString = JSON.stringify(body.profile);

    const updated = await db.merchant.update({
      where: { id: merchantId },
      data: {
        keywordProfile: jsonString
      },
      select: { id: true, keywordProfile: true }
    });

    return ok({
      success: true,
      profile: JSON.parse(updated.keywordProfile || "{}"),
      message: "Smart Keyword Control Profile saved successfully! ✅"
    });
  } catch (e: any) {
    console.error("[API keyword-profile POST] Error:", e);
    return err(e.message, 500);
  }
}
