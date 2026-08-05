import { db } from '../src/lib/db';

async function checkDbOnly() {
  console.log('=== 📊 CUSTOMERPILOT SQLITE DATABASE STATE ===');
  
  const latestMsgs = await db.whatsAppMessage.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  console.log('\n📱 WhatsAppMessages Table (Total Count:', latestMsgs.length, '):');
  if (latestMsgs.length === 0) {
    console.log('  (No messages logged yet)');
  } else {
    latestMsgs.forEach(m => console.log(`  -> [${m.template}] Phone: +${m.toPhone} | Status: ${m.status} | Text: ${m.body?.substring(0, 70)}`));
  }

  const latestCustomers = await db.customer.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  console.log('\n👤 Customers Table (Total Count:', latestCustomers.length, '):');
  if (latestCustomers.length === 0) {
    console.log('  (No customers saved yet)');
  } else {
    latestCustomers.forEach(c => console.log(`  -> Name: ${c.name} | Phone: +${c.phone} | Lifetime Stamps: ${c.lifetimeStamps} | Spend: ₹${c.lifetimeSpend}`));
  }

  const queue = await db.waitingCustomer.findMany({ take: 10, include: { customer: true }, orderBy: { createdAt: 'desc' } });
  console.log('\n📋 WaitingCustomer Queue (Total Count:', queue.length, '):');
  if (queue.length === 0) {
    console.log('  (Queue is currently empty)');
  } else {
    queue.forEach(q => console.log(`  -> Customer: ${q.customer?.name} | Phone: +${q.customer?.phone} | Status: ${q.status} | Amount: ₹${q.amount}`));
  }

  const bills = await db.bill.findMany({ take: 10, include: { customer: true }, orderBy: { createdAt: 'desc' } });
  console.log('\n🧾 Bills Table (Total Count:', bills.length, '):');
  if (bills.length === 0) {
    console.log('  (No bills generated yet)');
  } else {
    bills.forEach(b => console.log(`  -> Bill #${b.number} | Customer: ${b.customer?.name} | Amount: ₹${b.amount} | Stamps: ${b.stampsAwarded} | Notes: ${b.notes}`));
  }
}

checkDbOnly().catch(console.error);
