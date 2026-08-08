// CustomerPilot System Default WhatsApp Journey Templates

export interface SystemTemplateDefinition {
  templateKey: string
  templateName: string
  triggerEvent: string
  category: "AUTHENTICATION" | "TRANSACTIONAL" | "MARKETING" | "ENGAGEMENT"
  messageBody: string
  language: string
  variables: string[]
}

export const SYSTEM_DEFAULT_TEMPLATES: SystemTemplateDefinition[] = [
  {
    templateKey: "WELCOME_MSG",
    templateName: "Welcome Loyalty Registration",
    triggerEvent: "Customer scans QR code for the first time",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "storeAddress"],
    messageBody:
      "Welcome to *{{merchantName}}*! 🎉 Hi {{customerName}}, thank you for joining our VIP loyalty program. Visit us anytime at {{storeAddress}} to earn stamps on every purchase!",
  },
  {
    templateKey: "OTP_VERIFICATION",
    templateName: "OTP Phone Verification",
    triggerEvent: "Customer registers or logs into wallet",
    category: "AUTHENTICATION",
    language: "en",
    variables: ["customerName", "merchantName", "otpCode"],
    messageBody:
      "Hi {{customerName}}, your verification code for *{{merchantName}}* is *{{otpCode}}*. Do not share this code with anyone.",
  },
  {
    templateKey: "REGISTRATION_SUCCESS",
    templateName: "Registration Confirmation",
    triggerEvent: "Customer completes mobile registration",
    category: "TRANSACTIONAL",
    language: "en",
    variables: ["customerName", "merchantName"],
    messageBody:
      "Hi {{customerName}} ❤️ Your VIP Digital Loyalty Pass for *{{merchantName}}* is now active! Show your phone at checkout to collect stamps automatically.",
  },
  {
    templateKey: "FIRST_STAMP_EARNED",
    templateName: "First Stamp Bonus Earned",
    triggerEvent: "Customer earns their very first stamp",
    category: "LOYALTY" as any,
    language: "en",
    variables: ["customerName", "merchantName", "stampCount", "requiredStamp", "remainingStamps"],
    messageBody:
      "Congratulations {{customerName}}! 🎯 You earned your first stamp at *{{merchantName}}*! Total: {{stampCount}}/{{requiredStamp}} stamps. Only {{remainingStamps}} more to unlock your first reward!",
  },
  {
    templateKey: "STAMP_EARNED",
    templateName: "Stamp Earned After Purchase",
    triggerEvent: "Staff approves a purchase and awards stamps",
    category: "TRANSACTIONAL",
    language: "en",
    variables: ["customerName", "merchantName", "stampCount", "requiredStamp", "remainingStamps"],
    messageBody:
      "Hi {{customerName}}! 🌟 Stamp collected at *{{merchantName}}*! Total stamps: *{{stampCount}}/{{requiredStamp}}*. Only {{remainingStamps}} more stamps to unlock your reward!",
  },
  {
    templateKey: "REWARD_UNLOCKED",
    templateName: "Reward Unlocked / Ready",
    triggerEvent: "Customer reaches required stamp threshold",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "rewardName", "couponCode"],
    messageBody:
      "🎉 *REWARD UNLOCKED!* Hi {{customerName}}, you've completed your stamp card at *{{merchantName}}*! Your reward: *{{rewardName}}*. Show coupon code *{{couponCode}}* on your next visit to claim!",
  },
  {
    templateKey: "REWARD_REMINDER",
    templateName: "Reward Unclaimed Reminder",
    triggerEvent: "Customer has an unredeemed unlocked reward",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "rewardName", "storeAddress"],
    messageBody:
      "Hi {{customerName}} 👋 You have an unredeemed *{{rewardName}}* waiting for you at *{{merchantName}}*! Drop by {{storeAddress}} soon to treat yourself!",
  },
  {
    templateKey: "REWARD_EXPIRY_REMINDER",
    templateName: "Reward Expiry Reminder",
    triggerEvent: "Unlocked reward is expiring in 3 days",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "rewardName", "rewardExpiry", "couponCode"],
    messageBody:
      "⏰ *Reward Expiring Soon!* Hi {{customerName}}, your reward *{{rewardName}}* at *{{merchantName}}* expires on {{rewardExpiry}}. Use code *{{couponCode}}* before it's gone!",
  },
  {
    templateKey: "REVIEW_REQUEST",
    templateName: "Google Review Request",
    triggerEvent: "Sent after configured delay following purchase approval",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "googleReviewLink"],
    messageBody:
      "Hi {{customerName}} ❤️ Hope you loved your recent purchase from *{{merchantName}}*!\n\nWould you like AI to prepare your Google Review? Reply *YES* to see the draft and unlock a 🎁 *Bonus Stamp* on your VIP Card!",
  },
  {
    templateKey: "REVIEW_THANK_YOU",
    templateName: "Google Review Thank You",
    triggerEvent: "Customer submits a Google Review",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName"],
    messageBody:
      "Thank you so much {{customerName}}! ⭐ Your 5-star Google review means the world to *{{merchantName}}*. A bonus stamp has been added to your card! 🎉",
  },
  {
    templateKey: "BIRTHDAY_WISH",
    templateName: "Birthday Wish & Special Treat",
    triggerEvent: "Sent on customer's birthday morning (9 AM)",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName", "rewardName", "couponCode"],
    messageBody:
      "🎂 *HAPPY BIRTHDAY {{customerName}}!* 🎁 Team *{{merchantName}}* wishes you a joyful day! Here is your birthday gift: *{{rewardName}}* (Code: *{{couponCode}}*). Visit us this week to celebrate!",
  },
  {
    templateKey: "FESTIVAL_GREETING",
    templateName: "Festival Greeting & Offer",
    triggerEvent: "Sent on major festival days",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName", "offerName", "storeAddress"],
    messageBody:
      "✨ *Happy Festival Season {{customerName}}!* 🪔 Celebrating with *{{merchantName}}*! Enjoy our special offer: *{{offerName}}*. Visit us at {{storeAddress}}!",
  },
  {
    templateKey: "VIP_UPGRADE",
    templateName: "VIP Tier Upgrade Notification",
    triggerEvent: "Customer unlocks a higher VIP Tier level",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "offerName"],
    messageBody:
      "🌟 *VIP TIER UPGRADE!* Congratulations {{customerName}}, you are now a Gold VIP member at *{{merchantName}}*! You've unlocked exclusive perk: *{{offerName}}*.",
  },
  {
    templateKey: "REFERRAL_INVITATION",
    templateName: "Referral Program Invitation",
    triggerEvent: "Customer invites a friend to join loyalty program",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "referralLink"],
    messageBody:
      "Hi {{customerName}}! Invite your friends to *{{merchantName}}* and earn FREE bonus stamps when they visit! Share your invite link: {{referralLink}}",
  },
  {
    templateKey: "REFERRAL_SUCCESS",
    templateName: "Referral Friend Joined",
    triggerEvent: "Referred friend joins loyalty program",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName"],
    messageBody:
      "Great news {{customerName}}! Your friend just joined *{{merchantName}}* VIP program! Once they make their first purchase, your bonus stamp will be awarded! 🎯",
  },
  {
    templateKey: "REFERRAL_REWARD",
    templateName: "Referral Bonus Stamp Awarded",
    triggerEvent: "Referred friend completes first purchase",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "stampCount"],
    messageBody:
      "🎁 *Referral Reward Awarded!* Hi {{customerName}}, your friend made a purchase at *{{merchantName}}*. A bonus stamp has been credited! Total stamps: {{stampCount}}.",
  },
  {
    templateKey: "INACTIVE_CUSTOMER_REMINDER",
    templateName: "Inactive Customer Gentle Nudge",
    triggerEvent: "Customer hasn't visited in 14 days",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName", "remainingStamps", "rewardName"],
    messageBody:
      "We miss you {{customerName}}! ❤️ It's been a while since your last visit to *{{merchantName}}*. You're only {{remainingStamps}} stamps away from *{{rewardName}}*. Come say hi!",
  },
  {
    templateKey: "WINBACK_CAMPAIGN",
    templateName: "Win-back Special Offer",
    triggerEvent: "Customer hasn't visited in 30 days",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName", "offerName", "couponCode", "offerExpiry"],
    messageBody:
      "🔥 *Special Comeback Offer for {{customerName}}!* We want you back at *{{merchantName}}*! Enjoy *{{offerName}}* on your next visit with code *{{couponCode}}*. Valid until {{offerExpiry}}.",
  },
  {
    templateKey: "SPECIAL_OFFER",
    templateName: "Special Promotional Offer",
    triggerEvent: "Merchant sends custom promotional offer",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "offerName", "offerExpiry"],
    messageBody:
      "📣 Hi {{customerName}}, special announcement from *{{merchantName}}*! Enjoy *{{offerName}}*. Limited time offer valid until {{offerExpiry}}. See you soon!",
  },
  {
    templateKey: "CUSTOM_BROADCAST",
    templateName: "Custom Broadcast Message",
    triggerEvent: "Merchant broadcasts custom announcement",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "businessName", "storeAddress"],
    messageBody:
      "Hi {{customerName}}, greetings from *{{merchantName}}*! Thank you for being a valued customer. Visit us anytime at {{storeAddress}}.",
  },
]
