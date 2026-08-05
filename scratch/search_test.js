const https = require('https');

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'CustomerPilot/1.0 (contact@customerpilot.in)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function test() {
  const res = await fetchJson('https://nominatim.openstreetmap.org/search?q=Cake+Connection&format=json&addressdetails=1&limit=5');
  console.log('Results:', res.map(r => ({ name: r.name || r.display_name.split(',')[0], address: r.display_name, lat: r.lat, lon: r.lon })));
}

test();
