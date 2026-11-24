# SMOKE_TESTS.md (CustomerPilot v1.0)

Run after EVERY agent change, before merge or deployment.
Default Test Merchant: **Cake Connection** (`cmtymavfx0002kx008lbfvp57` / `c/cake-connection`).
Mark ✅/❌. Any ❌ = REVERT commit or fix before proceeding.

---

## Quick Run (Automated Smoke Tests: `npm run smoke`)

Execute via command:
```bash
node scripts/run_smoke_tests.js
```

| # | Test Name | Target Route / Command | Expected Behavior |
|---|---|---|---|
| 1 | **Build & TypeScript** | `npx tsc --noEmit` | 0 fatal syntax errors, strict type safety |
| 2 | **Auth Guard** | `GET /dashboard` (Logged out) | HTTP 307/302 Redirect to `/login` |
| 3 | **Digital Card** | `GET /c/cake-connection` | HTTP 200, renders store brand and catalog |
| 4 | **Referral Link** | `GET /c/cake-connection?ref=CP-4707` | HTTP 200, renders VIP Referral Welcome Hero Card |
| 5 | **Referral Claim API** | `POST /api/referrals/claim` | Returns JSON status (validates phone & code) |
| 6 | **Dynamic QR Standee** | `GET /api/qr/standee?m=cmtymavfx0002kx008lbfvp57` | HTTP 200, dynamic SVG/PNG standee generated |
| 7 | **Customers CRM API** | `GET /api/customers` (Logged out) | HTTP 401 Unauthorized (Protected RBAC) |
| 8 | **Manual Stamp API** | `POST /api/customers/manual-stamps` (Logged out) | HTTP 401 Unauthorized (Protected Merchant Auth) |
| 9 | **Maw & Paw Digital Card** | `GET /c/mawpaw` | HTTP 200, renders store brand and catalog |
| 10 | **Destructive Guard Proof** | `GET /api/health` (`destructive: true`) | SKIPPED on live; RUNS under `smoke:local` sandbox |

---

## Full End-to-End Retail Journey (Manual / UAT Verification)

| # | Area | Action / Flow | Expected Outcome |
|---|---|---|---|
| 9 | **QR Check-in** | Customer scans Standee QR at shop counter | WhatsApp prompt sent, customer captured in Live Queue |
| 10 | **Stamp Approval** | Merchant taps "Give Reward" in Live Queue | +1 Stamp credited, instant WhatsApp receipt received |
| 11 | **Referral Flow** | Customer shares link `c/cake-connection?ref=CP-4707` | Friend enters phone, activates pass, earns +1 Welcome Stamp on visit |
| 12 | **Google Review** | Customer clicks review link from WhatsApp | Opens review page, prompts 5-star rating + photo bonus |
| 13 | **Instagram Follow** | Customer taps "Follow on Instagram" in Wallet | Direct store profile page opens with blue Follow button |
| 14 | **POS Billing** | Merchant enters items and prints receipt | Thermal PDF generated, sent to customer WhatsApp |
| 15 | **Manual Stamp Override**| Merchant taps `[ ⚡ Manual Stamp ]` in Queue/CRM | Custom stamps (`+1`, `+2`, `+5`) credited with WhatsApp alert |

---

## Regression Ripple Matrix (Touch X ➔ Re-Test Y)
- If touching **`src/proxy.ts`** or auth ➔ Run Tests #2, #7, #8.
- If touching **`src/lib/referral-resolver.ts`** or `c/[slug]` ➔ Run Tests #3, #4, #5.
- If touching **`src/app/api/qr/**`** or Standee ➔ Run Test #6.
- If touching **`src/lib/queue-engine.ts`** ➔ Run Tests #9, #10.
- If touching **Prisma Schema** ➔ Run Full Adversarial Guard + Tests #1 through #8.
