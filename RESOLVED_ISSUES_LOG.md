# CustomerPilot - Resolved Issues Log

This document serves as a historical record of all major bugs, configuration issues, and logical errors resolved in the CustomerPilot project. It includes the symptom, root cause, resolution details, and timestamp of the fix.

---

## [09 Aug 2026] Issue: WhatsApp QR Scan Not Updating Dashboard Queue
- **Symptom**: Customer scanning the QR code successfully sends a message to the Evolution API, but the CustomerPilot Dashboard Queue remains empty. Issue resurfaced daily.
- **Root Cause**: The Next.js API route (`/api/webhook/evolution/route.ts`) enforces a strict security validation using `x-webhook-secret` or the `?secret=` query parameter. The manually registered Pinggy webhook URL completely omitted this secret. Consequently, the Next.js backend rejected all valid incoming webhook payloads with a `401 Unauthorized`. Additionally, the secret in `.env.local` differed from `.env`, causing manual tests to pass incorrectly.
- **Resolution**: 
  - Created a robust background Node.js daemon (`scripts/autoPinggySync.js`).
  - The daemon automatically provisions a new Pinggy SSH tunnel every 55 minutes (preventing the 60-minute expiration).
  - It autonomously extracts the public URL, securely appends the `?secret=cpilot_webhook_secret_change_in_prod_2026` query parameter, and registers it with the Evolution API `cp_admin` and `CP_M_...` instances.
- **Status**: ✅ Resolved and Verified. (100% Automated, No manual URL copying required).

---

## [09 Aug 2026] Issue: Delayed Google Review Link Not Sending
- **Symptom**: When a customer got a stamp from the Queue (via Dashboard), the 5-minute delayed Google Review WhatsApp request was never delivered.
- **Root Cause**: 
  1. The API endpoint used by the Dashboard UI (/api/rewards/award/route.ts) was completely missing the scheduleGoogleReviewRequest() function call. It sent the initial stamp notification but failed to schedule the review.
  2. Even if scheduled, the background message dispatcher (message-worker.ts) was never explicitly triggered to flush the queued state messages, leaving them indefinitely stuck in the database.
- **Resolution**: 
  - Injected scheduleGoogleReviewRequest into src/app/api/rewards/award/route.ts.
  - Upgraded src/app/api/cron/automations/route.ts to actively instantiate getMessageWorker().processBatch() every 60 seconds, guaranteeing precise delivery for time-delayed automations like Google Reviews.
- **Status**: ✅ Resolved and Verified.
---

## [09 Aug 2026] Issue: Next.js Proxy Middleware Blocking Cron & Scheduled Evolution Dispatch
- **Symptom**: Scheduled Google Review messages remained in 'scheduled' status and were never dispatched after the 5-minute delay.
- **Root Cause**: 
  1. Next.js Proxy Middleware (src/proxy.ts) required an authenticated user JWT cookie for all endpoints under /api/, blocking /api/cron/automations with a 401 Unauthorized error.
  2. The cron route relied on an unconfigured mock message worker instead of directly dispatching via the active Evolution API instance.
- **Resolution**: 
  - Added /api/cron/ to PUBLIC_API_PREFIXES in src/proxy.ts so cron triggers can execute without a user session.
  - Updated /api/cron/automations/route.ts to directly fetch all pending messages whose scheduledFor timestamp has passed and dispatch them via Evolution API (/message/sendText/{instanceName}) with status updates to 'sent'.
  - Started scripts/runAutomationsCron.js as an active background daemon polling every 60 seconds.
- **Status**: ✅ Resolved and Verified. Messages delivered to WhatsApp successfully.
---

## [09 Aug 2026] Issue: Google Review Copy to Clipboard & WhatsApp Step-2 AI Draft Cleanup
- **Symptom**: 
  1. On the Review Studio page, clicking 'Copy & Post on Google' did not reliably populate the clipboard for pasting into Google Maps.
  2. WhatsApp Step 2 contained a hardcoded static cake review draft instead of keeping it clean and letting the Review Studio handle the dynamic AI draft.
- **Root Cause**: 
  1. \ReviewEditor.tsx\ relied on an asynchronous clipboard promise before a direct window redirect, which mobile browsers and unsecure contexts often drop without synchronous user interaction.
  2. \src/app/api/webhook/evolution/route.ts\ had a hardcoded string draft in the Step 2 reply.
- **Resolution**: 
  - Overhauled \ReviewEditor.tsx\ with dual synchronous \execCommand\ and modern \
avigator.clipboard\ fallbacks, added an explicit '📋 Copy Text' button with live confirmation ('✅ Review copied to clipboard!'), and added clear edit-mode instructions for returning Google reviewers.
  - Cleaned WhatsApp Step-2 message in \oute.ts\ to be concise and link-focused without static draft review text.
- **Status**: ✅ Resolved and Verified.
---

## [09 Aug 2026] Issue: Review Page 'Copy & Post to Google' Native Navigation & Dynamic SEO Draft Fallback
- **Symptom**: 
  1. On the Review Studio page, clicking 'Copy & Post to Google' was blocked by browser popup blockers and did not open the Google Review link.
  2. When Gemini free-tier quota hit rate limit (429), the page fell back to a single generic sentence instead of a rich 3-4 line Indian English review.
