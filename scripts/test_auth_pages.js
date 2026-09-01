require('dotenv').config();
const { SignJWT } = require('jose');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_nextauth_secret_32_chars_long!!";

async function makeToken(merchantId, role) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return await new SignJWT({
    userId: "test_user_id",
    merchantId: merchantId,
    role: role || "merchant",
    email: "test@example.com"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

function fetchWithCookie(path, token) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://localhost:3000${path}`, {
      headers: {
        'Cookie': `token=${token}`
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const ms = Date.now() - start;
        resolve({ path, status: res.statusCode, ms, dataLength: data.length });
      });
    });

    req.on('error', err => {
      resolve({ path, status: 'ERROR', error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ path, status: 'TIMEOUT' });
    });
  });
}

async function testAllAuthenticated() {
  console.log('==================================================');
  console.log('🔐 TESTING AUTHENTICATED DASHBOARD & ADMIN ROUTES');
  console.log('==================================================');

  const merchant = await prisma.merchant.findFirst();
  if (!merchant) {
    console.log('No merchant found in DB');
    return;
  }

  const merchantToken = await makeToken(merchant.id, "merchant");
  const superAdminToken = await makeToken("admin_merchant", "super_admin");

  const routes = [
    { path: '/dashboard', token: merchantToken, name: 'Merchant Dashboard' },
    { path: '/dashboard/customers', token: merchantToken, name: 'Customers Module' },
    { path: '/dashboard/super-analytics', token: merchantToken, name: 'SuperAnalytics CRM' },
    { path: '/dashboard/rewards', token: merchantToken, name: 'Rewards / Stamp Card' },
    { path: '/dashboard/subscription', token: merchantToken, name: 'Subscription Plan' },
    { path: '/dashboard/settings', token: merchantToken, name: 'Merchant Settings' },
    { path: '/super-admin', token: superAdminToken, name: 'SuperAdmin Center' },
    { path: '/api/state', token: merchantToken, name: 'API: Live Merchant State' },
  ];

  for (const r of routes) {
    const res = await fetchWithCookie(r.path, r.token);
    const icon = res.status === 200 ? '✅' : '⚠️';
    console.log(`${icon} [${res.status}] ${r.name.padEnd(25)} -> ${r.path} (${res.ms}ms, ${res.dataLength} bytes)`);
  }

  console.log('==================================================');
  await prisma.$disconnect();
}

testAllAuthenticated().catch(console.error);
