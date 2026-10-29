const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const QRCode = require('qrcode')

// Helper to embed merchant logo in QR center with Error Correction Level H
async function createBrandedQRBuffer(targetUrl, qrSize, logoPath, darkColor = '#0f172a') {
  const qrRaw = await QRCode.toBuffer(targetUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: qrSize * 2, // 2x retina
    color: { dark: darkColor, light: '#ffffff' }
  })

  let qrSharp = sharp(qrRaw).resize(qrSize, qrSize)

  if (logoPath && fs.existsSync(logoPath)) {
    try {
      const badgeSize = Math.round(qrSize * 0.28)
      const logoInnerSize = Math.round(badgeSize * 0.82)
      const resizedLogo = await sharp(logoPath)
        .resize({ width: logoInnerSize, height: logoInnerSize, fit: 'inside' })
        .png()
        .toBuffer()

      const badgeSvg = Buffer.from(
        `<svg width="${badgeSize}" height="${badgeSize}">
          <rect x="0" y="0" width="${badgeSize}" height="${badgeSize}" rx="14" ry="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5"/>
        </svg>`
      )

      const badgeWithLogo = await sharp(badgeSvg)
        .composite([{ input: resizedLogo, gravity: 'center' }])
        .png()
        .toBuffer()

      const compositeQr = await qrSharp
        .composite([{ input: badgeWithLogo, gravity: 'center' }])
        .png()
        .toBuffer()

      return compositeQr
    } catch (e) {
      console.warn('QR logo embed error:', e)
    }
  }

  return await qrSharp.png().toBuffer()
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE A: SMART AI GOOGLE REVIEW STANDEE (723 x 1024)
// ─────────────────────────────────────────────────────────────────────────────
async function renderReviewStandee(merchant, logoPath) {
  const width = 723
  const height = 1024
  const targetUrl = merchant.googleReviewLink || 'https://customerpilot.in/review/' + (merchant.slug || 'cake-connection')

  const qrBuf = await createBrandedQRBuffer(targetUrl, 250, logoPath, '#0f172a')

  const baseSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#061932"/>
        <stop offset="100%" stop-color="#0f294a"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d4af37"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#d4af37"/>
      </linearGradient>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.14"/>
      </filter>
    </defs>

    <!-- Outer Porcelain Base & Metallic Borders -->
    <rect width="${width}" height="${height}" fill="#f8fafc"/>
    <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="20" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="6,4"/>

    <!-- Top Navy Header Banner -->
    <path d="M 18 38 Q 18 18 38 18 L ${width - 38} 18 Q ${width - 18} 18 ${width - 18} 38 L ${width - 18} 170 L 18 170 Z" fill="url(#headerGrad)"/>
    <line x1="18" y1="170" x2="${width - 18}" y2="170" stroke="url(#goldGrad)" stroke-width="3.5"/>

    <!-- Hero Title Section -->
    <text x="${width / 2}" y="210" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="0.5">LOVED YOUR EXPERIENCE?</text>
    <text x="${width / 2}" y="238" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="3">RATE US 5 STARS ON</text>

    <!-- Google Wordmark + REVIEWS with Explicit X Coordinates -->
    <g transform="translate(205, 292)">
      <text x="0" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#4285F4">G</text>
      <text x="36" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#EA4335">o</text>
      <text x="63" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#FBBC05">o</text>
      <text x="90" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#4285F4">g</text>
      <text x="117" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#34A853">l</text>
      <text x="130" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#EA4335">e</text>
      <text x="172" y="-3" font-family="'Segoe UI', Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" letter-spacing="1">REVIEWS</text>
    </g>

    <!-- 5 Glowing Stars -->
    <g transform="translate(${width / 2}, 340)" text-anchor="middle">
      <text font-family="'Segoe UI', Arial, sans-serif" font-size="32" fill="#fbbf24" letter-spacing="6">&#9733;&#9733;&#9733;&#9733;&#9733;</text>
    </g>

    <text x="${width / 2}" y="370" font-family="'Segoe UI', Arial, sans-serif" font-size="13.5" font-weight="700" fill="#475569" text-anchor="middle">Scan with your Phone Camera to publish your review</text>

    <!-- Center White QR Card Frame -->
    <rect x="196" y="392" width="330" height="330" rx="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="url(#cardShadow)"/>

    <!-- Google 4-Color Framing Brackets -->
    <!-- Top-Left (Red) -->
    <path d="M 216 450 L 216 418 Q 216 414 220 414 L 252 414" fill="none" stroke="#EA4335" stroke-width="6.5" stroke-linecap="round"/>
    <!-- Top-Right (Yellow) -->
    <path d="M 470 414 L 502 414 Q 506 414 506 418 L 506 450" fill="none" stroke="#FBBC05" stroke-width="6.5" stroke-linecap="round"/>
    <!-- Bottom-Left (Green) -->
    <path d="M 216 668 L 216 700 Q 216 704 220 704 L 252 704" fill="none" stroke="#34A853" stroke-width="6.5" stroke-linecap="round"/>
    <!-- Bottom-Right (Blue) -->
    <path d="M 470 704 L 502 704 Q 506 704 506 700 L 506 668" fill="none" stroke="#4285F4" stroke-width="6.5" stroke-linecap="round"/>

    <!-- 3 Bottom Feature Badges -->
    <g transform="translate(62, 746)">
      <!-- Badge 1: 10 Sec Fast -->
      <g transform="translate(0, 0)">
        <rect width="180" height="96" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="90" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="24" text-anchor="middle">&#9889;</text>
        <text x="90" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">10-SEC FAST</text>
        <text x="90" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">Zero Typing Needed</text>
      </g>

      <!-- Badge 2: Phone Camera -->
      <g transform="translate(210, 0)">
        <rect width="180" height="96" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="90" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="24" text-anchor="middle">&#128242;</text>
        <text x="90" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">ZERO APP</text>
        <text x="90" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">Use Any Phone Camera</text>
      </g>

      <!-- Badge 3: AI Drafted -->
      <g transform="translate(420, 0)">
        <rect width="180" height="96" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
        <text x="90" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="24" text-anchor="middle">&#10024;</text>
        <text x="90" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">AI DRAFTED</text>
        <text x="90" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">1-Tap Maps Publish</text>
      </g>
    </g>

    <!-- Bottom Instruction Step Bar -->
    <rect x="42" y="876" width="${width - 84}" height="56" rx="14" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.2"/>
    <text x="${width / 2}" y="910" font-family="'Segoe UI', Arial, sans-serif" font-size="13.5" font-weight="700" fill="#1e40af" text-anchor="middle">
      Open Phone Camera &#8594; Scan QR &#8594; Tap 5 Stars on Google Maps
    </text>

    <!-- Bottom Dark Footer -->
    <path d="M 18 ${height - 66} L ${width - 18} ${height - 66} L ${width - 18} ${height - 38} Q ${width - 18} ${height - 18} ${width - 38} ${height - 18} L 38 ${height - 18} Q 18 ${height - 18} 18 ${height - 38} Z" fill="#061932"/>
    <text x="${width / 2}" y="${height - 32}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="1">
      POWERED BY CUSTOMERPILOT &#8226; SMART AI GOOGLE REVIEWS
    </text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()

  const composites = [
    { input: baseBuf, left: 0, top: 0 },
    { input: qrBuf, left: 236, top: 428 }
  ]

  // Add Merchant Logo Plaque in Header
  if (logoPath && fs.existsSync(logoPath)) {
    const pw = 420
    const ph = 104
    const plaqueSvg = Buffer.from(`
      <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="${pw - 4}" height="${ph - 4}" rx="18" fill="#ffffff" stroke="#d4af37" stroke-width="2.5"/>
        <rect x="5" y="5" width="${pw - 10}" height="${ph - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
      </svg>
    `)
    const logoResized = await sharp(logoPath)
      .resize({ width: pw - 40, height: ph - 16, fit: 'inside' })
      .png()
      .toBuffer()
    const plaqueBuf = await sharp(plaqueSvg)
      .composite([{ input: logoResized, gravity: 'center' }])
      .png()
      .toBuffer()

    composites.push({
      input: plaqueBuf,
      left: Math.round((width - pw) / 2),
      top: 36
    })
  }

  return await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
    .composite(composites)
    .jpeg({ quality: 95 })
    .toBuffer()
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE B: SMART DIGITAL BUSINESS CARD STANDEE (723 x 1024)
// ─────────────────────────────────────────────────────────────────────────────
async function renderCardStandee(merchant, logoPath) {
  const width = 723
  const height = 1024
  const slug = merchant.slug || 'cake-connection'
  const targetUrl = 'https://customerpilot.in/c/' + slug

  const qrBuf = await createBrandedQRBuffer(targetUrl, 250, logoPath, '#0f172a')

  const baseSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#061a32"/>
        <stop offset="30%" stop-color="#0b2447"/>
        <stop offset="70%" stop-color="#08182b"/>
        <stop offset="100%" stop-color="#030a14"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d4af37"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#d4af37"/>
      </linearGradient>
      <filter id="goldShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#000000" flood-opacity="0.4"/>
      </filter>
    </defs>

    <!-- Deep Luxury Navy Background -->
    <rect width="${width}" height="${height}" fill="url(#cardBg)"/>

    <!-- Double Gold Royal Border -->
    <rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="24" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="none" stroke="#fef08a" stroke-width="1" stroke-opacity="0.6"/>

    <!-- Header Divider Line -->
    <line x1="24" y1="170" x2="${width - 24}" y2="170" stroke="url(#goldGrad)" stroke-width="2.5"/>

    <!-- Hero Title -->
    <text x="${width / 2}" y="220" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="1.5">SCAN TO CONNECT</text>
    <text x="${width / 2}" y="250" font-family="'Segoe UI', Arial, sans-serif" font-size="14.5" font-weight="700" fill="#93c5fd" text-anchor="middle" letter-spacing="1">SAVE OUR CONTACT &#8226; EXPLORE DIGITAL CARD</text>
    <text x="${width / 2}" y="278" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1" text-anchor="middle">1-Tap Contact Save &#8226; Instant WhatsApp &#8226; Product Catalog</text>

    <!-- Center QR Box Backing (White Luxury Rounded Card) -->
    <rect x="196" y="320" width="330" height="330" rx="26" fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3.5" filter="url(#goldShadow)"/>

    <!-- Corner Gold Frame Brackets -->
    <path d="M 216 376 L 216 344 Q 216 340 220 340 L 252 340" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 340 L 502 340 Q 506 340 506 344 L 506 376" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>
    <path d="M 216 594 L 216 626 Q 216 630 220 630 L 252 630" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 630 L 502 630 Q 506 630 506 626 L 506 594" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>

    <!-- Scan Instruction Text below QR -->
    <text x="${width / 2}" y="694" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">
      &#128242; Point Phone Camera to Open Digital Card
    </text>

    <!-- 3 Bottom Action Cards (Glassmorphism Dark Luxury Navy) -->
    <g transform="translate(62, 730)">
      <!-- Card 1: Save Contact -->
      <g transform="translate(0, 0)">
        <rect width="180" height="110" rx="18" fill="#0f294a" stroke="#1e3a5f" stroke-width="1.5"/>
        <circle cx="90" cy="34" r="20" fill="#1e3a5f"/>
        <text x="90" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="20" text-anchor="middle">&#128100;</text>
        <text x="90" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle">SAVE CONTACT</text>
        <text x="90" y="92" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">Phone, Email &amp; WhatsApp</text>
      </g>

      <!-- Card 2: Catalog & Menu -->
      <g transform="translate(210, 0)">
        <rect width="180" height="110" rx="18" fill="#0f294a" stroke="#1e3a5f" stroke-width="1.5"/>
        <circle cx="90" cy="34" r="20" fill="#1e3a5f"/>
        <text x="90" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="20" text-anchor="middle">&#128717;</text>
        <text x="90" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle">CATALOG &amp; MENU</text>
        <text x="90" y="92" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">Products, Cakes &amp; Prices</text>
      </g>

      <!-- Card 3: Maps & Socials -->
      <g transform="translate(420, 0)">
        <rect width="180" height="110" rx="18" fill="#0f294a" stroke="#1e3a5f" stroke-width="1.5"/>
        <circle cx="90" cy="34" r="20" fill="#1e3a5f"/>
        <text x="90" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="20" text-anchor="middle">&#128205;</text>
        <text x="90" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle">MAPS &amp; SOCIALS</text>
        <text x="90" y="92" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">Google Maps &amp; Instagram</text>
      </g>
    </g>

    <!-- Bottom Gold Highlight Banner -->
    <rect x="42" y="876" width="${width - 84}" height="54" rx="16" fill="#061932" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <text x="${width / 2}" y="909" font-family="'Segoe UI', Arial, sans-serif" font-size="13.5" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">
      &#10024; Tap "Save to Phone" to Add Store Card Directly to Contacts
    </text>

    <!-- Footer Branding -->
    <text x="${width / 2}" y="${height - 30}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="1">
      POWERED BY CUSTOMERPILOT &#8226; SMART DIGITAL BUSINESS CARD
    </text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()

  const composites = [
    { input: baseBuf, left: 0, top: 0 },
    { input: qrBuf, left: 236, top: 360 }
  ]

  // Add Merchant Logo Plaque in Header
  if (logoPath && fs.existsSync(logoPath)) {
    const pw = 420
    const ph = 104
    const plaqueSvg = Buffer.from(`
      <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="${pw - 4}" height="${ph - 4}" rx="18" fill="#ffffff" stroke="#d4af37" stroke-width="2.5"/>
        <rect x="5" y="5" width="${pw - 10}" height="${ph - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
      </svg>
    `)
    const logoResized = await sharp(logoPath)
      .resize({ width: pw - 40, height: ph - 16, fit: 'inside' })
      .png()
      .toBuffer()
    const plaqueBuf = await sharp(plaqueSvg)
      .composite([{ input: logoResized, gravity: 'center' }])
      .png()
      .toBuffer()

    composites.push({
      input: plaqueBuf,
      left: Math.round((width - pw) / 2),
      top: 36
    })
  }

  return await sharp({
    create: { width, height, channels: 4, background: { r: 6, g: 26, b: 50, alpha: 1 } }
  })
    .composite(composites)
    .jpeg({ quality: 95 })
    .toBuffer()
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE C: CONNECT & REVIEW DUO STANDEE (723 x 1024)
// ─────────────────────────────────────────────────────────────────────────────
async function renderComboStandee(merchant, logoPath) {
  const width = 723
  const height = 1024
  const slug = merchant.slug || 'cake-connection'
  const targetUrl = 'https://customerpilot.in/c/' + slug

  const qrBuf = await createBrandedQRBuffer(targetUrl, 250, logoPath, '#0f172a')

  const baseSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="comboBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0a192f"/>
        <stop offset="25%" stop-color="#112240"/>
        <stop offset="75%" stop-color="#0b172a"/>
        <stop offset="100%" stop-color="#020c1b"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d4af37"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#d4af37"/>
      </linearGradient>
      <filter id="boxShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#comboBg)"/>

    <!-- Royal Border -->
    <rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="24" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="none" stroke="#fef08a" stroke-width="1" stroke-opacity="0.5"/>

    <line x1="24" y1="170" x2="${width - 24}" y2="170" stroke="url(#goldGrad)" stroke-width="2.5"/>

    <!-- Hero Title -->
    <text x="${width / 2}" y="214" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="1">CONNECT WITH US &amp; RATE YOUR EXPERIENCE</text>
    <text x="${width / 2}" y="240" font-family="'Segoe UI', Arial, sans-serif" font-size="13.5" font-weight="700" fill="#93c5fd" text-anchor="middle" letter-spacing="1.5">SAVE CONTACT &#8226; VIEW CATALOG &#8226; 5-STAR GOOGLE REVIEW</text>

    <!-- Mini Stars & Google Tag -->
    <g transform="translate(${width / 2}, 268)" text-anchor="middle">
      <text font-family="'Segoe UI', Arial, sans-serif" font-size="22" fill="#fbbf24" letter-spacing="4">&#9733;&#9733;&#9733;&#9733;&#9733;</text>
    </g>

    <!-- Center White QR Card Frame -->
    <rect x="196" y="296" width="330" height="330" rx="26" fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3.5" filter="url(#boxShadow)"/>

    <!-- Dual Color Brackets (Gold & Google Blue) -->
    <path d="M 216 352 L 216 320 Q 216 316 220 316 L 252 316" fill="none" stroke="#EA4335" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 316 L 502 316 Q 506 316 506 320 L 506 352" fill="none" stroke="#FBBC05" stroke-width="6" stroke-linecap="round"/>
    <path d="M 216 570 L 216 602 Q 216 606 220 606 L 252 606" fill="none" stroke="#34A853" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 606 L 502 606 Q 506 606 506 602 L 506 570" fill="none" stroke="#4285F4" stroke-width="6" stroke-linecap="round"/>

    <!-- Scan Instruction Text below QR -->
    <text x="${width / 2}" y="664" font-family="'Segoe UI', Arial, sans-serif" font-size="14.5" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">
      &#128242; Point Phone Camera &#8594; Open Digital Hub
    </text>

    <!-- Two Dual Power Blocks (Side by Side) -->
    <g transform="translate(48, 695)">
      <!-- Left Power Block: Digital Business Card -->
      <g transform="translate(0, 0)">
        <rect width="298" height="155" rx="20" fill="#0f294a" stroke="#234567" stroke-width="1.5"/>
        <rect x="14" y="14" width="36" height="36" rx="10" fill="#1e3a5f"/>
        <text x="32" y="39" font-family="'Segoe UI', Arial, sans-serif" font-size="20" text-anchor="middle">&#128241;</text>
        <text x="60" y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="900" fill="#fef08a">DIGITAL CARD</text>

        <text x="18" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">&#10003; 1-Tap Save to Contacts</text>
        <text x="18" y="100" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">&#10003; WhatsApp Order &amp; Call</text>
        <text x="18" y="124" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">&#10003; Food Menu &amp; Catalog</text>
      </g>

      <!-- Right Power Block: Google Reviews -->
      <g transform="translate(328, 0)">
        <rect width="298" height="155" rx="20" fill="#0f294a" stroke="#234567" stroke-width="1.5"/>
        <rect x="14" y="14" width="36" height="36" rx="10" fill="#1e3a5f"/>
        <text x="32" y="39" font-family="'Segoe UI', Arial, sans-serif" font-size="20" text-anchor="middle">&#11088;</text>
        <text x="60" y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="900" fill="#fef08a">GOOGLE REVIEWS</text>

        <text x="18" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">&#10003; 5-Star Instant Rating</text>
        <text x="18" y="100" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">&#10003; AI Pre-Drafted Reviews</text>
        <text x="18" y="124" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">&#10003; Direct Google Maps Link</text>
      </g>
    </g>

    <!-- Bottom Instruction Bar -->
    <rect x="42" y="878" width="${width - 84}" height="52" rx="14" fill="#061932" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <text x="${width / 2}" y="910" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">
      One Smart QR Code &#8226; Everything Your Customer Needs
    </text>

    <!-- Footer Branding -->
    <text x="${width / 2}" y="${height - 30}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="1">
      POWERED BY CUSTOMERPILOT &#8226; DIGITAL BUSINESS CARD &amp; AI REVIEWS
    </text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()

  const composites = [
    { input: baseBuf, left: 0, top: 0 },
    { input: qrBuf, left: 236, top: 336 }
  ]

  // Add Merchant Logo Plaque in Header
  if (logoPath && fs.existsSync(logoPath)) {
    const pw = 420
    const ph = 104
    const plaqueSvg = Buffer.from(`
      <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="${pw - 4}" height="${ph - 4}" rx="18" fill="#ffffff" stroke="#d4af37" stroke-width="2.5"/>
        <rect x="5" y="5" width="${pw - 10}" height="${ph - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
      </svg>
    `)
    const logoResized = await sharp(logoPath)
      .resize({ width: pw - 40, height: ph - 16, fit: 'inside' })
      .png()
      .toBuffer()
    const plaqueBuf = await sharp(plaqueSvg)
      .composite([{ input: logoResized, gravity: 'center' }])
      .png()
      .toBuffer()

    composites.push({
      input: plaqueBuf,
      left: Math.round((width - pw) / 2),
      top: 36
    })
  }

  return await sharp({
    create: { width, height, channels: 4, background: { r: 10, g: 25, b: 47, alpha: 1 } }
  })
    .composite(composites)
    .jpeg({ quality: 95 })
    .toBuffer()
}

async function renderMasterLoyaltyStandee(merchant, logoPath) {
  const width = 723
  const height = 1024
  const targetUrl = 'https://customerpilot.in/c/' + (merchant.slug || 'cake-connection')
  const qrBuf = await createBrandedQRBuffer(targetUrl, 250, logoPath, '#0f172a')

  const baseImagePath = path.join(process.cwd(), 'public/standees/standee_master_authentic.jpg')
  const composites = []

  // Prepend clean white rounded card backing under QR matching master template
  const w = 330
  const h = 286
  const rx = 22
  const cardSvg = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${rx}" ry="${rx}" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
      <path d="M 16 46 L 16 16 L 46 16" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M ${w - 46} 16 L ${w - 16} 16 L ${w - 16} 46" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 16 ${h - 46} L 16 ${h - 16} L 46 ${h - 16}" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M ${w - 46} ${h - 16} L ${w - 16} ${h - 16} L ${w - 16} ${h - 46}" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
    </svg>
  `)
  const cardBuf = await sharp(cardSvg).png().toBuffer()
  composites.push({ input: cardBuf, left: 196, top: 363 })
  composites.push({ input: qrBuf, left: 236, top: 381 })

  // Merchant Header Plaque in top arch
  if (logoPath && fs.existsSync(logoPath)) {
    const pw = 440
    const ph = 108
    const plaqueSvg = Buffer.from(`
      <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="${pw - 4}" height="${ph - 4}" rx="18" fill="#ffffff" stroke="#d4af37" stroke-width="3"/>
        <rect x="5" y="5" width="${pw - 10}" height="${ph - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
      </svg>
    `)
    const logoResized = await sharp(logoPath)
      .resize({ width: pw - 36, height: ph - 16, fit: 'inside' })
      .png()
      .toBuffer()
    const plaqueBuf = await sharp(plaqueSvg)
      .composite([{ input: logoResized, gravity: 'center' }])
      .png()
      .toBuffer()

    composites.push({
      input: plaqueBuf,
      left: Math.round(361 - pw / 2),
      top: Math.round(84 - ph / 2)
    })
  }

  return await sharp(baseImagePath)
    .composite(composites)
    .jpeg({ quality: 95 })
    .toBuffer()
}

async function run() {
  const cake = {
    name: 'Cake Connection',
    slug: 'cake-connection',
    googleReviewLink: 'https://g.page/r/CfA2zsVxH2jOEBM/review'
  }
  const logoPath = path.join(process.cwd(), 'public/uploads/1789267721286-IMG_20220502_WA0034.jpg')

  console.log('Rendering Template A (Review)...')
  const reviewBuf = await renderReviewStandee(cake, logoPath)
  fs.writeFileSync('scratch/cake_standee_template_a_google_review.jpg', reviewBuf)

  console.log('Rendering Template B (Card)...')
  const cardBuf = await renderCardStandee(cake, logoPath)
  fs.writeFileSync('scratch/cake_standee_template_b_digital_card.jpg', cardBuf)

  console.log('Rendering Template C (Combo: Card + Reviews)...')
  const comboBuf = await renderComboStandee(cake, logoPath)
  fs.writeFileSync('scratch/cake_standee_template_c_connect_review.jpg', comboBuf)

  console.log('Rendering Template D (Loyalty Master)...')
  const masterBuf = await renderMasterLoyaltyStandee(cake, logoPath)
  fs.writeFileSync('scratch/cake_standee_template_d_master_loyalty.jpg', masterBuf)

  console.log('Done! Rendered all 4 combinations for Cake Connection.')
}

run().catch(console.error)

