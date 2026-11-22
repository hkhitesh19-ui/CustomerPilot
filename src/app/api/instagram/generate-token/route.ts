import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { merchantId, customerId, phone } = body;

    if (!merchantId || !customerId || !phone) {
      return NextResponse.json({ error: "merchantId, customerId, and phone are required" }, { status: 400 });
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      include: { instagramConnection: true }
    });

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    // Default to connected username or merchant slug/name fallback if during setup
    const igUsername = merchant.instagramConnection?.instagramUsername || 
                       merchant.name.toLowerCase().replace(/[^a-z0-9_]/g, "");

    // Generate 6-char clean token (e.g. CP_A9B2)
    const token = "CP_" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

    const tokenPayload = {
      merchantId,
      customerId,
      phone,
      token,
      expiresAt: expiresAt.toISOString()
    };

    await db.systemContent.upsert({
      where: { key: `ig_token_${token}` },
      create: {
        section: "instagram_verification",
        key: `ig_token_${token}`,
        value: JSON.stringify(tokenPayload),
        category: "instagram_pairing"
      },
      update: {
        section: "instagram_verification",
        value: JSON.stringify(tokenPayload)
      }
    });

    const deepLink = `https://ig.me/m/${igUsername}?text=Verify%20${token}`;

    return NextResponse.json({
      success: true,
      token,
      deepLink,
      username: igUsername,
      expiresInSeconds: 900
    });
  } catch (error: any) {
    console.error("[Instagram Token Gen Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to generate token" }, { status: 500 });
  }
}
