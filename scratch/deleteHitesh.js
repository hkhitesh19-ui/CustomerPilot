const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteHitesh() {
  const customer = await prisma.customer.findFirst({
    where: { phone: { contains: '9033304707' } }
  });

  if (!customer) {
    console.log("No customer found with phone 9033304707");
    return;
  }

  console.log("Found Customer Hitesh:", customer.id, customer.name, customer.phone);

  await prisma.$transaction(async (tx) => {
    // 1. Stamps
    const stamps = await tx.stamp.deleteMany({ where: { customerId: customer.id } });
    console.log(`Deleted ${stamps.count} stamp records.`);

    // 2. Customer Stamp Cards
    const cards = await tx.customerStampCard.deleteMany({ where: { customerId: customer.id } });
    console.log(`Deleted ${cards.count} stamp card records.`);

    // 3. Bills
    const bills = await tx.bill.deleteMany({ where: { customerId: customer.id } });
    console.log(`Deleted ${bills.count} bill records.`);

    // 4. Waiting Customers (Queue)
    const waiting = await tx.waitingCustomer.deleteMany({ where: { customerId: customer.id } });
    console.log(`Deleted ${waiting.count} queue records.`);

    // 5. Redemptions
    const redemptions = await tx.redemption.deleteMany({ where: { customerId: customer.id } });
    console.log(`Deleted ${redemptions.count} redemption records.`);

    // 6. Referrals
    const referrals = await tx.referral.deleteMany({
      where: { OR: [{ referrerId: customer.id }, { friendCustomerId: customer.id }] }
    });
    console.log(`Deleted ${referrals.count} referral records.`);

    // 7. Reviews
    const reviews = await tx.review.deleteMany({ where: { customerId: customer.id } });
    console.log(`Deleted ${reviews.count} review records.`);

    // 8. Achievements
    const achievements = await tx.achievement.deleteMany({ where: { customerId: customer.id } });
    console.log(`Deleted ${achievements.count} achievement records.`);

    // 9. WhatsApp Messages
    const messages = await tx.whatsAppMessage.deleteMany({
      where: {
        OR: [
          { customerId: customer.id },
          { toPhone: customer.phone },
          { toPhone: `+${customer.phone}` },
          { toPhone: customer.phone.replace(/^91/, '') }
        ]
      }
    });
    console.log(`Deleted ${messages.count} WhatsApp message records.`);

    // 10. Delete Customer record
    await tx.customer.delete({ where: { id: customer.id } });
    console.log(`Successfully deleted customer record for Hitesh!`);
  });
}

deleteHitesh().finally(() => prisma.$disconnect());
