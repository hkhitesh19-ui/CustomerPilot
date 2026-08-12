import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleGoogleReviewRequest } from '@/lib/review-scheduler';
import { getCompiledTemplate } from "@/lib/template-engine";
import { getVipTierForSpend, VIP_TIER_LABELS } from "@/lib/vip-engine";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "Evo_Api_Key_Secure_998877!"

async function sendWhatsAppNotification(merchantId: string, toPhone: string, text: string) {
  try {
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    const defaultInstance = process.env.EVOLUTION_INSTANCE_NAME || "CustomerPilot_Main"
    const instanceName = merchant?.whatsappInstanceName || (merchant?.whatsappPhone ? `CP_M${merchant.whatsappPhone.replace(/\\D/g, "")}` : defaultInstance)
    
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
        template: "STAMP_AWARDED",
        body: text.substring(0, 500),
        status: res.ok ? "sent" : "failed",
        sentAt: res.ok ? new Date() : null,
        metaMessageId: data?.key?.id || `stamp_${Date.now()}`,
        errorMessage: errorMsg
      }
    }).catch(() => {})
    
    console.log(`[Award API] ✉️ Stamp notification processed for +${toPhone}`)
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
      let vipBonusStamps = 0;
      let isUpgraded = false;

      // Check if upgraded to a strictly higher tier (using minLifetimeSpend as rank)
      if (newTier.minLifetimeSpend > oldTier.minLifetimeSpend) {
        isUpgraded = true;
        vipBonusStamps = merchant.vipUpgradeBonusStamps || 0;
        
        // Update VIP tier name in customer record
        await tx.customer.update({
          where: { id: waitingCustomer.customerId },
          data: { vipTier: newTier.name }
        });
      }

      // Total stamps to award = pos stamps + vip upgrade bonus
      const totalStampsToAward = stampsToAward + vipBonusStamps;

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
        // When previous loyalty cycle completes (stamp goal reached),
        // award configured VIP Upgrade Bonus Stamps to kickstart next cycle!
        if (isCardFinished) {
          cycleCompletedInTx = true;

          if (configuredVipBonus > 0) {
            // Create fresh new card for next cycle
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
                  source: 'VIP_BONUS'
                }
              });
            }

            // Increment customer lifetime stamps for VIP bonus
            await tx.customer.update({
              where: { id: waitingCustomer.customerId },
              data: { lifetimeStamps: { increment: configuredVipBonus } }
            });

            cycleVipBonusAwarded += configuredVipBonus;
          }
        }
      }

      // Handle standalone VIP Tier Upgrade bonus (if tier upgraded without card completion)
      if (isUpgraded && !cycleCompletedInTx && vipBonusStamps > 0) {
        let activeCard = await tx.customerStampCard.findFirst({
          where: { merchantId, customerId: waitingCustomer.customerId, stampCardId: stampCard.id, completed: false }
        });
        if (!activeCard) {
          activeCard = await tx.customerStampCard.create({
            data: { merchantId, customerId: waitingCustomer.customerId, stampCardId: stampCard.id, stampsCollected: 0 }
          });
        }
        await tx.customerStampCard.update({
          where: { id: activeCard.id },
          data: { stampsCollected: { increment: vipBonusStamps } }
        });
        for (let v = 0; v < vipBonusStamps; v++) {
          await tx.stamp.create({
            data: {
              customerId: waitingCustomer.customerId,
              merchantId,
              stampCardId: stampCard.id,
              customerStampCardId: activeCard.id,
              billId: bill.id,
              source: 'VIP_BONUS'
            }
          });
        }
      }
      
      return { isUpgraded, vipBonusStamps: cycleVipBonusAwarded || vipBonusStamps, newTier, cycleCompletedInTx };
    });

    // 5. Send instant WhatsApp notification to customer (Day 1 / Day 4 Requirements.txt)
    if (waitingCustomer.customer?.phone) {
      const merchantName = merchant?.name || "our store";
      // Ensure we get the ACTIVE (uncompleted) stamp card, or the most recent one if they just completed it
      const customerCard = await db.customerStampCard.findFirst({
        where: { merchantId, customerId: waitingCustomer.customerId, stampCardId: stampCard.id },
        orderBy: { createdAt: 'desc' }
      });
      // Handle the fact that transaction result is now returned
      const { isUpgraded, vipBonusStamps, newTier } = transactionResult;
      
      const totalStampsToAward = stampsToAward + vipBonusStamps;
      // We check if the customerCard is completed in THIS transaction.
      // `transactionResult` tells us they were upgraded, but we also want to know if the card completed.
      // Wait, `customerCard` fetched here is the most recently created card. 
      // If `totalStampsToAward > 0`, the transaction updated the card.
      const totalStamps = customerCard?.stampsCollected || totalStampsToAward;
      const stampsRequired = stampCard.stampsRequired || 10;
      const rewardName = stampCard.rewardName || "FREE 500gm Cake";
      const remaining = Math.max(0, stampsRequired - totalStamps);
      const custName = waitingCustomer.customer.name || "there";

      // If this specific card reached the required stamps, trigger REWARD_UNLOCKED
      const notifyMsg = (customerCard && customerCard.completed && customerCard.stampsCollected === stampsRequired && totalStampsToAward > 0) || totalStamps >= stampsRequired
        ? await getCompiledTemplate(merchantId, "REWARD_UNLOCKED", {
            customerName: custName.toUpperCase(),
            merchantName,
            requiredStamp: stampsRequired,
            visitNumber,
            rewardName,
            couponCode: Math.random().toString(36).substring(2, 8).toUpperCase()
          })
        : await getCompiledTemplate(merchantId, "STAMP_EARNED", {
            customerName: custName,
            merchantName,
            visitNumber,
            stampCount: stampsToAward,
            totalStamps,
            requiredStamp: stampsRequired,
            rewardName,
            remainingStamps: remaining
          });

      // Non-blocking background dispatch
      sendWhatsAppNotification(merchantId, waitingCustomer.customer.phone, notifyMsg);

      if (isUpgraded) {
        const upgradeMsg = await getCompiledTemplate(merchantId, "VIP_UPGRADE", {
          customerName: custName,
          merchantName,
          tierName: VIP_TIER_LABELS[newTier.name as any] || newTier.name.toUpperCase(),
          bonusStamps: vipBonusStamps.toString()
        });
        sendWhatsAppNotification(merchantId, waitingCustomer.customer.phone, upgradeMsg);
      }

      // FIX: Schedule Google Review request based on merchant delay configuration
      scheduleGoogleReviewRequest({
        merchantId,
        customerId: waitingCustomer.customerId,
      }).catch(e => console.error("[Award API] Review Scheduler Error:", e));
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
