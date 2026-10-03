# DIGITAL BUSINESS CARD — STRICT SOP
## CustomerPilot Platform | Version 2.0 | Effective: 03 Oct 2026

NON-NEGOTIABLE: This SOP is MANDATORY for every Digital Business Card creation or update.
No step can be skipped. If any verification step FAILS, the card MUST NOT be presented to
the user until fixed. ACCURACY IS NON-NEGOTIABLE.

---

## OVERVIEW

Every card must go through 6 mandatory stages:

  Stage 1: Intent & Merchant Identification
  Stage 2: Ground-Truth Data Extraction (Strict Rules)
  Stage 3: Database Seeding & Validation
  Stage 4: Playwright Live Output Verification (MANDATORY GATE)
  Stage 5: CodeRabbit Code & Security Audit
  Stage 6: User Presentation & Permission Gate

NO result is shown to the user until Stage 4 passes 100%.

---

## ABSOLUTE NON-NEGOTIABLE RULES

R-1: ACCURACY IS NON-NEGOTIABLE. Zero tolerance for incorrect phone, address, rating, reviews, or area.
R-2: NO DUMMY DATA. Zero instances of 98765, 12345, lorem ipsum, example.com, or any placeholder.
R-3: ONLY GOOGLE REVIEWS AND GOOGLE RATING. Never use Zomato/Swiggy counts unless user explicitly asks.
R-4: EXACT BRANCH PINNING. If the user provides a branch-specific link, extract ONLY that branch's data.
     Never fall back to brand HQ data.
R-5: NO NEIGHBORING LISTING CONFLATION. Never mix data from nearby businesses.
R-6: PLAYWRIGHT VERIFICATION MUST PASS 100% before showing any result.
R-7: NO git push or VPS deploy without explicit user confirmation ("kaam kar raha hai", "confirmed", "working").
R-8: CodeRabbit is NOT a fact-checker. It only checks code quality.
     Business data is verified separately in Stage 4.

---

## STAGE 1: INTENT & MERCHANT IDENTIFICATION

### 1.1 Supported Input Types

  - Google Maps shortlink: https://share.google/xxxxx
  - Google Maps redirect: https://maps.app.goo.gl/xxxxx
  - Full Google Maps URL: https://www.google.com/maps/place/...
  - Business name + city: "Gujarat Photo Goods, Vadodara"

### 1.2 Resolve the Link

  1. Fetch the URL to get the final redirect destination.
  2. Extract the kgmid (Knowledge Graph ID, e.g., /g/11j_8p2qh8).
  3. Extract the full business q= query parameter.
  4. Document the exact resolved URL and kgmid BEFORE proceeding.

### 1.3 Confirm Exact Business Identity

  Before extracting any data, confirm:
    - Exact official business name (including branch qualifiers like "(Nizmapura wala)")
    - The listing's city, area, and locality
    - That this is NOT a brand HQ if user intended a specific branch

  BRANCH TRAP WARNING:
  If the business name contains qualifiers like "(Manjalpur wala)", "(Nizmapura wala)",
  "(Stadium Road)", it is a SPECIFIC BRANCH of a larger brand.
  Extract ONLY that branch's data — NOT the main brand website or any other outlet.

  Real failure example:
  Tasty Vadapav (Nizmapura wala) at Manjalpur branch — scraper fell back to
  tastyvadapav.com which listed the Nizampura HQ address and phone instead of the
  Manjalpur branch. This resulted in completely wrong card data.

---

## STAGE 2: GROUND-TRUTH DATA EXTRACTION

### 2.1 Primary Source: Google Business Profile

  Extract ONLY from the official Google Business Profile for the exact listing:

  | Field              | Source                                                      |
  | Business Name      | Google Knowledge Panel title (exact, with qualifiers)       |
  | Address            | Google Maps "Address" field for THIS specific listing       |
  | Phone Number       | Google Maps "Phone" / "Call" field for THIS listing         |
  | WhatsApp Number    | Same as phone unless merchant specifies otherwise           |
  | Google Rating      | Stars shown on THIS listing (e.g., 3.5)                    |
  | Google Reviews     | Number of Google reviews (e.g., 55)                        |
  | Business Hours     | "Hours" section for THIS specific listing                   |
  | Category           | Google Business Profile category (e.g., "Indian Takeout")  |

### 2.2 Secondary Source Rules (Only If Google Is Unavailable)

  ALLOWED fallback sources (strict priority order):
    1. Zomato listing for the EXACT restaurant branch
    2. Swiggy listing for the EXACT restaurant branch
    3. JustDial listing for the EXACT outlet

  FORBIDDEN fallbacks:
    - Brand's main website (e.g., tastyvadapav.com, gujaratphotogoods.in)
      It only has HQ data, NOT branch-specific data.
    - Any neighboring listing in search results
    - Any AI-hallucinated or assumed data

