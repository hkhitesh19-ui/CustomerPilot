import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEligibleMerchantsForCustomerPilotReview } from "@/lib/gbp-review-flywheel";
import { buildTuesdayProductPost, buildThursdayReviewPost, buildSaturdayOfferPost, getUpcomingScheduleDates } from "@/lib/gbp-post-generator";

export async function GET(req: NextRequest) {
  try {
    const cpMerchant = await db.merchant.findUnique({
      where: { id: "customerpilot-hq" },
      include: {
        merchantGoogleConnections: true,
        gbpChecklistItems: true,
        gbpPosts: {
          orderBy: { scheduledDate: "desc" },
          take: 6,
        },
      },
    });

    if (!cpMerchant) {
      return NextResponse.json({ success: false, error: "CustomerPilot HQ profile not found. Please run seed script." }, { status: 404 });
    }

    // Get eligible merchants for review pipeline
    const eligibleMerchants = await getEligibleMerchantsForCustomerPilotReview();

    // Checklist stats
    const totalChecklist = cpMerchant.gbpChecklistItems.length;
    const doneChecklist = cpMerchant.gbpChecklistItems.filter(i => i.isDone).length;
    const checklistProgress = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        merchant: {
          id: cpMerchant.id,
          name: cpMerchant.name,
          category: cpMerchant.category,
          city: cpMerchant.city,
          address: cpMerchant.address,
          whatsappPhone: cpMerchant.whatsappPhone,
          googleReviewLink: cpMerchant.googleReviewLink,
          baselineRating: cpMerchant.baselineRating,
          baselineReviewCount: cpMerchant.baselineReviewCount,
          gbpServiceTrack: cpMerchant.gbpServiceTrack,
          gbpProfileStatus: cpMerchant.gbpProfileStatus,
          checklistProgress,
          doneChecklist,
          totalChecklist,
        },
        googleConnection: cpMerchant.merchantGoogleConnections,
        checklist: cpMerchant.gbpChecklistItems,
        posts: cpMerchant.gbpPosts,
        eligibleReviewers: eligibleMerchants,
      },
    });
  } catch (err: any) {
    console.error("[SelfGbpOperations] GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === "GENERATE_WEEKLY_POSTS") {
      const cpMerchant = await db.merchant.findUnique({
        where: { id: "customerpilot-hq" },
      });
      if (!cpMerchant) {
        return NextResponse.json({ success: false, error: "CustomerPilot HQ merchant not found." }, { status: 404 });
      }

      const schedule = getUpcomingScheduleDates(new Date());

      const tuePost = await buildTuesdayProductPost(cpMerchant, schedule.tuesday);
      const thuPost = await buildThursdayReviewPost(cpMerchant, schedule.thursday);
      const satPost = await buildSaturdayOfferPost(cpMerchant, schedule.saturday);

      // Upsert into GbpPost
      const createdPosts: any[] = [];
      for (const p of [tuePost, thuPost, satPost]) {
        const postRecord = await db.gbpPost.create({
          data: {
            merchantId: cpMerchant.id,
            postType: p.postType,
            scheduledDay: p.scheduledDay,
            scheduledDate: p.scheduledDate,
            title: p.title,
            caption: p.caption,
            imageUrl: p.imageUrl,
            ctaType: p.ctaType,
            ctaUrl: p.ctaUrl,
            couponCode: p.couponCode,
            offerStartDate: p.offerStartDate,
            offerEndDate: p.offerEndDate,
            status: "DRAFT",
          },
        });
        createdPosts.push(postRecord);
      }

      return NextResponse.json({
        success: true,
        message: "Successfully generated CustomerPilot Weekly 3-Posts!",
        posts: createdPosts,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("[SelfGbpOperations] POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
