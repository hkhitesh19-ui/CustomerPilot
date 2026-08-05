import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const db = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'cpilot_salt_2026').digest('hex');
}

async function main() {
  const users = await db.user.findMany();
  console.log('--- ALL USERS IN DB ---');
  for (const u of users) {
    console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | PasswordHash: ${u.password}`);
    console.log(`Is password '123456'? ${u.password === hashPassword('123456')}`);
  }

  const merchants = await db.merchant.findMany();
  console.log('\n--- ALL MERCHANTS IN DB ---');
  for (const m of merchants) {
    console.log(`ID: ${m.id} | Name: ${m.name} | Email: ${m.email} | UserId: ${m.userId} | Phone: ${m.whatsappPhone}`);
  }

  await db.$disconnect();
}

main().catch(console.error);
