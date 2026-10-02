const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 100% accurate ground-truth Digital Business Card for Tasty Vadapav...');

  // 1. Ensure Merchant exists
  const merchant = await prisma.merchant.upsert({
    where: { id: 'merchant_tasty_vadapav' },
    update: {
      name: 'Tasty Vadapav (Nizampura wala)',
      whatsappPhone: '+919974620201',
      city: 'Vadodara',
    },
    create: {
      id: 'merchant_tasty_vadapav',
      name: 'Tasty Vadapav (Nizampura wala)',
      email: 'contact@tastyvadapav.com',
      address: 'Ground Floor, Braj Complex, Nizampura Rd, opp. Ghelani Petrol Pump, Vadodara, Gujarat 390002',
      whatsappPhone: '+919974620201',
      city: 'Vadodara',
    }
  });

  const orderingPlatforms = [
    { platform: "website", label: "Website", sublabel: "Menu", url: "https://tastyvadapav.com", color: "bg-blue-600" },
    { platform: "whatsapp", label: "WhatsApp", sublabel: "Order", url: "https://wa.me/919974620201?text=Hi%20Tasty%20Vadapav%2C%20I%20want%20to%20order", color: "bg-[#25D366]" },
    { platform: "zomato", label: "Zomato", sublabel: "Order", url: "https://www.zomato.com/vadodara/tasty-vadapav-center-nizampura", color: "bg-[#e23744]" },
    { platform: "swiggy", label: "Swiggy", sublabel: "Order", url: "https://www.swiggy.com/restaurants/tasty-vadapav-nizampura-vadodara", color: "bg-[#fc8019]" },
    { platform: "directions", label: "Directions", sublabel: "Visit", url: "https://maps.google.com/?q=Tasty+Vadapav+Nizampura+Vadodara", color: "bg-amber-600" }
  ];

  // 2. Upsert DigitalBusinessCard
  const card = await prisma.digitalBusinessCard.upsert({
    where: { slug: 'tasty-vadapav' },
    update: {
      displayName: 'Tasty Vadapav',
      subCategories: 'Fast Food • Vadapav Specialist • Butter & Cheese • Since 2005',
      logoUrl: '/uploads/tasty-vadapav-logo.png',
      locationShort: 'Nizampura',
      locationState: 'Vadodara, Gujarat',
      businessHours: 'Open Daily • 9:00 AM – 9:00 PM',
      deliveryInfo: 'Zomato & Swiggy',
      whatsappNumber: '919974620201',
      phoneNumber: '+91 99746 20201',
      instagramUrl: 'https://www.instagram.com/tasty.vadapav/',
      facebookUrl: 'https://www.facebook.com/tastyvadapav/',
      youtubeUrl: '',
      googleMapsUrl: 'https://maps.google.com/?q=Tasty+Vadapav+Nizampura+Vadodara',
      websiteUrl: 'https://tastyvadapav.com',
      googleRating: 4.4,
      googleReviewsCnt: 1250,
      orderingLinks: JSON.stringify(orderingPlatforms),
      isActive: true,
    },
    create: {
      merchantId: merchant.id,
      slug: 'tasty-vadapav',
      displayName: 'Tasty Vadapav',
      subCategories: 'Fast Food • Vadapav Specialist • Butter & Cheese • Since 2005',
      logoUrl: '/uploads/tasty-vadapav-logo.png',
      locationShort: 'Nizampura',
      locationState: 'Vadodara, Gujarat',
      businessHours: 'Open Daily • 9:00 AM – 9:00 PM',
      deliveryInfo: 'Zomato & Swiggy',
      whatsappNumber: '919974620201',
      phoneNumber: '+91 99746 20201',
      instagramUrl: 'https://www.instagram.com/tasty.vadapav/',
      facebookUrl: 'https://www.facebook.com/tastyvadapav/',
      youtubeUrl: '',
      googleMapsUrl: 'https://maps.google.com/?q=Tasty+Vadapav+Nizampura+Vadodara',
      websiteUrl: 'https://tastyvadapav.com',
      googleRating: 4.4,
      googleReviewsCnt: 1250,
      orderingLinks: JSON.stringify(orderingPlatforms),
      isActive: true,
    }
  });

  console.log('✅ Successfully seeded Tasty Vadapav card with ID:', card.id);
  console.log('Live URL: http://localhost:3000/c/tasty-vadapav');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
