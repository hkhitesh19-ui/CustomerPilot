import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const merchantIdHeader = req.headers.get("x-merchant-id");
    const merchantIdCookie = req.cookies.get("merchant_id")?.value;
    
    let merchantId = merchantIdHeader || merchantIdCookie;

    if (!merchantId) {
      const first = await db.merchant.findFirst({ orderBy: { createdAt: "desc" } });
      if (first) merchantId = first.id;
    }

    if (merchantId) {
      await db.merchantGoogleConnection.deleteMany({
        where: { merchantId }
      });
      await (db.merchant as any).update({
        where: { id: merchantId },
        data: { googleReviewLink: null }
      }).catch(() => {});
    }

    return ok({ message: "Disconnected successfully", merchantId });
  } catch (error: any) {
    console.error("[Disconnect GBP] Error:", error);
    return err(error.message, 500);
  }
}
