// Fix: Keep only 1 active StampCard per merchant.
// Deactivate all duplicates, keep only the one with latest updatedAt.
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function fix() {
  // Get all merchants
  const merchants = await p.merchant.findMany({ select: { id: true, name: true } });
  
  for (const merchant of merchants) {
    const cards = await p.stampCard.findMany({
      where: { merchantId: merchant.id, active: true },
      orderBy: { updatedAt: 'desc' }
    });

    if (cards.length <= 1) {
      console.log(`[${merchant.name}] OK - ${cards.length} active card.`);
      continue;
    }

    // Keep the one with most recent updatedAt (index 0), deactivate the rest
    const [keep, ...duplicates] = cards;
    console.log(`[${merchant.name}] Found ${cards.length} active cards. Keeping ID: ${keep.id} (updatedAt: ${keep.updatedAt})`);
    
    for (const dup of duplicates) {
      await p.stampCard.update({
        where: { id: dup.id },
        data: { active: false }
      });
      console.log(`  -> Deactivated duplicate card ID: ${dup.id} (updatedAt: ${dup.updatedAt})`);
    }
  }

  console.log('\nDone! Verifying final state...');
  const remaining = await p.stampCard.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
  console.log(`Active cards remaining: ${remaining.length}`);
  remaining.forEach(c => console.log(` - [${c.merchantId}] ${c.name} | stamps:${c.stampsRequired} | stampVal:${c.stampValue} | photoBonus:${c.photoBonus}`));
}

fix().finally(() => p.$disconnect());