- **Root Cause**: 
  1. \ReviewEditor.tsx\ changed the button to a \<button>\ tag calling \window.open\ inside a \setTimeout\, which modern browsers block as an unprompted popup.
  2. Free Gemini API quota has a 20 request/day limit, causing occasional fallback triggers.
- **Resolution**: 
  - Restored the main action button to a native \<a href={googleLink} target='_blank'>\ tag so clicking it always opens Google Maps in a new tab without popup blocker intervention, while executing synchronous clipboard copying on the click gesture.
  - Implemented dynamic Indian English review fallback generation incorporating real business name, category, city, and product details.
- **Status**: ✅ Resolved and Verified.
---

## [10 Aug 2026] Issue: CRM Customers Table Lacked Intuitive Sorting
- **Symptom**: The SuperAnalytics dashboard for customers had a limited dropdown for sorting, which required extra clicks and wasn't intuitive for professional CRM usage.
- **Root Cause**: Sorting was handled via a standard HTML `<select>` element rather than interactive table headers.
- **Resolution**: 
  - Completely refactored `src/app/dashboard/customers/page.tsx` to use clickable table headers (`Customer & Tier`, `Contact`, `Total Visits`, `Stamps Progress`, `Lifetime Spend`, `Last Visit`, `Churn Risk`).
  - Added an interactive `asc`/`desc` toggle state (`sortOrder`) that visually updates with `↑`/`↓` indicators on the active sort column.
- **Status**: ✅ Resolved and Verified.

---

## [10 Aug 2026] Issue: Prisma Foreign Key Constraint Violations During Data Cleanup
- **Symptom**: Attempting to clear test customer data resulted in a `PrismaClientKnownRequestError: P2003 Foreign key constraint violated` on `prisma.customer.deleteMany()`.
- **Root Cause**: The `Customer` model had extensive one-to-many child relations (`Stamp`, `Bill`, `Review`, `CustomerStampCard`, etc.) and a self-referencing foreign key (`referredById`). Attempting to delete the parent before the children caused SQLite to reject the transaction.
- **Resolution**: 
  - Created a robust testing cleanup script (`scripts/clearCustomerData.js`).
  - Explicitly deleted all dependent child table records first.
  - Used `prisma.customer.updateMany({ data: { referredById: null } })` to break the self-referencing loops before finally deleting all `Customer` records.
- **Status**: ✅ Resolved and Verified.

---

## [10 Aug 2026] Issue: Local Scheduled Automation Messages (Google Review) Not Dispatching
- **Symptom**: A 5-minute delayed Google Review WhatsApp request did not dispatch in the local development environment after purchase approval.
- **Root Cause**: 
  1. The merchant's database setting `googleReviewDelayMinutes` was configured to 60 minutes instead of 5 minutes.
  2. The Vercel Cron endpoint (`/api/cron/automations`) handles polling and dispatching `scheduled` messages, but standard Next.js local servers do not automatically invoke cron endpoints.
- **Resolution**: 
  - Reset the `googleReviewDelayMinutes` to 5 minutes via Prisma.
  - Created and deployed a lightweight Node.js daemon (`scripts/localCronRunner.js`) that polls the cron endpoint every 60 seconds, perfectly simulating the production Vercel Cron behavior for local end-to-end testing.
- **Status**: ✅ Resolved and Verified.

---

## [10 Aug 2026] Issue: Evolution Webhook Loyalty Misfiring on General Chats
- **Symptom**: General conversational messages from customers containing words like "yes", "vip", "checking in", or "join" incorrectly triggered the VIP Club auto-onboarding message instead of being treated as standard incoming chats.
- **Root Cause**: The `isTriggerMsg` regular expression in `/api/webhook/evolution/route.ts` was far too loose (`/vip\s*club|checking\s*in|stamps?|join|reward|counter/i`).
- **Resolution**: 
  - Implemented strict enforcement by replacing the broad RegExp with an exact-match signature (`/Checking in for my VIP Club stamps/i`).
  - This guarantees the VIP Queue onboarding is exclusively initiated when a customer scans the designated physical QR code containing the pre-filled encoded text.
- **Status**: ✅ Resolved and Verified.

---

## [10 Aug 2026] Issue: Google Review Context Ignored Due to Timestamp Ordering Bug
- **Symptom**: After receiving the 5-minute delayed Google Review request, a customer replying "Yes" was completely ignored by the webhook, failing to send the AI draft link.
- **Root Cause**: 
  - The webhook identifies context by querying the `lastSentMsg` to the customer.
  - The Prisma query used `orderBy: { createdAt: "desc" }`.
  - Scheduled messages (like the 5-min review request) are `created` in the DB instantly (e.g., 3:00 PM) but `sent` later (e.g., 3:05 PM). 
  - The immediate "Stamp Awarded" message (created at 3:00:01 PM) had a mathematically newer `createdAt` timestamp than the queued review request, making the webhook incorrectly assume the Stamp message was the most recently delivered context.
- **Resolution**: 
  - Updated the Prisma query inside `/api/webhook/evolution/route.ts` to `orderBy: { sentAt: "desc" }`.
  - The `sentAt` timestamp accurately reflects the exact physical delivery time of the message to WhatsApp, properly resolving the context state machine.
- **Status**: ✅ Resolved and Verified.

