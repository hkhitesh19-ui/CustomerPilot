const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "Evo_Api_Key_Secure_998877!";

async function testResend() {
  const customer = await db.customer.findFirst({ where: { phone: { contains: '9033304707' } } });
  if (!customer) return;

  const merchant = await db.merchant.findUnique({ where: { id: customer.merchantId } });
  const instanceName = merchant?.whatsappInstanceName || `CP_M_${customer.merchantId}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const walletUrl = `${appUrl}/wallet?c=${customer.id}&m=${merchant.id}`;
  const customerMsg = `🎉 *Congratulations ${customer.name || "VIP"}!* ⭐\n\nThank you for posting your Google Review! We have credited 🎁 *+2 Bonus Stamps* to your VIP Card!\n\nCheck your updated VIP Wallet:\n${walletUrl}`;

  console.log(`Sending via instance: ${instanceName} to ${customer.phone}...`);

  const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
    body: JSON.stringify({
      number: customer.phone,
      text: customerMsg
    })
  });

  const data = await res.json().catch(() => ({}));
  console.log(`Evolution API Response (${res.status}):`, data);
}

testResend().finally(() => db.$disconnect());
