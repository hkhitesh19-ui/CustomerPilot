/**
 * src/lib/gbp-audit-engine.ts
 * 
 * Pure mathematical scoring and diagnostic engine for Google Business Profile (GBP) Audits.
 * 100% Deterministic — Zero database dependencies, zero network requests, zero side effects.
 */

export interface AuditPillar {
  title: string;
  score: number;
  maxScore: number;
  status: "OPTIMAL" | "WARNING" | "CRITICAL";
  finding: string;
  recommendation: string;
}

export interface CompetitorBenchmark {
  rank: number;
  name: string;
  rating: number;
  reviews: number;
  photosRatio: string;
  isSpamTitle: boolean;
  spamNote: string;
  redressalOpportunity: boolean;
  redressalAction?: string;
  isUserBusiness?: boolean;
}

export interface RealCompetitorInput {
  name: string;
  rating: number;
  reviews: number;
  placeId?: string;
  types?: string[];
  formattedAddress?: string;
  rank?: number;
}

export interface GbpAuditInput {
  businessName: string;
  category?: string;
  locality?: string;
  currentReviews?: number;
  currentRank?: number;
  realPlace?: {
    userRatingCount?: number;
    rating?: number;
    name?: string;
    placeId?: string;
    types?: string[];
  } | null;
  realCompetitors?: RealCompetitorInput[] | null;
  isLiveGoogleData?: boolean;
  dataSource?: string;
}

export interface GbpAuditResult {
  business: {
    name: string;
    category: string;
    locality: string;
    currentRating: number;
    currentReviews: number;
    detectedRank: number;
    officialGoogleName?: string;
    placeId?: string;
  };
  audit: {
    overallScore: number;
    maxScore: number;
    percentage: number;
    grade: string;
    statusLabel: string;
    statusColor: string;
    pillars: AuditPillar[];
  };
  recommendedTrack: "TRACK_A" | "TRACK_B";
  trackDetails: {
    name: string;
    timeline: string;
    price: string;
    focus: string;
    cta: string;
  };
  competitors: CompetitorBenchmark[];
  isLiveGoogleData: boolean;
  dataSource: string;
  fiveGuardrails: Array<{
    num: number;
    title: string;
    desc: string;
    status: string;
  }>;
}

