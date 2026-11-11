import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { VIDEO_PRESETS, buildMerchantCustomizedVideo } from "@/lib/video-pipeline";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const presetId = searchParams.get("preset") || "swiss-motion";
    const merchantId = searchParams.get("merchantId");

    let merchant: any = null;
    if (merchantId) {
      merchant = await db.merchant.findUnique({
        where: { id: merchantId },
        select: {
          id: true,
          name: true,
          category: true,
          city: true,
          address: true,
          whatsappPhone: true,
        }
      });
    }

    if (!merchant) {
      merchant = {
        name: "Cake Connection",
        category: "Bakery & Cake Shop",
        city: "Vadodara",
        address: "Near EVA Mall, Manjalpur, Vadodara",
      };
    }

    const videoConfig = buildMerchantCustomizedVideo(presetId, merchant);

    return ok({
      preset: videoConfig,
      allPresets: Object.values(VIDEO_PRESETS).map(p => ({
        id: p.id,
        name: p.name,
        funnelStage: p.funnelStage,
        durationSec: p.durationSec,
        visualStrategy: p.visualStrategy,
        useCase: p.customerPilotUseCase,
      })),
      merchant,
    });
  } catch (error: any) {
    console.error("[Video Studio API GET Error]:", error);
    return err("Failed to load video studio presets", 500, { details: error.message });
  }
}
