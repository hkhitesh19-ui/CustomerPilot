const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const card = await prisma.digitalBusinessCard.findFirst({
    where: { slug: 'gujarat-photo-goods' }
  });
  console.log('--- DIGITAL BUSINESS CARD ---');
  console.log('googleRating:', card?.googleRating);
  console.log('googleReviewsCnt:', card?.googleReviewsCnt);
  console.log('openingHours:', card?.openingHours);
  console.log('address:', card?.address);
  console.log('locationShort:', card?.locationShort);
  console.log('locationState:', card?.locationState);
  console.log('phoneNumber:', card?.phoneNumber);
  console.log('whatsappNumber:', card?.whatsappNumber);
  console.log('websiteUrl:', card?.websiteUrl);
  console.log('--- ALL KEYS ---');
  console.log(JSON.stringify(card, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
