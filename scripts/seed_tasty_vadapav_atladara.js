const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 100% accurate ground-truth Digital Business Card for Tasty Vadapav (Atladara Padra Road)...');

  // 1. Ensure Merchant exists
  const merchant = await prisma.merchant.upsert({
    where: { id: 'merchant_tasty_vadapav_atladara' },
    update: {
      name: 'Tasty vadapav Atladara padra road(nizampura vala)',
      whatsappPhone: '+919328112314',
      city: 'Vadodara',
      address: 'Shop No. GF-15, Tower-A, Samanvay Status, Near Banco Products, Padra Road, Atladara, Vadodara, Gujarat 391410',
    },
    create: {
      id: 'merchant_tasty_vadapav_atladara',
      name: 'Tasty vadapav Atladara padra road(nizampura vala)',
      email: 'atladara@tastyvadapav.com',
      address: 'Shop No. GF-15, Tower-A, Samanvay Status, Near Banco Products, Padra Road, Atladara, Vadodara, Gujarat 391410',
      whatsappPhone: '+919328112314',
      city: 'Vadodara',
    }
  });

  const orderingPlatforms = [
    { platform: "website", label: "Website", sublabel: "Menu", url: "https://tastyvadapav.com", color: "bg-blue-600" },
    { platform: "whatsapp", label: "WhatsApp", sublabel: "Order", url: "https://wa.me/919328112314?text=Hi%20Tasty%20Vadapav%2C%20I%20want%20to%20order", color: "bg-[#25D366]" },
    { platform: "swiggy", label: "Swiggy", sublabel: "Order", url: "https://www.swiggy.com/restaurants/tasty-vadapav-atladara-padra-road-nizampura-vala-vadodara-877717", color: "bg-[#fc8019]" },
    { platform: "directions", label: "Directions", sublabel: "Visit", url: "https://www.google.com/maps/dir/?api=1&destination=Tasty+vadapav+Atladara+padra+road(nizampura+vala)&destination_place_id=ChIJCYBASZnHXzkRZvLItnjimsk", color: "bg-amber-600" }
  ];

  // 2. Upsert DigitalBusinessCard
  const card = await prisma.digitalBusinessCard.upsert({
    where: { slug: 'tasty-vadapav-atladara' },
    update: {
      displayName: 'Tasty vadapav Atladara padra road(nizampura vala)',
      subCategories: 'Fast Food • Vadapav Specialist • Maharashtrian • Atladara',
      logoUrl: '/uploads/tasty-vadapav-logo.png',
      locationShort: 'Atladara',
      locationState: 'Padra Road, Vadodara',
      businessHours: 'Open Daily • 9:00 AM – 9:00 PM',
      deliveryInfo: 'Swiggy & Takeaway',
      whatsappNumber: '919328112314',
      phoneNumber: '+91 93281 12314',
      instagramUrl: 'https://www.instagram.com/tasty.vadapav/',
      facebookUrl: 'https://www.facebook.com/tastyvadapav/',
      youtubeUrl: '',
      googleMapsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJCYBASZnHXzkRZvLItnjimsk',
      websiteUrl: 'https://tastyvadapav.com',
      googleRating: 4.0,
      googleReviewsCnt: 52,
      orderingLinks: JSON.stringify(orderingPlatforms),
      isActive: true,
    },
    create: {
      merchantId: merchant.id,
      slug: 'tasty-vadapav-atladara',
      displayName: 'Tasty vadapav Atladara padra road(nizampura vala)',
      subCategories: 'Fast Food • Vadapav Specialist • Maharashtrian • Atladara',
      logoUrl: '/uploads/tasty-vadapav-logo.png',
      locationShort: 'Atladara',
      locationState: 'Padra Road, Vadodara',
      businessHours: 'Open Daily • 9:00 AM – 9:00 PM',
      deliveryInfo: 'Swiggy & Takeaway',
      whatsappNumber: '919328112314',
      phoneNumber: '+91 93281 12314',
      instagramUrl: 'https://www.instagram.com/tasty.vadapav/',
      facebookUrl: 'https://www.facebook.com/tastyvadapav/',
      youtubeUrl: '',
      googleMapsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJCYBASZnHXzkRZvLItnjimsk',
      websiteUrl: 'https://tastyvadapav.com',
      googleRating: 4.0,
      googleReviewsCnt: 52,
      orderingLinks: JSON.stringify(orderingPlatforms),
      isActive: true,
    }
  });

  console.log('✅ Successfully provisioned Tasty Vadapav (Atladara) card with ID:', card.id);
  console.log('Live URL: http://localhost:3000/c/tasty-vadapav-atladara');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
