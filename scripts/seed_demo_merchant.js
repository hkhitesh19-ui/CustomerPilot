const path = require('path');
const dbPath = path.resolve(__dirname, '../prisma/dev.db').replace(/\\/g, '/');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

async function main() {
  const passwordHash = await bcrypt.hash('DemoPass2026!', 10);
  
  // 1. Merchant 1: Cake Connection
  const user1 = await prisma.user.upsert({
    where: { email: 'order.cakeconnection@gmail.com' },
    update: { password: passwordHash, role: 'merchant' },
    create: { email: 'order.cakeconnection@gmail.com', name: 'Cake Connection', password: passwordHash, role: 'merchant' }
  });

  const merchant1 = await prisma.merchant.upsert({
    where: { whatsappPhone: '9033304707' },
    update: {
      name: 'Cake Connection',
      ownerName: 'Amit Sharma',
      email: 'order.cakeconnection@gmail.com',
      whatsappPhone: '9033304707',
      city: 'Surat',
      googleReviewLink: 'https://maps.app.goo.gl/cakeconnection',
      baselineRating: 4.2,
      baselineReviewCount: 114,
      baselineScreenshotUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      baselineCapturedAt: new Date('2026-09-01T10:30:00Z'),
      plan: 'growth_180',
      enabledModules: 'LOYALTY,REVIEWS,AUTOREPLY',
      status: 'active',
      businessType: 'Bakery & Cafe',
      googleReviewDelayMinutes: 5,
      userId: user1.id
    },
    create: {
      name: 'Cake Connection',
      ownerName: 'Amit Sharma',
      email: 'order.cakeconnection@gmail.com',
      whatsappPhone: '9033304707',
      city: 'Surat',
      googleReviewLink: 'https://maps.app.goo.gl/cakeconnection',
      baselineRating: 4.2,
      baselineReviewCount: 114,
      baselineScreenshotUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      baselineCapturedAt: new Date('2026-09-01T10:30:00Z'),
      plan: 'growth_180',
      enabledModules: 'LOYALTY,REVIEWS,AUTOREPLY',
      status: 'active',
      businessType: 'Bakery & Cafe',
      googleReviewDelayMinutes: 5,
      userId: user1.id
    }
  });

  // 2. Merchant 2: Royal Spice Restro
  const user2 = await prisma.user.upsert({
    where: { email: 'royalspice.ahmedabad@gmail.com' },
    update: { password: passwordHash, role: 'merchant' },
    create: { email: 'royalspice.ahmedabad@gmail.com', name: 'Royal Spice Restro', password: passwordHash, role: 'merchant' }
  });

  const merchant2 = await prisma.merchant.upsert({
    where: { whatsappPhone: '9876500001' },
    update: {
      name: 'Royal Spice Restro',
      ownerName: 'Rajesh Chawla',
      email: 'royalspice.ahmedabad@gmail.com',
      whatsappPhone: '9876500001',
      city: 'Ahmedabad',
      googleReviewLink: 'https://maps.app.goo.gl/royalspice',
      baselineRating: 4.6,
      baselineReviewCount: 238,
      baselineScreenshotUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      baselineCapturedAt: new Date('2026-09-15T14:45:00Z'),
      plan: 'scaling_365',
      enabledModules: 'LOYALTY,REVIEWS,AUTOREPLY',
      status: 'active',
      businessType: 'Multi-Cuisine Restaurant',
      googleReviewDelayMinutes: 3,
      userId: user2.id
    },
    create: {
      name: 'Royal Spice Restro',
      ownerName: 'Rajesh Chawla',
      email: 'royalspice.ahmedabad@gmail.com',
      whatsappPhone: '9876500001',
      city: 'Ahmedabad',
      googleReviewLink: 'https://maps.app.goo.gl/royalspice',
      baselineRating: 4.6,
      baselineReviewCount: 238,
      baselineScreenshotUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      baselineCapturedAt: new Date('2026-09-15T14:45:00Z'),
      plan: 'scaling_365',
      enabledModules: 'LOYALTY,REVIEWS,AUTOREPLY',
      status: 'active',
      businessType: 'Multi-Cuisine Restaurant',
      googleReviewDelayMinutes: 3,
      userId: user2.id
    }
  });

  // Stamp card for Cake Connection
  let card = await prisma.stampCard.findFirst({ where: { merchantId: merchant1.id, active: true } });
  if (!card) {
    await prisma.stampCard.create({
      data: {
        merchantId: merchant1.id,
        name: 'Cake Lover Stamp Card',
        stampsRequired: 6,
        rewardName: 'Free 500g Dutch Truffle Cake',
        stampValue: 200,
        validityDays: 180,
        googleReviewBonus: 2,
        photoBonus: 1,
        active: true
      }
    });
  }

  const sampleCustomers = [
    { name: 'Rahul Sharma', phone: '+919876543210', stamps: 5, spend: 1250, visits: 5, vipTier: 'Gold' },
    { name: 'Priya Patel', phone: '+919876543211', stamps: 3, spend: 650, visits: 3, vipTier: 'Silver' },
    { name: 'Aman Verma', phone: '+919876543212', stamps: 6, spend: 2400, visits: 8, vipTier: 'Platinum' },
  ];

  for (const sc of sampleCustomers) {
    await prisma.customer.upsert({
      where: { merchantId_phone: { merchantId: merchant1.id, phone: sc.phone } },
      update: { name: sc.name, lifetimeStamps: sc.stamps, lifetimeSpend: sc.spend, vipTier: sc.vipTier, status: 'ACTIVE' },
      create: { merchantId: merchant1.id, name: sc.name, phone: sc.phone, lifetimeStamps: sc.stamps, lifetimeSpend: sc.spend, vipTier: sc.vipTier, status: 'ACTIVE' }
    });
  }

  console.log('✅ Demo Merchants seeded successfully:');
  console.log('  1. ' + merchant1.name + ' (City: ' + merchant1.city + ', Baseline: ' + merchant1.baselineRating + ' / ' + merchant1.baselineReviewCount + ' reviews)');
  console.log('  2. ' + merchant2.name + ' (City: ' + merchant2.city + ', Baseline: ' + merchant2.baselineRating + ' / ' + merchant2.baselineReviewCount + ' reviews)');
}

main().catch(console.error).finally(() => prisma.$disconnect());
