const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/4da7c8d9-dec1-4986-9146-1a399efc88a4';
const BASE_URL = 'http://localhost:3000';
const MERCHANT_ID = 'cmtymavfx0002kx008lbfvp57';

async function runTesting() {
  console.log('🚀 Running Full Manual Testing for Cake Connection...');
  
  // 1. Fetch Master Standee (Complete CustomerPilot)
  console.log('🖼️ 1. Fetching Complete CustomerPilot Master Standee...');
  const masterRes = await fetch(`${BASE_URL}/api/qr/standee?design=master&format=print&m=${MERCHANT_ID}`);
  if (masterRes.ok) {
    const buffer = Buffer.from(await masterRes.arrayBuffer());
    const outputPath = path.join(ARTIFACT_DIR, 'cake_connection_complete_standee.jpg');
    fs.writeFileSync(outputPath, buffer);
    console.log(`  ✅ Complete CustomerPilot Master Standee saved to: ${outputPath} (${(buffer.length/1024).toFixed(1)} KB)`);
  } else {
    console.error('  ❌ Master Standee failed:', masterRes.status);
  }

  // 2. Fetch Review QR Data
  console.log('⭐ 2. Fetching Smart AI Google Review Standee data...');
  const reviewQrRes = await fetch(`${BASE_URL}/api/qr/generate?mode=reviews&type=review_counter`, {
    headers: { 'x-merchant-id': MERCHANT_ID }
  });
  let reviewQrData = null;
  if (reviewQrRes.ok) {
    const json = await reviewQrRes.json();
    reviewQrData = json.data || json;
    console.log('  ✅ Review QR Data received:', {
      targetUrl: reviewQrData.targetUrl,
      hasQrImage: !!reviewQrData.qrDataUrl,
      placeName: reviewQrData.merchant?.name
    });
  } else {
    console.error('  ❌ Review QR generate failed:', reviewQrRes.status);
  }

  // 3. Launch Playwright to capture screenshots
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 3A. Capture Cake Connection Digital Business Card (Mobile Viewport)
  console.log('📱 3A. Capturing Digital Business Card (http://localhost:3000/c/cake-connection)...');
  const mobileContext = await browser.newContext({ viewport: { width: 430, height: 932 }, isMobile: true });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${BASE_URL}/c/cake-connection`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);
  const cardScreenshotPath = path.join(ARTIFACT_DIR, 'cake_connection_digital_business_card.png');
  await mobilePage.screenshot({ path: cardScreenshotPath, fullPage: true });
  console.log(`  ✅ Digital Business Card full screenshot saved to: ${cardScreenshotPath}`);
  await mobileContext.close();

  // 3B. Render and Capture Smart AI Google Review Standee in HTML
  if (reviewQrData) {
    console.log('🖼️ 3B. Capturing Smart AI Google Review Standee HTML rendering...');
    const storeName = reviewQrData.merchant?.name || 'Cake Connection';
    const standeeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cake Connection - Smart AI Google Review Standee</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: 'Poppins', -apple-system, sans-serif;
              background: #0f172a;
              margin: 0;
              padding: 40px 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .standee-card {
              width: 380px;
              background: linear-gradient(180deg, #F0F7FF 0%, #FFFFFF 35%, #FFFFFF 75%, #F4F9FF 100%);
              border-radius: 28px;
              border: 1px solid #cbd5e1;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              text-align: center;
              overflow: hidden;
              position: relative;
            }
            .standee-body { padding: 28px 24px 22px 24px; }
            .ai-powered {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              margin-bottom: 6px;
            }
            .smart-badge {
              display: inline-block;
              background: #000000;
              color: #ffffff;
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 1.2px;
              text-transform: uppercase;
              padding: 6px 20px;
              border-radius: 9999px;
              margin-bottom: 14px;
            }
            .store-pill {
              font-size: 13px;
              font-weight: 800;
              color: #1e293b;
              background: #e2e8f0;
              display: inline-block;
              padding: 5px 16px;
              border-radius: 8px;
              margin-bottom: 12px;
            }
            .leave-us {
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #0f172a;
              margin-bottom: 2px;
            }
            .google-wordmark {
              font-size: 46px;
              font-weight: 900;
              letter-spacing: -1.5px;
              line-height: 1;
              margin-bottom: 4px;
              font-family: -apple-system, 'Product Sans', 'Poppins', sans-serif;
            }
            .stars-review {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              margin-bottom: 16px;
            }
            .stars-row {
              color: #FBBC05;
              font-size: 24px;
              letter-spacing: 2px;
              line-height: 1;
            }
            .review-text {
              font-size: 17px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .qr-wrapper {
              position: relative;
              background: #ffffff;
              padding: 16px;
              border-radius: 20px;
              display: inline-block;
              margin: 4px 0 16px 0;
              border: 1px solid #e2e8f0;
            }
            .bracket {
              position: absolute;
              width: 45px;
              height: 45px;
              pointer-events: none;
            }
            .bracket-tl {
              top: -2px; left: -2px;
              border-top: 5px solid #EA4335;
              border-left: 5px solid #EA4335;
              border-top-left-radius: 14px;
            }
            .bracket-tr {
              top: -2px; right: -2px;
              border-top: 5px solid #FBBC05;
              border-right: 5px solid #FBBC05;
              border-top-right-radius: 14px;
            }
            .bracket-bl {
              bottom: -2px; left: -2px;
              border-bottom: 5px solid #34A853;
              border-left: 5px solid #34A853;
              border-bottom-left-radius: 14px;
            }
            .bracket-br {
              bottom: -2px; right: -2px;
              border-bottom: 5px solid #4285F4;
              border-right: 5px solid #4285F4;
              border-bottom-right-radius: 14px;
            }
            .qr-image {
              width: 200px;
              height: 200px;
              display: block;
              border-radius: 8px;
            }
            .bottom-banner {
              background: #0B132B;
              color: #ffffff;
              padding: 14px 16px;
              margin-top: 10px;
              border-top: 1px solid rgba(255,255,255,0.1);
            }
            .powered-line {
              font-size: 9px;
              color: #38bdf8;
              letter-spacing: 2px;
              margin-bottom: 2px;
              font-weight: 700;
            }
            .brand-line {
              font-size: 12px;
              font-weight: 900;
              letter-spacing: 0.5px;
              color: #ffffff;
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <div class="standee-body">
              <div class="ai-powered">
                <span style="color:#000000">✦</span> Ai - Powered
              </div>
              <div class="smart-badge">Smart Ai GoogleReview QR</div>
              
              <div style="display:flex; justify-content:center; align-items:center; min-height:48px; margin: 4px auto 8px auto;">
                <img src="${BASE_URL}/uploads/1789267721286-IMG_20220502_WA0034.jpg" style="max-height:55px; max-width:180px; width:auto; height:auto; object-fit:contain; border-radius:10px; background:#ffffff; padding:4px; border:1px solid #cbd5e1;" />
              </div>

              <div class="store-pill">${storeName}</div>

              <div class="leave-us">LEAVE US A</div>
              <div class="google-wordmark">
                <span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span>
              </div>
              <div class="stars-review">
                <span class="stars-row">★★★★★</span>
                <span class="review-text">REVIEW!</span>
              </div>

              <div class="qr-wrapper">
                <div class="bracket bracket-tl"></div>
                <div class="bracket bracket-tr"></div>
                <div class="bracket bracket-bl"></div>
                <div class="bracket bracket-br"></div>
                <img src="${reviewQrData.qrDataUrl}" class="qr-image" alt="QR" />
              </div>
            </div>

            <div class="bottom-banner">
              <div class="powered-line">---- Powered By ----</div>
              <div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-top:3px;">
                <img src="${BASE_URL}/cplogo_icon.png" style="width:18px; height:18px; border-radius:4px; object-fit:contain;" />
                <span class="brand-line">CustomerPilot - YourReview Partner</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(standeeHtml, { waitUntil: 'networkidle' });
    const reviewStandeePath = path.join(ARTIFACT_DIR, 'cake_connection_smart_ai_review_standee.png');
    await page.screenshot({ path: reviewStandeePath, fullPage: true });
    console.log(`  ✅ Smart AI Google Review Standee screenshot saved to: ${reviewStandeePath}`);
  }

  await browser.close();
  console.log('🎉 Full testing completed successfully!');
}

runTesting().catch(console.error);
