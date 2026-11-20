const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createStandee() {
  const qrPngPath = path.join(process.cwd(), 'public', 'qr-codes', 'aakar_graphics_digital_card_qr.png');
  const logoPath = path.join(process.cwd(), 'public', 'uploads', 'aakar_graphics_logo.jpg');
  const outPath = path.join(process.cwd(), 'public', 'qr-codes', 'aakar_graphics_counter_standee.png');

  console.log("Generating Premium Aakar Graphics Standee...");

  // Dimensions: 1000 x 1500 (A4/Standee aspect ratio 2:3)
  const W = 1000;
  const H = 1500;

  // Read QR buffer
  const qrBuffer = await sharp(qrPngPath)
    .resize(480, 480)
    .toBuffer();

  // Read Logo buffer
  const logoBuffer = await sharp(logoPath)
    .resize(240, 140, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  const svgTemplate = `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="40%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
      
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>

      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#84cc16" />
      </linearGradient>
      
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35"/>
      </filter>
    </defs>

    <!-- Outer Acrylic Card Background -->
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bgGrad)" rx="48"/>

    <!-- Subtle Decorative Geometric Elements -->
    <circle cx="900" cy="100" r="250" fill="#0284c7" opacity="0.15" />
    <circle cx="100" cy="1400" r="300" fill="#84cc16" opacity="0.10" />

    <!-- Top Branding Header Card -->
    <rect x="60" y="60" width="${W - 120}" height="280" rx="32" fill="#ffffff" filter="url(#shadow)"/>
    
    <!-- Inner Top Tagline Bar -->
    <rect x="60" y="300" width="${W - 120}" height="40" rx="0" fill="url(#accentGrad)"/>
    <text x="500" y="326" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="16" fill="#ffffff" letter-spacing="3">DIGITAL • LARGE FORMAT • OFFSET PRINT &amp; LED BOARD</text>

    <!-- Company Name Text -->
    <text x="500" y="150" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="46" fill="#0284c7" letter-spacing="1">AAKAR <tspan fill="#84cc16">GRAPHICS</tspan></text>
    <text x="500" y="195" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="20" fill="#64748b" letter-spacing="2">SUJAY PATEL &amp; ANKITA PATEL</text>
    <text x="500" y="240" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="18" fill="#0f172a">Vadodara, Gujarat • Printing Solutions</text>

    <!-- Main QR Code Holder Card -->
    <rect x="180" y="380" width="640" height="660" rx="40" fill="url(#cardGrad)" filter="url(#shadow)"/>
    
    <!-- QR Scan Title -->
    <text x="500" y="440" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#0f172a" letter-spacing="1">SCAN FOR DIGITAL CARD</text>
    <text x="500" y="475" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="16" fill="#64748b">Instant WhatsApp Quote • 1-Tap Save Contacts • Location</text>

    <!-- Inner QR Frame -->
    <rect x="250" y="510" width="500" height="500" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>

    <!-- Bottom Action Pills Container -->
    <rect x="60" y="1080" width="${W - 120}" height="350" rx="32" fill="#ffffff" filter="url(#shadow)"/>

    <!-- Action Points -->
    <g transform="translate(100, 1120)">
      <!-- Point 1 -->
      <circle cx="30" cy="30" r="22" fill="#dbeafe"/>
      <text x="30" y="38" text-anchor="middle" font-family="sans-serif" font-size="20">📱</text>
      <text x="75" y="25" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="19" fill="#0f172a">1-Tap Save to Contacts (vCard)</text>
      <text x="75" y="48" font-family="'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="15" fill="#64748b">Directly saves Sujay &amp; Ankita Patel's contact to phone</text>

      <!-- Point 2 -->
      <circle cx="30" cy="95" r="22" fill="#dcfce7"/>
      <text x="30" y="103" text-anchor="middle" font-family="sans-serif" font-size="20">💬</text>
      <text x="75" y="90" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="19" fill="#0f172a">Instant WhatsApp Artwork &amp; Inquiries</text>
      <text x="75" y="113" font-family="'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="15" fill="#64748b">+91 90334 34750 • Share design files &amp; get direct quotes</text>

      <!-- Point 3 -->
      <circle cx="30" cy="160" r="22" fill="#fef3c7"/>
      <text x="30" y="168" text-anchor="middle" font-family="sans-serif" font-size="20">📍</text>
      <text x="75" y="155" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="19" fill="#0f172a">Studio Address &amp; Directions</text>
      <text x="75" y="178" font-family="'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="14" fill="#64748b">FF-106 Saraswati Complex, Opp. Atithi Gruh, Manjalpur, Vadodara</text>

      <!-- Point 4 -->
      <circle cx="30" cy="225" r="22" fill="#f3e8ff"/>
      <text x="30" y="233" text-anchor="middle" font-family="sans-serif" font-size="20">🌐</text>
      <text x="75" y="220" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="19" fill="#0f172a">Website &amp; Official Email</text>
      <text x="75" y="243" font-family="'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="15" fill="#64748b">www.aakargraphics.in • sujay.aakar@gmail.com</text>
    </g>

    <!-- Footer Bar -->
    <rect x="60" y="1380" width="${W - 120}" height="50" rx="0" fill="#0f172a"/>
    <text x="500" y="1412" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="15" fill="#94a3b8">
      CustomerPilot Smart Digital Card • customerpilot.in/c/aakargraphics
    </text>
  </svg>
  `;

  // Composite SVG background with the QR code at position x:260, y:520
  const svgBuffer = Buffer.from(svgTemplate);

  await sharp(svgBuffer)
    .composite([
      {
        input: qrBuffer,
        top: 520,
        left: 260
      }
    ])
    .png()
    .toFile(outPath);

  console.log("Standee created successfully at:", outPath);
}

createStandee().catch(console.error);
