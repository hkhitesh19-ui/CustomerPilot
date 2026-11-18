import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import {
  SPRINT_TARGET_DATE_ISO,
  syncMerchant30DayChecklist,
  runLiveGeoGridScanForMerchant,
} from "@/lib/gbp/autopilot-orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET / POST /api/cron/gbp-autopilot
 *
 * RankLocal AI 30-Day Top-3 AutoPilot Orchestrator (Target: 17 December 2026)
 * Runs weekly (and on-demand) to:
 * 1. Sync & auto-verify 30-Day Top-3 Checklist items (GbpChecklistItem)
 * 2. Ensure tracked keyword portfolios exist for all active GBP merchants
 * 3. Execute live coordinate-anchored 5x5 Geo-Grid scans (GbpGeoGridScan)
 * 4. Report real sprint readiness & days remaining till 17 Dec 2026
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetMerchantId = searchParams.get("merchantId");
    const runGeoGrid = searchParams.get("geoGrid") !== "false";

    const whereClause: any = targetMerchantId
      ? { id: targetMerchantId }
      : {
          status: "active",
          OR: [
            { gbpServiceTrack: { in: ["TRACK_A_NEW", "TRACK_B_EXISTING"] } },
            { id: { in: ["cmtymavfx0002kx008lbfvp57", "customerpilot-hq"] } },
          ],
        };

    const merchants = await db.merchant.findMany({
      where: whereClause,
      select: { id: true, name: true, gbpServiceTrack: true, gbpReviewCount: true },
    });

    const targetDate = new Date(SPRINT_TARGET_DATE_ISO);
    const daysRemaining = Math.max(
      0,
      Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    const results: Array<{
      merchantId: string;
      merchantName: string;
      checklist: { seeded: number; completed: number; total: number };
      geoGrid?: any;
      error?: string;
    }> = [];

    for (const m of merchants) {
      try {
        let geoGridResult: any = undefined;
        if (runGeoGrid) {
          geoGridResult = await runLiveGeoGridScanForMerchant(m.id);
        }
        const checklistResult = await syncMerchant30DayChecklist(m.id);
        results.push({
          merchantId: m.id,
          merchantName: m.name,
          checklist: checklistResult,
          geoGrid: geoGridResult,
        });
      } catch (e: any) {
        results.push({
          merchantId: m.id,
          merchantName: m.name,
          checklist: { seeded: 0, completed: 0, total: 0 },
          error: e.message,
        });
      }
    }

    return ok({
      message: `RankLocal AI 30-Day Top-3 AutoPilot executed for ${merchants.length} merchants.`,
      sprintDeadline: "2026-12-17",
      daysRemainingTillDec17: daysRemaining,
      merchantsProcessed: merchants.length,
      results,
    });
  } catch (error: any) {
    console.error("[Cron GBP AutoPilot Error]:", error);
    return err("Failed to execute RankLocal AI AutoPilot", 500, { details: error.message });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
