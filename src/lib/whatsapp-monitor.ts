/**
 * WhatsApp Fleet Disconnection & Targeted Alert Monitoring Engine
 * 
 * Inspects all active merchants' WhatsApp instances on Evolution API,
 * classifies exact failure reasons (401 logged out, connecting pending, socket offline, 403 restricted),
 * and dispatches targeted, personalized warning alerts to affected merchants ONLY
 * from CustomerPilot SuperAdmin (+91 9033304707) with strict anti-spam cooldown protection.
 */

import { db } from "@/lib/db"

export type WhatsAppIssueType =
  | "SESSION_LOGGED_OUT_401"
  | "QR_SCAN_PENDING"
  | "PHONE_OFFLINE_OR_TIMEOUT"
  | "ACCOUNT_RESTRICTED_403"
  | "INSTANCE_NOT_CONFIGURED"
  | "GATEWAY_UNREACHABLE"

export type WhatsAppAlertAction =
  | "NONE_HEALTHY"
  | "ALERT_SENT"
  | "ALERT_SKIPPED_COOLDOWN"
  | "ALERT_FAILED"

export interface MerchantHealthDiagnosis {
  merchantId: string
  merchantName: string
  merchantPhone: string
  instanceName: string | null
  status: "HEALTHY" | "ISSUE_DETECTED"
  issueType: WhatsAppIssueType | null
  reasonDetail: string
  disconnectionCode: number | null
  disconnectionAt: string | null
  alertAction: WhatsAppAlertAction
  messageBody?: string
  lastAlertSentAt?: Date | null
}

export interface FleetMonitorResult {
  timestamp: string
  totalMerchants: number
  healthyCount: number
  issueCount: number
  alertsSentCount: number
  cooldownSkippedCount: number
  diagnoses: MerchantHealthDiagnosis[]
}

const SUPERADMIN_NUMBER = (process.env.EVOLUTION_ADMIN_NUMBER || "919033304707").replace(/\D/g, "")
const DEFAULT_COOLDOWN_HOURS = 6

/**
 * Builds specific, personalized alert message in clear Hinglish based on the exact issue diagnosed
 */
