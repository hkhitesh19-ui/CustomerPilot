// CustomerPilot V6.3 — FOUNDER MANUAL (business-only, NO API mentions)
// Pure business narrative for founders, ops managers, and new merchants.
// Every scene follows: Actor / Trigger / What Merchant Does / What Customer Sees / Business Outcome.
// Deliberately omits API/DB/cron terminology — that's in the Developer Manual.
//
// V6.3 POSITIONING: CustomerPilot is NOT a POS. It's the Customer Relationship Layer
// that sits on top of every payment method. The first bridge is "Tap to Claim Reward™".

export interface FounderChapter {
  id: string
  number: number
  title: string
  tagline: string
  priority: "critical" | "high" | "medium"
  scenes: {
    name: string
    actor: string
    trigger: string
    merchantDoes: string | string[]
    customerSees: string | string[]
    businessOutcome: string
  }[]
}

export const FOUNDER_MANUAL: FounderChapter[] = [
  {
    id: "tap-to-claim-reward",
    number: 1,
    title: "Tap to Claim Reward™ — The First Bridge",
    tagline: "CustomerPilot's signature UX. Customer scans QR → merchant taps → reward delivered. NOT a POS. The Customer Relationship Layer that sits on top of every payment method.",
    priority: "critical",
    scenes: [
      {
        name: "The core identity: CustomerPilot starts AFTER payment",
        actor: "Founder / Product Team",
        trigger: "Anyone asks 'What is CustomerPilot?'",
        merchantDoes: [
          "Explains: CustomerPilot is NOT billing software, NOT GST software, NOT a POS, NOT accounting software.",
          "Explains: CustomerPilot IS the Customer Relationship Layer that sits on top of every payment method.",
          "Explains: It starts AFTER payment — works with cash, UPI, existing POS, card, or no bill.",
          "Explains: It never asks for bill number, GST, invoice, tax, or HSN. Only customer + purchase event + optional amount.",
        ],
        customerSees: "A loyalty program that doesn't care HOW they paid — only that they did.",
        businessOutcome: "Clear positioning. Merchant doesn't feel threatened ('you're not replacing my billing'). Customer doesn't feel friction ('I just scan and get rewarded').",
      },
      {
        name: "First-time customer experience (under 10 seconds)",
        actor: "Customer (first visit)",
        trigger: "Customer pays for their cake (cash, UPI, whatever). Merchant says 'Reward points collect karoge?'",
        merchantDoes: [
          "Points to the QR card at the counter.",
          "Says: 'Scan this, tap Claim My Reward.'",
          "Watches the customer appear in the Live Queue on their POS screen.",
          "Taps the customer's card. Enters amount (optional). Confirms.",
        ],
        customerSees: [
          "Scans QR with phone camera.",
          "WhatsApp opens instantly with a welcome message + 'Claim My Reward' button.",
          "Taps the button.",
          "Gets WhatsApp confirmation within 5 seconds: 'You earned 1 stamp!'",
          "No app download. No password. No forms. Done in 10 seconds.",
        ],
        businessOutcome: "Customer joins the loyalty program without any friction. First impression: 'That was easy.' Activation rate 85%+ (vs 30% for form-based signup).",
      },
      {
        name: "Returning customer experience (under 5 seconds)",
        actor: "Customer (returning)",
        trigger: "Customer pays for their cake. They've scanned before.",
        merchantDoes: [
          "Watches the Live Queue — customer appears automatically (no search needed).",
          "Taps the customer's card. Enters amount. Confirms.",
        ],
        customerSees: [
          "Scans QR.",
          "WhatsApp opens — already identified (no re-registration).",
          "Taps 'Claim My Reward'.",
          "Appears in merchant's queue instantly.",
          "Gets WhatsApp confirmation within 5 seconds.",
        ],
        businessOutcome: "Returning customer friction = zero. Merchant doesn't search, doesn't type. Just tap → amount → confirm. 5 seconds total.",
      },
      {
        name: "Merchant interaction: never exceeds Tap → Amount → Confirm",
        actor: "Merchant (cashier or owner)",
        trigger: "Customer appears in Live Queue.",
        merchantDoes: [
          "Sees green 'Waiting Customers' panel with customer cards.",
          "Each card shows: name, phone (masked), waiting time, VIP badge, birthday badge, NEW/RETURNING badge.",
          "Taps the customer card.",
          "Enters amount (optional — leave blank if no bill).",
          "Clicks 'Claim Reward'.",
          "Done. Customer gets WhatsApp confirmation. Card disappears from queue.",
        ],
        customerSees: "WhatsApp: 'You earned 1 stamp. Total: 3/9. 6 more to go!'",
        businessOutcome: "Merchant interaction never exceeds 5 seconds. No search. No typing customer name. No bill details. The fastest customer retention flow for local merchants.",
      },
      {
        name: "Supports 4 merchant types (no-bill, existing POS, UPI-only, manual)",
        actor: "Merchant (any type)",
        trigger: "Merchant asks 'Will this work with my current setup?'",
        merchantDoes: [
          "Type 1 (No Bill Merchant): Cash → QR → amount → reward. No bill needed.",
          "Type 2 (Existing POS): POS completes billing → QR → amount (manual) → reward. CustomerPilot sits on top.",
          "Type 3 (UPI Only): UPI → QR → reward. Amount optional.",
          "Type 4 (Manual Reward): Owner → select customer → give bonus. For exceptions.",
        ],
        customerSees: "Same experience regardless of merchant type — scan QR, tap claim, get reward.",
        businessOutcome: "CustomerPilot works for EVERY merchant. No 'I already have a POS' objection. No 'I don't do billing' objection. It's the layer on top, not a replacement.",
      },
      {
        name: "Live Queue design (auto-refresh, expire, badges)",
        actor: "Merchant",
        trigger: "Multiple customers scan QR in quick succession (festival rush).",
        merchantDoes: [
          "Sees all waiting customers in a grid, newest first.",
          "Each card auto-refreshes waiting time every 5 seconds.",
          "Cards turn amber after 60s, red after 180s (expiring soon).",
          "Taps each customer in order, claims reward, card disappears.",
          "Queue auto-expires customers after 5 minutes (configurable) if not claimed.",
        ],
        customerSees: "If merchant is busy and doesn't tap within 5 min, customer gets WhatsApp: 'Sorry we missed you! Your reward is saved — ask the merchant next time.'",
        businessOutcome: "Queue handles rush gracefully. No customer left hanging. Merchant works through queue at their pace. Auto-expire prevents stale entries.",
      },
      {
        name: "What CustomerPilot NEVER asks for",
        actor: "Founder / Sales Team",
        trigger: "Merchant asks 'Do I need to enter bill details?'",
        merchantDoes: [
          "Clarifies: CustomerPilot NEVER asks for: Bill Number, Invoice Number, GST Details, Tax, HSN, Accounting fields.",
          "Clarifies: CustomerPilot only needs: Customer (auto-identified by phone) + Purchase Event (the scan) + Optional Amount (for stamp calculation).",
          "Clarifies: If merchant doesn't want to enter amount, they don't have to — default 1 stamp awarded.",
        ],
        customerSees: "N/A — this is a merchant-facing clarification.",
        businessOutcome: "Merchant feels relieved. 'Oh, this isn't another software I have to learn.' It's a 5-second tap after the sale is done.",
      },
    ],
  },
  {
    id: "onboarding-2-min",
    number: 2,
    title: "2-Minute Merchant Onboarding",
    tagline: "From signup to first paid bill in under 2 minutes. No setup friction.",
    priority: "critical",
    scenes: [
      {
        name: "Signup → POS ready",
        actor: "New merchant (Ravi)",
        trigger: "Ravi clicks 'Start 14-day free trial' on the website.",
        merchantDoes: [
          "Fills 3 fields: shop name, WhatsApp number, business type (Bakery).",
          "No credit card. No email verification. No tutorial video.",
          "System auto-creates a default stamp card based on business type (Bakery → 'Cake Lover's Card — buy 9 get 1 free').",
          "POS opens immediately. Ravi is now ready to bill customers.",
        ],
        customerSees: [
          "First customer walks in within 2 minutes — Ravi processes their bill, awards a stamp.",
          "Customer gets WhatsApp: 'You earned 1 stamp on Cake Lover's Card. Total: 1/9. 8 more to go!'",
        ],
        businessOutcome:
          "Merchant experiences value before being asked to invest time in setup. Activation rate jumps from ~30% (5-step wizard) to ~85% (2-min path).",
      },
      {
        name: "Progressive setup checklist",
        actor: "Merchant (later that day)",
        trigger: "Ravi has a quiet moment between customers.",
        merchantDoes: [
          "Sees a 'Complete your setup' widget on the dashboard with 5 optional items.",
          "Adds staff (Priya as Cashier, Sunita as Manager).",
          "Skips 'Import customers' — his paper register is messy, will do it later.",
          "Customizes rewards (adds 'Free Brownie', '20% off Birthday Cake').",
          "Sets up birthday rewards — automates birthday surprise for regulars.",
          "All steps are non-blocking. Ravi could ignore them forever and still operate.",
        ],
        customerSees: [
          "When Ravi adds staff, customers start seeing the cashier's name on WhatsApp messages.",
          "Customized rewards appear in the catalog instantly.",
        ],
        businessOutcome:
          "Setup becomes a side activity, not a gate. Merchants who would have abandoned at step 3 now stay engaged because the product already works.",
      },
      {
        name: "First-week retention hook",
        actor: "Merchant (Day 3)",
        trigger: "Ravi opens the dashboard and sees 12 stamps awarded, 4 customers, ₹2,800 revenue.",
        merchantDoes: [
          "Sees daily summary WhatsApp: 'Yesterday: 6 bills, ₹1,200, 2 new customers. Top customer: Meera.'",
          "Decides to keep using the system. Trial will convert to paid in 11 days.",
        ],
        customerSees: "Same as Day 1 — the magic is in the merchant's behavior change.",
        businessOutcome:
          "By Day 3, merchant has data they didn't have before. Switching cost becomes real. Trial → paid conversion exceeds 60%.",
      },
    ],
  },
  {
    id: "customer-import-optional",
    number: 3,
    title: "Customer Import (Optional, Multi-Source)",
    tagline: "90% of small merchants don't have a CSV. Support what they actually have.",
    priority: "critical",
    scenes: [
      {
        name: "Skip import entirely",
        actor: "Merchant",
        trigger: "Merchant just signed up. Has no customer list at all.",
        merchantDoes: [
          "Clicks 'Skip for now' on the Import step.",
          "Starts billing immediately. New customers are auto-registered when they pay their first bill.",
        ],
        customerSees: "Same as a walk-in registration — phone number at counter → first stamp.",
        businessOutcome:
          "No friction. Customer base builds organically as the merchant operates. Average merchant captures 80% of regular customers in 30 days.",
      },
      {
        name: "Manual add (1 customer at a time)",
        actor: "Merchant",
        trigger: "Merchant remembers 3-4 regulars by name and wants them in the system now.",
        merchantDoes: [
          "Opens Customers → Add Customer.",
          "Types name + phone + optional email.",
          "Repeats for each regular.",
          "Each new customer immediately gets a WhatsApp invite.",
        ],
        customerSees: "WhatsApp: 'Welcome to Sweet Crumb Bakery's loyalty program. Show this message on your next visit.'",
        businessOutcome: "Fast for small lists. Merchant feels in control. No CSV skill required.",
      },
      {
        name: "Excel / CSV upload",
        actor: "Merchant with a spreadsheet",
        trigger: "Merchant has been tracking customers in Excel.",
        merchantDoes: [
          "Downloads the CSV template from the import dialog.",
          "Pastes their Excel columns into the template.",
          "Uploads. System shows preview: '47 to import, 3 duplicates, 2 invalid.'",
          "Confirms. 47 customers imported, 47 WhatsApp invites queued.",
        ],
        customerSees: "Same welcome WhatsApp as above.",
        businessOutcome: "Bulk onboarding for organized merchants. Duplicate prevention keeps data clean.",
      },
      {
        name: "Phone contacts / WhatsApp contacts paste",
        actor: "Merchant with phone contacts",
        trigger: "Merchant has all customers saved in their phone.",
        merchantDoes: [
          "Opens their phone's contact app, selects 'Send contacts' → exports as vCard or text.",
          "Pastes the list into the import dialog.",
          "System parses phone numbers and names automatically.",
        ],
        customerSees: "Same welcome WhatsApp.",
        businessOutcome: "Reaches the 90% of small merchants who have never used Excel for customer tracking.",
      },
    ],
  },
  {
    id: "bill-entry-fast-queue",
    number: 4,
    title: "Bill Entry for Busy Stores",
    tagline: "When 8 people are in line, search-by-name is too slow. 4 alternatives.",
    priority: "critical",
    scenes: [
      {
        name: "Last-4-digits quick search",
        actor: "Cashier",
        trigger: "Customer says 'I have a stamp card' and starts reciting their phone number.",
        merchantDoes: [
          "Types last 4 digits of phone into POS search.",
          "System narrows to 2-3 matches instantly.",
          "Taps the right one. Customer selected in 3 seconds.",
        ],
        customerSees: "Cashier confirms their name. Bill proceeds normally.",
        businessOutcome: "Cuts queue time by ~12 seconds per bill. At 100 bills/day, saves 20 minutes of customer waiting.",
      },
      {
        name: "Recent customers row",
        actor: "Cashier",
        trigger: "Regular customer walks in for the 3rd time this week.",
        merchantDoes: [
          "POS shows a 'Recent' row at top with last 8 billed customers as avatars.",
          "Taps the customer's avatar. No typing needed.",
        ],
        customerSees: "Cashier greets them by name before they speak.",
        businessOutcome: "Regulars feel recognized. Recognition is the #1 driver of loyalty (per Bain & Company).",
      },
      {
        name: "Favorites row",
        actor: "Cashier",
        trigger: "Merchant has flagged 5 VIPs as 'favorites' for instant access.",
        merchantDoes: [
          "POS shows a 'Favorites' row above Recent with star-marked avatars.",
          "VIP customers get one-tap access.",
        ],
        customerSees: "VIP customer feels special — cashier already has their card open.",
        businessOutcome: "Top 20% of customers (who drive 80% of revenue) get white-glove treatment at zero marginal cost.",
      },
      {
        name: "QR code scan",
        actor: "Customer + Cashier",
        trigger: "Customer has the merchant's QR card stuck on their phone case.",
        merchantDoes: [
          "Cashier taps the QR icon in POS, scans the customer's card.",
          "Customer identified in 1 second.",
        ],
        customerSees: "No phone number needed. Just present the QR card.",
        businessOutcome: "Fastest identification method. Ideal for high-volume stores. Eliminates spelling mistakes.",
      },
    ],
  },
  {
    id: "stamp-card-history",
    number: 5,
    title: "Stamp Card Lifecycle & History",
    tagline: "What happens after a card is redeemed? Customer keeps their full story.",
    priority: "critical",
    scenes: [
      {
        name: "Card completion → reward ready",
        actor: "Customer (Meera)",
        trigger: "Meera's 9th stamp is awarded on her Coffee Lover's Card.",
        merchantDoes: "Nothing — system auto-detects completion.",
        customerSees: [
          "WhatsApp: '🎉 You've completed your Cake Lover's Card. Visit us to claim your Free Cupcake!'",
          "Card visual shows all 9 stamps filled in gold with a 'Ready to redeem!' badge.",
        ],
        businessOutcome: "Customer is now motivated to return. Redemption rate is ~70% within 14 days.",
      },
      {
        name: "Redemption → new empty card starts",
        actor: "Customer + Cashier",
        trigger: "Meera returns to redeem her free cupcake.",
        merchantDoes: [
          "Cashier opens Rewards → Free Cupcake → Meera → Confirm.",
          "Old completed card is marked as 'redeemed' (preserved in history).",
          "New empty card auto-creates on Meera's next bill.",
        ],
        customerSees: [
          "WhatsApp: '✅ You've redeemed: Free Cupcake. Thanks for being a loyal customer.'",
          "Their profile now shows: 'Lifetime cards: 1 completed · 1 redeemed · 1 in progress (0/9)'.",
        ],
        businessOutcome: "Customer sees their progress over time. Feels like accumulating medals, not just spending.",
      },
      {
        name: "Lifetime history view",
        actor: "Customer (viewing their profile, accessed via merchant)",
        trigger: "Meera asks 'How many free cupcakes have I earned total?'",
        merchantDoes: [
          "Opens Meera's profile → Lifetime History tab.",
          "Shows: 4 completed cards, 4 redemptions, 42 lifetime stamps, ₹5,400 lifetime spend.",
          "Timeline view shows each card with date completed, date redeemed, reward claimed.",
        ],
        customerSees: "Their full loyalty journey — like a passport of visits.",
        businessOutcome: "Customer feels invested in their history. Switching to a competitor means losing their story.",
      },
      {
        name: "Achievement timeline",
        actor: "Customer",
        trigger: "Customer crosses a milestone (5 referrals, 8-week streak, Gold tier).",
        merchantDoes: "Nothing — achievements auto-grant.",
        customerSees: [
          "WhatsApp: '🏆 Achievement unlocked: 8-Week Streak! You've visited us 8 weeks in a row.'",
          "Their profile shows a row of badges: First Stamp, First Reward, Silver, Gold, Streak Master, etc.",
        ],
        businessOutcome: "Gamification drives frequency. Customers visit more often to unlock the next badge.",
      },
    ],
  },
  {
    id: "merchant-daily-dashboard",
    number: 6,
    title: "Merchant Daily Dashboard",
    tagline: "What a merchant sees at 9 AM, 1 PM, and 9 PM. The day on one screen.",
    priority: "high",
    scenes: [
      {
        name: "Morning open (9 AM)",
        actor: "Manager (Sunita)",
        trigger: "Sunita unlocks the store and opens the POS tablet.",
        merchantDoes: [
          "Sees the morning briefing: 'Today's plan'.",
          "Shows: 3 birthdays this week (1 today — Kavya), 2 pending redemptions, 1 reward low-stock alert.",
          "Pending WhatsApp queue: 0 (all delivered overnight).",
          "Yesterday's summary: 12 bills, ₹4,200, 3 new customers, 2 reviews requested.",
          "Sunita stocks the low-stock reward (Free Pastry — only 4 left).",
        ],
        customerSees: "Indirect — Sunita is ready before the first customer walks in.",
        businessOutcome: "Manager starts the day with a clear to-do list. No missed birthdays, no out-of-stock redemptions.",
      },
      {
        name: "Mid-day pulse (1 PM)",
        actor: "Owner (Ravi, remote)",
        trigger: "Ravi opens the mobile dashboard from his phone during lunch.",
        merchantDoes: [
          "Sees live KPIs: today so far — 7 bills, ₹2,100, 8 stamps awarded.",
          "Sees 'Top customer today' — Meera came back (8/9 on her card now).",
          "Sees 'Pending approvals' — 1 high-value redemption needs manager sign-off.",
          "Approves from his phone. Customer gets WhatsApp in 30 seconds.",
        ],
        customerSees: "Smooth approval — no 'I'll have to call you back' friction.",
        businessOutcome: "Owner can manage remotely without being a bottleneck.",
      },
      {
        name: "End-of-day close (9 PM)",
        actor: "Owner",
        trigger: "Store closes. Ravi opens the dashboard one last time.",
        merchantDoes: [
          "Sees: today's revenue ₹6,800, 18 bills, 2 redemptions, 1 new customer, 1 review submitted (5-star).",
          "Reputation score went from 78 → 80.",
          "Churn list: Arjun moved to dormant (35 days inactive). Win-back auto-queued for tomorrow.",
          "Tomorrow's preview: 1 birthday reminder to send at 9 AM.",
        ],
        customerSees: "Indirect — but tomorrow's birthday customer will get a surprise WhatsApp.",
        businessOutcome: "Owner closes the day with full clarity. Tomorrow is pre-queued. Owner sleeps well.",
      },
    ],
  },
  {
    id: "customer-psychology",
    number: 7,
    title: "Customer Psychology & Recognition",
    tagline: "Loyalty isn't just rewards. It's feeling seen. VIP, milestones, streaks, celebrations.",
    priority: "high",
    scenes: [
      {
        name: "VIP tier upgrade",
        actor: "Customer (Meera)",
        trigger: "Meera's lifetime spend crosses ₹5,000.",
        merchantDoes: [
          "System auto-upgrades Meera to Gold tier.",
          "Cashier sees a gold badge next to Meera's name at POS.",
        ],
        customerSees: [
          "WhatsApp: '🎉 Congratulations Meera! You're now a Gold Member of Sweet Crumb Bakery. Enjoy 20% bonus stamps on every visit + a free birthday reward!'",
          "Their stamp card now has a gold border.",
          "Future bills award 1.2 stamps (rounded up) instead of 1.",
        ],
        businessOutcome: "Customer feels recognized for their spend. Top customers stop shopping around — they want to maintain their tier.",
      },
      {
        name: "Streak celebration",
        actor: "Customer (Kavya)",
        trigger: "Kavya visits for the 8th consecutive week.",
        merchantDoes: "System auto-grants the '8-Week Streak' achievement.",
        customerSees: [
          "WhatsApp: '🏆 Achievement unlocked: 8-Week Streak! You've visited us 8 weeks in a row. Keep it going!'",
          "Their profile shows a flame icon with '8' next to it.",
        ],
        businessOutcome: "Streak psychology (à la Duolingo) drives weekly visit habit. Streak customers visit 2.3x more often than non-streak.",
      },
      {
        name: "Milestone surprise",
        actor: "Customer (Meera)",
        trigger: "Meera earns her 50th lifetime stamp.",
        merchantDoes: [
          "Owner sees milestone alert on dashboard.",
          "Decides to surprise Meera with a free pastry on her next visit.",
        ],
        customerSees: "When Meera next visits, cashier says 'Hey Meera, your 50th stamp was special — here's a free pastry on the house.'",
        businessOutcome: "Unexpected generosity creates a story customers tell their friends. Word-of-mouth CAC = ₹0.",
      },
      {
        name: "Birthday celebration",
        actor: "Customer + Merchant",
        trigger: "It's Meera's birthday week.",
        merchantDoes: [
          "System sends WhatsApp 7 days before: '🎂 Your birthday is coming up! Sweet Crumb has a free slice waiting for you this week.'",
          "When Meera visits during her birthday window, cashier taps 'Redeem Birthday Reward'.",
          "3 bonus stamps awarded + a free slice handed over.",
        ],
        customerSees: [
          "Pre-birthday WhatsApp reminder.",
          "On visit: 'Happy Birthday Meera! 🎂 Here's your free slice + 3 bonus stamps.'",
          "Feels remembered. Tells her family.",
        ],
        businessOutcome: "Birthday customers bring 2.3 additional people on average. Birthday redemption = highest-revenue visit of the year for that customer.",
      },
    ],
  },
  {
    id: "winback-escalation",
    number: 8,
    title: "Win-back Escalation (30 / 45 / 60 / 90 days)",
    tagline: "A 4-stage ladder from gentle nudge to personal owner call. Never lose a customer silently.",
    priority: "high",
    scenes: [
      {
        name: "Day 30 — Gentle reminder",
        actor: "System (automated)",
        trigger: "Arjun hasn't visited in 30 days.",
        merchantDoes: "Nothing — system sends automatically.",
        customerSees: "WhatsApp: 'Hi Arjun! It's been a month since your last visit to Sweet Crumb Bakery. We'd love to see you again soon!'",
        businessOutcome: "~25% of customers return within 7 days of a Day-30 reminder. Cost: free.",
      },
      {
        name: "Day 45 — Soft offer",
        actor: "System (automated)",
        trigger: "Arjun didn't respond to the Day-30 reminder. Now at 45 days.",
        merchantDoes: "Nothing — system sends automatically.",
        customerSees: "WhatsApp: 'Hi Arjun! Here's a small surprise — double stamps on your next visit. Valid for 7 days only.'",
        businessOutcome: "~15% more return. Cost: small (some stamp inflation).",
      },
      {
        name: "Day 60 — Manager personal call",
        actor: "Manager (Sunita)",
        trigger: "Arjun still hasn't returned. System escalates to manager's task list.",
        merchantDoes: [
          "Sunita sees a task: 'Call Arjun — 60 days inactive'.",
          "She calls. Asks if everything is okay. Listens.",
          "Logs the call outcome in the system.",
        ],
        customerSees: "A real phone call. Feels personally cared for, not just marketed to.",
        businessOutcome: "~10% more return. Personal touch recovers customers who would have churned silently. Sunita learns about issues (e.g. 'your cakes are too sweet lately') she can fix.",
      },
      {
        name: "Day 90 — Owner intervention",
        actor: "Owner (Ravi)",
        trigger: "Arjun at 90 days. Last chance.",
        merchantDoes: [
          "Ravi sees an urgent task: 'Call Arjun — about to lose'.",
          "Calls personally. Offers a free reward to win back.",
          "Logs outcome.",
        ],
        customerSees: "Owner's personal call. Maximum emotional weight.",
        businessOutcome: "~5% recovery on hard-to-save customers. Even when lost, owner has closure.",
      },
      {
        name: "Day 120 — Lost customer",
        actor: "System",
        trigger: "Customer has not returned after Day 90.",
        merchantDoes: [
          "Customer marked as 'churned'.",
          "Removed from active win-back queue. Still in database for future re-engagement campaigns.",
        ],
        customerSees: "No more messages. Door is always open if they return.",
        businessOutcome: "Clean data. Owner knows exactly how many customers were lost and can analyze why.",
      },
    ],
  },
  {
    id: "google-review-engine",
    number: 9,
    title: "Google Review Engine (Restored Core Pillar)",
    tagline: "Stamps + Referrals + Reviews = the 3 pillars. Reviews drive new customer acquisition.",
    priority: "high",
    scenes: [
      {
        name: "Review request triggers",
        actor: "System",
        trigger: "Customer redeems a reward (best moment to ask — they're happy).",
        merchantDoes: "Nothing — system auto-triggers after redemption.",
        customerSees: [
          "WhatsApp: 'Thanks for redeeming your Free Cupcake! Would you mind leaving us a quick Google review? We've drafted one for you — feel free to edit.'",
          "Below the message: a draft review (AI-written) + a 'Submit as is' button + 'Edit & Submit' button.",
        ],
        businessOutcome: "Removes the friction of 'what do I write?'. AI draft boosts review completion from 8% to 35%.",
      },
      {
        name: "AI draft generation",
        actor: "System",
        trigger: "Customer taps 'Edit & Submit'.",
        merchantDoes: "Nothing.",
        customerSees: [
          "AI draft personalized to their experience: 'Absolutely loved my recent visit to Sweet Crumb Bakery! I redeemed my stamps for a free cupcake and it was perfect. The staff was warm and remembered my usual order...'",
          "Customer can edit any part, change the rating (defaults to 5 stars), or submit as-is.",
        ],
        businessOutcome: "Even customers who 'don't have time to write a review' can submit in 30 seconds.",
      },
      {
        name: "Review bonus stamps",
        actor: "System",
        trigger: "Customer submits the review.",
        merchantDoes: "Nothing.",
        customerSees: [
          "WhatsApp: '🎉 Thanks for your review! You've earned 2 bonus stamps.'",
          "Bonus breakdown: 1 for submitting + 1 for 5-star rating.",
        ],
        businessOutcome: "Incentivizes reviews without paying cash. Each Google review is worth ~₹2,000 in new-customer acquisition value.",
      },
      {
        name: "Photo bonus",
        actor: "Customer",
        trigger: "Customer attaches a photo of their cake to the review.",
        merchantDoes: "Nothing.",
        customerSees: "WhatsApp: '📸 Photo bonus! +2 more stamps for adding a photo. Total: 4 bonus stamps!'",
        businessOutcome: "Photo reviews are 3x more trusted by potential customers. Worth the bonus stamps.",
      },
      {
        name: "Reputation impact dashboard",
        actor: "Owner",
        trigger: "Ravi opens the Reviews tab on the dashboard.",
        merchantDoes: [
          "Sees reputation score: 80/100 (up from 75 last week).",
          "Avg Google rating: 4.8 stars (12 reviews).",
          "Recent reviews list with full text + photo.",
          "Can respond to reviews from the dashboard (queued for Google API).",
        ],
        customerSees: "Indirect — but new customers searching 'bakery near me' see Sweet Crumb with 4.8 stars + photos.",
        businessOutcome: "Reputation becomes a tracked metric, not a vague feeling. Owner can correlate review activity with footfall.",
      },
      {
        name: "Negative review recovery",
        actor: "Manager",
        trigger: "Customer leaves a 2-star review citing 'stale cake'.",
        merchantDoes: [
          "Sunita sees the review in real-time.",
          "Calls the customer within 2 hours. Apologizes. Offers a free replacement.",
          "Customer edits review to 4 stars: 'Owner reached out personally and fixed it. Great service recovery.'",
        ],
        customerSees: "Feels heard. Updates review. Tells friends about the great recovery.",
        businessOutcome: "Negative review converted into a positive one. Future customers see the recovery story — builds trust.",
      },
    ],
  },
  {
    id: "birthday-journey",
    number: 10,
    title: "Birthday Journey",
    tagline: "Birthday = highest-revenue visit of the year. Automated, personalized, never missed.",
    priority: "high",
    scenes: [
      {
        name: "Birthday capture",
        actor: "Cashier + Customer",
        trigger: "New customer registers. Cashier asks 'When's your birthday?'",
        merchantDoes: [
          "Cashier enters birthday (month + day) during registration.",
          "System schedules the birthday journey automatically.",
        ],
        customerSees: "Just answered a casual question. Doesn't feel like marketing.",
        businessOutcome: "~70% of customers share birthday when asked casually. Sweet Crumb now has a year-round reason to reach out.",
      },
      {
        name: "7-day reminder",
        actor: "System",
        trigger: "7 days before customer's birthday.",
        merchantDoes: "Nothing — automated.",
        customerSees: "WhatsApp: 'Hi Meera! 🎂 Your birthday is coming up. Sweet Crumb has a free slice waiting for you this week!'",
        businessOutcome: "Customer is reminded the bakery exists. Plans to visit. Mentions to friends 'it's my birthday, let's get cake'.",
      },
      {
        name: "Birthday visit & redemption",
        actor: "Customer + Cashier",
        trigger: "Meera visits during her birthday week.",
        merchantDoes: [
          "Cashier sees a '🎂 Birthday reward ready' badge on Meera's profile.",
          "Taps 'Redeem Birthday Reward'.",
          "3 bonus stamps awarded + free slice handed over.",
          "Cashier says 'Happy Birthday Meera!'",
        ],
        customerSees: [
          "Free slice + 3 bonus stamps + warm birthday wishes.",
          "Feels special. Often brings family (who also register).",
        ],
        businessOutcome: "Birthday customer brings 2.3 people on average. Ticket size 2.5x normal. Highest ROI visit of the year.",
      },
      {
        name: "Birthday cake pre-order (upsell)",
        actor: "Customer (Kavya, Platinum VIP)",
        trigger: "Kavya's birthday is in 2 weeks. She wants a custom cake.",
        merchantDoes: [
          "System sends Kavya a personalized offer: 'As a Platinum VIP, get 20% off your birthday cake pre-order.'",
          "Kavya pre-orders a ₹2,500 cake for ₹2,000.",
        ],
        customerSees: "VIP-feeling offer + a beautiful custom cake on her birthday.",
        businessOutcome: "High-ticket upsell. Locks in revenue before the birthday even arrives.",
      },
      {
        name: "Missed birthday (recovery)",
        actor: "System",
        trigger: "Customer didn't visit during birthday week.",
        merchantDoes: [
          "System marks birthday as 'missed' after window closes.",
          "Sends a 'belated' message: 'We missed you on your birthday! Here's a belated treat — valid for 3 more days.'",
        ],
        customerSees: "Belated offer. Often still redeems.",
        businessOutcome: "Doesn't waste the birthday data. Recovery rate ~20%.",
      },
    ],
  },
  {
    id: "first-refund",
    number: 11,
    title: "First Refund — The Trust-Building Moment",
    tagline: "How a merchant handles their first refund decides if the customer ever returns.",
    priority: "high",
    scenes: [
      {
        name: "Refund request",
        actor: "Customer (Meera) + Cashier",
        trigger: "Meera returns a cake: 'It was stale.'",
        merchantDoes: [
          "Cashier listens, apologizes, calls manager.",
          "Manager Sunita opens the original bill, taps 'Refund'.",
          "System reverses the 1 stamp awarded for that bill.",
          "Sunita offers Meera a replacement cake or full refund. Meera chooses replacement.",
        ],
        customerSees: [
          "Smooth handling — no friction, no defensive behavior.",
          "Stamp count drops from 7/9 to 6/9 (reflects the reversed stamp).",
          "WhatsApp: 'Your bill SC-2026-0008 has been refunded. 1 stamp reversed. We're sorry for the inconvenience.'",
        ],
        businessOutcome: "Handled well, a refund becomes a loyalty moment. Meera tells 2 friends how well Sweet Crumb handled her complaint.",
      },
    ],
  },
  {
    id: "lost-whatsapp-number",
    number: 12,
    title: "Lost WhatsApp Number",
    tagline: "Customer changed phones, lost WhatsApp. How do they keep earning stamps?",
    priority: "high",
    scenes: [
      {
        name: "Phone change",
        actor: "Customer + Cashier",
        trigger: "Meera walks in: 'I changed my phone, lost WhatsApp at the old number.'",
        merchantDoes: [
          "Cashier opens Meera's profile, updates her phone number.",
          "System validates the new number isn't already registered to another customer.",
          "All future WhatsApp messages go to the new number.",
          "Stamp balance is intact — identified by name + face, not phone.",
        ],
        customerSees: "Next visit, WhatsApp notifications arrive at the new number. No loyalty loss.",
        businessOutcome: "Loyalty is tied to the customer, not the phone. Zero churn from phone changes.",
      },
      {
        name: "Lost WhatsApp access (no new number)",
        actor: "Customer",
        trigger: "Customer uninstalled WhatsApp. Doesn't want it back.",
        merchantDoes: [
          "Cashier toggles 'WhatsApp opt-in: off' on the customer's profile.",
          "Future stamps still awarded at POS — customer just doesn't get WhatsApp notifications.",
          "Customer can ask cashier 'How many stamps do I have?' anytime.",
        ],
        customerSees: "Still earns stamps. Just no WhatsApp. Cashier tells them their balance on request.",
        businessOutcome: "Loyalty program works for non-WhatsApp customers too. No lock-in to one platform.",
      },
    ],
  },
  {
    id: "birthday-cake-order",
    number: 13,
    title: "Birthday Cake Pre-Order Journey",
    tagline: "From 'I need a cake for Saturday' to a confirmed order + birthday stamp bonus.",
    priority: "high",
    scenes: [
      {
        name: "Pre-order capture",
        actor: "Customer + Cashier",
        trigger: "Customer walks in Wednesday: 'I need a birthday cake for Saturday.'",
        merchantDoes: [
          "Cashier opens Pre-Order form: cake type, size, message, pickup time.",
          "Customer pays 50% advance. Pre-order confirmed.",
          "System tags the customer's profile with the upcoming birthday.",
        ],
        customerSees: "Receipt + WhatsApp: 'Your birthday cake pre-order is confirmed for Saturday 4 PM. Balance: ₹1,250.'",
        businessOutcome: "Locks in revenue. Bakery can plan production. Customer committed.",
      },
      {
        name: "Pickup day",
        actor: "Customer + Cashier",
        trigger: "Customer returns Saturday to pick up the cake.",
        merchantDoes: [
          "Cashier opens the pre-order, marks 'Picked up'.",
          "Customer pays balance. Bill created.",
          "Customer gets 1 stamp on the cake bill + 3 birthday bonus stamps (if it's their birthday week).",
        ],
        customerSees: "Beautiful cake + 4 stamps total. Feels like a birthday gift from the bakery.",
        businessOutcome: "High-ticket sale + birthday customer retained for next year.",
      },
    ],
  },
  {
    id: "festival-rush",
    number: 14,
    title: "Festival Rush (Diwali / Christmas)",
    tagline: "10x normal volume. POS can't slow down. Loyalty program must survive the rush.",
    priority: "high",
    scenes: [
      {
        name: "Pre-festival prep",
        actor: "Manager",
        trigger: "Diwali is in 1 week. Expected 5x footfall.",
        merchantDoes: [
          "Sunita pre-stocks reward items (extra cupcakes, pastries).",
          "Updates reward stock in system: 'Free Cupcake' 999 in stock.",
          "Schedules extra cashier staff for the rush days.",
          "Pre-sends WhatsApp broadcast to all customers: 'Diwali special — double stamps on all orders above ₹500!'",
        ],
        customerSees: "Diwali offer WhatsApp + knows about double stamps.",
        businessOutcome: "Rush is anticipated. No out-of-stock mid-rush. Customers pre-planned to visit.",
      },
      {
        name: "Rush day operations",
        actor: "Cashier",
        trigger: "Diwali day. Queue of 25 customers.",
        merchantDoes: [
          "Cashier uses 'Last 4 digits' search + 'Recent customers' to identify quickly.",
          "Bill entry takes ~25 seconds per customer (vs 60s normally — slower because larger orders).",
          "Stamps awarded automatically. WhatsApp queue bursts but flushes within minutes.",
          "Owner Ravi monitors from home, redirects WhatsApp queue to backup provider if main one lags.",
        ],
        customerSees: "Fast-moving queue. Double stamps land on WhatsApp within 5 minutes.",
        businessOutcome: "Rush handled without chaos. 100+ bills in 4 hours. Zero complaints.",
      },
      {
        name: "Post-festival follow-up",
        actor: "System",
        trigger: "Diwali is over.",
        merchantDoes: [
          "System auto-sends review requests to all customers who redeemed rewards during Diwali.",
          "10 new Google reviews in 3 days. Rating holds at 4.8.",
        ],
        customerSees: "Review request WhatsApp + bonus stamps for reviewing.",
        businessOutcome: "Festival converts into reputation boost. New customers searching 'bakery near me' find Sweet Crumb.",
      },
    ],
  },
  {
    id: "staff-resigns",
    number: 15,
    title: "Staff Resigns — Security & Continuity",
    tagline: "Priya quits. Her PIN must be revoked instantly. Her bills stay in the audit log.",
    priority: "high",
    scenes: [
      {
        name: "Resignation day",
        actor: "Owner",
        trigger: "Priya gives 1 week notice.",
        merchantDoes: [
          "Ravi suspends Priya's account on her last day (status: suspended).",
          "Her PIN 3333 no longer works at POS.",
          "All her past bills remain in the audit log attributed to her name.",
          "Ravi creates a new cashier account for her replacement.",
        ],
        customerSees: "No visible change. New cashier just continues.",
        businessOutcome: "No security risk. No data loss. Continuity preserved. Audit trail intact for past transactions.",
      },
    ],
  },
  {
    id: "duplicate-customer",
    number: 16,
    title: "Duplicate Customer — Merge & Clean",
    tagline: "Same customer registered twice with slightly different names. How to fix without losing history.",
    priority: "high",
    scenes: [
      {
        name: "Duplicate detected",
        actor: "Cashier",
        trigger: "Customer walks in, gives phone. Search shows 2 records: 'Meera Iyer' and 'Meera Iyer ( Bakry )'.",
        merchantDoes: [
          "Cashier flags the duplicate to manager.",
          "Sunita opens both profiles, compares bills/stamps.",
          "Merges: 'Meera Iyer ( Bakry )' into 'Meera Iyer'.",
          "All bills, stamps, redemptions from the duplicate are migrated to the canonical record.",
          "Duplicate record soft-deleted.",
        ],
        customerSees: "Nothing visible. Next visit, all their history is under one record.",
        businessOutcome: "Clean data. No stamp inflation from duplicates. Customer profile is single source of truth.",
      },
    ],
  },
  {
    id: "reward-out-of-stock-alt",
    number: 17,
    title: "Reward Out of Stock — Alternative Offer",
    tagline: "Customer wants the free brownie. It's out of stock. Don't lose the moment.",
    priority: "high",
    scenes: [
      {
        name: "Out-of-stock redemption attempt",
        actor: "Customer + Cashier",
        trigger: "Kavya wants to redeem 'Free Brownie' — system shows stock = 0.",
        merchantDoes: [
          "POS shows: 'Reward out of stock. Offer alternatives?'",
          "Cashier offers: 'We're out of brownies. Would you like a free cupcake instead, or shall I save your card for when brownies are back?'",
          "Kavya chooses cupcake. Cashier overrides reward selection.",
        ],
        customerSees: "Got an alternative immediately. Didn't lose her completed card.",
        businessOutcome: "Customer not penalized for merchant's stock issue. Alternative redemption converts a would-be disappointment into a positive moment.",
      },
    ],
  },
  {
    id: "merchant-changes-reward-rules",
    number: 18,
    title: "Merchant Changes Reward Rules Mid-Program",
    tagline: "Bakery decides to switch from 'buy 9 get 1' to 'buy 6 get 1'. What happens to existing cards?",
    priority: "high",
    scenes: [
      {
        name: "Rule change decision",
        actor: "Owner",
        trigger: "Ravi finds that 9 stamps feels too far away for customers. Wants to make it 6.",
        merchantDoes: [
          "Ravi edits the active stamp card: 9 → 6 stamps required.",
          "System shows impact preview: '3 customers currently at 6+ stamps will immediately have completed cards. 8 customers at 4-5 stamps are now 1-2 away.'",
          "Ravi confirms. New rule applies immediately.",
          "Customers at 6+ stamps get auto-completion + WhatsApp 'reward ready'.",
        ],
        customerSees: [
          "Some customers suddenly see their card completed — delightful surprise.",
          "Others see their progress bar jump closer to the goal.",
        ],
        businessOutcome: "Rule change becomes a positive event, not a confusing one. System handles the transition gracefully.",
      },
      {
        name: "Reward cost change",
        actor: "Owner",
        trigger: "Ravi wants to make 'Free Cupcake' cost 2 cards instead of 1 (cost concerns).",
        merchantDoes: [
          "Edits the reward: stampsCost 1 → 2.",
          "System warns: 'Customers with 1 completed card but no second card can no longer redeem. Consider grandfathering them.'",
          "Ravi chooses 'Grandfather existing completed cards for 30 days'.",
          "Existing completed cards remain redeemable at old cost for 30 days. New cards follow new rules.",
        ],
        customerSees: "Existing customers not surprised. New customers see updated cost.",
        businessOutcome: "Merchant can adjust economics without burning loyal customers. Trust preserved.",
      },
    ],
  },
  {
    id: "customer-upgrades-vip",
    number: 19,
    title: "Customer Upgrades to VIP — The Big Moment",
    tagline: "The exact moment a customer crosses into Gold or Platinum tier. Make it memorable.",
    priority: "high",
    scenes: [
      {
        name: "Spend threshold crossed",
        actor: "Customer (Meera)",
        trigger: "Meera's bill of ₹450 pushes her lifetime spend past ₹5,000.",
        merchantDoes: [
          "Cashier sees a confetti animation on the POS: '🎉 Meera just became a Gold Member!'",
          "Cashier says: 'Meera, congratulations — you just hit Gold status!'",
          "System auto-sends WhatsApp upgrade message + grants Gold achievement badge.",
          "Free birthday reward auto-scheduled for Meera's next birthday.",
        ],
        customerSees: [
          "Surprise celebration at the counter.",
          "WhatsApp: '🎉 You're now a Gold Member! Enjoy 20% bonus stamps on every visit + a free birthday reward.'",
          "Profile shows gold border + new achievement badge.",
        ],
        businessOutcome: "Tier upgrade becomes a story Meera tells. Her emotional investment in the bakery deepens. She will defend her tier against competitor offers.",
      },
    ],
  },
  {
    id: "merchant-changes-phone",
    number: 20,
    title: "Merchant Changes Their Own Phone",
    tagline: "Owner lost their phone. POS access, 2FA, audit trail — what's the recovery path?",
    priority: "high",
    scenes: [
      {
        name: "Phone lost",
        actor: "Owner",
        trigger: "Ravi loses his phone with the POS app + WhatsApp.",
        merchantDoes: [
          "Ravi logs in from a new device using email + recovery PIN.",
          "Old phone's POS session auto-expires.",
          "Ravi updates merchant WhatsApp number to new phone.",
          "All future customer WhatsApp notifications come from new number.",
          "Audit log captures: MERCHANT_PHONE_CHANGED with timestamp.",
        ],
        customerSees: "Next WhatsApp message comes from a new number. Brief confusion possible — system sends a 'We've updated our number' broadcast.",
        businessOutcome: "Recovery in 10 minutes. No data loss. No security gap.",
      },
    ],
  },
  {
    id: "reward-expiry",
    number: 21,
    title: "Reward Expiry",
    tagline: "Completed stamp cards don't last forever. But expiry should feel fair, not punitive.",
    priority: "medium",
    scenes: [
      {
        name: "Default policy",
        actor: "System",
        trigger: "Customer completes a card but doesn't redeem within 90 days.",
        merchantDoes: [
          "Default rule: completed cards expire 90 days after completion.",
          "30 days before expiry: WhatsApp reminder 'Your free reward expires in 30 days. Visit us!'",
          "7 days before: 'Last chance! Your free reward expires in 7 days.'",
          "Day of: card expired, stamps lost. Customer notified.",
        ],
        customerSees: "Two reminders + final notice. Fair warning.",
        businessOutcome: "Rewards don't sit on the books forever. Accounting cleaner. Customers motivated to redeem (which means another visit).",
      },
      {
        name: "Manual extension",
        actor: "Manager",
        trigger: "Loyal customer missed the expiry window. Asks manager for grace.",
        merchantDoes: [
          "Sunita opens the expired card, clicks 'Extend by 30 days'.",
          "Card is reactivated. Customer notified.",
        ],
        customerSees: "WhatsApp: 'Good news! We've extended your free reward by 30 days.'",
        businessOutcome: "Manager has discretion for VIP cases. Loyalty preserved over rigid rules.",
      },
    ],
  },
  {
    id: "multi-branch",
    number: 22,
    title: "Multi-Branch Expansion (Future-Proof)",
    tagline: "Sweet Crumb opens a 2nd location. Same loyalty program across both.",
    priority: "medium",
    scenes: [
      {
        name: "Branch 2 opening",
        actor: "Owner",
        trigger: "Ravi opens a second Sweet Crumb location in the next neighborhood.",
        merchantDoes: [
          "Ravi creates a new Branch record under his merchant account.",
          "Branch 2 has its own staff, its own POS, its own inventory.",
          "Loyalty program is shared: customer registered at Branch 1 can earn/redeem at Branch 2.",
          "Reports can be filtered by branch or aggregated.",
        ],
        customerSees: "Walks into Branch 2, gives phone, system recognizes them from Branch 1. Seamless.",
        businessOutcome: "Loyalty scales with the business. Customer doesn't have to re-register. Cross-branch visits deepen loyalty.",
      },
    ],
  },
  {
    id: "family-accounts",
    number: 23,
    title: "Family Accounts",
    tagline: "Mother, father, son — same household. Shared rewards? Separate? Flexible.",
    priority: "medium",
    scenes: [
      {
        name: "Family registration",
        actor: "Customer + Cashier",
        trigger: "Meera comes in with her son. 'Can my son use my stamp card?'",
        merchantDoes: [
          "Cashier explains: 'Each person gets their own card for fairness. But you can refer him — you both get bonus stamps.'",
          "Cashier registers the son as a new customer, marks 'referred by Meera'.",
          "Son gets his own card + 1 referral bonus stamp. Meera gets 1 referral bonus stamp too.",
        ],
        customerSees: "Son feels independent. Meera gets referral bonus. Family engaged.",
        businessOutcome: "Avoids the 'shared card' problem (one person does all the earning, others feel left out). Referral mechanics multiply household engagement.",
      },
    ],
  },
  {
    id: "merchant-support",
    number: 24,
    title: "Merchant Support Journey",
    tagline: "When the merchant has a problem, support must feel like a partner, not a vendor.",
    priority: "medium",
    scenes: [
      {
        name: "Issue discovered",
        actor: "Merchant",
        trigger: "Ravi notices stamp notifications are delayed by 10+ minutes.",
        merchantDoes: [
          "Opens Support tab, clicks 'New Ticket'.",
          "Category: WhatsApp. Priority: Normal. Description: 'Yesterday some stamp notifications took 10+ minutes to deliver. Please check.'",
          "Ticket submitted.",
        ],
        customerSees: "Indirect — customers eventually get their notifications.",
        businessOutcome: "Merchant can self-serve issue reporting. No email back-and-forth.",
      },
      {
        name: "Resolution",
        actor: "Support team",
        trigger: "Support team picks up the ticket.",
        merchantDoes: [
          "Receives WhatsApp update: 'Your ticket #1234 is being investigated.'",
          "2 hours later: 'Resolved — WhatsApp provider had a temporary outage. Queue flushed; all messages delivered. Monitoring in place.'",
          "Ticket marked resolved in dashboard. Ravi can rate the support experience.",
        ],
        customerSees: "Indirect.",
        businessOutcome: "Issue closed loop. Merchant trusts the support system. Future issues filed faster.",
      },
    ],
  },
  {
    id: "customer-delete-gdpr",
    number: 25,
    title: "Customer Data Deletion (GDPR / DPDP)",
    tagline: "Customer asks 'Delete my data'. Workflow must be clean, audited, and reversible for 30 days.",
    priority: "medium",
    scenes: [
      {
        name: "Deletion request",
        actor: "Customer + Owner",
        trigger: "Meera emails Ravi: 'Please delete my data.'",
        merchantDoes: [
          "Ravi opens Meera's profile, clicks 'Request Data Deletion'.",
          "System requires a reason + owner confirmation.",
          "Meera's record is soft-deleted: she no longer appears in customer lists, no new WhatsApp messages sent to her.",
          "Her data is retained in cold storage for 30 days (in case of accidental deletion or audit needs).",
          "After 30 days: hard delete. All her stamps, bills, redemptions, reviews permanently removed.",
        ],
        customerSees: "WhatsApp: 'Your data deletion request has been received. Your information will be permanently removed in 30 days. Reply CANCEL to undo.'",
        businessOutcome: "Compliant with Indian DPDP Act + GDPR. Reversible for 30 days protects against mistakes. Audit trail shows deletion was intentional.",
      },
    ],
  },
  {
    id: "inventory-integration",
    number: 26,
    title: "Inventory Integration",
    tagline: "Reward stock isn't a manual field. It's tied to real inventory. Sold-out cake = sold-out reward.",
    priority: "medium",
    scenes: [
      {
        name: "Stock sync",
        actor: "System",
        trigger: "Merchant's POS inventory shows 0 cupcakes left after the last sale.",
        merchantDoes: [
          "System auto-updates 'Free Cupcake' reward stock to 0.",
          "Any redemption attempt now shows 'Out of stock — pick alternative'.",
          "Manager gets an alert: 'Restock cupcakes to reactivate Free Cupcake reward.'",
        ],
        customerSees: "If they try to redeem, they're offered alternatives (per Chapter 16).",
        businessOutcome: "No more phantom rewards. Inventory and loyalty stay in sync. Customer never promised something that doesn't exist.",
      },
      {
        name: "Restock",
        actor: "Manager",
        trigger: "Sunita bakes 24 fresh cupcakes.",
        merchantDoes: [
          "POS inventory updated: cupcakes = 24.",
          "Reward stock auto-restored to 24.",
          "Pending redemptions can proceed.",
        ],
        customerSees: "Reward available again. If they had been waiting, they get a WhatsApp: 'Good news! Free Cupcake is back in stock.'",
        businessOutcome: "Inventory changes automatically propagate to loyalty. Zero manual sync work.",
      },
    ],
  },
]
