import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMerchantTrackedKeywords } from "@/lib/gbp/keyword-bank";

export const dynamic = "force-dynamic";

/**
 * SuperAdmin GBP Tracked Keywords Management API
 * Supports: GET (list & auto-seed), POST (add), PUT (edit), DELETE (remove)
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");

    if (!merchantId) {
      return NextResponse.json({ ok: false, error: "merchantId is required" }, { status: 400 });
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        businessType: true,
        city: true,
        address: true,
        category: true,
        gbpServiceTrack: true,
      },
    });

    if (!merchant) {
      return NextResponse.json({ ok: false, error: "Merchant not found" }, { status: 404 });
    }

    // Check if custom keywords exist in DB
    let keywords = await db.merchantTrackedKeyword.findMany({
      where: { merchantId },
      orderBy: [{ isActive: "desc" }, { keywordType: "asc" }, { searchVolume: "desc" }],
    });

    // If 0 keywords exist in DB, auto-populate from keyword-bank defaults
    if (keywords.length === 0) {
      const defaults = getMerchantTrackedKeywords(merchant);
      for (const def of defaults) {
        await db.merchantTrackedKeyword.create({
          data: {
            merchantId,
            keyword: def.keyword,
            keywordType: def.type,
            targetLocality: def.locality,
            targetCity: def.targetCity || merchant.city || "Vadodara",
            searchVolume: def.searchVolume,
            serpFeature: def.serpFeature,
            baselineRank: def.baselineRank,
            isActive: true,
          },
        });
      }

      keywords = await db.merchantTrackedKeyword.findMany({
        where: { merchantId },
        orderBy: [{ isActive: "desc" }, { keywordType: "asc" }, { searchVolume: "desc" }],
      });
    }

    return NextResponse.json({
      ok: true,
      merchant: {
        id: merchant.id,
        name: merchant.name,
      },
      count: keywords.length,
      keywords,
    });
  } catch (error: any) {
    console.error("[GBP_KEYWORDS_GET_ERROR]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to fetch keywords" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      merchantId,
      keyword,
      keywordType = "SEO",
      targetLocality = "",
      targetCity = "Vadodara",
      searchVolume = 500,
      serpFeature = "LOCAL_3PACK",
      baselineRank = 10,
    } = body;

    if (!merchantId || !keyword || !keyword.trim()) {
      return NextResponse.json({ ok: false, error: "merchantId and valid keyword are required" }, { status: 400 });
    }

    const cleanKeyword = keyword.trim().toLowerCase();

    // Check duplicate
    const existing = await db.merchantTrackedKeyword.findUnique({
      where: {
        merchantId_keyword: {
          merchantId,
          keyword: cleanKeyword,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Keyword "${cleanKeyword}" already exists for this merchant` },
        { status: 409 }
      );
    }

    const created = await db.merchantTrackedKeyword.create({
      data: {
        merchantId,
        keyword: cleanKeyword,
        keywordType: ["GEO", "SEO", "AEO"].includes(keywordType) ? keywordType : "SEO",
        targetLocality: targetLocality || null,
        targetCity: targetCity || "Vadodara",
        searchVolume: Number(searchVolume) || 500,
        serpFeature: serpFeature || "LOCAL_3PACK",
        baselineRank: Number(baselineRank) || 10,
        isActive: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Keyword successfully added",
      keyword: created,
    });
  } catch (error: any) {
    console.error("[GBP_KEYWORDS_POST_ERROR]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to add keyword" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      keyword,
      keywordType,
      targetLocality,
      targetCity,
      searchVolume,
      serpFeature,
      baselineRank,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Keyword id is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (keyword !== undefined && keyword.trim()) updateData.keyword = keyword.trim().toLowerCase();
    if (keywordType !== undefined && ["GEO", "SEO", "AEO"].includes(keywordType)) updateData.keywordType = keywordType;
    if (targetLocality !== undefined) updateData.targetLocality = targetLocality || null;
    if (targetCity !== undefined) updateData.targetCity = targetCity;
    if (searchVolume !== undefined) updateData.searchVolume = Number(searchVolume) || 0;
    if (serpFeature !== undefined) updateData.serpFeature = serpFeature;
    if (baselineRank !== undefined) updateData.baselineRank = Number(baselineRank) || 1;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await db.merchantTrackedKeyword.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      message: "Keyword successfully updated",
      keyword: updated,
    });
  } catch (error: any) {
    console.error("[GBP_KEYWORDS_PUT_ERROR]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to update keyword" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Keyword id is required" }, { status: 400 });
    }

    await db.merchantTrackedKeyword.delete({
      where: { id },
    });

    return NextResponse.json({
      ok: true,
      message: "Keyword successfully deleted",
    });
  } catch (error: any) {
    console.error("[GBP_KEYWORDS_DELETE_ERROR]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to delete keyword" }, { status: 500 });
  }
}
