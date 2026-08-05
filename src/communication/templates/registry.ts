export const TEMPLATE_REGISTRY: Record<string, { category: string; components: string[] }> = {
  VIP_WELCOME: { category: "MARKETING", components: ["body"] },
  OTP_VERIFICATION: { category: "AUTHENTICATION", components: ["body", "button"] },
  REWARD_READY: { category: "MARKETING", components: ["body", "header"] },
  reward_ready: { category: "MARKETING", components: ["body", "header"] },
  STAMP_ADDED: { category: "MARKETING", components: ["body", "header"] },
  stamp_earned: { category: "MARKETING", components: ["body", "header"] },
  qr_welcome: { category: "MARKETING", components: ["body"] },
  REVIEW_REQUEST: { category: "MARKETING", components: ["body", "button"] },
  review_thank_you: { category: "MARKETING", components: ["body"] },
  BIRTHDAY_REMINDER: { category: "MARKETING", components: ["body"] },
  FESTIVAL_GREETING: { category: "MARKETING", components: ["body"] },
  MORNING_REPORT: { category: "TRANSACTIONAL", components: ["body"] },
  WINBACK_OFFER: { category: "MARKETING", components: ["body", "button"] },
  REMINDER: { category: "TRANSACTIONAL", components: ["body"] },
  REFERRAL_INVITE: { category: "MARKETING", components: ["body", "button"] }
}