export function buildTargetedAlertMessage(params: {
  storeName: string
  issueType: WhatsAppIssueType
  disconnectionCode?: number | null
  appBaseUrl?: string
}): string {
  const { storeName, issueType, appBaseUrl = "https://customerpilot.in" } = params
  const reconnectUrl = `${appBaseUrl}/dashboard/settings#section-whatsapp`

  switch (issueType) {
    case "SESSION_LOGGED_OUT_401":
      return (
        `🚨 *CustomerPilot Alert: WhatsApp Device Unlinked!*\n\n` +
        `Namaste *${storeName}*! ❤️\n\n` +
        `Aapke store phone se CustomerPilot ka WhatsApp connection *unlink / logout* ho chuka hai (Meta Security Code 401).\n\n` +
        `⚠️ *Customer Impact:*\n` +
        `Jab tak WhatsApp re-link nahi hota, tab tak counter QR scan karne wale customers ke *Digital Loyalty Stamps* aur automated *Google Review* prompts deliver nahi ho paenge!\n\n` +
        `🔧 *Turant 10 Second Me Re-link Karein:*\n` +
        `1. Store phone me WhatsApp kholein.\n` +
        `2. Settings ➔ *Linked Devices* ➔ *"Link a Device"* dabayein.\n` +
        `3. Niche link kholkar fresh QR code scan karein:\n` +
        `👉 ${reconnectUrl}\n\n` +
        `Kisi bhi technical help ke liye SuperAdmin Helpline: +91 9033304707 par reply karein.`
      )

    case "QR_SCAN_PENDING":
      return (
        `⏳ *CustomerPilot Notice: WhatsApp QR Scan Pending*\n\n` +
        `Namaste *${storeName}*!\n\n` +
        `Aapke store ka WhatsApp connection setup abhi *adhura (pending)* hai. Fresh QR code generate hua tha par phone se scan complete nahi hua.\n\n` +
        `⚠️ *Customer Impact:*\n` +
        `Store par customers counter QR scan karenge toh unhe automated VIP loyalty stamps receive nahi honge.\n\n` +
        `🔧 *Abhi Scan Complete Karein:*\n` +
        `👉 ${reconnectUrl}\n\n` +
        `CustomerPilot Support: +91 9033304707`
      )

    case "PHONE_OFFLINE_OR_TIMEOUT":
      return (
        `📱 *CustomerPilot Alert: Store Phone Offline / WhatsApp Dropped*\n\n` +
        `Namaste *${storeName}*!\n\n` +
        `Aapka store WhatsApp socket disconnect lag raha hai. Aisa phone switch off hone, battery saver on hone, ya internet band hone par hota hai.\n\n` +
        `🔧 *Kripya Check Karein:*\n` +
        `1. Kya store phone Wi-Fi ya Mobile Data se connected hai?\n` +
        `2. Store phone me WhatsApp app open karke check karein.\n` +
        `3. Agar session disconnect dikhe toh re-link karein:\n` +
        `👉 ${reconnectUrl}\n\n` +
        `CustomerPilot Support: +91 9033304707`
      )

    case "ACCOUNT_RESTRICTED_403":
      return (
        `⚠️ *CustomerPilot URGENT Alert: WhatsApp Account Restriction*\n\n` +
        `Namaste *${storeName}*!\n\n` +
        `Aapke WhatsApp number par Meta authentication restriction (Code 403 Forbidden) detect hui hai.\n\n` +
        `Kripya turant CustomerPilot SuperAdmin helpline *+91 9033304707* par contact karein taaki hum aapke account ko securely recover kar sakein.`
      )

    case "INSTANCE_NOT_CONFIGURED":
    default:
      return (
        `⚙️ *CustomerPilot Alert: WhatsApp Device Not Linked*\n\n` +
        `Namaste *${storeName}*!\n\n` +
        `Aapke CustomerPilot account me store ka WhatsApp device abhi tak link nahi kiya gaya hai.\n\n` +
        `👉 *Abhi 1-Click Me Connect Karein:*\n` +
        `${reconnectUrl}\n\n` +
        `Helpline: +91 9033304707`
      )
  }
}

/**
 * Checks whether an alert was recently dispatched to this merchant to prevent spamming
 */
export async function checkAlertCooldown(
  merchantId: string,
  issueType: WhatsAppIssueType,
  cooldownHours: number = DEFAULT_COOLDOWN_HOURS
): Promise<{ inCooldown: boolean; lastAlertAt: Date | null }> {
  try {
    const cutoff = new Date(Date.now() - cooldownHours * 60 * 60 * 1000)
    const incidentTitle = `WHATSAPP_ALERT:${issueType}`

    const recentIncident = await db.incident.findFirst({
      where: {
        merchantId,
        title: incidentTitle,
        createdAt: { gte: cutoff }
      },
      orderBy: { createdAt: "desc" }
    })

    if (recentIncident) {
      return { inCooldown: true, lastAlertAt: recentIncident.createdAt }
    }

    return { inCooldown: false, lastAlertAt: null }
  } catch (e) {
    console.warn("[WhatsApp Monitor] Cooldown check fallback:", e)
    return { inCooldown: false, lastAlertAt: null }
  }
}

/**
 * Records that an alert was dispatched to enforce future cooldown
 */
