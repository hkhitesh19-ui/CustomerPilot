/**
 * src/lib/gbp/live-analytics-engine.ts
 *
 * CustomerPilot RankLocal AI™ — Official Google Business Profile Performance API Engine
 * Calls businessprofileperformance.googleapis.com/v1 for 100% authentic 30-day metrics:
 * - Phone Calls (CALL_CLICKS)
 * - Direction Requests (BUSINESS_DIRECTION_REQUESTS)
 * - Website Clicks (WEBSITE_CLICKS)
 * - Maps & Search Impressions (Mobile & Desktop)
 * - Monthly Search Keywords driving discovery
 */

import { getValidOAuthAccessToken } from "@/lib/google-reviews-service";

export interface LiveGbpPerformanceTelemetry {
  dataSource: "GOOGLE_GBP_PERFORMANCE_LIVE" | "NOT_CONNECTED";
  period: string;
  totalInteractions: number;
  interactionsGrowthPct: number;
  phoneCalls: number;
  directions: number;
  websiteClicks: number;
  totalImpressions: number;
  impressionsGrowthPct: number;
  searchQueries: {
    discoveryPct: number;
    directPct: number;
  };
  platforms: {
    googleMapsPct: number;
    googleSearchPct: number;
  };
  topSearchKeywords: Array<{
    keyword: string;
    impressions: number;
  }>;
  lastCapturedAt: string;
  error?: string;
}

