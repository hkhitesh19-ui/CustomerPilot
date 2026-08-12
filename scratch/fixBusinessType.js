const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.merchant.update({
    where: { id: "cmsjw7n7i0001w0c0r6i3juhy" },
    data: {
      businessType: "BAKERY",
    }
  });
  console.log(`✅ businessType updated to: "${updated.businessType}"`);
}

main().finally(() => prisma.$disconnect());
