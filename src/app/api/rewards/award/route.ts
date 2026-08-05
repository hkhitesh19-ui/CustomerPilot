import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // 2. Fetch active StampCard for merchant
    const stampCard = await db.stampCard.findFirst({
      where: { merchantId, active: true }
    });

    if (!stampCard) {
      return NextResponse.json({ success: false, error: 'No active reward program found for this merchant' }, { status: 400 });
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
    await db.$transaction(async (tx) => {
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

      // Update Customer Lifetime Spend & Stamps
      await tx.customer.update({
        where: { id: waitingCustomer.customerId },
        data: {
          lifetimeSpend: { increment: parsedAmount },
          lifetimeStamps: { increment: stampsToAward },
          lastActiveAt: new Date()
        }
      });

      // Update Customer Stamp Wallet
      if (stampsToAward > 0) {
        let customerCard = await tx.customerStampCard.findFirst({
          where: { 
            merchantId, 
            customerId: waitingCustomer.customerId,
            stampCardId: stampCard.id,
            completed: false 
          }
        });

        if (!customerCard) {
          customerCard = await tx.customerStampCard.create({
            data: {
              merchantId,
              customerId: waitingCustomer.customerId,
              stampCardId: stampCard.id,
              stampsCollected: 0
            }
          });
        }

        const totalStampsNow = customerCard.stampsCollected + stampsToAward;
        const isCompleted = totalStampsNow >= stampCard.stampsRequired;

        await tx.customerStampCard.update({
          where: { id: customerCard.id },
          data: {
            stampsCollected: totalStampsNow,
            completed: isCompleted
          }
        });

        for (let i = 0; i < stampsToAward; i++) {
          await tx.stamp.create({
            data: {
              customerId: waitingCustomer.customerId,
              merchantId,
              stampCardId: stampCard.id,
              customerStampCardId: customerCard.id,
              billId: bill.id,
              source: 'POS'
            }
          });
        }
      }
    });

    // 5. Send instant WhatsApp notification to customer (Day 1 / Day 4 Requirements.txt)
    if (waitingCustomer.customer?.phone) {
      const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
      const merchantName = merchant?.name || "our store";
      const customerCard = await db.customerStampCard.findFirst({
        where: { merchantId, customerId: waitingCustomer.customerId, stampCardId: stampCard.id }
      });
      const totalStamps = customerCard?.stampsCollected || stampsToAward;
      const stampsRequired = stampCard.stampsRequired || 10;
      const rewardName = stampCard.rewardName || "FREE 500gm Cake";
      const remaining = Math.max(0, stampsRequired - totalStamps);
      const custName = waitingCustomer.customer.name || "there";

      const notifyMsg = totalStamps >= stampsRequired
        ? `🎉 *CONGRATULATIONS ${custName.toUpperCase()}!* ❤️\n\nWelcome to *${merchantName} VIP Club*.\n\nYou've collected all *${stampsRequired}/${stampsRequired} Stamps*! 🏆 (Visit #${visitNumber})\n\n🎁 *YOUR REWARD:* ${rewardName}\nShow this message at the counter to claim your FREE treat! 🌟`
        : `⭐ *Congratulations ${custName}!* ❤️\n\nWelcome back to *${merchantName} VIP Club* (Visit #${visitNumber}).\n\n✅ *${stampsToAward} Stamp${stampsToAward > 1 ? "s" : ""} Added*\n📊 *Wallet:* ${totalStamps} / ${stampsRequired} Stamps\n🎁 *Next Reward:* ${rewardName} (${remaining} more stamp${remaining !== 1 ? "s" : ""} needed)\n\nThank you for visiting us! 🙏`;

      // Non-blocking background dispatch
      sendWhatsAppNotification(merchantId, waitingCustomer.customer.phone, notifyMsg);
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
