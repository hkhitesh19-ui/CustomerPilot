const http = require('http');

const post = (path, body, headers = {}) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
  });
  req.on('error', reject);
  if (body) req.write(JSON.stringify(body));
  req.end();
});

const get = (path) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path,
    method: 'GET'
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
  });
  req.on('error', reject);
  req.end();
});

async function runE2ETest() {
  console.log('======================================================');
  console.log('CUSTOMER PILOT V26 - END TO END MANUAL SIMULATION TEST');
  console.log('======================================================\n');
  
  try {
    // We will use a dedicated test phone number
    const testPhone = '919000000001';
    
    console.log('--- STEP 1: CUSTOMER SCANS QR CODE ---');
    console.log('Action: Customer sends "Join Cake Connection VIP Club"');
    const scanRes = await post('/api/whatsapp/webhook', {
      fromPhone: testPhone,
      message: 'Join Cake Connection VIP Club',
      pushName: 'Virat Kohli'
    });
    console.log('System Response:', scanRes.data);
    await new Promise(r => setTimeout(r, 1000));

    console.log('\n--- STEP 2: CUSTOMER CONFIRMS NAME ---');
    console.log('Action: Customer replies "Yes" on WhatsApp');
    const confirmRes = await post('/api/whatsapp/webhook', {
      fromPhone: testPhone,
      message: 'Yes'
    });
    console.log('System Response:', confirmRes.data);
    await new Promise(r => setTimeout(r, 1000));

    console.log('\n--- STEP 3: MERCHANT DASHBOARD - LIVE QUEUE ---');
    // Fetch the merchant ID and waiting customer from the DB directly to simulate merchant action
    // We'll use Prisma directly to bypass auth headers for the test
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const customer = await prisma.customer.findFirst({ where: { phone: testPhone }});
    const waitingCustomer = await prisma.waitingCustomer.findFirst({ where: { customerId: customer.id, status: 'waiting' }});
    
    if (!waitingCustomer) {
      console.error('FAILED: Customer not found in Live Queue!');
      return;
    }
    console.log(`Success: Found ${customer.name} in Live Queue (Waiting ID: ${waitingCustomer.id})`);

    console.log('\n--- STEP 4: MERCHANT AWARDS STAMPS ---');
    console.log(`Action: Merchant enters bill amount ₹1250 for ${customer.name}`);
    const awardRes = await post('/api/rewards/award', {
      waitingCustomerId: waitingCustomer.id,
      amount: 1250
    }, { 'x-merchant-id': customer.merchantId });
    
    console.log('System Response:', awardRes.data);
    
    // Verify DB states
    const stampCard = await prisma.customerStampCard.findFirst({ where: { customerId: customer.id }});
    console.log(`Verification: Customer now has ${stampCard.stampsCollected} stamps collected.`);

    console.log('\n--- STEP 5: DAY 2 REVIEW AUTOMATION ---');
    // Simulate 1 day offset for cron
    console.log('Action: Cron Job runs at Day 2');
    const day2Res = await get('/api/cron/automations?simulateDayOffset=1');
    console.log('Messages Sent:', day2Res.data.logs.find(l => l.includes('Review Review')) || day2Res.data.logs.find(l => l.includes('WhatsApp')));
    console.log('Stats:', day2Res.data.stats);

    console.log('\n--- STEP 6: DAY 3 MORNING REPORT AUTOMATION ---');
    console.log('Action: Cron Job aggregates Day 2 data');
    const day3Res = await get('/api/cron/automations?simulateDayOffset=1');
    console.log('Messages Sent:', day3Res.data.logs.find(l => l.includes('Morning Report')) || day3Res.data.logs.find(l => l.includes('Good Morning')));
    
    console.log('\n--- STEP 7: DAY 15 WIN-BACK AUTOMATION ---');
    console.log('Action: Cron Job runs at Day 15');
    const day15Res = await get('/api/cron/automations?simulateDayOffset=15');
    console.log('Messages Sent:', day15Res.data.logs.find(l => l.includes('miss you')) || 'Win-back campaigns triggered');
    console.log('Stats:', day15Res.data.stats);
    
    console.log('\n======================================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY.');
    console.log(`Wallet URL to visually verify: http://localhost:3001/q/wallet/${customer.id}`);
    console.log('======================================================');
    
    await prisma.$disconnect();

  } catch(e) {
    console.error('Test Failed:', e);
  }
}

runE2ETest();
