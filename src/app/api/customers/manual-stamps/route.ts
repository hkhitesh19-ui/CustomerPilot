import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedMerchant } from "@/lib/api";
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service";

const IG_REASON_PREFIX = "Instagram Follow / Story Reward";
class InstagramBonusAlreadyGiven extends Error {}

export async function POST(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized: Merchant session required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { customerId, phone, stamps = 1, reason = "Manual merchant adjustment" } = body;

    const count = Math.max(1, Math.min(20, Math.floor(Number(stamps) || 1)));

    // Find customer by customerId or phone
    let customer: any = null;
    if (customerId) {
      customer = await db.customer.findFirst({
        where: { id: customerId, merchantId: merchant.id }
      });
    } else if (phone) {
      const cleanPhone = String(phone).replace(/[^0-9]/g, "");
      customer = await db.customer.findFirst({
        where: {
          merchantId: merchant.id,
          OR: [
            { phone: cleanPhone },
            { phone: cleanPhone.startsWith("91") ? cleanPhone.slice(2) : `91${cleanPhone}` }
          ]
        }
      });
    }

    if (!customer) {
      return NextResponse.json({ error: "Customer not found for this store" }, { status: 404 });
    }

    // Find active stamp card template
    let template = await db.stampCard.findFirst({
      where: { merchantId: merchant.id, active: true },
      orderBy: { createdAt: "asc" }
    });
    if (!template) {
      template = await db.stampCard.findFirst({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: "asc" }
      });
    }
    if (!template) {
      return NextResponse.json({ error: "No loyalty card rules configured for merchant" }, { status: 400 });
    }

    const stampsRequired = template.stampsRequired || 10;

    // Atomic transaction
    const result = await db.$transaction(async (tx) => {
      if (String(reason).startsWith(IG_REASON_PREFIX)) {
        // row lock: two simultaneous requests for same customer run one after another
        await tx.customer.update({
          where: { id: customer.id },
          data: { lastActiveAt: new Date() }
        });
        const alreadyGiven = await tx.stamp.findFirst({
          where: {
            merchantId: merchant.id,
            customerId: customer.id,
            source: "manual_override",
            notes: { startsWith: IG_REASON_PREFIX }
          },
          select: { id: true }
        });
        if (alreadyGiven) throw new InstagramBonusAlreadyGiven();
      }
      // Find or create active CustomerStampCard
      let card = await tx.customerStampCard.findFirst({
        where: {
          customerId: customer.id,
          stampCardId: template.id,
          completed: false,
          redeemed: false
        },
        orderBy: { createdAt: "desc" }
      });

      if (!card) {
        card = await tx.customerStampCard.create({
          data: {
            customerId: customer.id,
            stampCardId: template.id,
            merchantId: merchant.id,
            stampsCollected: 0
          }
        });
      }

      // Create Stamp entries
      const stampData = [];
      for (let i = 0; i < count; i++) {
        stampData.push({
          customerId: customer.id,
          stampCardId: template.id,
          customerStampCardId: card.id,
          merchantId: merchant.id,
          source: "manual_override",
          notes: String(reason).substring(0, 200)
        });
      }
      await tx.stamp.createMany({ data: stampData });

      const newCollected = card.stampsCollected + count;
      const isCompleted = newCollected >= stampsRequired;

      const updatedCard = await tx.customerStampCard.update({
        where: { id: card.id },
        data: {
          stampsCollected: Math.min(newCollected, stampsRequired),
          completed: isCompleted
        }
      });

      // Update customer lifetime stats
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          lifetimeStamps: { increment: count },
          lastActiveAt: new Date()
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          merchantId: merchant.id,
          actorType: "MERCHANT",
          actorId: merchant.id,
          action: "MANUAL_STAMP_OVERRIDE",
          entity: "Stamp",
          metadata: JSON.stringify({
            customerId: customer.id,
            customerPhone: customer.phone,
            stampsAwarded: count,
            reason,
            newBalance: updatedCard.stampsCollected,
            isCompleted
          })
        }
      });

      return {
        card: updatedCard,
        isCompleted,
        stampsAwarded: count
      };
    });

    // Send WhatsApp notification to customer
    const cleanStoreName = merchant.name.split("-")[0].trim();
    const walletUrl = `https://customerpilot.in/q/wallet/${customer.id}`;
    const rewardNotice = result.isCompleted
      ? `\n\n🎉 *BADHAI HO! Aapka VIP Reward Ready Hai!*\nFree Treat: *${template.rewardName || "Free Reward"}* 🎂`
      : ``;

    const waText = `⭐ *${cleanStoreName} — Bonus Stamps Added!* 🎁\n\n` +
      `Hey ${customer.name || "VIP Member"}! Aapke account me store team ne *+${count} Stamp(s)* credit kar diye hain!\n\n` +
      `📋 *Reason:* ${reason}\n` +
      `🎟️ *Current Wallet Balance:* ${result.card.stampsCollected} / ${stampsRequired} Stamps` +
      rewardNotice + `\n\n` +
      `👇 *Apna Live Stamp Card check karein:*\n👉 ${walletUrl}`;

    sendCentralWhatsAppMessage({
      merchantId: merchant.id,
      toPhone: customer.phone,
      text: waText,
      template: "manual_stamp_credited",
      customerId: customer.id
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      stampsAwarded: count,
      newBalance: result.card.stampsCollected,
      stampsRequired,
      isCompleted: result.isCompleted,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone
      }
    });
  } catch (error: any) {
    if (error instanceof InstagramBonusAlreadyGiven) {
      return NextResponse.json(
        { error: "Instagram bonus already given to this customer" },
        { status: 409 }
      );
    }
    console.error("[Manual Stamp Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to award stamps" }, { status: 500 });
  }
}
