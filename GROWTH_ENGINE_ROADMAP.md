# CustomerPilot Growth Engine Roadmap

> **Purpose**: This document is the technical blueprint for transforming CustomerPilot from a retention tool into a self-growing viral engine. Every feature here follows the principle: **Event → Business Rule → Action → Measurement → Share → New User**.

> **Important**: Do NOT build all features at once. Follow the Sprint Priority at the bottom. Each feature must have a complete `event → database → automation → reward → analytics` flow — not just UI cards.

---

## Architecture Foundation: Event-Driven Growth

All growth features are powered by a unified event log. These events drive referrals, rewards, growth reports, analytics, case studies, and viral loops.

### Core Events

```
CustomerJoined
StampIssued
RewardUnlocked
RewardRedeemed
ReviewReceived
ReviewReplyGenerated
ReviewReplyPublished
CustomerReferred
ReferralQualified
MerchantReferred
MerchantSubscribed
GrowthReportGenerated
GrowthReportShared
```

### Architecture Rule

```
Event → Business Rule → Action → Measurement → Share → New User
```

This approach provides auditable answers to questions like *"Why did this merchant get 86 repeat visits?"*

---

## Feature 1: Merchant Referral (Merchant → Merchant)

### Real-Life Flow (Example: Amritsar Zaika)

1. Merchant opens dashboard → sees "Refer a Business" card
2. Clicks → gets unique referral link: `customerpilot.in/r/AMRITSAR-X7K2`
3. Shares via WhatsApp or copy-link
4. Friend clicks → lands on personalized page: *"Amritsar Zaika recommended CustomerPilot"*
5. Friend signs up → starts trial → pays first subscription
6. **Only on first paid subscription**: Referrer gets ₹100 credit, Referred gets ₹100 benefit

### Referral Status Machine

```
INVITED → SIGNED_UP → ACTIVATED → PAID → REWARDED
```

> ⚠️ **Critical**: Do NOT release reward on SIGNED_UP. Qualifying event = **First successful paid subscription**.

### Database Schema

```
Referral
├── id
├── tenantId
├── referrerMerchantId
├── referredMerchantId
├── referralCode
├── status (INVITED | SIGNED_UP | ACTIVATED | PAID | REWARDED)
├── referrerReward
├── referredReward
├── qualifyingEvent
├── createdAt
├── convertedAt
└── rewardedAt
```

### Architecture Rules

- ReferralCode must be bound to merchant's tenant
- Cross-tenant accidental credit must be impossible
- One merchant = one unique referral code

---

## Feature 2: Powered by CustomerPilot (Customer → Potential Merchant)

### Concept

Subtle branding on all customer-facing pages that acts as a passive lead generation channel.

### Where It Appears

Every customer-facing page:
- CustomerWelcome
- LoyaltyCard
- StampSuccess
- RewardUnlocked
- CustomerReferral
- ReviewSuccess

### Implementation

**Reusable Component:**
```jsx
<PoweredByCustomerPilot />
```

> ⚠️ Do NOT hard-code on a single page. This must be a shared component used across all customer-facing pages.

**Click Target:**
```
CustomerPilot landing page → "/for-business"
```

```
"Your customers could use this too."
Loyalty + Google Reviews + AI Replies
₹499/month
[ Start Growing ]
```

### Merchant Control (Dashboard → Settings → Branding)

```
branding.showPoweredBy = true      // Show "Powered by CustomerPilot"
branding.ctaEnabled = true         // Show "Want this for your business?"
branding.ctaUrl = "/for-business"
```

- Default: ON for all plans
- Higher/Enterprise plans: Option to **remove** CustomerPilot branding

### Design Rule

CustomerPilot branding must be **subtle**. Customer's primary experience = **merchant's brand** (e.g., "Amritsar Zaika"), not CustomerPilot.

---

## Feature 3: 5-Minute Aha Moment (Onboarding)

### The Problem (Current)

```
Signup → 20-field form → Settings → Integrations → Campaign creation 
→ WhatsApp config → QR config → Dashboard
```

Merchant abandons midway.

### Correct Onboarding Flow

**Step 1 — Business (3 fields only)**
```
Business Name: Amritsar Zaika
Industry: Restaurant
City: Vadodara
```

**Step 2 — Smart Recommendation**

System auto-recommends campaign based on industry:
```
Recommended for Restaurants:
10 Stamps → Free Butter Naan
Minimum purchase: ₹300
[ Use This Campaign ]
```

Merchant does NOT create rewards manually.

**Step 3 — QR Ready**

Immediately show:
```
Your Loyalty QR is Ready
[QR Code Image]
[ Download ] [ Print ] [ Test Now ]
```

**Step 4 — Test Customer (The Aha Moment)**

