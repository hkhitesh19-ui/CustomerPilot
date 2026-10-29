const http = require('http');
const path = require('path');
const { SignJWT } = require('jose');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

function get(urlPath, headers = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://localhost:3000${urlPath}`, { headers, timeout: 60000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ path: urlPath, status: res.statusCode, ms: Date.now() - start, length: data.length });
      });
    });
    req.on('error', err => resolve({ path: urlPath, status: 'ERROR', error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ path: urlPath, status: 'TIMEOUT' }); });
  });
}

async function verifyEverything() {
  console.log('========================================================================');
  console.log('🚀 FULL SYSTEM AUTOMATED LOCAL HEALTH & ROUTE SCORECARD');
  console.log('========================================================================');

  const merchant = await prisma.merchant.findFirst();
  const superAdmin = await prisma.user.findFirst({ where: { role: 'super_admin' } });

  const secret = new TextEncoder().encode(JWT_SECRET);
  const merchantToken = await new SignJWT({
    userId: merchant?.userId || "test_user",
    merchantId: merchant?.id || "cmsjw7n7i0001w0c0r6i3juhy",
    role: "merchant",
    email: merchant?.email || "merchant@test.com"
  }).setProtectedHeader({ alg: "HS256" }).sign(secret);

  const saToken = await new SignJWT({
    userId: superAdmin?.id || "sa_user",
    merchantId: "admin_merchant",
    role: "super_admin",
    email: superAdmin?.email || "admin@customerpilot.in"
  }).setProtectedHeader({ alg: "HS256" }).sign(secret);

  const mHeaders = { 'Cookie': `token=${merchantToken}` };
  const saHeaders = { 'Cookie': `token=${saToken}` };

  const tests = [
    // Public Pages
    { category: '🌐 PUBLIC PAGES', path: '/', name: 'Landing & Onboarding Page', headers: {} },
    { category: '🌐 PUBLIC PAGES', path: '/login', name: 'Merchant Login Page', headers: {} },
    { category: '🌐 PUBLIC PAGES', path: '/pricing', name: 'Public Pricing Matrix', headers: {} },
    { category: '🌐 PUBLIC PAGES', path: '/terms', name: 'Terms of Service', headers: {} },
    { category: '🌐 PUBLIC PAGES', path: '/privacy', name: 'Privacy Policy', headers: {} },
    
    // Merchant Dashboard
    { category: '📊 DASHBOARD MODULES', path: '/dashboard', name: 'Main Analytics Dashboard', headers: mHeaders },
    { category: '📊 DASHBOARD MODULES', path: '/dashboard/customers', name: 'Customers CRM & Segments', headers: mHeaders },
    { category: '📊 DASHBOARD MODULES', path: '/dashboard/rewards', name: 'Rewards Center & Stamp Card', headers: mHeaders },
    { category: '📊 DASHBOARD MODULES', path: '/dashboard/reviews', name: 'Google Business Reviews', headers: mHeaders },
    { category: '📊 DASHBOARD MODULES', path: '/dashboard/queue', name: 'Live Counter Queue', headers: mHeaders },
    { category: '📊 DASHBOARD MODULES', path: '/dashboard/health', name: 'System Health & Engine Logs', headers: mHeaders },
    { category: '📊 DASHBOARD MODULES', path: '/dashboard/subscription', name: 'Billing & Plan Upgrade', headers: mHeaders },
    { category: '📊 DASHBOARD MODULES', path: '/dashboard/settings', name: 'Merchant Configuration', headers: mHeaders },

    // SuperAdmin
    { category: '⚡ SUPERADMIN', path: '/super-admin', name: 'SuperAdmin Command Center', headers: saHeaders },

    // APIs
    { category: '🔌 CORE APIs', path: '/api/state', name: 'Live State API', headers: mHeaders },
    { category: '🔌 CORE APIs', path: '/api/pricing/plans', name: 'Plans & Pricing API', headers: {} },
    { category: '🔌 CORE APIs', path: '/api/legal/terms', name: 'Legal Terms Content API', headers: {} },
  ];

  let currentCat = '';
  for (const t of tests) {
    if (t.category !== currentCat) {
      currentCat = t.category;
      console.log(`\n--- ${currentCat} ---`);
    }
    const res = await get(t.path, t.headers);
    const ok = res.status === 200;
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} [${res.status}] ${t.name.padEnd(30)} -> ${t.path.padEnd(25)} (${res.ms}ms, ${res.length} bytes)`);
  }

  console.log('\n========================================================================');
  await prisma.$disconnect();
}

verifyEverything().catch(console.error);