### 2.3 Data Verification Checklist (Before Writing to DB)

  [ ] Business Name: Exact name from Google listing (including branch qualifiers)
  [ ] Address: Exact address on Google Maps for THIS branch (copy verbatim)
  [ ] Phone Number: Visible on Google Maps "Call" button for THIS branch
  [ ] WhatsApp: Same as calling number (or as specified)
  [ ] Google Rating: Exact decimal from Google listing (e.g., 3.5 NOT 4.3)
  [ ] Google Reviews Count: Exact integer from Google listing (e.g., 55 NOT 5430)
  [ ] Timings: Exact hours from Google listing for THIS branch
  [ ] Category: From Google Business Profile
  [ ] Logo URL: Only from official merchant website (skip if unavailable)
  [ ] Ordering Links: Zomato/Swiggy/Website for THIS specific branch
  [ ] Direction URL: Google Maps deep link for THIS exact branch location

### 2.4 Rating and Reviews — Strict Policy

  CORRECT:
    googleRating: 3.5           <- From Google listing
    googleReviewsCnt: 55        <- From Google listing

  WRONG (FORBIDDEN):
    googleRating: 4.3           <- This is Zomato/Swiggy aggregate. FORBIDDEN.
    googleReviewsCnt: 5430      <- This is delivery app count. FORBIDDEN.

  DELIVERY PLATFORM COUNTS:
    Display ONLY IF user explicitly requests it.
    Label it clearly as "Delivery Ratings" — NEVER as "Google Reviews".

---

## STAGE 3: DATABASE SEEDING AND VALIDATION

### 3.1 Required DB Fields (All Must Be Real Data)

  {
    displayName:      'Exact Business Name (Branch wala)',
    subCategories:    'Category, SubCategory, Area',
    locationShort:    'ExactArea',           // Branch area only (e.g., "Manjalpur")
    locationState:    'City, State',         // (e.g., "Vadodara, Gujarat")
    phoneNumber:      '+91 XXXXX XXXXX',     // From Google listing for THIS branch
    whatsappNumber:   '91XXXXXXXXXX',        // 10-digit with 91 prefix
    googleRating:     X.X,                  // From Google ONLY
    googleReviewsCnt: XX,                   // From Google ONLY
    businessHours:    'Open Daily, HH:MM AM to HH:MM PM',
    googleMapsUrl:    'https://maps.google.com/...',  // Branch-specific
  }

### 3.2 Post-Seed DB Verification (Python)

  Run immediately after seeding:

    import sqlite3
    conn = sqlite3.connect('prisma/dev.db')
    c = conn.cursor()
    row = c.execute(
      "SELECT displayName, locationShort, phoneNumber, "
      "whatsappNumber, googleRating, googleReviewsCnt "
      "FROM DigitalBusinessCard WHERE slug = 'merchant-slug'"
    ).fetchone()
    print("DB State:", row)
    conn.close()

  Verify EACH field matches the ground-truth checklist.
  DO NOT proceed to Stage 4 if any DB field is wrong.

---

## STAGE 4: PLAYWRIGHT LIVE OUTPUT VERIFICATION (MANDATORY GATE)

This is the MOST CRITICAL stage. It is the ONLY way to verify what the user actually sees.
CodeRabbit CANNOT replace this stage. MUST pass 100% before showing any result.

### 4.1 Start the Dev Server

  npx next dev --webpack -p 3000
  Wait for: "Ready in X.Xs"
  Confirm: http://localhost:3000/c/[slug] responds HTTP 200

### 4.2 Mandatory Assertions (scripts/verify_[slug]_card.js)

  const assertions = [
    // BUSINESS IDENTITY
    { label: 'Exact store name visible',
      pass: bodyText.includes('ExactBusinessName') },

    // GOOGLE RATING (must be Google, not Zomato)
    { label: 'Google Rating X.X',
      pass: bodyText.includes('X.X') },
    { label: 'Google Reviews Count XX',
      pass: bodyText.includes('XX') },

    // LOCATION (must be branch, not HQ)
    { label: 'Branch area visible',
      pass: bodyText.includes('ExactBranchArea') },

    // PHONE NUMBER
    { label: 'Real phone XXXXX XXXXX',
      pass: bodyText.includes('XXXXX XXXXX') },

    // TIMING
    { label: 'Correct opening time',
      pass: bodyText.includes('HH:MM') },

    // ZERO DUMMY DATA (non-negotiable)
    { label: 'Zero dummy 98765',
      pass: !bodyText.includes('98765') },
    { label: 'Zero 12345',
      pass: !bodyText.includes('12345') },
    { label: 'Zero lorem ipsum',
      pass: !bodyText.toLowerCase().includes('lorem ipsum') },

    // UI SPEC
    { label: 'Online Ordering Platforms section',
      pass: /online ordering platforms/i.test(bodyText) },
    { label: 'Save Contact button',
      pass: /save contact/i.test(bodyText) },
  ];

  // Mandatory font check
  const h1Font = await page.$eval('h1', el => window.getComputedStyle(el).fontFamily);
  // Must contain 'Times New Roman' or 'times' (case-insensitive)

  // Mandatory logo check
  const logoLoaded = await page.$eval(
    'img[alt*="BusinessName"]',
    el => el.complete && el.naturalWidth > 0
  );

  // Mandatory screenshot
  await page.screenshot({
    path: 'artifacts/[slug]_card_verified_[YYYYMMDD].png',
    fullPage: false   // Mobile viewport 412x915
  });

