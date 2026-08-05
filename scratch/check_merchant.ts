import { db } from '../src/lib/db';

async function check() {
  const m = await db.merchant.findUnique({ where: { id: 'cms5m779i0002w0mcl1u0o8iy' } });
  console.log('Merchant detail:', JSON.stringify(m, null, 2));
}

check().catch(console.error);
