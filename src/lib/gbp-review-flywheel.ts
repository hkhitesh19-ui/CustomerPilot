/**
 * src/lib/gbp-review-flywheel.ts
 * 
 * CustomerPilot B2B Merchant-to-CustomerPilot Review Flywheel
 * 
 * Automatically identifies active merchants who reached retention milestones
 * (e.g. 25/50 reviews, completed trial, high stamp volume) and compiles
 * tailored WhatsApp invitations inviting them to review CustomerPilot on Google Maps.
 */

import { db } from "@/lib/db";

export interface MerchantReviewCandidate {
  merchantId: string;
  name: string;
  ownerName: string | null;
  whatsappPhone: string | null;
  reviewCount: number;
  totalStampsAwarded: number;
  milestoneReason: string;
  customerPilotReviewUrl: string;
  suggestedWhatsAppMessage: string;
}

export async function getEligibleMerchantsForCustomerPilotReview(): Promise<MerchantReviewCandidate[]> {
  const merchants = await db.merchant.findMany({
    where: {
      status: "active",
      id: { not: "customerpilot-hq" },
    },
    include: {
      reviews: { where: { rating: 5 } },
      Stamp: true,
    },
    take: 20,
  });

  const candidates: MerchantReviewCandidate[] = [];
  const cpReviewUrl = "https://customerpilot.in/review?m=customerpilot-hq";

  for (const m of merchants) {
    const revCount = m.reviews.length;
    const stampCount = m.Stamp.length;

    let milestone = "";
    if (revCount >= 10) {
      milestone = `${revCount}+ Google 5-Star Reviews Achieved`;
    } else if (stampCount >= 20) {
      milestone = `${stampCount}+ Customer Loyalty Stamps Awarded`;
    } else {
      milestone = `Active CustomerPilot Merchant Partner`;
    }

    const greeting = m.ownerName ? `Namaste ${m.ownerName} ji` : `Namaste ${m.name} Team`;
    const message = 
      `${greeting}! 🎉\n\n` +
      `Aapke store ne CustomerPilot ke sath *${milestone}* ka milestone complete kiya hai! ✨\n\n` +
      `Kya aap Google Maps par CustomerPilot ke liye apna 10-second authentic merchant review share karenge? Isse hum jaise local software builders ko bohot support milta hai.\n\n` +
      `AI ne aapke liye review draft ready kiya hai (tap karke direct post karein):\n` +
      `👉 ${cpReviewUrl}\n\n` +
      `Thank you for growing with CustomerPilot! 🚀`;

    candidates.push({
      merchantId: m.id,
      name: m.name,
      ownerName: m.ownerName,
      whatsappPhone: m.whatsappPhone,
      reviewCount: revCount,
      totalStampsAwarded: stampCount,
      milestoneReason: milestone,
      customerPilotReviewUrl: cpReviewUrl,
      suggestedWhatsAppMessage: message,
    });
  }

  return candidates;
}
