# CustomerPilot - Complete Technical & Non-Technical Instruction Flow
*Version: Comprehensive Master Blueprint & Infrastructure Guide*

This document serves as the absolute blueprint for the CustomerPilot ecosystem. It outlines the entire system workflow, merging non-technical user journeys, deep technical architecture, codebase automation modules, and step-by-step infrastructure configuration guidelines for Google Cloud Console & APIs.

> 🚨 **STRICT CODEBASE MAINTENANCE DIRECTIVE (MANDATORY FOR ALL DEVELOPERS & AI AGENTS)**:  
> Whenever any **NEW file/folder is created**, or any **OLD file/folder is deleted, renamed, or refactored**, **Section 10 ("Master Codebase Architecture & File Tree") MUST ALWAYS BE UPDATED IMMEDIATELY & STRICTLY**.  
> Failing to sync Section 10 upon any filesystem change is strictly forbidden to preserve 100% documentation integrity across AI sessions and developer handoffs.

---

## 0. Infrastructure & Google Cloud Console Setup (Admin Manual Guide)

### **Why Is This Required & Which Tasks Does It Power?**
Google Business Profile (GBP) OAuth & APIs allow merchants to link their Google Business locations to CustomerPilot with 1-click. 
It powers:
1. **1-Click Google OAuth Connection**: Allows store owners to connect their Google Maps business listing.
2. **Real-time Google Review Fetching**: Syncs 5-star & low-star customer reviews from Google Maps into CustomerPilot.
3. **AI Owner Auto-Reply Posting**: Allows Gemini AI to automatically publish appreciative owner responses directly onto Google Maps.

---

### **Step-by-Step Google Cloud Console Setup Instructions**

#### **Step 1: Create a Google Cloud Project**
1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown at the top bar and click **New Project**.
3. **Project Name**: `CustomerPilot-Production` (or your preferred name).
4. Click **Create**.

#### **Step 2: Configure OAuth Consent Screen**
1. Go to **APIs & Services** ➔ **OAuth consent screen** ([Direct Link](https://console.cloud.google.com/apis/credentials/consent)).
2. Select **External** and click **Create**.
3. **App Name**: `CustomerPilot`
4. **User Support Email**: Select your Admin Gmail address.
5. **Developer Contact Information**: Enter your Admin email.
6. Click **Save and Continue**.
7. Under **Scopes**, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/business.manage`
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
8. Click **Save and Continue**.
9. Under **Test Users**, add your test Gmail accounts (or click **Publish App** to move to Production so any merchant can log in).

#### **Step 3: Create OAuth 2.0 Credentials (Client ID & Client Secret)**
1. Go to **APIs & Services** ➔ **Credentials** ([Direct Link](https://console.cloud.google.com/apis/credentials)).
2. Click **+ Create Credentials** ➔ **OAuth client ID**.
3. **Application Type**: Select `Web application`.
4. **Name**: `CustomerPilot Web Client`
5. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://your-production-domain.com` (Replace with your live domain)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/google-business/oauth`
   - `https://your-production-domain.com/api/google-business/oauth`
7. Click **Create**.
8. Copy the generated **Client ID** and **Client Secret** into your `.env.production` file:
   ```env
   GOOGLE_CLIENT_ID="391546314644-o8ep4jj3v9icce1fd1h7reu6a55lsui5.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
   ```

#### **Step 4: Submit Google Business Profile Access Request & Enable 6 APIs (CRITICAL STEP)**

> 📌 **Exact Sequence**:  
> 1. Submit Access Request Form ➔ 2. Receive Approval (7-14 Business Days) ➔ 3. Enable 6 Federated APIs (Quota automatically bumps from 0 to 60 QPM upon approval).

##### **Sub-Step 4.1: Submit Access Request Form (Enhanced Multi-Tenant Drop-In Template)**
Google Business Profile APIs are access-gated. You MUST submit the official Access Request Form before APIs can process live requests:

* **Official Form Link**: [https://support.google.com/business/contact/api_default](https://support.google.com/business/contact/api_default) or via Cloud Console ➔ APIs & Services ➔ Library ➔ Google Business Profile API ➔ Request Access.

```markdown
═══════════════════════════════════════════════════════
SECTION 1 — PROJECT DETAILS
═══════════════════════════════════════════════════════
Google Cloud Project ID:      391546314644
Google Cloud Project Number:  [Cloud Console → IAM & Admin → Settings (12-digit numeric ID)]
Product Name:                 CustomerPilot (by Cake Connection)
Product Website:              https://customerpilot.in
Console OAuth Client ID:      391546314644-o8ep4jj3v9icce1fd1h7reu6a55lsui5.apps.googleusercontent.com
Region of Operation:          India (primary), expanding to SEA
Merchant Count (current):     100 (Pilot Merchants)

═══════════════════════════════════════════════════════
SECTION 2 — USE CASE DESCRIPTION
═══════════════════════════════════════════════════════
CustomerPilot is a multi-tenant AI-powered customer retention SaaS platform for local 
retail merchants (cafes, bakeries, salons, restaurants across India). The platform helps 
merchants actively manage their Google Business Profile (GBP) presence by automating 
reply workflows to legitimate customer reviews posted on Google Maps.

PRIMARY USE CASE:
When a customer posts a Google Review on a merchant's GBP location page, our platform 
generates a contextual reply using generative AI and posts it back via the official 
Google Business Profile API after a 60-second delayed queue.

OAUTH 2.0 AUTHORIZATION MODEL:
We DO NOT use API keys for merchant operations. Every merchant explicitly authorizes 
CustomerPilot through Google's OAuth 2.0 flow with the following scope:
  • https://www.googleapis.com/auth/business.manage

Each merchant grants access only to their own GBP location. Refresh tokens are 
encrypted at rest using AES-256 in our database. Token rotation follows Google's 
recommended practices.

SPECIFIC API ENDPOINTS WE INTEND TO CALL:
  • POST   /v1/{name=accounts/*/locations/*/reviews/*}:reply
  • GET    /v1/{name=accounts/*/locations/*/reviews}
  • GET    /v1/{name=accounts/*/locations/*}

ANTI-ABUSE & COMPLIANCE MEASURES:
1. Replies are AI-generated with explicit context references (customer name, star rating, 
   specific feedback) — generic boilerplate like "Thanks for your feedback" is 
   programmatically rejected.
2. 60-second mandatory queue delay before any reply is posted (no instant auto-reply).
3. Merchants retain full manual override and edit capabilities from their dashboard.
4. Client-side exponential backoff rate limiting enforces Google's per-minute quotas.
5. Dead-letter queue captures any replies blocked by quota exhaustion so no reply is lost.

═══════════════════════════════════════════════════════
SECTION 3 — QUOTA REQUEST
═══════════════════════════════════════════════════════
Queries per minute (QPM):  60
Queries per day (QPD):     5,000
Per-user rate (per 100s):  30
```

##### **Master 4-Phase Action Plan & Deployment Roadmap**
| Phase | Action Item | Status |
|---|---|---|
| **Phase 0** | Project Created (`391546314644`), Link Billing Account, Create Web OAuth Client | ✅ Done / Active |
| **Phase 1** | Fill 12-digit Project Number & Submit Access Request Form (Multi-Tenant SaaS Wording) | 🔴 Admin Action Today |
| **Phase 2** | Google Review Window & Email Acknowledgment | ⏳ 7-14 Business Days |
| **Phase 3** | Enable 6 APIs (Exclude Q&A), Create Pub/Sub Topic `gbp-review-notifications`, Verify Quota 60 QPM | 🔴 Post-Approval |
| **Phase 4** | Run 1-Click Dead-Letter Queue Flush & Submit OAuth Consent Screen for Verification | 🔴 Production Launch |

---

## 1. Merchant's 7-Day Trial & Onboarding Setup (Day 1)
**Non-Technical Flow:**
When a Merchant signs up, they begin a 7-day completely free trial. They fill out their basic business profile (Business Name, Category, Logo) and set up their specific Loyalty Rules (e.g., "Buy 9, Get 1 Free Cake"). Next, they scan a QR Code to connect their own WhatsApp number to the system so messages go out from their brand.

**Technical Architecture & Modules:**
*   **Registration & Setup**: `src/app/(auth)/register/page.tsx` & `src/app/onboarding/page.tsx`
*   **Loyalty Rules Setup**: `src/app/dashboard/settings/page.tsx` (Merchant configures rewards, validity, and tier progressions).
*   **WhatsApp Connection (AutoCreate EvolutionAPI)**:
    *   **Module**: `src/app/api/whatsapp/connect/route.ts` (or equivalent Evolution API initialization).
    *   **Action**: When the merchant scans the QR code on the setup screen, the backend automatically calls the Evolution API server to **Auto-Create a new Instance** (e.g., `CP_M_cms...`). This instance uniquely binds the merchant's WhatsApp session to CustomerPilot without manual API key management.

---

## 2. The Webhook Strategy: Why Pinggy? (Testing Phase)
**Non-Technical Flow:**
During development and testing, if a customer sends a message on WhatsApp, our system needs to receive it instantly. To make our local computer accessible to the global WhatsApp API, we use a temporary bridge (tunnel) called Pinggy.

**Technical Architecture & Modules:**
*   **Webhook Config**: `src/app/api/webhook/evolution/route.ts`
*   **Reasoning**: Evolution API is hosted on a cloud server (`200.97.170.53:8080`). When a customer sends "Yes" on WhatsApp, the cloud server needs to notify our Next.js backend. A cloud server *cannot* send data to `http://localhost:3000` because localhost is hidden behind your home Wi-Fi router. 
*   **The Fix**: We use `https://tgmgj-2409-4090-10b6-1435-a500-8d84-1af9-59f7.run.pinggy-free.link/api/webhook/evolution` as the Webhook URL. Pinggy acts as a public entry point that perfectly routes the incoming webhook data directly into your local `localhost:3000` environment so your code can execute.

---

## 3. Customer's 1st Purchase & Loyalty Approval
**Non-Technical Flow:**
A customer scans the Standee QR code at the counter, which opens WhatsApp with a pre-typed message. They send it, and instantly receive a "You are in queue" reply. After the customer pays, the merchant looks at their Dashboard Queue, types in the purchase amount, and clicks "Approve". The customer gets a WhatsApp message with their live VIP Wallet link showing 1 Stamp.

**Technical Architecture & Modules:**
*   **QR Scan & Queue Join**: 
    *   Customer sends `(ref:counter)` message. Webhook at `src/app/api/webhook/evolution/route.ts` detects it.
    *   Customer is inserted into `db.waitingCustomer`.
    *   Webhook replies via Evolution API: "You're in the queue..."
*   **Merchant Approval (Queue)**: `src/app/dashboard/queue/page.tsx`
    *   Merchant enters the billing amount and clicks Approve.
*   **Stamp Awarding**: `src/app/api/rewards/award/route.ts`
    *   System calculates stamps based on the amount.
    *   Updates the `Customer` and `Wallet` in the DB.
    *   Triggers the "STAMP_AWARDED" template via WhatsApp, sending the VIP Wallet URL (`src/app/q/wallet/[customerId]/page.tsx`).

---

## 4. AI Draft Google Review (5-Min Testing Interval)
**Non-Technical Flow:**
To ensure merchants get more Google Reviews, the system asks the customer if they want AI to write a review for them. For testing purposes, instead of waiting till the next day, this automation runs every 5 minutes. If the customer replies "Yes", the AI sends a pre-written review and a link to post it.

**Technical Architecture & Modules:**
*   **Cron Trigger (5-Min)**: `src/app/api/cron/automations/route.ts`
    *   *Testing Modification*: The cron interval is set to check for purchases made 5 minutes ago instead of 24 hours ago.
    *   Cron sends: *"Would you like AI to prepare your Google Review? Reply YES..."*
*   **Customer Replies 'YES'**: Caught by `src/app/api/webhook/evolution/route.ts`.
*   **Sending the Draft Link**: Webhook replies with the AI Draft message and the URL to `src/app/review/page.tsx`.
*   **AI Generation on Click**: When the user opens the link, `src/app/review/page.tsx` uses Google Gemini API to dynamically generate a 100% unique 2-3 line review based on the merchant's category. The customer taps "Copy & Post" to redirect to the actual Google Maps URL.

---

## 5. Google Review Auto-Reply (1-Min Testing Interval)
**Non-Technical Flow:**
When a customer successfully posts a review on Google, the merchant shouldn't have to manually type "Thank you". The system checks Google every 1 minute (in testing mode) for new reviews. If a new review is found, our AI writes a beautiful, context-aware reply and posts it automatically.

**Technical Architecture & Modules:**
*   **Cron Trigger (1-Min)**: `src/app/api/cron/google-reviews/route.ts`
*   **Logic Module**: `src/app/api/google-business/bulk-reply/route.ts`
    *   Connects to Google Business Profile API.
    *   Fetches the latest reviews (up to 500).
    *   Filters reviews where `reply == null`.
    *   Uses Google Gemini to draft a reply based on the star rating and customer's text.
    *   Pushes the reply back to Google via API.

---

## 6. Loyalty Cycles & Tier Progression (Surprise Stamps)
**Non-Technical Flow:**
When a customer completes their 1st cycle (e.g., collects all 10 stamps and gets a free cake), they don't just start from zero again. As a surprise, the merchant's rule automatically gives them 2 Advance Bonus Stamps for their 2nd cycle! Also, their status upgrades automatically: 
Cycle 1 = Bronze ➔ Cycle 2 = Silver ➔ Cycle 3 = Gold ➔ Cycle 4 = Platinum. This creates massive emotional attachment.

**Technical Architecture & Modules:**
*   **Tier Logic Engine**: `src/app/api/rewards/redeem/route.ts` & `src/app/api/rewards/award/route.ts`
*   **Action**: 
    1.  When a reward is redeemed (Cycle 1 complete), the `cycleCount` on the customer profile increments.
    2.  Tier evaluation runs: if `cycleCount == 2`, role = "Silver". if `cycleCount == 3`, role = "Gold", etc.
    3.  A predefined Merchant Rule (Surprise Bonus) injects 2 initial stamps into the new empty wallet.
    4.  WhatsApp trigger sends a Congratulatory message: *"Welcome to the Silver Tier! We've added 2 surprise stamps to kickstart your new card!"*

---

## 7. Trial Expiration & Payment Rules
**Non-Technical Flow:**
The system gives the merchant exactly 7 days to test the magic of CustomerPilot. Once the 7 days are over, if they haven't purchased a 6-Month or 1-Year subscription, the system completely locks down. Webhooks stop, automations pause, and they cannot scan new customers until they pay.

**Technical Architecture & Modules:**
*   **Dashboard Gatekeeper**: `src/app/dashboard/layout.tsx` (Middleware).
    *   Checks `merchant.trialEndsAt` and `merchant.subscriptionStatus`.
    *   If expired, renders the Payment Gateway / Upgrade UI instead of the dashboard.
*   **API Gatekeeper**: `src/app/api/webhook/evolution/route.ts` & `src/lib/template-engine.ts`

- **Purpose**: Runs daily via pinggy or Vercel cron to execute logic requiring delays (like Winbacks or morning reports).
- **Dynamic Template Engine**: All WhatsApp messages (Welcome, Queue Duplicate, Name Confirmation, Reviews, Stamp Earned, Reward Unlocked, Winbacks, Morning Reports) now use a centralized Dynamic Template Engine (`getCompiledTemplate`).
  - **Priority 1:** Merchant Custom Override (`MessageTemplate` where `merchantId` is set).
  - **Priority 2:** System Default Override (`MessageTemplate` where `merchantId` is `null` — editable by SuperAdmin).
  - **Priority 3:** Hardcoded `SYSTEM_DEFAULT_TEMPLATES` inside `src/lib/default-templates.ts`.
- **Review Requests**:
  - Sends AI-generated Google review links (`REVIEW_DRAFT`).

---

## 8. SuperPowerful Admin Panel
**Non-Technical Flow:**
As the platform owner, you have a master dashboard to control everything. You can view all merchants, check system health, manually extend trials, fix broken connections, and monitor overall revenue globally.

**Technical Architecture & Modules:**
*   **Location**: `src/app/super-admin/page.tsx`
*   **Capabilities**:
    *   Global Command Center (Analytics).
    *   Merchant Management (View, Edit, Suspend).
    *   Subscription Overrides (Force active status or extend trials).
    *   Audit Logs (Track every API call and error).
*   **Testing Setup**: This is fully ready. You can test this right now by navigating to `http://localhost:3000/super-admin` on your local browser. No Pinggy required for this, purely localhost access!

---

## 9. Built-in Automated AI Developer Features (Codebase Automations)

This section details the automated safeguards and AI features implemented directly by the developer inside the codebase:

### **9.1 Automatic OAuth Access Token Auto-Refresh**
*   **Module**: `src/lib/google-reviews-service.ts` (`getValidOAuthAccessToken`)
*   **How it Works**: Google OAuth access tokens expire after 1 hour (`3600s`). Instead of forcing the store owner to log into Google again every hour, our codebase automatically checks `oauthTokenExpiry`. If expired, it automatically calls Google's OAuth Token Endpoint (`https://oauth2.googleapis.com/token`) using `oauthRefreshToken` to obtain a fresh access token in the background before executing any review fetch or auto-reply API call.

### **9.2 Customer Google Review Upsert & 1-Review Policy Handling**
*   **Modules**: `src/app/api/reviews/record-google-post/route.ts` & `src/components/review/ReviewEditor.tsx`
*   **How it Works**:
    1.  **Google Maps Policy**: Google allows only 1 review per Google account per business listing.
    2.  **Review Landing Page UI**: When a returning customer opens `/review?c=...&m=...`, `ReviewEditor` checks for existing reviews and displays a Google Policy notice with options to `"Use My Previous Review"` (edit mode) or `"Use Fresh AI Draft"`.
    3.  **Database Upsert**: When a returning customer submits an edited review, `record-google-post` performs an **UPSERT** on `db.review` and `db.googleBusinessReview` rather than creating duplicate rows.
    4.  **Auto-Reply Reset**: The review's `isReplied` status is reset to `false`, allowing Gemini AI to craft a new, updated owner response for the edited review text.
    5.  **Stamp Farming Protection**: Bonus stamps (`+2 Bonus Stamps`) are awarded **only once** per customer on their first review submission, preventing users from abusing the system by re-editing their review multiple times.

---

## 10. Master Codebase Architecture & File Tree

> ⚠️ **STRICT MANDATE**: Whenever a new file is added or an existing file is deleted/refactored, Section 10 MUST be updated in the SAME turn without exception.

This section provides the complete, authoritative map of all directories, files, feature mappings, and obsolete file audits in the CustomerPilot V6.4 ecosystem.

### **10.1 Directory Tree Structure**
```
F:\CustomerPilot_ByGLM_July2026
├── Git Commit on VPS Live.txt         # Active Live Git Commit & Deployment History Tracker on Hostinger VPS
├── prisma/
│   └── schema.prisma                  # Master Database Schema (Prisma ORM: Customer, Merchant, AuditLog, DeadLetterQueue, etc.)
│
├── Logo/
│   ├── cplogo1.png                     # Original Master Logo (Vertical Layout)
│   └── cplogo_horizontal.png          # Exact 3D Ribbon Logo (Horizontal Layout)
│
├── public/
│   ├── cplogo.png                     # Master Light-Mode Horizontal Brand Logo (Navbar & Header)
│   ├── cplogo_dark_backup.png          # Backup of Original Dark-Mode Logo
│   ├── logo_variations/               # 5 Generated High-Res Brand Logo Variations (.jpg)
│   ├── proofs/                        # Day-0 Google Business Profile Registration Proof Certificates (.svg)
│   └── standees/                      # 3 Shortlisted Tabletop Standee Mockup Images (Bakery, Royal VIP, Sweet Celebration) (.jpg)
│
├── src/
│   ├── app/                           # Next.js App Router (Pages, Layouts & API Routes)
│   │   ├── (auth)/                    # Authentication Route Group (login, register, forgot-password)
│   │   ├── api/                       # Backend API Endpoint Routes (JSON Services)
│   │   │   ├── admin/                     # SuperAdmin Management, Impersonate & Sync-VPS APIs
│   │   │   │   ├── impersonate/route.ts   # Impersonation Token & Session Issuer
│   │   │   │   ├── merchants/route.ts     # Merchant Fleet List & Profile Editor
│   │   │   │   ├── digital-cards/route.ts # SuperAdmin On-Behalf Digital Card Management API
│   │   │   │   ├── whatsapp-monitor/route.ts # SuperAdmin WhatsApp Disconnection & Targeted Alert Fleet API
│   │   │   │   └── sync-vps/route.ts      # 1-Click Production Database Sync from Hostinger VPS
│   │   │   ├── cron/                      # Scheduled Background Tasks & Health Runners
│   │   │   │   ├── whatsapp-health/route.ts # Automated Fleet WhatsApp Disconnection & Targeted Alert Cron
│   │   │   │   ├── automations/route.ts   # Winback & Marketing Automations Cron
│   │   │   │   └── gbp-posts/route.ts     # Weekly 3-Post Content Generation Cron
│   │   │   ├── merchant/              # Merchant Google Manager Access & Verification APIs
│   │   │   │   └── gbp-manager-access/route.ts # 1-Click Agency Manager Invite & Access State API
│   │   │   ├── demo/                  # Public Sandboxed Demo APIs (AI Review Reply)
│   │   │   ├── digital-card/          # Standalone Digital Business Card APIs
│   │   │   │   ├── route.ts           # Digital Card CRUD API (Get/Save)
│   │   │   │   └── fetch-public-gbp/route.ts # Public Google Places Auto-Extractor (Zero OAuth)
│   │   │   ├── reviews/               # 1-Click AI Auto-Reply & List APIs
│   │   │   ├── qr/                    # Dynamic Standee & QR Generation APIs
│   │   │   │   ├── generate/route.ts  # Branded QR Code Generator API
│   │   │   │   └── standee/route.ts   # Dynamic High-Res Acrylic Standee Composite API (Sharp)
│   │   │   ├── onboarding/            # 9-Step Onboarding Engine State APIs
│   │   │   ├── webhook/               # Evolution API & WhatsApp Incoming Webhooks
│   │   │   ├── queue/                 # Live Waitlist & Queue Management APIs
│   │   │   ├── menu/                  # Online Ordering Menu & Item CRUD APIs
│   │   │   │   ├── [merchantId]/route.ts # Public Category & Available Items Fetcher
│   │   │   │   └── items/route.ts     # Merchant Menu Items CRUD Management API
│   │   │   ├── orders/                # WhatsApp Orders Management & Lifecycle APIs
│   │   │   │   ├── route.ts           # Orders List & Filter API
│   │   │   │   ├── [id]/confirm/route.ts # Merchant 1-Click Order Confirm & WA Notification
│   │   │   │   ├── [id]/cancel/route.ts  # Merchant Order Reject & WA Notification
│   │   │   │   └── [id]/status/route.ts  # Order Lifecycle State Transition (PREPARING, READY, DELIVERED)
│   │   │   ├── gbp/                   # Google Business Profile (GBP) Dual-Track Operations APIs
│   │   │   │   ├── agent/route.ts             # Autonomous GBP Rank-1 Engine API (JSON Payloads & Tasks)
│   │   │   │   ├── audit/route.ts             # Free 100-Point GBP Health Audit & Competitor Spam Purge API
│   │   │   │   ├── assign-track/route.ts      # Assign Track A / Track B & Seed SOP Checklist
│   │   │   │   ├── checklist/route.ts         # Executive GBP Checklist & Progress State
│   │   │   │   ├── checklist/complete/route.ts # Checkbox Verification with Automated Side Effects
│   │   │   │   ├── redressal-dossier/route.ts # Pre-Filled Google Business Redressal Complaint Dossier Generator API
│   │   │   │   ├── posts/route.ts             # Weekly 3-Post Engine (Generate/List Tuesday, Thursday, Saturday Content)
│   │   │   │   ├── posts/[id]/mark-posted/route.ts # Operator 1-Click Verification & Live Status Mark
│   │   │   │   ├── posts/[id]/approve/route.ts # Merchant 1-Click Post Approval API
│   │   │   │   ├── posts/[id]/edit/route.ts   # Merchant Title/Caption Edit & Customization API
│   │   │   │   ├── posts/[id]/reject/route.ts # Merchant Reject & Fresh Alternative Regenerator API
│   │   │   │   ├── posts/card/route.ts        # Dynamic 1200x900 SVG Card Banner Generator
│   │   │   │   ├── map-traffic-broadcast/route.ts # Throttled Weekend Map Traffic Booster Broadcast
│   │   │   │   └── monthly-report/route.ts    # 4-Metric Monthly Retention WhatsApp Report Dispatcher
│   │   │   └── google-business/       # Google OAuth 2.0 Auth Callback & Sync APIs
│   │   ├── google-business-profile-ranking/page.tsx # Dedicated Pillar Landing Page: GBP Top 3 Rank Accelerator & Free Audit Tool
│   │   ├── gbp-audit/page.tsx                     # Alias Route Permanent Redirect to /google-business-profile-ranking
│   │   ├── ai-google-review-qr-generator/page.tsx # Dedicated Pillar Landing Page: Smart AI Google Reviews & QR Generator
│   │   ├── ai-google-review-autoreply/page.tsx    # Dedicated Pillar Landing Page: 1-Click AI AutoReply on Google Maps
│   │   ├── customerpilot-complete/page.tsx        # Flagship Landing Page: CustomerPilot Complete All-in-One Retention Stack
│   │   ├── smart-digital-business-card/page.tsx   # Dedicated Pillar Landing Page: Smart Digital Business Card
│   │   ├── whatsapp-digital-loyalty-card/page.tsx # Dedicated Pillar Landing Page: WhatsApp Digital Loyalty Cards
│   │   ├── bakery-loyalty/page.tsx    # Industry Landing Page: Bakery Loyalty
│   │   ├── menu/                      # Zomato-Style Online Ordering Menu Pages
│   │   │   └── [slug]/page.tsx        # Public Interactive Menu Page (Category Nav, Cart, WhatsApp Checkout)
│   │   ├── c/                         # Public Digital Business Card Routes
│   │   │   └── [slug]/page.tsx        # High-End Mobile Digital Business Card (Zero App Install)
│   │   ├── cafe-loyalty/page.tsx      # Industry Landing Page: Cafe Loyalty
│   │   ├── salon-loyalty/page.tsx     # Industry Landing Page: Salon Loyalty
│   │   ├── restaurant-loyalty/page.tsx# Industry Landing Page: Restaurant Loyalty
│   │   ├── fastfood-loyalty/page.tsx  # Industry Landing Page: Fast Food & QSR Loyalty
│   │   ├── car-wash-loyalty/page.tsx  # Industry Landing Page: Car Wash & Auto Detailing Loyalty
│   │   ├── case-studies/              # Hard-Numbered Verified Case Studies
│   │   │   └── cake-connection/page.tsx # Cake Connection 90-Day Results (+895% reviews)
│   │   ├── vs/                        # Competitor Attack / Comparison Pages
│   │   │   ├── reelo/page.tsx         # Reelo vs CustomerPilot
│   │   │   ├── bingage/page.tsx       # Bingage vs CustomerPilot
│   │   │   ├── birdeye/page.tsx       # Birdeye vs CustomerPilot
│   │   │   └── stamp-me/page.tsx      # Stamp Me vs CustomerPilot
│   │   ├── customerpilot-vs-stamp-me/page.tsx # Competitor Interception Alias Route
│   │   ├── dashboard/                 # Merchant Command Center Dashboard
│   │   │   ├── digital-card/page.tsx  # Digital Business Card Studio & Live Simulator (NEW)
│   │   │   ├── orders/page.tsx        # Live WhatsApp Orders Dashboard (Zomato Partner Style)
│   │   │   ├── menu/page.tsx          # Online Menu Management Studio (Stock, Prices, Categories)
│   │   │   ├── gbp-status/page.tsx    # Google Maps Rank & Trust Score Transparency Dashboard (NEW)
│   │   │   ├── reviews/page.tsx       # 1-Click Google Review AI Studio
│   │   │   ├── customers/page.tsx     # VIP Customers CRM Table
│   │   │   ├── queue/page.tsx         # Live Waitlist & Queue Engine
│   │   │   ├── rewards/page.tsx       # Loyalty Reward Catalog & Stamp Rules
│   │   ├── guide/                          # Step-by-Step Interactive Guides & Infographics
│   │   │   ├── 5-minute-setup-guide/page.tsx # 5-Minute Complete Setup Guide (Fast-Track Onboarding Blueprint)
│   │   │   ├── operations/page.tsx         # Live Counter Operations Manual (Merchant & Customer Daily Journeys, Stepper & Matrix)
│   │   │   └── 3-day-trial/page.tsx        # Legacy URL Permanent Redirect to /guide/5-minute-setup-guide
│   │   ├── join/page.tsx              # Customer QR Scan & Digital Stamp Card Page
│   │   ├── onboarding/page.tsx        # 9-Step Interactive Onboarding Wizard
│   │   ├── page.tsx                   # Master Homepage & Product Landing Page
│   │   ├── pricing/page.tsx           # V3.0 Customer Capacity & Founding Merchant Pricing
│   │   ├── free-ai-google-review-generator/page.tsx # Free Interactive AI Google Review Generator (Traffic & Backlink Flywheel)
│   │   ├── smart-ai-google-review/page.tsx   # Core AI Search & LLM Domination Blueprint Page (SEO/AEO/GEO)
│   │   ├── review/page.tsx            # Customer 5-Star WhatsApp Review Collector Page
│   │   └── super-admin/page.tsx       # Platform SuperAdmin Master Control Panel
│   │
│   ├── components/                    # Reusable React UI Components
│   │   ├── gbp-manager-access-card.tsx         # 1-Click Google Business Profile Agency Manager Access & Invite Hub (CustomerPilot1@gmail.com)
│   │   ├── gbp-10day-sprint.tsx                # 10-Day Local Top 3 Acceleration Sprint Dashboard & 4-Lever Tactical Command Hub
│   │   ├── gbp-ranking-audit-client.tsx        # Interactive Free 100-Point GBP & Competitor Audit Tool, Tracks Comparison & Dual-Lang FAQs
│   │   ├── free-ai-review-generator-client.tsx # Free AI Review Generator Interactive Client Engine (3 Variations, Presets, Copy)
│   │   ├── live-review-reply-animation.tsx     # ReviewPilot-Style 3-Step Live Review & AI Reply Real-Time Simulation Engine (Framer Motion)
│   │   ├── ai-google-review-qr-client.tsx      # Smart AI Google Review QR Generator Client Component (SEO/GEO/AEO + Stage 4 GEO Table)
│   │   ├── ai-google-review-autoreply-client.tsx # 1-Click AI AutoReply Client Component (SEO/GEO/AEO)
│   │   ├── customerpilot-complete-client.tsx    # CustomerPilot Complete All-in-One Client Component (SEO/GEO/AEO)
│   │   ├── smart-digital-business-card-client.tsx # Smart Digital Business Card Client Component (SEO/GEO/AEO)
│   │   ├── whatsapp-digital-loyalty-client.tsx  # WhatsApp Digital Loyalty Client Component (SEO/GEO/AEO)
│   │   ├── digital-card-view.tsx      # Luxury Mobile Digital Card View with VCF & Socials
│   │   ├── menu-view.tsx              # Interactive Zomato-Style Customer Ordering Menu (Cart, Search, Veg filter, WA Checkout)
│   │   ├── dual-lang-faq.tsx          # Reusable Dual-Language FAQ (English Default + Hinglish) with Accordion & Theme Support
│   │   ├── impersonation-banner.tsx   # SuperAdmin Impersonation Sticky Banner & Return Action
│   │   ├── splash-screen.tsx          # Full-Screen 1-Second Animated Splash Overlay
│   │   ├── brand-logo.tsx             # Pure Vector Transparent SVG Logo Component
│   │   ├── app-sidebar.tsx            # Merchant Navigation Sidebar with Founder Badge
│   │   ├── top-nav.tsx                # Merchant Top Header Navigation
│   │   ├── ai-review-standee-client.tsx # Hardware Acrylic QR Standee Landing Client
│   │   ├── free-ai-review-generator-client.tsx # Interactive AI Review Generator & SEO Flywheel
│   │   ├── live-review-reply-animation.tsx # 3-Step Live Animation Engine
│   │   ├── faq-section.tsx            # 16-Question Interactive Searchable FAQ with English & Hinglish Modes
│   │   ├── ai-reply-sandbox.tsx       # Gemini AI Review Reply Browser Sandbox
│   │   ├── vs-page.tsx                # Reusable Competitor Comparison Layout
│   │   ├── fastfood-loyalty-client.tsx# Fast Food & QSR Loyalty Client Component
│   │   ├── car-wash-loyalty-client.tsx# Car Wash & Detailing Loyalty Client Component
│   │   ├── pricing/                   # Pricing Studio v4 Architecture
│   │   │   └── pricing-studio.tsx     # Pricing Studio v4 (Interactive Bundle Builder, Tenure Comparison & Admin Edit Mode)
│   │   └── super-admin/               # SuperAdmin Management UI Panels
│   │       ├── whatsapp-fleet-monitor.tsx # SuperAdmin WhatsApp Disconnection & Targeted Alert Fleet Dashboard
│   │       ├── gbp-operations-dashboard.tsx # GBP Dual-Track Operations Command Center
│   │       ├── merchant-gbp-post-queue.tsx # 1-Click Weekly Content Queue & Caption Copy Tool
│   │       ├── digital-cards-manager.tsx   # SuperAdmin On-Behalf Digital Card Generator & Fleet Manager
│   │       ├── subscription-plans-manager.tsx # Master Subscription & Card Plans Pricing Editor with Pricing Studio v4
│   │       ├── merchant-fleet-table.tsx   # Merchant Multi-Tenant Fleet Table & Impersonation
│   │       └── super-admin-stats.tsx      # System Wide Metrics & Live Revenue Cards
│   │
│   ├── communication/                 # Unified Messaging Infrastructure
│   │   ├── drivers/                   # Evolution API WhatsApp Engine Driver
│   │   └── services/                  # CommunicationService (Dispatch & Templates)
│   │
│   └── lib/                           # Core Backend Business Logic & Engines
│       ├── gbp-rank1-agent.ts         # Autonomous GBP Rank-1 Optimization Engine (Decision Matrix & Gemini/Local Fallback)
│       ├── gbp-checklist-seed.ts      # Track A & B Operational SOP Checklists & Guardrail Templates
│       ├── gbp-post-generator.ts      # Weekly 3-Post Engine (Product Spotlight, Social Proof, Weekend Offer)
│       ├── ai-review-reply.ts         # Gemini AI Review Reply Generator
│       ├── google-places-api.ts       # Google GBP API, Places API & Quota Handler
│       ├── master-plans.ts            # Canonical Master Plans, Coupons & Self-Healing Auto-Seeder
│       ├── queue-engine.ts            # WaitingCustomer & State Machine Processing
│       ├── order-bot.ts               # WhatsApp Online Ordering Engine (Parser, Lifecycle, WA Auto-replies, Confirmation)
│       ├── whatsapp-monitor.ts        # Fleet WhatsApp Disconnection Diagnosis & Targeted Alert Engine (SuperAdmin +91 9033304707)
│       └── stamp-engine.ts            # Bill-to-Stamp Award & Redemption Logic
│
├── .github/workflows/                 # CI/CD Automation Workflows
│   └── qa.yml                         # Automated Hardened QA, Playwright Error Trap & CI Verification Gate
│
├── e2e/                               # End-to-End Autonomous Testing & Hardened QA Suites
│   ├── fixtures/
│   │   └── hardened-test.ts           # Hardened Playwright Test Fixture (Console, Page Crash, Request Drops & 4xx/5xx Trap, Origin Lock & Token Redaction)
│   ├── mutations/
│   │   └── trap-mutation.spec.ts      # Multi-Vector Injected Fault Tests (Console, 500, Near-Miss 401, Pageerror, Requestfailed, Foreign Origin)
│   ├── gbp-ranking-audit.spec.ts      # Dedicated Interactive GBP Free 100-Point Audit & Redirect E2E Spec
│   ├── merchant-journey.spec.ts       # Full Merchant User Journey, Auth & Marketing Pages E2E Spec
│   └── allowlist-contract.spec.ts     # Dedicated Strict Allowlist Contract Tests (Proving Every Entry /api/auth/me, /api/auth/logout, /favicon.ico is Exercised & Permitted)
│
├── scripts/                           # Production Health, Seed & Playwright Verification Scripts
│   ├── run_autonomous_qa.js           # Deterministic Autonomous QA & Self-Debug Runner with Error Traps
│   ├── verify_trap_mutation.js        # Hardened Error Trap Mutation Proof & Failure Verification Script (6 Vectors)
│   ├── test_gbp_rank1_agent.js        # Deterministic Test Suite for GBP Rank-1 Engine (Track A/B, Guardrails, API)
│   ├── verify_spec_imports.js         # Architectural Spec Import Lint (Guarantees zero unhardened @playwright/test imports)
│   ├── test_scoring_engine.js         # Table-Driven Boundary Unit Test Suite for GBP Audit Scoring Engine (12 cases)
│   ├── test_token_redaction.js        # Multi-Vector Token & Secret Redaction Unit Test Suite (Bearer, JWT, Cookie, Query, JSON)
│   ├── verify_empty_db_determinism.js # Empty Database (0 Merchants) Audit Engine Invariance & Determinism Verification
│   ├── verify_gbp_landing_page.js         # Playwright GBP Landing Page & Free Interactive Audit Tool Verification Suite
│   ├── verify_master_standee_generator.js # Playwright Universal Master QR Loyalty Standee Ground-Truth Verification
│   ├── verify_superadmin_digital_card_and_indian_english.js # Playwright SuperAdmin On-Behalf Card Generation & Indian English Test Suite
│   ├── verify_seo_master_strategy.js  # Playwright Full SEO / AEO / GEO Master Strategy Assertion Suite
│   ├── verify_smart_ai_review_framework.js # Playwright AI Search & LLM Domination Framework (Stages 1, 2, 4, 5) Assertion Suite
│   ├── verify_review_pilot_animation.js # Playwright ReviewPilot-Style 3-Step Live Review & Auto-Reply Flow Verification Suite
│   ├── verify_landing_pages_enhanced.js # Playwright Enhanced Landing Pages Test Suite (5 Pages, Simulators, $100k Chassis, How It Works Infographics, Indian English)
│   ├── capture_how_it_works.js        # Playwright How-It-Works Visual Infographics Screenshot Script
│   ├── verify_light_mode.js           # Playwright Strict Light Mode & Theme Lock Assertion Suite (7 Routes)
│   ├── verify_all_products_landing_pages.js # Playwright Dedicated Product Landing Pages Test Suite (6 Scenarios)
│   ├── verify_faq_dual_language.js    # Playwright Dual-Language FAQ Switching Suite
│   ├── verify_seo_aeo_geo_pages.js    # Playwright SEO/AEO/GEO Landing Pages Test Suite
│   ├── seed_tasty_vadapav_atladara.js # Ground-Truth Business Seed Script for Tasty Vadapav Atladara
│   ├── backup_migration_bundle.sh     # Automated Zero-Scan Master Migration Snapshot & Keystore Bundler
│   └── restore_migration_bundle.sh    # Automated 1-Click Zero-Scan Master Migration Restorer
```

### **10.2 Feature & Module Mapping Table**
| Module / Feature | Main Entry File(s) | Helper Services & Engines | Purpose / Description |
| :--- | :--- | :--- | :--- |
| **Autonomous QA & Self-Debug Testing Engine** | scripts/run_autonomous_qa.js<br/>e2e/gbp-ranking-audit.spec.ts | e2e/fixtures/hardened-test.ts<br/>playwright.config.ts | Deterministic end-to-end testing and runtime error trapping framework. Listens to browser console errors, page crashes, and unwhitelisted 4xx/5xx network responses during user interaction flows. Writes failure traces to scratch/qa_debug_trace.json to empower Antigravity to autonomously debug and fix UI bugs before presenting results to the Admin. |
| **Google Business Profile (GBP) Dedicated SEO/AEO/GEO Landing Page & Free Audit Tool** | `src/app/google-business-profile-ranking/page.tsx`<br/>`src/app/gbp-audit/page.tsx` | `src/components/gbp-ranking-audit-client.tsx`<br/>`src/app/api/gbp/audit/route.ts`<br/>`scripts/verify_gbp_landing_page.js` | Dedicated high-converting public landing page and interactive diagnostic tool. Allows merchants to run a free 100-point self-audit on their GBP listing, assesses Google Sandbox ban risk, detects competitor keyword spam with physical signboard redressal opportunities, benchmarks against local top 3 competitors, and presents Track A ("New Business Launchpad") and Track B ("Top 3 Rank Accelerator") with the 5 zero-ban operational guardrails. |
| **CustomerPilot Autonomous GBP Rank-1 Engine** | `src/app/api/gbp/agent/route.ts`<br/>`.agent/agents/gbp-optimization-agent.md` | `src/lib/gbp-rank1-agent.ts`<br/>`scripts/test_gbp_rank1_agent.js` | Elite deterministic Local SEO, AEO, and GEO optimization AI engine for Indian SMBs to move from Rank #10-#50 to Google Maps Local Top 3 in 30 days. Executes 7-Pillar Algorithmic Weightage Matrix (Category alignment, WhatsApp photo review velocity, legitimate DBA signboard verification, triple LocalBusiness+FAQPage+OfferCatalog schema, weekend CTR map booster, competitor redressal purge, and 15 AEO seed Q&As) while enforcing 4 strict Google Policy Red Lines with Gemini AI & 100% deterministic local fallback. |
| **Google Business Profile (GBP) Dual-Track Operations Engine** | `src/app/dashboard/gbp-status/page.tsx`<br/>`src/components/super-admin/gbp-operations-dashboard.tsx` | `src/lib/gbp-checklist-seed.ts`<br/>`src/app/api/gbp/assign-track/route.ts`<br/>`src/app/api/gbp/checklist/complete/route.ts`<br/>`src/app/api/gbp/map-traffic-broadcast/route.ts`<br/>`src/app/api/gbp/monthly-report/route.ts` | Complete non-technical operations framework and software automation for Track A ("New Business Launchpad", 0 to Top 3 in 60 days, 30-day sandbox review velocity throttle) and Track B ("Top 3 Rank Accelerator", #10-#50 to Top 3, 90-min surgery checklist, WhatsApp honest photo review flywheel, and weekend map booster). Includes 5 operational guardrails: 1) Zero-Ban honest feedback without review gating, 2) ₹500 physical sub-board upgrade before name edits, 3) Redressal complaint spam purge form, 4) Outside-GBP GEO article mentions for ChatGPT/Gemini, and 5) Hidden attributes & WhatsApp order links. |
| **Universal Master QR Loyalty Standee System & Print Engine** | `src/app/api/qr/standee/route.ts`<br/>`src/components/qr-generator.tsx` | `public/standees/standee_universal_base.jpg`<br/>`src/lib/branded-qr.ts`<br/>`scripts/verify_master_standee_generator.js` | Locks the Master Tabletop Standee template across CustomerPilot. Renders 3D "SCAN to EARN" headline, gold satin "CONFIRM REWARDS", 3 benefit pills (Exclusive Offers, Loyalty Rewards, Membership Discount), VIP Member footer bar, and CustomerPilot tagline ("Turns Every Walkins into LifeTime Customers"). Supports dynamic merchant logo with Times New Roman serif fallback, vector A4/A5 acrylic print engine, and instant high-res JPG poster downloads. |
| **5-Stage AI Search & LLM Domination Framework (Google SGE + ChatGPT + Perplexity)** | `src/app/smart-ai-google-review/page.tsx`<br/>`src/app/ai-google-review-qr-generator/page.tsx`<br/>`src/app/free-ai-google-review-generator/page.tsx` | `src/components/free-ai-review-generator-client.tsx`<br/>`scripts/verify_smart_ai_review_framework.js`<br/>`src/components/dual-lang-faq.tsx` | **Stage 1 Blueprint**: Target URL `/smart-ai-google-review`, H1 Primary Entity (*Smart AI Google Review: Scan, Auto-Write & Boost 5-Star Reviews in 1 Click*), 45-word SGE Direct Answer Snippet.<br/>**Stage 2 Schema**: JSON-LD `@graph` with `SoftwareApplication` entity + voice-search FAQPage.<br/>**Stage 4 GEO Table**: Structured 4-column `<table>` comparing CustomerPilot against MagicReview, TapNConnect, and normal Google QR.<br/>**Stage 5 Free Utility Trap**: Standalone `/free-ai-google-review-generator` with instant 3 AI review variations, retail category presets, and standee upsell. |
| **5-Stage AI Search & LLM Domination Framework (Google SGE + ChatGPT + Perplexity)** | `src/app/smart-ai-google-review/page.tsx`<br/>`src/app/ai-google-review-qr-generator/page.tsx`<br/>`src/app/free-ai-google-review-generator/page.tsx` | `src/components/free-ai-review-generator-client.tsx`<br/>`scripts/verify_smart_ai_review_framework.js`<br/>`src/components/dual-lang-faq.tsx` | **Stage 1 Blueprint**: Target URL `/smart-ai-google-review`, H1 Primary Entity (*Smart AI Google Review: Scan, Auto-Write & Boost 5-Star Reviews in 1 Click*), 45-word SGE Direct Answer Snippet.<br/>**Stage 2 Schema**: JSON-LD `@graph` with `SoftwareApplication` entity + voice-search FAQPage.<br/>**Stage 4 GEO Table**: Structured 4-column `<table>` comparing CustomerPilot against MagicReview, TapNConnect, and normal Google QR.<br/>**Stage 5 Free Utility Trap**: Standalone `/free-ai-google-review-generator` with instant 3 AI review variations, retail category presets, and standee upsell. |
| **Dedicated Product Landing Pages & Luxury $100k Visual Simulators** | `src/app/smart-digital-business-card/page.tsx`<br/>`src/app/ai-google-review-qr-generator/page.tsx`<br/>`src/app/ai-google-review-autoreply/page.tsx`<br/>`src/app/whatsapp-digital-loyalty-card/page.tsx`<br/>`src/app/customerpilot-complete/page.tsx` | `scripts/verify_landing_pages_enhanced.js`<br/>`scripts/capture_how_it_works.js`<br/>`src/components/dual-lang-faq.tsx` | Master Homepage theme alignment, pure light mode, 100% Indian English copy. Default **Cake Connection** card on `/smart-digital-business-card`. Unobstructed, crystal-clear $100,000 SaaS luxury phone chassis (iPhone 16 Pro styling, Dynamic Island status bar 9:41, bottom home indicator, zero obstructive floating cards). Dedicated animated **"How It Works"** section on every product landing page featuring numbered gradient pills (01, 02, 03), connecting desktop energy lines, visual interactive infographic boxes, and micro-metric badges. |
| **Pure Light Mode Architecture** | `src/components/providers.tsx`<br/>`src/components/top-nav.tsx`<br/>`src/app/layout.tsx` | `scripts/verify_light_mode.js` | Strictly enforces pure light theme across public pages, landing pages, and dashboard. `NextThemesProvider` locked with `forcedTheme="light"` and `enableSystem={false}`. `<ModeToggle />` removed from top nav. Viewport `themeColor` set to `#ffffff`. |
| **Luxury Live Digital Business Card** | `src/app/c/[slug]/page.tsx`<br/>`src/app/dashboard/digital-card/page.tsx` | `src/components/digital-card-view.tsx`<br/>`src/app/api/digital-card/route.ts`<br/>`src/lib/google-places-api.ts` | Mobile-first micro-website with auto-fetched public GBP data, 6 branded social/call/WhatsApp buttons, online food ordering platforms, Google reviews, and 1-tap `.vcf` contact downloader. Zero disturbance to existing modules. |
| **1-Click GoogleReview AutoReply** | `src/app/dashboard/reviews/page.tsx` | `src/lib/ai-review-reply.ts`<br/>`src/lib/google-places-api.ts` | Pre-drafts 5-star Gemini AI replies & provides 1-Click Copy & Post to Google Maps with Quota Safety Dead-Letter Queue (Pre-Approval Mode). |
| **9-Step Onboarding Engine** | `src/app/onboarding/page.tsx` | `src/lib/onboarding-engine.ts` | Guides store owners through WhatsApp QR scan, GBP link, Stamp Rules, and first test scan. |
| **WhatsApp Messaging Engine** | `src/communication/services/CommunicationService.ts` | `src/communication/drivers/EvolutionDriver.ts` | Handles all outgoing & incoming WhatsApp messages (Welcome, OTP, Stamp Notifications, Reviews). |
| **Digital Stamp Loyalty System** | `src/app/join/page.tsx`<br/>`src/app/dashboard/rewards/page.tsx` | `src/lib/stamp-engine.ts`<br/>`src/lib/vip-engine.ts` | Customer QR scan at billing counter, stamp collection, reward unlocks, and VIP tier progression. |
| **Google Review Collection Flow** | `src/app/review/page.tsx` | `src/lib/google-reviews-service.ts` | Post-purchase review collector pre-filling 5-star AI drafts for Google Maps. |
| **Pricing Studio v4 & Dynamic Bundle Architecture** | `src/app/pricing/page.tsx`<br/>`src/components/pricing-client.tsx`<br/>`src/components/pricing/pricing-studio.tsx`<br/>`src/app/dashboard/subscription/page.tsx` | `src/lib/master-plans.ts`<br/>`src/components/super-admin/subscription-plans-manager.tsx`<br/>`src/app/api/pricing/plans/route.ts` | Unified Pricing Studio v4 providing: 1) Interactive Dynamic Bundle Builder ("🧺 Your Bundle") with real-time volume savings, 2) Tenure Comparison ("Compare all tenures") across 6 Months, 1 Year Pro (50% OFF), and Lifetime Deal, 3) Standalone Services Table with 6 Months & 1 Year breakdown, row sums, and CustomerPilot Complete Suite savings callout, 4) Real-Time SuperAdmin inline edit mode with persistence to `/api/pricing/plans`. |
| **SuperAdmin On-Behalf Card Generation & Master Pricing Suite** | `src/app/super-admin/page.tsx`<br/>`src/app/api/admin/digital-cards/route.ts` | `src/components/super-admin/digital-cards-manager.tsx`<br/>`src/components/super-admin/subscription-plans-manager.tsx`<br/>`src/lib/master-plans.ts`<br/>`scripts/verify_superadmin_digital_card_and_indian_english.js` | SuperAdmin can generate & manage live digital cards on behalf of any merchant without login credentials. Full real-time Master Pricing Plans manager allowing live edits of prices, MRPs, badges, and titles for all 12 platform plans including Smart Digital Business Cards (₹349, ₹499, ₹1,499). |

### **10.3 Obsolete Files Audit**
* `src/lib/run-sim.ts` — Obsolete CLI simulation runner from V13.
* `src/lib/run-v14-tests.ts` — Obsolete test runner from V14.
* `src/lib/run-v15-seo.ts` — Obsolete test runner from V15.
* `src/lib/run-v16-growth.ts` — Obsolete test runner from V16.  
*(Note: These 4 scripts are legacy CLI test runners and are not referenced in the Next.js App Router runtime).*
