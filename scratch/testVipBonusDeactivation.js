const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testVipBonusDeactivation() {
  const merchant = await prisma.merchant.findFirst({ where: { whatsappPhone: { not: null } } });
  if (!merchant) return;

  console.log(`Testing for merchant ${merchant.id}...`);
  console.log(`Current vipUpgradeBonusStamps: ${merchant.vipUpgradeBonusStamps}`);

  // Test deactivating rule (setting to 0)
  const updated = await prisma.merchant.update({
    where: { id: merchant.id },
    data: { vipUpgradeBonusStamps: 0 }
  });
  console.log(`Deactivated vipUpgradeBonusStamps: ${updated.vipUpgradeBonusStamps}`);

  // Test restoring rule to 1
  const restored = await prisma.merchant.update({
    where: { id: merchant.id },
    data: { vipUpgradeBonusStamps: 1 }
  });
  console.log(`Restored vipUpgradeBonusStamps: ${restored.vipUpgradeBonusStamps}`);
}

testVipBonusDeactivation().finally(() => prisma.$disconnect());
