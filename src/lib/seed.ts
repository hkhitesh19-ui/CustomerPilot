// @ts-nocheck
// CustomerPilot V6 — Seed script
// Run with: bun run src/lib/seed.ts
//
// Seeds a demo merchant ("Sweet Crumb Bakery") with:
//   - 3 staff (Owner, Manager, Cashier)
//   - 6 customers across the lifecycle (active, dormant, churned, VIP)
//   - 1 stamp card template
//   - 4 rewards (one out-of-stock)
//   - Sample bills, redemptions, referrals
//   - 3 VIP tiers (Silver/Gold/Platinum)
//   - 2 birthday schedules
//   - 4 Google reviews (mixed ratings, one with photo)
//   - 3 win-back escalations at different stages
//   - 5+ achievements for top customers
//   - 1 support ticket (resolved)
//   - Onboarding checklist (mostly complete)

import { PrismaClient } from "@prisma/client"
import { fastStartOnboarding } from "@/lib/onboarding-engine"

const db = new PrismaClient()

function randomCode(prefix: string) {
  return (
    prefix +
    "-" +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  )
}

async function main() {
  console.log("🌱 Seeding CustomerPilot V6...")

  // Wipe
  await db.waitingCustomer.deleteMany()
  await db.whatsAppMessage.deleteMany()
  await db.auditLog.deleteMany()
  await db.referral.deleteMany()
  await db.redemption.deleteMany()
  await db.stamp.deleteMany()
  await db.customerStampCard.deleteMany()
  await db.bill.deleteMany()
  await db.reward.deleteMany()
  await db.stampCard.deleteMany()
  await db.customer.deleteMany()
  await db.staff.deleteMany()
  await db.subscription.deleteMany()
  await db.merchant.deleteMany()
  await db.review.deleteMany()
  await db.birthday.deleteMany()
  await db.vipTier.deleteMany()
  await db.winBackEscalation.deleteMany()
  await db.achievement.deleteMany()
  await db.supportTicket.deleteMany()
  await db.onboardingStep.deleteMany()

  // Merchant (trial → active, onboarding completed)
  const merchant = await db.merchant.create({
    data: {
      name: "Sweet Crumb Bakery",
      businessType: "bakery",
      whatsappPhone: "+919876543210",
      plan: "growth",
      status: "active",
      trialEndsAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // trial ended 14 days ago
      onboardingCompleted: true,
    },
  })

  const planObj = await db.plan.upsert({
    where: { name: "growth" },
    update: {},
    create: {
      name: "growth",
      price: 1999,
      features: "queue,stamps,reviews",
    }
  })

  // Subscription (paid, 6 months, renews in 5.5 months)
  await db.subscription.create({
    data: {
      merchantId: merchant.id,
      planId: planObj.id,
      amount: 5400,
      currency: "INR",
      status: "active",
      renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 165),
    },
  })

  // Staff
  const owner = await db.staff.create({
    data: { merchantId: merchant.id, name: "Ravi (Owner)", phone: "+919900000001", pin: "1111", role: "OWNER" },
  })
  const manager = await db.staff.create({
    data: { merchantId: merchant.id, name: "Sunita (Manager)", phone: "+919900000002", pin: "2222", role: "MANAGER" },
  })
  const cashier = await db.staff.create({
    data: { merchantId: merchant.id, name: "Priya (Cashier)", phone: "+919900000003", pin: "3333", role: "CASHIER" },
  })

  // Stamp card template — bakery style (Cake Lover's Card)
  const card = await db.stampCard.create({
    data: {
      merchantId: merchant.id,
      name: "Cake Lover's Card",
      stampsRequired: 9,
      rewardName: "1 Free Cupcake",
      stampsPerBill: "1",
      color: "rose",
      active: true,
    },
  })

  // Rewards catalog
  const r1 = await db.reward.create({
    data: { merchantId: merchant.id, name: "Free Cupcake", description: "Any flavor of the day", stampsCost: 1, stock: 999, requiresManagerApproval: false },
  })
  const r2 = await db.reward.create({
    data: { merchantId: merchant.id, name: "Free Pastry", description: "Croissant or muffin", stampsCost: 1, stock: 24, requiresManagerApproval: false },
  })
  const r3 = await db.reward.create({
    data: { merchantId: merchant.id, name: "20% off Birthday Cake", description: "Pre-order only", stampsCost: 3, stock: 12, requiresManagerApproval: true },
  })
  const r4 = await db.reward.create({
    data: { merchantId: merchant.id, name: "1kg Premium Cake", description: "Take-home celebration cake", stampsCost: 5, stock: 0, requiresManagerApproval: true },
  })

  // Customers — varied lifecycle stages
  const c1 = await db.customer.create({
    data: {
      merchantId: merchant.id,
      name: "Meera Iyer",
      phone: "+919822200001",
      referralCode: randomCode("MEE"),
      acquisitionChan: "walk_in",
      lifetimeStamps: 42,
      lifetimeSpend: 5400,
      lifetimeRedemptions: 4,
      currentStreak: 6,
      longestStreak: 8,
      birthday: "08-15",
      favorite: true,
      vipTier: "gold",
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  })
  const c2 = await db.customer.create({
    data: {
      merchantId: merchant.id,
      name: "Rohan Shah",
      phone: "+919822200002",
      referralCode: randomCode("ROH"),
      acquisitionChan: "referral",
      referredById: c1.id,
      lifetimeStamps: 12,
      lifetimeSpend: 1450,
      lifetimeRedemptions: 1,
      currentStreak: 2,
      longestStreak: 3,
      birthday: "12-03",
      vipTier: "silver",
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  })
  const c3 = await db.customer.create({
    data: {
      merchantId: merchant.id,
      name: "Sneha Patel",
      phone: "+919822200003",
      referralCode: randomCode("SNE"),
      acquisitionChan: "import",
      lifetimeStamps: 6,
      lifetimeSpend: 720,
      lifetimeRedemptions: 0,
      birthday: "03-22",
      vipTier: "none",
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    },
  })
  const c4 = await db.customer.create({
    data: {
      merchantId: merchant.id,
      name: "Arjun Nair",
      phone: "+919822200004",
      referralCode: randomCode("ARJ"),
      acquisitionChan: "walk_in",
      lifetimeStamps: 18,
      lifetimeSpend: 2100,
      lifetimeRedemptions: 2,
      currentStreak: 0,
      longestStreak: 5,
      vipTier: "silver",
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
      status: "dormant",
    },
  })
  const c5 = await db.customer.create({
    data: {
      merchantId: merchant.id,
      name: "Kavya Reddy",
      phone: "+919822200005",
      referralCode: randomCode("KAV"),
      acquisitionChan: "campaign",
      lifetimeStamps: 75,
      lifetimeSpend: 9800,
      lifetimeRedemptions: 8,
      currentStreak: 12,
      longestStreak: 12,
      birthday: "07-09",
      favorite: true,
      vipTier: "platinum",
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
  })
  const c6 = await db.customer.create({
    data: {
      merchantId: merchant.id,
      name: "Vikram Desai",
      phone: "+919822200006",
      referralCode: randomCode("VIK"),
      acquisitionChan: "walk_in",
      lifetimeStamps: 3,
      lifetimeSpend: 320,
      lifetimeRedemptions: 0,
      vipTier: "none",
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 95),
      status: "churned",
    },
  })

  // Pre-populate Meera's active card with 7 stamps (2 away from reward)
  const mCard = await db.customerStampCard.create({
    data: { customerId: c1.id, stampCardId: card.id, merchantId: merchant.id, stampsCollected: 7, completed: false },
  })
  for (let i = 0; i < 7; i++) {
    await db.stamp.create({
      data: { customerId: c1.id, stampCardId: card.id, customerStampCardId: mCard.id, merchantId: merchant.id, source: "bill" },
    })
  }

  // Kavya has a completed card ready to redeem
  const kCard = await db.customerStampCard.create({
    data: { customerId: c5.id, stampCardId: card.id, merchantId: merchant.id, stampsCollected: 9, completed: true },
  })
  for (let i = 0; i < 9; i++) {
    await db.stamp.create({
      data: { customerId: c5.id, stampCardId: card.id, customerStampCardId: kCard.id, merchantId: merchant.id, source: "bill" },
    })
  }

  // 2 already-redeemed cards for Kavya (lifetime history)
  for (let r = 0; r < 2; r++) {
    const oldCard = await db.customerStampCard.create({
      data: { customerId: c5.id, stampCardId: card.id, merchantId: merchant.id, stampsCollected: 9, completed: true, redeemed: true },
    })
    for (let i = 0; i < 9; i++) {
      await db.stamp.create({
        data: { customerId: c5.id, stampCardId: card.id, customerStampCardId: oldCard.id, merchantId: merchant.id, source: "bill" },
      })
    }
  }

  // Sample bills (last 30 days)
  const billsData = [
    { customer: c1, amount: 450, daysAgo: 1, staff: cashier },
    { customer: c5, amount: 880, daysAgo: 1, staff: cashier },
    { customer: c2, amount: 220, daysAgo: 3, staff: cashier },
    { customer: c1, amount: 670, daysAgo: 4, staff: manager },
    { customer: c3, amount: 180, daysAgo: 6, staff: cashier },
    { customer: c5, amount: 540, daysAgo: 7, staff: cashier },
    { customer: c4, amount: 320, daysAgo: 14, staff: cashier },
    { customer: c1, amount: 410, daysAgo: 18, staff: cashier },
    { customer: c5, amount: 1200, daysAgo: 21, staff: manager },
    { customer: c2, amount: 290, daysAgo: 28, staff: cashier },
  ]
  let billCounter = 1
  for (const b of billsData) {
    const number = `SC-2026-${String(billCounter).padStart(4, "0")}`
    billCounter++
    await db.bill.create({
      data: {
        merchantId: merchant.id,
        customerId: b.customer.id,
        issuedById: b.staff.id,
        number,
        amount: b.amount,
        stampsAwarded: 1,
        status: "confirmed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * b.daysAgo),
      },
    })
  }

  // One completed redemption
  await db.redemption.create({
    data: {
      merchantId: merchant.id,
      customerId: c5.id,
      rewardId: r1.id,
      approvedById: cashier.id,
      stampsSpent: 1,
      status: "completed",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    },
  })

  // Referrals
  await db.referral.create({
    data: {
      merchantId: merchant.id,
      referrerId: c1.id,
      friendPhone: c2.phone,
      friendCustomerId: c2.id,
      status: "approved",
      bonusStampsReferrer: 1,
      bonusStampsFriend: 1,
    },
  })
  await db.referral.create({
    data: {
      merchantId: merchant.id,
      referrerId: c5.id,
      friendPhone: "+919822200999",
      status: "joined",
      bonusStampsReferrer: 0,
      bonusStampsFriend: 0,
    },
  })

  // VIP Tiers
  await db.vipTier.createMany({
    data: [
      { merchantId: merchant.id, name: "Silver", minLifetimeSpend: 2000, perks: JSON.stringify(["10% bonus stamps", "Priority WhatsApp support"]), bonusMultiplier: 1.1, color: "stone", active: true },
      { merchantId: merchant.id, name: "Gold", minLifetimeSpend: 5000, perks: JSON.stringify(["20% bonus stamps", "Free birthday reward", "Early access to new items"]), bonusMultiplier: 1.2, color: "amber", active: true },
      { merchantId: merchant.id, name: "Platinum", minLifetimeSpend: 10000, perks: JSON.stringify(["50% bonus stamps", "Free birthday reward", "Monthly surprise gift", "Skip-the-queue priority"]), bonusMultiplier: 1.5, color: "purple", active: true },
    ],
  })

  // Birthdays
  await db.birthday.create({
    data: {
      merchantId: merchant.id,
      customerId: c1.id,
      birthMonth: 8,
      birthDay: 15,
      rewardName: "Free Birthday Slice",
      bonusStamps: 3,
      status: "scheduled",
      rewardWindowStart: new Date(new Date().getFullYear(), 7, 8),
      rewardWindowEnd: new Date(new Date().getFullYear(), 7, 22),
    },
  })
  await db.birthday.create({
    data: {
      merchantId: merchant.id,
      customerId: c2.id,
      birthMonth: 12,
      birthDay: 3,
      rewardName: "Free Birthday Slice",
      bonusStamps: 3,
      status: "scheduled",
      rewardWindowStart: new Date(new Date().getFullYear(), 11, 26),
      rewardWindowEnd: new Date(new Date().getFullYear() + (new Date().getMonth() >= 11 ? 1 : 0), 11, 10),
    },
  })
  await db.birthday.create({
    data: {
      merchantId: merchant.id,
      customerId: c5.id,
      birthMonth: 7,
      birthDay: 9,
      rewardName: "Free Birthday Cake (Platinum)",
      bonusStamps: 5,
      status: "reward_ready",
      reminderSentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      rewardWindowStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      rewardWindowEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    },
  })

  // Google Reviews
  await db.review.createMany({
    data: [
      {
        merchantId: merchant.id,
        customerId: c5.id,
        platform: "google",
        rating: 5,
        aiDraft: "Absolutely loved my recent visit to Sweet Crumb Bakery! I redeemed my stamps for a free cupcake and it was perfect...",
        finalText: "Sweet Crumb Bakery is my absolute favorite! Their loyalty program is so rewarding — I've already earned 4 free cupcakes this year. The staff knows my order by heart. Best bakery in the city!",
        photoUrl: "https://example.com/cake.jpg",
        status: "submitted",
        bonusStampsAwarded: 2,
        photoBonusStamps: 2,
        requestSource: "post_redemption",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
      },
      {
        merchantId: merchant.id,
        customerId: c1.id,
        platform: "google",
        rating: 5,
        aiDraft: "Visited Sweet Crumb Bakery recently and redeemed a free cupcake through their stamp program...",
        finalText: "Lovely little bakery with a great loyalty system. The cupcake was fresh and the service is always warm. Highly recommend!",
        photoUrl: null,
        status: "submitted",
        bonusStampsAwarded: 2,
        photoBonusStamps: 0,
        requestSource: "post_bill",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      },
      {
        merchantId: merchant.id,
        customerId: c2.id,
        platform: "google",
        rating: 4,
        aiDraft: null,
        finalText: null,
        photoUrl: null,
        status: "draft_ready",
        bonusStampsAwarded: 0,
        photoBonusStamps: 0,
        requestSource: "post_redemption",
      },
      {
        merchantId: merchant.id,
        customerId: c3.id,
        platform: "google",
        rating: 3,
        aiDraft: "Had a mixed experience at Sweet Crumb Bakery...",
        finalText: null,
        photoUrl: null,
        status: "requested",
        bonusStampsAwarded: 0,
        photoBonusStamps: 0,
        requestSource: "manual",
      },
    ],
  })

  // Win-back escalations
  await db.winBackEscalation.createMany({
    data: [
      {
        merchantId: merchant.id,
        customerId: c4.id,
        stage: "day_30",
        action: "Gentle reminder",
        messageTemplate: "churn_reminder_30",
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        outcome: "ignored",
      },
      {
        merchantId: merchant.id,
        customerId: c6.id,
        stage: "day_90",
        action: "Owner intervention + retention offer",
        messageTemplate: "churn_owner_call_90",
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        outcome: "ignored",
      },
    ],
  })

  // Achievements
  await db.achievement.createMany({
    data: [
      { customerId: c1.id, type: "first_stamp", label: "First Stamp", description: "Earned your first stamp", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90) },
      { customerId: c1.id, type: "first_redemption", label: "First Reward", description: "Redeemed your first reward", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) },
      { customerId: c1.id, type: "vip_silver", label: "Silver Member", description: "Reached ₹2,000 lifetime spend", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45) },
      { customerId: c1.id, type: "vip_gold", label: "Gold Member", description: "Reached ₹5,000 lifetime spend", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
      { customerId: c1.id, type: "referred_1", label: "First Referral", description: "Successfully referred a friend", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
      { customerId: c5.id, type: "first_stamp", label: "First Stamp", description: "Earned your first stamp", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180) },
      { customerId: c5.id, type: "vip_platinum", label: "Platinum VIP", description: "Reached ₹10,000 lifetime spend", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40) },
      { customerId: c5.id, type: "streak_8w", label: "8-Week Streak", description: "Visited 8 weeks in a row", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20) },
      { customerId: c5.id, type: "referred_5", label: "5 Referrals", description: "Referred 5 friends", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15) },
      { customerId: c5.id, type: "top_10_pct", label: "Top 10% Customer", description: "In the top 10% by spend", earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
    ],
  })

  // Support ticket (resolved)
  await db.supportTicket.create({
    data: {
      merchantId: merchant.id,
      subject: "WhatsApp messages delayed",
      category: "whatsapp",
      priority: "normal",
      status: "resolved",
      description: "Yesterday some stamp notifications took 10+ minutes to deliver. Please check the queue.",
      resolution: "Provider had a temporary outage. Queue flushed automatically; all messages delivered. Monitoring in place.",
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  })

  // WhatsApp messages
  await db.whatsAppMessage.createMany({
    data: [
      { merchantId: merchant.id, customerId: c1.id, toPhone: c1.phone, template: "stamp_earned", body: "Hi Meera! You earned 1 stamp on your Cake Lover's Card. Total: 7/9. 2 more to go!", status: "delivered" },
      { merchantId: merchant.id, customerId: c5.id, toPhone: c5.phone, template: "reward_ready", body: "Hi Kavya! 🎉 You've completed a stamp card. Visit us to claim your Free Cupcake.", status: "delivered" },
      { merchantId: merchant.id, customerId: c6.id, toPhone: c6.phone, template: "churn_owner_call_90", body: "Hi Vikram, this is Ravi (owner of Sweet Crumb Bakery). I'd love to gift you a free reward — when can you drop by?", status: "sent" },
      { merchantId: merchant.id, customerId: c2.id, toPhone: c2.phone, template: "referral_bonus", body: "Hi Rohan! 🎁 Your friend Meera's referral bonus: +1 stamp added.", status: "delivered" },
      { merchantId: merchant.id, customerId: c5.id, toPhone: c5.phone, template: "birthday_reminder", body: "Hi Kavya! 🎂 Your birthday is coming up. Sweet Crumb has a free slice waiting for you this week!", status: "delivered" },
    ],
  })

  // Seed audit logs
  await db.auditLog.createMany({
    data: [
      { merchantId: merchant.id, actorType: "SYSTEM", action: "MERCHANT_CREATED", entityId: merchant.id, metadata: JSON.stringify({ name: merchant.name }) },
      { merchantId: merchant.id, actorType: "STAFF", actorId: owner.id, staffId: owner.id, action: "STAFF_CREATED", entityId: manager.id, metadata: JSON.stringify({ role: "MANAGER" }) },
      { merchantId: merchant.id, actorType: "STAFF", actorId: cashier.id, staffId: cashier.id, action: "BILL_CREATED", entityId: "seed-bill-1", metadata: JSON.stringify({ amount: 450 }) },
      { merchantId: merchant.id, actorType: "STAFF", actorId: cashier.id, staffId: cashier.id, action: "REDEMPTION_APPROVED", entityId: "seed-redemption-1", metadata: JSON.stringify({ reward: "Free Cupcake" }) },
      { merchantId: merchant.id, actorType: "STAFF", actorId: owner.id, staffId: owner.id, action: "SUBSCRIPTION_ACTIVATED", metadata: JSON.stringify({ amount: 5400, plan: "growth", duration: "6mo" }) },
    ],
  })

  // Onboarding checklist (mostly complete)
  await fastStartOnboarding(merchant.id, merchant.businessType)
  // Mark additional steps as done (since merchant is past onboarding)
  await db.onboardingStep.updateMany({
    where: { merchantId: merchant.id, stepKey: { in: ["first_bill", "add_staff", "add_rewards"] } },
    data: { completed: true, completedAt: new Date() },
  })

  // V6.3 — Live Queue: seed 2 waiting customers (recently scanned QR)
  await db.waitingCustomer.create({
    data: {
      merchantId: merchant.id,
      customerId: c1.id, // Meera (returning Gold customer)
      status: "waiting",
      scannedAt: new Date(Date.now() - 1000 * 30), // 30 sec ago
      expiresAt: new Date(Date.now() + 1000 * 60 * 4.5), // 4.5 min remaining
      scanSource: "qr_whatsapp",
    },
  })
  await db.waitingCustomer.create({
    data: {
      merchantId: merchant.id,
      customerId: c5.id, // Kavya (Platinum VIP, returning)
      status: "waiting",
      scannedAt: new Date(Date.now() - 1000 * 90), // 90 sec ago
      expiresAt: new Date(Date.now() + 1000 * 60 * 3.5), // 3.5 min remaining
      scanSource: "qr_whatsapp",
    },
  })
  // One already claimed (for history)
  await db.waitingCustomer.create({
    data: {
      merchantId: merchant.id,
      customerId: c2.id, // Rohan
      status: "claimed",
      scannedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      claimedAt: new Date(Date.now() - 1000 * 60 * 29),
      claimedById: cashier.id,
      amount: 220,
      stampsAwarded: 1,
      expiresAt: new Date(Date.now() - 1000 * 60 * 25),
      scanSource: "qr_whatsapp",
    },
  })

  console.log("✅ V6.3 seed complete.")
  console.log(`   Merchant: ${merchant.name} (${merchant.id})`)
  console.log(`   Staff:    ${[owner, manager, cashier].map((s) => `${s.name} / ${s.role}`).join(", ")}`)
  console.log(`   Customers: 6 (incl. Gold/Platinum VIPs, dormant, churned)`)
  console.log(`   Reviews: 4 (2 submitted, 1 draft ready, 1 requested)`)
  console.log(`   Birthdays: 3 scheduled (1 ready this week)`)
  console.log(`   Win-backs: 2 (1 day_30 ignored, 1 day_90 ignored)`)
  console.log(`   Achievements: 10 across customers`)
  console.log(`   Support tickets: 1 resolved`)
  console.log(`   Live Queue: 2 waiting (Meera 30s, Kavya 90s), 1 claimed (Rohan)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })



