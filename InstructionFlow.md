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
8. Copy the generated **Client ID** and **Client Secret** into your `.env` file:
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
│   └── logo_variations/               # 5 Generated High-Res Brand Logo Variations (.jpg)
│
├── src/
│   ├── app/                           # Next.js App Router (Pages, Layouts & API Routes)
│   │   ├── (auth)/                    # Authentication Route Group (login, register, forgot-password)
│   │   ├── api/                       # Backend API Endpoint Routes (JSON Services)
│   │   │   ├── demo/                  # Public Sandboxed Demo APIs (AI Review Reply)
│   │   │   ├── reviews/               # 1-Click AI Auto-Reply & List APIs
│   │   │   ├── onboarding/            # 9-Step Onboarding Engine State APIs
│   │   │   ├── webhook/               # Evolution API & WhatsApp Incoming Webhooks
│   │   │   ├── queue/                 # Live Waitlist & Queue Management APIs
│   │   │   └── google-business/       # Google OAuth 2.0 Auth Callback & Sync APIs
│   │   ├── bakery-loyalty/page.tsx    # Industry Landing Page: Bakery Loyalty
│   │   ├── cafe-loyalty/page.tsx      # Industry Landing Page: Cafe Loyalty
│   │   ├── salon-loyalty/page.tsx     # Industry Landing Page: Salon Loyalty
│   │   ├── restaurant-loyalty/page.tsx# Industry Landing Page: Restaurant Loyalty
│   │   ├── case-studies/              # Hard-Numbered Verified Case Studies
│   │   │   └── cake-connection/page.tsx # Cake Connection 90-Day Results (+895% reviews)
│   │   ├── vs/                        # Competitor Attack / Comparison Pages
│   │   │   ├── reelo/page.tsx         # Reelo vs CustomerPilot
│   │   │   ├── bingage/page.tsx       # Bingage vs CustomerPilot
│   │   │   └── birdeye/page.tsx       # Birdeye vs CustomerPilot
│   │   ├── dashboard/                 # Merchant Command Center Dashboard
│   │   │   ├── reviews/page.tsx       # 1-Click Google Review AI Studio (NEW)
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
│   │   ├── review/page.tsx            # Customer 5-Star WhatsApp Review Collector Page
│   │   └── super-admin/page.tsx       # Platform SuperAdmin Master Control Panel
│   │
│   ├── components/                    # Reusable React UI Components
│   │   ├── splash-screen.tsx          # Full-Screen 1-Second Animated Splash Overlay
│   │   ├── brand-logo.tsx             # Pure Vector Transparent SVG Logo Component
│   │   ├── app-sidebar.tsx            # Merchant Navigation Sidebar with Founder Badge
│   │   ├── top-nav.tsx                # Merchant Top Header Navigation
│   │   ├── faq-section.tsx            # 16-Question Interactive Searchable FAQ
│   │   ├── ai-reply-sandbox.tsx       # Gemini AI Review Reply Browser Sandbox
│   │   └── vs-page.tsx                # Reusable Competitor Comparison Layout
│   │
│   ├── communication/                 # Unified Messaging Infrastructure
│   │   ├── drivers/                   # Evolution API WhatsApp Engine Driver
│   │   └── services/                  # CommunicationService (Dispatch & Templates)
│   │
│   └── lib/                           # Core Backend Business Logic & Engines
│       ├── ai-review-reply.ts         # Gemini AI Review Reply Generator
│       ├── google-places-api.ts       # Google GBP API, Places API & Quota Handler
│       ├── queue-engine.ts            # WaitingCustomer & State Machine Processing
│       └── stamp-engine.ts            # Bill-to-Stamp Award & Redemption Logic
```

### **10.2 Feature & Module Mapping Table**
| Module / Feature | Main Entry File(s) | Helper Services & Engines | Purpose / Description |
| :--- | :--- | :--- | :--- |
| **1-Click GoogleReview AutoReply** | `src/app/dashboard/reviews/page.tsx` | `src/lib/ai-review-reply.ts`<br/>`src/lib/google-places-api.ts` | Pre-drafts 5-star Gemini AI replies & provides 1-Click Copy & Post to Google Maps with Quota Safety Dead-Letter Queue (Pre-Approval Mode). |
| **9-Step Onboarding Engine** | `src/app/onboarding/page.tsx` | `src/lib/onboarding-engine.ts` | Guides store owners through WhatsApp QR scan, GBP link, Stamp Rules, and first test scan. |
| **WhatsApp Messaging Engine** | `src/communication/services/CommunicationService.ts` | `src/communication/drivers/EvolutionDriver.ts` | Handles all outgoing & incoming WhatsApp messages (Welcome, OTP, Stamp Notifications, Reviews). |
| **Digital Stamp Loyalty System** | `src/app/join/page.tsx`<br/>`src/app/dashboard/rewards/page.tsx` | `src/lib/stamp-engine.ts`<br/>`src/lib/vip-engine.ts` | Customer QR scan at billing counter, stamp collection, reward unlocks, and VIP tier progression. |
| **Google Review Collection Flow** | `src/app/review/page.tsx` | `src/lib/google-reviews-service.ts` | Post-purchase review collector pre-filling 5-star AI drafts for Google Maps. |
| **Pricing V3.0 & Founding Program** | `src/app/pricing/page.tsx`<br/>`src/app/page.tsx` | N/A | Displays V3.0 Customer Capacity Pricing, 100 Founding Merchant Scarcity Counter (Platinum/Gold/Silver), and Referral Rewards. |

### **10.3 Obsolete Files Audit**
* `src/lib/run-sim.ts` — Obsolete CLI simulation runner from V13.
* `src/lib/run-v14-tests.ts` — Obsolete test runner from V14.
* `src/lib/run-v15-seo.ts` — Obsolete test runner from V15.
* `src/lib/run-v16-growth.ts` — Obsolete test runner from V16.  
*(Note: These 4 scripts are legacy CLI test runners and are not referenced in the Next.js App Router runtime).*
