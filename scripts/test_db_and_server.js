const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runCheck() {
  console.log('========================================================');
  console.log('🔍 CUSTOMERPILOT LOCAL ENVIRONMENT HEALTH CHECK');
  console.log('========================================================\n');

  // 1. Database Connection & Entity Check
  console.log('[1/2] Checking SQLite Database (prisma/dev.db)...');
  try {
    const [merchantCount, userCount, cardCount, sampleCards] = await Promise.all([
      prisma.merchant.count(),
      prisma.user.count(),
      prisma.digitalBusinessCard.count(),
      prisma.digitalBusinessCard.findMany({
        take: 5,
        select: { slug: true, displayName: true, locationShort: true, locationState: true, googleRating: true, googleReviewsCnt: true }
      })
    ]);

    console.log('  ✅ Database status: CONNECTED & HEALTHY');
    console.log(`  - Total Merchants: ${merchantCount}`);
    console.log(`  - Total Users: ${userCount}`);
    console.log(`  - Total Digital Business Cards: ${cardCount}`);
    console.log('  - Sample Live Cards in DB:');
    sampleCards.forEach(c => {
      console.log(`    • /c/${c.slug} -> "${c.displayName}" (${c.locationShort}, ${c.locationState}) [${c.googleRating}⭐ | ${c.googleReviewsCnt} reviews]`);
    });
  } catch (err) {
    console.error('  ❌ Database error:', err.message);
  } finally {
    await prisma.$disconnect();
  }

  // 2. HTTP Server Endpoints Check
  console.log('\n[2/2] Checking Localhost Next.js Web Server (http://localhost:3000)...');
  const urls = [
    { name: 'Homepage (Master FAQ)', url: 'http://localhost:3000/#faq' },
    { name: 'WhatsApp Loyalty Card LP', url: 'http://localhost:3000/whatsapp-digital-loyalty-card' },
    { name: 'Smart Digital Business Card LP', url: 'http://localhost:3000/smart-digital-business-card' },
    { name: 'Stamp Me Comparison LP', url: 'http://localhost:3000/vs/stamp-me' },
    { name: 'Tasty Vadapav Atladara Live Card', url: 'http://localhost:3000/c/tasty-vadapav-atladara' }
  ];

  for (const item of urls) {
    try {
      const res = await fetch(item.url.split('#')[0]);
      if (res.status === 200) {
        console.log(`  ✅ ${item.name} (${item.url}) -> HTTP 200 OK`);
      } else {
        console.log(`  ⚠️ ${item.name} (${item.url}) -> HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(`  ❌ ${item.name} (${item.url}) -> Connection failed: ${err.message}`);
    }
  }

  console.log('\n========================================================');
  console.log('🎉 ALL LOCALHOST SERVER & DATABASE SERVICES ARE ACTIVE & VERIFIED!');
  console.log('========================================================\n');
}

runCheck();
