# CustomerPilot — WhatsApp-Based Digital Loyalty & Review SaaS

> **Audited Ground-Truth Documentation**  
> Verified against production source code, Prisma schema (`schema.prisma`), and API endpoints.

CustomerPilot is a **WhatsApp-first, stamps-based loyalty and Google Review automation platform** designed for local physical businesses (cafes, bakeries, salons, restaurants). Instead of forcing customers to download an app, it manages digital stamp cards, reward redemption, and review generation seamlessly via **WhatsApp** and **QR Code workflows**.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components, TypeScript 5 |
| **Styling** | Tailwind CSS 4 | shadcn/ui, Framer Motion, Lucide Icons |
| **Database** | Prisma ORM + SQLite | Multi-merchant tenant architecture |
| **WhatsApp Engine** | Evolution API | Direct socket webhook integration (`/api/webhook/evolution`) |
| **Google Reviews** | Google Places & My Business API | Automated review solicitation & AI reply generation |
| **Tunneling / Sync** | Pinggy / ngrok | Live webhook synchronization for local dev & VPS |

---

## ⚡ Ground-Truth Feature Audit (What is Live vs. What is Planned)

### ✅ 1. Live & Fully Functional Features

* **QR-Driven Counter Live Queue (`/dashboard/queue`):**
  * Customer scans the counter Standee QR code (`/q/[id]`).
  * Customer automatically enters the merchant's **Live Queue** in real-time.
  * Cashier clicks the waiting customer, enters bill amount in `RewardModal`, and awards stamps with 1 tap.
* **WhatsApp Digital Stamp Card (`/wallet/[customerId]`):**
  * Customer receives instant WhatsApp notification with a link to their interactive digital stamp card.
  * Stamps accumulate towards rewards (e.g., *Buy 5, Get 1 Free*).
* **VIP Club & Streaks (`src/lib/stamp-engine.ts`):**
  * Automated level upgrades based on lifetime visits: **Silver ➔ Gold ➔ Platinum**.
  * Streaks tracking and milestone bonus stamps.
* **Smart AI Google Review Engine (`/api/reviews/`):**
  * Automated WhatsApp review prompt sent to happy customers post-visit.
  * 1-click review flow with AI-drafted review suggestions to boost Google Maps ranking.
  * AI AutoReply generation for incoming merchant Google reviews.
* **Referral Viral Loop (`/dashboard/referrals`):**
  * Unique referral links (`/r/[code]`).
  * Both referrer and friend get bonus stamps upon completed first purchase.
* **Merchant Analytics & Daily Pulse (`/dashboard`):**
  * Real-time metrics: Today's visits, repeat customer rate, stamps issued, rewards redeemed.

---

### ⚠️ 2. In-Code Models vs. Production UI Realities

| Feature | Concept / Old README Claim | Actual Implementation in Codebase |
| :--- | :--- | :--- |
| **Bill Entry Flow** | "Cashier types last 4 digits of phone number" | **QR Scan Live Queue**: Customer scans QR code on counter; cashier selects customer from live queue and confirms amount. |
| **Staff PIN Login** | "Cashiers and Managers switch via 4-digit PINs" | **Email/Password Auth**: Main login (`/login`) uses Merchant Email & bcrypt password. The `Staff` table has `pin` and RBAC roles (`OWNER`, `MANAGER`, `CASHIER`), but a physical PIN keypad switch screen on POS is not active in the UI. |
| **Birthday Journey** | "Automated 7-day birthday reminder & gift slice" | **Backend Model Ready, UI Form Pending**: Database model `Birthday` and API (`/api/birthdays`) exist with seed demo data, but frontend form to collect customer birth dates is not yet exposed in the wallet or customer creation form. |
| **Anniversary** | Often mentioned in marketing proposals | **Not in Schema**: No anniversary field or table exists in `schema.prisma`. |

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** v20+ or **Bun** v1.0+
* SQLite

### 2. Installation
```bash
# Clone the repository
cd F:\HITESH\CustomerPilot_GLM_Agent_July2026

# Install dependencies
bun install   # or: npm install

# Initialize Database
cp .env.production .env
bun run db:push
bun run src/lib/seed.ts
```

### 3. Run Development Server
```bash
bun run dev   # or: npm run dev
# Open in browser: http://localhost:3000
```

---

## 👥 Authentication & Roles

* **Super Admin Portal:** `/super-admin`
* **Merchant Dashboard:** `/dashboard`
* **Customer Scan Portal:** `/q/[id]`
* **Customer Wallet:** `/wallet/[customerId]`

### Role-Based Access Control (RBAC Matrix)
Role permissions are enforced via `src/lib/rbac.ts`:
* **OWNER:** Full access to settings, staff creation, billing, voiding, refunds, audits, and payouts.
* **MANAGER:** Daily operations, bill approvals, voids/refunds with audit trail, customer notes.
* **CASHIER:** Queue claiming, bill creation, and reward redemptions.

---

## 📁 Key File Structure

```
src/
├── app/
│   ├── api/                    # 40+ REST API endpoints
│   │   ├── bills/              # POS bill creation & stamp awarding
│   │   ├── queue/              # Live counter QR queue state & claiming
│   │   ├── reviews/            # Google review AI generation & webhooks
│   │   ├── webhook/evolution/  # Inbound WhatsApp message processor
│   │   └── whatsapp/connect/   # Evolution API instance pairing
│   ├── dashboard/              # Merchant management dashboard
│   │   ├── queue/              # Cashier Live Queue interface
│   │   ├── customers/          # Customer directory & VIP status
│   │   └── reviews/            # Google review monitor & AI auto-reply
│   ├── q/[id]/                 # Counter QR code customer landing page
│   └── wallet/[customerId]/    # Customer WhatsApp mobile pass & stamp card
├── components/dashboard/
│   └── RewardModal.tsx         # Cashier stamp confirmation & upsell calculator
└── lib/
    ├── db.ts                   # Prisma client singleton
    ├── rbac.ts                 # Role-based permissions matrix
    └── stamp-engine.ts         # Math engine for stamps, streaks & tiering
```

---

## 📄 Documentation

* **Audit Logs:** [`RESOLVED_ISSUES_LOG.md`](./RESOLVED_ISSUES_LOG.md) — Complete log of bugs resolved across releases.
* **Deployment Guide:** [`CUSTOMER_PILOT_VPS_DEPLOYMENT_GUIDE.md`](./CUSTOMER_PILOT_VPS_DEPLOYMENT_GUIDE.md) — VPS & Caddy deployment procedures.
* **Agent Guidelines:** [`AGENTS.md`](./AGENTS.md) — Strict rules for AI agents modifying this repository.
