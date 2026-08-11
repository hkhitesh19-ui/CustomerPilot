
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const reviews = await prisma.googleBusinessReview.findMany();
  console.log('Reviews in DB:', reviews.length);
  if (reviews.length > 0) {
    console.log('Sample Review:', reviews[0]);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

