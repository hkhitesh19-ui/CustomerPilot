const fs = require('fs');

const pngBuffer = fs.readFileSync('public/uploads/gujarat-photo-goods-real-logo.png');
const base64Png = pngBuffer.toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 317" width="100%" height="100%">
  <image href="data:image/png;base64,${base64Png}" width="800" height="317" preserveAspectRatio="xMidYMid meet" />
</svg>`;

fs.writeFileSync('public/uploads/gujarat-photo-goods-logo.svg', svgContent, 'utf-8');
console.log('Embedded real logo into SVG! File size:', fs.statSync('public/uploads/gujarat-photo-goods-logo.svg').size);
