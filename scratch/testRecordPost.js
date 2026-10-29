const http = require('http');

async function testRecordPost() {
  const data = JSON.stringify({
    customerId: 'cmsq9kmdo0015w0a0sclicacm',
    merchantId: 'cmsjw7n7i0001w0c0r6i3juhy',
    reviewText: 'Ordered from Cake Connection in Vadodara and really loved the quality! Fresh and delicious.',
    rating: 5
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/reviews/record-google-post',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Response Body: ${body}`);
    });
  });

  req.on('error', (err) => console.error('Error:', err.message));
  req.write(data);
  req.end();
}

testRecordPost();
