import { db } from './src/lib/db';

async function main() {
  const columns = await db.$queryRawUnsafe('PRAGMA table_info(Merchant);');
  console.log('--- COLUMNS IN MERCHANT TABLE ---');
  console.log(columns);
  await db.$disconnect();
}

main().catch(console.error);
