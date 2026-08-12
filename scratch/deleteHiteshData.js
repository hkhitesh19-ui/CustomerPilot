const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteHiteshData() {
  console.log("🧹 Starting complete deletion of Hitesh Customer data...");

  const phonePart = "9033304707";
  const customer = await prisma.customer.findFirst({
    where: { phone: { contains: phonePart } }
  });

  if (!customer) {
    console.log("⚠️ No customer found with phone containing:", phonePart);
  } else {
    console.log(`Found Hitesh Customer: ID=${customer.id}, Name=${customer.name}, Phone=${customer.phone}`);

    // 1. Delete Stamps
    const deletedStamps = await prisma.stamp.deleteMany({
      where: { customerId: customer.id }
    });
    console.log(`Deleted ${deletedStamps.count} Stamp records.`);

    // 2. Delete Customer Stamp Cards
    const deletedStampCards = await prisma.customerStampCard.deleteMany({
      where: { customerId: customer.id }
    });
    console.log(`Deleted ${deletedStampCards.count} CustomerStampCard records.`);

    // 3. Delete Reviews
    const deletedReviews = await prisma.review.deleteMany({
      where: { customerId: customer.id }
    });
    console.log(`Deleted ${deletedReviews.count} Review records.`);

    // 4. Delete Google Business Reviews (by reviewerName or gbpReviewId)
    const deletedGbpReviews = await prisma.googleBusinessReview.deleteMany({
      where: {
        OR: [
          { reviewerName: { contains: "Hitesh" } },
          { gbpReviewId: { contains: customer.id } }
        ]
      }
    });
    console.log(`Deleted ${deletedGbpReviews.count} GoogleBusinessReview records.`);

    // 5. Delete WhatsApp Messages
    const deletedMessages = await prisma.whatsAppMessage.deleteMany({
      where: {
        OR: [
          { customerId: customer.id },
          { toPhone: { contains: phonePart } }
        ]
      }
    });
    console.log(`Deleted ${deletedMessages.count} WhatsAppMessage records.`);

    // 6. Delete Bills / Transactions
    const deletedBills = await prisma.bill.deleteMany({
      where: { customerId: customer.id }
    });
    console.log(`Deleted ${deletedBills.count} Bill records.`);

    // 7. Delete Redemptions
    const deletedRedemptions = await prisma.redemption.deleteMany({
      where: { customerId: customer.id }
    });
    console.log(`Deleted ${deletedRedemptions.count} Redemption records.`);

    // 8. Delete Referrals
    await prisma.referral.deleteMany({
      where: { referrerId: customer.id }
    }).catch(() => {});
    
    // 9. Delete Achievements, Birthdays, WaitingCustomers, WinBackEscalations
    await prisma.achievement.deleteMany({ where: { customerId: customer.id } });
    await prisma.birthday.deleteMany({ where: { customerId: customer.id } });
    await prisma.waitingCustomer.deleteMany({ where: { customerId: customer.id } });
    await prisma.winBackEscalation.deleteMany({ where: { customerId: customer.id } });

    // 10. Nullify referredById on any referred customers
    await prisma.customer.updateMany({
      where: { referredById: customer.id },
      data: { referredById: null }
    });

    // 11. Finally delete Customer record
    await prisma.customer.delete({
      where: { id: customer.id }
    });
    console.log(`✅ Successfully deleted Customer Hitesh (${customer.id}).`);
  }
}

deleteHiteshData()
  .catch((e) => console.error("Error during deletion:", e))
  .finally(() => prisma.$disconnect());