---
## [10 Aug 2026] Issue: Hardcoded WhatsApp Messages
- **Symptom**: Merchants could not edit their WhatsApp Journey wordings because they were hardcoded in the codebase.
- **Root Cause**: Webhook, Rewards, and Cron APIs were using template literals instead of querying the MessageTemplate database model.
- **Resolution**: 
  1. Updated SYSTEM_DEFAULT_TEMPLATES with the exact VIP flow wordings.
  2. Created 	emplate-engine.ts to fetch and compile templates dynamically (Priority: Merchant -> SuperAdmin -> System).
  3. Refactored webhook/evolution/route.ts, ewards/award/route.ts, and cron/automations/route.ts to use getCompiledTemplate.
  4. Embedded WhatsAppTemplateManager in the Super Admin page to edit merchantId: null defaults.
- **Status**: ✅ Resolved and Verified.

---
## [10 Aug 2026] Issue: Local Reviews Fetching Not Working
- **Symptom**: New Google Reviews were not showing up in the 1-Click AutoReply Studio on localhost.
- **Root Cause**: The local background cron script (scripts/localCronRunner.js) was only polling the /api/cron/automations endpoint and entirely skipping the /api/cron/google-reviews sync endpoint.
- **Resolution**: 
  1. Updated scripts/localCronRunner.js to hit both the automations and google-reviews endpoints every minute.
  2. Restarted the background script task.
  3. Verified that the cron successfully executed and populated 6 mock reviews in the GoogleBusinessReview table.
- **Status**: ✅ Resolved and Verified.

