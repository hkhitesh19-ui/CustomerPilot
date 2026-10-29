const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const merchants = await prisma.merchant.findMany({});
  console.log("=== MERCHANTS IN DB ===");
  merchants.forEach(m => {
    console.log(`ID: ${m.id} | Name: "${m.name}" | Owner: "${m.ownerName}" | Type: "${m.businessType}" | Category: "${m.category}" | WhatsApp: "${m.whatsappPhone}" | Step: ${m.currentStep}`);
  });

  const cards = await prisma.stampCard.findMany({});
  console.log("\n=== STAMP CARDS IN DB ===");
  console.log(`Total StampCard records: ${cards.length}`);
}

main().finally(() => prisma.$disconnect());
