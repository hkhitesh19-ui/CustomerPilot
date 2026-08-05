# CustomerPilot V6 — Stamps-Based Loyalty System

Production-ready founder manual + demo application for a **stamps-based** merchant
loyalty system (NOT points). Built with Next.js 16, TypeScript, Tailwind CSS 4,
shadcn/ui, Prisma + SQLite.

## V6 — What's New (audit-response release)

V6 addresses all 11 audit points from the ChatGPT review:

1. **2-Minute Onboarding** — Signup -> default card auto-created -> POS ready. No setup friction.
2. **Optional Customer Import** — Skip / Manual / Excel / Phone contacts. No CSV required.
3. **Fast Bill Entry** — Last-4-digits search + Recent customers row + Favorites row + QR.
4. **Stamp Card History** — Lifetime cards, achievements timeline, redemption history per customer.
5. **Merchant Daily Dashboard** — Morning briefing, mid-day pulse, end-of-day close.
6. **Customer Psychology** — VIP tiers (Silver/Gold/Platinum), streaks, milestones, achievements.
7. **Win-back Escalation** — 30 / 45 / 60 / 90 day ladder with owner escalation.
8. **Google Review Engine (RESTORED)** — AI drafts, bonus stamps, photo bonus, reputation score.
9. **Birthday Journey** — 7-day reminder, 7-day redemption window, bonus stamps.
10. **10 New Operational Stories** — First refund, lost WhatsApp, duplicate customer, festival rush, staff resigns, etc.
11. **Documentation Split** — Founder Manual (business, NO API) + Developer Manual (API/DB/state machines).

## Documentation (in /docs folder)

- **CustomerPilot-V6-Founder-Manual.pdf** — 21 chapters, business narrative only. For founders and ops managers.
- **CustomerPilot-V6-Developer-Manual.pdf** — 16 chapters, API/DB/state machines. For developers.

Both manuals are also browsable in-app: Founder Manual tab + Developer Manual tab.

## Run it locally

```bash
bun install                  # or npm install
echo 'DATABASE_URL=file:./db/custom.db' > .env
bun run db:push              # create SQLite schema
bun run src/lib/seed.ts      # seed demo merchant + 6 customers + sample data
bun run dev                  # start Next.js dev server on :3000
open http://localhost:3000
```

## Demo credentials

| Role     | Name               | PIN  |
|----------|--------------------|------|
| Owner    | Ravi (Owner)       | 1111 |
| Manager  | Sunita (Manager)   | 2222 |
| Cashier  | Priya (Cashier)    | 3333 |

Demo merchant: **Sweet Crumb Bakery** (cake shop). 6 seeded customers including Gold/Platinum VIPs, dormant, and churned. 4 Google reviews (2 submitted, 1 draft ready, 1 requested). 3 birthday schedules (1 ready this week). 2 win-back escalations. 10 achievements across customers. 1 support ticket (resolved).

## Tech stack

| Layer      | Choice                                  |
|------------|-----------------------------------------|
| Framework  | Next.js 16 (App Router)                 |
| Language   | TypeScript 5                            |
| Styling    | Tailwind CSS 4 + shadcn/ui (New York)   |
| Database   | Prisma ORM + SQLite                     |
| Animation  | Framer Motion                           |
| Icons      | lucide-react                            |

## File structure

```
src/
├── app/
│   ├── page.tsx                    # SPA with 19 views
│   ├── manual-views.tsx            # Founder Manual + Developer Manual + Review/Birthday/VIP/WinBack/Support views
│   ├── layout.tsx
│   └── api/
│       ├── state/route.ts          # GET — full snapshot (V6: includes reviews, birthdays, vipTiers, winBacks, achievements, supportTickets, onboardingSteps)
│       ├── bills/route.ts          # POST — create bill
│       ├── bills/void/route.ts     # POST — void (manager+)
│       ├── bills/refund/route.ts   # POST — refund (manager+)
│       ├── customers/route.ts      # POST — create (duplicate prevention)
│       ├── customers/import/route.ts
│       ├── customers/block/route.ts
│       ├── customers/favorite/route.ts   # V6
│       ├── customers/notes/route.ts      # V6
│       ├── cards/route.ts
│       ├── rewards/route.ts
│       ├── rewards/redeem/route.ts
│       ├── referrals/route.ts
│       ├── referrals/approve/route.ts
│       ├── referrals/flag/route.ts
│       ├── reviews/route.ts              # V6
│       ├── reviews/draft/route.ts        # V6 — AI draft generation
│       ├── reviews/submit/route.ts       # V6 — submit + bonus stamps
│       ├── birthdays/route.ts            # V6
│       ├── birthdays/redeem/route.ts     # V6
│       ├── winback/route.ts              # V6
│       ├── support/route.ts              # V6
│       ├── onboarding/route.ts           # V6
│       ├── staff/route.ts
│       ├── rbac/check/route.ts
│       └── seed/route.ts
├── lib/
│   ├── db.ts
│   ├── rbac.ts                     # Role -> Permission matrix
│   ├── stamp-engine.ts             # Stamp award + spend + churn-risk
│   ├── vip-engine.ts               # V6 — VIP tiers + bonus multiplier
│   ├── winback-engine.ts           # V6 — 30/45/60/90 day escalation
│   ├── review-engine.ts            # V6 — AI draft + reputation score
│   ├── birthday-engine.ts          # V6 — birthday scheduling
│   ├── onboarding-engine.ts        # V6 — 2-minute fast-start
│   ├── types.ts
│   ├── api.ts
│   ├── founder-manual.ts           # V6 — 21 chapters (was 9 in V5)
│   ├── developer-manual.ts         # V6 — 16 chapters (NEW)
│   └── seed.ts                     # V6 seed (Sweet Crumb Bakery)
└── components/ui/                  # shadcn/ui components

prisma/
└── schema.prisma                   # V6: 21 models (was 13 in V5)
                                    # New: Review, Birthday, VipTier, WinBackEscalation,
                                    #      Achievement, SupportTicket, OnboardingStep

docs/                               # PDFs (also in /download)
├── CustomerPilot-V6-Founder-Manual.pdf
└── CustomerPilot-V6-Developer-Manual.pdf
```

## V5 vs V6 comparison

| Aspect | V5 | V6 |
|--------|----|----|
| Founder Manual chapters | 9 | 21 |
| Developer Manual | None | 16 chapters |
| In-app views | 13 | 19 |
| DB models | 13 | 21 |
| API routes | 16 | 24 |
| Google Review Engine | Missing | Restored (6 scenes) |
| Birthday Journey | Missing | Added (5 scenes) |
| VIP Tiers | Missing | Added (Silver/Gold/Platinum) |
| Win-back Escalation | Single 35-day touch | 30/45/60/90 day ladder |
| Onboarding | 5-step wizard | 2-minute fast-start + progressive checklist |
| Bill Entry | Name search only | Last-4 + Recent + Favorites + QR |
| Customer Psychology | None | VIP tiers, streaks, achievements, milestones |

## Notes

- The app is single-tenant (first merchant found) for the demo. Multi-tenant: every query filters by `merchantId`.
- WhatsApp messages are simulated (queued/sent/delivered/failed/delayed).
- AI review drafts are template-based in the demo. In production, swap for an LLM call.
- Subscription payment-failure edge case is modeled but pre-set to `active` in the seed.