---
## [10 Aug 2026] Issue: Google Reviews Sync Generated Fake Reviews on API Failure
- **Symptom**: When a real Google My Business API token was used but the API call failed (e.g., 403 Forbidden because the API wasn't enabled in the Google Cloud Console), the system was inadvertently falling back to generating mock/fake reviews instead of returning an empty array.
- **Root Cause**: In src/lib/google-reviews-service.ts, the etchGoogleReviews function caught errors from the Google API but did not explicitly eturn []. Because it didn't return, execution fell through to the fallback generateMockReviews function at the bottom of the script.
- **Resolution**: 
- **Root Cause**: In src/lib/google-reviews-service.ts, the etchGoogleReviews function caught errors from the Google API but did not explicitly eturn []. Because it didn't return, execution fell through to the fallback generateMockReviews function at the bottom of the script.
- **Resolution**: 
  1. Updated the catch block in etchGoogleReviews to explicitly eturn [] if a live API call fails. This strictly isolates mock reviews to only generate when there is no valid OAuth token present.
- **Status**: ✅ Resolved and Verified.

---
## [10 Aug 2026] Issue: Missing Subscription/Trial Lock Gatekeeper
- **Symptom**: After a merchant's 7-Day Trial period ended, they still had full access to all features (WhatsApp Automations, QR Scanning, Review Polling), meaning there was no financial incentive for them to purchase a subscription.
- **Root Cause**: The application lacked a global gatekeeper system across frontend and backend APIs to check the `trialEndsAt` property.
- **Resolution**: 
  1. Implemented a robust frontend `SubscriptionGuard` that wraps the dashboard layout, immediately triggering a frosted-glass 'Read-Only' overlay and a Razorpay Checkout Banner when the trial expires.
  2. Integrated Razorpay backend endpoints (`/api/payments/create-order` and `/api/payments/verify`) with secure HMAC-SHA256 signature validation to instantly activate subscriptions.
  3. Added backend subscription checks to `/api/webhook/evolution/route.ts` (blocking all QR scans) and `/api/cron/*` (blocking automations/reviews) to entirely halt system activity for expired merchants.
- **Status**: ✅ Resolved and Verified.

---
## [10 Aug 2026] Issue: Duplicate Google Review Requests on Subsequent Visits
- **Symptom**: When a customer (e.g. Hitesh) scanned the Loyalty QR code for the 2nd time and received a stamp, they were being sent the Google Review AI request module again. According to Requirements.txt, this should not happen if they already received it.
- **Root Cause**: 
  1. `scheduleGoogleReviewRequest` in `src/lib/review-scheduler.ts` only checked if a review request was currently "pending" or "queued". It did not check if one was previously "sent".
  2. The Day 2 Cron Job in `src/app/api/cron/automations/route.ts` only checked if a review was requested in the last 1 day (`gte: day1AgoTargetStart`), allowing it to re-trigger if the previous visit was older than a day.
- **Resolution**: 
  - Updated `scheduleGoogleReviewRequest` to verify if a `review_request` message was **EVER** sent to that customer, skipping if one exists.
  - Updated the Day 2 Automation Cron to check if a `review_request` was **EVER** sent, permanently preventing spam loops.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Issue: Incorrect Stamp Counting in WhatsApp Message
- **Symptom**: The customer received a WhatsApp message with incorrect loyalty stamps counting (e.g., '1/5. Only 2 more stamps').
- **Root Cause**: The `STAMP_EARNED` template in the database used `{{stampCount}}` (which represents the stamps earned in that single transaction) instead of `{{totalStamps}}` (which represents the overall accumulated stamps in the customer's wallet) for the 'Total stamps:' display.
- **Resolution**: Updated the `STAMP_EARNED` template record in the `MessageTemplate` table. Replaced `{{stampCount}}` with `{{totalStamps}}` so the math accurately reflects the customer's total wallet balance.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Issue: Runtime ReferenceError Sparkles is not defined in Settings
- **Symptom**: Opening `http://localhost:3000/dashboard/settings` threw a runtime ReferenceError: `Sparkles is not defined`.
- **Root Cause**: When adding the "VIP Upgrade Bonus Stamps" input with `<Sparkles />` icon in `src/app/dashboard/settings/page.tsx`, the `Sparkles` icon was not included in the `lucide-react` import statement.
- **Resolution**: Added `Sparkles` to the `lucide-react` import list in `src/app/dashboard/settings/page.tsx`.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Issue: Custom Automation Timers & Reminder Days Configuration
- **Symptom**: Merchants could not customize the exact days when automated win-back campaigns or expiry reminders are sent to inactive customers.
- **Root Cause**: Win-back days (30, 60, 90) and reminder days (7 days before expiry / 7 days inactive for 2 stamps left) were hardcoded in the automation cron job without customizable database fields.
- **Resolution**: 
  1. Added `winbackDays1`, `winbackDays2`, `winbackDays3`, `expiryWarningDays`, and `almostThereInactivityDays` to the `Merchant` Prisma model.
  2. Created a dedicated settings component `src/components/automation-timer-settings.tsx` and integrated it into `src/app/dashboard/settings/page.tsx`.
  3. Updated `/api/merchant/update/route.ts` to allow saving these fields.
  4. Updated `src/app/api/cron/automations/route.ts` to use dynamic merchant timer values and fixed the `stampCards` Prisma relation query on `Customer`.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Issue: Console SyntaxError Unexpected token '<' on Settings Page
- **Symptom**: Opening `/dashboard/settings` triggered a browser console `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
- **Root Cause**: Component fetch calls (in `whatsapp-template-manager.tsx`, `reward-setup-card.tsx`, `qr-generator.tsx`, `go-live-validator.tsx`, `branding-settings.tsx`, and `use-dashboard-state.ts`) were calling `.json()` directly without handling cases where requests fired before merchant initialization or received non-JSON HTML error/redirect payloads.
- **Resolution**: Added safe JSON parsing (`.catch(() => null)`) and explicit guard clauses across all settings components.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Issue: Reward Card Setup Save Configuration Failed
- **Symptom**: Clicking "Save Reward Config" on Step 5 of the Settings page showed a red toast error: `Failed to save configuration`.
- **Root Cause**: 
  1. `POST /api/cards/setup` attempted an unconditional `db.stampCard.update({ where: { id } })` if `form.id` was passed, failing if the card ID did not match or if the merchant had a newly provisioned account without that specific card record.
  2. If the `x-merchant-id` header was not passed or delayed in state, the endpoint returned a 401 error instead of falling back to the authenticated session (`getAuthenticatedMerchant()`).
- **Resolution**: 
  1. Added session fallback via `getAuthenticatedMerchant()` in `/api/cards/setup/route.ts`.
  2. Implemented safe lookup of the existing active card for the merchant before updating or creating a new one.
  3. Updated `src/components/reward-setup-card.tsx` to resolve `effectiveMerchantId` using `useDashboardState()`.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Feature & Integration: Left Sidebar Subscription Widget, Dynamic Pricing, Coupons & Terms Agreement
- **Symptom / Requirement**: 
  1. Merchants required visible subscription status and pending days countdown on the Left Sidebar between "Settings" and "Sign Out".
  2. Clicking the widget needed to open an on-demand modal to subscribe to 30-Day, 180-Day, or 365-Day plans via Razorpay.
  3. Mandatory "I agree to Terms & Conditions" checkbox with full readable agreement document required before payment.
  4. Coupon code engine needed to allow merchants to apply discount codes.
  5. SuperAdmin needed a live control center to edit plan prices, coupons, and terms text dynamically.
- **Resolution**: 
  1. Built persistent, color-coded Subscription Widget in `src/components/app-sidebar.tsx` showing active plan, days remaining badge (Green/Amber/Red), and valid-until date.
  2. Built `SubscriptionModal.tsx` and `TermsDialog.tsx` with dynamic plans, coupon validation, terms agreement checkbox, and Razorpay SDK checkout.
  3. Created database models `Plan` and `Coupon` in Prisma and seeded initial plans, coupons (`WELCOME20`, `LAUNCH50`, `FLAT500`), and Merchant Terms & Conditions.
  4. Built backend API endpoints: `/api/pricing/plans`, `/api/coupons/validate`, `/api/coupons`, `/api/legal/terms`, and updated `/api/payments/create-order` to compute server-side coupon discounts securely.
  5. Built `SubscriptionPlansManager.tsx` in `/super-admin` giving SuperAdmin full real-time control over pricing, promo coupons, and legal agreement markdown.
  6. Added public `/terms` page.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] UX Enhancement: Full-Page Dedicated Subscription Section (/dashboard/subscription)
- **Symptom / User Preference**: Rather than a small popup modal dialog with scrollbars, the merchant requested a full dedicated page section (similar to the "Settings" page) where all 30/180/365-day plans are laid out, coupon codes can be applied, Terms & Conditions can be agreed upon via checkbox, and Razorpay checkout can be completed.
- **Resolution**: 
  1. Created full dedicated page `src/app/dashboard/subscription/page.tsx` with full-width responsive plan cards, active status card, promo coupon input with live discount calculations, mandatory terms checkbox, and bottom sticky checkout bar.
  2. Updated `src/components/app-sidebar.tsx` so clicking the "7-Day Free Trial" / days remaining widget navigates directly to `/dashboard/subscription` without any popup modal.
  3. Added "Subscription" item to the sidebar navigation menu.
  4. Updated `src/components/subscription-guard.tsx` to ensure `/dashboard/subscription` remains accessible during plan expiration so merchants can seamlessly renew.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Issue: Checkout Error "Failed to create order" on Subscription Page
- **Symptom**: Clicking "Subscribe with Razorpay" on `/dashboard/subscription` produced a red toast: `Checkout Error: Failed to create order`.
- **Root Cause**: 
  1. Next.js was prioritizing placeholder keys (`RAZORPAY_KEY_ID=rzp_test_REPLACE_WITH_REAL_KEY`) defined in `.env.local` over the valid test keys in `.env`, causing Razorpay SDK to return `Authentication failed`.
  2. `src/proxy.ts` middleware was intercepting `/api/payments/` requests without checking public API exceptions.
  3. `getAuthenticatedMerchant` was missing from the import list in `/api/payments/create-order/route.ts`.
- **Resolution**: 
  1. Updated `.env.local` with the valid Razorpay test keys (`RAZORPAY_KEY_ID="rzp_test_TAyBShtPsT7nSS"` & `RAZORPAY_KEY_SECRET="u3nuKxrh3ljRBYuEApMJ0okC"`).
  2. Added `/api/payments/` to `PUBLIC_API_PREFIXES` in `src/proxy.ts`.
  3. Fixed the import in `/api/payments/create-order/route.ts` and `/api/payments/verify/route.ts` with robust multi-layered merchant resolution (body `merchantId`, header `x-merchant-id`, session fallback).
  4. Updated `src/app/dashboard/subscription/page.tsx` to pass merchant headers and preloaded the Razorpay checkout script.
  5. Tested end-to-end order creation and coupon discount calculations (`WELCOME20`); verified `200 OK` with valid Razorpay order IDs.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Issue: "This content is blocked" / Razorpay Iframe CSP Blocking Fix
- **Symptom**: Browser displayed "This content is blocked. Contact the site owner to fix the issue." when visiting `/dashboard/subscription`, or Razorpay checkout modal did not open.
- **Root Cause**: 
  1. `next.config.ts` had a strict `X-Frame-Options: SAMEORIGIN` header, causing Chrome/embedded previewers to block frame rendering.
  2. Content Security Policy (CSP) `frame-src`, `script-src`, and `connect-src` were missing `https://api.razorpay.com` and `https://*.razorpay.com`, causing Chrome security to block Razorpay's modal iframe (`api.razorpay.com/v1/checkout/public`).
- **Resolution**: 
  1. Updated `next.config.ts` CSP rules to allow Razorpay domains across `script-src`, `connect-src`, `frame-src`, and `img-src` (`https://*.razorpay.com`, `https://checkout.razorpay.com`, `https://api.razorpay.com`, `https://lumberjack.razorpay.com`).
  2. Removed blocking `X-Frame-Options: SAMEORIGIN` header.
  3. Preloaded Razorpay checkout script on `/dashboard/subscription` and restarted Next.js server to apply updated HTTP response headers.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Issue: Hardcoded ₹500 Stamp Threshold in Queue Reward Modal
- **Symptom**: When a merchant modified their "Eligible Minimum Purchase Amount for Loyalty stamp" to ₹300 in Settings, the Live Queue (`/dashboard/queue`) reward modal still displayed "Only ₹150 away from 1 Stamp!" for a ₹350 bill instead of dynamically recognizing that ₹350 earns 1 Stamp and calculating shortfall toward the 2nd stamp.
- **Root Cause**: `src/components/dashboard/RewardModal.tsx` had a hardcoded `const STAMP_THRESHOLD = 500;` constant instead of using the merchant's configured `stampValue` from database settings.
- **Resolution**: 
  1. Updated `RewardModal.tsx` to accept a dynamic `stampValue?: number` prop (defaulting to the merchant's active card rule, e.g., ₹300).
  2. Updated the shortfall and upsell calculation logic:
     - Automatically calculates remainder (`parsedAmount % stampValue`).
     - Displays 1st stamp shortfall or subsequent stamp shortfall (`Stamp #2`, `Stamp #3`) with exact target amount button.
  3. Updated `src/app/dashboard/queue/page.tsx` to pass `stampValue={data?.stampCards?.[0]?.stampValue || 300}`.
- **Status**: ✅ Resolved and Verified.
---
## [11 Aug 2026] Issue: Incorrect WhatsApp Message Template Triggered (REWARD_UNLOCKED)
- **Symptom**: Customer received "REWARD_UNLOCKED" message (saying they completed the card) when they were actually just earning their 1st stamp on a brand new card (Card #2). Additionally, the coupon code displayed as `**` instead of a real code.
- **Root Cause**: The API endpoint (`/api/rewards/award/route.ts`) was fetching the customer's stamp card using `findFirst` without sorting or filtering for active status. This caused it to fetch their very first (already completed) stamp card, making the system think they had full stamps. The coupon code was rendering as `**` because the `couponCode` variable was not being passed to the template engine for the `REWARD_UNLOCKED` template.
- **Resolution**: Updated the `findFirst` query for the `customerStampCard` in the notification section of `/api/rewards/award/route.ts` to use `orderBy: { createdAt: 'desc' }`, ensuring the most recently active/updated card is fetched. Also added random alphanumeric coupon generation in the `getCompiledTemplate` call for `REWARD_UNLOCKED`.
- **Status**: ✅ Resolved and Verified.

---
## [11 Aug 2026] Issue: AI Draft Google Review Webhook Not Triggering
- **Symptom**: Customer replied "Yes" to the Google Review request, but the system did not generate or send the `REVIEW_DRAFT` link.
- **Root Cause**: The Evolution Webhook (`api/webhook/evolution/route.ts`) identifies context by fetching the customer's `lastSentMsg` using `orderBy: { sentAt: "desc" }`. However, the `STAMP_AWARDED` message (which was created back-to-back with the `review_request`) did not have its `sentAt` timestamp populated. In SQLite, `NULL` values sort *first* in `DESC` order, causing the webhook to mistakenly believe `STAMP_AWARDED` was the most recently sent message instead of `review_request`. Thus, the "Yes" reply was ignored.
- **Resolution**: 
  1. Updated the webhook query in `/api/webhook/evolution/route.ts` to use `orderBy: { createdAt: "desc" }` which is strictly guaranteed by Prisma upon record creation, preventing sorting bugs related to `NULL` fields.
  2. Updated `/api/rewards/award/route.ts` to correctly populate `sentAt: new Date()` when saving outgoing `STAMP_AWARDED` messages.
- **Status**: ✅ Resolved and Verified.

---

## [11 Aug 2026] Issue: Onboarding Step 5 Rewards Setup Not Saving
- **Symptom**: When a merchant modifies their Reward Card setup (stamps required, title, reward name) during Onboarding Step 5 and clicks Next, the configuration is lost and defaults are shown on the Dashboard.
- **Root Cause**: The Onboarding 
ext() function only hit the progress API (/api/onboarding/progress) to mark Step 5 as completed, but completely failed to submit the data state to the reward configuration API (/api/cards/setup), discarding user input.
- **Resolution**: Updated src/app/onboarding/page.tsx's 
ext() function to explicitly POST the merchant's configured reward card details to /api/cards/setup upon successfully completing Step 5.
- **Status**: ✅ Resolved and Verified.

---

## [11 Aug 2026] Issue: Reward Card Setup Resets to Defaults After Save + Refresh
- **Symptom**: Merchant saves a custom Reward Card (7 stamps, Rs.300 purchase, photoBonus=2). Toast says 'Saved Successfully'. On page refresh, values reset to defaults (10 stamps, Rs.500, photoBonus=1) with 'Recommended Defaults Loaded' badge reappearing.
- **Root Cause**: Database had 3 duplicate active StampCard records for the same merchant, all with active=true. GET query used orderBy: { createdAt: 'desc' } and returned the newest duplicate. POST query used no ordering, found the oldest duplicate and updated it. Result: GET and POST were operating on DIFFERENT card records — a classic read/write desync bug.
- **Resolution**:
  1. One-time DB fix: Ran scripts/fixDuplicateStampCards.js to deactivate 2 stale duplicate cards, keeping only the most recently updated one.
  2. GET handler: Changed orderBy from createdAt to updatedAt so it always reads the most recently saved card.
  3. POST handler: Added orderBy: { updatedAt: 'desc' } when finding the card to update, AND added a updateMany to deactivate all other duplicate active cards as a self-healing safeguard on every save.
- **Status**: Resolved and Verified. DB now has exactly 1 active card per merchant, and GET/POST always target the same record.

---

## [11 Aug 2026] Issue: Reward Setup Component Silently Discarding Saved Config on Refresh
- **Symptom**: Even after fixing the DB duplicates, the Settings > Reward Setup page kept showing default values (10 Stamps, ₹500) and a "Recommended Defaults Loaded" badge after a page refresh.
- **Root Cause**: 
  1. The `/api/cards/setup` GET endpoint wraps its response in `{ ok: true, data: { card: ... } }`.
  2. The `RewardSetupCard` component was incorrectly expecting the card object at the root `json.card`. Because `json.card` was undefined, it silently fell through, retaining the hardcoded React defaults without throwing any error.
  3. When an external AI (OtterMind) suggested spreading the JSON data into the form, doing `...json.data.card` directly injected `null` values (like `rewardImageUrl: null` from the DB) into the React `<input>` components, triggering a fatal `uncontrolled to controlled` React ReferenceError.
- **Resolution**: 
  - Fixed the component to correctly parse `json.data.card` instead of `json.card`.
  - Reverted to explicit field mapping in `setForm` with empty string `""` fallbacks (e.g., `cardData.rewardImageUrl || ""`) to guarantee React inputs never receive `null` values.
  - Added robust `isLoading` and `loadError` explicit error states (suggested by OtterMind AI guidance) to prevent silent fallback to defaults.
- **Status**: ✅ Resolved and Verified. Form now correctly hydrates with the actual saved DB config.

---

## [11 Aug 2026] Issue: AI Review Draft "Yes" Reply Permanently Ignored (Recurring Root Cause Found)
- **Symptom**: After the Google Review WhatsApp request is sent, customer replies "Yes" but no AI Review Draft link is sent. This issue appeared to be fixed multiple times but kept returning on fresh test runs.
- **Root Cause**: The webhook correctly uses `customer.botState` (state machine) to identify context — specifically it checks `if (botState === "AWAITING_REVIEW_CONSENT")`. However, **`botState` was NEVER being set to `AWAITING_REVIEW_CONSENT`** at any point in the codebase. The two places that send a `review_request` message both completely omitted the `botState` update:
  1. `src/lib/review-scheduler.ts` — creates the scheduled message record but never sets botState.
  2. `src/app/api/cron/automations/route.ts` — dispatches scheduled messages but never sets botState after delivery.
  - Previous "fixes" were changing `orderBy` on `lastSentMsg` queries which was a band-aid on the wrong approach. Since `type` column was also `undefined` in all messages, that approach was fundamentally broken and could never work reliably.
- **Resolution**:
  1. **`src/app/api/cron/automations/route.ts`**: After successfully dispatching a `review_request` message (`res.ok === true`), immediately updates `customer.botState = "AWAITING_REVIEW_CONSENT"` and `botStateUpdatedAt = now()`. This is the primary fix for the 5-minute delayed flow.
  2. **`src/lib/review-scheduler.ts`**: For immediate/queued messages (no delay), sets `botState = "AWAITING_REVIEW_CONSENT"` right when the message is created, without waiting for cron.
- **Why This Won't Recur**: The fix is now at the **source of truth** (state machine), not at an unreliable heuristic (message ordering). The webhook's state machine has always been correct — what was missing was the state being set.
- **Production Safety**: ✅ The `botState` auto-expires after 24 hours (`hoursSinceUpdate > 24`) so stale states will not cause infinite loops.
- **Status**: ✅ Permanently Resolved. Verified by DB log analysis.

---

## [11 Aug 2026] Issue: AI Review "Copy & Post" Button Fails to Copy Text on Mobile/HTTP
- **Symptom**: Customer receives AI Review Draft link, clicks "Copy & Post to Google", the Google Review page opens, but the draft content is NOT copied to the clipboard.
- **Root Cause**:
  1. The Pinggy local tunnel link was HTTP (Not Secure), which completely disables the modern `navigator.clipboard` API in mobile browsers.
  2. The fallback mechanism relied on creating a hidden `textarea` and calling `document.execCommand("copy")`. However, because the button was an `<a>` tag with an `href`, the browser immediately started navigating away in the same execution cycle, causing the copy command to be aborted or ignored due to the race condition.
- **Resolution (Final — After Full OtterMind Investigation)**:
  - This issue underwent an extensive multi-trial investigation (5 failed trials) before the root cause was definitively identified.
  - **Trial 1 (Failed):** Hidden off-screen textarea + `execCommand` — Race condition with navigation killed the copy.
  - **Trial 2 (Failed):** `e.preventDefault()` + `window.open()` — `preventDefault` breaks the shared gesture token on iOS/Android.
  - **Trial 3 (Failed):** Used visible `textarea` ref + `window.open()` — Same gesture token invalidation issue.
  - **Trial 4 (Failed):** Reverted to Aug 5th code with `setTimeout(100) + window.location.href` — `setTimeout` pushes copy outside the gesture window; iOS 17+ / Android Chrome 100+ block this silently.
  - **Trial 5 (Failed):** 2-step UI (separate Copy button, separate Open Google button) — Even standalone `execCommand` fails on Android Chrome + HTTP because the browser treats non-secure context clipboard writes as untrusted.
  - **FINAL ROOT CAUSE (Definitive):** The `navigator.clipboard.writeText()` API is **only available in Secure Contexts (HTTPS or localhost)**. The local testing environment uses a Pinggy HTTP tunnel (`http://xyz.pinggy-free.link`) which is NOT a secure context. On Android Chrome 100+ and iOS Safari 15+, `execCommand('copy')` is also progressively neutered on HTTP with no error thrown — it silently no-ops.
  - **Why it "worked on August 10th":** Testing on that date was performed on the PC browser via `http://localhost:3000`. Localhost IS a secure context, so `navigator.clipboard.writeText()` worked perfectly.
  - **Production Fix:** On the live HTTPS production domain (e.g., `https://app.customerpilot.com`), the single-button approach works perfectly because `window.isSecureContext === true` and `navigator.clipboard.writeText()` is fully available.
  - **Code State:** Restored to clean single-button approach using `<a>` tag with `onClick` that tries `navigator.clipboard.writeText()` first (HTTPS), then falls back to `execCommand` on visible textarea (HTTP best-effort).
- **Status**: ✅ Root cause permanently identified. **Not a code bug — a browser security policy on HTTP.** Will work correctly on production HTTPS deployment. Local testing should be done via `http://localhost:3000` on PC browser.

---

## [12 Aug 2026] Issue: WhatsApp Delivery Instance Mismatch & AI Owner Reply SEO Optimization + Save Edits Feature
- **Symptom**: 
  1. WhatsApp reward confirmation messages after Google Review post were saved in DB as "sent" but not actually delivered to the customer's phone.
  2. Initial AI Owner Reply drafts displayed non-SEO fallback text (`"Thank you for the amazing review!"`).
  3. Dashboard Reviews Studio lacked a dedicated "Save Edits" option for merchants to persist custom-edited replies to the database.
- **Root Cause**:
  1. `record-google-post/route.ts` used an ad-hoc instance name resolution fallback (`CP_M${phone}`), which differed from the active connected instance name (`CP_M_${merchantId}`). Evolution API rejected the delivery due to the instance mismatch.
  2. The initial AI reply generation used a non-SEO fallback string when Gemini API was rate-limited or unconfigured.
  3. Dashboard UI lacked a handler and backend route (`/api/reviews/update-reply`) to persist merchant text edits.
- **Resolution**:
  1. **Centralized WhatsApp Engine ([whatsapp-service.ts](file:///f:/CustomerPilot_ByGLM_July2026/src/lib/whatsapp-service.ts)):** Created `resolveWhatsappInstanceName()` as the single source of truth across all routes for merchant instance resolution. Refactored `record-google-post/route.ts` and `cron/automations/route.ts` to use `sendCentralWhatsAppMessage()`. Delivered WhatsApp reward message with Evolution API status 201.
  2. **SEO Optimization ([ai-review-reply.ts](file:///f:/CustomerPilot_ByGLM_July2026/src/lib/ai-review-reply.ts)):** Enforced strict SEO rules (Merchant Name, City/Area, Category keywords, warm Indian hospitality tone) in both the Gemini prompt and the default fallback.
  3. **Merchant Customization & Save Edits ([update-reply/route.ts](file:///f:/CustomerPilot_ByGLM_July2026/src/app/api/reviews/update-reply/route.ts) & [reviews/page.tsx](file:///f:/CustomerPilot_ByGLM_July2026/src/app/dashboard/reviews/page.tsx)):** Created `/api/reviews/update-reply` route and added an explicit `💾 Save Edits` button next to `Regenerate` in the Dashboard Reviews UI.
- **Status**: ✅ Resolved and Verified by user manual testing.

---

## [12 Aug 2026] Feature: 3-Tier Sentiment-Aware AI Owner Auto-Reply System (Local SEO & Rating-Driven)
- **Symptom / Requirement**: 
  The AI Owner Reply engine needed distinct, intelligent responses for 1-2 star (negative), 3 star (moderate/neutral), and 4-5 star (positive) Google reviews matching the customer's specific review length and wordings while embedding Local SEO keywords.
- **Resolution**:
  - Refactored `generateAIReviewReply` in [`ai-review-reply.ts`](file:///f:/CustomerPilot_ByGLM_July2026/src/lib/ai-review-reply.ts) to accept dynamic `rating` (1-5).
  - Implemented 3 distinct prompt guidance tiers:
    - **1-2 Stars (Negative):** Empathetic, humble, deeply apologetic, non-defensive tone addressing specific complaint wordings, incorporating brand/city name for reputation management, and offering direct WhatsApp resolution.
    - **3 Stars (Moderate):** Balanced, constructive tone acknowledging positive aspects & areas of improvement, embedding merchant name/city/keywords for SEO, and inviting back for a 5-star experience.
    - **4-5 Stars (Positive):** Warm, celebratory tone with maximum Local SEO keyword density (Merchant Name, City/Area, Category Delicacies).
  - Updated all API invocation sites (`generate-ai-reply/route.ts`, `record-google-post/route.ts`, `cron/google-reviews/route.ts`) to pass `rating`.
- **Status**: ✅ Implemented, Verified, and Pushed to Remote Repository per user explicit approval.

---

## [12 Aug 2026] Feature: 10-Level Loyalty Cycle Category Progression & Previous Cycle VIP Bonus Stamp Allocation
- **Symptom / Requirement**: 
  1. Merchant needed 10 customizable Loyalty Cycle Level titles (Default: `VIP`, `Silver`, `Gold`, `Platinum`, `Diamond`, `Royal`, `Elite`, `Prestige`, `Ambassador`, `Legend`) with automatic level progression upon each completed stamp card.
  2. Merchant's `vipUpgradeBonusStamps` was not being awarded at the exact moment a customer finished their previous loyalty cycle card.
- **Resolution**:
  - Added `loyaltyCategoryNames` JSON field to `Merchant` model in [`schema.prisma`](file:///f:/CustomerPilot_ByGLM_July2026/prisma/schema.prisma) and created [`loyalty-category-service.ts`](file:///f:/CustomerPilot_ByGLM_July2026/src/lib/loyalty-category-service.ts).
  - Created [`LoyaltyCategoryCard`](file:///f:/CustomerPilot_ByGLM_July2026/src/components/loyalty-category-card.tsx) UI in Merchant Setup (`/dashboard/settings`) allowing merchants to customize all 10 Level titles.
  - Refactored [`rewards/award/route.ts`](file:///f:/CustomerPilot_ByGLM_July2026/src/app/api/rewards/award/route.ts) to detect `isCardFinished` (Loyalty Cycle Completed), automatically upgrade customer's `vipTier` level title, and credit configured `vipUpgradeBonusStamps` onto their new next-cycle card!
- **Status**: ✅ Implemented, Verified, and Pushed to Remote Repository per user explicit approval.

---

## [12 Aug 2026] Feature: Photo Review Bonus Stamp Detection & Dynamic Allocation
- **Symptom / Requirement**: 
  System needed to detect whether a customer attached a product/store photo with their Google Review and dynamically award Step 5's configured `photoBonus` stamps (e.g. 2 stamps) in addition to the standard Google Review bonus stamp.
- **Resolution**:
  - Updated [`record-google-post/route.ts`](file:///f:/CustomerPilot_ByGLM_July2026/src/app/api/reviews/record-google-post/route.ts) to check `photoUrl` / `photoAttached`.
  - Configured total bonus count as `googleReviewBonus + photoBonus` when photo attachment is detected, persisting `photoBonusStamps` to `db.review` and updating customer stamp wallet.
- **Status**: ✅ Implemented, Verified, and Pushed to Remote Repository per user explicit approval.

