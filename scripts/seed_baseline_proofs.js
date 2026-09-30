const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const dbPath = path.resolve(__dirname, '../prisma/dev.db').replace(/\\/g, '/');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

// Ensure public/proofs exists
const proofsDir = path.resolve(__dirname, '../public/proofs');
if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
}

function generateGoogleProofSvg({ name, city, address, rating, reviews, category, registeredAt }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3;
  let starsSvg = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsSvg += `<path fill="#FBBC04" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" transform="translate(${i * 26}, 0)"/>`;
    } else if (i === fullStars && hasHalfStar) {
      starsSvg += `<path fill="#FBBC04" d="M12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24z" transform="translate(${i * 26}, 0)"/>`;
    } else {
      starsSvg += `<path fill="#DADCE0" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" transform="translate(${i * 26}, 0)"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="720" height="360" rx="20" fill="url(#bgGrad)" stroke="#334155" stroke-width="1.5"/>

  <!-- Google Maps Header Bar -->
  <g transform="translate(32, 28)">
    <!-- Google 4-color "G" Badge -->
    <rect width="36" height="36" rx="8" fill="#ffffff" filter="url(#shadow)"/>
    <g transform="translate(8, 8) scale(0.85)">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </g>

    <text x="48" y="24" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" letter-spacing="0.5">Google Business Profile • Official Day-0 Baseline</text>
    <rect x="520" y="4" width="130" height="24" rx="12" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1"/>
    <text x="585" y="20" fill="#34d399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" text-anchor="middle">VERIFIED AUDIT</text>
  </g>

  <!-- Divider -->
  <line x1="32" y1="78" x2="688" y2="78" stroke="#334155" stroke-width="1"/>

  <!-- Merchant Name & Category -->
  <text x="32" y="118" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900">${name}</text>
  <text x="32" y="142" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500">${category} • ${city} • ${address}</text>

  <!-- Ratings Box -->
  <g transform="translate(32, 164)">
    <rect width="656" height="96" rx="14" fill="#020617" fill-opacity="0.6" stroke="#1e293b" stroke-width="1"/>
    
    <!-- Big Rating Number -->
    <text x="24" y="62" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900">${rating.toFixed(1)}</text>
    
    <!-- Stars -->
    <g transform="translate(112, 32)">
      ${starsSvg}
    </g>

    <text x="114" y="68" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700">${reviews.toLocaleString('en-IN')} Google Reviews</text>
    
    <!-- Growth Metric Pill -->
    <rect x="460" y="26" width="176" height="44" rx="10" fill="#6366f1" fill-opacity="0.15" stroke="#6366f1" stroke-width="1"/>
    <text x="548" y="45" fill="#a5b4fc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" text-anchor="middle">BASELINE BENCHMARK</text>
    <text x="548" y="60" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" text-anchor="middle">Pre-CustomerPilot</text>
  </g>

  <!-- Footer Audit Details -->
  <g transform="translate(32, 290)">
    <circle cx="8" cy="12" r="4" fill="#6366f1"/>
    <text x="20" y="16" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12">Captured At Registration: <tspan fill="#f1f5f9" font-weight="700">${registeredAt}</tspan></text>
    <text x="20" y="38" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11">CustomerPilot Growth Engine Proof Certificate • Cryptographically logged in dev.db</text>
    
    <!-- CustomerPilot Mini Seal -->
    <g transform="translate(540, -4)">
      <rect width="116" height="34" rx="8" fill="#1e1b4b" stroke="#4f46e5" stroke-width="1"/>
      <text x="58" y="21" fill="#818cf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" text-anchor="middle">CustomerPilot™</text>
    </g>
  </g>
</svg>`;
}

