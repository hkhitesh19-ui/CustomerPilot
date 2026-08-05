# CustomerPilot — Forensic Bug Log & Prevention Registry (`BUGS_LOG.md`)

This log maintains a comprehensive forensic record of all runtime bugs, schema mismatches, logic errors, and client/server discrepancies discovered during development and manual testing. 

Each entry details the exact symptom, root cause analysis, resolution steps, and mandatory prevention rules to prevent recurrence.

---

## 🛠️ Mandatory Prevention Protocol for Future Development

1. **Strict Client-Side & Server-Side Compilation Verification:**
   - After any edit to TS/TSX files, run `npx tsc --noEmit` to ensure zero scope mismatches or typo variables reach the browser.
2. **Schema & Database Synchronization:**
   - Whenever `prisma/schema.prisma` is modified, execute `$env:DATABASE_URL="file:F:/CustomerPilot_ByGLM_July2026/prisma/dev.db"; npx prisma db push --accept-data-loss` followed by `npx prisma generate`.
   - On Windows OS, ensure Next.js dev server processes are stopped before `npx prisma generate` to prevent `EPERM` DLL file locks.
3. **Explicit Error Messages:**
   - Never return generic error messages like `'Registration failed'` or `'Server error'`. Always return exact diagnostic reasons to the UI.

---

## 📋 Comprehensive Bug History

### 1. `BUG-001`: Runtime `ReferenceError: merchant is not defined` on Dashboard Page
- **Symptom:** Opening `http://localhost:3001/dashboard` threw a client-side runtime `ReferenceError: merchant is not defined` at `src/app/dashboard/page.tsx:275`.
- **Component / File:** `src/app/dashboard/page.tsx`
- **Root Cause Analysis:** `useDashboardState()` hook returned data as `{ data: { merchant, ... } }`. The page component destructuring declared `const { data } = useDashboardState()`, but on line 275 passed `merchantId={merchant?.id}` instead of `data?.merchant?.id`.
- **Resolution Implemented:** Corrected variable reference on line 275 from `merchant?.id` to `data?.merchant?.id || ""`.
- **Prevention Rule:** Run `npx tsc --noEmit` before closing any UI feature turn. Strictly verify destructuring variable names against state hook types.

---

### 2. `BUG-002`: System Awarding 0 Stamps on Bills Below Minimum Threshold
- **Symptom:** Approving a bill of ₹480 (threshold ₹500) resulted in awarding `0 Stamps` and closing the modal without feedback.
- **Component / File:** `src/app/api/rewards/award/route.ts` & `src/components/dashboard/RewardModal.tsx`
- **Root Cause Analysis:** Reward calculation used `Math.floor(amount / threshold)`, returning 0 for sub-threshold amounts without triggering upsell recommendation logic specified in `Requirements.txt`.
- **Resolution Implemented:** Added Smart Upsell logic. When `amount < threshold`, API returns HTTP status `422` with `isUpsellTriggered: true`, shortfall amount (`shortfall = threshold - amount`), and staff upsell pitch script. UI displays a Smart Upsell banner with a single-tap **"Add ₹X & Award 1 Stamp"** button.
- **Prevention Rule:** Implement validation boundaries before DB persistence. Never create zero-value reward entries; prompt staff with upsell recommendations.

---

### 3. `BUG-003`: Generic `'Registration failed'` Masking Database & Duplicate Field Errors
- **Symptom:** Submitting registration on `http://localhost:3001/signup` displayed generic error string `"Registration failed. Please try again."` when an email or phone number was already registered.
- **Component / File:** `src/app/api/auth/register/route.ts` & `src/app/signup/page.tsx`
- **Root Cause Analysis:** Catch block swallowed Prisma constraint errors and returned generic string response.
- **Resolution Implemented:** Refactored `/api/auth/register/route.ts` to perform explicit duplicate checks (`User.findUnique({ email })` and `Merchant.findFirst({ whatsappPhone })`) returning actionable error messages (e.g. `'An account with email order.cakeconnection@gmail.com already exists.'`) and a direct **[Login Now ➔]** action link.
- **Prevention Rule:** Always return human-readable diagnostic error strings in API error responses.

---

### 4. `BUG-004`: Missing Column `main.Merchant.userId` in SQLite Database
- **Symptom:** `/api/auth/login` and `/api/auth/register` failed with HTTP 500 error: `PrismaClientKnownRequestError: The column main.Merchant.userId does not exist in the current database.`
- **Component / File:** `prisma/schema.prisma` & SQLite `dev.db`
- **Root Cause Analysis:** Schema added a `@unique` relation `userId` on `Merchant`, but the local SQLite database file `dev.db` was not forcefully synchronized with Prisma Client in-memory bindings.
- **Resolution Implemented:** Executed `$env:DATABASE_URL="file:F:/CustomerPilot_ByGLM_July2026/prisma/dev.db"; npx prisma db push --force-reset --accept-data-loss` and `npx prisma generate`. Re-seeded user account.
- **Prevention Rule:** When modifying schema relations, always execute `npx prisma db push --accept-data-loss` with explicit database environment URL pathing.

---