Merchant scans their own QR → sees:
```
Welcome to Amritsar Zaika
You've earned: 🎟️ 1 Stamp
1 / 10
9 more to unlock FREE Butter Naan
```

Dashboard simultaneously updates:
```
Loyalty Members: 1 | Stamps Issued: 1 | Rewards: 0
```

Merchant sees **live data change** = Aha Moment.

**Step 5 — AI Review Demo**

Show AI in action with sample review:
```
Customer: "Food was amazing and butter chicken was excellent."
AI Reply: "Thank you for visiting Amritsar Zaika. We're glad you enjoyed our butter chicken…"
```

Merchant: *"Oh, ye actually kaam karta hai."* → **Aha Moment complete.**

### Onboarding State Machine

```
ONBOARDING_STARTED → BUSINESS_COMPLETED → CAMPAIGN_SELECTED → QR_GENERATED 
→ TEST_COMPLETED → AI_DEMO_COMPLETED → ONBOARDING_COMPLETED
```

### Progress UI

```
CustomerPilot Setup
✓ Business
✓ Loyalty
✓ QR
✓ Test
✓ AI Demo
100% Ready
```

### Rule: "Always Show Next Step"

```
QR generated → Next: "Test your QR"
Test complete → Next: "Invite your first customer"
```

---

## Feature 4: Vadodara Merchant Cluster (Sales Tracking)

### Purpose

Cluster penetration strategy instead of random lead generation.

### Super Admin View

```
Growth → Merchant Clusters

Vadodara
├── Manjalpur (Target: 30, Active: 12, Trial: 5, Prospects: 18)
├── Akota
├── Gotri
├── Karelibaug
└── Alkapuri
```

### Industry Breakdown per Area

```
Manjalpur:
  Restaurants    5
  Cake Shops     3
  Cafes          2
  Salons         1
  Bakery         1
```

### Value

- "Manjalpur mein 12 merchants already CustomerPilot use kar rahe hain"
- Sales team targets nearby 20 merchants = cluster penetration strategy

---

## Feature 5: Before / After Case Study

### Concept

Auto-generate growth snapshot from actual verified merchant data.

### Example (Day 1 → Day 30)

```
AMRITSAR ZAIKA — 30 DAY GROWTH

Google Reviews:       214 → 247  (+33)
Loyalty Members:      0   → 312  (+312)
Stamps Issued:        0   → 684  (+684)
Rewards Redeemed:     0   → 48
Repeat Visits:        0   → 86

[ Create Case Study ]
```

### Critical Rule

> ⚠️ Do NOT automatically claim: *"CustomerPilot generated ₹50,000 revenue"* unless actual transaction data is available.
>
> Instead use directly measurable metrics: *"86 repeat visits recorded"*

---

## Feature 6: Review Screenshot Sharing

### Flow

```
GoogleReviewReceived → CreateReviewShareCard → MerchantNotification → Merchant Approves
```

### Share Card UI

```
┌──────────────────────────┐
│       ⭐⭐⭐⭐⭐          │
│                          │
│ "Butter chicken was      │
│  amazing..."             │
│                          │
│     Amritsar Zaika       │
│                          │
│ Powered by CustomerPilot │
└──────────────────────────┘
```

**Buttons:** Download | Share to WhatsApp | Share to Instagram

### Rule

> ⚠️ No automatic posting without merchant approval. Respect social platform API rules.

---

## Feature 7: Monthly Growth Report

### Flow

```
Month End → Metrics Aggregation → GrowthReport Generated → Merchant Notification
```

### Report Content

```
Your August Growth Report — Amritsar Zaika

312 Loyalty Members
684 Stamps Collected
48 Rewards Redeemed
+33 Google Reviews
86 Repeat Visits

[ Share My Growth ]  →  Shareable image
```

### Data Sources (From Event Log)

```
StampIssued
RewardRedeemed
ReviewReceived
ReviewReplyPublished
LoyaltyCustomerCreated
RepeatVisitRecorded
```

### Implementation

Scheduled job: `monthly-growth-report` — calculates from actual event data only.

---

## Feature 8: Merchant Success Reel

### Dashboard Location

```
Marketing → Success Story
```

### Flow

1. System generates brief from verified merchant data
2. Merchant reviews and approves
3. CustomerPilot content team creates actual video

### Critical Rule

> ⚠️ Do NOT generate AI-fabricated success stories. Real merchant + real data + merchant permission only.

---

## Feature 9: WhatsApp Business Communities (Distribution Layer)

### Concept

This is a **distribution channel**, not a SaaS feature. CustomerPilot's actual merchant database stays in WebApp.

### Example Community

```
"Vadodara Restaurant Growth Club"

Monday:    Google Review tip
Wednesday: Loyalty idea
Friday:    Customer retention case study
```

### Dashboard Integration