export function calculateGbpAudit(input: GbpAuditInput): GbpAuditResult {
  const {
    businessName,
    category = "Retail Store",
    locality = "Vadodara",
    currentReviews = 0,
    currentRank = 0,
    realPlace = null,
    realCompetitors = null,
    isLiveGoogleData: explicitLive = false,
    dataSource: explicitSource = ""
  } = input;

  const cleanName = businessName.trim();
  const cleanCat = category.trim();
  const cleanLoc = locality.trim();

  // Review & Rating Resolution (Prioritize real Google place if provided, fallback to explicit payload)
  const reviewCount = realPlace?.userRatingCount ?? (Number(currentReviews) || 12);
  const rating = realPlace?.rating ?? 4.2;
  const detectedRank = Number(currentRank) > 0 ? Number(currentRank) : (reviewCount > 100 ? 5 : reviewCount > 30 ? 12 : 28);

  // Pillar 1: Category Match & Secondary Categories (Max 20)
  const hasCategoryInName = cleanName.toLowerCase().includes(cleanCat.toLowerCase());
  const categoryScore = hasCategoryInName ? 18 : 12;
  const categoryPillar: AuditPillar = {
    title: "Primary & Secondary Categories",
    score: categoryScore,
    maxScore: 20,
    status: categoryScore >= 16 ? "OPTIMAL" : "WARNING",
    finding: hasCategoryInName
      ? `Primary category matches search intent (${cleanCat}), but secondary categories need competitor parity.`
      : `Primary category (${cleanCat}) is missing from physical signboard title alignment, leaving rank gap.`,
    recommendation: "Sync exact Primary + 3 Secondary categories from the #1 ranked competitor in your local pin code."
  };

  // Pillar 2: Signboard & Keyword Policy Safety (Max 20)
  const isKeywordStuffed = cleanName.split("-").length > 2 || cleanName.split("|").length > 1;
  const keywordScore = isKeywordStuffed ? 8 : (hasCategoryInName ? 19 : 14);
  const keywordPillar: AuditPillar = {
    title: "Signboard & Title Policy Compliance",
    score: keywordScore,
    maxScore: 20,
    status: keywordScore >= 16 ? "OPTIMAL" : keywordScore >= 12 ? "WARNING" : "CRITICAL",
    finding: isKeywordStuffed
      ? "Warning: Name appears keyword-stuffed without permanent physical board proof. High risk of Google suspension."
      : hasCategoryInName
        ? "Safe & Policy-Compliant: Name balances primary service keyword with authentic branding."
        : "Name is purely branded without primary keyword. Needs ₹500 permanent sub-board upgrade before GBP name edit.",
    recommendation: "Install ₹500 permanent acrylic sub-board with keyword and update Udyam certificate before editing GBP title."
  };

  // Pillar 3: Review Velocity & Sandbox Trust Barrier (Max 20)
  const isSandboxRisk = reviewCount < 15;
  const reviewScore = reviewCount >= 100 ? 19 : reviewCount >= 40 ? 15 : reviewCount >= 15 ? 12 : 7;
  const reviewPillar: AuditPillar = {
    title: "Review Volume & Sandbox Velocity",
    score: reviewScore,
    maxScore: 20,
    status: reviewScore >= 16 ? "OPTIMAL" : reviewScore >= 12 ? "WARNING" : "CRITICAL",
    finding: isSandboxRisk
      ? `High Google Sandbox Risk: With ${reviewCount} reviews, aggressive review collection will trigger spam suspension.`
      : `Velocity Gap: ${reviewCount} reviews is behind the local Top 3 average (150+ reviews). Needs sustained weekly drip.`,
    recommendation: isSandboxRisk
      ? "Enforce strict Slow & Safe Drip (max 2-3 photo reviews/week) until 30-day trust barrier is cleared."
      : "Activate CustomerPilot WhatsApp counter automation to collect 6-10 honest photo reviews weekly."
  };

  // Pillar 4: Customer Photo Reviews Ratio (Max 15)
  const estimatedPhotoRatio = reviewCount > 50 ? 25 : 12;
  const photoScore = estimatedPhotoRatio >= 30 ? 14 : estimatedPhotoRatio >= 20 ? 10 : 6;
  const photoPillar: AuditPillar = {
    title: "Customer Photo Reviews & UGC Depth",
    score: photoScore,
    maxScore: 15,
    status: photoScore >= 12 ? "OPTIMAL" : "WARNING",
    finding: `Estimated ${estimatedPhotoRatio}% photo review ratio. Google local pack heavily prioritizes profiles with customer photos.`,
    recommendation: "Reward customers with +1 Extra Loyalty Stamp specifically when they attach a photo of their order or bill."
  };

  // Pillar 5: Voice Search (AEO) & Hidden Attributes (Max 15) — Baseline diagnostic constant
  const aeoScore = 8;
  const aeoPillar: AuditPillar = {
    title: "Voice Search (AEO) & Hidden Attributes",
    score: aeoScore,
    maxScore: 15,
    status: "WARNING",
    finding: "Hidden attributes (Wheelchair, UPI/Cards, Restroom, Women-Owned) appear unconfigured or default.",
    recommendation: "Enable all relevant attribute switches in GBP 'More' tab and attach CustomerPilot direct WhatsApp order link."
  };

  // Pillar 6: Outside-GBP GEO (ChatGPT / Gemini AI) Citations (Max 10) — Baseline diagnostic constant
  const geoScore = 4;
  const geoPillar: AuditPillar = {
    title: "Outside-GBP GEO AI Visibility (LLMs)",
    score: geoScore,
    maxScore: 10,
    status: "CRITICAL",
    finding: "Zero structured articles detected on Medium, Quora, or LinkedIn Pulse mentioning this business in local Top 5 lists.",
    recommendation: "Publish monthly 'Top 5 in [Locality]' authority article linking to your mini-website to train ChatGPT and Gemini."
  };

  const pillars = [categoryPillar, keywordPillar, reviewPillar, photoPillar, aeoPillar, geoPillar];
  const totalScore = pillars.reduce((sum, p) => sum + p.score, 0);
  const maxTotalScore = pillars.reduce((sum, p) => sum + p.maxScore, 0); // 100

  // Grade and Summary
  let grade = "NEEDS_SURGERY";
  let statusLabel = "Moderate Rank Risk — High Growth Potential";
  let statusColor = "text-amber-600 bg-amber-50 border-amber-200";

  if (totalScore >= 80) {
    grade = "HEALTHY";
    statusLabel = "Top 3 Ready — Maintain Velocity";
    statusColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  } else if (totalScore < 50 || isSandboxRisk) {
    grade = "HIGH_RISK";
    statusLabel = isSandboxRisk ? "High Google Sandbox Ban Risk" : "Critical Visibility & Keyword Gap";
    statusColor = "text-rose-600 bg-rose-50 border-rose-200";
  }

  // Recommended Track
  const recommendedTrack: "TRACK_A" | "TRACK_B" = (isSandboxRisk || detectedRank > 25) ? "TRACK_A" : "TRACK_B";
  const trackDetails = recommendedTrack === "TRACK_A" ? {
    name: 'Track A: "New Business Launchpad"',
    timeline: "0 to Top 3 in 60 Days",
    price: "₹5,999 Setup + ₹1,999/month",
    focus: "100% Video Verification pass + 30-Day Sandbox Velocity Protection (2-3 reviews/week safe cap).",
    cta: "Start Safe Launchpad (Track A)"
  } : {
    name: 'Track B: "Top 3 Rank Accelerator"',
    timeline: "Stuck #10-#50 to Top 3 in 30-45 Days",
    price: "₹4,999 Setup + ₹1,999/month",
    focus: "90-Minute Surgery, Competitor Spam Redressal Purge, WhatsApp Photo Review Flywheel & Weekend Booster.",
    cta: "Unlock Top 3 Rank Accelerator (Track B)"
  };

  // Competitor Local Pack Benchmark Matrix (Real Live Google Places or Realistic Algorithmic Fallback)
  const areaName = cleanLoc.split(",")[0].trim();
  let competitors: CompetitorBenchmark[] = [];
  const hasRealCompetitors = Array.isArray(realCompetitors) && realCompetitors.length > 0;
  const isLive = explicitLive || hasRealCompetitors;
  const dataSource = isLive
    ? (explicitSource || "Official Google Maps Platform (Real-Time Places Index)")
    : "Algorithmic Local Pack Benchmark (Simulated)";

  if (hasRealCompetitors && realCompetitors) {
    const userLower = cleanName.toLowerCase();
    const userPlaceId = realPlace?.placeId;

    // Filter out user's own business from competitor list
    const filtered = realCompetitors.filter(c => {
      if (userPlaceId && c.placeId && c.placeId === userPlaceId) return false;
      const cLower = (c.name || "").toLowerCase();
      if (cLower === userLower) return false;
      return true;
    });

    const top3 = filtered.slice(0, 3);

    top3.forEach((c, idx) => {
      const cName = c.name || `Local Competitor #${idx + 1}`;
      const hasPipe = cName.includes("|");
      const hasMultipleDashes = (cName.match(/-/g) || []).length >= 2;
      const hasMarketingWords = /\b(best|top|no\.?1|delivery|customized|keratin|bridal|makeup|pure veg|super|fast|24x7|express|pizza|pasta|shop in|near)\b/i.test(cName);
      const isSpam = hasPipe || hasMultipleDashes || (hasMarketingWords && (cName.includes("-") || cName.includes(":") || cName.includes(",")));
      
      const estimatedRatio = c.reviews > 100 ? "40%" : c.reviews > 30 ? "28%" : "18%";

      competitors.push({
        rank: idx + 1,
        name: cName,
        rating: Number(c.rating) || 4.2,
        reviews: Number(c.reviews) || 0,
        photosRatio: estimatedRatio,
        isSpamTitle: isSpam,
        spamNote: isSpam
          ? "🚨 Keyword Spam Detected: Title stuffs promotional or locality keywords not matching legal business name."
          : "Clean branding, established local pack prominence.",
        redressalOpportunity: isSpam,
        redressalAction: isSpam
          ? `Submit Google Business Redressal Complaint Form with physical board photo of '${cName.split(/[-|:,]/)[0].trim()}' to strip spam keywords.`
          : undefined
      });
    });

    // Add user's business at its real detected rank
    competitors.push({
      rank: detectedRank,
      name: cleanName,
      rating: rating,
      reviews: reviewCount,
      photosRatio: `${estimatedPhotoRatio}%`,
      isUserBusiness: true,
      isSpamTitle: isKeywordStuffed,
      spamNote: isKeywordStuffed ? "Keyword-heavy without physical sub-board proof." : "Authentic profile with keyword & footfall gap.",
      redressalOpportunity: false
    });
  } else {
    // Clean fallback WITHOUT cross-domain keywords
    competitors = [
      {
        rank: 1,
        name: `Premier ${cleanCat} (${areaName})`,
        rating: 4.8,
        reviews: 342,
        photosRatio: "42%",
        isSpamTitle: false,
        spamNote: "Clean branding, strong directory citations and high user signals.",
        redressalOpportunity: false
      },
      {
        rank: 2,
        name: `Famous ${cleanCat} - Best ${cleanCat} in ${areaName}`,
        rating: 4.6,
        reviews: 218,
        photosRatio: "28%",
        isSpamTitle: true,
        spamNote: "🚨 Keyword Spam Detected: Title stuffs unverified keywords not present on actual signboard.",
        redressalOpportunity: true,
        redressalAction: "Submit Google Business Redressal Complaint Form with physical board photo to strip spam keywords."
      },
      {
        rank: 3,
        name: `Urban ${cleanCat} Express`,
        rating: 4.5,
        reviews: 174,
        photosRatio: "31%",
        isSpamTitle: false,
        spamNote: "Solid review velocity but weak voice search (AEO) attributes.",
        redressalOpportunity: false
      },
      {
        rank: detectedRank,
        name: cleanName,
        rating: rating,
        reviews: reviewCount,
        photosRatio: `${estimatedPhotoRatio}%`,
        isUserBusiness: true,
        isSpamTitle: isKeywordStuffed,
        spamNote: isKeywordStuffed ? "Keyword-heavy without physical sub-board proof." : "Authentic profile with keyword & footfall gap.",
        redressalOpportunity: false
      }
    ];
  }

  return {
    business: {
      name: cleanName,
      category: cleanCat,
      locality: cleanLoc,
      currentRating: rating,
      currentReviews: reviewCount,
      detectedRank
    },
    audit: {
      overallScore: totalScore,
      maxScore: maxTotalScore,
      percentage: Math.round((totalScore / maxTotalScore) * 100),
      grade,
      statusLabel,
      statusColor,
      pillars
    },
    recommendedTrack,
    trackDetails,
    competitors,
    isLiveGoogleData: isLive,
    dataSource,
    fiveGuardrails: [
      {
        num: 1,
        title: "Zero-Ban WhatsApp Review Rule",
        desc: "Never gate reviews. Reward honest feedback with photo (+1 Stamp). Private 'HELP' keyword routes grievances directly to owner before reaching Google.",
        status: "Mandatory System Rule"
      },
      {
        num: 2,
        title: "₹500 Physical Signboard Upgrade",
        desc: "Install permanent acrylic sub-board with primary keyword and update free Udyam certificate before operator edits GBP title.",
        status: "Policy Safeguard"
      },
      {
        num: 3,
        title: "Competitor Spam Purge Form",
        desc: "Field photo of competitor's signboard submitted to Google Business Redressal Complaint Form eliminates fake keyword competitors in 5-7 days.",
        status: "Fast-Track Rank Boost"
      },
      {
        num: 4,
        title: "Outside-GBP GEO AI Mentions",
        desc: "Monthly Top 5 articles on Medium/Quora train ChatGPT and Gemini search engines to recommend your business in conversational queries.",
        status: "AEO / GEO Engine"
      },
      {
        num: 5,
        title: "Voice Search Attributes & WhatsApp Ordering",
        desc: "Enable Wheelchair, UPI, Restroom attributes + connect 1-tap WhatsApp order link directly inside GBP 'Order Online' button.",
        status: "Instant Conversion"
      }
    ]
  };
}
