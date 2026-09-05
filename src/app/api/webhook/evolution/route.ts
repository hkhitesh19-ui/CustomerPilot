import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { joinQueue } from "@/lib/queue-engine"
import { getCompiledTemplate } from "@/lib/template-engine"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY

/**
 * GAP 1 FIX: sendEvolutionMessage now uses the merchant's DEDICATED instance (CP_M919033304707)
 * instead of the hardcoded default "CustomerPilot_Main" which does NOT exist on Evolution server.
 */
async function sendEvolutionMessage(
  toPhone: string,
  text: string,
  instanceName: string
) {
  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      console.error("[Webhook] EVOLUTION_API_URL or EVOLUTION_API_KEY not configured — skipping outbound WhatsApp dispatch")
      return { ok: false, data: null }
    }
    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({
        number: toPhone,
        text: text
      })
    })
    const data = await res.json().catch(() => ({}))
    console.log(`[Webhook] ✉️ Sent to +${toPhone} via ${instanceName} | HTTP: ${res.status}`)
    return { ok: res.ok, data }
  } catch (e: any) {
    console.error(`[Webhook] ❌ Failed to send to ${toPhone}:`, e.message)
    return { ok: false, data: null }
  }
}

/**
 * Save outgoing message to CustomerPilot DB for full message log tracking
 */
