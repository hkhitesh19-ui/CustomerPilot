const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.merchant.update({
    where: { id: "cmsjw7n7i0001w0c0r6i3juhy" },
    data: {
      ownerName: "Kiyaan",
      businessType: "RESTAURANT", // fix to match Settings dropdown values
    }
  });

  console.log("✅ Fixed:");
  console.log(`  ownerName: "${updated.ownerName}"`);
  console.log(`  businessType: "${updated.businessType}"`);
}

main().finally(() => prisma.$disconnect());
