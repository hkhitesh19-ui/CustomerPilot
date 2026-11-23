# PROTECTED_FILES.md (CustomerPilot v1.0)

> **Agent Rule**: Files below are **READ-ONLY** unless the task explicitly names them.
> Before editing a protected file: state why, show planned diff, and wait for user approval.
> Path names reflect CustomerPilot's real repository structure (`src/...`).

## Agent Rules (Permanently Binding on Antigravity & AI Agents)
1. Touch ONLY files named in the user request. Everything else is read-only.
2. No refactor, rename, "cleanup", dependency or schema change unless explicitly requested.
3. No try/catch, `any`, or `@ts-ignore` to hide errors. Find and solve the root cause.
4. Never rename `merchantId` / `Merchant`. Canonical = `Merchant`, `merchantId`.
5. After change: run `node scripts/run_adversarial_guard.js` and `npm run smoke`. Report pass/fail.
6. Output: list of changed files + 1-line reason each.

---

## Tier 1: Never Edit Without Explicit User Approval (Frozen Core)
| Area | Path in CustomerPilot | Purpose |
|---|---|---|
| Prisma schema | `prisma/schema.prisma` | Core database entities and relations |
| Migrations | `prisma/migrations/**` | Production database state history |
| Auth & Security | `src/proxy.ts`, `src/app/api/auth/**`, `src/lib/auth.*` | JWT, RBAC, public route bypass filters |
| DB client | `src/lib/db.ts` | Global Prisma Client singleton |
| Env/config | `.env*`, `next.config.ts`, `tsconfig.json` | Environment variables and compiler rules |
| Razorpay billing/webhook | `src/app/api/razorpay/**`, `src/lib/subscription.*`, `src/lib/plans.*` | Payment verification and plan state |
| Evolution API (WhatsApp) client | `src/app/api/webhook/evolution/**`, `src/communication/**` | Live WhatsApp messaging pipeline |
| Queue & Stamp Engines | `src/lib/queue-engine.ts`, `src/lib/stamp-engine.ts` | Core retail check-in and loyalty mathematics |

---

## Tier 2: Edit Only When Task is Specifically About That Feature
| Feature | Path in CustomerPilot |
|---|---|
| QR Standee Studio & Artwork | `src/app/api/qr/**`, `src/components/standee/**` |
| Referral Engine | `src/app/api/referrals/**`, `src/lib/referral-resolver.ts`, `src/app/c/[slug]/page.tsx` |
| Rewards / Loyalty Matrix | `src/app/api/rewards/**`, `src/lib/loyalty-category-service.ts` |
| Customers CRM / SuperAnalytics | `src/app/dashboard/customers/**` |
| Google Review + AI Reply (Groq/Gemini) | `src/app/api/reviews/**`, `src/lib/google-reviews-service.ts` |
| Automation Timers & Cron | `src/app/api/cron/**`, `src/lib/review-scheduler.ts` |
| Digital Business Card | `src/app/c/[slug]/**`, `src/components/digital-card-view.tsx` |
| Itemized Billing & POS | `src/app/dashboard/billing/**`, `src/lib/invoice-pdf-generator.ts` |

---

## Tier 3: Free to Edit
UI copy, Tailwind styles, marketing landing pages, ROI calculator (`src/app/roi/**`), documentation (`*.md`), scripts in `scripts/`.

---

## Shared Contracts (Change = Ripple Risk)
- **Phone**: Common key between QR scan and billing. Format: 10-digit clean digits (`normalizePhone`).
- **Customer Unique**: `Customer @@unique([phone, merchantId])`.
- **Stamp & Reward Rules**: Must come from merchant's active `StampCard` rule, never hardcoded numbers.
- **Trial Period**: 3 days default trial unless extended in SuperAdmin.

---

## Mechanical Locks Enforced in Repo

1. **`.frozen-paths`**: Read by Gate 7 of `scripts/run_adversarial_guard.js` and Git pre-commit hook.
2. **Pre-commit Guard**: `node scripts/run_adversarial_guard.js` blocks any unauthorized commit touching frozen files with exit code 1.
3. **Smoke Tests**: `node scripts/run_smoke_tests.js` executes 8 deterministic checks verifying Auth, Referral, QR, and CRM health.
