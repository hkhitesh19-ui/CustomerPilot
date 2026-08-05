import { MessagePayload, DeliveryResult } from "../../types"
import { db } from "@/lib/db"

/**
 * Real Evolution API Integration
 * Communicates with the actual Evolution API Docker container at 200.97.170.53:8080
 * Multi-Tenant Support: Naming convention CP_M + CountryCode + Number (e.g. CP_M917203824012)
 */
export class EvolutionService {
  private baseUrl: string
  private apiKey: string
  private defaultInstanceName: string

  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080"
    this.apiKey = process.env.EVOLUTION_API_KEY || process.env.EVOLUTION_GLOBAL_API_KEY || "429683C4C977415CAAFCCE10F7D57E11"
    this.defaultInstanceName = process.env.EVOLUTION_INSTANCE_NAME || "CustomerPilot_Main"
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      "apikey": this.apiKey
    }
  }

  /**
   * Resolves the dedicated instanceName for a merchant
   * Format: CP_M917203824012 (CP_M + CountryCode + WhatsApp Phone Number)
   */
  async getMerchantInstanceName(merchantId?: string): Promise<string> {
    if (!merchantId) return this.defaultInstanceName
    try {
      const merchant = await db.merchant.findUnique({
        where: { id: merchantId },
        select: { whatsappInstanceName: true, whatsappPhone: true }
      })
      if (merchant?.whatsappInstanceName) {
        return merchant.whatsappInstanceName
      }
      if (merchant?.whatsappPhone) {
        const cleanPhone = merchant.whatsappPhone.replace(/\D/g, "")
        if (cleanPhone.length >= 10) {
          return `CP_M${cleanPhone}`
        }
      }
    } catch {}
    return `CP_M_${merchantId}`
  }

  /**
   * Checks the connection status of an instance
   */
  async getSessionStatus(merchantId?: string): Promise<"connected" | "disconnected" | "qr"> {
    try {
      const instanceName = await this.getMerchantInstanceName(merchantId)
      const response = await fetch(`${this.baseUrl}/instance/connectionState/${instanceName}`, {
        headers: this.headers
      })
      if (!response.ok) return "disconnected"
      const data = await response.json()
      if (data?.instance?.state === "open") return "connected"
      if (data?.instance?.state === "connecting") return "qr"
      return "disconnected"
    } catch {
      return "disconnected"
    }
  }

  /**
   * Renders a template into a human-readable WhatsApp message body
   */
  private renderTemplate(templateName: string, variables: Record<string, any> = {}, metadata: Record<string, any> = {}): string {
    const name = variables.name || "Valued Customer"
    const bizName = metadata.bizName || "our store"
    const stamps = variables.stamps || 1
    const totalStamps = variables.totalStamps || stamps
    const stampsRequired = variables.stampsRequired || 10
    const rewardName = variables.rewardName || "FREE special treat"
    const stampValue = variables.stampValue || 500

    const templates: Record<string, string> = {
      qr_welcome: `🎉 Welcome to *${bizName} VIP Club*, ${name}!\n\nYou're now a VIP member. No app required!\n\n⭐ Every ₹${stampValue} = 1 Stamp → Collect ${stampsRequired} stamps → Claim *${rewardName}*\n\nWait for the merchant to tap & award your stamp after billing. 🙏`,

      stamp_earned: `✅ *Stamp Added!* Hi ${name} 👋\n\n⭐ *${stamps} Stamp${stamps > 1 ? "s" : ""} Added*\n📊 Progress: *${totalStamps} / ${stampsRequired}*\n🎁 Goal: *${rewardName}*\n\n${totalStamps >= stampsRequired
        ? `🎊 *Congratulations!* You've earned your reward! Show this message to claim your *${rewardName}*.`
        : `Keep visiting — ${stampsRequired - totalStamps} more stamp${stampsRequired - totalStamps > 1 ? "s" : ""} to go!`}\n\nThank you for visiting *${bizName}* ❤️`,

      reward_ready: `🎊 *Reward Ready!* Hi ${name}!\n\nYou've collected all ${stampsRequired} stamps!\n\n🎁 *Your Reward: ${rewardName}*\n\nPlease show this message to claim your reward at *${bizName}*.\n\nThank you for being a loyal VIP member! 🌟`,

      REVIEW_REQUEST: `Hi ${name} ❤️\n\nHope you loved your experience at *${bizName}*!\n\nWould you like to share your thoughts? Your review means the world to us.\n\n⭐ Bonus: Leave a review and earn *+1 Bonus Stamp*!\n\nTap to review: {reviewUrl}`,

      WINBACK_OFFER: `Hi ${name} 👋\n\nWe miss you at *${bizName}*! 😊\n\nIt's been a while since your last visit. Come back and we'll add a *Bonus Stamp* just for returning!\n\nYour loyalty card is waiting. See you soon! 🎁`,

      MORNING_REPORT: `☀️ *Good Morning!*\n\nYour daily CustomerPilot summary is ready.\n\n📊 Check your dashboard for today's insights.\n\n— CustomerPilot`,

      REMINDER: `👋 Hi ${name}!\n\nYou have stamps waiting at *${bizName}*. Don't forget to visit and keep collecting!\n\nYour reward is getting closer! 🎁`,

      BIRTHDAY_REMINDER: `🎂 Happy Birthday ${name}! 🎉\n\nWishing you a wonderful day from all of us at *${bizName}*!\n\nCome visit us for a special birthday surprise! 🎁`,

      REFERRAL_INVITE: `🌟 Hi ${name}!\n\nYou're a valued VIP at *${bizName}*. Refer a friend and you both get *Bonus Stamps*!\n\nShare your referral code and start earning more rewards.`,
    }

    return templates[templateName] || `Hi ${name}! Thank you for choosing *${bizName}*. 🙏`
  }

  /**
   * Sends a text message using the merchant's dedicated instance (CP_M917203824012)
   */
  async sendMessage(merchantId: string, payload: MessagePayload): Promise<DeliveryResult> {
    const instanceName = await this.getMerchantInstanceName(merchantId)
    const textBody = this.renderTemplate(
      payload.templateName,
      payload.variables || {},
      { ...payload.metadata, merchantId }
    )

    try {
      let targetInstance = instanceName
      
      // Send text with merchant's dedicated instance
      let response = await fetch(`${this.baseUrl}/message/sendText/${targetInstance}`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          number: payload.to,
          text: textBody
        })
      })

      // Fallback to default main instance if merchant instance is not connected
      if (!response.ok && targetInstance !== this.defaultInstanceName) {
        console.log(`[Evolution] Merchant instance ${targetInstance} failed (${response.status}). Falling back to ${this.defaultInstanceName}`)
        response = await fetch(`${this.baseUrl}/message/sendText/${this.defaultInstanceName}`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({
            number: payload.to,
            text: textBody
          })
        })
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.message || `Evolution API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        messageId: data?.key?.id || `evo_${Date.now()}`,
        status: "sent"
      }
    } catch (error: any) {
      console.error(`[Evolution] Failed to send to ${payload.to}:`, error.message)
      return {
        success: false,
        status: "failed",
        error: error.message
      }
    }
  }
}

export const evolution = new EvolutionService()
