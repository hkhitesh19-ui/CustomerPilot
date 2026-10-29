const http = require('http');

const urls = [
  '/',
  '/login',
  '/pricing',
  '/terms',
  '/privacy',
  '/super-admin',
  '/api/pricing/plans',
  '/api/legal/terms'
];

async function checkUrl(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://localhost:3000${path}`, { timeout: 30000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const ms = Date.now() - start;
        console.log(`[HTTP ${res.statusCode}] ${path.padEnd(25)} (${ms}ms) -> ${data.slice(0, 40).replace(/\n/g, ' ')}...`);
        resolve({ path, status: res.statusCode, ms });
      });
    });
    req.on('error', err => {
      console.log(`[ERROR]   ${path.padEnd(25)} -> ${err.message}`);
      resolve({ path, status: 0, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      console.log(`[TIMEOUT] ${path.padEnd(25)}`);
      resolve({ path, status: 408 });
    });
  });
}

async function main() {
  console.log("Checking all routes on http://localhost:3000 ...");
  for (const u of urls) {
    await checkUrl(u);
  }
  console.log("Done checking all routes.");
}

main().catch(console.error);
