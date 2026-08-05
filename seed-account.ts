import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const db = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'cpilot_salt_2026').digest('hex');
}

async function main() {
  const email = 'order.cakeconnection@gmail.com';
  const password = '123456';
  const hashedPassword = hashPassword(password);

  console.log(`Setting up account for ${email}...`);

  // Upsert User
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: 'Hitesh Kumar',
        password: hashedPassword,
        role: 'merchant',
      }
    });
    console.log(`User created with ID: ${user.id}`);
  } else {
    user = await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, name: 'Hitesh Kumar' }
    });
    console.log(`User updated with ID: ${user.id}`);
  }

  // Upsert Merchant
  let merchant = await db.merchant.findFirst({ where: { email } });
  if (!merchant) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    merchant = await db.merchant.create({
      data: {
        userId: user.id,
        name: 'Cake Connection',
        ownerName: 'Hitesh Kumar',
        email,
        whatsappPhone: '917203824012',
        businessType: 'bakery',
        address: 'Vadodara, Gujarat',
        plan: 'trial',
        status: 'active',
        trialEndsAt,
        onboardingCompleted: true,
        currentStep: 8,
      }
    });
    console.log(`Merchant created with ID: ${merchant.id}`);
  } else {
    merchant = await db.merchant.update({
      where: { id: merchant.id },
      data: {
        userId: user.id,
        name: 'Cake Connection',
        ownerName: 'Hitesh Kumar',
        whatsappPhone: '917203824012',
        onboardingCompleted: true,
      }
    });
    console.log(`Merchant updated with ID: ${merchant.id}`);
  }

  // Ensure StampCard exists
  let card = await db.stampCard.findFirst({ where: { merchantId: merchant.id } });
  if (!card) {
    await db.stampCard.create({
      data: {
        merchantId: merchant.id,
        name: 'Cake Connection VIP Club',
        stampsRequired: 10,
        rewardName: 'FREE 500gm Cake',
        stampValue: 500,
        googleReviewBonus: 1,
        photoBonus: 2,
        active: true,
      }
    });
    console.log('Stamp card created.');
  }

  console.log('✅ Account setup successfully!');
  await db.$disconnect();
}

main().catch(console.error);
