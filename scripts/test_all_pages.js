const http = require('http');

const pagesToTest = [
  { path: '/', name: 'Landing Page' },
  { path: '/login', name: 'Login Page' },
  { path: '/pricing', name: 'Pricing Page' },
  { path: '/terms', name: 'Terms of Service' },
  { path: '/privacy', name: 'Privacy Policy' },
  { path: '/super-admin', name: 'SuperAdmin Command Center' },
  { path: '/api/pricing/plans', name: 'API: Pricing Plans' },
  { path: '/api/legal/terms', name: 'API: Legal Terms' },
];

function testPage(page) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const req = http.get(`http://localhost:3000${page.path}`, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          name: page.name,
          path: page.path,
          status: res.statusCode,
          durationMs: duration,
          ok: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        name: page.name,
        path: page.path,
        status: 'ERROR',
        error: err.message,
        ok: false
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: page.name,
        path: page.path,
        status: 'TIMEOUT',
        ok: false
      });
    });
  });
}

async function runAllTests() {
  console.log('==================================================');
  console.log('🧪 LOCAL SERVER PAGE HEALTH CHECK');
  console.log('==================================================');
  
  for (const page of pagesToTest) {
    const result = await testPage(page);
    const icon = result.ok ? '✅' : '❌';
    console.log(`${icon} [${result.status}] ${result.name.padEnd(30)} -> ${result.path} (${result.durationMs || '-'}ms)`);
  }
  console.log('==================================================');
}

runAllTests().catch(console.error);
