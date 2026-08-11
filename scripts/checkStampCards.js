const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  const cards = await p.stampCard.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log('TOTAL STAMP CARDS IN DB:', cards.length);
  cards.forEach(c => {
    console.log('---');
    console.log('ID:', c.id);
    console.log('merchantId:', c.merchantId);
    console.log('name:', c.name);
    console.log('stampsRequired:', c.stampsRequired);
    console.log('rewardName:', c.rewardName);
    console.log('stampValue:', c.stampValue);
    console.log('photoBonus:', c.photoBonus);
    console.log('active:', c.active);
    console.log('createdAt:', c.createdAt);
    console.log('updatedAt:', c.updatedAt);
  });
}

check().finally(() => p.$disconnect());
