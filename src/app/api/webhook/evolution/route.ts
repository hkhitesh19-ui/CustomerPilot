import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { joinQueue } from "@/lib/queue-engine"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "Evo_Api_Key_Secure_998877!"

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

        // Extract message text
        const text = (
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.buttonsResponseMessage?.selectedDisplayText ||
          ""
        ).trim()

        // Extract WhatsApp display name
        const pushName: string = msg.pushName || msg.key?.pushName || ""

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
            phone: { contains: last10Phone }
          }
        })

        const isTriggerMsg = /vip\s*club|checking\s*in|stamps?|join|reward|counter/i.test(text)

        // Determine public base URL from request headers (Pinggy / Tunnel support for mobile links)
        const requestHost = req.headers.get("x-forwarded-host") || req.headers.get("host")
        const requestProto = req.headers.get("x-forwarded-proto") || "https"
        const publicBaseUrl = (requestHost && !requestHost.includes("localhost"))
          ? `${requestProto}://${requestHost}`
          : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")

        // ── 1. CONTEXT AWARE REPLIES (Review & Name) ──────────────────────
        if (!isTriggerMsg && existingCustomer && text.length > 0 && text.length < 50) {
          const lastSentMsg = await db.whatsAppMessage.findFirst({
            where: {
              merchantId: merchant.id,
              toPhone: { contains: last10Phone },
              status: { in: ["sent", "delivered", "read"] }
            },
            orderBy: { createdAt: "desc" }
          })

          if (lastSentMsg) {
            const cleanText = text.trim().toLowerCase()
            const isAffirmative = ["yes", "y", "sure", "yeah", "ok", "yes please", "yes!"].includes(cleanText) || cleanText.includes("yes")

            // A. Google Review Flow
            if (lastSentMsg.template === "review_request" && isAffirmative) {
               console.log(`[Webhook] Google Review AI Draft triggered for ${customerPhone}`)
               const reviewUrl = `${publicBaseUrl}/review?c=${existingCustomer.id}&m=${merchant.id}`
               const draftMsg = `Awesome! 🌟 Here is a draft review prepared by AI:\n\n*"The cake was fresh, beautiful, and absolutely delicious. Highly recommended!"*\n\nTap the link below to Edit or Post it on Google:\n${reviewUrl}`
               
               const res = await sendEvolutionMessage(customerPhone, draftMsg, merchantInstance)
               if (res.ok) await saveOutgoingMessage(merchant.id, customerPhone, "REVIEW_DRAFT", draftMsg, res.data?.key?.id)
               continue
            }

            // B. Name Confirmation Flow
            if (lastSentMsg.template === "qr_welcome") {
               let nameGuess = text
               if (isAffirmative) {
                  nameGuess = existingCustomer.name || extractPersonName(pushName) || "VIP Member"
               } else {
                  nameGuess = text.split(" ").slice(0, 2).join(" ")
               }

               await db.customer.update({
                 where: { id: existingCustomer.id },
                 data: { name: nameGuess }
               })
               console.log(`[Webhook] ✏️ Name captured for ${customerPhone}: "${nameGuess}"`)

               const nameConfirmMsg = `✅ *Got it! Welcome, ${nameGuess}!* 🎉\n\nYour FREE VIP Membership is now active at *${merchant.name}*.\n\nYou're in the queue. Our team will add your first stamp after billing. 🌟`
               const res = await sendEvolutionMessage(customerPhone, nameConfirmMsg, merchantInstance)
               if (res.ok) await saveOutgoingMessage(merchant.id, customerPhone, "NAME_CONFIRMED", nameConfirmMsg, res.data?.key?.id)
               continue
            }
          }
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
          const alreadyMsg = `👋 You're already in the queue at *${merchant.name}*!\n\nPlease wait — our team will serve you shortly. 🙏`
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
              welcomeMsg = `🎉 *You're invited to join the ${bizName} VIP Club.*\n\nIt's completely FREE and takes less than 10 seconds. Thank you for visiting us! 🙏\n\n*How it works:*\n⭐ Every ₹${stampValue} purchase = 1 Stamp\n🎁 Collect ${stampsRequired} Stamps → Claim *${rewardName}*\n🌟 Leave a Google Review → Earn Bonus Stamps!\n\nIs your name *${detectedName}*?\n\nReply *YES* to confirm, or type your name below:`
            } else {
              // CASE B from Requirements.txt: No usable name — ask for it
              welcomeMsg = `🎉 *You're invited to join the ${bizName} VIP Club.*\n\nIt's completely FREE and takes less than 10 seconds. Thank you for visiting us! 🙏\n\n*How it works:*\n⭐ Every ₹${stampValue} purchase = 1 Stamp\n🎁 Collect ${stampsRequired} Stamps → Claim *${rewardName}*\n🌟 Leave a Google Review → Earn Bonus Stamps!\n\nBefore we activate your FREE VIP Membership, *please share your name.*\n\nReply with your name (e.g. Rahul):`
            }
          } else {
            const customerName = existingCustomer?.name || "there"
            welcomeMsg = `👋 Welcome back, *${customerName}*! ❤️\n\nYou're in the queue at *${bizName}*.\n\nOur team will add your stamps after billing. Thank you for being a loyal VIP member! 🌟`
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
