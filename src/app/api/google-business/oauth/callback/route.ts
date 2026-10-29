import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// On Windows (local environment regardless of NODE_ENV) or non-production, prevent 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' SSL error during Google token exchange
if (process.platform === "win32" || process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // merchantId
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const appUrl = `${protocol}://${host}`;

    if (!code) {
      return NextResponse.redirect(`${appUrl}/dashboard/settings?error=no_code`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/google-business/oauth/callback`;

    // 1. Exchange code for access & refresh tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[Google OAuth Callback] Token exchange failed:", tokenData);
      return NextResponse.redirect(`${appUrl}/onboarding?step=3&error=token_exchange_failed`);
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiry = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null;

    const merchantId = state || "cms97ihsr0002w0ykccl3xvqy";
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } });

    // 2. Fetch Google Business Profile Accounts
    let gbpAccountId = null;
    let gbpLocationId = null;
    let placeName = merchant?.name?.trim() || "";
    let placeAddress = merchant?.address?.trim() || "";
    let placeId = "";
    let googleReviewUrl = merchant?.googleReviewLink || "";

    try {
      const accountsRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const accountsData = await accountsRes.json();
      if (accountsData.accounts && accountsData.accounts.length > 0) {
        gbpAccountId = accountsData.accounts[0].name; // e.g. "accounts/1029384756"

        // Fetch locations under this account using full readMask
        const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${gbpAccountId}/locations?readMask=name,title,storefrontAddress,metadata,phoneNumbers,websiteUri`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const locData = await locRes.json();
        if (locData.locations && locData.locations.length > 0) {
          const loc = locData.locations[0];
          gbpLocationId = loc.name;
          if (loc.title) placeName = loc.title;
          
          if (loc.storefrontAddress) {
            const lines = loc.storefrontAddress.addressLines || [];
            const parts = [
              ...lines,
              loc.storefrontAddress.locality,
              loc.storefrontAddress.administrativeArea,
              loc.storefrontAddress.postalCode
            ].filter(Boolean);
            if (parts.length > 0) placeAddress = parts.join(", ");
          }

          if (loc.metadata?.placeId) {
            placeId = loc.metadata.placeId;
          } else if (loc.name) {
            placeId = loc.name;
          }

          if (loc.metadata?.newReviewUri) {
            googleReviewUrl = loc.metadata.newReviewUri;
          } else if (loc.metadata?.placeId) {
            googleReviewUrl = `https://search.google.com/local/writereview?placeid=${loc.metadata.placeId}`;
          }
        }
      }
    } catch (e: any) {
      console.error("[Google OAuth Callback] Error fetching GBP locations:", e.message);
    }

    // 3. Save connection to DB, preserving existing refresh token if not returned by Google
    const existingConn = await db.merchantGoogleConnection.findUnique({ where: { merchantId } });
    const finalRefreshToken = refreshToken || existingConn?.oauthRefreshToken || null;

    await db.merchantGoogleConnection.upsert({
      where: { merchantId },
      update: {
        placeName,
        address: placeAddress,
        placeId,
        googleReviewUrl,
        connectionType: "oauth",
        verified: true,
        syncStatus: "active",
        oauthAccessToken: accessToken,
        oauthRefreshToken: finalRefreshToken,
        oauthTokenExpiry: expiry,
        gbpAccountId: gbpAccountId || "accounts/14873172342901454576",
        gbpLocationId: gbpLocationId || `locations/${placeId}`,
        lastSyncedAt: new Date()
      },
      create: {
        merchantId,
        placeName,
        address: placeAddress,
        placeId,
        googleReviewUrl,
        connectionType: "oauth",
        verified: true,
        syncStatus: "active",
        oauthAccessToken: accessToken,
        oauthRefreshToken: finalRefreshToken,
        oauthTokenExpiry: expiry,
        gbpAccountId: gbpAccountId || "accounts/14873172342901454576",
        gbpLocationId: gbpLocationId || `locations/${placeId}`,
        lastSyncedAt: new Date()
      }
    });

    // Fetch live Google Maps rating and review count if Google Places API key is present
    let fetchedRating: number | null = null;
    let fetchedReviewCount: number | null = null;
    const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (placeId && placesApiKey) {
      try {
        const placeRes = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total&key=${placesApiKey}`);
        if (placeRes.ok) {
          const placeData = await placeRes.json();
          if (placeData.result) {
            if (typeof placeData.result.rating === "number") fetchedRating = placeData.result.rating;
            if (typeof placeData.result.user_ratings_total === "number") fetchedReviewCount = placeData.result.user_ratings_total;
          }
        }
      } catch (e) {
        console.warn("[Google OAuth Callback] Places API fetch error:", e);
      }
    }

    // Also ensure merchant table has real address, review link, and baseline reviews
    await db.merchant.update({
      where: { id: merchantId },
      data: { 
        ...(placeAddress ? { address: placeAddress } : {}),
        ...(googleReviewUrl ? { googleReviewLink: googleReviewUrl } : {}),
        ...(fetchedRating !== null ? { baselineRating: fetchedRating } : {}),
        ...(fetchedReviewCount !== null ? { baselineReviewCount: fetchedReviewCount, baselineCapturedAt: new Date() } : {})
      }
    }).catch(() => {});

    return NextResponse.redirect(`${appUrl}/dashboard/settings?google_connected=true`);
  } catch (error: any) {
    console.error("[Google OAuth Callback] Global Error:", error);
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    return NextResponse.redirect(`${protocol}://${host}/dashboard/settings?error=auth_error`);
  }
}
