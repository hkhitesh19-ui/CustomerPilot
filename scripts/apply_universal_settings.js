const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const newDefaults = {
    cardName: 'Cake Connection VIP Club',
    rewardName: '1 Free Cake',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 1,
    color: '#6366f1',
    tierRewardsEnabled: false,
    rewardImageUrl: '',
    loyaltyCategoryNames: [
      'VIP', 'VIP Silver', 'VIP Gold', 'VIP Platinum', 'VIP Diamond',
      'VIP Elite', 'VIP Master', 'VIP Champion', 'VIP Legend', 'VIP Imperial'
    ],
    googleReviewDelayMinutes: 5,
    winbackDays1: 30,
    winbackDays2: 60,
    winbackDays3: 90,
    expiryWarningDays: 7,
    enabledModules: 'LOYALTY,REVIEWS,AUTOREPLY'
  };

  // 1. Upsert SystemContent
  const sc = await prisma.systemContent.upsert({
    where: { key: 'GLOBAL_DEFAULT_MERCHANT_SETTINGS' },
    create: {
      key: 'GLOBAL_DEFAULT_MERCHANT_SETTINGS',
      section: 'super_admin',
      category: 'default_merchant_rules',
      value: JSON.stringify(newDefaults)
    },
    update: {
      value: JSON.stringify(newDefaults)
    }
  });
  console.log('SystemContent updated:', sc.key);

  // 2. Batch update active stamp cards
  const cardsRes = await prisma.stampCard.updateMany({
    where: { active: true },
    data: {
      name: newDefaults.cardName,
      rewardName: newDefaults.rewardName,
      stampsRequired: newDefaults.stampsRequired,
      stampValue: newDefaults.stampValue,
      validityDays: newDefaults.validityDays,
      googleReviewBonus: newDefaults.googleReviewBonus,
      photoBonus: newDefaults.photoBonus,
      joiningBonusEnabled: newDefaults.joiningBonusEnabled,
      joiningBonusStamps: newDefaults.joiningBonusStamps,
      color: newDefaults.color
    }
  });
  console.log('Active StampCards updated count:', cardsRes.count);

  // 3. Batch update active merchants
  const merchantsRes = await prisma.merchant.updateMany({
    data: {
      vipUpgradeBonusStamps: newDefaults.vipUpgradeBonusStamps,
      loyaltyCategoryNames: JSON.stringify(newDefaults.loyaltyCategoryNames),
      googleReviewDelayMinutes: newDefaults.googleReviewDelayMinutes,
      winbackDays1: newDefaults.winbackDays1,
      winbackDays2: newDefaults.winbackDays2,
      winbackDays3: newDefaults.winbackDays3,
      expiryWarningDays: newDefaults.expiryWarningDays
    }
  });
  console.log('Merchants updated count:', merchantsRes.count);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
