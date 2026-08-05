import { db } from '../src/lib/db';

async function check() {
  const c = await db.customer.findFirst({
    where: { phone: '917203824012' }
  });
  console.log('Customer in DB:', JSON.stringify(c, null, 2));

  if (c) {
    const q = await db.waitingCustomer.findFirst({
      where: { customerId: c.id, status: 'waiting' }
    });
    console.log('Waiting Queue entry:', JSON.stringify(q, null, 2));

    const msgs = await db.whatsAppMessage.findMany({
      where: { toPhone: c.phone },
      orderBy: { createdAt: 'desc' }
    });
    console.log('WhatsApp Messages:', JSON.stringify(msgs, null, 2));
  } else {
    console.log('Customer NOT found in SQLite DB yet!');
  }
}

check().catch(console.error);
