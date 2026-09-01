const http = require('http');

function postJson(path, payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const req = http.request(`http://localhost:3000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      const setCookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), cookies: setCookies });
        } catch {
          resolve({ status: res.statusCode, body, cookies: setCookies });
        }
      });
    });
    req.on('error', err => resolve({ status: 'ERROR', error: err.message }));
    req.write(data);
    req.end();
  });
}

function getWithCookie(path, cookie) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://localhost:3000${path}`, {
      headers: { 'Cookie': cookie },
      timeout: 30000
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        const ms = Date.now() - start;
        resolve({ path, status: res.statusCode, ms, bodyLength: body.length });
      });
    });
    req.on('error', err => resolve({ path, status: 'ERROR', error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ path, status: 'TIMEOUT' });
    });
  });
}

async function run() {
  console.log("1. Attempting login for Merchant (test user)...");
  // Check users in DB to find a test account
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({ where: { role: 'merchant' } });
  const superAdmin = await prisma.user.findFirst({ where: { role: 'super_admin' } });
  
  console.log("Merchant user found:", user?.email);
  console.log("SuperAdmin user found:", superAdmin?.email);

  // If password is known or we test direct dashboard compilation
  console.log("\n2. Testing Dashboard & Sub-modules with real cookies...");
  const { SignJWT } = require('jose');
  const path = require('path');
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
  const JWT_SECRET = process.env.JWT_SECRET;
  console.log("Using JWT_SECRET loaded from environment:", JWT_SECRET ? "LOADED (length " + JWT_SECRET.length + ")" : "MISSING");

  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({
    userId: user?.id || "mock_user",
    merchantId: (await prisma.merchant.findFirst())?.id || "mock_merchant",
    role: "merchant",
    email: user?.email || "merchant@test.com"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const cookieHeader = `token=${token}`;

  const pages = [
    { path: '/dashboard', name: 'Dashboard Home' },
    { path: '/dashboard/customers', name: 'Customers CRM' },
    { path: '/dashboard/rewards', name: 'Rewards / Cards' },
    { path: '/dashboard/reviews', name: 'Google Reviews' },
    { path: '/dashboard/queue', name: 'Live Queue' },
    { path: '/dashboard/health', name: 'Health Status' },
    { path: '/dashboard/subscription', name: 'Subscription Plan' },
    { path: '/dashboard/settings', name: 'Settings' },
  ];

  for (const p of pages) {
    const res = await getWithCookie(p.path, cookieHeader);
    const icon = res.status === 200 ? '✅' : (res.status === 307 ? '↪️ (Redirect)' : '❌');
    console.log(`${icon} [HTTP ${res.status}] ${p.name.padEnd(25)} -> ${p.path} (${res.ms}ms, ${res.bodyLength} bytes)`);
  }

  console.log("\n3. Testing SuperAdmin Command Center with super_admin cookie...");
  const superAdminSecret = new TextEncoder().encode(JWT_SECRET);
  const saToken = await new SignJWT({
    userId: superAdmin?.id || "mock_sa",
    merchantId: "admin_merchant",
    role: "super_admin",
    email: superAdmin?.email || "admin@customerpilot.in"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(superAdminSecret);

  const saRes = await getWithCookie('/super-admin', `token=${saToken}`);
  const saIcon = saRes.status === 200 ? '✅' : '❌';
  console.log(`${saIcon} [HTTP ${saRes.status}] SuperAdmin Center      -> /super-admin (${saRes.ms}ms, ${saRes.bodyLength} bytes)`);

  await prisma.$disconnect();
}

run().catch(console.error);
