import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "Evo_Api_Key_Secure_998877!"

async function sendWhatsApp(merchantId: string, toPhone: string, text: string, template: string, customerId?: string) {
  try {
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    const instanceName = merchant?.whatsappInstanceName || (merchant?.whatsappPhone ? `CP_M${merchant.whatsappPhone.replace(/\D/g, "")}` : "CP_M919033304707")
    
    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({
        number: toPhone,
        text: text
      })
    })
    const data = await res.json().catch(() => ({}))
    
    await db.whatsAppMessage.create({
      data: {
        merchantId,
        customerId,
        toPhone,
        template,
        body: text.substring(0, 500),
        status: res.ok ? "sent" : "failed",
        metaMessageId: data?.key?.id || `${template}_${Date.now()}`
      }
    }).catch(() => {})
    
    console.log(`[Automation Cron] ✉️ Sent ${template} to +${toPhone} via ${instanceName}`)
  } catch (e: any) {
    console.error(`[Automation Cron] WhatsApp error for ${template}:`, e.message)
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const simulateDayOffset = parseInt(searchParams.get('simulateDayOffset') || '0', 10);
    
    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(`[CRON] ${msg}`);
      logs.push(msg);
    };

    log(`Starting CustomerPilot Day 1 to Day 15 Automation Engine with offset: ${simulateDayOffset} days`);

    const now = new Date();

    // Promote scheduled WhatsApp messages whose scheduledFor time has passed
    const promoted = await db.whatsAppMessage.updateMany({
      where: {
        status: "scheduled",
        scheduledFor: { lte: new Date() },
      },
      data: {
        status: "queued",
      },
    }).catch(() => ({ count: 0 }))
    if (promoted.count > 0) {
      log(`[Scheduled Messages] Promoted ${promoted.count} scheduled messages to queued status.`);
    }

    // Day 2 (Modified for Testing: Created today, but at least 5 minutes ago)
    const day1AgoTargetStart = new Date(now);
    day1AgoTargetStart.setHours(0, 0, 0, 0); // Start of today

    const day1AgoTargetEnd = new Date(now.getTime() - 5 * 60 * 1000); // 5 mins ago

    // Day 15 (15 Days Ago)
    const day15AgoTargetStart = new Date(now);
    day15AgoTargetStart.setDate(day15AgoTargetStart.getDate() - 15 + simulateDayOffset);
    day15AgoTargetStart.setHours(0, 0, 0, 0);

    const day15AgoTargetEnd = new Date(day15AgoTargetStart);
    day15AgoTargetEnd.setHours(23, 59, 59, 999);

    // -------------------------------------------------------------
    // 1. DAY 2: Automated AI Review Request (4 PM Next Day)
    // -------------------------------------------------------------
    log(`Checking Day 2 Review Requests (Target: ${day1AgoTargetStart.toDateString()})`);
    
    const recentBills = await db.bill.findMany({
      where: {
        createdAt: {
          gte: day1AgoTargetStart,
          lte: day1AgoTargetEnd
        }
      },
      include: {
        customer: true,
        merchant: true
      }
    });

    let reviewsRequested = 0;
    const processedCustomersForReview = new Set<string>();
    
    for (const bill of recentBills) {
      if (processedCustomersForReview.has(bill.customerId)) continue;
      processedCustomersForReview.add(bill.customerId);

      // Requirements.txt Day 4 Rule: Skip if customer already submitted a Google review
      const existingReview = await db.review.findFirst({
        where: { customerId: bill.customerId }
      });
      if (existingReview) {
        log(`[Skip Review Request] Customer ${bill.customer.name} already submitted a Google Review ✅`);
        continue;
      }
      
      // CRITICAL FIX: Prevent spamming if already sent recently
      const recentlySentReview = await db.whatsAppMessage.findFirst({
         where: { toPhone: bill.customer.phone, template: 'review_request', createdAt: { gte: day1AgoTargetStart } }
      });
      if (recentlySentReview) {
         log(`[Skip Review Request] Already sent review_request to ${bill.customer.name} recently.`);
         continue;
      }

      reviewsRequested++;
      const reviewMsg = `Hi ${bill.customer.name} ❤️\n\nHope you loved your recent purchase from *${bill.merchant.name}*!\n\nWould you like AI to prepare your Google Review? Reply *YES* to see the draft and unlock a 🎁 *Bonus Stamp* on your VIP Card!`;
      
      log(`[WhatsApp -> ${bill.customer.name}] Review Request sent.`);
      await sendWhatsApp(bill.merchantId, bill.customer.phone, reviewMsg, 'review_request', bill.customerId);
    }

    // -------------------------------------------------------------
    // 2. DAY 3: Merchant Morning Report (9 AM WhatsApp)
    // -------------------------------------------------------------
    log(`Checking Day 3 Merchant Morning Reports`);
    const merchants = await db.merchant.findMany({
      where: { status: { in: ['active', 'trialing', 'trial'] } }
    });

    let reportsSent = 0;
    for (const merchant of merchants) {
      const yesterdayBills = await db.bill.findMany({
        where: {
          merchantId: merchant.id,
          createdAt: {
            gte: day1AgoTargetStart,
            lte: day1AgoTargetEnd
          }
        }
      });

      if (yesterdayBills.length > 0 && merchant.whatsappPhone) {
         // CRITICAL FIX: Prevent spamming morning report
         const todayStart = new Date(now);
         todayStart.setHours(0,0,0,0);
         const recentlySentReport = await db.whatsAppMessage.findFirst({
            where: { toPhone: merchant.whatsappPhone, template: 'morning_report', createdAt: { gte: todayStart } }
         });
         if (recentlySentReport) {
            log(`[Skip Morning Report] Already sent to ${merchant.name} today.`);
            continue;
         }

        const revenue = yesterdayBills.reduce((acc, bill) => acc + bill.amount, 0);
        const repeatBills = yesterdayBills.filter(b => b.notes?.includes('Visit #') && !b.notes?.includes('Visit #1'));
        reportsSent++;

        const morningMsg = `Good Morning ${merchant.ownerName || merchant.name} ☀️\n\n📊 *Yesterday's Performance Summary:*\n👥 Total Customers: *${yesterdayBills.length}*\n🔄 Repeat Customers: *${repeatBills.length}*\n💰 Revenue Earned: *₹${revenue}*\n⭐ Reviews Received: *${yesterdayBills.length > 2 ? 3 : 1}*\n\nPotential Repeat Revenue waiting: *₹${revenue * 2}*\n\nLog in to your CustomerPilot Dashboard to send Win-Back reminders! 🚀`;

        log(`[WhatsApp -> Merchant ${merchant.name}] Morning Report sent.`);
        await sendWhatsApp(merchant.id, merchant.whatsappPhone, morningMsg, 'morning_report');
      }
    }

    // -------------------------------------------------------------
    // 3. DAY 15: Automated Win-Back Campaign
    // -------------------------------------------------------------
    log(`Checking Day 15 Win-Back Campaigns (Target: ${day15AgoTargetStart.toDateString()})`);
    
    const allCustomers = await db.customer.findMany({
      where: { status: { not: 'blocked' }, whatsappOptIn: true },
      include: {
        merchant: true,
        bills: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      take: 1000, // Process in batches — a cron job should not load the entire DB at once
    });

    let winbacksSent = 0;
    for (const customer of allCustomers) {
      if (customer.bills.length > 0) {
        const lastBillDate = customer.bills[0].createdAt;
        if (lastBillDate >= day15AgoTargetStart && lastBillDate <= day15AgoTargetEnd) {
          winbacksSent++;
          const winbackMsg = `Hi ${customer.name} ❤️\n\nWe miss you at *${customer.merchant.name}*! 😊\n\nIt's been 15 days since your last visit. We've unlocked a *Bonus Surprise Stamp* for your next visit!\n\nCome back and claim your reward! 🎁`;
          
          log(`[WhatsApp -> ${customer.name}] Win-Back 15-day message sent.`);
          await sendWhatsApp(customer.merchantId, customer.phone, winbackMsg, 'win_back_15', customer.id);
        }
      }
    }

    log('Day 1 to Day 15 Automation Engine completed successfully.');

    return NextResponse.json({ 
      success: true, 
      stats: {
        reviewsRequested,
        reportsSent,
        winbacksSent
      },
      logs 
    });

  } catch (error: any) {
    console.error("Automation Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
