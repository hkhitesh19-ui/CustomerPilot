const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateExactGroundTruth() {
  const orderingLinks = JSON.stringify([
    { platform: "website", label: "Store", sublabel: "Buy Online", url: "https://gujaratphotogoods.in", color: "bg-blue-600" },
    { platform: "whatsapp", label: "WhatsApp", sublabel: "Get Quotes", url: "https://wa.me/919825037489?text=Hello%20Gujarat%20Photo%20Goods%2C%20I%20am%20interested%20in%20camera%20and%20lens%20pricing", color: "bg-[#25D366]" },
    { platform: "nikon", label: "Nikon", sublabel: "Mirrorless", url: "https://gujaratphotogoods.in", color: "bg-[#eab308]" },
    { platform: "sony", label: "Sony α", sublabel: "Cinema & Lens", url: "https://gujaratphotogoods.in", color: "bg-[#0284c7]" },
    { platform: "dji", label: "DJI", sublabel: "Gimbals", url: "https://gujaratphotogoods.in", color: "bg-[#0f766e]" },
  ]);

  const updated = await prisma.digitalBusinessCard.update({
    where: { slug: 'gujarat-photo-goods' },
    data: {
      displayName: 'Gujarat Photo Goods',
      googleRating: 4.5,
      googleReviewsCnt: 406,
      subCategories: 'Camera Store • Pro Lenses • Drones • Camera Demo',
      businessHours: 'Open · Closes 7:30 PM',
      locationShort: 'Ashram Road',
      locationState: 'Ahmedabad, Gujarat',
      orderingLinks: orderingLinks,
    }
  });

  console.log('EXACT GROUND TRUTH SYNCHRONIZED:');
  console.log({
    displayName: updated.displayName,
    googleRating: updated.googleRating,
    googleReviewsCnt: updated.googleReviewsCnt,
    subCategories: updated.subCategories,
    businessHours: updated.businessHours,
    locationShort: updated.locationShort,
    locationState: updated.locationState,
  });
}

updateExactGroundTruth()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
