import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getMessageWorker } from '@/lib/message-worker';
import { getCompiledTemplate } from "@/lib/template-engine";
import { resolveWhatsappInstanceName } from '@/lib/whatsapp-service';
import { hasModule } from '@/lib/feature-gate';


const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY

async function sendWhatsApp(merchantId: string, toPhone: string, text: string, template: string, customerId?: string) {
  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      console.error("[Cron Automations] EVOLUTION_API_URL or EVOLUTION_API_KEY not configured — skipping WhatsApp dispatch")
      return { ok: false }
    }
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    const instanceName = merchant ? resolveWhatsappInstanceName(merchant) : `CP_M_${merchantId}`
    
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

    // Process scheduled / queued WhatsApp messages whose scheduledFor time has arrived
    const pendingMessages = await db.whatsAppMessage.findMany({
      where: {
        status: { in: ["scheduled", "queued"] },
        OR: [
          { scheduledFor: null },
          { scheduledFor: { lte: now } }
        ]
      },
      take: 20
    });

    log(`[Pending Messages] Found ${pendingMessages.length} pending messages to dispatch.`);

    for (const msg of pendingMessages) {
      try {
        const merchant = await db.merchant.findUnique({ where: { id: msg.merchantId } });
        const instanceName = merchant ? resolveWhatsappInstanceName(merchant) : `CP_M_${msg.merchantId}`;

        const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
          body: JSON.stringify({
            number: msg.toPhone,
            text: msg.body
          })
        });
        const data = await res.json().catch(() => ({}));

        await db.whatsAppMessage.update({
          where: { id: msg.id },
          data: {
            status: res.ok ? "sent" : "failed",
            sentAt: res.ok ? new Date() : null,
            metaMessageId: data?.key?.id || `${msg.template}_${Date.now()}`,
            errorMessage: res.ok ? null : (data.message || `HTTP ${res.status}`)
          }
        });

        // ✅ CRITICAL FIX: When a review_request is dispatched, set botState so the
        // webhook can correctly identify the customer's "Yes" reply as review consent.
        if (res.ok && msg.template === "review_request" && msg.customerId) {
          await db.customer.update({
            where: { id: msg.customerId },
            data: {
              botState: "AWAITING_REVIEW_CONSENT",
              botStateUpdatedAt: new Date()
            }
          }).catch((e: any) => log(`[botState Error] ${e.message}`));
          log(`[botState] ✅ Set AWAITING_REVIEW_CONSENT for customer ${msg.customerId}`);
        }

        log(`[Dispatched] ✉️ Sent ${msg.template} to +${msg.toPhone} via ${instanceName} (Status: ${res.ok ? 'OK' : 'FAIL'})`);
      } catch (err: any) {
        log(`[Dispatch Error] Failed to send msg ${msg.id}: ${err.message}`);
      }
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
        },
        merchant: {
          OR: [
            { trialEndsAt: null },
            { trialEndsAt: { gt: new Date() } }
          ]
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

      // Only send review requests if merchant has REVIEWS module enabled
      if (!hasModule(bill.merchant, "REVIEWS")) {
        log(`[Skip Review Request] Merchant ${bill.merchant.name} does not have REVIEWS module.`);
        continue;
      }

      // Requirements.txt Day 4 Rule: Skip if customer already submitted a Google review
      const existingReview = await db.review.findFirst({
        where: { customerId: bill.customerId }
      });
      if (existingReview) {
        log(`[Skip Review Request] Customer ${bill.customer.name} already submitted a Google Review ✅`);
        continue;
      }
      
      // CRITICAL FIX: Prevent spamming if EVER sent
      const recentlySentReview = await db.whatsAppMessage.findFirst({
         where: { toPhone: bill.customer.phone, template: 'review_request' }
      });
      if (recentlySentReview) {
         log(`[Skip Review Request] Already sent review_request to ${bill.customer.name} recently.`);
         continue;
      }

      reviewsRequested++;
      const reviewMsg = await getCompiledTemplate(bill.merchantId, "REVIEW_REQUEST", {
        customerName: bill.customer.name,
        merchantName: bill.merchant.name
      });
      
      log(`[WhatsApp -> ${bill.customer.name}] Review Request sent.`);
      await sendWhatsApp(bill.merchantId, bill.customer.phone, reviewMsg, 'review_request', bill.customerId);

      await db.customer.update({
        where: { id: bill.customerId },
        data: { botState: 'AWAITING_REVIEW_CONSENT', botStateUpdatedAt: new Date() }
      });
    }

    // -------------------------------------------------------------
    // 2. DAY 3: Merchant Morning Report (9 AM WhatsApp)
    // -------------------------------------------------------------
    log(`Checking Day 3 Merchant Morning Reports`);
    const merchants = await db.merchant.findMany({
      where: { 
        status: { in: ['active', 'trialing', 'trial'] },
        OR: [
          { trialEndsAt: null },
          { trialEndsAt: { gt: new Date() } }
        ]
      }
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

        const morningMsg = await getCompiledTemplate(merchant.id, "MORNING_REPORT", {
          customerName: merchant.ownerName || merchant.name,
          count: yesterdayBills.length,
          revenue
        });

        log(`[WhatsApp -> Merchant ${merchant.name}] Morning Report sent.`);
        await sendWhatsApp(merchant.id, merchant.whatsappPhone, morningMsg, 'morning_report');
      }
    }

    // -------------------------------------------------------------
    // 3. Automated Win-Back Campaigns & 7-Day Reminder
    // -------------------------------------------------------------
    log(`Checking Advanced Automation Engine...`);
    
    const allCustomers = await db.customer.findMany({
      where: { 
        status: { not: 'blocked' },
        deletedAt: null,
        whatsappOptIn: true,
        merchant: {
          OR: [
            { trialEndsAt: null },
            { trialEndsAt: { gt: new Date() } }
          ]
        }
      },
      include: {
        merchant: true,
        bills: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        stampCards: {
          where: { completed: false },
          include: { stampCard: true }
        }
      },
      take: 1000, // Process in batches — a cron job should not load the entire DB at once
    });

    let winbacksSent = 0;
    let remindersSent = 0;
    let expiryWarningsSent = 0;

    for (const customer of allCustomers) {
      // Only process loyalty automations if merchant has LOYALTY module enabled
      if (!hasModule(customer.merchant, "LOYALTY")) continue;

      const merchant = customer.merchant;
      const targetExpiryWarningDays = (merchant as any).expiryWarningDays ?? 7;
      const targetAlmostThereDays = (merchant as any).almostThereInactivityDays ?? 7;
      const targetWinback1 = (merchant as any).winbackDays1 ?? 30;
      const targetWinback2 = (merchant as any).winbackDays2 ?? 60;
      const targetWinback3 = (merchant as any).winbackDays3 ?? 90;

      const activeStampCard = customer.stampCards.find(c => !c.completed);
      
      // EXPIRY WARNING: Check if active stamp card expires in configured expiryWarningDays
      if (activeStampCard && activeStampCard.stampCard.validityDays) {
        const createdAt = new Date(activeStampCard.createdAt);
        const expiryDate = new Date(createdAt);
        expiryDate.setDate(createdAt.getDate() + activeStampCard.stampCard.validityDays);
        
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry === targetExpiryWarningDays) {
          // Check if already sent
          const alreadySentExpiry = await db.whatsAppMessage.findFirst({
            where: { toPhone: customer.phone, template: 'EXPIRY_WARNING_7_DAY', customerId: customer.id }
          });
          if (!alreadySentExpiry) {
            expiryWarningsSent++;
            const expiryMsg = await getCompiledTemplate(customer.merchantId, "EXPIRY_WARNING_7_DAY", {
              customerName: customer.name,
              merchantName: customer.merchant.name,
              rewardName: activeStampCard.stampCard.rewardName || "Free Reward",
              stampsCollected: activeStampCard.stampsCollected,
              validityDaysLeft: targetExpiryWarningDays
            });
            log(`[WhatsApp -> ${customer.name}] Expiry Warning (${targetExpiryWarningDays} days) sent.`);
            await sendWhatsApp(customer.merchantId, customer.phone, expiryMsg, 'EXPIRY_WARNING_7_DAY', customer.id);
          }
        }
      }

      if (customer.bills.length > 0) {
        const lastBillDate = customer.bills[0].createdAt;
        const daysSinceLastVisit = Math.floor((now.getTime() - lastBillDate.getTime()) / (1000 * 60 * 60 * 24));

        // Almost There Reminder (Only 2 Stamps left & inactive for configured days)
        if (daysSinceLastVisit === targetAlmostThereDays && activeStampCard && activeStampCard.stampsCollected === (activeStampCard.stampCard.stampsRequired - 2)) {
          const createdAt = new Date(activeStampCard.createdAt);
          const expiryDate = new Date(createdAt);
          if (activeStampCard.stampCard.validityDays) {
            expiryDate.setDate(createdAt.getDate() + activeStampCard.stampCard.validityDays);
          } else {
            expiryDate.setDate(createdAt.getDate() + 365); 
          }
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry > 0) {
            const alreadySentAlmostThere = await db.whatsAppMessage.findFirst({
              where: { toPhone: customer.phone, template: 'ALMOST_THERE_REMINDER', customerId: customer.id }
            });
            
            if (!alreadySentAlmostThere) {
              remindersSent++;
              const almostThereMsg = await getCompiledTemplate(customer.merchantId, "ALMOST_THERE_REMINDER", {
                customerName: customer.name,
                merchantName: customer.merchant.name,
                remainingStamps: 2,
                validityDaysLeft: daysUntilExpiry
              });
              log(`[WhatsApp -> ${customer.name}] Almost There (2 stamps left) reminder sent.`);
              await sendWhatsApp(customer.merchantId, customer.phone, almostThereMsg, 'ALMOST_THERE_REMINDER', customer.id);
            }
          }
        }

        // Win-back Campaigns (Configurable Days: winbackDays1, winbackDays2, winbackDays3 or default 15)
        let winbackTemplateKey = null;
        if (daysSinceLastVisit === 15) winbackTemplateKey = "WINBACK_15_DAY";
        else if (daysSinceLastVisit === targetWinback1) winbackTemplateKey = "WINBACK_30_DAY";
        else if (daysSinceLastVisit === targetWinback2) winbackTemplateKey = "WINBACK_60_DAY";
        else if (daysSinceLastVisit === targetWinback3) winbackTemplateKey = "WINBACK_90_DAY";

        if (winbackTemplateKey) {
          const alreadySent = await db.whatsAppMessage.findFirst({
            where: { toPhone: customer.phone, template: winbackTemplateKey, customerId: customer.id }
          });
          if (!alreadySent) {
            winbacksSent++;
            const winbackMsg = await getCompiledTemplate(customer.merchantId, winbackTemplateKey, {
              customerName: customer.name,
              merchantName: customer.merchant.name
            });
            log(`[WhatsApp -> ${customer.name}] ${winbackTemplateKey} message sent.`);
            await sendWhatsApp(customer.merchantId, customer.phone, winbackMsg, winbackTemplateKey, customer.id);
          }
        }
      }
    }

    log('Day 1 to Day 90 Automation Engine completed successfully.');

    return NextResponse.json({ 
      success: true, 
      stats: {
        reviewsRequested,
        reportsSent,
        winbacksSent,
        remindersSent,
        expiryWarningsSent
      },
      logs 
    });

  } catch (error: any) {
    console.error("Automation Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