### 4.3 Verification Pass Criteria

  ALL of the following MUST be TRUE before user presentation:
    - HTTP 200 from the card URL
    - Correct exact business name (with qualifiers)
    - Correct Google Rating (decimal, matches listing)
    - Correct Google Review Count (integer, matches listing)
    - Correct area/branch (NOT brand HQ)
    - Correct phone number
    - Correct business hours
    - ZERO dummy/placeholder data
    - Times New Roman font on non-link text (h1 element)
    - Logo image loaded (naturalWidth > 0)
    - Screenshot captured AND visually reviewed

  If ANY assertion fails -> Fix -> Re-run Stage 3 and Stage 4 -> DO NOT show user.

---

## STAGE 5: CODERABBIT CODE AND SECURITY AUDIT

CodeRabbit is a code-level tool. It CANNOT verify real-world business data.
Stage 4 handles data accuracy. Stage 5 handles code quality.

### 5.1 What CodeRabbit Checks
  - TypeScript null safety (no undefined errors)
  - XSS prevention (all external URLs sanitized via sanitizeUrl)
  - SQL/ORM injection prevention (Prisma parameterized queries)
  - No secret/API key exposure in committed code
  - No unnecessary re-renders
  - SSR hydration safety (no window/document on server)
  - ARIA accessibility on buttons and images

### 5.2 What CodeRabbit CANNOT Check
  - Is the phone number correct for this specific branch?
  - Does this rating match Google's listing?
  - Is this the Manjalpur or Nizampura branch?
  - Is this the correct logo for this merchant?
  - Is the address real and accurate?

### 5.3 Severity Gate
  CRITICAL findings -> Fix immediately before any commit
  MAJOR findings   -> Fix immediately before any commit
  MINOR findings   -> Fix before final git commit
  CLEAN            -> Proceed to Stage 6

---

## STAGE 6: USER PRESENTATION AND PERMISSION GATE

### 6.1 What to Present to User

  ### Digital Business Card: [Business Name] — Verified

  Ground-Truth Data (100% Verified from Google Listing):
  | Field          | Verified Value                  |
  | Business Name  | [exact name with qualifiers]    |
  | Branch / Area  | [exact area — NOT brand HQ]     |
  | Full Address   | [verbatim from Google Maps]     |
  | Calling Phone  | [from Google "Call" button]     |
  | WhatsApp       | [number]                        |
  | Google Rating  | [X.X]                           |
  | Google Reviews | [XX Reviews]                    |
  | Timings        | [hours]                         |

  Playwright Verification: ALL XX/XX assertions passed
  CodeRabbit Audit: Clean / [findings list]
  Screenshot: [visual screenshot]
  Live URL: http://localhost:3000/c/[slug]

  STOP — Fix is committed locally.
  Please test manually and confirm it is working.
  I will NOT push to Git or deploy to VPS until you confirm.

### 6.2 Mandatory Git Push Protocol

  Step 1: git add [changed files]
  Step 2: git commit -m "fix(digital-card): [description with merchant name]"
  Step 3: STOP — Tell user: "Fix committed locally. Please test and confirm."
  Step 4: Wait for explicit user confirmation
          Accepted: "kaam kar raha hai", "confirmed", "yes push", "working", "done"
  Step 5: ONLY THEN run: git push

  STRICT VIOLATION: Pushing or deploying to VPS (200.97.170.53) before user
  confirmation is ABSOLUTELY FORBIDDEN.

---

## UI DESIGN STANDARDS

  Non-link text (Title, Category, Info, Headers):
    Font: Times New Roman, Times, serif

  Action Buttons:
    Style: Light card (bg-white/80 with subtle border)
    NOT dark gradients (e.g., NOT bg-gradient-to-r)

  Social Media Icons:
    Circular badge (w-11 h-11) with official brand color
    NOT full-button color fill

  WhatsApp Icon:
    Official single-bubble telephone logo inside #25D366 circle

  Logo Container:
    w-48 h-24 rounded-2xl object-contain
    Preserves both square and horizontal logos without distortion

  Floating Widget:
    usePathname() gating: MUST be hidden on all /c/, /s/, /queue/ routes

  Rating Display:
    Google G multi-color logo + decimal rating + "X Reviews"
    NEVER label as "Delivery Ratings" unless user asked

