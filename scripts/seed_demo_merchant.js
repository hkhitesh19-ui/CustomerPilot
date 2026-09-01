const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('DemoPass2026!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'order.cakeconnection@gmail.com' },
    update: { password: passwordHash, role: 'merchant' },
    create: { email: 'order.cakeconnection@gmail.com', name: 'Cake Connection', password: passwordHash, role: 'merchant' }
  });

  const merchant = await prisma.merchant.upsert({
    where: { whatsappPhone: '9033304707' },
    update: {
      name: 'Cake Connection',
      ownerName: 'Amit Sharma',
      email: 'order.cakeconnection@gmail.com',
      whatsappPhone: '9033304707',
      plan: 'growth_180',
      enabledModules: 'LOYALTY,REVIEWS,AUTOREPLY',
      status: 'active',
      businessType: 'Bakery & Cafe',
      googleReviewDelayMinutes: 5,
      userId: user.id
    },
    create: {
      name: 'Cake Connection',
      ownerName: 'Amit Sharma',
      email: 'order.cakeconnection@gmail.com',
      whatsappPhone: '9033304707',
      plan: 'growth_180',
      enabledModules: 'LOYALTY,REVIEWS,AUTOREPLY',
      status: 'active',
      businessType: 'Bakery & Cafe',
      googleReviewDelayMinutes: 5,
      userId: user.id
    }
  });

  let card = await prisma.stampCard.findFirst({ where: { merchantId: merchant.id, active: true } });
  if (!card) {
    card = await prisma.stampCard.create({
      data: {
        merchantId: merchant.id,
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
    { name: 'Neha Gupta', phone: '+919876543213', stamps: 1, spend: 200, visits: 1, vipTier: 'none' },
    { name: 'Vikram Singh', phone: '+919876543214', stamps: 4, spend: 950, visits: 4, vipTier: 'Silver' },
  ];

  for (const sc of sampleCustomers) {
    await prisma.customer.upsert({
      where: { merchantId_phone: { merchantId: merchant.id, phone: sc.phone } },
      update: { name: sc.name, lifetimeStamps: sc.stamps, lifetimeSpend: sc.spend, vipTier: sc.vipTier, status: 'ACTIVE' },
      create: { merchantId: merchant.id, name: sc.name, phone: sc.phone, lifetimeStamps: sc.stamps, lifetimeSpend: sc.spend, vipTier: sc.vipTier, status: 'ACTIVE' }
    });
  }
  console.log('✅ Demo Merchant seeded successfully: ' + merchant.name + ' (ID: ' + merchant.id + ')');
}
main().finally(() => prisma.$disconnect());
