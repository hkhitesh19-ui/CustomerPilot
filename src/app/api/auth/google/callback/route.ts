import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SignJWT } from "jose";
import { generateMerchantIdNumber } from "@/lib/merchant-id-generator";

if (!process.env.JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set');
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "";
    const stateParts = state.split("_");
    const moduleParam = stateParts[1] || "";
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const appUrl = `${protocol}://${host}`;

    if (!code) {
      return NextResponse.redirect(`${appUrl}/signup?error=no_code_provided`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[Google Auth Callback] Token exchange failed:", tokenData);
      return NextResponse.redirect(`${appUrl}/signup?error=token_exchange_failed`);
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // 2. Fetch User Profile from Google
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userinfo = await userinfoRes.json();

    if (!userinfo.email) {
      return NextResponse.redirect(`${appUrl}/signup?error=no_email_returned`);
    }

    const email = userinfo.email.trim().toLowerCase();
    const name = userinfo.name || email.split("@")[0];

    // 3. Find or Create User
    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name,
          role: "merchant",
        },
      });
    }

    // Resolve module from OAuth state — applies to both new AND existing merchants
    const MODULE_MAP: Record<string, string> = {
      reviews: "REVIEWS",
      loyalty: "LOYALTY",
      autoreply: "AUTOREPLY",
    };
    const isFastTrack = !!(moduleParam && MODULE_MAP[moduleParam]);
    const fastTrackModule = isFastTrack ? MODULE_MAP[moduleParam] : "LOYALTY,REVIEWS,AUTOREPLY";

    // 4. Find or Create Merchant
    let merchant = await db.merchant.findUnique({ where: { userId: user.id } }).catch(() => null);
    if (!merchant) {
      merchant = await db.merchant.findFirst({ where: { email } });
    }

    if (!merchant) {
      // ─── New Merchant: Create with fast-track settings ───
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const merchantIdNumber = await generateMerchantIdNumber(db);

      merchant = await db.merchant.create({
        data: {
          userId: user.id,
          merchantIdNumber,
          name: name || "My Business",
          ownerName: name,
          email,
          businessType: "bakery",
          plan: "trial",
          status: "active",
          trialEndsAt,
          enabledModules: fastTrackModule,
          onboardingCompleted: isFastTrack,
          currentStep: isFastTrack ? 99 : 1,
        },
      });

      // Create Onboarding steps
      const onboardingSteps = [
        { stepKey: "business_info", label: "Business Information" },
        { stepKey: "whatsapp_verify", label: "WhatsApp Verification" },
        { stepKey: "google_business", label: "Google Business Profile" },
        { stepKey: "logo_upload", label: "Logo Upload" },
        { stepKey: "reward_setup", label: "Reward Card Setup" },
        { stepKey: "qr_code", label: "QR Code Generation" },
        { stepKey: "print_standee", label: "Print Standee" },
        { stepKey: "system_test", label: "Live System Test" },
      ];

      await db.onboardingStep.createMany({
        data: onboardingSteps.map((s) => ({
          merchantId: merchant!.id,
          stepKey: s.stepKey,
          label: s.label,
          completed: isFastTrack,
        })),
      }).catch(() => {});

    } else if (isFastTrack && !merchant.onboardingCompleted) {
      // ─── Existing Merchant stuck in onboarding: Fast-track bypass ───
      // This handles merchants who registered before the fix or via manual form
      merchant = await db.merchant.update({
        where: { id: merchant.id },
        data: {
          onboardingCompleted: true,
          currentStep: 99,
          enabledModules: fastTrackModule,
        },
      });
      await db.onboardingStep.updateMany({
        where: { merchantId: merchant.id },
        data: { completed: true },
      });
      console.log(`[Google Auth Callback] Fast-tracked existing merchant ${merchant.id} to module: ${moduleParam}`);
    }


    // 5. Check and auto-fetch Google Business Profile if available
    try {
      const accountsRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const accountsData = await accountsRes.json();
      if (accountsData.accounts && accountsData.accounts.length > 0) {
        const gbpAccountId = accountsData.accounts[0].name;
        const locRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${gbpAccountId}/locations?readMask=name,title,storefrontAddress,metadata,phoneNumbers,websiteUri`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const locData = await locRes.json();
        if (locData.locations && locData.locations.length > 0) {
          const loc = locData.locations[0];
          let placeName = loc.title || merchant.name;
          let placeAddress = loc.storefrontAddress
            ? [
                ...(loc.storefrontAddress.addressLines || []),
                loc.storefrontAddress.locality,
                loc.storefrontAddress.administrativeArea,
                loc.storefrontAddress.postalCode,
              ].filter(Boolean).join(", ")
            : "";
          let placeId = loc.metadata?.placeId || loc.name;
          let googleReviewUrl = loc.metadata?.newReviewUri || (placeId ? `https://search.google.com/local/writereview?placeid=${placeId}` : "");

          await db.merchantGoogleConnection.upsert({
            where: { merchantId: merchant.id },
            update: {
              placeName,
              address: placeAddress,
              placeId,
              googleReviewUrl,
              connectionType: "oauth",
              verified: true,
              syncStatus: "active",
              oauthAccessToken: accessToken,
              oauthRefreshToken: refreshToken,
              gbpAccountId,
              gbpLocationId: loc.name,
              lastSyncedAt: new Date(),
            },
            create: {
              merchantId: merchant.id,
              placeName,
              address: placeAddress,
              placeId,
              googleReviewUrl,
              connectionType: "oauth",
              verified: true,
              syncStatus: "active",
              oauthAccessToken: accessToken,
              oauthRefreshToken: refreshToken,
              gbpAccountId,
              gbpLocationId: loc.name,
              lastSyncedAt: new Date(),
            },
          });

          if (placeName && merchant.name.includes("My Business")) {
            await db.merchant.update({
              where: { id: merchant.id },
              data: { name: placeName, address: placeAddress },
            });
          }
        }
      }
    } catch (e: any) {
      console.log("[Google Auth Callback] Note: GBP auto-fetch skipped or not authorized:", e.message);
    }

    // 6. Sign JWT and Set Session Cookie
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      merchantId: merchant.id,
      role: user.role,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const MODULE_REDIRECTS: Record<string, string> = {
      reviews: '/dashboard/reviews',
      autoreply: '/dashboard/reviews',
      loyalty: '/dashboard',
    };
    const redirectPath = merchant.onboardingCompleted
      ? (isFastTrack ? (MODULE_REDIRECTS[moduleParam] || '/dashboard') : '/dashboard')
      : `/onboarding?step=${merchant.currentStep || 1}`;

    const res = NextResponse.redirect(`${appUrl}${redirectPath}`);

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    res.cookies.set("merchant_id", merchant.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    console.error("[Google Auth Callback] Global Error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/signup?error=oauth_error`);
  }
}
