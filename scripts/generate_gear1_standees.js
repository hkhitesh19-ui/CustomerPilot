const { chromium } = require("playwright");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/Admin/.gemini/antigravity/brain/644025c9-aa09-4142-baa8-0670b6c179d2";
const PUBLIC_DIR = path.join(__dirname, "../public/standees");

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

async function generateStandees() {
  console.log("Generating QR codes...");
  const reviewQr = await QRCode.toDataURL("https://customerpilot.in/review?m=cmwknjmr604vqkvv4row826w1", {
    errorCorrectionLevel: "H",
    margin: 1,
    color: { dark: "#1e293b", light: "#ffffff" },
    width: 320
  });

  const cardQr = await QRCode.toDataURL("https://customerpilot.in/card/alfa-opticals", {
    errorCorrectionLevel: "H",
    margin: 1,
    color: { dark: "#0f766e", light: "#ffffff" },
    width: 320
  });

  const gatewayQr = await QRCode.toDataURL("https://customerpilot.in/hub/alfa-opticals", {
    errorCorrectionLevel: "H",
    margin: 1,
    color: { dark: "#1e1b4b", light: "#ffffff" },
    width: 340
  });

  const goldReviewQr = await QRCode.toDataURL("https://customerpilot.in/review?m=cmwknjmr604vqkvv4row826w1", {
    errorCorrectionLevel: "H",
    margin: 1,
    color: { dark: "#92400e", light: "#fffbeb" },
    width: 320
  });

  const goldCardQr = await QRCode.toDataURL("https://customerpilot.in/card/alfa-opticals", {
    errorCorrectionLevel: "H",
    margin: 1,
    color: { dark: "#78350f", light: "#fffbeb" },
    width: 320
  });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 1600 });

  // OPTION 1: Split Dual-QR (Side-by-Side Balance)
  console.log("Rendering Option 1: Split Dual-QR...");
  const htmlOpt1 = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 40px; }
        .standee-frame {
          width: 780px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 25px 60px -15px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06);
          overflow: hidden;
          border: 8px solid #f8fafc;
        }
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 36px 40px;
          text-align: center;
          position: relative;
        }
        .store-pill {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          color: #38bdf8;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1.5px;
          padding: 6px 16px;
          border-radius: 999px;
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        .store-title {
          font-size: 34px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #ffffff;
          margin-bottom: 6px;
        }
        .store-tagline {
          font-size: 15px;
          color: #94a3b8;
          font-weight: 500;
        }
        .body-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 36px 36px 28px 36px;
          background: #ffffff;
        }
        .card {
          border-radius: 20px;
          padding: 24px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .card-review {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
        }
        .card-digital {
          background: linear-gradient(180deg, #f0fdfa 0%, #ccfbf1 100%);
          border: 2px solid #99f6e4;
        }
        .badge {
          font-size: 13px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .badge-google { background: #fee2e2; color: #b91c1c; }
        .badge-card { background: #dcfce7; color: #15803d; }
        .action-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .action-sub {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 16px;
          height: 36px;
        }
        .qr-wrapper {
          background: #ffffff;
          padding: 14px;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          margin-bottom: 16px;
        }
        .qr-wrapper img { display: block; width: 210px; height: 210px; }
        .instruction {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stars { color: #f59e0b; font-size: 18px; margin-bottom: 4px; }
        .footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 18px 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-left { font-size: 13px; font-weight: 600; color: #64748b; }
        .footer-right { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #0284c7; }
        .cp-logo { width: 22px; height: 22px; background: #0284c7; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="standee-frame">
        <div class="header">
          <div class="store-pill">👓 Optician & Eyewear Specialist</div>
          <div class="store-title">Alfa Opticals</div>
          <div class="store-tagline">Computerized Eye Testing • Branded Frames • Manjalpur, Vadodara</div>
        </div>

        <div class="body-grid">
          <!-- Google Review Card -->
          <div class="card card-review">
            <span class="badge badge-google">⭐ Google Verified Reviews</span>
            <div class="stars">★★★★★</div>
            <div class="action-title">Rate Our Service</div>
            <div class="action-sub">Share your feedback on Google Maps & help others find clear vision</div>
            <div class="qr-wrapper">
              <img src="${reviewQr}" />
            </div>
            <div class="instruction">📷 Scan with Camera to Review</div>
          </div>

          <!-- Digital Card -->
          <div class="card card-digital">
            <span class="badge badge-card">📇 Smart Digital Business Card</span>
            <div style="font-size: 18px; margin-bottom: 4px;">💬 📱 📍 🌐</div>
            <div class="action-title">Save Our Contact</div>
            <div class="action-sub">Get direct WhatsApp chat, optical catalog, Google Map & location info</div>
            <div class="qr-wrapper">
              <img src="${cardQr}" />
            </div>
            <div class="instruction">📇 1-Tap Save to Contacts</div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-left">✨ Dual-Action Counter Standee • 100% Free Camera Scan</div>
          <div class="footer-right">
            <span class="cp-logo">CP</span> Powered by CustomerPilot
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(htmlOpt1);
  const opt1Path = path.join(PUBLIC_DIR, "gear1_standee_opt1_split_dual.png");
  await page.locator(".standee-frame").screenshot({ path: opt1Path });
  fs.copyFileSync(opt1Path, path.join(ARTIFACT_DIR, "gear1_standee_opt1_split_dual.png"));

  // OPTION 2: Reversible Double-Sided Acrylic Duo (Front & Back Presentation)
  console.log("Rendering Option 2: Reversible Duo...");
  const htmlOpt2 = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: #e2e8f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 40px; }
        .duo-container {
          display: flex;
          gap: 36px;
          align-items: stretch;
        }
        .side-frame {
          width: 440px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 45px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 6px solid #f8fafc;
        }
        .side-tag {
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-align: center;
          text-transform: uppercase;
        }
        .side-tag-front { background: #1e293b; color: #38bdf8; }
        .side-tag-back { background: #0f766e; color: #99f6e4; }
        
        .side-hero {
          padding: 28px 24px 20px 24px;
          text-align: center;
        }
        .side-front .side-hero { background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%); }
        .side-back .side-hero { background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%); }

        .brand-name { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        .brand-sub { font-size: 13px; color: #64748b; font-weight: 500; }
        .hero-headline { font-size: 20px; font-weight: 800; margin-top: 16px; }
        .front-hl { color: #dc2626; }
        .back-hl { color: #0d9488; }
        .hero-desc { font-size: 13px; color: #475569; margin-top: 4px; line-height: 1.4; padding: 0 10px; }
        
        .qr-section {
          padding: 10px 24px 24px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          justify-content: center;
        }
        .qr-box {
          padding: 16px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
        }
        .qr-box img { width: 230px; height: 230px; display: block; }
        .stars-row { color: #f59e0b; font-size: 22px; margin-bottom: 8px; }
        .feature-pills { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 4px; }
        .fpill { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: #f1f5f9; color: #334155; }
        .side-footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 14px 20px;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="duo-container">
        <!-- SIDE A: Front (Review Magnet) -->
        <div class="side-frame side-front">
          <div class="side-tag side-tag-front">SIDE A • FRONT (Facing Billing Counter)</div>
          <div class="side-hero">
            <div class="brand-name">Alfa Opticals</div>
            <div class="brand-sub">Manjalpur, Vadodara</div>
            <div class="stars-row">★★★★★</div>
            <div class="hero-headline front-hl">Loved Your Clear Vision?</div>
            <div class="hero-desc">Scan to write a quick Google 5-Star Review with 1-tap smart keywords!</div>
          </div>
          <div class="qr-section">
            <div class="qr-box">
              <img src="${reviewQr}" />
            </div>
            <div class="feature-pills">
              <span class="fpill">Google Review</span>
              <span class="fpill">Smart AI Draft</span>
              <span class="fpill">30 Seconds</span>
            </div>
          </div>
          <div class="side-footer">⭐ Certified 5.0 Google Business Profile</div>
        </div>

        <!-- SIDE B: Back (Digital Card) -->
        <div class="side-frame side-back">
          <div class="side-tag side-tag-back">SIDE B • BACK (Facing Waiting Lounge)</div>
          <div class="side-hero">
            <div class="brand-name">Alfa Opticals</div>
            <div class="brand-sub">Manjalpur, Vadodara</div>
            <div style="font-size: 22px; margin-bottom: 8px;">📇 💬 📍 🌐</div>
            <div class="hero-headline back-hl">Smart Digital Card</div>
            <div class="hero-desc">Save our official contact, WhatsApp us directly, and view our eyewear frames collection!</div>
          </div>
          <div class="qr-section">
            <div class="qr-box">
              <img src="${cardQr}" />
            </div>
            <div class="feature-pills">
              <span class="fpill">Save to Phone</span>
              <span class="fpill">WhatsApp Chat</span>
              <span class="fpill">Google Map</span>
            </div>
          </div>
          <div class="side-footer">📲 CustomerPilot Smart Digital Business Card</div>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(htmlOpt2);
  const opt2Path = path.join(PUBLIC_DIR, "gear1_standee_opt2_reversible_duo.png");
  await page.locator(".duo-container").screenshot({ path: opt2Path });
  fs.copyFileSync(opt2Path, path.join(ARTIFACT_DIR, "gear1_standee_opt2_reversible_duo.png"));

  // OPTION 3: Single Smart QR "Unified Gateway" (Smart Router Hub)
  console.log("Rendering Option 3: Unified Gateway...");
  const htmlOpt3 = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 40px; }
        .mockup-wrap {
          display: flex;
          gap: 40px;
          align-items: center;
        }
        .standee-card {
          width: 480px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 25px 60px -15px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
          overflow: hidden;
          text-align: center;
          border: 8px solid #f1f5f9;
        }
        .top-gradient {
          background: linear-gradient(135deg, #4338ca 0%, #2563eb 50%, #06b6d4 100%);
          padding: 36px 30px;
          color: white;
        }
        .hub-pill {
          background: rgba(255,255,255,0.2);
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          padding: 5px 14px;
          border-radius: 999px;
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        .store-name { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
        .store-cat { font-size: 14px; opacity: 0.9; margin-top: 4px; }
        .middle-body { padding: 32px 30px; background: #ffffff; }
        .headline { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
        .sub-hl { font-size: 14px; color: #64748b; line-height: 1.4; margin-bottom: 24px; }
        .qr-center {
          background: #ffffff;
          padding: 16px;
          border-radius: 24px;
          display: inline-block;
          box-shadow: 0 10px 30px rgba(37,99,235,0.12);
          border: 2px solid #e0e7ff;
          margin-bottom: 20px;
        }
        .qr-center img { width: 250px; height: 250px; display: block; }
        .smart-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .action-chip {
          background: #f1f5f9;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .footer-note {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 16px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }

        /* Mobile Phone Screen Representation */
        .phone-mockup {
          width: 320px;
          height: 600px;
          background: #0f172a;
          border-radius: 40px;
          padding: 12px;
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.3);
          border: 4px solid #334155;
          display: flex;
          flex-direction: column;
        }
        .phone-screen {
          background: #f8fafc;
          border-radius: 30px;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 24px 18px;
          text-align: center;
        }
        .phone-header-logo { width: 50px; height: 50px; background: #0284c7; border-radius: 14px; margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
        .phone-store { font-size: 17px; font-weight: 800; color: #0f172a; }
        .phone-sub { font-size: 11px; color: #64748b; margin-bottom: 24px; }
        .phone-btn {
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 800;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border: 1px solid transparent;
        }
        .btn-rev { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
        .btn-card { background: #dcfce7; color: #166534; border-color: #86efac; }
        .phone-btn-icon { font-size: 22px; }
        .phone-btn-title { font-size: 13px; font-weight: 800; }
        .phone-btn-sub { font-size: 10px; font-weight: 500; opacity: 0.8; }
        .phone-footer { margin-top: auto; font-size: 10px; color: #94a3b8; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="mockup-wrap">
        <div class="standee-card">
          <div class="top-gradient">
            <div class="hub-pill">⚡ Universal 1-Scan Hub</div>
            <div class="store-name">Alfa Opticals</div>
            <div class="store-cat">Manjalpur, Vadodara</div>
          </div>
          <div class="middle-body">
            <div class="headline">Review & Connect With Us</div>
            <div class="sub-hl">1 scan opens both 5-Star Google Review and our Smart Digital Business Card</div>
            <div class="qr-center">
              <img src="${gatewayQr}" />
            </div>
            <div class="smart-actions">
              <div class="action-chip">⭐ Google Review</div>
              <div class="action-chip">📇 Save Contact</div>
              <div class="action-chip">💬 WhatsApp</div>
            </div>
          </div>
          <div class="footer-note">Scan with any phone camera • No app download required</div>
        </div>

        <!-- Phone screen showing what opens on scan -->
        <div class="phone-mockup">
          <div class="phone-screen">
            <div class="phone-header-logo">👓</div>
            <div class="phone-store">Alfa Opticals</div>
            <div class="phone-sub">Welcome! Please choose an option:</div>

            <div class="phone-btn btn-rev">
              <span class="phone-btn-icon">⭐</span>
              <div>
                <div class="phone-btn-title">Write 5-Star Google Review</div>
                <div class="phone-btn-sub">Tap for 1-click authentic keywords</div>
              </div>
            </div>

            <div class="phone-btn btn-card">
              <span class="phone-btn-icon">📇</span>
              <div>
                <div class="phone-btn-title">Save Contact & WhatsApp</div>
                <div class="phone-btn-sub">Add phone, address & catalog to phone</div>
              </div>
            </div>

            <div class="phone-footer">Powered by CustomerPilot</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(htmlOpt3);
  const opt3Path = path.join(PUBLIC_DIR, "gear1_standee_opt3_smart_gateway.png");
  await page.locator(".mockup-wrap").screenshot({ path: opt3Path });
  fs.copyFileSync(opt3Path, path.join(ARTIFACT_DIR, "gear1_standee_opt3_smart_gateway.png"));

  // OPTION 4: Vertical Stacked Hierarchy (Top Review Hero + Bottom Contact Bar)
  console.log("Rendering Option 4: Vertical Stacked...");
  const htmlOpt4 = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 40px; }
        .v-standee {
          width: 520px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 25px 60px -15px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06);
          overflow: hidden;
          border: 8px solid #ffffff;
        }
        .v-header {
          background: #0f172a;
          color: white;
          padding: 28px 24px 22px 24px;
          text-align: center;
        }
        .v-title { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
        .v-subtitle { font-size: 13px; color: #94a3b8; }
        
        .hero-review-zone {
          padding: 30px 24px 24px 24px;
          text-align: center;
          background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
          border-bottom: 2px dashed #e2e8f0;
        }
        .g-stars { color: #f59e0b; font-size: 24px; margin-bottom: 6px; }
        .rev-cta { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
        .rev-desc { font-size: 13px; color: #64748b; margin-bottom: 18px; }
        .big-qr {
          padding: 14px;
          background: #ffffff;
          border-radius: 20px;
          display: inline-block;
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          border: 2px solid #fef08a;
          margin-bottom: 12px;
        }
        .big-qr img { width: 220px; height: 220px; display: block; }
        
        .card-footer-zone {
          padding: 22px 24px;
          background: #f0fdfa;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .small-qr {
          padding: 8px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #99f6e4;
          box-shadow: 0 4px 10px rgba(0,0,0,0.04);
        }
        .small-qr img { width: 95px; height: 95px; display: block; }
        .card-text { flex: 1; }
        .card-badge { display: inline-block; background: #ccfbf1; color: #0f766e; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; margin-bottom: 6px; text-transform: uppercase; }
        .card-h { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 3px; }
        .card-sub { font-size: 12px; color: #475569; line-height: 1.3; }
        
        .bottom-bar {
          background: #0f172a;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          padding: 12px;
        }
      </style>
    </head>
    <body>
      <div class="v-standee">
        <div class="v-header">
          <div class="v-title">Alfa Opticals</div>
          <div class="v-subtitle">Premier Eyewear & Optometry • Manjalpur, Vadodara</div>
        </div>

        <div class="hero-review-zone">
          <div class="g-stars">★★★★★</div>
          <div class="rev-cta">Help Us Grow on Google!</div>
          <div class="rev-desc">Scan to write your authentic 5-Star experience on Google Maps</div>
          <div class="big-qr">
            <img src="${reviewQr}" />
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #475569;">📷 Scan to Rate 5-Stars</div>
        </div>

        <div class="card-footer-zone">
          <div class="small-qr">
            <img src="${cardQr}" />
          </div>
          <div class="card-text">
            <span class="card-badge">📇 Digital Card</span>
            <div class="card-h">Save Our Contact & Catalog</div>
            <div class="card-sub">Tap or scan to save our WhatsApp, store hours, Google Map directions & eyewear catalog to your phone.</div>
          </div>
        </div>

        <div class="bottom-bar">
          CustomerPilot Gear 1 • Smart Review & Digital Card Standee
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(htmlOpt4);
  const opt4Path = path.join(PUBLIC_DIR, "gear1_standee_opt4_vertical_stacked.png");
  await page.locator(".v-standee").screenshot({ path: opt4Path });
  fs.copyFileSync(opt4Path, path.join(ARTIFACT_DIR, "gear1_standee_opt4_vertical_stacked.png"));

  // OPTION 5: Royal Luxury Gold / Matte Dark Edition (Premium Boutique / Jewellery / Luxury Opticals)
  console.log("Rendering Option 5: Royal Luxury Gold...");
  const htmlOpt5 = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cinzel', 'Playfair Display', Georgia, serif; }
        body { background: #09090b; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 40px; }
        .luxury-standee {
          width: 760px;
          background: #18181b;
          border-radius: 32px;
          box-shadow: 0 30px 80px -20px rgba(0,0,0,0.8), 0 0 0 2px #d97706;
          overflow: hidden;
          border: 10px solid #27272a;
        }
        .gold-border-top {
          height: 6px;
          background: linear-gradient(90deg, #d97706 0%, #fef08a 50%, #d97706 100%);
        }
        .lux-header {
          padding: 40px 30px 24px 30px;
          text-align: center;
          background: radial-gradient(circle at center, #27272a 0%, #18181b 100%);
        }
        .crest {
          font-size: 28px;
          color: #f59e0b;
          margin-bottom: 8px;
        }
        .lux-title {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #fef3c7;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .lux-subtitle {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          color: #d97706;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .lux-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 24px 36px 36px 36px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .lux-card {
          background: #27272a;
          border: 1px solid #78350f;
          border-radius: 20px;
          padding: 24px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .lux-badge {
          background: #451a03;
          border: 1px solid #b45309;
          color: #fef3c7;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          padding: 5px 14px;
          border-radius: 999px;
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        .lux-action-h {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 20px;
          color: #fef08a;
          margin-bottom: 6px;
        }
        .lux-action-p {
          font-size: 12px;
          color: #a1a1aa;
          line-height: 1.4;
          margin-bottom: 18px;
          height: 34px;
        }
        .lux-qr-box {
          background: #fffbeb;
          padding: 14px;
          border-radius: 18px;
          border: 2px solid #d97706;
          box-shadow: 0 8px 25px rgba(217, 119, 6, 0.2);
          margin-bottom: 16px;
        }
        .lux-qr-box img { width: 200px; height: 200px; display: block; }
        .lux-scan-text {
          font-size: 12px;
          font-weight: 700;
          color: #d97706;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        
        .lux-footer {
          background: #09090b;
          border-top: 1px solid #27272a;
          padding: 16px 36px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #71717a;
          letter-spacing: 1px;
        }
        .lux-footer-gold { color: #f59e0b; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="luxury-standee">
        <div class="gold-border-top"></div>
        <div class="lux-header">
          <div class="crest">✦ 👑 ✦</div>
          <div class="lux-title">Alfa Opticals</div>
          <div class="lux-subtitle">Haute Optometry & Designer Eyewear • Vadodara</div>
        </div>

        <div class="lux-grid">
          <!-- Google Review -->
          <div class="lux-card">
            <span class="lux-badge">⭐ Google Distinction</span>
            <div style="color: #f59e0b; font-size: 20px; margin-bottom: 6px;">★★★★★</div>
            <div class="lux-action-h">Share Your Experience</div>
            <div class="lux-action-p">Compliment our craftsmanship with a 5-Star review on Google Maps</div>
            <div class="lux-qr-box">
              <img src="${goldReviewQr}" />
            </div>
            <div class="lux-scan-text">✦ Scan To Review ✦</div>
          </div>

          <!-- Digital Card -->
          <div class="lux-card">
            <span class="lux-badge">📇 VIP Concierge Profile</span>
            <div style="font-size: 20px; margin-bottom: 6px;">✦ 📇 ✦</div>
            <div class="lux-action-h">Digital Business Card</div>
            <div class="lux-action-p">Direct VIP WhatsApp, boutique directions, and bespoke eyewear catalog</div>
            <div class="lux-qr-box">
              <img src="${goldCardQr}" />
            </div>
            <div class="lux-scan-text">✦ Scan To Connect ✦</div>
          </div>
        </div>

        <div class="lux-footer">
          <div>BESPOKE COUNTER STAND • GOLD COLLECTION</div>
          <div class="lux-footer-gold">POWERED BY CUSTOMERPILOT</div>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(htmlOpt5);
  const opt5Path = path.join(PUBLIC_DIR, "gear1_standee_opt5_royal_luxury.png");
  await page.locator(".luxury-standee").screenshot({ path: opt5Path });
  fs.copyFileSync(opt5Path, path.join(ARTIFACT_DIR, "gear1_standee_opt5_royal_luxury.png"));

  await browser.close();
  console.log("All 5 Gear 1 Standees generated successfully!");
}

generateStandees().catch(console.error);