async function saveOutgoingMessage(
  merchantId: string,
  toPhone: string,
  template: string,
  body: string,
  messageId?: string
) {
  try {
    await db.whatsAppMessage.create({
      data: {
        merchantId,
        toPhone,
        template,
        body: body.substring(0, 500),
        status: "sent",
        metaMessageId: messageId || `out_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        sentAt: new Date()
      }
    })
  } catch (e: any) {
    if (!e.message?.includes("Unique constraint")) {
      console.error("[Webhook] DB save outgoing error:", e.message)
    }
  }
}

/**
 * GAP 5 FIX: Smart name detection from WhatsApp pushName
 * Returns: null if pushName looks like a business/invalid name
 */
function extractPersonName(pushName: string | null | undefined): string | null {
  if (!pushName) return null
  const cleaned = pushName.trim()
  // Skip if looks like a business name (contains numbers, all-caps, or common business words)
  const businessWords = /\d|Ltd|Pvt|Inc|360|Tax|Fintax|Solutions|Services|Enterprises|Trading|Agency|Group|Associates/i
  if (businessWords.test(cleaned)) return null
  // Skip if too long (likely a business name)
  if (cleaned.split(" ").length > 3) return null
  // Skip if all uppercase (looks like abbreviation/brand)
  if (cleaned === cleaned.toUpperCase() && cleaned.length > 3) return null
  return cleaned
}

/**
 * SECURITY FIX: Sanitize inbound WhatsApp text before any DB write or LLM call.
 * - Trims whitespace
 * - Limits to 500 characters (prevents oversized payloads)
 * - Strips dangerous characters that could cause XSS or prompt injection
 */
function sanitizeInboundText(raw: string): string {
  if (!raw || typeof raw !== "string") return ""
  return raw
    .trim()
    .slice(0, 500)
    .replace(/[<>"'`]/g, "")  // Strip HTML/injection chars
    .replace(/\0/g, "")        // Strip null bytes
}

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Validate webhook secret on ALL environments — no dev bypass
    const secret = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("secret")
    const expectedSecret = process.env.EVOLUTION_WEBHOOK_SECRET
    if (!expectedSecret) {
      console.error("[Webhook] EVOLUTION_WEBHOOK_SECRET env var not set — rejecting all requests")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized webhook payload" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

    // Normalize event name
    const event = body.event?.toLowerCase().replace(/\./g, "_")
    const webhookInstance: string = body.instance || ""
    console.log(`[Evolution Webhook] Event: ${event} | Instance: ${webhookInstance}`)

    // ──────────────────────────────────────────────────────────────────
    // HANDLE: MESSAGES_UPSERT — incoming customer message
    // ──────────────────────────────────────────────────────────────────
    if (event === "messages_upsert") {
      const messages = Array.isArray(body.data)
        ? body.data
        : (body.data?.messages ? body.data.messages : [body.data])

      for (const msg of messages) {
        if (!msg || typeof msg !== "object") continue

        // Only process INCOMING messages (not our own outgoing)
        if (msg.key?.fromMe) continue

        // Skip group messages
        const fromJid: string = msg.key?.remoteJid || ""
        if (fromJid.includes("@g.us")) continue
        if (fromJid === "status@broadcast") continue

        // Extract customer phone (handle both @s.whatsapp.net and @lid formats)
        const customerPhone = (msg.key?.remoteJidAlt || fromJid)
          .replace("@s.whatsapp.net", "")
          .replace(/@[^@]+$/, "")
          .replace(/\D/g, "")

        if (!customerPhone || customerPhone.length < 10) continue

        // Extract and sanitize message text (SECURITY: sanitize before DB/LLM use)
        const rawText = (
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.buttonsResponseMessage?.selectedDisplayText ||
          ""
        )
        const text = sanitizeInboundText(rawText)

        // Extract WhatsApp display name (sanitized)
        const pushName: string = sanitizeInboundText(msg.pushName || msg.key?.pushName || "")

        console.log(`[Webhook] 📥 Incoming from: +${customerPhone} (${pushName}) | Text: ${text.substring(0, 80)}`)

        // ── Find merchant by instance name ──────────────────────────────
        let merchant = await db.merchant.findFirst({
          where: {
            OR: [
              { whatsappInstanceName: webhookInstance },
              { whatsappPhone: webhookInstance.replace("CP_M", "") }
            ]
          }
        })
        if (!merchant) {
          merchant = await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
        }
        if (!merchant) {
          console.warn("[Webhook] ⚠️ No merchant found in DB")
          continue
        }

        // ── Subscription Gatekeeper ───────────────────────────────────────
        if (merchant.trialEndsAt && new Date(merchant.trialEndsAt) < new Date()) {
          console.warn(`[Webhook] 🚫 Merchant ${merchant.id} subscription expired. Dropping message.`);
          continue;
        }

        // Use merchant's dedicated Evolution instance
        const merchantInstance = merchant.whatsappInstanceName || webhookInstance

        // ── Idempotency check ───────────────────────────────────────────
        const existing = await db.whatsAppMessage.findFirst({
          where: { metaMessageId: msg.key?.id }
        })
        if (existing) {
          console.log(`[Webhook] Duplicate message skipped: ${msg.key?.id}`)
          continue
        }

        // ── GAP 4 FIX: Save EVERY incoming message to CustomerPilot DB ──
        await db.whatsAppMessage.create({
          data: {
            merchantId: merchant.id,
            toPhone: customerPhone,
            template: "INCOMING",
            body: text.substring(0, 500),
            status: "received",
            metaMessageId: msg.key?.id || `in_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
          }
        }).catch(() => {})

        const last10Phone = customerPhone.slice(-10)

        const existingCustomer = await db.customer.findFirst({
          where: {
            merchantId: merchant.id,
            phone: { contains: last10Phone },
            deletedAt: null  // Ignore soft-deleted customers
          }
        })

        // STRICT MATCH: Only trigger auto-onboarding if the text strictly matches the QR Code generated text
        const isTriggerMsg = /Checking in for my VIP Club stamps/i.test(text)

        // Determine public base URL — Priority: env NEXT_PUBLIC_APP_URL > x-forwarded-host
        // autoPinggySync.js keeps NEXT_PUBLIC_APP_URL always in sync with current Pinggy session
        const requestHost = req.headers.get("x-forwarded-host") || req.headers.get("host")
        const requestProto = req.headers.get("x-forwarded-proto") || "https"
        const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL
          || ((requestHost && !requestHost.includes("localhost"))
            ? `${requestProto}://${requestHost}`
            : "http://localhost:3000")

        // ── 1. CONTEXT AWARE REPLIES (Review & Name) ──────────────────────
        if (!isTriggerMsg && existingCustomer && text.length > 0 && text.length < 50) {
          let botState = existingCustomer.botState || "IDLE";
          
          // Handle 24-hour state expiration
          if (existingCustomer.botStateUpdatedAt) {
            const hoursSinceUpdate = (new Date().getTime() - new Date(existingCustomer.botStateUpdatedAt).getTime()) / (1000 * 60 * 60);
            if (hoursSinceUpdate > 24 && botState !== "IDLE") {
              botState = "IDLE";
              // Non-blocking state reset
              db.customer.update({ where: { id: existingCustomer.id }, data: { botState: "IDLE" } }).catch(()=>{});
            }
          }

          if (botState !== "IDLE") {
            const cleanText = text.trim().toLowerCase()
            const isAffirmative = ["yes", "y", "sure", "yeah", "ok", "okay", "yep", "yes please", "yes!"].includes(cleanText) || cleanText.includes("yes")

            // A. Google Review Flow
            if (botState === "AWAITING_REVIEW_CONSENT") {
               // Reset state immediately
               await db.customer.update({ where: { id: existingCustomer.id }, data: { botState: "IDLE" } })
               
               if (isAffirmative) {
                 console.log(`[Webhook] Google Review AI Draft triggered for ${customerPhone}`)
                 const reviewUrl = `${publicBaseUrl}/review?c=${existingCustomer.id}&m=${merchant.id}`
                 const draftMsg = await getCompiledTemplate(merchant.id, "REVIEW_DRAFT", { reviewUrl })
                 
                 const res = await sendEvolutionMessage(customerPhone, draftMsg, merchantInstance)
                 if (res.ok) await saveOutgoingMessage(merchant.id, customerPhone, "REVIEW_DRAFT", draftMsg, res.data?.key?.id)
                 continue
               }
            }

            // B. Name Confirmation Flow
            if (botState === "AWAITING_NAME_CONFIRMATION") {
               // Reset state immediately
               await db.customer.update({ where: { id: existingCustomer.id }, data: { botState: "IDLE" } })

               let nameGuess = text
               if (isAffirmative) {
                  nameGuess = existingCustomer.name || extractPersonName(pushName) || "VIP Member"
               } else {
                  nameGuess = text.split(" ").slice(0, 2).join(" ")
                  // Ignore common non-name conversational words
                  const genericWords = ["hi", "hello", "hey", "thanks", "thank you", "no", "what", "how", "please", "sir", "madam", "okay", "ok", "yep"]
                  if (genericWords.includes(nameGuess.toLowerCase())) {
                     nameGuess = extractPersonName(pushName) || "VIP Member"
                  }
               }

               await db.customer.update({
                 where: { id: existingCustomer.id },
                 data: { name: nameGuess }
               })
               console.log(`[Webhook] ✏️ Name captured for ${customerPhone}: "${nameGuess}"`)

                const walletUrl = `${publicBaseUrl}/q/wallet/${existingCustomer.id}`
                const nameConfirmMsg = await getCompiledTemplate(merchant.id, "NAME_CONFIRMED", {
                  customerName: nameGuess,
                  merchantName: merchant.name || "our store",
                  walletUrl
                })
                const finalNameConfirmMsg = nameConfirmMsg.includes(walletUrl) 
                  ? nameConfirmMsg 
                  : `${nameConfirmMsg}\n\n📱 *Your Digital VIP Card:*\n${walletUrl}`

                const res = await sendEvolutionMessage(customerPhone, finalNameConfirmMsg, merchantInstance)
                if (res.ok) await saveOutgoingMessage(merchant.id, customerPhone, "NAME_CONFIRMED", finalNameConfirmMsg, res.data?.key?.id)
                continue
            }
          }
        }

        // ── 1.5 SMART INQUIRY: Wallet & Stamp Balance Keywords ────────────
        const lowerText = text.trim().toLowerCase();
        const isWalletInquiry = [
          "wallet", "stamp", "stamps", "balance", "card", "points", "status", 
          "my stamps", "check stamps", "rewards", "passbook", "score"
        ].some(kw => lowerText === kw || lowerText.includes(kw));

        if (!isTriggerMsg && existingCustomer && isWalletInquiry) {
          const activeCard = await db.customerStampCard.findFirst({
            where: { customerId: existingCustomer.id, completed: false, redeemed: false },
            include: { stampCard: true },
            orderBy: { createdAt: "desc" }
          });
          const rule = activeCard?.stampCard || await db.stampCard.findFirst({ where: { merchantId: merchant.id, active: true } });
          const collected = activeCard?.stampsCollected ?? existingCustomer.lifetimeStamps ?? 0;
          const required = rule?.stampsRequired || 10;
          const remaining = Math.max(0, required - collected);
          const walletUrl = `${publicBaseUrl}/q/wallet/${existingCustomer.id}`;

          const walletReply = `⭐ *Hi ${existingCustomer.name || "VIP"}!* ❤️\n\n` +
            `Here is your live VIP Stamp balance at *${merchant.name}*:\n\n` +
            `📊 *Wallet:* ${collected} / ${required} Stamps\n` +
            `🎁 *Goal:* ${rule?.rewardName || "FREE Reward"}${remaining === 0 ? " — 🏆 *REWARD READY!*" : ` (${remaining} more stamp(s) needed)`}\n\n` +
            `📱 *View Your Real-Time Digital Stamp Card:*\n${walletUrl}`;

          console.log(`[Webhook] 💳 Sent real-time wallet link to ${customerPhone}`);
          const res = await sendEvolutionMessage(customerPhone, walletReply, merchantInstance);
          if (res.ok) await saveOutgoingMessage(merchant.id, customerPhone, "WALLET_INQUIRY", walletReply, res.data?.key?.id);
          continue;
        }

        // If the message is NOT from a QR scan and NOT a reply to a pending bot message, skip queue join!
        if (!isTriggerMsg) {
          console.log(`[Webhook] ℹ️ Non-QR chat received from ${customerPhone}: "${text}". Skipping queue auto-join.`)
          continue
        }

        // ── 2. Check if customer is already in queue ───────────────────────
        const alreadyWaiting = await db.waitingCustomer.findFirst({
          where: {
            merchantId: merchant.id,
            customer: { phone: customerPhone },
            status: "waiting"
          },
          include: { customer: true }
        })

        if (alreadyWaiting) {
          console.log(`[Webhook] Customer ${customerPhone} already in queue`)
          const alreadyMsg = await getCompiledTemplate(merchant.id, "QUEUE_DUPLICATE", {
            merchantName: merchant.name || "our store"
          })
          const res = await sendEvolutionMessage(customerPhone, alreadyMsg, merchantInstance)
          if (res.ok) await saveOutgoingMessage(merchant.id, customerPhone, "QUEUE_DUPLICATE", alreadyMsg, res.data?.key?.id)
          continue
        }

        // ── Determine scan type ─────────────────────────────────────────
        const scanTypeMatch = text.match(/\(ref:([^)]+)\)/)
        const scanType = scanTypeMatch ? `qr_${scanTypeMatch[1]}_whatsapp` : "qr_counter_whatsapp"

        // ── JOIN: Add customer to Live Queue (Only for QR Code Scans) ────
        try {
          const result = await joinQueue({
            merchantId: merchant.id,
            phone: customerPhone,
            scanSource: scanType
          })

          // Get stamp card info
          const stampCard = await db.stampCard.findFirst({
            where: { merchantId: merchant.id, active: true }
          })

          const bizName = merchant.name || "our store"
          const rewardName = stampCard?.rewardName || "FREE special treat"
          const stampsRequired = stampCard?.stampsRequired || 10
          const stampValue = stampCard?.stampValue || 500

          // GAP 5 FIX: Smart name detection from pushName
          const detectedName = extractPersonName(pushName)

          let welcomeMsg: string

          if (result.isNewCustomer) {
            if (detectedName) {
              // CASE A from Requirements.txt: Display name detected — confirm it
              welcomeMsg = await getCompiledTemplate(merchant.id, "QR_WELCOME_NEW_DETECTED", {
                businessName: bizName,
                rewardPoints: stampValue,
                requiredStamp: stampsRequired,
                rewardName,
                detectedName
              })
            } else {
              // CASE B from Requirements.txt: No usable name — ask for it
              welcomeMsg = await getCompiledTemplate(merchant.id, "QR_WELCOME_NEW_UNKNOWN", {
                businessName: bizName,
                rewardPoints: stampValue,
                requiredStamp: stampsRequired,
                rewardName
              })
            }
          } else {
            const customerName = existingCustomer?.name || "there"
            welcomeMsg = await getCompiledTemplate(merchant.id, "QR_WELCOME_RETURNING", {
              customerName,
              businessName: bizName
            })
          }

          // GAP 1 FIX: Send via MERCHANT'S dedicated instance (not hardcoded default)
          const sendRes = await sendEvolutionMessage(customerPhone, welcomeMsg, merchantInstance)

          // GAP 4 FIX: Save outgoing message to CustomerPilot DB
          if (sendRes.ok) {
            await saveOutgoingMessage(
              merchant.id, customerPhone,
              result.isNewCustomer ? "qr_welcome" : "stamp_earned",
              welcomeMsg,
              sendRes.data?.key?.id
            )
          }

          // If name was detected, pre-save it on customer record
          if (detectedName && result.isNewCustomer) {
            await db.customer.updateMany({
              where: { merchantId: merchant.id, phone: customerPhone },
              data: { name: detectedName }
            })
          }

          console.log(`[Webhook] ✅ Customer +${customerPhone} → Queue. isNew: ${result.isNewCustomer} | Instance: ${merchantInstance}`)

        } catch (queueErr: any) {
          console.error("[Webhook] Queue join error:", queueErr.message)
          const fallbackMsg = `👋 Welcome to *${merchant.name}*! You're connected. Please show this message to our staff — they'll add your VIP stamp! 🌟`
          const res = await sendEvolutionMessage(customerPhone, fallbackMsg, merchantInstance)
          if (res.ok) await saveOutgoingMessage(merchant.id, customerPhone, "FALLBACK_WELCOME", fallbackMsg, res.data?.key?.id)
        }
      }
    }

    // ──────────────────────────────────────────────────────────────────
    // HANDLE: MESSAGES_UPDATE — delivery/read receipts
    // ──────────────────────────────────────────────────────────────────
    if (event === "messages_update") {
      const updates = Array.isArray(body.data) ? body.data : (body.data ? [body.data] : [])
      for (const update of updates) {
        const messageId = update.key?.id
        const statusEnum = update.update?.status

        let dbStatus = "sent"
        let deliveredAt: Date | undefined
        let readAt: Date | undefined

        if (statusEnum === 4) { dbStatus = "delivered"; deliveredAt = new Date() }
        else if (statusEnum === 5) { dbStatus = "read"; readAt = new Date() }

        if (dbStatus !== "sent" && messageId) {
          await db.whatsAppMessage.updateMany({
            where: { metaMessageId: messageId },
            data: { status: dbStatus, deliveredAt, readAt }
          })
        }
      }
    }

    // ──────────────────────────────────────────────────────────────────
    // HANDLE: CONNECTION_UPDATE — instance state changes
    // ──────────────────────────────────────────────────────────────────
    if (event === "connection_update") {
      const state = body.data?.state || body.data?.connection
      const instanceName = body.instance
      console.log(`[Webhook] 🔗 Connection update for ${instanceName}: ${state}`)

      if (state === "open" && instanceName) {
        // Mark merchant WhatsApp as connected
        await db.merchant.updateMany({
          where: {
            OR: [
              { whatsappInstanceName: instanceName },
              { whatsappPhone: instanceName.replace("CP_M", "") }
            ]
          },
          data: { status: "active" }
        }).catch(() => {})
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Evolution Webhook Error]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
