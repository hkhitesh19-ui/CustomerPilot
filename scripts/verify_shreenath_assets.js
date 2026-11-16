require('dotenv').config();
const fs = require('fs');
const path = require('path');
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:' + path.join(__dirname, '..', 'prisma', 'dev.db');
}

async function main() {
  const root = process.cwd();
  console.log('Verifying Shreenath Rajwadi Silk Palace Assets & Data...');

  // 1. Check generated standees
  const waStandeePath = path.join(root, 'public', 'standees', 'shreenath_rajwadi_whatsapp_standee.png');
  const cleanStandeePath = path.join(root, 'public', 'standees', 'shreenath_rajwadi_clean_standee.png');
  const waQrPath = path.join(root, 'public', 'qrcodes', 'shreenath_booster_whatsapp_logo_qr.png');
  const cleanQrPath = path.join(root, 'public', 'qrcodes', 'shreenath_booster_clean_qr.png');

  if (!fs.existsSync(waStandeePath)) throw new Error('Missing waStandeePath');
  if (!fs.existsSync(cleanStandeePath)) throw new Error('Missing cleanStandeePath');
  if (!fs.existsSync(waQrPath)) throw new Error('Missing waQrPath');
  if (!fs.existsSync(cleanQrPath)) throw new Error('Missing cleanQrPath');

  console.log('✅ Standee with WhatsApp Logo:', fs.statSync(waStandeePath).size, 'bytes');
  console.log('✅ Standee Clean:', fs.statSync(cleanStandeePath).size, 'bytes');
  console.log('✅ QR with WhatsApp Logo:', fs.statSync(waQrPath).size, 'bytes');
  console.log('✅ QR Clean:', fs.statSync(cleanQrPath).size, 'bytes');

  // 2. Check Database Record
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const merchant = await prisma.merchant.findFirst({
    where: { name: 'Shreenath Rajwadi Silk Palace' },
    include: { qrCodes: true, user: true }
  });

  if (!merchant) throw new Error('Merchant not found in DB');
  console.log('✅ Merchant Found in DB:', merchant.name, merchant.city, merchant.plan);
  console.log('✅ User in DB:', merchant.user?.email, merchant.user?.role);
  console.log('✅ QR Code in DB:', merchant.qrCodes[0]?.slug, merchant.qrCodes[0]?.currentDest);

  if (merchant.qrCodes[0]?.slug !== 'shreenath-rajwadi-silk-palace') {
    throw new Error('QR Slug mismatch!');
  }
  if (!merchant.qrCodes[0]?.currentDest.includes('chat.whatsapp.com/JkoU8GisR6mJVkZoNEzE60')) {
    throw new Error('Destination URL mismatch!');
  }

  console.log('\n🎉 ALL GROUND TRUTH ASSERTIONS PASSED 100%!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
