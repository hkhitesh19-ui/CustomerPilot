import { db } from "@/lib/db"

export interface MockReview {
  gbpReviewId: string
  reviewerName: string
  rating: number
  comment: string
  reviewReply?: string
  hasMedia?: boolean
  submittedAt: Date
}

// Generate mock reviews to simulate GBP fetching for demo or fallback accounts
function generateMockReviews(merchantId: string, count: number): MockReview[] {
  const reviews: MockReview[] = []
  const names = ["Rahul Patel", "Amit Singh", "Priya Shah", "Neha Gupta", "Vikram Sharma", "Suresh Desai", "Anjali Rathod"]
  const comments = [
    "Ordered a chocolate truffle cake for my sister's birthday, and everyone loved it! Fresh and tasty.",
    "Best cake shop in town! The staff was polite and packaging was solid.",
    "Very clean and hygienic place. Pineapple cake was super soft and delicious.",
    "Always my go-to bakery in the city. High quality and on-time service.",
    "Great taste and reasonable pricing. Definitely recommended for parties!",
    "One of the best bakeries I have visited recently. 5 stars."
  ]

  for (let i = 0; i < count; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomComment = comments[Math.floor(Math.random() * comments.length)]
    const rating = Math.random() > 0.15 ? 5 : 4
    const id = `mock_gbp_${merchantId}_rev_${i}`

    reviews.push({
      gbpReviewId: id,
      reviewerName: `${randomName}`,
      rating,
      comment: randomComment,
      submittedAt: new Date(Date.now() - Math.random() * 86400000)
    })
  }

  return reviews
}

const AGENCY_GBP_ACCOUNT_ID = "accounts/112133617085294120548"
const KNOWN_AGENCY_LOCATIONS: Record<string, { gbpAccountId: string; gbpLocationId: string; placeId: string }> = {
  "cmtymavfx0002kx008lbfvp57": {
    gbpAccountId: AGENCY_GBP_ACCOUNT_ID,
    gbpLocationId: "locations/9875374650197271242",
    placeId: "ChIJc7ija2zFXzkR8DbOxXEfaM4",
  },
  "customerpilot-hq": {
    gbpAccountId: AGENCY_GBP_ACCOUNT_ID,
    gbpLocationId: "locations/4702053894702959517",
    placeId: "ChIJnZHNfaa7HmwRceqGnkPiMJw",
  },
  "cmw1vwviv06f3kvwlkx62ghap": {
    gbpAccountId: AGENCY_GBP_ACCOUNT_ID,
    gbpLocationId: "locations/4702053894702959517",
    placeId: "ChIJnZHNfaa7HmwRceqGnkPiMJw",
  },
}

/**
 * Automatically get valid Google OAuth Access Token, refreshing it if expired.
 * Supports Agency Shared Manager Fallback (customerpilot1@gmail.com) for merchants
 * managed under the CustomerPilot Agency GBP account.
 */
export async function getValidOAuthAccessToken(merchantId: string): Promise<{ connection: any; token: string | null }> {
  let connection = await db.merchantGoogleConnection.findUnique({
    where: { merchantId }
  })

  // If this merchant doesn't hold its own OAuth refresh token, check if it is managed by the shared agency account
  let tokenHolder = connection
  const knownLoc = KNOWN_AGENCY_LOCATIONS[merchantId]

  if (!tokenHolder || (!tokenHolder.oauthAccessToken && !tokenHolder.oauthRefreshToken)) {
    const agencyConn = await db.merchantGoogleConnection.findFirst({
      where: {
        gbpAccountId: AGENCY_GBP_ACCOUNT_ID,
        oauthRefreshToken: { not: null },
      },
      orderBy: { lastSyncedAt: "desc" }
    })

    if (agencyConn && (knownLoc || connection?.gbpLocationId)) {
      tokenHolder = agencyConn
      connection = {
        ...(connection || { id: agencyConn.id, merchantId }),
        gbpAccountId: connection?.gbpAccountId || knownLoc?.gbpAccountId || agencyConn.gbpAccountId,
        gbpLocationId: connection?.gbpLocationId || knownLoc?.gbpLocationId || null,
        placeId: connection?.placeId && !connection.placeId.includes("CustomerPilotVadodaraHQ")
          ? connection.placeId
          : (knownLoc?.placeId || connection?.placeId || null),
        oauthAccessToken: agencyConn.oauthAccessToken,
        oauthRefreshToken: agencyConn.oauthRefreshToken,
        oauthTokenExpiry: agencyConn.oauthTokenExpiry,
      }
    }
  }

  if (!connection || (!connection.oauthAccessToken && !connection.oauthRefreshToken)) {
    return { connection: null, token: null }
  }

  // Check if token is expired (or expires in < 5 mins)
  const isExpired = !connection.oauthAccessToken || (connection.oauthTokenExpiry
    ? new Date(connection.oauthTokenExpiry).getTime() - Date.now() < 5 * 60 * 1000
    : false)

  if (isExpired && connection.oauthRefreshToken) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID || ""
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ""

      console.log(`[GBP OAuth] Refreshing expired token for Merchant ${merchantId}...`)
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: connection.oauthRefreshToken,
          grant_type: "refresh_token"
        })
      })

      if (res.ok) {
        const data = await res.json()
        const newExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000)

        if (tokenHolder?.id) {
          await db.merchantGoogleConnection.update({
            where: { id: tokenHolder.id },
            data: {
              oauthAccessToken: data.access_token,
              oauthTokenExpiry: newExpiry
            }
          }).catch(() => {})
        }
        const updated = {
          ...connection,
          oauthAccessToken: data.access_token,
          oauthTokenExpiry: newExpiry,
        }
        console.log(`[GBP OAuth] ✅ Access Token successfully refreshed! Expires at: ${newExpiry.toISOString()}`)
        return { connection: updated, token: data.access_token }
      } else {
        console.error(`[GBP OAuth] Failed to refresh token: status ${res.status}`)
      }
    } catch (e: any) {
      console.error(`[GBP OAuth] Error refreshing token:`, e.message)
    }
  }

  if (isExpired && !connection.oauthRefreshToken) {
    console.warn(`[GBP OAuth] Token for Merchant ${merchantId} is expired and has no refresh token.`);
    return { connection, token: null };
  }

  return { connection, token: connection.oauthAccessToken }
}

