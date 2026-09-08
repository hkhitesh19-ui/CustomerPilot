const path = require('path');
const { PrismaClient } = require(path.resolve('f:/CustomerPilot_ByGLM_July2026/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function main() {
  const customerId = "cmtq2sdly00nvw02sx1lxg8ia";
  const merchantId = "cmtl0v6xg0042w06kz9ye0vz2";
  const templateId = "cmtle8co200r6w06ksrog6u8h";
  const KICKSTART_BONUS_STAMPS = 4;

  // 1. Update Merchant setting: vipUpgradeBonusStamps = 4
  await prisma.merchant.update({
    where: { id: merchantId },
    data: { vipUpgradeBonusStamps: KICKSTART_BONUS_STAMPS }
  });
  console.log(`[Merchant] Updated vipUpgradeBonusStamps to ${KICKSTART_BONUS_STAMPS}.`);

  // 2. Perform DB transaction for Hitesh's Loop 2 card & stamps
  const result = await prisma.$transaction(async (tx) => {
    // Check if active (uncompleted) card already exists
    let activeCard = await tx.customerStampCard.findFirst({
      where: {
        merchantId,
        customerId,
        stampCardId: templateId,
        completed: false,
        redeemed: false
      }
    });

    if (!activeCard) {
      activeCard = await tx.customerStampCard.create({
        data: {
          merchantId,
          customerId,
          stampCardId: templateId,
          stampsCollected: KICKSTART_BONUS_STAMPS,
          completed: false,
          redeemed: false
        }
      });
      console.log(`[Card #2] Created new Loop 2 StampCard: ${activeCard.id}`);

      // Create 4 LEVEL_UP_BONUS stamps
      for (let i = 0; i < KICKSTART_BONUS_STAMPS; i++) {
        await tx.stamp.create({
          data: {
            customerId,
            merchantId,
            stampCardId: templateId,
            customerStampCardId: activeCard.id,
            source: 'LEVEL_UP_BONUS'
          }
        });
      }

      // Increment customer lifetime stamps and ensure Silver tier
      await tx.customer.update({
        where: { id: customerId },
        data: {
          lifetimeStamps: { increment: KICKSTART_BONUS_STAMPS },
          vipTier: 'Silver'
        }
      });
    } else {
      console.log(`[Card #2] Active card already exists: ${activeCard.id}`);
    }

    const updatedCustomer = await tx.customer.findUnique({
      where: { id: customerId }
    });

    return { activeCard, customer: updatedCustomer };
  });

  console.log(`[Customer] Lifetime stamps: ${result.customer.lifetimeStamps}, VIP Tier: ${result.customer.vipTier}`);

  // 3. Dispatch Celebratory WhatsApp Message
  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  const template = await prisma.stampCard.findUnique({ where: { id: templateId } });

  const evolutionUrl = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080";
  const evolutionKey = process.env.EVOLUTION_API_KEY || "B6D711FCDE4D4FD5936544120E713976";
  const instanceName = merchant.whatsappInstanceName || `CP_M_${merchant.id}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const walletUrl = `${appUrl}/q/wallet/${customerId}`;
  const stampsRequired = template?.stampsRequired || 10;
  const remaining = stampsRequired - KICKSTART_BONUS_STAMPS;

  const msgText = `🏆 *LEVEL UP! SILVER VIP UNLOCKED!* 🥈🌟\n\n` +
    `Congratulations *${result.customer.name}*! You have unlocked *Silver VIP Membership* at *${merchant.name}*!\n\n` +
    `🎁 *+${KICKSTART_BONUS_STAMPS} Kickstart Advance Bonus Stamps Credited!*\n` +
    `Your new Level 2 Card has been activated with ${KICKSTART_BONUS_STAMPS} bonus stamps pre-funded! 🚀\n\n` +
    `📊 *Wallet (Level 2):* ${KICKSTART_BONUS_STAMPS} / ${stampsRequired} Stamps\n` +
    `🎁 *Next Goal:* ${template?.rewardName || "250g Free Cake"} (${remaining} more stamps needed)\n` +
    `🏆 *Unlocked Reward:* ${template?.rewardName || "250g Free Cake"} (Ready to claim at counter!)\n\n` +
    `📱 *View Your New Silver Card in Digital Wallet:*\n${walletUrl}`;

  console.log(`Sending LEVEL_COMPLETE WhatsApp message to ${result.customer.phone} via ${instanceName}...`);

  const res = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": evolutionKey
    },
    body: JSON.stringify({
      number: result.customer.phone,
      text: msgText
    })
  });

  const resData = await res.json().catch(() => ({}));
  const isSuccess = res.ok && Boolean(resData?.key?.id);

  console.log(`WhatsApp send result: status=${res.status}, isSuccess=${isSuccess}, messageId=${resData?.key?.id}`);

  // Create message record in DB
  await prisma.whatsAppMessage.create({
    data: {
      merchantId,
      customerId,
      toPhone: result.customer.phone,
      template: "LEVEL_COMPLETE",
      body: msgText.substring(0, 500),
      status: isSuccess ? "sent" : "failed"
    }
  });

  console.log("Kickstart bonus & WhatsApp notification successfully executed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