### 5. `BUG-005`: Single Shared WhatsApp Instance vs Multi-Tenant Merchant Isolation
- **Symptom:** All merchant accounts shared a single Evolution WhatsApp instance (`CustomerPilot_Main`), causing WhatsApp messages for all merchants to send from one single phone number.
- **Component / File:** `src/communication/adapters/evolution/index.ts`, `src/app/api/whatsapp/connect/route.ts`, `src/app/onboarding/page.tsx`
- **Root Cause Analysis:** Evolution API service hardcoded instance name to `CustomerPilot_Main` instead of creating dedicated instances (`merchant_[id]`) per merchant on signup.
- **Resolution Implemented:** 
  1. Added `whatsappInstanceName` column to `Merchant` model.
  2. Built `/api/whatsapp/connect` to automatically trigger `POST /instance/create` for `merchant_[id]` on Evolution API.
  3. Updated `EvolutionService` to send messages using the merchant's dedicated instance with automatic fallback.
  4. Redesigned Onboarding Step 2 to display a scannable 250x250 live QR code with auto-polling.
- **Prevention Rule:** Ensure all external API communication adapters respect multi-tenant merchant isolation.

---

### 6. `BUG-006`: `EPERM` Query Engine DLL File Lock During Prisma Generation on Windows
- **Symptom:** Running `npx prisma generate` while Next.js dev server was active failed with: `EPERM: operation not permitted, rename query_engine-windows.dll.node`.
- **Component / File:** `node_modules/.prisma/client/query_engine-windows.dll.node`
- **Root Cause Analysis:** On Windows OS, active Node.js processes hold exclusive file locks on C++ binary DLLs (`.node`), preventing `prisma generate` from overwriting the file.
- **Resolution Implemented:** Terminated active Node.js processes (`Get-Process -Name "node" | Stop-Process -Force`), executed `npx prisma generate`, and restarted Next.js dev server.
- **Prevention Rule:** Stop active dev server processes before running binary generator scripts on Windows.

---

### 7. `BUG-007`: In-Memory Cached Prisma Client in Running Next.js PowerShell Window
- **Symptom:** Submitting registration threw `The column main.Merchant.userId does not exist in the current database` even after running schema push.
- **Component / File:** `F:\CustomerPilot_ByGLM_July2026\node_modules\.prisma\client` & `src/lib/db.ts`
- **Root Cause Analysis:** On Windows OS, a running `npx next dev` terminal process holds a file lock on `query_engine-windows.dll.node` and caches the old `PrismaClient` in memory (`globalThis.prisma`). Running `npx prisma generate` fails silently or fails to update active memory until the user stops the Next.js process with `Ctrl + C`.
- **Resolution Implemented:** Instruct user to press `Ctrl + C` in PowerShell to stop Next.js, run `npx prisma generate`, and restart Next.js server (`npx next dev -p 3001`).
- **Prevention Rule:** Whenever database schema or Prisma relations change, always stop the running Next.js dev server first (`Ctrl + C`) before starting `npx next dev`.

---

### 8. `BUG-008`: Raw WhatsApp Baileys `2@...` Pairing String Unscannable Image Issue
- **Symptom:** Scanning Step 2 QR Code using WhatsApp Linked Devices failed, and external scanners showed raw string starting with `2@ilRL+A3pT...`.
- **Component / File:** `src/app/api/whatsapp/connect/route.ts` & `src/app/onboarding/page.tsx`
- **Root Cause Analysis:** Evolution API returned the raw WhatsApp Baileys pairing string (`2@ilRL+...`) instead of pre-rendered image base64. Treating the raw string as base64 produced a broken, un-scannable QR image. Also, `pairingCode` box displayed the raw QR string.
- **Resolution Implemented:** 
  1. Utilized server-side `QRCode.toDataURL(rawCode)` in `/api/whatsapp/connect` to convert raw Baileys pairing strings into high-contrast, official PNG Data URLs.
  2. Filtered `pairingCode` so raw `2@...` strings are ignored and only valid short pairing codes are shown.
  3. Removed QR image auto-refresh UI flickering as requested.
- **Prevention Rule:** Validate base64 image prefixes before rendering. Convert raw protocol pairing strings using dedicated QR code generators.

---

### 9. `BUG-009`: Evolution API Webhooks Failing on Dev Server Restart (Tunnel Fragility)
- **Symptom:** During manual QR testing, customer scans (e.g. `4012`) were not reaching the database.
- **Component / File:** Evolution API Manager & Webhook Tunnel Setup
- **Root Cause Analysis:** The Next.js dev server relied on Cloudflare Quick Tunnels (`trycloudflare.com`). Upon any terminal restart, a new random URL was generated. Evolution API was still configured with the old, dead URL. When the customer scanned the QR code, Evolution API attempted to POST to the dead link and dropped the payload permanently (since it lacks an infinite dead-letter queue for webhooks).
- **Resolution Implemented:** 
  1. A background `start_tunnel_only.ps1` script was created to launch the tunnel independently from the IDE.
  2. Implemented `autoWebhookSync.js` to automatically extract the new Cloudflare URL on startup and `POST` it to Evolution API. 
  3. (Current Fix state): Because Evolution API's instance name was dynamic (`CP_M...`) or manually modified (`8955...`), the hardcoded script failed. The user must manually paste the active tunnel URL into Evolution API Manager.
- **Prevention Rule:** 
  1. **Dynamic Webhooks vs Global Webhooks:** In a Multi-Tenant architecture where instances are created dynamically (`CP_M917...`), webhooks should be configured globally OR updated dynamically across all instances.
  2. **Production Infrastructure:** Never use randomized Quick Tunnels (`trycloudflare.com`) or unreliable free tunnels (`loca.lt`) for webhook infrastructure in production. Always use a Fixed/Named Cloudflare Tunnel bound to a real Domain Name.

---

*Last Updated: July 31, 2026*
