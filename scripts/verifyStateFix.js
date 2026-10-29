// Verify the full data flow end-to-end
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function verify() {
  const merchantId = 'cmsjw7n7i0001w0c0r6i3juhy';

  console.log('=== SIMULATING /api/state → stampCards ===');
  // OLD query (broken)
  const oldResult = await p.stampCard.findMany({ 
    where: { merchantId }, 
    orderBy: { createdAt: 'asc' },
    take: 50
  });
  console.log('OLD (createdAt asc) - stampCards[0]:', `stamps:${oldResult[0]?.stampsRequired} stampVal:${oldResult[0]?.stampValue} active:${oldResult[0]?.active}`);

  // NEW query (fixed)
  const newResult = await p.stampCard.findMany({ 
    where: { merchantId, active: true }, 
    orderBy: { updatedAt: 'desc' },
    take: 10
  });
  console.log('NEW (active only, updatedAt desc) - stampCards[0]:', `stamps:${newResult[0]?.stampsRequired} stampVal:${newResult[0]?.stampValue} active:${newResult[0]?.active}`);

  console.log('\n=== RESULT ===');
  if (newResult[0]?.stampValue === 300 && newResult[0]?.stampsRequired === 7) {
    console.log('✅ FIXED! stampCards[0] now returns the correct saved card (₹300, 7 stamps)');
  } else {
    console.log('❌ Still wrong:', newResult[0]);
  }
}

verify().finally(() => p.$disconnect());
