const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  // Find customer by phone (try multiple formats)
  const customer = await p.customer.findFirst({
    where: {
      OR: [
        { phone: '919033304707' },
        { phone: '9033304707' },
        { phone: { contains: '9033304707' } }
      ]
    }
  });

  if (!customer) {
    console.log('❌ Hitesh Customer not found in DB');
    
    // List all customers so we can see who is there
    const all = await p.customer.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
    console.log('\nRecent customers in DB:');
    all.forEach(c => console.log(' -', c.name, '|', c.phone, '|', c.createdAt?.toISOString()));
    return;
  }

  console.log('✅ Customer:', customer.name, '| ID:', customer.id, '| botState:', customer.botState);

  // All WA messages sent TO this customer
  const msgs = await p.whatsAppMessage.findMany({
    where: {
      OR: [
        { toPhone: customer.phone },
        { toPhone: '919033304707' },
        { toPhone: '9033304707' }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log('\n=== All WA Messages sent to Hitesh ===');
  msgs.forEach(m => {
    console.log(
      `[${m.createdAt?.toISOString()}]`,
      `sentAt: ${m.sentAt?.toISOString() || '❌ NULL'}`,
      `| type: ${m.type}`,
      `| status: ${m.status}`
    );
  });

  // Show the last message by createdAt DESC (what webhook sees)
  const lastByCreatedAt = await p.whatsAppMessage.findFirst({
    where: {
      OR: [
        { toPhone: customer.phone },
        { toPhone: '919033304707' }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n=== Webhook sees (ORDER BY createdAt DESC) ===');
  console.log('lastSentMsg type:', lastByCreatedAt?.type, '| status:', lastByCreatedAt?.status);
  
  if (lastByCreatedAt?.type === 'review_request') {
    console.log('✅ CORRECT: Last message is review_request → "Yes" should trigger AI draft');
  } else {
    console.log('❌ WRONG: Last message is NOT review_request → "Yes" will be ignored!');
  }
}

run().catch(console.error).finally(() => p.$disconnect());
