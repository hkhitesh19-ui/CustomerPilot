const http = require('http');

async function testAutomations() {
  const get = (path) => new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });

  try {
    console.log('--- TESTING DAY 2 (Review Requests) & DAY 3 (Morning Report) ---');
    // If a bill was just created today during our testing, simulating 1 day offset 
    // means it pretends today is actually tomorrow, so today's bills look like 1 day ago!
    const day2Res = await get('/api/cron/automations?simulateDayOffset=1');
    console.log(day2Res.data.logs.join('\n'));
    console.log('Stats:', day2Res.data.stats);

    console.log('\n--- TESTING DAY 15 (Win-Back Campaign) ---');
    // Simulating 15 days offset pretends today is 15 days in the future.
    const day15Res = await get('/api/cron/automations?simulateDayOffset=15');
    console.log(day15Res.data.logs.join('\n'));
    console.log('Stats:', day15Res.data.stats);

  } catch(e) {
    console.error('Error:', e);
  }
}

testAutomations();
