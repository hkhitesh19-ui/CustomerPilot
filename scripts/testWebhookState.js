const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Set Hitesh botState
  console.log("Setting Hitesh botState to AWAITING_REVIEW_CONSENT...");
  await prisma.customer.updateMany({
    where: { phone: '919033304707' },
    data: { 
      botState: 'AWAITING_REVIEW_CONSENT',
      botStateUpdatedAt: new Date()
    }
  });

  // 2. Fetch Merchant for Webhook test
  const merchant = await prisma.merchant.findFirst({
    where: { status: 'active' } // or specific merchant
  });
  
  if (!merchant) {
    console.log("No merchant found.");
    return;
  }
  
  // 3. Send mock webhook event
  console.log("Sending mock webhook 'Yes' reply...");
  const payload = {
    event: "messages.upsert",
    instance: "CP_M_mock",
    data: {
      key: { remoteJid: "919033304707@s.whatsapp.net", fromMe: false },
      message: { conversation: "Yes" },
      pushName: "Hitesh"
    }
  };

  const webhookSecret = process.env.EVOLUTION_WEBHOOK_SECRET || 'cpilot_webhook_secret_change_in_prod_2026';
  const res = await fetch('http://localhost:3000/api/webhook/evolution', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-webhook-secret': webhookSecret
    },
    body: JSON.stringify(payload)
  });

  console.log("Webhook response status:", res.status);
  
  // 4. Check if botState is IDLE now
  const hitesh = await prisma.customer.findFirst({
    where: { phone: '919033304707' }
  });
  console.log("Hitesh botState after webhook:", hitesh.botState);
}

main().finally(() => prisma.$disconnect());
