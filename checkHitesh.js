
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const customers = await prisma.customer.findMany({
    include: {
      stamps: true,
      bills: true,
      redemptions: true,
      whatsAppMessages: true,
      waitingCustomers: true,
      stampCards: true,
      reviews: true
    }
  });
  const customer = customers.find(c => c.name.toLowerCase().includes('hitesh'));
  if (!customer) {
    console.log('Customer Hitesh not found');
    return;
  }
  console.log('--- CUSTOMER HITESH ---');
  console.log('Phone:', customer.phone);
  console.log('Stamps:', customer.stamps.length);
  console.log('Bills:', customer.bills.length);
  console.log('WhatsApp Messages Sent:', customer.whatsAppMessages.length);
  customer.whatsAppMessages.forEach(msg => {
    console.log('  - Template:', msg.template, '| Status:', msg.status, '| Created:', msg.createdAt);
  });
  console.log('Waiting in Queue:', customer.waitingCustomers.length > 0 ? customer.waitingCustomers[0].status : 'None');
  console.log('Reviews:', customer.reviews.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());

