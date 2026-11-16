const path = require('path');
const root = process.env.ROOT_DIR || path.join(__dirname, '..');
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:' + path.join(root, 'prisma', 'dev.db');
}
const { PrismaClient } = require(path.join(root, 'node_modules', '@prisma', 'client'));
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Shreenath Rajwadi Silk Palace into CustomerPilot DB...');

  // Check if merchant already exists
  let merchant = await prisma.merchant.findFirst({
    where: {
      OR: [
        { email: 'KumawatVasu92@gmail.com' },
        { whatsappPhone: '919898909032' },
        { name: { contains: 'Shreenath Rajwadi' } }
      ]
    },
    include: { qrCodes: true, user: true }
  });

  const destUrl = 'https://chat.whatsapp.com/JkoU8GisR6mJVkZoNEzE60?s=cl&p=i&iam=2';
  const slug = 'shreenath-rajwadi-silk-palace';

  if (!merchant) {
    // Create User first or with Merchant
    const user = await prisma.user.create({
      data: {
        email: 'KumawatVasu92@gmail.com',
        name: 'Vasu Kumawat',
        role: 'merchant'
      }
    });

    merchant = await prisma.merchant.create({
      data: {
        userId: user.id,
        merchantIdNumber: 'M-VAD-SRSP',
        name: 'Shreenath Rajwadi Silk Palace',
        ownerName: 'Vasu Kumawat',
        businessType: 'RETAIL',
        category: 'Saree shop',
        city: 'Vadodara',
        address: 'A/23-24, Aakar Complex, Opp. Shree Hari Party Plot, Besides KedarDham Society, Near Patidar Char Rasta, Manjalpur, Vadodara, Gujarat 390011',
        email: 'KumawatVasu92@gmail.com',
        whatsappPhone: '919898909032',
        businessTiming: '10:00 AM – 9:00 PM (All 7 Days)',
        plan: 'gear6',
        status: 'active',
        communityUrl: destUrl,
        baselineReviewCount: 73,
        baselineRating: 3.8,
        enabledModules: 'LOYALTY,REVIEWS,AUTOREPLY,POS,CHATBOT,WHATSAPP_BOOSTER',
        onboardingCompleted: true,
        currentStep: 5
      }
    });
    console.log('Created Merchant:', merchant.id, merchant.name);
  } else {
    // Update existing merchant
    merchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        name: 'Shreenath Rajwadi Silk Palace',
        ownerName: 'Vasu Kumawat',
        businessType: 'RETAIL',
        category: 'Saree shop',
        city: 'Vadodara',
        address: 'A/23-24, Aakar Complex, Opp. Shree Hari Party Plot, Besides KedarDham Society, Near Patidar Char Rasta, Manjalpur, Vadodara, Gujarat 390011',
        email: 'KumawatVasu92@gmail.com',
        whatsappPhone: '919898909032',
        businessTiming: '10:00 AM – 9:00 PM (All 7 Days)',
        plan: 'gear6',
        status: 'active',
        communityUrl: destUrl,
        baselineReviewCount: 73,
        baselineRating: 3.8,
        enabledModules: 'LOYALTY,REVIEWS,AUTOREPLY,POS,CHATBOT,WHATSAPP_BOOSTER',
        onboardingCompleted: true
      }
    });
    console.log('Updated Merchant:', merchant.id, merchant.name);
  }

  // Ensure QrCode exists
  let qrCode = await prisma.qrCode.findUnique({
    where: { slug }
  });

  if (!qrCode) {
    qrCode = await prisma.qrCode.create({
      data: {
        merchantId: merchant.id,
        slug: slug,
        label: 'Main Counter QR - WhatsApp Group (Fast Mode)',
        currentDest: destUrl,
        redirectMode: 'DIRECT',
        tier: 'PRO',
        isActive: true
      }
    });
    console.log('Created QrCode:', qrCode.id, qrCode.slug);
  } else {
    qrCode = await prisma.qrCode.update({
      where: { id: qrCode.id },
      data: {
        merchantId: merchant.id,
        currentDest: destUrl,
        redirectMode: 'DIRECT',
        tier: 'PRO',
        isActive: true
      }
    });
    console.log('Updated QrCode:', qrCode.id, qrCode.slug);
  }

  // Record destination change log
  await prisma.qrDestination.create({
    data: {
      qrCodeId: qrCode.id,
      destination: destUrl,
      note: 'Initial setup for Shreenath Rajwadi Silk Palace WhatsApp Group Booster Pro'
    }
  });

  console.log('Setup successfully completed!');
  console.log({
    merchantId: merchant.id,
    merchantName: merchant.name,
    ownerEmail: merchant.email,
    slug: qrCode.slug,
    destination: qrCode.currentDest,
    redirectMode: qrCode.redirectMode
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
