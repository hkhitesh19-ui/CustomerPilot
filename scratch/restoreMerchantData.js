const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find merchant with WhatsApp connected (the active test merchant)
  const merchant = await prisma.merchant.findFirst({
    where: { whatsappPhone: { not: null } }
  });
  
  if (!merchant) {
    console.log("No merchant with WhatsApp found!");
    return;
  }

  console.log(`Found merchant: ${merchant.id}`);
  console.log(`Current data: name="${merchant.name}", ownerName="${merchant.ownerName}", businessType="${merchant.businessType}"`);

  // Prompt user to confirm what values to set
  // For now restore Cake Connection data since that's what was in onboarding
  const updated = await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      name: "Cake Connection",
      ownerName: "Cake Connection",
      businessType: "bakery",
      category: "Bakery & Cakes",
    }
  });

  console.log("\n✅ Merchant data restored:");
  console.log(`  name: "${updated.name}"`);
  console.log(`  ownerName: "${updated.ownerName}"`);
  console.log(`  businessType: "${updated.businessType}"`);
  console.log(`  category: "${updated.category}"`);
  console.log("\nRefresh http://localhost:3000/dashboard/settings to see updated data.");
}

main().finally(() => prisma.$disconnect());
