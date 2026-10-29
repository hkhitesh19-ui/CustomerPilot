const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildSeamlessBase() {
  const templatePath = path.join(process.cwd(), 'public/standees/standee_master_template.jpg');
  const width = 723;
  const height = 1024;

  // 1. Luxury Background Canvas with exact warm ivory tones matching original template
  const canvasSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="luxIvory" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#faf5ec"/>
          <stop offset="80%" stop-color="#f2e8d7"/>
          <stop offset="100%" stop-color="#e9ddc3"/>
        </radialGradient>
        <linearGradient id="goldBorder" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d4af37"/>
          <stop offset="50%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#b8860b"/>
        </linearGradient>
      </defs>
      <!-- Deep navy outer border -->
      <rect width="${width}" height="${height}" fill="#081829"/>
      <!-- Gold trimmed ivory canvas -->
      <rect x="7" y="7" width="${width - 14}" height="${height - 14}" rx="14" fill="url(#luxIvory)" stroke="url(#goldBorder)" stroke-width="3"/>
      <rect x="13" y="13" width="${width - 26}" height="${height - 26}" rx="10" fill="none" stroke="#d4af37" stroke-width="1" stroke-opacity="0.35"/>
      
      <!-- Top Arch Frame -->
      <path d="M 12 12 L ${width - 12} 12 L ${width - 12} 132 C ${width - 12} 132, ${width * 0.75} 118, ${width * 0.5} 118 C ${width * 0.25} 118, 12 132, 12 132 Z" fill="#071829" stroke="#d4af37" stroke-width="2"/>

      <!-- Bottom Arch Frame -->
      <path d="M 12 ${height - 142} C 12 ${height - 142}, ${width * 0.25} ${height - 158}, ${width * 0.5} ${height - 158} C ${width * 0.75} ${height - 158}, ${width - 12} ${height - 142}, ${width - 12} ${height - 142} L ${width - 12} ${height - 12} L 12 ${height - 12} Z" fill="#071829" stroke="#d4af37" stroke-width="2"/>
    </svg>
  `);
  const canvasBuf = await sharp(canvasSvg).png().toBuffer();

  // 2. Corner Greenery Leaves
  const leftLeaves = await sharp(templatePath)
    .extract({ left: 6, top: 155, width: 55, height: 260 })
    .toBuffer();
  const rightLeaves = await sharp(templatePath)
    .extract({ left: 662, top: 155, width: 55, height: 260 })
    .toBuffer();

  // 3. Combined Headline + Ribbon + Confetti block with feathered alpha mask
  const rawHlCrop = await sharp(templatePath)
    .extract({ left: 32, top: 150, width: 660, height: 220 })
    .toBuffer();
  const hlCropMeta = await sharp(rawHlCrop).metadata();

  const hlMaskSvg = Buffer.from(
    `<svg width="${hlCropMeta.width}" height="${hlCropMeta.height}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs><filter id="b"><feGaussianBlur stdDeviation="12"/></filter></defs>` +
    `<rect width="${hlCropMeta.width}" height="${hlCropMeta.height}" fill="black"/>` +
    `<rect x="25" y="15" width="${hlCropMeta.width - 50}" height="${hlCropMeta.height - 30}" rx="20" fill="white" filter="url(#b)"/>` +
    `</svg>`
  );
  const hlMaskBuf = await sharp(hlMaskSvg).resize(hlCropMeta.width, hlCropMeta.height).png().toBuffer();
  const featheredHlRaw = await sharp(rawHlCrop)
    .ensureAlpha()
    .composite([{ input: hlMaskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const featheredHeadline = await sharp(featheredHlRaw)
    .resize({ width: 520, height: 168, fit: 'inside' })
    .png()
    .toBuffer();
  const hlMeta = await sharp(featheredHeadline).metadata();

  // 4. Left Column: "Scan Here" + Gold Arrow + White Gift Box as ONE SINGLE CONTINUOUS PIECE
  const rawLeftCol = await sharp(templatePath)
    .extract({ left: 0, top: 340, width: 195, height: 340 })
    .toBuffer();
  const leftColMeta = await sharp(rawLeftCol).metadata();
  const leftMaskSvg = Buffer.from(
    `<svg width="${leftColMeta.width}" height="${leftColMeta.height}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs><filter id="b"><feGaussianBlur stdDeviation="8"/></filter></defs>` +
    `<rect width="${leftColMeta.width}" height="${leftColMeta.height}" fill="black"/>` +
    `<rect x="0" y="8" width="${leftColMeta.width - 15}" height="${leftColMeta.height - 16}" fill="white" filter="url(#b)"/>` +
    `</svg>`
  );
  const leftMaskBuf = await sharp(leftMaskSvg).resize(leftColMeta.width, leftColMeta.height).png().toBuffer();
  const maskedLeftRaw = await sharp(rawLeftCol)
    .ensureAlpha()
    .composite([{ input: leftMaskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const leftCol = await sharp(maskedLeftRaw)
    .resize({ width: 154, height: 340, fit: 'fill' })
    .png()
    .toBuffer();

  // 5. Right Column: "Join Now & Get Rewards" + Red Gift Box + Gold Coin as ONE SINGLE CONTINUOUS PIECE
  const rawRightCol = await sharp(templatePath)
    .extract({ left: 532, top: 340, width: 191, height: 340 })
    .toBuffer();
  const rightColMeta = await sharp(rawRightCol).metadata();
  const rightMaskSvg = Buffer.from(
    `<svg width="${rightColMeta.width}" height="${rightColMeta.height}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs><filter id="b"><feGaussianBlur stdDeviation="8"/></filter></defs>` +
    `<rect width="${rightColMeta.width}" height="${rightColMeta.height}" fill="black"/>` +
    `<rect x="15" y="8" width="${rightColMeta.width - 15}" height="${rightColMeta.height - 16}" fill="white" filter="url(#b)"/>` +
    `</svg>`
  );
  const rightMaskBuf = await sharp(rightMaskSvg).resize(rightColMeta.width, rightColMeta.height).png().toBuffer();
  const maskedRightRaw = await sharp(rawRightCol)
    .ensureAlpha()
    .composite([{ input: rightMaskBuf, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const rightCol = await sharp(maskedRightRaw)
    .resize({ width: 154, height: 340, fit: 'fill' })
    .png()
    .toBuffer();

  // 6. Marble Pedestal Base
  const pedestal = await sharp(templatePath)
    .extract({ left: 160, top: 645, width: 400, height: 40 })
    .resize({ width: 430, height: 40, fit: 'fill' })
    .toBuffer();

  // 7. 3 Benefits Card
  const benefits = await sharp(templatePath)
    .extract({ left: 35, top: 675, width: 653, height: 170 })
    .resize({ width: 630, height: 136, fit: 'inside' })
    .toBuffer();
  const bfMeta = await sharp(benefits).metadata();

  // 8. VIP Member Footer Bar
  const footer = await sharp(templatePath)
    .extract({ left: 16, top: 850, width: 690, height: 130 })
    .resize({ width: 650, height: 115, fit: 'inside' })
    .toBuffer();
  const ftMeta = await sharp(footer).metadata();

  const layers = [
    // Leaves on borders
    { input: leftLeaves, left: 10, top: 155 },
    { input: rightLeaves, left: width - 65, top: 155 },

    // Headline + Ribbon (y: 116)
    { input: featheredHeadline, left: Math.round((width - (hlMeta.width || 520)) / 2), top: 116 },

    // Left Column (y: 338)
    { input: leftCol, left: 8, top: 338 },

    // Right Column (y: 338)
    { input: rightCol, left: width - 154 - 8, top: 338 },

    // Pedestal (y: 696)
    { input: pedestal, left: Math.round((width - 430) / 2), top: 696 },

    // Benefits (y: 722)
    { input: benefits, left: Math.round((width - (bfMeta.width || 630)) / 2), top: 722 },

    // Footer (y: 860)
    { input: footer, left: Math.round((width - (ftMeta.width || 650)) / 2), top: 860 },
  ];

  const compositeBase = await sharp(canvasBuf)
    .composite(layers)
    .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const outPath = path.join(process.cwd(), 'public/standees/standee_universal_base.jpg');
  fs.writeFileSync(outPath, compositeBase);
  console.log(`🎉 Masterpiece base written to: ${outPath} (${compositeBase.length} bytes)`);
}

buildSeamlessBase().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