```
Growth → Community
  Vadodara Restaurant Growth Club
  [ Join WhatsApp Community ]
  Upcoming: Google Review Growth Workshop — Friday 4 PM
```

### Rule

Do NOT aggressively sell CustomerPilot in every community message.

---

## Feature 10: Customer Referral + Reward

### Flow (Example: Amritsar Zaika Customer)

```
Customer has 7/10 stamps
  → "3 more stamps → Free Butter Naan"
  → [ Invite a Friend ]
```

**Invitation:**
```
Your friend gets ₹50 welcome offer.
You get ₹50 reward after their qualifying visit.
```

**WhatsApp Share:**
```
"Amritsar Zaika par mera loyalty reward unlock ho raha hai. 
Aap bhi join karo — ₹50 welcome offer: [link]"
```

### Friend Journey

```
Friend clicks link → Customer landing → Amritsar Zaika page → Join Loyalty 
→ WhatsApp flow → Qualifying purchase → ₹50 friend reward → ₹50 referrer reward
```

### Anti-Abuse Rules

Duplicate detection based on:
- Same phone number
- Same WhatsApp identity
- Same merchant
- Same customer

> ⚠️ Reward ONLY after `QUALIFYING_PURCHASE` event.

---

## Complete Growth Flywheel

### Customer Growth Loop

```
                    AMRITSAR ZAIKA
                          │
                          ▼
                    CustomerPilot
                          │
                   5-Minute Aha
                          │
                          ▼
                      Loyalty QR
                          │
                          ▼
                       Customer
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
              Stamp             Review
                 │                 │
                 ▼                 ▼
              Reward            AI Reply
                 │
                 ▼
         Customer Referral
                 │
                 ▼
           Friend Customer
                 │
                 ▼
            Repeat Visit
```

### Merchant Growth Loop

```
Amritsar Zaika
      │
      ├── Merchant Referral ─────→ New Merchant
      │
      ├── Review Share ──────────→ Social Reach
      │
      ├── Growth Report ─────────→ Social Reach
      │
      └── Success Reel ──────────→ New Leads

Customer Loyalty Page
        │
        ▼
Powered by CustomerPilot
        │
        ▼
Business Owner notices
        │
        ▼
New Merchant Lead
```

---

## Dashboard Navigation (Final Sidebar Structure)

```
Merchant Dashboard
  Dashboard
  Customers
  Loyalty
  Google Reviews
  AI Replies

Growth
  ├─ Growth Overview
  ├─ Growth Report
  └─ Case Study

Marketing
  ├─ Review Cards
  └─ Success Story

Referrals
  ├─ Refer a Business
  └─ Customer Referrals

Settings
  ├─ Business
  ├─ Branding
  └─ Rewards
```

---

## Sprint Priority (Development Order)

> ⚠️ **Do NOT build all features simultaneously.**

### Sprint 1 — Foundation (Build First)

| # | Feature | Priority |
|---|---------|----------|
| 1 | Merchant Referral | 🔴 Critical |
| 2 | Powered by CustomerPilot | 🔴 Critical |
| 3 | 5-Minute Onboarding (Aha Moment) | 🔴 Critical |
| 4 | Basic Growth Tracking | 🟡 High |

### Sprint 2 — Social Proof

| # | Feature | Priority |
|---|---------|----------|
| 5 | Before/After Case Study | 🟡 High |
| 6 | Review Share Card | 🟡 High |

### Sprint 3 — Reporting

| # | Feature | Priority |
|---|---------|----------|
| 7 | Monthly Growth Report | 🟡 High |

### Sprint 4 — Content & Community

| # | Feature | Priority |
|---|---------|----------|
| 8 | Success Story / Reel Workflow | 🟢 Medium |
| 9 | WhatsApp Community Distribution | 🟢 Medium |

### Sprint 5 — Viral Loop

| # | Feature | Priority |
|---|---------|----------|
| 10 | Customer Referral + Rewards | 🔴 Critical |

---

## Key Architecture Rules Summary

1. **Event-Driven**: All features derive from the event log — never build isolated tables
2. **Multi-Tenant Safety**: Referral codes bound to tenant; cross-tenant credit impossible
3. **Qualifying Events Only**: Never reward on signup alone — only on paid subscription (merchant) or qualifying purchase (customer)
4. **Anti-Abuse**: Duplicate detection on phone + WhatsApp identity + merchant + customer
5. **Honest Metrics**: Only use directly measurable data — never auto-claim revenue
6. **Merchant Approval**: No auto-posting to social media without explicit merchant consent
7. **Subtle Branding**: Customer experience = merchant's brand first, CustomerPilot second
8. **Always Next Step**: Onboarding always shows what to do next

---

*Last Updated: 25 Aug 2026*
*Status: Roadmap — Not yet in development*
