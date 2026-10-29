// Test with actual browser-like cookie based auth
// We'll call the API with a valid token from DB
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function test() {
  // Check what /api/cards/setup GET returns via direct DB simulation
  const merchantId = 'cmsjw7n7i0001w0c0r6i3juhy';
  
  console.log('=== DB: What /api/cards/setup GET returns ===');
  const card = await p.stampCard.findFirst({
    where: { merchantId, active: true },
    orderBy: { updatedAt: 'desc' }
  });
  
  if (!card) {
    console.log('❌ No active card found → API returns isDefault:true + RECOMMENDED_DEFAULTS');
    console.log('   This is why UI shows defaults!');
  } else {
    console.log('✅ Found active card:');
    console.log('   stamps:', card.stampsRequired, '| stampVal:', card.stampValue, '| photoBonus:', card.photoBonus);
    console.log('   isDefault: false → UI should show saved values');
  }

  console.log('\n=== ALL CARDS in DB ===');
  const all = await p.stampCard.findMany({ orderBy: { updatedAt: 'desc' } });
  all.forEach(c => {
    console.log(`  [${c.active ? '✅ ACTIVE' : '❌ inactive'}] stamps:${c.stampsRequired} | val:${c.stampValue} | photo:${c.photoBonus} | updatedAt:${c.updatedAt?.toISOString()}`);
  });

  console.log('\n=== LIVE API CALL (with cookie) ===');
  // Get user token from DB
  const user = await p.user.findFirst({ where: { merchant: { id: merchantId } } });
  console.log('User found:', user?.email);
  
  // Try calling API - this will 401 without cookie, just checking DB state is source of truth
  try {
    const res = await fetch('http://localhost:3000/api/cards/setup', {
      headers: { 'x-merchant-id': merchantId } // simulate middleware injection
    });
    console.log('API Status:', res.status);
    const json = await res.json();
    console.log('isDefault:', json.data?.isDefault);
    console.log('card.stampsRequired:', json.data?.card?.stampsRequired);
    console.log('card.stampValue:', json.data?.card?.stampValue);
  } catch(e) {
    console.log('Could not reach API:', e.message);
  }
}

test().finally(() => p.$disconnect());
