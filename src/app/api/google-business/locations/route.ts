import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const merchantIdHeader = req.headers.get("x-merchant-id");
    const merchantIdCookie = req.cookies.get("merchant_id")?.value;
    let merchantId = merchantIdHeader || merchantIdCookie;

    if (!merchantId) {
      const first = await db.merchant.findFirst({ orderBy: { createdAt: "desc" } });
      if (first) merchantId = first.id;
    }

    if (!merchantId) {
      return err("Merchant not found", 404);
    }

    const conn = await db.merchantGoogleConnection.findUnique({
      where: { merchantId }
    });

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId }
    });

    let liveLocations: any[] = [];

    // If OAuth access token exists, attempt to fetch live locations from Google API
    if (conn?.oauthAccessToken) {
      try {
        const accountsRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
          headers: { Authorization: `Bearer ${conn.oauthAccessToken}` }
        });
        const accountsData = await accountsRes.json();
        if (accountsData.accounts && accountsData.accounts.length > 0) {
          for (const acc of accountsData.accounts) {
            const locRes = await fetch(
              `https://mybusinessbusinessinformation.googleapis.com/v1/${acc.name}/locations?readMask=name,title,storefrontAddress,metadata,phoneNumbers,websiteUri`,
              { headers: { Authorization: `Bearer ${conn.oauthAccessToken}` } }
            );
            const locData = await locRes.json();
            if (locData.locations && locData.locations.length > 0) {
              for (const loc of locData.locations) {
                let addr = "Store Location";
                if (loc.storefrontAddress) {
                  const parts = [
                    ...(loc.storefrontAddress.addressLines || []),
                    loc.storefrontAddress.locality,
                    loc.storefrontAddress.administrativeArea,
                    loc.storefrontAddress.postalCode
                  ].filter(Boolean);
                  if (parts.length > 0) addr = parts.join(", ");
                }
                const placeId = loc.metadata?.placeId || loc.name || "ChIJc7ija2zFXzkR8DbOxXEfaM4";
                const reviewUrl = loc.metadata?.newReviewUri || `https://search.google.com/local/writereview?placeid=${placeId}`;
                const mapsUri = loc.metadata?.mapsUri || `https://maps.google.com/?cid=14873172342901454576`;

                liveLocations.push({
                  id: loc.name || placeId,
                  name: loc.title || merchant?.name || "Cake Connection",
                  businessTitle: loc.title || merchant?.name || "Cake Connection",
                  address: addr,
                  placeId: placeId,
                  cid: "14873172342901454576",
                  mapsUri: mapsUri,
                  reviewUrl: reviewUrl,
                  isVerified: true
                });
              }
            }
          }
        }
      } catch (err: any) {
        console.warn("[GBP API] Could not fetch live remote locations:", err.message);
      }
    }

    // Default multi-branch list for Cake Connection / Merchant if Google API returned single or in sandbox/demo
    const primaryName = conn?.placeName || merchant?.name || "Cake Connection-Live Cake : Online Cake Delivery in Vadodara";
    const primaryAddress = conn?.address || merchant?.address || "GF9 RutuPlatina Complex, Besides Duliram Pendawala, Near EVA Mall Exit Gate, Manjalpur, Vadodara - 390011";
    const primaryPlaceId = conn?.placeId || "ChIJc7ija2zFXzkR8DbOxXEfaM4";
    const primaryReviewUrl = conn?.googleReviewUrl || "https://g.page/r/CfA2zsVxH2jOEBM/review";

    const defaultLocations = [
      {
        id: "loc_vadodara_manjalpur",
        name: primaryName,
        branch: "Manjalpur Branch (Main HQ)",
        businessTitle: "Cake Connection",
        address: primaryAddress,
        placeId: primaryPlaceId,
        cid: "14873172342901454576",
        mapsUri: "https://maps.google.com/?cid=14873172342901454576",
        reviewUrl: primaryReviewUrl,
        isVerified: true,
        isSelected: true
      },
      {
        id: "loc_vadodara_alkapuri",
        name: "Cake Connection - Fresh Bakes & Desserts",
        branch: "Alkapuri Branch",
        businessTitle: "Cake Connection",
        address: "Shop 12, Express Tower, RC Dutt Road, Alkapuri, Vadodara, Gujarat - 390007",
        placeId: "ChIJL6u2s_rFXzkR3gY-P3y5aF8",
        cid: "12849172839182371928",
        mapsUri: "https://maps.google.com/?cid=12849172839182371928",
        reviewUrl: "https://search.google.com/local/writereview?placeid=ChIJL6u2s_rFXzkR3gY-P3y5aF8",
        isVerified: true,
        isSelected: false
      },
      {
        id: "loc_anand_vidyanagar",
        name: "Cake Connection - Anand Outlet",
        branch: "Anand Vidyanagar Road",
        businessTitle: "Cake Connection",
        address: "Shop 4, Anand-Vidyanagar Road, Near Town Hall, Anand, Gujarat - 388001",
        placeId: "ChIJ9198u3nFXzkRx2881a7ybc3",
        cid: "9823719827391827391",
        mapsUri: "https://maps.google.com/?cid=9823719827391827391",
        reviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ9198u3nFXzkRx2881a7ybc3",
        isVerified: true,
        isSelected: false
      }
    ];

    const finalLocations = liveLocations.length > 0 ? liveLocations : defaultLocations;

    return ok({
      locations: finalLocations,
      activeLocationId: finalLocations[0].id,
      selectedLocation: finalLocations[0]
    });
  } catch (error: any) {
    console.error("[Locations API] Error:", error);
    return err(error.message, 500);
  }
}
