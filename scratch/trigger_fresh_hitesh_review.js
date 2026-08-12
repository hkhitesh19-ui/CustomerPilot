const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "Evo_Api_Key_Secure_998877!";

async function resetAndTriggerFreshReview() {
  const phone = '919033304707';
  console.log(`Starting fresh Google Review cycle for phone: ${phone}...`);

  const customer = await prisma.customer.findFirst({
    where: { phone: { contains: '9033304707' } },
    include: { merchant: true }
  });

  if (!customer) {
    console.error("Customer Hitesh not found!");
    return;
  }

  console.log(`Found Customer: ${customer.name} (ID: ${customer.id}), Merchant: ${customer.merchant.name}`);

  // 1. Delete previous review request messages for clean fresh state
  const deleted = await prisma.whatsAppMessage.deleteMany({
    where: {
      toPhone: { contains: '9033304707' },
      template: { in: ['review_request', 'REVIEW_DRAFT'] }
    }
  });
  console.log(`Cleared ${deleted.count} previous review messages.`);

  // 2. Prepare Step 1 Message
  const merchantName = customer.merchant.name || "Cake Connection";
  const text = `Hi ${customer.name} ❤️\n\nHope you loved your recent purchase from *${merchantName}*!\n\nWould you like AI to prepare your Google Review? Reply *YES* to see the draft and unlock a 🎁 *Bonus Stamp* on your VIP Card!`;

  const instanceName = customer.merchant.whatsappInstanceName || `CP_M_${customer.merchantId}`;
  console.log(`Sending via instance: ${instanceName} to ${customer.phone}...`);

  const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
    body: JSON.stringify({
      number: customer.phone,
      text: text
    })
  });

  const data = await res.json().catch(() => ({}));
  console.log(`Evolution API response (${res.status}):`, data);

  // 3. Record outgoing message and update botState
  await prisma.whatsAppMessage.create({
    data: {
      merchantId: customer.merchantId,
      customerId: customer.id,
      toPhone: customer.phone,
      template: "review_request",
      body: text,
      status: res.ok ? "sent" : "failed",
      sentAt: res.ok ? new Date() : null,
      metaMessageId: data?.key?.id || `review_req_${Date.now()}`
    }
  });

  if (res.ok) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        botState: "AWAITING_REVIEW_CONSENT",
        botStateUpdatedAt: new Date()
      }
    });
    console.log("✅ Set botState = AWAITING_REVIEW_CONSENT for Hitesh");
  }

  console.log("✅ Fresh Google Review Step 1 successfully sent to Hitesh!");
}

resetAndTriggerFreshReview().finally(() => prisma.$disconnect());
