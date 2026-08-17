// ════════════════════════════════════════════════════════════════════════════════
// ⚠️ ARCHITECTURAL RULE — SINGLE SOURCE OF TRUTH FOR BONUS STAMPS:
// Advance Bonus Stamps are ONLY awarded inside the `isCardFinished` block when a customer
// completes their Previous Loyalty Level / Card (Next Level Kickstart Bonus).
// DO NOT add spend-threshold bonus stamp logic or multipliers anywhere else in this file.
// ════════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleGoogleReviewRequest } from '@/lib/review-scheduler';
import { hasModule } from '@/lib/feature-gate';
import { getCompiledTemplate } from "@/lib/template-engine";
import { resolveLoyaltyCategoryName } from "@/lib/loyalty-category-service";
import { getVipTierForSpend, VIP_TIER_LABELS } from "@/lib/vip-engine";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY

async function sendWhatsAppNotification(merchantId: string, toPhone: string, text: string, templateKey: string = "STAMP_AWARDED") {
  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      console.error("[Award API] EVOLUTION_API_URL or EVOLUTION_API_KEY not configured — skipping notification dispatch")
      return { ok: false, error: "Evolution API credentials not configured" }
    }
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    const defaultInstance = process.env.EVOLUTION_INSTANCE_NAME || "CustomerPilot_Main"
    const instanceName = merchant?.whatsappInstanceName || (merchant?.whatsappPhone ? `CP_M${merchant.whatsappPhone.replace(/\D/g, "")}` : defaultInstance)
    
    let res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({
        number: toPhone,
        text: text
      })
    })

    if (!res.ok && instanceName !== defaultInstance) {
      console.log(`[Award API] Merchant instance ${instanceName} failed. Falling back to ${defaultInstance}`);
      res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${defaultInstance}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
        body: JSON.stringify({ number: toPhone, text: text })
      })
    }

    const data = await res.json().catch(() => ({}))
    let errorMsg = null;
    if (!res.ok) {
        errorMsg = data.message || data.error || `HTTP ${res.status}`;
    }
    
    await db.whatsAppMessage.create({
      data: {
        merchantId,
        toPhone,
        template: templateKey,
        body: text.substring(0, 500),
        status: res.ok ? "sent" : "failed",
        sentAt: res.ok ? new Date() : null,
        metaMessageId: data?.key?.id || `stamp_${Date.now()}`,
        errorMessage: errorMsg
      }
    }).catch(() => {})
    
    console.log(`[Award API] ✉️ WhatsApp notification (${templateKey}) processed for +${toPhone}`)
  } catch (e: any) {
    console.error("[Award API] WhatsApp send error:", e.message)
  }
}

