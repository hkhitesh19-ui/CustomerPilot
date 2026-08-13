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
    templateKey: "QR_WELCOME_NEW_DETECTED",
    templateName: "Welcome New (Name Detected)",
    triggerEvent: "Customer scans QR code for the first time with auto-detected name",
    category: "MARKETING",
    language: "en",
    variables: ["businessName", "rewardPoints", "requiredStamp", "rewardName", "detectedName"],
    messageBody:
      "🎉 *You're invited to join the {{businessName}} VIP Club.*\n\nIt's completely FREE and takes less than 10 seconds. Thank you for visiting us! 🙏\n\n*How it works:*\n⭐ Every ₹{{rewardPoints}} purchase = 1 Stamp\n🎁 Collect {{requiredStamp}} Stamps → Claim *{{rewardName}}*\n🌟 Leave a Google Review → Earn Bonus Stamps!\n\nIs your name *{{detectedName}}*?\n\nReply *YES* to confirm, or type your name below:",
  },
  {
    templateKey: "QR_WELCOME_NEW_UNKNOWN",
    templateName: "Welcome New (Name Unknown)",
    triggerEvent: "Customer scans QR code for the first time without detected name",
    category: "MARKETING",
    language: "en",
    variables: ["businessName", "rewardPoints", "requiredStamp", "rewardName"],
    messageBody:
      "🎉 *You're invited to join the {{businessName}} VIP Club.*\n\nIt's completely FREE and takes less than 10 seconds. Thank you for visiting us! 🙏\n\n*How it works:*\n⭐ Every ₹{{rewardPoints}} purchase = 1 Stamp\n🎁 Collect {{requiredStamp}} Stamps → Claim *{{rewardName}}*\n🌟 Leave a Google Review → Earn Bonus Stamps!\n\nBefore we activate your FREE VIP Membership, *please share your name.*\n\nReply with your name (e.g. Rahul):",
  },
  {
    templateKey: "QR_WELCOME_RETURNING",
    templateName: "Welcome Returning Customer",
    triggerEvent: "Existing customer scans QR code to join queue",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "businessName"],
    messageBody:
      "👋 Welcome back, *{{customerName}}*! ❤️\n\nYou're in the queue at *{{businessName}}*.\n\nOur team will add your stamps after billing. Thank you for being a loyal VIP member! 🌟",
  },
  {
    templateKey: "QUEUE_DUPLICATE",
    templateName: "Already in Queue",
    triggerEvent: "Customer scans QR code while already waiting in queue",
    category: "TRANSACTIONAL",
    language: "en",
    variables: ["merchantName"],
    messageBody:
      "👋 You're already in the queue at *{{merchantName}}*!\n\nPlease wait — our team will serve you shortly. 🙏",
  },
  {
    templateKey: "NAME_CONFIRMED",
    templateName: "Name Confirmed & Account Active",
    triggerEvent: "Customer confirms or provides their name",
    category: "TRANSACTIONAL",
    language: "en",
    variables: ["customerName", "merchantName"],
    messageBody:
      "✅ *Got it! Welcome, {{customerName}}!* 🎉\n\nYour FREE VIP Membership is now active at *{{merchantName}}*.\n\nYou're in the queue. Our team will add your first stamp after billing. 🌟",
  },
  {
    templateKey: "STAMP_EARNED",
    templateName: "Stamp Earned After Purchase",
    triggerEvent: "Staff approves a purchase and awards stamps",
    category: "TRANSACTIONAL",
    language: "en",
    variables: ["customerName", "merchantName", "visitNumber", "stampCount", "totalStamps", "requiredStamp", "rewardName", "remainingStamps"],
    messageBody:
      "⭐ *Congratulations {{customerName}}!* ❤️\n\nWelcome back to *{{merchantName}} VIP Club* (Visit #{{visitNumber}}).\n\n✅ *{{stampCount}} Stamp(s) Added*\n📊 *Wallet:* {{totalStamps}} / {{requiredStamp}} Stamps\n🎁 *Next Reward:* {{rewardName}} ({{remainingStamps}} more stamp(s) needed)\n\nThank you for visiting us! 🙏",
  },
  {
    templateKey: "REWARD_UNLOCKED",
    templateName: "Reward Unlocked / Ready",
    triggerEvent: "Customer reaches required stamp threshold",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "requiredStamp", "visitNumber", "rewardName"],
    messageBody:
      "🎉 *CONGRATULATIONS {{customerName}}!* ❤️\n\nWelcome to *{{merchantName}} VIP Club*.\n\nYou've collected all *{{requiredStamp}}/{{requiredStamp}} Stamps*! 🏆 (Visit #{{visitNumber}})\n\n🎁 *YOUR REWARD:* {{rewardName}}\nShow this message at the counter to claim your FREE treat! 🌟",
  },
  {
    templateKey: "REVIEW_REQUEST",
    templateName: "Google Review Request",
    triggerEvent: "Sent after configured delay following purchase approval",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName"],
    messageBody:
      "Hi {{customerName}} ❤️\n\nHope you loved your recent purchase from *{{merchantName}}*!\n\nWould you like AI to prepare your Google Review? Reply *YES* to see the draft and unlock a 🎁 *Bonus Stamp* on your VIP Card!",
  },
  {
    templateKey: "REVIEW_DRAFT",
    templateName: "Google Review Draft Link",
    triggerEvent: "Customer replies YES to review request",
    category: "MARKETING",
    language: "en",
    variables: ["reviewUrl"],
    messageBody:
      "Awesome! 🌟 AI has prepared your personalized 5-Star Google Review.\n\nTap the link below to view, edit, or 1-Click Post it on Google Maps:\n{{reviewUrl}}\n\n🎁 *Bonus Stamp* will be automatically added to your VIP Card after posting!",
  },
  {
    templateKey: "WINBACK_15_DAY",
    templateName: "Win-back 15 Day Reminder",
    triggerEvent: "Customer hasn't visited in 15 days",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName"],
    messageBody:
      "Hi {{customerName}} ❤️\n\nWe miss you at *{{merchantName}}*! 😊\n\nIt's been 15 days since your last visit. We've unlocked a *Bonus Surprise Stamp* for your next visit!\n\nCome back and claim your reward! 🎁",
  },
  {
    templateKey: "MORNING_REPORT",
    templateName: "Merchant Morning Report",
    triggerEvent: "Sent to merchant daily at 9:00 AM",
    category: "SYSTEM" as any,
    language: "en",
    variables: ["customerName", "count", "revenue"], // customerName used as Owner Name here
    messageBody:
      "Good Morning {{customerName}} ☀️\n\n📊 *Yesterday's Performance Summary:*\n👥 Total Customers: *{{count}}*\n🔄 Repeat Customers: *{{count}}*\n💰 Revenue Earned: *₹{{revenue}}*\n⭐ Reviews Received: *{{count}}*\n\nPotential Repeat Revenue waiting: *₹{{revenue}}*\n\nLog in to your CustomerPilot Dashboard to send Win-Back reminders! 🚀",
  },
  {
    templateKey: "WINBACK_30_DAY",
    templateName: "Win-back 30 Day Reminder",
    triggerEvent: "Customer hasn't visited in 30 days",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName"],
    messageBody:
      "Hi {{customerName}} ❤️\n\nWe miss you at *{{merchantName}}*! 😊\n\nIt's been a month since your last visit. We've unlocked a *Bonus Surprise Stamp* for your next visit!\n\nCome back and claim your reward! 🎁",
  },
  {
    templateKey: "WINBACK_60_DAY",
    templateName: "Win-back 60 Day Reminder",
    triggerEvent: "Customer hasn't visited in 60 days",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName"],
    messageBody:
      "Hi {{customerName}} ❤️\n\nWe miss you at *{{merchantName}}*! 😊\n\nIt's been 60 days since your last visit. We've unlocked a *Bonus Surprise Stamp* for your next visit!\n\nCome back and claim your reward! 🎁",
  },
  {
    templateKey: "WINBACK_90_DAY",
    templateName: "Win-back 90 Day Reminder",
    triggerEvent: "Customer hasn't visited in 90 days",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName"],
    messageBody:
      "Hi {{customerName}} ❤️\n\nWe miss you at *{{merchantName}}*! 😊\n\nIt's been 90 days since your last visit. We've unlocked a *Bonus Surprise Stamp* for your next visit!\n\nCome back and claim your reward! 🎁",
  },
  {
    templateKey: "ALMOST_THERE_REMINDER",
    templateName: "Almost There Reminder (2 Stamps Left)",
    triggerEvent: "Sent to customers who haven't visited in 7 days and only need 2 stamps",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName", "remainingStamps", "validityDaysLeft"],
    messageBody:
      "Hi {{customerName}}! 🌟\n\nYou're so close! You only need *{{remainingStamps}} more stamps* to unlock your free reward at *{{merchantName}}*.\n\nYour stamp card is valid for another *{{validityDaysLeft}} days*. Come visit us soon! 🏃‍♂️💨",
  },
  {
    templateKey: "EXPIRY_WARNING_7_DAY",
    templateName: "Stamp Card Expiry Warning (7 Days Left)",
    triggerEvent: "Sent to customers whose stamp card expires in exactly 7 days",
    category: "ENGAGEMENT",
    language: "en",
    variables: ["customerName", "merchantName", "rewardName", "stampsCollected"],
    messageBody:
      "⚠️ *Action Required {{customerName}}*!\n\nYour {{stampsCollected}} stamps at *{{merchantName}}* will expire in exactly *7 days*.\n\nDon't lose your progress towards your *{{rewardName}}*! Visit us this week to keep your stamps active. ⏳",
  },
  {
    templateKey: "LEVEL_COMPLETE",
    templateName: "Level Complete & Next Level Kickstart",
    triggerEvent: "Sent when customer completes a card and unlocks next loyalty level with kickstart bonus",
    category: "MARKETING",
    language: "en",
    variables: ["customerName", "merchantName", "nextLevelName", "kickstartStamps"],
    messageBody:
      "🏆 *LEVEL COMPLETE!* 🌟\n\nCongratulations {{customerName}}! You've unlocked *{{nextLevelName}}* at *{{merchantName}}*!\n\n🎁 Your new level card has been activated with *+{{kickstartStamps}} Advance Bonus Stamp(s)* pre-credited! Keep collecting to win your next reward! 🚀",
  },
]