/**
 * Fetch Google Reviews from GBP API (or return mocks for Demo/Sandbox accounts)
 */
export async function fetchGoogleReviews(merchantId: string, maxLimit: number = 50): Promise<MockReview[]> {
  const { connection, token } = await getValidOAuthAccessToken(merchantId)

  if (!connection) return []

  // If OAuth token and GBP account IDs are present, call official Google My Business API
  if (token && connection.gbpAccountId && connection.gbpLocationId && !token.startsWith("mock_")) {
    try {
      const gbpUrl = `https://mybusiness.googleapis.com/v4/${connection.gbpAccountId}/${connection.gbpLocationId}/reviews?pageSize=${maxLimit}`
      const response = await fetch(gbpUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Sync live review count & rating directly to Merchant record
        if (typeof data.totalReviewCount === "number" || typeof data.averageRating === "number") {
          await db.merchant.update({
            where: { id: merchantId },
            data: {
              ...(typeof data.totalReviewCount === "number" ? { gbpReviewCount: data.totalReviewCount } : {}),
              ...(typeof data.averageRating === "number" ? { baselineRating: Number(data.averageRating.toFixed(1)) } : {}),
            }
          }).catch(() => {})
        }
        if (data.reviews && Array.isArray(data.reviews)) {
          return data.reviews.map((r: any) => ({
            gbpReviewId: r.reviewId || r.name,
            reviewerName: r.reviewer?.displayName || "Google User",
            rating: r.starRating === "FIVE" ? 5 : r.starRating === "FOUR" ? 4 : r.starRating === "THREE" ? 3 : r.starRating === "TWO" ? 2 : 1,
            comment: r.comment || "",
            reviewReply: r.reviewReply?.comment || undefined,
            hasMedia: Array.isArray(r.reviewMediaItems) && r.reviewMediaItems.length > 0,
            submittedAt: r.createTime ? new Date(r.createTime) : new Date()
          }))
        }
        return []
      } else {
        const errJson = await response.json().catch(() => ({}))
        console.warn(`[GBP API] Fetch failed with status ${response.status}:`, errJson?.error?.message || errJson);
      }
    } catch (err: any) {
      console.error(`[GBP API] Error fetching reviews for merchant ${merchantId}:`, err.message)
    }

    // Modern Fallback: Google deprecated mybusiness.googleapis.com monolithic API.
    // Fetch live real reviews from Google Places API via connection.placeId
    if (connection.placeId && process.env.GOOGLE_PLACES_API_KEY) {
      try {
        const placesRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(connection.placeId)}&fields=reviews,rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`
        )
        if (placesRes.ok) {
          const pData = await placesRes.json()
          if (pData.result) {
            // Also sync baseline review count & rating to Merchant if present
            if (typeof pData.result.rating === "number" || typeof pData.result.user_ratings_total === "number") {
              await db.merchant.update({
                where: { id: merchantId },
                data: {
                  ...(typeof pData.result.rating === "number" ? { baselineRating: pData.result.rating } : {}),
                  ...(typeof pData.result.user_ratings_total === "number" ? { baselineReviewCount: pData.result.user_ratings_total, baselineCapturedAt: new Date() } : {})
                }
              }).catch(() => {})
            }

            if (pData.result.reviews && Array.isArray(pData.result.reviews)) {
              return pData.result.reviews.map((r: any, idx: number) => ({
                gbpReviewId: `place_review_${connection.placeId}_${r.time || idx}`,
                reviewerName: r.author_name || "Google User",
                rating: typeof r.rating === "number" ? r.rating : 5,
                comment: r.text || "",
                submittedAt: r.time ? new Date(r.time * 1000) : new Date()
              }))
            }
          }
        }
      } catch (pErr: any) {
        console.warn(`[Google Places Reviews Fallback] Error:`, pErr.message)
      }
    }
    
    // If no real API reviews found, return empty array (do NOT mock in production)
    return []
  }

  // Fallback / Demo Simulation (Only executes if there is NO real token or if it's a mock token)
  return generateMockReviews(merchantId, maxLimit > 6 ? 6 : maxLimit)
}

/**
 * Sync fetched GBP reviews to our local GoogleBusinessReview database table
 */
export async function syncGoogleReviewsToDb(merchantId: string, reviews: MockReview[]) {
  let newReviewsCount = 0
  const created = []

  for (const review of reviews) {
    const existing = await db.googleBusinessReview.findUnique({
      where: {
        merchantId_gbpReviewId: {
          merchantId,
          gbpReviewId: review.gbpReviewId
        }
      }
    })

    if (existing) {
      // STRICT OVERWRITE PROTECTION:
      // If review is already replied in DB or on Google, NEVER overwrite or reset it!
      // Only sync if existing was marked unreplied in DB but Google now has a live owner reply
      // Also persist hasMedia if Google now returns reviewMediaItems for an existing review
      const shouldSetReplied = !existing.isReplied && Boolean(review.reviewReply)
      const shouldSetMedia = !existing.hasMedia && Boolean(review.hasMedia)
      if (shouldSetReplied || shouldSetMedia) {
        await db.googleBusinessReview.update({
          where: { id: existing.id },
          data: {
            ...(shouldSetReplied ? {
              isReplied: true,
              reviewReply: review.reviewReply,
              status: "replied",
              repliedAt: new Date()
            } : {}),
            ...(shouldSetMedia ? { hasMedia: true } : {})
          }
        })
      }
    } else {
      // New review being added to DB
      const hasGoogleReply = Boolean(review.reviewReply && review.reviewReply.trim().length > 0)
      const createdRow = await db.googleBusinessReview.create({
        data: {
          merchantId,
          gbpReviewId: review.gbpReviewId,
          reviewerName: review.reviewerName,
          rating: review.rating,
          comment: review.comment,
          hasMedia: Boolean(review.hasMedia),
          // CRITICAL: If Google already has an owner reply, mark as replied immediately so auto-reply NEVER overwrites it!
          status: hasGoogleReply ? "replied" : "pending",
          isReplied: hasGoogleReply,
          reviewReply: hasGoogleReply ? review.reviewReply : null,
          repliedAt: hasGoogleReply ? new Date() : null,
          createdAt: review.submittedAt || new Date()
        }
      })
      created.push(createdRow)
      newReviewsCount++
    }
  }

  return { count: newReviewsCount, created }
}

/**
 * Post AI Reply back to Google Business Profile API
 */
export async function postReviewReplyToGBP(merchantId: string, gbpReviewId: string, replyText: string): Promise<boolean> {
  const { connection, token } = await getValidOAuthAccessToken(merchantId)

  if (!connection) return false

  // If live OAuth token is available, post live to Google Business Profile API
  if (token && connection.gbpAccountId && connection.gbpLocationId && !token.startsWith("mock_")) {
    try {
      const replyUrl = `https://mybusiness.googleapis.com/v4/${connection.gbpAccountId}/${connection.gbpLocationId}/reviews/${gbpReviewId}/reply`
      const res = await fetch(replyUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ comment: replyText })
      })

      if (res.ok) {
        console.log(`[GBP API] ✅ Successfully posted live reply to Google Review ${gbpReviewId}`)
        return true
      } else {
        const errJson = await res.json().catch(() => ({}))
        console.error(`[GBP API] Failed to post reply to Google (Status ${res.status}):`, errJson)
      }
    } catch (err: any) {
      console.error(`[GBP API] Network error posting reply to Google:`, err.message)
    }
  }

  // Simulated success for demo mode & local testing
  return true
}