function extractLocationNumericId(gbpLocationId?: string | null): string | null {
  if (!gbpLocationId) return null;
  const cleaned = gbpLocationId.trim();
  const match = cleaned.match(/locations\/(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(cleaned)) return cleaned;
  return null;
}

function sumTimeSeries(datedValues: Array<{ value?: string | number }>): number {
  let total = 0;
  for (const item of datedValues || []) {
    if (item && item.value !== undefined && item.value !== null) {
      const n = Number(item.value);
      if (Number.isFinite(n)) total += n;
    }
  }
  return total;
}

/**
 * Fetches live 30-day Google Business Profile Performance metrics & top search keywords
 * directly from Google's official businessprofileperformance.googleapis.com API.
 */
export async function fetchLiveGbpPerformance(
  merchantId: string
): Promise<LiveGbpPerformanceTelemetry> {
  const now = new Date();
  const emptyResult = (reason?: string): LiveGbpPerformanceTelemetry => ({
    dataSource: "NOT_CONNECTED",
    period: "Last 30 Days",
    totalInteractions: 0,
    interactionsGrowthPct: 0,
    phoneCalls: 0,
    directions: 0,
    websiteClicks: 0,
    totalImpressions: 0,
    impressionsGrowthPct: 0,
    searchQueries: { discoveryPct: 0, directPct: 0 },
    platforms: { googleMapsPct: 0, googleSearchPct: 0 },
    topSearchKeywords: [],
    lastCapturedAt: now.toISOString(),
    error: reason,
  });

  try {
    const { connection, token } = await getValidOAuthAccessToken(merchantId);
    const locationNumericId = extractLocationNumericId(connection?.gbpLocationId);

    if (!token || token.startsWith("mock_") || !locationNumericId) {
      return emptyResult("Google Business Profile OAuth token or numeric locationId not connected");
    }

    // Performance API lags by ~1-2 days on Google's side; query trailing 30 days ending yesterday
    const endDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000);

    // Previous 30-day window for real growth % delta
    const prevEndDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(prevEndDate.getTime() - 29 * 24 * 60 * 60 * 1000);

    const buildMetricsUrl = (from: Date, to: Date) =>
      `https://businessprofileperformance.googleapis.com/v1/locations/${locationNumericId}:fetchMultiDailyMetricsTimeSeries` +
      `?dailyMetrics=CALL_CLICKS` +
      `&dailyMetrics=WEBSITE_CLICKS` +
      `&dailyMetrics=BUSINESS_DIRECTION_REQUESTS` +
      `&dailyMetrics=BUSINESS_IMPRESSIONS_DESKTOP_MAPS` +
      `&dailyMetrics=BUSINESS_IMPRESSIONS_MOBILE_MAPS` +
      `&dailyMetrics=BUSINESS_IMPRESSIONS_DESKTOP_SEARCH` +
      `&dailyMetrics=BUSINESS_IMPRESSIONS_MOBILE_SEARCH` +
      `&dailyRange.start_date.year=${from.getUTCFullYear()}` +
      `&dailyRange.start_date.month=${from.getUTCMonth() + 1}` +
      `&dailyRange.start_date.day=${from.getUTCDate()}` +
      `&dailyRange.end_date.year=${to.getUTCFullYear()}` +
      `&dailyRange.end_date.month=${to.getUTCMonth() + 1}` +
      `&dailyRange.end_date.day=${to.getUTCDate()}`;

    const kwUrl =
      `https://businessprofileperformance.googleapis.com/v1/locations/${locationNumericId}/searchkeywords/impressions/monthly` +
      `?monthlyRange.start_month.year=${startDate.getUTCFullYear()}` +
      `&monthlyRange.start_month.month=${startDate.getUTCMonth() + 1}` +
      `&monthlyRange.end_month.year=${endDate.getUTCFullYear()}` +
      `&monthlyRange.end_month.month=${endDate.getUTCMonth() + 1}` +
      `&pageSize=20`;

    const headers = { Authorization: `Bearer ${token}` };

    const [currRes, prevRes, kwRes] = await Promise.all([
      fetch(buildMetricsUrl(startDate, endDate), { headers, signal: AbortSignal.timeout(12000) }),
      fetch(buildMetricsUrl(prevStartDate, prevEndDate), { headers, signal: AbortSignal.timeout(12000) }).catch(() => null),
      fetch(kwUrl, { headers, signal: AbortSignal.timeout(12000) }).catch(() => null),
    ]);

    if (!currRes.ok) {
      const errTxt = await currRes.text().catch(() => "");
      return emptyResult(`GBP Performance API HTTP ${currRes.status}: ${errTxt.slice(0, 160)}`);
    }

    const extractTotals = (payload: any) => {
      const map: Record<string, number> = {};
      const groups = payload?.multiDailyMetricTimeSeries || [];
      for (const g of groups) {
        for (const s of g?.dailyMetricTimeSeries || []) {
          map[s.dailyMetric] = sumTimeSeries(s?.timeSeries?.datedValues || []);
        }
      }
      return map;
    };

    const currTotals = extractTotals(await currRes.json());
    const prevTotals = prevRes && prevRes.ok ? extractTotals(await prevRes.json()) : {};

    const phoneCalls = currTotals.CALL_CLICKS || 0;
    const directions = currTotals.BUSINESS_DIRECTION_REQUESTS || 0;
    const websiteClicks = currTotals.WEBSITE_CLICKS || 0;
    const totalInteractions = phoneCalls + directions + websiteClicks;

    const mapsImpressions =
      (currTotals.BUSINESS_IMPRESSIONS_MOBILE_MAPS || 0) +
      (currTotals.BUSINESS_IMPRESSIONS_DESKTOP_MAPS || 0);
    const searchImpressions =
      (currTotals.BUSINESS_IMPRESSIONS_MOBILE_SEARCH || 0) +
      (currTotals.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH || 0);
    const totalImpressions = mapsImpressions + searchImpressions;

    const prevInteractions =
      (prevTotals.CALL_CLICKS || 0) +
      (prevTotals.BUSINESS_DIRECTION_REQUESTS || 0) +
      (prevTotals.WEBSITE_CLICKS || 0);
    const prevImpressions =
      (prevTotals.BUSINESS_IMPRESSIONS_MOBILE_MAPS || 0) +
      (prevTotals.BUSINESS_IMPRESSIONS_DESKTOP_MAPS || 0) +
      (prevTotals.BUSINESS_IMPRESSIONS_MOBILE_SEARCH || 0) +
      (prevTotals.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH || 0);

    const calcGrowth = (curr: number, prev: number) => {
      if (prev <= 0) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    const googleMapsPct =
      totalImpressions > 0 ? Number(((mapsImpressions / totalImpressions) * 100).toFixed(1)) : 0;
    const googleSearchPct =
      totalImpressions > 0 ? Number(((searchImpressions / totalImpressions) * 100).toFixed(1)) : 0;

    // Parse real monthly Google Search keywords
    const topSearchKeywords: Array<{ keyword: string; impressions: number }> = [];
    if (kwRes && kwRes.ok) {
      const kwData = await kwRes.json().catch(() => ({}));
      const items = kwData?.searchKeywordsCounts || [];
      for (const item of items) {
        const kwText = item?.searchKeyword;
        const val = Number(item?.insightsValue?.value ?? item?.insightsValue?.threshold ?? 0);
        if (kwText) {
          topSearchKeywords.push({ keyword: kwText, impressions: Number.isFinite(val) ? val : 0 });
        }
      }
      topSearchKeywords.sort((a, b) => b.impressions - a.impressions);
    }

    // Estimate discovery vs direct ratio from actual search keywords (branded vs non-branded)
    let discoverySum = 0;
    let directSum = 0;
    for (const k of topSearchKeywords) {
      const lower = k.keyword.toLowerCase();
      if (lower.includes("cake connection") || lower.includes("customerpilot") || lower.includes("customer pilot")) {
        directSum += k.impressions || 1;
      } else {
        discoverySum += k.impressions || 1;
      }
    }
    const kwTotal = discoverySum + directSum;
    const discoveryPct = kwTotal > 0 ? Number(((discoverySum / kwTotal) * 100).toFixed(1)) : 0;
    const directPct = kwTotal > 0 ? Number(((directSum / kwTotal) * 100).toFixed(1)) : 0;

    return {
      dataSource: "GOOGLE_GBP_PERFORMANCE_LIVE",
      period: "Last 30 Days",
      totalInteractions,
      interactionsGrowthPct: calcGrowth(totalInteractions, prevInteractions),
      phoneCalls,
      directions,
      websiteClicks,
      totalImpressions,
      impressionsGrowthPct: calcGrowth(totalImpressions, prevImpressions),
      searchQueries: {
        discoveryPct,
        directPct,
      },
      platforms: {
        googleMapsPct,
        googleSearchPct,
      },
      topSearchKeywords: topSearchKeywords.slice(0, 15),
      lastCapturedAt: now.toISOString(),
    };
  } catch (err: any) {
    return emptyResult(err?.message || "Failed to query GBP Performance API");
  }
}