export async function POST(req: Request) {
  try {
    const merchantId = req.headers.get('x-merchant-id');
    if (!merchantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { waitingCustomerId, amount, productName, forceProceed } = body;

    if (!waitingCustomerId || amount === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    // 1. Fetch WaitingCustomer and verify ownership
    const waitingCustomer = await db.waitingCustomer.findUnique({
      where: { id: waitingCustomerId },
      include: { customer: true }
    });

    if (!waitingCustomer || waitingCustomer.merchantId !== merchantId) {
      return NextResponse.json({ success: false, error: 'Waiting customer not found' }, { status: 404 });
    }

    if (waitingCustomer.status !== 'waiting') {
      return NextResponse.json({ success: false, error: 'Customer has already been processed' }, { status: 400 });
    }

    // 2. Fetch active StampCard and Merchant for merchant
    const stampCard = await db.stampCard.findFirst({
      where: { merchantId, active: true }
    });
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } });

    if (!stampCard || !merchant) {
      return NextResponse.json({ success: false, error: 'No active reward program or merchant found' }, { status: 400 });
    }

    const stampValue = stampCard.stampValue || 500;
    const stampsToAward = Math.floor(parsedAmount / stampValue);
    const remainder = parsedAmount % stampValue;
    const shortfall = stampValue - remainder;

    // 3. Smart Upsell Check: If bill earns 0 stamps (or is below next threshold) and forceProceed is false
    if (stampsToAward === 0 && !forceProceed) {
      return NextResponse.json({
        success: false,
        isUpsellTriggered: true,
        shortfall,
        nextThreshold: stampValue,
        suggestedAmount: parsedAmount + shortfall,
        error: `Only ₹${shortfall} away from 1 Stamp! Suggest adding an item worth ₹${shortfall} to earn a stamp.`
      }, { status: 422 });
    }

    let visitNumber = 1;

    // 4. Perform database transaction
    const transactionResult = await db.$transaction(async (tx) => {
      // Mark waiting customer as completed
      await tx.waitingCustomer.update({
        where: { id: waitingCustomerId },
        data: {
          status: 'completed',
          claimedAt: new Date(),
          amount: parsedAmount,
          stampsAwarded: stampsToAward
        }
      });

      // Staff reference
      let staff = await tx.staff.findFirst({ where: { merchantId } });
      if (!staff) {
        staff = await tx.staff.create({
          data: {
            merchantId,
            name: 'System Auto',
            role: 'system'
          }
        });
      }

      // Calculate visit number (Rule: Save Visit Number)
      const previousBills = await tx.bill.count({
        where: { merchantId, customerId: waitingCustomer.customerId, status: 'paid' }
      });
      visitNumber = previousBills + 1;

      // Construct bill notes with Product Name & Visit info per Requirements.txt Rules
      const noteDetails = [
        productName ? `Product: ${productName}` : null,
        `Visit #${visitNumber}`,
        `Approved by: ${staff.name}`
      ].filter(Boolean).join(' | ');

      const bill = await tx.bill.create({
        data: {
          merchantId,
          customerId: waitingCustomer.customerId,
          issuedById: staff.id,
          number: `INV-${Date.now().toString().slice(-6)}`,
          amount: parsedAmount,
          stampsAwarded: stampsToAward,
          status: 'paid',
          notes: noteDetails
        }
      });

      // Calculate Old VIP Tier before updating spend
      const oldTier = getVipTierForSpend(waitingCustomer.customer.lifetimeSpend || 0);

      // Update Customer Lifetime Spend & Stamps
      const updatedCustomer = await tx.customer.update({
        where: { id: waitingCustomer.customerId },
        data: {
          lifetimeSpend: { increment: parsedAmount },
          lifetimeStamps: { increment: stampsToAward },
          lastActiveAt: new Date()
        }
      });
      
      // Calculate New VIP Tier after update
      const newTier = getVipTierForSpend(updatedCustomer.lifetimeSpend);
      let isUpgraded = false;

      // Check if upgraded to a strictly higher tier (using minLifetimeSpend as rank)
      if (newTier.minLifetimeSpend > oldTier.minLifetimeSpend) {
        isUpgraded = true;
        // Update VIP tier name in customer record
        await tx.customer.update({
          where: { id: waitingCustomer.customerId },
          data: { vipTier: newTier.name }
        });
      }

      // 4. Update Customer Stamp Wallet & Handle Loyalty Cycle Completion
      let cycleCompletedInTx = false;
      let cycleVipBonusAwarded = 0;

      const configuredVipBonus = merchant.vipUpgradeBonusStamps || 0;

      for (let i = 0; i < stampsToAward; i++) {
        // Find or create active (uncompleted) card for customer
        let activeCard = await tx.customerStampCard.findFirst({
          where: { 
            merchantId, 
            customerId: waitingCustomer.customerId,
            stampCardId: stampCard.id,
            completed: false 
          }
        });

        if (!activeCard) {
          activeCard = await tx.customerStampCard.create({
            data: {
              merchantId,
              customerId: waitingCustomer.customerId,
              stampCardId: stampCard.id,
              stampsCollected: 0
            }
          });
        }

        // Add 1 POS stamp
        const newCount = activeCard.stampsCollected + 1;
        const isCardFinished = newCount >= stampCard.stampsRequired;

        await tx.customerStampCard.update({
          where: { id: activeCard.id },
          data: {
            stampsCollected: newCount,
            completed: isCardFinished
          }
        });

        await tx.stamp.create({
          data: {
            customerId: waitingCustomer.customerId,
            merchantId,
            stampCardId: stampCard.id,
            customerStampCardId: activeCard.id,
            billId: bill.id,
            source: 'POS'
          }
        });

        // 🌟 LOYALTY CYCLE FINISHED EVENT:
        // When previous loyalty level/card completes (stamp goal reached),
        // award configured Next Level Kickstart Bonus Stamps to pre-fund the next level!
        if (isCardFinished) {
          cycleCompletedInTx = true;

          // Automatically upgrade Customer Loyalty Level Category (Level 1: VIP -> Level 2: Silver -> Level 3: Gold...)
          const totalCompletedCards = await tx.customerStampCard.count({
            where: { merchantId, customerId: waitingCustomer.customerId, completed: true }
          });
          const nextCategoryName = resolveLoyaltyCategoryName(merchant.loyaltyCategoryNames, totalCompletedCards);
          await tx.customer.update({
            where: { id: waitingCustomer.customerId },
            data: { vipTier: nextCategoryName }
          });

          if (configuredVipBonus > 0) {
            // Create fresh new card for next level/cycle pre-funded with bonus stamps
            const nextCycleCard = await tx.customerStampCard.create({
              data: {
                merchantId,
                customerId: waitingCustomer.customerId,
                stampCardId: stampCard.id,
                stampsCollected: configuredVipBonus,
                completed: configuredVipBonus >= stampCard.stampsRequired
              }
            });

            for (let v = 0; v < configuredVipBonus; v++) {
              await tx.stamp.create({
                data: {
                  customerId: waitingCustomer.customerId,
                  merchantId,
                  stampCardId: stampCard.id,
                  customerStampCardId: nextCycleCard.id,
                  billId: bill.id,
                  source: 'LEVEL_UP_BONUS'
                }
              });
            }

            // Increment customer lifetime stamps for level completion bonus
            await tx.customer.update({
              where: { id: waitingCustomer.customerId },
              data: { lifetimeStamps: { increment: configuredVipBonus } }
            });

            cycleVipBonusAwarded += configuredVipBonus;
          }
        }
      }
      
      return { 
        isUpgraded, 
        vipBonusStamps: cycleVipBonusAwarded, 
        newTier, 
        cycleCompletedInTx,
        completedCardReward: stampCard.rewardName || "FREE Reward",
        completedCardStampsRequired: stampCard.stampsRequired || 7
      };
    });

    // 5. Send instant WhatsApp notification to customer (Day 1 / Day 4 Requirements.txt)
    if (waitingCustomer.customer?.phone) {
      const merchantName = merchant?.name || "our store";
      const { vipBonusStamps, newTier, cycleCompletedInTx, completedCardReward, completedCardStampsRequired } = transactionResult;
      const custName = waitingCustomer.customer.name || "there";

      if (cycleCompletedInTx) {
        // EVENT 1: CARD COMPLETED -> Send REWARD_UNLOCKED WhatsApp Notification!
        const rewardMsg = await getCompiledTemplate(merchantId, "REWARD_UNLOCKED", {
          customerName: custName.toUpperCase(),
          merchantName,
          requiredStamp: completedCardStampsRequired,
          visitNumber,
          rewardName: completedCardReward,
          couponCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        });
        sendWhatsAppNotification(merchantId, waitingCustomer.customer.phone, rewardMsg, "REWARD_UNLOCKED");

        // EVENT 2: NEXT LEVEL UNLOCKED -> If Next Level Kickstart Bonus was awarded, send LEVEL_COMPLETE WhatsApp Notification!
        if (vipBonusStamps > 0) {
          const levelMsg = await getCompiledTemplate(merchantId, "LEVEL_COMPLETE", {
            customerName: custName,
            merchantName,
            nextLevelName: VIP_TIER_LABELS[newTier.name as any] || newTier.name.toUpperCase(),
            kickstartStamps: vipBonusStamps.toString()
          });
          sendWhatsAppNotification(merchantId, waitingCustomer.customer.phone, levelMsg, "LEVEL_COMPLETE");
        }
      } else {
        // STANDARD STAMP AWARDED (Card not completed yet)
        const customerCard = await db.customerStampCard.findFirst({
          where: { merchantId, customerId: waitingCustomer.customerId, stampCardId: stampCard.id, completed: false },
          orderBy: { createdAt: 'desc' }
        });

        const totalStamps = customerCard?.stampsCollected || stampsToAward;
        const stampsRequired = stampCard.stampsRequired || 7;
        const remaining = Math.max(0, stampsRequired - totalStamps);

        const stampMsg = await getCompiledTemplate(merchantId, "STAMP_EARNED", {
          customerName: custName,
          merchantName,
          visitNumber,
          stampCount: stampsToAward,
          totalStamps,
          requiredStamp: stampsRequired,
          rewardName: stampCard.rewardName || "FREE Reward",
          remainingStamps: remaining
        });

        sendWhatsAppNotification(merchantId, waitingCustomer.customer.phone, stampMsg, "STAMP_AWARDED");
      }

      // Schedule Google Review request only if merchant has REVIEWS module enabled
      if (hasModule(merchant, "REVIEWS")) {
        scheduleGoogleReviewRequest({
          merchantId,
          customerId: waitingCustomer.customerId,
        }).catch(e => console.error("[Award API] Review Scheduler Error:", e));
      }
    }

    return NextResponse.json({ 
      success: true, 
      stampsAwarded: stampsToAward,
      visitNumber,
      message: 'Reward processed successfully' 
    });

  } catch (error: any) {
    console.error("Reward Award Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
