import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");
    const period = searchParams.get("period") || "30D";

    const daysLimit = period === "7D" ? 7 : period === "14D" ? 14 : 30;
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const startDate = new Date(istNow.getTime() - daysLimit * 24 * 60 * 60 * 1000);
    const startDateStr = startDate.toISOString().slice(0, 10);

    const whereClause: any = {
      snapshotDate: { gte: startDateStr },
    };
    if (merchantId && merchantId !== "ALL") {
      whereClause.merchantId = merchantId;
    }

    const rows = await db.gbpKeywordDailyRank.findMany({
      where: whereClause,
      include: {
        merchant: {
          select: { name: true, city: true, businessType: true },
        },
      },
      orderBy: [
        { snapshotDate: "desc" },
        { rankPosition: "asc" },
      ],
    });

    // Format as CSV
    const headers = [
      "Snapshot Date",
      "Merchant Name",
      "Keyword",
      "Category (GEO/SEO/AEO)",
      "Rank Position",
      "Previous Day Rank",
      "24h Movement",
      "Monthly Search Volume",
      "Target Locality",
      "Target City",
      "SERP Feature",
      "Last Crawled Time (IST)",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [headers.join(",")];

    for (const r of rows) {
      const delta = r.previousRank > 0 ? r.previousRank - r.rankPosition : 0;
      const deltaFormatted = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "0";

      const line = [
        escapeCsv(r.snapshotDate),
        escapeCsv(r.merchant?.name || "Merchant"),
        escapeCsv(r.keyword),
        escapeCsv(r.keywordType),
        escapeCsv(`#${r.rankPosition}`),
        escapeCsv(r.previousRank > 0 ? `#${r.previousRank}` : "N/A"),
        escapeCsv(deltaFormatted),
        escapeCsv(r.searchVolume),
        escapeCsv(r.locality || "Central"),
        escapeCsv(r.targetCity),
        escapeCsv(r.serpFeature || "LOCAL_3PACK"),
        escapeCsv("09:00 AM IST"),
      ];
      csvLines.push(line.join(","));
    }

    const csvContent = csvLines.join("\r\n");
    const filename = merchantId && merchantId !== "ALL"
      ? `customerpilot-serp-rankings-${merchantId.slice(-6)}-${istNow.toISOString().slice(0, 10)}.csv`
      : `customerpilot-all-merchants-serp-rankings-${istNow.toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("[EXPORT_GBP_SERP_CSV_ERROR]:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to export CSV" },
      { status: 500 }
    );
  }
}
