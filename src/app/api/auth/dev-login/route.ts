import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { db } from "@/lib/db";
import { getJwtSecret } from "@/lib/jwt-secret";

export async function GET(req: NextRequest) {
  try {
    const target = req.nextUrl.searchParams.get("target") || "/dashboard/orders";
    const requestedMerchantId = req.nextUrl.searchParams.get("merchantId") || "cmtymavfx0002kx008lbfvp57";

    // 1. Resolve merchant
    let merchant = await db.merchant.findUnique({
      where: { id: requestedMerchantId },
      include: { user: true },
    });

    if (!merchant) {
      merchant = await db.merchant.findFirst({
        where: { name: { contains: "Cake Connection" } },
        include: { user: true },
      });
    }

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    const userId = merchant.userId || merchant.user?.id || "dev_user_cake";
    const email = merchant.email || merchant.user?.email || "cakeconnection@gmail.com";

    // 2. Sign JWT Token
    const secret = new TextEncoder().encode(getJwtSecret());
    const token = await new SignJWT({
      userId,
      merchantId: merchant.id,
      role: "merchant",
      email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // 3. Create redirect response matching request host
    const host = req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const redirectUrl = new URL(target, `${proto}://${host}`);
    const res = NextResponse.redirect(redirectUrl);

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to dev login" }, { status: 500 });
  }
}
