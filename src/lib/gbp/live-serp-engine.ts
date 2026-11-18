/**
 * src/lib/gbp/live-serp-engine.ts
 *
 * CustomerPilot RankLocal AI™ — Live Google Maps SERP & Proximity Ranking Engine
 * Uses official Google Places API (New v1: places:searchText) with GPS locationBias
 * to measure authentic, verifiable Google Maps positions (#1 to #20) and real competitors.
 */

export interface LiveCompetitor {
  rank: number;
  placeId: string;
  name: string;
  rating: number;
  reviewsCount: number;
}

export interface LiveKeywordRankResult {
  keyword: string;
  rankPosition: number; // 1..20 if found, 21 if outside top 20
  foundInTop20: boolean;
  dataSource: "GOOGLE_PLACES_V1_LIVE" | "OFFLINE_BASELINE";
  merchantRating: number | null;
  merchantReviewCount: number | null;
  top3Competitors: LiveCompetitor[];
  totalResultsScanned: number;
  error?: string;
}

function normalizeStoreName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isMerchantMatch(
  place: { id?: string; displayName?: { text?: string } },
  targetPlaceId?: string | null,
  targetBusinessName?: string | null
): boolean {
  if (targetPlaceId && place.id && place.id === targetPlaceId) {
    return true;
  }
  if (targetBusinessName && place.displayName?.text) {
    const candidate = normalizeStoreName(place.displayName.text);
    const baseName = normalizeStoreName(targetBusinessName.split(/[-–:|]/)[0] || targetBusinessName);
    if (baseName.length >= 4 && (candidate.includes(baseName) || baseName.includes(candidate))) {
      return true;
    }
  }
  return false;
}

/**
 * Executes a real-time Google Places API (New v1) Text Search query biased to the exact GPS circle.
 */
export async function fetchLiveGoogleMapsRank(params: {
  keyword: string;
  city?: string | null;
  placeId?: string | null;
  businessName: string;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  fallbackRank?: number;
}): Promise<LiveKeywordRankResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const fallbackRank = params.fallbackRank ?? 10;

  if (!apiKey || apiKey.startsWith("mock_") || apiKey.length < 20) {
    return {
      keyword: params.keyword,
      rankPosition: fallbackRank,
      foundInTop20: fallbackRank <= 20,
      dataSource: "OFFLINE_BASELINE",
      merchantRating: null,
      merchantReviewCount: null,
      top3Competitors: [],
      totalResultsScanned: 0,
      error: "GOOGLE_PLACES_API_KEY not configured",
    };
  }

  const city = (params.city || "Vadodara").trim();
  const queryLower = params.keyword.toLowerCase();
  const textQuery = queryLower.includes(city.toLowerCase())
    ? params.keyword
    : `${params.keyword} ${city}`;

  const lat = params.lat ?? 22.2785;
  const lng = params.lng ?? 73.195;
  const radius = Math.min(50000, Math.max(500, params.radiusMeters ?? 5000));

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress",
      },
      body: JSON.stringify({
        textQuery,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius,
          },
        },
        maxResultCount: 20,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        keyword: params.keyword,
        rankPosition: fallbackRank,
        foundInTop20: fallbackRank <= 20,
        dataSource: "OFFLINE_BASELINE",
        merchantRating: null,
        merchantReviewCount: null,
        top3Competitors: [],
        totalResultsScanned: 0,
        error: `Google Places v1 HTTP ${res.status}: ${errText.slice(0, 180)}`,
      };
    }

    const data = await res.json();
    const places: Array<{
      id?: string;
      displayName?: { text?: string };
      rating?: number;
      userRatingCount?: number;
    }> = Array.isArray(data?.places) ? data.places : [];

    let foundRank = 21; // Outside top 20
    let merchantRating: number | null = null;
    let merchantReviewCount: number | null = null;

    const top3Competitors: LiveCompetitor[] = [];

    for (let i = 0; i < places.length; i++) {
      const p = places[i];
      const rank = i + 1;
      const matched = isMerchantMatch(p, params.placeId, params.businessName);

      if (matched && foundRank === 21) {
        foundRank = rank;
        merchantRating = typeof p.rating === "number" ? p.rating : null;
        merchantReviewCount = typeof p.userRatingCount === "number" ? p.userRatingCount : null;
      } else if (top3Competitors.length < 3) {
        top3Competitors.push({
          rank,
          placeId: p.id || "",
          name: p.displayName?.text || "Local Competitor",
          rating: typeof p.rating === "number" ? p.rating : 4.2,
          reviewsCount: typeof p.userRatingCount === "number" ? p.userRatingCount : 0,
        });
      }
    }

    return {
      keyword: params.keyword,
      rankPosition: foundRank,
      foundInTop20: foundRank <= 20,
      dataSource: "GOOGLE_PLACES_V1_LIVE",
      merchantRating,
      merchantReviewCount,
      top3Competitors,
      totalResultsScanned: places.length,
    };
  } catch (err: any) {
    return {
      keyword: params.keyword,
      rankPosition: fallbackRank,
      foundInTop20: fallbackRank <= 20,
      dataSource: "OFFLINE_BASELINE",
      merchantRating: null,
      merchantReviewCount: null,
      top3Competitors: [],
      totalResultsScanned: 0,
      error: err?.message || "Places API request failed",
    };
  }
}

/**
 * Resolves default GPS center coordinates for known Vadodara / merchant locations.
 */
export function resolveMerchantCoordinates(merchant: {
  id: string;
  name?: string | null;
  address?: string | null;
  city?: string | null;
}): { lat: number; lng: number } {
  const combined = `${merchant.name || ""} ${merchant.address || ""} ${merchant.city || ""}`.toLowerCase();
  // Cake Connection & CustomerPilot HQ (Eva Mall / RutuPlatina Complex, Manjalpur, Vadodara)
  if (
    merchant.id === "cmtymavfx0002kx008lbfvp57" ||
    merchant.id === "customerpilot-hq" ||
    combined.includes("manjalpur") ||
    combined.includes("eva")
  ) {
    return { lat: 22.2785, lng: 73.195 };
  }
  if (combined.includes("alkapuri")) {
    return { lat: 22.3106, lng: 73.1726 };
  }
  if (combined.includes("gotri")) {
    return { lat: 22.3149, lng: 73.1369 };
  }
  if (combined.includes("akota")) {
    return { lat: 22.2974, lng: 73.1687 };
  }
  if (combined.includes("pune") || combined.includes("pimpri") || combined.includes("tathawade")) {
    return { lat: 18.6186, lng: 73.7495 };
  }
  // Vadodara city center fallback
  return { lat: 22.3072, lng: 73.1812 };
}
