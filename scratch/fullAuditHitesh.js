const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fullAudit() {
  const customer = await prisma.customer.findFirst({
    where: { phone: { contains: '9033304707' } },
    include: {
      bills: { orderBy: { createdAt: 'asc' } },
      stamps: { orderBy: { createdAt: 'asc' } }
    }
  });

  const cards = await prisma.customerStampCard.findMany({
    where: { customerId: customer.id },
    include: { stamps: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'asc' }
  });

  const messages = await prisma.whatsAppMessage.findMany({
    where: { toPhone: { contains: '9033304707' } },
    orderBy: { createdAt: 'asc' }
  });

  console.log("=========================================");
  console.log("=== HITESH FULL DATABASE JOURNEY AUDIT ===");
  console.log("=========================================");
  console.log("Customer ID:", customer.id);
  console.log("Name:", customer.name);
  console.log("Phone:", customer.phone);
  console.log("Lifetime Spend: ₹", customer.lifetimeSpend);
  console.log("Lifetime Stamps:", customer.lifetimeStamps);
  console.log("Current VIP Level / Category:", customer.vipTier);

  console.log("\n--- STAMP CARDS IN DB ---");
  cards.forEach((c, idx) => {
    console.log(`[Card #${idx+1}] ID: ${c.id}`);
    console.log(`         Stamps Collected: ${c.stampsCollected} | Completed: ${c.completed} | Redeemed: ${c.redeemed}`);
    console.log(`         Created At: ${c.createdAt.toISOString()}`);
    console.log(`         Stamps Breakdown:`);
    c.stamps.forEach(s => console.log(`           - [${s.createdAt.toISOString()}] Source: ${s.source} (BillId: ${s.billId || 'N/A'})`));
  });

  console.log("\n--- PURCHASES / BILLS IN DB ---");
  customer.bills.forEach((b, idx) => {
    console.log(`[Bill #${idx+1}] Invoice: ${b.number} | Amount: ₹${b.amount} | Stamps Awarded: ${b.stampsAwarded}`);
    console.log(`        Notes: ${b.notes}`);
    console.log(`        Time: ${b.createdAt.toISOString()}`);
  });

  console.log("\n--- ALL WHATSAPP MESSAGES SENT TO HITESH ---");
  messages.forEach((m, idx) => {
    console.log(`[WA #${idx+1}] Time: ${m.createdAt.toISOString()}`);
    console.log(`        Template Key: ${m.template}`);
    console.log(`        Status: ${m.status}`);
    console.log(`        Message Body:\n${m.body}`);
    console.log("------------------------------------------------------------------");
  });
}

fullAudit().finally(() => prisma.$disconnect());
