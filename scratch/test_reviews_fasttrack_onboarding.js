const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient();

function postRequest(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('==================================================');
  console.log('🧪 TESTING STANDALONE REVIEW MODULE FAST-TRACK FLOW');
  console.log('==================================================');

  const testEmail = `test_reviews_fasttrack_${Date.now()}@customerpilot.in`;
  const payload = {
    businessName: "Test Reviews FastTrack Cafe",
    ownerName: "FastTrack Owner",
    email: testEmail,
    password: "password123456",
    module: "reviews"
  };

  console.log(`1. Sending registration POST to /api/auth/register for:\n   Email: ${testEmail}`);
  const registerRes = await postRequest('/api/auth/register', payload);

  console.log(`   Response Status: ${registerRes.status}`);
  console.log(`   Response Body:`, JSON.stringify(registerRes.body, null, 2));

  if (registerRes.status !== 200 || !registerRes.body.success) {
    throw new Error('❌ Registration API request failed!');
  }

  const { merchantId, redirectTo } = registerRes.body;
  if (redirectTo !== '/dashboard/reviews') {
    throw new Error(`❌ Incorrect redirect route! Expected /dashboard/reviews, got: ${redirectTo}`);
  }
  console.log(`✅ Redirect route is correct: ${redirectTo}`);

  console.log('\n2. Querying database for created Merchant...');
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId }
  });

  if (!merchant) {
    throw new Error(`❌ Merchant record not found in database for ID: ${merchantId}`);
  }

  console.log(`   Merchant Name:        ${merchant.name}`);
  console.log(`   Merchant ID Number:   ${merchant.merchantIdNumber}`);
  console.log(`   Enabled Modules:      ${merchant.enabledModules}`);
  console.log(`   Onboarding Completed: ${merchant.onboardingCompleted}`);
  console.log(`   Current Step:         ${merchant.currentStep}`);

  if (!merchant.merchantIdNumber || !/^CP-\d{6}$/.test(merchant.merchantIdNumber)) {
    throw new Error(`❌ Merchant ID number format is incorrect! Got: ${merchant.merchantIdNumber}`);
  }
  console.log('✅ Unique merchant ID number was successfully created in correct format CP-XXXXXX.');

  if (merchant.enabledModules !== 'REVIEWS') {
    throw new Error(`❌ Enabled modules is incorrect! Expected REVIEWS, got: ${merchant.enabledModules}`);
  }
  if (!merchant.onboardingCompleted) {
    throw new Error(`❌ OnboardingCompleted should be true!`);
  }
  if (merchant.currentStep !== 99) {
    throw new Error(`❌ CurrentStep should be 99!`);
  }
  console.log('✅ Merchant database state is correctly pre-configured for reviews-only standalone.');

  console.log('\n3. Verifying that no StampCard has been created for this merchant...');
  const stampCard = await prisma.stampCard.findFirst({
    where: { merchantId: merchant.id }
  });
  if (stampCard) {
    throw new Error(`❌ Found StampCard under ID: ${stampCard.id}. Reviews-only merchants should not have a StampCard!`);
  }
  console.log('✅ Confirmed no StampCard exists for reviews-only merchant.');

  console.log('\n4. Verifying all onboarding steps are marked completed...');
  const steps = await prisma.onboardingStep.findMany({
    where: { merchantId: merchant.id }
  });
  console.log(`   Total steps found: ${steps.length}`);
  const uncompleted = steps.filter(s => !s.completed);
  if (uncompleted.length > 0) {
    throw new Error(`❌ Found ${uncompleted.length} uncompleted steps: ${uncompleted.map(s => s.stepKey).join(', ')}`);
  }
  console.log('✅ Confirmed all onboarding checklist steps are pre-marked completed: true.');

  console.log('\n5. Cleaning up test data from database...');
  await prisma.onboardingStep.deleteMany({ where: { merchantId: merchant.id } });
  await prisma.merchant.delete({ where: { id: merchant.id } });
  await prisma.user.delete({ where: { email: testEmail } });
  console.log('✅ Cleanup successful.');

  console.log('\n==================================================');
  console.log('🎉 ALL FAST-TRACK REVIEWS TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');
}

runTest()
  .catch(err => {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
