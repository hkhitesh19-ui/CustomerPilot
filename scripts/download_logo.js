const https = require('https');
const fs = require('fs');

const url = 'https://gujaratphotogoods.in/wp-content/uploads/2026/09/logo.png';
const dest = 'public/uploads/gujarat-photo-goods-real-logo.png';

console.log('Downloading from:', url);
const file = fs.createWriteStream(dest);

const agent = new https.Agent({
  rejectUnauthorized: false
});

https.get(url, { agent }, (response) => {
  console.log('Status code:', response.statusCode);
  if (response.statusCode === 200) {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      const stats = fs.statSync(dest);
      console.log('Downloaded successfully! File size:', stats.size, 'bytes');
    });
  } else {
    console.error('Failed with status code:', response.statusCode);
  }
}).on('error', (err) => {
  console.error('Error downloading:', err.message);
});
