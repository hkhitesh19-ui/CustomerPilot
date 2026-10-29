const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gConns = await prisma.merchantGoogleConnection.findMany({});
  console.log("=== merchantGoogleConnection records ===");
  console.log(JSON.stringify(gConns, null, 2));

  const merchant = await prisma.merchant.findFirst({ where: { whatsappPhone: { not: null } } });
  console.log("\n=== Merchant googleReviewLink ===");
  console.log("googleReviewLink:", merchant?.googleReviewLink);
}

main().finally(() => prisma.$disconnect());
