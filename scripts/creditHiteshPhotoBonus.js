const path = require('path');
const { PrismaClient } = require(path.resolve('f:/CustomerPilot_ByGLM_July2026/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function main() {
  const customerId = "cmtq2sdly00nvw02sx1lxg8ia";
  const merchantId = "cmtl0v6xg0042w06kz9ye0vz2";
  const reviewId = "cmtqrk4jl013sw02s3jsglna2";
  const logId = "cmtqrk6pd013uw02s5lqbumsp";

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { stampCards: true }
  });

  if (!customer) throw new Error("Customer not found");

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId }
  });

  const template = await prisma.stampCard.findFirst({
    where: { merchantId, active: true }
  });

  const activeCard = customer.stampCards.find(c => !c.completed && !c.redeemed);
  if (!activeCard) throw new Error("Active stamp card not found");

  console.log(`[Before] Customer ${customer.name} stamps: ${activeCard.stampsCollected}/10, lifetime: ${customer.lifetimeStamps}`);

  // DB Transaction
  await prisma.$transaction(async (tx) => {
    // 1. Create 2 photo bonus stamps
    for (let i = 0; i < 2; i++) {
      await tx.stamp.create({
        data: {
          customerId,
          stampCardId: template.id,
          customerStampCardId: activeCard.id,
          merchantId,
          source: "photo_bonus"
        }
      });
    }

    // 2. Update CustomerStampCard
    await tx.customerStampCard.update({
      where: { id: activeCard.id },
      data: {
        stampsCollected: 7,
        completed: false
      }
    });

    // 3. Update Customer lifetimeStamps
    await tx.customer.update({
      where: { id: customerId },
      data: {
        lifetimeStamps: 7
      }
    });

    // 4. Update Review
    await tx.review.update({
      where: { id: reviewId },
      data: {
        photoBonusStamps: 2,
        bonusStampsAwarded: 4
      }
    });

    // 5. Update ReviewBonusLog
    await tx.reviewBonusLog.update({
      where: { id: logId },
      data: {
        stage: "PRE_APPROVED_GRACE_PERIOD",
        matchConfidence: 1.0,
        decision: "4_STAMPS",
        reason: "default_photo_bonus_pre_approved",
        recheckScheduled: false,
        finalizedAt: new Date()
      }
    });
  });

  console.log(`[After DB] Hitesh wallet successfully updated to 7/10 stamps!`);

  // Dispatch WhatsApp Message
  const evolutionUrl = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080";
  const evolutionKey = process.env.EVOLUTION_API_KEY || "B6D711FCDE4D4FD5936544120E713976";
  const instanceName = merchant.whatsappInstanceName || `CP_M_${merchant.id}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const walletUrl = `${appUrl}/q/wallet/${customerId}`;
  const stampsRequired = template?.stampsRequired || 10;
  const remaining = Math.max(0, stampsRequired - 7);

  const text = `🎉 *Congratulations ${customer.name}!* 📸⭐\n\n` +
    `Thank you for supporting *${merchant.name}* on Google Maps!\n\n` +
    `✅ *+2 Extra Photo Bonus Stamps Credited!* (Total: 4 Bonus Stamps 🎁)\n` +
    `📊 *Wallet:* 7 / ${stampsRequired} Stamps\n` +
    `🎁 *Goal:* ${template?.rewardName || "FREE Reward"} (${remaining} more stamp(s) needed)\n\n` +
    `📱 *View Your Live Digital Stamp Card:*\n${walletUrl}`;

  console.log(`Sending WhatsApp message to ${customer.phone} via instance ${instanceName}...`);

  const res = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": evolutionKey
    },
    body: JSON.stringify({
      number: customer.phone,
      text: text
    })
  });

  const resData = await res.json().catch(() => ({}));
  const isSuccess = res.ok && Boolean(resData?.key?.id);

  console.log(`WhatsApp send result: status=${res.status}, isSuccess=${isSuccess}, messageId=${resData?.key?.id}`);

  // Create WhatsApp message log in DB
  await prisma.whatsAppMessage.create({
    data: {
      merchantId,
      customerId,
      toPhone: customer.phone,
      template: "review_photo_bonus_verified",
      body: text.substring(0, 500),
      status: isSuccess ? "sent" : "failed"
    }
  });

  console.log("All done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
