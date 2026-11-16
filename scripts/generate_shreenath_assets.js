const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const root = process.cwd();
  const destUrl = 'https://chat.whatsapp.com/JkoU8GisR6mJVkZoNEzE60?s=cl&p=i&iam=2';
  const cpBoosterUrl = 'https://www.customerpilot.in/wg/shreenath-rajwadi-silk-palace';
  const outDir = path.join(root, 'public', 'qrcodes');
  const standeeDir = path.join(root, 'public', 'standees');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(standeeDir, { recursive: true });

  const waIconPath = path.join(root, 'public', 'whatsapp_clean_icon.png');
  console.log('WhatsApp icon exists:', fs.existsSync(waIconPath));

  // 1. Clean QR (Without Logo) for Direct WhatsApp Link
  const cleanDirectQrBuffer = await QRCode.toBuffer(destUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 800,
    color: { dark: '#0f172a', light: '#ffffff' }
  });
  const cleanDirectPath = path.join(outDir, 'shreenath_direct_clean_qr.png');
  fs.writeFileSync(cleanDirectPath, cleanDirectQrBuffer);
  console.log('Saved:', cleanDirectPath);

  // 2. Clean QR (Without Logo) for CustomerPilot Lead Booster URL
  const cleanBoosterQrBuffer = await QRCode.toBuffer(cpBoosterUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 800,
    color: { dark: '#0f172a', light: '#ffffff' }
  });
  const cleanBoosterPath = path.join(outDir, 'shreenath_booster_clean_qr.png');
  fs.writeFileSync(cleanBoosterPath, cleanBoosterQrBuffer);
  console.log('Saved:', cleanBoosterPath);

  // 3. QR with WhatsApp Logo for CustomerPilot Booster Link
  const qrSize = 800;
  const badgeSize = Math.round(qrSize * 0.28);
  const logoInnerSize = Math.round(badgeSize * 0.78);

  const resizedWaIcon = await sharp(waIconPath)
    .resize({ width: logoInnerSize, height: logoInnerSize, fit: 'inside' })
    .png()
    .toBuffer();

  const badgeSvg = Buffer.from(
    `<svg width="${badgeSize}" height="${badgeSize}">
      <rect x="0" y="0" width="${badgeSize}" height="${badgeSize}" rx="24" ry="24" fill="#ffffff" stroke="#25D366" stroke-width="4"/>
    </svg>`
  );

  const badgeWithLogo = await sharp(badgeSvg)
    .composite([{ input: resizedWaIcon, gravity: 'center' }])
    .png()
    .toBuffer();

  const boosterWithWaLogo = await sharp(cleanBoosterQrBuffer)
    .composite([{ input: badgeWithLogo, gravity: 'center' }])
    .png()
    .toBuffer();

  const waLogoBoosterPath = path.join(outDir, 'shreenath_booster_whatsapp_logo_qr.png');
  fs.writeFileSync(waLogoBoosterPath, boosterWithWaLogo);
  console.log('Saved:', waLogoBoosterPath);

  // 4. QR with WhatsApp Logo for Direct link
  const directWithWaLogo = await sharp(cleanDirectQrBuffer)
    .composite([{ input: badgeWithLogo, gravity: 'center' }])
    .png()
    .toBuffer();
  const waLogoDirectPath = path.join(outDir, 'shreenath_direct_whatsapp_logo_qr.png');
  fs.writeFileSync(waLogoDirectPath, directWithWaLogo);
  console.log('Saved:', waLogoDirectPath);

  // 5. Generate High-Resolution Acrylic Counter Standee Poster (A4 / A5 Ratio: 1200 x 1800 px)
  console.log('Rendering High-Resolution Standee Artwork...');
  const standeeWidth = 1200;
  const standeeHeight = 1800;

  // We construct an SVG canvas with modern luxury design:
  // Emerald / Teal / Gold accents suitable for Saree & Silk Palace
  // Business Name: SHREENATH RAJWADI SILK PALACE
  // Sub-header: OFFICIAL VIP COMMUNITY
  // Message: Scan n Join Whatsapp Group
  // QR in middle
  // Footer instructions

  const standeeQrSize = 580;
  const standeeQrResized = await sharp(boosterWithWaLogo)
    .resize(standeeQrSize, standeeQrSize)
    .png()
    .toBuffer();

  const standeeSvg = `
    <svg width="${standeeWidth}" height="${standeeHeight}" viewBox="0 0 ${standeeWidth} ${standeeHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="45%" stop-color="#042f2e" />
          <stop offset="100%" stop-color="#021a19" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="50%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#f8fafc" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${standeeWidth}" height="${standeeHeight}" fill="url(#bgGrad)" />

      <!-- Decorative Outer Border -->
      <rect x="36" y="36" width="${standeeWidth - 72}" height="${standeeHeight - 72}" rx="32" ry="32" fill="none" stroke="url(#goldGrad)" stroke-width="4" opacity="0.8" />
      <rect x="48" y="48" width="${standeeWidth - 96}" height="${standeeHeight - 96}" rx="24" ry="24" fill="none" stroke="#25D366" stroke-width="1.5" opacity="0.4" />

      <!-- Top Badge -->
      <g transform="translate(${standeeWidth / 2}, 130)">
        <rect x="-190" y="-24" width="380" height="48" rx="24" ry="24" fill="#042f2e" stroke="url(#goldGrad)" stroke-width="2"/>
        <text text-anchor="middle" y="7" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="800" fill="#fbbf24" letter-spacing="4">OFFICIAL VIP COMMUNITY</text>
      </g>

      <!-- Business Name Header -->
      <text text-anchor="middle" x="${standeeWidth / 2}" y="235" font-family="'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="900" fill="#ffffff" letter-spacing="1.5">SHREENATH RAJWADI</text>
      <text text-anchor="middle" x="${standeeWidth / 2}" y="295" font-family="'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="800" fill="url(#goldGrad)" letter-spacing="2">SILK PALACE</text>
      <text text-anchor="middle" x="${standeeWidth / 2}" y="340" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#94a3b8" letter-spacing="1">Manjalpur, Vadodara</text>

      <!-- Main Central Card for QR -->
      <rect x="${(standeeWidth - 720) / 2}" y="390" width="720" height="920" rx="44" ry="44" fill="url(#cardGrad)" filter="url(#shadow)" />

      <!-- Standee Message Banner on Card -->
      <g transform="translate(${standeeWidth / 2}, 465)">
        <rect x="-270" y="-32" width="540" height="64" rx="32" ry="32" fill="#25D366" />
        <!-- Small WhatsApp Phone Icon hint -->
        <text text-anchor="middle" y="9" font-family="'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#ffffff" letter-spacing="0.8">Scan n Join Whatsapp Group</text>
      </g>

      <!-- Sub-instruction below message -->
      <text text-anchor="middle" x="${standeeWidth / 2}" y="565" font-family="'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="700" fill="#0f172a">Get Exclusive Saree Arrivals &amp; Member Offers</text>
      <text text-anchor="middle" x="${standeeWidth / 2}" y="598" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#64748b">Instant VIP Access • No Spam Guaranteed</text>

      <!-- Inner QR Frame Container -->
      <rect x="${(standeeWidth - 620) / 2}" y="635" width="620" height="620" rx="28" ry="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="3" />

      <!-- Card Bottom Prompt -->
      <text text-anchor="middle" x="${standeeWidth / 2}" y="1285" font-family="'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="700" fill="#25D366" letter-spacing="1.5">OPEN CAMERA &amp; POINT AT QR CODE</text>

      <!-- Bottom Standee Info -->
      <g transform="translate(${standeeWidth / 2}, 1430)">
        <text text-anchor="middle" y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#ffffff">VIP MEMBER PRIVILEGES</text>
        <text text-anchor="middle" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#cbd5e1">✨ First Look at Bridal &amp; Festive Weaves</text>
        <text text-anchor="middle" y="75" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#cbd5e1">🎁 VIP Festival Discounts &amp; Direct WhatsApp Support</text>
      </g>

      <!-- Footer Branding -->
      <text text-anchor="middle" x="${standeeWidth / 2}" y="1710" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#64748b" letter-spacing="1">SHREENATH RAJWADI SILK PALACE • VADODARA</text>
      <text text-anchor="middle" x="${standeeWidth / 2}" y="1740" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#475569">A/23-24, Aakar Complex, Opp. Shree Hari Party Plot, Manjalpur • Ph: 98989 09032</text>
    </svg>
  `;

  const baseStandeeBuffer = await sharp(Buffer.from(standeeSvg)).png().toBuffer();

  // Composite the QR code onto the standee (center inside the card container at y: 655)
  const qrTop = 655;
  const qrLeft = Math.round((standeeWidth - standeeQrSize) / 2);

  const finalStandee = await sharp(baseStandeeBuffer)
    .composite([{ input: standeeQrResized, top: qrTop, left: qrLeft }])
    .png()
    .toBuffer();

  const standeeOutPath = path.join(standeeDir, 'shreenath_rajwadi_whatsapp_standee.png');
  fs.writeFileSync(standeeOutPath, finalStandee);
  console.log('Saved High-Res Standee Artwork:', standeeOutPath);

  // Also create a copy with Clean QR (without logo)
  const cleanStandeeQrResized = await sharp(cleanBoosterQrBuffer)
    .resize(standeeQrSize, standeeQrSize)
    .png()
    .toBuffer();

  const finalCleanStandee = await sharp(baseStandeeBuffer)
    .composite([{ input: cleanStandeeQrResized, top: qrTop, left: qrLeft }])
    .png()
    .toBuffer();

  const cleanStandeeOutPath = path.join(standeeDir, 'shreenath_rajwadi_clean_standee.png');
  fs.writeFileSync(cleanStandeeOutPath, finalCleanStandee);
  console.log('Saved Clean Standee Artwork:', cleanStandeeOutPath);
}

main().catch(console.error);