---

## MANDATORY FILE CHECKLIST PER MERCHANT

  | File                            | Purpose                            | Required?  |
  | scripts/seed_[slug].js          | Seeds DB with ground-truth data    | Mandatory  |
  | scripts/verify_[slug]_card.js   | Playwright assertions + screenshot | Mandatory  |
  | public/uploads/[slug]-logo.png  | Merchant logo from official site   | If available |
  | RESOLVED_ISSUES_LOG.md          | Bug fix documentation              | Mandatory  |

---

## COMMON MISTAKES — LESSONS LEARNED (NEVER REPEAT)

  Mistake: Nizampura HQ instead of Manjalpur branch
  Root Cause: Fallback to brand website
  Prevention: NEVER use brand website as fallback for branch data

  Mistake: 4.9 instead of 4.5 rating
  Root Cause: Neighboring listing conflated
  Prevention: Match kgmid exactly; assert exact rating in Playwright

  Mistake: 5430 reviews instead of 55
  Root Cause: Delivery app count used instead of Google count
  Prevention: ONLY Google Reviews unless user says otherwise

  Mistake: Dark heavy buttons on card
  Root Cause: Default styling not overridden
  Prevention: Light card + circular icon badge is the ONLY standard

  Mistake: WhatsApp widget overlapping Save Contact
  Root Cause: No path-gating on global widget
  Prevention: usePathname() gating on all /c/ routes, always

  Mistake: No Times New Roman font applied
  Root Cause: System font fallback
  Prevention: CSS Times New Roman on all non-link text, always

  Mistake: Logo squished in 1:1 circle container
  Root Cause: Fixed dimensions
  Prevention: rounded-2xl object-contain w-48 h-24, always

  Mistake: Pushing to Git before user tested
  Root Cause: Impatience / skipping protocol
  Prevention: Git Push Protocol is NON-OPTIONAL, always

  Mistake: CodeRabbit treated as data verifier
  Root Cause: Misunderstanding CodeRabbit's scope
  Prevention: Stage 4 Playwright is the ONLY data verification tool

---

## FINAL SOP CHECKLIST (COMPLETE PER CARD, EVERY TIME)

  MERCHANT: _______________________________
  SLUG: ___________________________________
  DATE: ___________________________________

  STAGE 1 — IDENTIFICATION
  [ ] Share link resolved; kgmid documented
  [ ] Exact branch identity confirmed (NOT brand HQ)
  [ ] Business qualifiers noted (e.g., "(Nizmapura wala)")

  STAGE 2 — GROUND-TRUTH EXTRACTION
  [ ] Business Name: exact with qualifiers
  [ ] Address: branch-specific (NOT HQ), copied verbatim
  [ ] Phone: from Google "Call" button for this branch
  [ ] WhatsApp: confirmed
  [ ] Google Rating: decimal (NOT from Zomato/Swiggy)
  [ ] Google Reviews: integer (NOT delivery app count)
  [ ] Hours: from Google listing for this branch
  [ ] Category: from Google Business Profile
  [ ] Logo: from official website only (skipped if unavailable)
  [ ] Ordering Links: branch-specific URLs

  STAGE 3 — DATABASE
  [ ] Seed script created/updated with all real data
  [ ] DB record verified via Python/SQLite query
  [ ] All fields match ground-truth checklist above

  STAGE 4 — PLAYWRIGHT VERIFICATION (100% MANDATORY)
  [ ] Dev server running (HTTP 200 confirmed)
  [ ] Business name assertion: PASS
  [ ] Google Rating assertion: PASS
  [ ] Google Reviews Count assertion: PASS
  [ ] Branch area assertion: PASS (NOT brand HQ area)
  [ ] Phone number assertion: PASS
  [ ] Business hours assertion: PASS
  [ ] Zero dummy data assertion: PASS
  [ ] Times New Roman font assertion: PASS
  [ ] Logo loaded assertion: PASS
  [ ] Screenshot captured and visually reviewed

  STAGE 5 — CODERABBIT AUDIT
  [ ] No CRITICAL findings
  [ ] No MAJOR findings
  [ ] Minor findings addressed

  STAGE 6 — GIT AND USER GATE
  [ ] git add + git commit done locally
  [ ] User informed: "Please test manually"
  [ ] Awaiting explicit user confirmation before git push
  [ ] git push executed ONLY after confirmation
  [ ] RESOLVED_ISSUES_LOG.md updated with full report

---

This SOP supersedes all previous instructions for Digital Business Card creation.
Last updated: 03 Oct 2026 | CustomerPilot Platform
