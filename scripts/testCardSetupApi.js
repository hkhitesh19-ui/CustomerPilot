// Directly test GET /api/cards/setup to see what it returns
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function test() {
  console.log('=== DB STATE ===');
  const cards = await p.stampCard.findMany({
    orderBy: { updatedAt: 'desc' }
  });
  console.log('All StampCards:');
  cards.forEach(c => {
    console.log(`  [${c.active ? 'ACTIVE' : 'inactive'}] ID:${c.id} | stamps:${c.stampsRequired} | stampVal:${c.stampValue} | photo:${c.photoBonus} | updatedAt:${c.updatedAt}`);
  });

  console.log('\n=== SIMULATING GET /api/cards/setup ===');
  const merchantId = 'cmsjw7n7i0001w0c0r6i3juhy';
  const card = await p.stampCard.findFirst({
    where: { merchantId, active: true },
    orderBy: { updatedAt: 'desc' }
  });
  
  if (!card) {
    console.log('RESULT: No active card found → would return DEFAULTS');
  } else {
    console.log('RESULT: Found card → isDefault:false');
    console.log(`  stamps:${card.stampsRequired} | stampVal:${card.stampValue} | photoBonus:${card.photoBonus}`);
  }

  console.log('\n=== LIVE API TEST ===');
  // Hit the actual running API
  try {
    const res = await fetch('http://localhost:3000/api/cards/setup', {
      headers: { 'x-merchant-id': merchantId }
    });
    const json = await res.json();
    console.log('API Status:', res.status);
    console.log('isDefault:', json.data?.isDefault);
    console.log('card returned:', JSON.stringify(json.data?.card, null, 2));
  } catch(e) {
    console.log('API ERROR:', e.message);
  }
}

test().finally(() => p.$disconnect());
