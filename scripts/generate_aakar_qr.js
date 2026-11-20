const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const targetUrl = 'https://customerpilot.in/c/aakargraphics';
  const outDir = path.join(process.cwd(), 'public', 'qr-codes');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const rawQrPath = path.join(outDir, 'raw_aakar_qr.png');
  const finalQrPath = path.join(outDir, 'aakar_graphics_digital_card_qr.png');
  const svgQrPath = path.join(outDir, 'aakar_graphics_digital_card_qr.svg');

  console.log(`Generating QR for URL: ${targetUrl}`);

  // 1. Generate high-res base QR (1024x1024) with High Error Correction (Level H) so center logo doesn't disrupt scanning
  await QRCode.toFile(rawQrPath, targetUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    quality: 1.0,
    margin: 2,
    color: {
      dark: '#0284c7', // Brand sapphire / cyan blue from AG logo
      light: '#ffffff'
    },
    width: 1024
  });
  console.log('Base QR generated at:', rawQrPath);

  // 2. Generate SVG vector QR
  const svgContent = await QRCode.toString(targetUrl, {
    errorCorrectionLevel: 'H',
    type: 'svg',
    margin: 2,
    color: {
      dark: '#0284c7',
      light: '#ffffff'
    }
  });
  fs.writeFileSync(svgQrPath, svgContent);
  console.log('SVG QR generated at:', svgQrPath);

  // 3. Composite AG Logo in center using sharp
  const logoPath = path.join(process.cwd(), 'public', 'uploads', 'aakar_graphics_logo.jpg');
  
  if (fs.existsSync(logoPath)) {
    // Logo size: ~22% of QR code width (225x225)
    // Add white circular/rounded background pad with subtle border
    const logoSize = 220;
    const padSize = 250;
    
    // Create white rounded rect badge background
    const badgeSvg = `
      <svg width="${padSize}" height="${padSize}" viewBox="0 0 ${padSize} ${padSize}">
        <rect x="0" y="0" width="${padSize}" height="${padSize}" rx="40" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
      </svg>
    `;

    const resizedLogo = await sharp(logoPath)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    const badgeBuffer = await sharp(Buffer.from(badgeSvg))
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toBuffer();

    // Composite badge onto center of QR
    await sharp(rawQrPath)
      .composite([{ input: badgeBuffer, gravity: 'center' }])
      .png()
      .toFile(finalQrPath);

    console.log('Final QR with center logo badge created at:', finalQrPath);
  } else {
    fs.copyFileSync(rawQrPath, finalQrPath);
    console.log('No logo found, copied raw QR to final.');
  }

  // Also clean up temp raw file
  if (fs.existsSync(rawQrPath)) {
    fs.unlinkSync(rawQrPath);
  }
}

generate().catch(console.error);
