const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReviews() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("=== `Review` Table Entries ===");
  console.log(JSON.stringify(reviews, null, 2));

  const gbpReviews = await prisma.googleBusinessReview.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("\n=== `GoogleBusinessReview` Table Entries ===");
  console.log(JSON.stringify(gbpReviews, null, 2));
}

checkReviews().finally(() => prisma.$disconnect());