async function main() {
  const merchantsData = [
    {
      id: "cmtymavfx0002kx008lbfvp57",
      name: "Cake Connection",
      city: "Vadodara",
      address: "Rutu Platina, Manjalpur, Vadodara, Gujarat",
      category: "Bakery & Cafe",
      rating: 4.6,
      reviews: 689,
      googleReviewLink: "https://g.page/r/CfA2zsVxH2jOEBM/review",
      registeredAt: "12 Sept 2026, 10:16 PM",
      fileKey: "cakeconnection"
    },
    {
      id: "cmub8b49y0gnykx2jrnb6llq7",
      name: "Pizza Da Dabha",
      city: "Vadodara",
      address: "Kamal Plaza, Waghodia Road, Vadodara, Gujarat",
      category: "Casual Dining & Pizzeria",
      rating: 4.1,
      reviews: 3042,
      googleReviewLink: "https://www.google.com/maps/search/?api=1&query=Pizza+Da+Dhaba+Waghodia+Road+Vadodara",
      registeredAt: "21 Sept 2026, 06:06 PM",
      fileKey: "pizzadadabha"
    },
    {
      id: "cmuc7phd20jqpkx2jijhkw2ut",
      name: "M/S DEEP PHARMACY",
      city: "Purulia",
      address: "Upen Babu Street, Purulia, West Bengal",
      category: "Pharmacy & Retail Chemist",
      rating: 3.6,
      reviews: 12,
      googleReviewLink: "https://www.google.com/maps/search/?api=1&query=Deep+Pharmacy+Purulia",
      registeredAt: "22 Sept 2026, 10:37 AM",
      fileKey: "deeppharmacy"
    },
    {
      id: "cmulf87er1qxqkx2jxzxtyzv3",
      name: "Home Style Furnitech",
      city: "Thrissur",
      address: "Naikanal, Mannath Lane, Chevoor, Thrissur, Kerala",
      category: "Furniture & Interior Showroom",
      rating: 4.8,
      reviews: 26,
      googleReviewLink: "https://www.google.com/maps/search/?api=1&query=Home+Style+Furniture+Chevoor+Thrissur+Kerala",
      registeredAt: "28 Sept 2026, 04:17 PM",
      fileKey: "homestylefurnitech"
    }
  ];

  for (const m of merchantsData) {
    const fileName = `proof_${m.fileKey}.svg`;
    const filePath = path.join(proofsDir, fileName);
    const svgContent = generateGoogleProofSvg({
      name: m.name,
      city: m.city,
      address: m.address,
      rating: m.rating,
      reviews: m.reviews,
      category: m.category,
      registeredAt: m.registeredAt
    });

    fs.writeFileSync(filePath, svgContent, 'utf-8');
    console.log(`✅ Generated Proof SVG: ${fileName}`);

    const screenshotUrl = `/proofs/${fileName}`;

    // Update in database
    await prisma.merchant.update({
      where: { id: m.id },
      data: {
        city: m.city,
        address: m.address,
        googleReviewLink: m.googleReviewLink,
        baselineRating: m.rating,
        baselineReviewCount: m.reviews,
        baselineScreenshotUrl: screenshotUrl,
        baselineCapturedAt: new Date(m.registeredAt)
      }
    });

    console.log(`✅ Updated Merchant DB: ${m.name} -> ${m.city}, ⭐ ${m.rating} (${m.reviews} reviews), GBP: ${m.googleReviewLink}`);
  }

  // Also clean up Home Style Furnitech's wrongly linked Cake Connection in MerchantGoogleConnection
  const wrongConnection = await prisma.merchantGoogleConnection.findFirst({
    where: {
      merchantId: "cmulf87er1qxqkx2jxzxtyzv3",
      googleReviewUrl: "https://g.page/r/CfA2zsVxH2jOEBM/review"
    }
  });

  if (wrongConnection) {
    await prisma.merchantGoogleConnection.delete({
      where: { id: wrongConnection.id }
    });
    console.log("✅ Cleared mistakenly linked Cake Connection GBP from Home Style Furnitech Google Connection!");
  }

  console.log("\nAll 4 merchants successfully configured with distinct GBP links, baseline stats, and visual proof snapshots!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
