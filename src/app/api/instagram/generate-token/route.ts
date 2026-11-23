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

    // 1. Authoritative Customer Validation (Anti-Forgery)
    const customer = await db.customer.findFirst({
      where: { id: customerId, merchantId, phone }
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found or phone mismatch with store record" }, { status: 403 });
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      include: { 
        instagramConnection: true,
        digitalBusinessCard: true
      }
    });

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    let igUsername = merchant.instagramConnection?.instagramUsername;
    if (!igUsername && merchant.digitalBusinessCard?.instagramUrl) {
      igUsername = merchant.digitalBusinessCard.instagramUrl
        .replace(/.*instagram\.com\//i, "")
        .replace(/[/?#].*$/, "")
        .replace(/[@]/g, "")
        .trim();
    }
    if (!igUsername) {
      igUsername = merchant.name.toLowerCase().replace(/[^a-z0-9_]/g, "");
    }

    // 2. Active Token Reuse & Rate-Limiting Guard
    const activeCustKey = `ig_cust_active_${customerId}`;
    const existingActive = await db.systemContent.findUnique({
      where: { key: activeCustKey }
    });

    if (existingActive) {
      try {
        const meta = JSON.parse(existingActive.value);
        const expiresAt = new Date(meta.expiresAt);
        const remainingMs = expiresAt.getTime() - Date.now();
        // If active unexpired token exists (> 60s remaining), reuse it
        if (remainingMs > 60 * 1000) {
          const tokenExists = await db.systemContent.findUnique({
            where: { key: `ig_token_${meta.token}` }
          });
          if (tokenExists) {
            const deepLink = `https://ig.me/m/${igUsername}?text=Verify%20${meta.token}`;
            return NextResponse.json({
              success: true,
              token: meta.token,
              deepLink,
              username: igUsername,
              expiresInSeconds: Math.floor(remainingMs / 1000),
              reused: true
            });
          }
        }
      } catch {
        // Continue to fresh token generation
      }
    }

    // 3. Generate 6-char clean cryptographic token
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

    // Save active reference for reuse/rate-limiting
    await db.systemContent.upsert({
      where: { key: activeCustKey },
      create: {
        section: "instagram_verification",
        key: activeCustKey,
        value: JSON.stringify({ token, expiresAt: expiresAt.toISOString() }),
        category: "instagram_pairing"
      },
      update: {
        section: "instagram_verification",
        value: JSON.stringify({ token, expiresAt: expiresAt.toISOString() })
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