export async function recordAlertIncident(
  merchantId: string,
  issueType: WhatsAppIssueType,
  recipientPhone: string,
  messageBody: string,
  metaMessageId?: string
): Promise<void> {
  const incidentTitle = `WHATSAPP_ALERT:${issueType}`
  const incidentNo = `INC-WA-${Date.now().toString(36).toUpperCase()}`

  try {
    await db.incident.create({
      data: {
        incidentNo,
        merchantId,
        severity: issueType === "ACCOUNT_RESTRICTED_403" ? "CRITICAL" : "HIGH",
        title: incidentTitle,
        rootCause: `WhatsApp state dropped with issue: ${issueType}. Alert sent to ${recipientPhone}`,
        resolution: "Pending merchant WhatsApp QR re-link in dashboard settings",
        status: "OPEN"
      }
    })

    await db.whatsAppMessage.create({
      data: {
        merchantId,
        toPhone: recipientPhone,
        template: `ALERT_${issueType}`,
        body: messageBody.slice(0, 500),
        status: metaMessageId ? "sent" : "recorded",
        metaMessageId: metaMessageId || `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sentAt: new Date()
      }
    })
  } catch (e: any) {
    console.error("[WhatsApp Monitor] Failed to record alert incident:", e.message)
  }
}

/**
 * Automatically marks existing open WhatsApp alert incidents as RESOLVED
 * when merchant successfully re-establishes connection (state: open)
 */
export async function resolveOpenWhatsAppIncidents(merchantId: string): Promise<number> {
  try {
    const updated = await db.incident.updateMany({
      where: {
        merchantId,
        title: { startsWith: "WHATSAPP_ALERT:" },
        status: "OPEN"
      },
      data: {
        status: "RESOLVED",
        resolution: "Merchant successfully re-linked WhatsApp device. Socket status: open."
      }
    })
    return updated.count
  } catch (e: any) {
    console.error("[WhatsApp Monitor] Error resolving incidents:", e.message)
    return 0
  }
}

/**
 * Dispatches WhatsApp message using CustomerPilot SuperAdmin instance
 */
export async function sendSuperAdminWhatsAppAlert(
  toPhone: string,
  messageText: string
): Promise<{ ok: boolean; metaMessageId?: string; error?: string }> {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY

  if (!evolutionUrl || !evolutionKey) {
    return { ok: false, error: "Evolution API not configured" }
  }

  const cleanToPhone = toPhone.replace(/\D/g, "")
  if (cleanToPhone.length < 10) {
    return { ok: false, error: `Invalid recipient phone number: ${toPhone}` }
  }

  // Resolve admin instance: check configured EVOLUTION_ADMIN_INSTANCE, or probe open admin instances
  let adminInstance = process.env.EVOLUTION_ADMIN_INSTANCE || process.env.EVOLUTION_INSTANCE || "cp_default"

  try {
    // Check if preferred admin instance is reachable, or query instances to find an open sender
    const fetchRes = await fetch(`${evolutionUrl}/instance/fetchInstances`, {
      headers: { apikey: evolutionKey }
    }).catch(() => null)

    if (fetchRes && fetchRes.ok) {
      const instances = await fetchRes.json().catch(() => [])
      if (Array.isArray(instances)) {
        // Look for explicitly configured admin instance first
        const matched = instances.find(i => i.name === adminInstance && i.connectionStatus === "open")
        if (!matched) {
          // Look for any admin / open instance
          const fallbackAdmin = instances.find(
            i => (i.name.includes("admin") || i.number === SUPERADMIN_NUMBER) && i.connectionStatus === "open"
          )
          if (fallbackAdmin) {
            adminInstance = fallbackAdmin.name
          }
        }
      }
    }

    const sendRes = await fetch(`${evolutionUrl}/message/sendText/${adminInstance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: evolutionKey
      },
      body: JSON.stringify({
        number: cleanToPhone,
        text: messageText
      })
    })

    const data = await sendRes.json().catch(() => ({}))
    if (sendRes.ok) {
      const messageId = data?.key?.id || data?.id
      return { ok: true, metaMessageId: messageId }
    } else {
      return { ok: false, error: data?.response?.message || data?.message || `HTTP ${sendRes.status}` }
    }
  } catch (err: any) {
    return { ok: false, error: err.message }
  }
}

/**
 * Main Diagnostic Engine: Inspects single merchant instance and determines diagnosis
 */
export function evaluateInstanceStatus(
  merchant: { id: string; name: string; phone?: string | null; whatsappPhone?: string | null; whatsappInstanceName?: string | null },
  instanceData?: {
    connectionStatus?: string
    state?: string
    disconnectionReasonCode?: number | null
    disconnectionAt?: string | null
    ownerJid?: string | null
  } | null
): { status: "HEALTHY" | "ISSUE_DETECTED"; issueType: WhatsAppIssueType | null; reasonDetail: string; disconnectionCode: number | null; disconnectionAt: string | null } {
  if (!merchant.whatsappInstanceName && !instanceData) {
    return {
      status: "ISSUE_DETECTED",
      issueType: "INSTANCE_NOT_CONFIGURED",
      reasonDetail: "Merchant has not configured any WhatsApp instance in CustomerPilot.",
      disconnectionCode: null,
      disconnectionAt: null
    }
  }

  if (!instanceData) {
    return {
      status: "ISSUE_DETECTED",
      issueType: "GATEWAY_UNREACHABLE",
      reasonDetail: `Instance "${merchant.whatsappInstanceName}" was not found on Evolution Gateway.`,
      disconnectionCode: null,
      disconnectionAt: null
    }
  }

  const rawState = (instanceData.connectionStatus || instanceData.state || "unknown").toLowerCase()
  const code = instanceData.disconnectionReasonCode ?? null
  const discAt = instanceData.disconnectionAt ?? null

  if (rawState === "open" && instanceData.ownerJid) {
    return {
      status: "HEALTHY",
      issueType: null,
      reasonDetail: "WhatsApp device is active and linked successfully.",
      disconnectionCode: null,
      disconnectionAt: null
    }
  }

  if (rawState === "connecting") {
    return {
      status: "ISSUE_DETECTED",
      issueType: "QR_SCAN_PENDING",
      reasonDetail: "WhatsApp connection is pending phone QR scan.",
      disconnectionCode: code,
      disconnectionAt: discAt
    }
  }

  if (code === 401) {
    return {
      status: "ISSUE_DETECTED",
      issueType: "SESSION_LOGGED_OUT_401",
      reasonDetail: "WhatsApp Web session was logged out or unlinked from the phone app (Code 401).",
      disconnectionCode: 401,
      disconnectionAt: discAt
    }
  }

  if (code === 403 || code === 405) {
    return {
      status: "ISSUE_DETECTED",
      issueType: "ACCOUNT_RESTRICTED_403",
      reasonDetail: `WhatsApp authentication restricted by Meta (Code ${code}).`,
      disconnectionCode: code,
      disconnectionAt: discAt
    }
  }

  return {
    status: "ISSUE_DETECTED",
    issueType: "PHONE_OFFLINE_OR_TIMEOUT",
    reasonDetail: `WhatsApp socket closed (Code ${code || "none"}). Phone may be offline, dead battery, or dropped connection.`,
    disconnectionCode: code,
    disconnectionAt: discAt
  }
}

/**
 * Fleet Diagnostic Engine:
 * Loops through all active merchants, fetches live state from Evolution API,
 * evaluates issues, and dispatches targeted alerts to affected merchants ONLY.
 */
export async function runFleetWhatsAppMonitor(options: {
  dryRun?: boolean
  forceSend?: boolean
  targetMerchantId?: string
  cooldownHours?: number
  appBaseUrl?: string
} = {}): Promise<FleetMonitorResult> {
  const {
    dryRun = false,
    forceSend = false,
    targetMerchantId,
    cooldownHours = DEFAULT_COOLDOWN_HOURS,
    appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in"
  } = options

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY

  // 1. Fetch fleet instances map from Evolution API
  const instanceMap = new Map<string, any>()
  if (evolutionUrl && evolutionKey) {
    try {
      const res = await fetch(`${evolutionUrl}/instance/fetchInstances`, {
        headers: { apikey: evolutionKey },
        signal: AbortSignal.timeout(8000)
      })
      if (res.ok) {
        const list = await res.json().catch(() => [])
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item.name) instanceMap.set(item.name, item)
          }
        }
      }
    } catch (e: any) {
      console.warn("[WhatsApp Monitor] Could not fetch Evolution instances:", e.message)
    }
  }

  // 2. Fetch merchants from database
  const whereClause: any = {}
  if (targetMerchantId) {
    whereClause.id = targetMerchantId
  }

  const merchants = await db.merchant.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      whatsappPhone: true,
      whatsappInstanceName: true
    },
    orderBy: { createdAt: "asc" }
  })

  const diagnoses: MerchantHealthDiagnosis[] = []
  let healthyCount = 0
  let issueCount = 0
  let alertsSentCount = 0
  let cooldownSkippedCount = 0

  for (const merchant of merchants) {
    const instanceData = merchant.whatsappInstanceName ? instanceMap.get(merchant.whatsappInstanceName) || null : null
    const evalResult = evaluateInstanceStatus(merchant, instanceData)

    const recipientPhone = merchant.whatsappPhone || ""

    if (evalResult.status === "HEALTHY") {
      healthyCount++
      // If healthy, automatically resolve any old open alert incidents
      await resolveOpenWhatsAppIncidents(merchant.id)

      diagnoses.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        merchantPhone: recipientPhone,
        instanceName: merchant.whatsappInstanceName,
        status: "HEALTHY",
        issueType: null,
        reasonDetail: evalResult.reasonDetail,
        disconnectionCode: null,
        disconnectionAt: null,
        alertAction: "NONE_HEALTHY"
      })
      continue
    }

    // ISSUE DETECTED for this specific merchant
    issueCount++
    const issueType = evalResult.issueType!
    const messageBody = buildTargetedAlertMessage({
      storeName: merchant.name,
      issueType,
      disconnectionCode: evalResult.disconnectionCode,
      appBaseUrl
    })

    // Check anti-spam cooldown unless forceSend is requested
    const cooldown = await checkAlertCooldown(merchant.id, issueType, cooldownHours)
    if (cooldown.inCooldown && !forceSend) {
      cooldownSkippedCount++
      diagnoses.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        merchantPhone: recipientPhone,
        instanceName: merchant.whatsappInstanceName,
        status: "ISSUE_DETECTED",
        issueType,
        reasonDetail: evalResult.reasonDetail,
        disconnectionCode: evalResult.disconnectionCode,
        disconnectionAt: evalResult.disconnectionAt,
        alertAction: "ALERT_SKIPPED_COOLDOWN",
        messageBody,
        lastAlertSentAt: cooldown.lastAlertAt
      })
      continue
    }

    if (dryRun) {
      diagnoses.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        merchantPhone: recipientPhone,
        instanceName: merchant.whatsappInstanceName,
        status: "ISSUE_DETECTED",
        issueType,
        reasonDetail: evalResult.reasonDetail,
        disconnectionCode: evalResult.disconnectionCode,
        disconnectionAt: evalResult.disconnectionAt,
        alertAction: "NONE_HEALTHY",
        messageBody
      })
      continue
    }

    // Dispatch WhatsApp Alert via SuperAdmin number (+91 9033304707)
    let alertAction: WhatsAppAlertAction = "ALERT_FAILED"
    let metaMessageId: string | undefined

    if (recipientPhone && recipientPhone.length >= 10) {
      const sendResult = await sendSuperAdminWhatsAppAlert(recipientPhone, messageBody)
      if (sendResult.ok) {
        alertAction = "ALERT_SENT"
        alertsSentCount++
        metaMessageId = sendResult.metaMessageId
      } else {
        console.warn(`[WhatsApp Monitor] Alert dispatch to ${recipientPhone} failed: ${sendResult.error}`)
      }
    }

    // Record incident and log message to guarantee audit trail
    await recordAlertIncident(merchant.id, issueType, recipientPhone, messageBody, metaMessageId)

    diagnoses.push({
      merchantId: merchant.id,
      merchantName: merchant.name,
      merchantPhone: recipientPhone,
      instanceName: merchant.whatsappInstanceName,
      status: "ISSUE_DETECTED",
      issueType,
      reasonDetail: evalResult.reasonDetail,
      disconnectionCode: evalResult.disconnectionCode,
      disconnectionAt: evalResult.disconnectionAt,
      alertAction,
      messageBody,
      lastAlertSentAt: new Date()
    })
  }

  return {
    timestamp: new Date().toISOString(),
    totalMerchants: merchants.length,
    healthyCount,
    issueCount,
    alertsSentCount,
    cooldownSkippedCount,
    diagnoses
  }
}
