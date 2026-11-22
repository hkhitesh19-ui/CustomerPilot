import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { proofId, action, reviewedBy } = body;

    if (!proofId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "proofId and valid action (APPROVE|REJECT) are required" }, { status: 400 });
    }

    const proof = await db.instagramStoryProof.findUnique({
      where: { id: proofId },
      include: { customer: true, merchant: true }
    });

    if (!proof) {
      return NextResponse.json({ error: "Proof record not found" }, { status: 404 });
    }

    if (proof.status !== "PENDING") {
      return NextResponse.json({ error: `Proof already ${proof.status.toLowerCase()}` }, { status: 409 });
    }

    if (action === "REJECT") {
      const updated = await db.instagramStoryProof.update({
        where: { id: proofId },
        data: {
          status: "REJECTED",
          reviewedBy: reviewedBy || "Cashier Counter",
          reviewedAt: new Date()
        }
      });
      return NextResponse.json({ success: true, proof: updated });
    }

    // Action === "APPROVE"
    const stampsToAward = proof.stamps || 2;
    const template = await db.stampCard.findFirst({
      where: { merchantId: proof.merchantId, active: true }
    });

    if (!template) {
      return NextResponse.json({ error: "Active stamp card not found for merchant" }, { status: 400 });
    }

    let finalCollected = 0;
    let cardCompleted = false;

    await db.$transaction(async (tx) => {
      let card = await tx.customerStampCard.findFirst({
        where: { customerId: proof.customerId, stampCardId: template.id, completed: false, redeemed: false },
        orderBy: { createdAt: "desc" }
      });

      if (!card) {
        card = await tx.customerStampCard.create({
          data: {
            customerId: proof.customerId,
            stampCardId: template.id,
            merchantId: proof.merchantId,
            stampsCollected: 0
          }
        });
      }

      for (let i = 0; i < stampsToAward; i++) {
        await tx.stamp.create({
          data: {
            customerId: proof.customerId,
            merchantId: proof.merchantId,
            stampCardId: template.id,
            customerStampCardId: card.id,
            source: "instagram_story_proof"
          }
        });
      }

      const required = template.stampsRequired || 10;
      const totalNew = card.stampsCollected + stampsToAward;

      if (totalNew >= required) {
        cardCompleted = true;
        await tx.customerStampCard.update({
          where: { id: card.id },
          data: { stampsCollected: required, completed: true }
        });
        finalCollected = required;

        const overflow = totalNew - required;
        if (overflow > 0) {
          await tx.customerStampCard.create({
            data: {
              customerId: proof.customerId,
              stampCardId: template.id,
              merchantId: proof.merchantId,
              stampsCollected: overflow
            }
          });
          finalCollected = overflow;
        }
      } else {
        await tx.customerStampCard.update({
          where: { id: card.id },
          data: { stampsCollected: totalNew }
        });
        finalCollected = totalNew;
      }

      await tx.customer.update({
        where: { id: proof.customerId },
        data: { lifetimeStamps: { increment: stampsToAward } }
      });

      await tx.instagramStoryProof.update({
        where: { id: proofId },
        data: {
          status: "APPROVED",
          reviewedBy: reviewedBy || "Cashier Counter",
          reviewedAt: new Date()
        }
      });
    });

    // Send WhatsApp notification
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in";
    const walletUrl = `${appUrl}/q/wallet/${proof.customerId}`;
    const required = template.stampsRequired || 10;
    const remaining = Math.max(0, required - finalCollected);

    const msg =
      `🎉 *Instagram Story Verified!* 📸\n\n` +
      `Your story tag has been approved by the store!\n\n` +
      `🎁 *+${stampsToAward} Bonus Stamps Credited!* (Wallet: ${finalCollected} / ${required})\n` +
      `🎯 *Goal:* ${template.rewardName || "FREE Reward"}${cardCompleted ? " — 🏆 *REWARD UNLOCKED!*" : ` (${remaining} more needed)`}\n\n` +
      `📱 *View Your Live Stamp Card:*\n${walletUrl}`;

    await sendCentralWhatsAppMessage({
      merchantId: proof.merchantId,
      toPhone: proof.phone,
      text: msg,
      template: "instagram_story_manual_approved",
      customerId: proof.customerId
    }).catch((e) => console.error("[Instagram Approval WhatsApp Error]:", e.message));

    return NextResponse.json({
      success: true,
      status: "APPROVED",
      stampsAwarded: stampsToAward,
      finalCollected
    });
  } catch (error: any) {
    console.error("[Approve Proof Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to approve proof" }, { status: 500 });
  }
}

// GET endpoint to list pending proofs for merchant dashboard
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");

    if (!merchantId) {
      return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
    }

    const proofs = await db.instagramStoryProof.findMany({
      where: {
        merchantId,
        status: "PENDING"
      },
      include: {
        customer: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json({ success: true, proofs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
