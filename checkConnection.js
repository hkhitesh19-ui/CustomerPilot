
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const connections = await prisma.merchantGoogleConnection.findMany();
  console.log('Google Connections:', connections);
  const reviews = await prisma.googleBusinessReview.findMany();
  console.log('Reviews in DB:', reviews.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());

