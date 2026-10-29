import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get("merchantId");
  let merchant: any = null;
  if (merchantId) {
    try {
      merchant = await db.merchant.findUnique({ where: { id: merchantId } });
    } catch {
      // fallback to query params
    }
  }

  const type = searchParams.get("type") || "product";
  const rawStore = searchParams.get("store") || merchant?.name || "Cake Connection";
  const store = rawStore.split(/[-–:]/)[0].trim() || rawStore;
  const loc = searchParams.get("loc") || (merchant?.address?.includes("Manjalpur") ? "Eva The Mall, Manjalpur, Vadodara" : (merchant?.city || "Manjalpur, Vadodara"));
  const name = searchParams.get("name") || (store.toLowerCase().includes("cake") ? "Fresh Belgian Chocolate Truffle Cake" : "Chef's Special Recommendation");
  const price = searchParams.get("price") || "₹650";
  const author = searchParams.get("author") || "Sneha Patel";
  const code = searchParams.get("code") || "WEEKENDVIP";

  // Sanitize for XML/SVG
  const sanitize = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let bodySvg = "";

  if (type === "review") {
    // 5-Star Social Proof Card
    bodySvg = `
      <!-- Review Card -->
      <rect x="100" y="160" width="1000" height="580" rx="32" fill="#1e293b" stroke="#334155" stroke-width="4" />
      <g transform="translate(160, 220)">
        <!-- 5 Golden Stars -->
        <g fill="#fbbf24">
          <polygon points="20,0 26,14 40,14 29,23 33,37 20,28 7,37 11,23 0,14 14,14" transform="scale(1.2)" />
          <polygon points="20,0 26,14 40,14 29,23 33,37 20,28 7,37 11,23 0,14 14,14" transform="translate(60, 0) scale(1.2)" />
          <polygon points="20,0 26,14 40,14 29,23 33,37 20,28 7,37 11,23 0,14 14,14" transform="translate(120, 0) scale(1.2)" />
          <polygon points="20,0 26,14 40,14 29,23 33,37 20,28 7,37 11,23 0,14 14,14" transform="translate(180, 0) scale(1.2)" />
          <polygon points="20,0 26,14 40,14 29,23 33,37 20,28 7,37 11,23 0,14 14,14" transform="translate(240, 0) scale(1.2)" />
        </g>
        <rect x="360" y="6" width="220" height="38" rx="19" fill="#059669" />
        <text x="470" y="31" fill="#ffffff" font-size="16" font-weight="bold" font-family="sans-serif" text-anchor="middle">100% VERIFIED REVIEW</text>
      </g>
      <text x="160" y="340" fill="#f8fafc" font-size="34" font-style="italic" font-family="sans-serif" font-weight="600">"The quality and customer experience here</text>
      <text x="160" y="390" fill="#f8fafc" font-size="34" font-style="italic" font-family="sans-serif" font-weight="600">is unmatched in the entire neighborhood!"</text>
      <line x1="160" y1="460" x2="1040" y2="460" stroke="#334155" stroke-width="2" />
      <g transform="translate(160, 500)">
        <circle cx="36" cy="36" r="36" fill="#3b82f6" />
        <text x="36" y="47" fill="#ffffff" font-size="28" font-weight="bold" font-family="sans-serif" text-anchor="middle">${sanitize(author.charAt(0))}</text>
        <text x="96" y="32" fill="#ffffff" font-size="28" font-weight="bold" font-family="sans-serif">${sanitize(author)}</text>
        <text x="96" y="60" fill="#94a3b8" font-size="20" font-family="sans-serif">Google Maps Verified Customer • ${sanitize(loc)}</text>
      </g>
    `;
  } else if (type === "offer") {
    // Weekend Offer Card
    bodySvg = `
      <!-- Offer Card -->
      <rect x="100" y="160" width="1000" height="580" rx="32" fill="url(#offerGradient)" stroke="#f59e0b" stroke-width="4" />
      <rect x="160" y="210" width="340" height="46" rx="23" fill="#fbbf24" />
      <text x="330" y="241" fill="#78350f" font-size="20" font-weight="900" font-family="sans-serif" text-anchor="middle">⚡ WEEKEND 2X STAMPS DEAL</text>
      <text x="160" y="330" fill="#ffffff" font-size="52" font-weight="900" font-family="sans-serif">Double Loyalty Rewards</text>
      <text x="160" y="390" fill="#fef08a" font-size="30" font-weight="bold" font-family="sans-serif">Earn 2x Digital Stamps on Every Visit This Sat &amp; Sun!</text>
      <rect x="160" y="440" width="460" height="90" rx="20" fill="#0f172a" stroke="#fbbf24" stroke-width="2" stroke-dasharray="8 8" />
      <text x="190" y="495" fill="#94a3b8" font-size="20" font-family="sans-serif">COUPON CODE:</text>
      <text x="370" y="500" fill="#38bdf8" font-size="36" font-weight="bold" font-family="monospace">${sanitize(code)}</text>
      <text x="160" y="580" fill="#cbd5e1" font-size="22" font-family="sans-serif">📍 Valid at ${sanitize(store)} (${sanitize(loc)})</text>
    `;
  } else {
    // Product Spotlight Card
    bodySvg = `
      <!-- Product Card -->
      <rect x="100" y="160" width="1000" height="580" rx="32" fill="#1e293b" stroke="#38bdf8" stroke-width="4" />
      <rect x="160" y="210" width="280" height="42" rx="21" fill="#0284c7" />
      <text x="300" y="238" fill="#ffffff" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle">✨ PRODUCT SPOTLIGHT</text>
      <text x="160" y="330" fill="#ffffff" font-size="42" font-weight="900" font-family="sans-serif">${sanitize(name)}</text>
      <text x="160" y="390" fill="#94a3b8" font-size="28" font-family="sans-serif">Freshly Prepared Daily in ${sanitize(loc)}</text>
      <g transform="translate(160, 440)">
        <rect x="0" y="0" width="240" height="70" rx="20" fill="#047857" />
        <text x="120" y="46" fill="#ffffff" font-size="32" font-weight="bold" font-family="sans-serif" text-anchor="middle">${sanitize(price)}</text>
      </g>
      <text x="160" y="570" fill="#cbd5e1" font-size="24" font-family="sans-serif">📍 ${sanitize(store)} • Order Online via WhatsApp</text>
    `;
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="offerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#451a03" />
        <stop offset="100%" stop-color="#1e1b4b" />
      </linearGradient>
    </defs>
    <!-- Background -->
    <rect width="1200" height="900" fill="url(#bg)" />
    
    <!-- Top Brand Bar -->
    <rect x="0" y="0" width="1200" height="110" fill="#0284c7" />
    <text x="60" y="70" fill="#ffffff" font-size="38" font-weight="900" font-family="sans-serif">${sanitize(store)}</text>
    <text x="1140" y="68" fill="#e0f2fe" font-size="22" font-weight="600" font-family="sans-serif" text-anchor="end">Google Maps Official Update</text>

    <!-- Main Content Card -->
    ${bodySvg}

    <!-- Footer Bar -->
    <rect x="0" y="810" width="1200" height="90" fill="#0f172a" stroke="#1e293b" stroke-width="2" />
    <text x="60" y="865" fill="#64748b" font-size="20" font-family="sans-serif">Powered by CustomerPilot Local SEO &amp; Growth Engine</text>
    <text x="1140" y="865" fill="#38bdf8" font-size="22" font-weight="bold" font-family="sans-serif" text-anchor="end">customerpilot.in</text>
  </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
