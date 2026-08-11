
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.googleBusinessReview.deleteMany({
    where: { gbpReviewId: { startsWith: 'mock_' } }
  });
  console.log('Deleted Mock Reviews:', result.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());

