const http = require('http');

async function testSignup(name, email, phone, moduleVal) {
  const payload = JSON.stringify({
    businessName: name,
    ownerName: name,
    email: email,
    password: "Password@123",
    whatsappPhone: phone,
    businessType: "retail",
    module: moduleVal
  });

  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  const ts = Date.now().toString().slice(-4);
  console.log(`Running signup tests with timestamp ${ts}...`);

  // Test 1: Only Reviews
  console.log('\n--- TEST 1: module="reviews" ---');
  const res1 = await testSignup(`Test Store Reviews ${ts}`, `test_rev_${ts}@gmail.com`, `91981111${ts}`, 'reviews');
  console.log('Status:', res1.status, 'Body:', res1.body);

  // Test 2: Only Digital Card
  console.log('\n--- TEST 2: module="card" ---');
  const res2 = await testSignup(`Test Store Card ${ts}`, `test_card_${ts}@gmail.com`, `91982222${ts}`, 'card');
  console.log('Status:', res2.status, 'Body:', res2.body);

  // Test 3: Combo Card + Reviews
  console.log('\n--- TEST 3: module="card,reviews" ---');
  const res3 = await testSignup(`Test Store Combo ${ts}`, `test_combo_${ts}@gmail.com`, `91983333${ts}`, 'card,reviews');
  console.log('Status:', res3.status, 'Body:', res3.body);

  // Test 4: Complete suite (no module)
  console.log('\n--- TEST 4: module="" (Complete Suite) ---');
  const res4 = await testSignup(`Test Store Complete ${ts}`, `test_all_${ts}@gmail.com`, `91984444${ts}`, '');
  console.log('Status:', res4.status, 'Body:', res4.body);
})();
