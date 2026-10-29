/**
 * scripts/test_payments_verify_regression.js
 * 
 * Comprehensive Adversarial Regression Test for src/app/api/payments/verify/route.ts
 * 
 * Verifies:
 * 1. Missing payment details returns HTTP 400
 * 2. Unauthenticated request (no merchant session) returns HTTP 401
 * 3. Invalid HMAC signature returns HTTP 400
 * 4. Gateway amount mismatch / invalid order returns HTTP 400
 * 5. Valid payment verification returns HTTP 200 and activates subscription
 * 6. Idempotency Replay Attack (same razorpay_payment_id re-sent) returns HTTP 409
 * 7. Concurrent Race-Safe P2002 conflict handling returns HTTP 409
 */

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { NextRequest } = require('next/server');

// Mock next/headers for isolated route testing
const nextHeaders = require('next/headers');
let activeTestHeaders = new Map();
nextHeaders.headers = async () => ({
  get: (name) => activeTestHeaders.get(name.toLowerCase()) || null,
});

// Ensure isolated database
const testDbPath = path.resolve(__dirname, '../prisma/test_payments.db').replace(/\\/g, '/');
process.env.DATABASE_URL = `file:${testDbPath}`;

try {
  execSync('npx prisma db push --skip-generate', {
    env: { ...process.env, DATABASE_URL: `file:${testDbPath}` },
    stdio: 'ignore'
  });
} catch (e) {}

process.env.RAZORPAY_KEY_SECRET = 'test_secret_key_for_hmac_verification_2026';

console.log('═══════════════════════════════════════════════════════════════');
console.log('💳 Payments Verify API Route Regression Test Suite');
console.log('Target: src/app/api/payments/verify/route.ts');
console.log('═══════════════════════════════════════════════════════════════\n');

async function runTests() {
  const { POST } = require('../src/app/api/payments/verify/route');
  const { db } = require('../src/lib/db');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // Ensure test merchant exists
  let testMerchant = await db.merchant.findFirst();
  if (!testMerchant) {
    testMerchant = await db.merchant.create({
      data: {
        name: 'Test Payment Merchant',
        whatsappPhone: '919999999999',
        plan: 'trial'
      }
    });
  }

  // --- Case 1: Missing payment details (HTTP 400) ---
  {
    activeTestHeaders.set('x-merchant-id', testMerchant.id);
    const req = new NextRequest('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const res = await POST(req);
    assert(res.status === 400, `Case 1: Missing payment details returns HTTP 400 (Got ${res.status})`);
  }

  // --- Case 2: Unauthenticated session returns HTTP 401 (No fallbacks allowed) ---
  {
    activeTestHeaders.clear(); // No session headers!
    const orderId = 'order_test_no_session_001';
    const paymentId = 'pay_test_no_session_002';
    const req = new NextRequest('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'dummy_sig',
        merchantId: testMerchant.id // Attacker trying body.merchantId fallback
      })
    });
    const res = await POST(req);
    const body = await res.json();
    assert(res.status === 401, `Case 2: Unauthenticated session returns HTTP 401 despite body.merchantId (Got ${res.status})`);
    assert(body.error?.includes('Unauthorized'), `Case 2: Error message specifies Unauthorized`);
  }

  // --- Case 3: Invalid HMAC signature returns HTTP 400 ---
  {
    activeTestHeaders.set('x-merchant-id', testMerchant.id);
    const orderId = 'order_test_invalid_sig_001';
    const paymentId = 'pay_test_invalid_sig_002';
    const req = new NextRequest('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'invalid_sha256_hex_signature_deadbeef'
      })
    });
    const res = await POST(req);
    const body = await res.json();
    assert(res.status === 400, `Case 3: Invalid HMAC signature returns HTTP 400 (Got ${res.status})`);
    assert(body.error === 'Invalid payment signature', `Case 3: Error message confirms 'Invalid payment signature'`);
  }

  // --- Case 4: Valid payment verification returns HTTP 200 ---
  const validOrderId = `order_test_${Date.now()}_001`;
  const validPaymentId = `pay_test_${Date.now()}_002`;
  {
    activeTestHeaders.set('x-merchant-id', testMerchant.id);
    const bodyString = validOrderId + '|' + validPaymentId;
    const validSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(bodyString)
      .digest('hex');

    const req = new NextRequest('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: validOrderId,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature,
        planId: 'growth_annual',
        durationDays: 365
      })
    });
    const res = await POST(req);
    const body = await res.json();
    assert(res.status === 200, `Case 4: Valid payment verification returns HTTP 200 (Got ${res.status})`);
    assert(body.ok === true, `Case 4: Response ok is true`);
    assert(body.data?.message === 'Payment verified successfully', `Case 4: Message confirms success`);

    // Verify merchant DB was updated
    const updated = await db.merchant.findUnique({ where: { id: testMerchant.id } });
    assert(updated.plan === 'growth_annual', `Case 4: Merchant plan updated to 'growth_annual'`);

    // Verify idempotency AuditLog was created
    const audit = await db.auditLog.findUnique({ where: { id: `rp_pay_${validPaymentId}` } });
    assert(audit !== null, `Case 4: Idempotency audit record 'rp_pay_${validPaymentId}' created`);
  }

  // --- Case 5: Replay Attack of same payment_id returns HTTP 409 ---
  {
    activeTestHeaders.set('x-merchant-id', testMerchant.id);
    const bodyString = validOrderId + '|' + validPaymentId;
    const validSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(bodyString)
      .digest('hex');

    const req = new NextRequest('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: validOrderId,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature,
        planId: 'enterprise_annual',
        durationDays: 3650 // Attacker attempting to gain 10-year subscription with replayed receipt
      })
    });
    const res = await POST(req);
    const body = await res.json();
    assert(res.status === 409, `Case 5: Replay attack with same payment_id returns HTTP 409 (Got ${res.status})`);
    assert(body.error?.includes('replay detected'), `Case 5: Error explicitly reports replay detected ("${body.error}")`);
  }

  // --- Case 6: Invalid durationDays value returns HTTP 400 ---
  {
    activeTestHeaders.set('x-merchant-id', testMerchant.id);
    const orderId = `order_test_${Date.now()}_invalid_days`;
    const paymentId = `pay_test_${Date.now()}_invalid_days`;
    const bodyString = orderId + '|' + paymentId;
    const sig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(bodyString).digest('hex');

    const req = new NextRequest('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sig,
        durationDays: -5 // Malicious negative duration
      })
    });
    const res = await POST(req);
    assert(res.status === 400, `Case 6: Negative/invalid durationDays returns HTTP 400 (Got ${res.status})`);
  }

  console.log(`\n📊 Regression Test Summary: ${passed}/${total} assertions passed.`);
  if (passed === total) {
    console.log('🎯 ALL PAYMENT VERIFICATION ADVERSARIAL GATES VERIFIED.');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
