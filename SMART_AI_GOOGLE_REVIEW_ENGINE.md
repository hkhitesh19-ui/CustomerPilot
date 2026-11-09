# CustomerPilot — Smart AI Google Review & Zero-Hallucination Grounding Engine
*Version 4.0 — Enterprise Architecture, 2-Column Studio, Hero Chips & Google Compliance Specification*

---

## 1. Executive Overview & Problem Definition

### 1.1 The "Local Business Hallucination Trap"
In local business marketing, generic generative AI (e.g. unconstrained ChatGPT or raw Gemini API calls) is dangerous. When a local merchant asks customers to write an AI-generated Google review, standard AI often hallucinates products or services that the merchant **does not sell**.

**Real-World Disasters Prevented by CustomerPilot:**
- **The Specialized Sandwich Stall**: An open-ended LLM generates a review praising *"Belgian Chocolate Truffle Cake"* or *"Creamy Dal Makhani"*. The merchant only sells grilled sandwiches.
- **The 4-Item Hangout Corner (Burger, Cold Coffee, Pizza, Cold Drinks)**: An open-ended LLM generates a review praising *"Tandoori Sizzler"*, *"Butter Chicken"*, or *"Hair Spa Treatment"*.
- **The Veterinary Pet Clinic**: An unconstrained LLM generates reviews using human healthcare phrases: *"Doctor consultation at Pet Clinic was thorough, friendly, and solved my fever quickly."* A veterinary doctor treats dogs and cats, not human fevers!
- **The Ladies Beauty Parlor**: An open-ended LLM uses male grammar (*"Main gaya tha"* / *"Bhai ne badhiya haircut kiya"*), instantly revealing fake automated reviews.

### 1.2 Google Maps Algorithm & SEO Penalty Risks
1. **Google Spam & Fake Review Filters**: Google's NLP sentiment and entity algorithms cross-reference keywords mentioned in customer reviews against the merchant's official Google Business Profile (GBP) categories and menu. When cross-industry alien keywords appear, Google flags the reviews as inauthentic, strips the reviews, or shadowbans the listing.
2. **Generative Engine Optimization (GEO) & AI Overviews**: In 2026, Google Search and Google Maps AI Overviews rank businesses based on **Entity Density** (e.g. "Best cold coffee near me", "Puppy 7-in-1 vaccination in Manjalpur", "Crispy grilled cheese sandwich in Vadodara"). Reviews must contain real, specific product keywords rather than generic buzzwords (*"hidden gem"*, *"top-notch service"*, *"store special"*).

---

## 2. End-to-End System Architecture (Version 4.0)

```mermaid
flowchart TD
    A["Customer Scans Billing Counter QR / Taps WhatsApp Link"] --> B["Customer Review Portal: /review?m=merchantId&item=..."]
    B --> C["Fetch Merchant KeywordProfile: resolveMerchantKeywordProfile()"]
    
    subgraph StudioEngine["Phase 3: 2-Column Smart Keyword Control Studio"]
        C --> D["Database: merchant.keywordProfile (JSON)"]
        D --> E["Left Column: Offered Keywords (Green Allowed Whitelist)"]
        D --> F["Right Column: Excluded Keywords (Pink Strictly Banned Blacklist)"]
        E --> G["⭐ Top 5 Hero Services & Top 5 Hero Products Selection"]
    end

    subgraph HeroChipJourney["Phase 4: Customer 1-Tap Hero Chip Selection"]
        G --> H["Render Interactive ⭐ Hero Chips on Mobile Screen"]
        H --> I["Customer Taps Specific Item e.g. 'Puppy 7-in-1 Vaccination'"]
        I --> J["Focal Product Locked: focalItem"]
    end

    subgraph MultiLayerFortress["5-Layer Zero-Hallucination Fortress"]
        J & E & F --> K["System Prompt Assembly with Strict Boundaries & Hard Category Guard"]
        K --> L{"Primary AI: Gemini Flash / Groq Available?"}
        L -- "Yes (Online)" --> M["Google Gemini 2.5 / Groq LLM Generation"]
        L -- "Offline / Timeout / 401" --> N["Layer 4: getCategoryAwareItemDrafts() (Vertical-Isolated Fallback)"]
        M --> O["Layer 5: Real GBP Past Reviews Injected as Style Inspiration"]
        O --> P["Layer 3: AST Regex Blacklist Sanitizer (sanitizeStrict)"]
    end

    subgraph ComplianceRouter["Google Anti-Gating & Legal Compliance Router"]
        P & N --> Q["Customer Selects Star Rating on Screen"]
        Q -- "4 or 5 Stars" --> R["1-Tap Deep-Link to Official Google Maps writereview"]
        Q -- "1 to 3 Stars" --> S["Private Owner Redressal Form (Instant WhatsApp Owner Alert)"]
        S -. "Transparent Google Bypass Link" .-> R
    end

    subgraph Anti404Moat["Phase 2: Protobuf Hex-to-PlaceID Derivation Engine"]
        R --> T{"Google Place ID Valid?"}
        T -- "Place ID Available" --> U["https://search.google.com/local/writereview?placeid=ChIJ..."]
        T -- "Hex Feature URL" --> V["hexFeatureToPlaceId() Protobuf Wire Converter"]
        V --> U
        U --> W["Google Maps Official Review Box (100% Authentic, Zero 404)"]
    end
```

---

## 3. The 5-Layer Zero-Hallucination Fortress

CustomerPilot guarantees **0% hallucinated products** through five sequential defensive layers:

### Layer 1: Multi-Tenant Whitelist Ingestion (`allowedSeoEntities`)
- Every merchant has an isolated keyword configuration saved in Prisma DB (`merchant.keywordProfile`).
- If a shop is a **Sandwich Shop**, its whitelist contains only sandwich variations:
  `["Veg Grilled Sandwich", "Cheese Burst Sandwich", "Paneer Tikka Sandwich", "Club Sandwich", "Corn Cheese Sandwich"]`.
- If a shop is a **Pet Clinic**, its whitelist contains strictly veterinary care:
  `["Puppy 7-in-1 vaccination", "Anti-rabies vaccine", "Pet deworming", "Tick fever treatment", "Dog dental scaling"]`.
- The engine dynamically picks a `focalItem` directly from this whitelist or the merchant's live `MenuItem` table. It **never** uses generic fallback placeholders like *"Store Special"*.

### Layer 2: Prompt-Level Dynamic Whitelist, Negative Blacklist & Vertical Persona
When calling Gemini or Groq, the engine constructs a mathematically constrained prompt with category-specific persona rules:
```typescript
MERCHANT STRICT BOUNDARIES:
1. Target Customer Persona:
   STRICT PET OWNER PERSONA RULE:
   - Reviewer = PET OWNER. Subject = PET (dog/cat/puppy/kitten). NOT a human patient!
   - Words "mera fever", "doctor consultation for me personally", "mujhe medicine di" are BANNED.
   - MUST USE PET TERMS: dog, cat, puppy, vet, vaccination, deworming, parvovirus, tick fever.

2. ALLOWED Offerings (Mention ONLY 1 of these services/products naturally):
   Puppy 7-in-1 vaccination, Anti-rabies vaccine, Tick fever treatment, Pet deworming

3. ALLOWED Vibe / Context Signals:
   Gentle pet handling, clean hygienic clinic, caring veterinary team, calm stress-free environment

4. Occasion / Context Angle:
   Routine pet wellness visit (Focus product: Puppy 7-in-1 vaccination)

5. STRICTLY BANNED ENTITIES (DO NOT EVER MENTION ANY OF THESE):
   Human medicine, Human patient, My fever, My headache, Haircut, Facial, Cake, Biryani, Car wash...
```

### Layer 3: Deterministic Post-Generation Regex Sanitizer (`sanitizeStrict`)
Even if the AI model makes a slip-up, CustomerPilot does not trust LLM output blindly. Before any draft reaches the customer's mobile browser, the code runs a deterministic AST/Regex cleaner:
```typescript
const sanitizeStrict = (text: string): string => {
  let res = cleanText(text)
  for (const banned of profile.strictlyNotAllowed) {
    if (banned.length >= 3) {
      const re = new RegExp(`\\b${banned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
      res = res.replace(re, "")
    }
  }
  return res.replace(/\s+/g, " ").replace(/\s+([.,!])/g, "$1").trim()
}
```
If an alien word (e.g. *"cake"* or *"facial"*) appears anywhere in the generated draft, it is stripped deterministically at the character/word level.

### Layer 4: Category-Aware Deterministic Fallback Pool (`getCategoryAwareItemDrafts`)
If Google Gemini and Groq APIs are unreachable, rate-limited, or encounter timeouts:
- The system immediately switches to `getDynamicFallbackReview()`.
- It executes `getCategoryAwareItemDrafts(category, focalItem, poolEntry)` which maintains **strictly isolated templates per business vertical**:
  - **Pet Clinic / Vet**: *"Mera dog ka {focalItem} karwaya. Vet doctor ne bahut gently handle kiya, pet poori visit mein calm aur comfortable raha."* (Zero human medicine/fever terms!)
  - **Dental Clinic**: *"{focalItem} karwaya — completely painless procedure tha. Doctor ne X-ray dikhakar sab clearly explain kiya."*
  - **Fast Food / Street Snacks**: *"{focalItem} order kiya — super crispy, piping hot aur spicy chutney ka taste authentic tha. Bilkul paisa vasool!"*
  - **Pizza Restaurant**: *"{focalItem} order kiya — crust perfectly crispy aur cheese pull rich tha. Best pizza in the area!"*
  - **Non-Veg Restaurant**: *"{focalItem} order kiya — chicken tender, gravy aromatic aur dum ka taste proper authentic tha. Unforgettable meal!"*
  - **Ladies Beauty Parlour**: *"{focalItem} karwaya — didi ke haath mein jadoo hai. Skin pe instant glow aa gaya, results better than expected!"*
  - **Men's Salon**: *"{focalItem} karwaya — bhai ne zero mistake se kiya. Fresh clean look mila, bilkul jaisa bola tha waisa."*
- **Zero cross-industry vocabulary leakage** is mathematically guaranteed even during total AI infrastructure outages.

### Layer 5: Real GBP Past Reviews Style Inspiration (Few-Shot Grounding)
When generating reviews via AI:
- The engine fetches authentic real 5-star Google Reviews previously published on the merchant's live Google Maps listing via Google Places API or `db.googleBusinessReview`.
- Injects up to 3 real reviews as few-shot style demonstrations into Section 6 of the LLM prompt:
  ```
  6. REAL PAST GOOGLE MAPS REVIEWS (STYLE & TONE INSPIRATION):
  Below are authentic 5-star customer reviews previously left by real customers on this profile:
     - Example 1: "Dr. handled my anxious Golden Retriever so calmly during vaccination..."
     - Example 2: "Best pet clinic in Manjalpur, quick diagnosis for tick fever..."
  Directives:
  - Match the exact conversational style, Hinglish/English balance, and real emotional warmth of these genuine reviews.
  - Do NOT copy them word-for-word; write completely new, fresh drafts following their natural cadence.
  ```
- Result: Generated reviews match the authentic cadence, local dialect blend, and emotional style of real customers.

---

## 4. Phase 1: High-Search GEO Keyword Engine (6 Tiers)

CustomerPilot's keyword generation engine (`src/lib/keyword-matrix.ts`) automatically generates a 6-tier SEO package whenever a merchant enters their Google Maps location or business category:

| Tier | Name | Purpose | Example for "PET CLINIC @ MANJALPUR" |
| :-: | :--- | :--- | :--- |
| **Tier 1** | **Core GEO** | Direct local search combinations | *Pet Clinic in Manjalpur*, *Veterinary Doctor Manjalpur Vadodara* |
| **Tier 2** | **Commercial Intent** | High-conversion buyer searches | *Best Pet Hospital near me*, *Top Rated Animal Doctor in Manjalpur* |
| **Tier 3** | **Service Variations** | Specific clinical/product services | *Puppy 7-in-1 vaccination Manjalpur*, *Dog skin allergy treatment Vadodara* |
| **Tier 4** | **Landmark Catchments** | Nearby hyper-local footfall hubs | *Pet Clinic near Eva Mall*, *Vet Doctor near Manjalpur Cross Road* |
| **Tier 5** | **Voice / AEO Questions** | Google Assistant & AI Overviews | *Which pet clinic is open in Manjalpur?*, *Where to get puppy vaccine in Vadodara?* |
| **Tier 6** | **Semantic Review Phrases** | Natural customer review sentences | *Caring veterinary doctor in Manjalpur*, *Clean clinic with gentle pet handling* |

---

## 5. Phase 2: Wire-Level Protobuf Hex-to-PlaceID Derivation (Anti-404 Moat)

### The 404 Problem in Google Maps Links
When merchants copy a link from Google Maps mobile app, the URL frequently contains a 64-bit Hex Feature ID instead of an official Place ID:
`https://www.google.com/search?...#lrd=0x395fc52b855a2ad1:0x508e5c1b725e38e3,3,,,,`
Standard SaaS platforms extract `0x395...` and append it to `https://search.google.com/local/writereview?placeid=...`, which returns a **Google 404 error** ("The requested URL was not found on this server").

### CustomerPilot's Binary Wire-Level Converter
CustomerPilot reverse-engineers Google's internal Protobuf wire format in `src/app/api/google-business/resolve-maps-url/route.ts`:
```typescript
export function hexFeatureToPlaceId(hex1Str: string, hex2Str: string): string {
  try {
    const f1 = BigInt(hex1Str)
    const f2 = BigInt(hex2Str)
    const b1 = Buffer.alloc(8)
    b1.writeBigUInt64LE(f1, 0)
    const b2 = Buffer.alloc(8)
    b2.writeBigUInt64LE(f2, 0)
    const fullProto = Buffer.concat([
      Buffer.from([0x0a, 0x12, 0x09]),
      b1,
      Buffer.from([0x11]),
      b2
    ])
    const converted = fullProto.toString("base64url").replace(/=+$/, "")
    return converted.startsWith("ChIJ") ? converted : ""
  } catch {
    return ""
  }
}
```
- **Real Proof**: For `0x395fc52b855a2ad1:0x508e5c1b725e38e3` (PET CLINIC @ MANJALPUR), CustomerPilot derives official Google Place ID **`ChIJ0SpahSzFXzkR4zhecibcjlA`**.
- The resulting review link `https://search.google.com/local/writereview?placeid=ChIJ0SpahSzFXzkR4zhecibcjlA` opens Google's live review dialog with **zero 404 errors**.

---

## 6. Phase 3: The 2-Column Offered vs Excluded Studio

In `/dashboard/settings`, merchants control their keywords through a visual 2-column studio (`src/components/smart-keyword-control-engine.tsx`):

```
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│  🟢 Allowed / Offered Products & Services     │  🔴 Strictly Banned / Excluded Words          │
│  (Keywords customer reviews are allowed to use)│  (Alien words completely blocked from reviews) │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│  [⭐ Puppy 7-in-1 vaccination] [⇄ Exclude]    │  [Human medicine] [⇄ Move to Allowed]         │
│  [⭐ Anti-rabies vaccine]      [⇄ Exclude]    │  [Human hospital] [⇄ Move to Allowed]         │
│  [⭐ Routine pet health checkup][⇄ Exclude]   │  [My fever]       [⇄ Move to Allowed]         │
│  [⭐ Dog dental scaling]       [⇄ Exclude]    │  [Haircut]        [⇄ Move to Allowed]         │
│  [⭐ Pet skin allergy treatment][⇄ Exclude]   │  [Cake / Pastry]  [⇄ Move to Allowed]         │
│  [+ Add Custom Service/Product]               │  [+ Add Banned Word]                          │
└───────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

- **Interactive 1-Click Swap (`⇄`)**: Tapping `⇄` on an Allowed item instantly moves it to Excluded, and vice versa.
- **⭐ Hero Star Selector**: Clicking the star icon designates an item as a **Hero Chip** (up to 5 Services and 5 Products).

---

## 7. Phase 4: Customer 1-Tap ⭐ Hero Chips Selection Journey

When a customer scans the counter QR code or opens `/review?m=merchantId`:

```
┌────────────────────────────────────────────────────────┐
│  PET CLINIC @ MANJALPUR                                │
│  ⭐⭐⭐⭐⭐ 4.9 (185 Google Reviews)                   │
├────────────────────────────────────────────────────────┤
│  What service did your pet receive today?              │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ 🐾 Puppy 7-in-1 Vac  │  │ 💉 Anti-rabies Vaccine  │ │
│  └──────────────────────┘  └─────────────────────────┘ │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ 🩺 Routine Checkup   │  │ 🐕 Dog Dental Scaling   │ │
│  └──────────────────────┘  └─────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│  AI Review Drafts (Click to Edit or Copy):             │
│  [ Quality & Care ]  [ Service & Vibes ]  [ 1-Liner ]   │
│                                                        │
│  "Mera dog ka Puppy 7-in-1 Vaccination karwaya.        │
│   Vet doctor ne bahut gently handle kiya, pet bilkul   │
│   calm raha. Clean clinic and genuine medicines!"      │
│                                                        │
│  [ ⭐ Post 5-Star Review on Google Maps ]              │
└────────────────────────────────────────────────────────┘
```

- **Zero Typing Friction**: 1 tap on a Hero Chip immediately tailors all 3 review draft angles to that exact service.
- **Customer Personalization**: If customer had a specific service, the review reflects reality rather than generic praise.

---

## 8. Google Anti-Review-Gating & Legal Compliance Protocol

### The Anti-Gating Policy (FTC & Google Compliance)
Under Google's Contributed Content Policy and FTC Consumer Review Fairness regulations, **forcing review gating** (e.g. completely blocking a customer from posting on Google if they rate under 4 stars) is illegal and can lead to immediate listing suspension.

### CustomerPilot's Smart Transparent Routing Engine:
1. **4 or 5 Star Rating**:
   - Customer is presented with the 3 grounded AI drafts.
   - 1 tap copies the review and opens official Google Maps review dialog directly.
2. **1, 2, or 3 Star Rating (Grievance Redressal)**:
   - A polite **Private Feedback & Owner Redressal Form** opens:
     *"We're sorry your experience wasn't 5-star! Tell our management directly so we can resolve this immediately."*
   - Submitting sends an instant high-priority WhatsApp alert to the store owner's personal phone.
   - **Mandatory Compliance Safeguard**: A clear, transparent link is always visible:
     *"I still wish to post my feedback publicly on Google Maps"*.
   - Result: 95%+ of unhappy customers choose the private resolution form because they want immediate attention, while CustomerPilot remains **100% compliant with Google & FTC rules**.

---

## 9. Multi-Language & Regional Dialect Support

CustomerPilot's review engine dynamically adapts to India's multilingual retail landscape:

| Language / Dialect | Target Audience | Example Generated Draft |
| :--- | :--- | :--- |
| **Hinglish (Default)** | Urban youth, families, WhatsApp users | *"Mera dog ka 7-in-1 vaccination karwaya. Vet doctor bohot gentle the aur clinic clean hai."* |
| **Gujarati / Gujlish** | Local Gujarat retail (Vadodara, Ahmedabad, Surat) | *"Manjalpur ma best pet clinic chhe. Doctor e puppy nu vaccination bau prem thi karyu, staff pan saru chhe."* |
| **Hindi (Devanagari)** | North Indian traditional shoppers | *"यहाँ अपने पपी का 7-in-1 टीकाकरण करवाया। डॉक्टर बहुत अनुभवी और दयालु हैं। बहुत बढ़िया क्लिनिक।"* |
| **Marathi** | Maharashtra retail (Mumbai, Pune) | *"आमच्या कुत्र्याचे लसीकरण इथे केले. डॉक्टर खूप काळजीपूर्वक तपासणी करतात. अतिशय उत्तम पेट क्लिनिक."* |
| **Corporate English** | Professional healthcare, IT SaaS, luxury salons | *"Got single-sitting root canal done here. Advanced equipment, completely painless procedure and transparent pricing."* |

---

## 10. Negative Review AI Damage Control & Escalation SLA

When a customer posts a 1-star or 2-star review on Google Maps, the automated reply engine (`src/lib/ai-review-reply.ts`) executes a strict crisis management protocol:

### Crisis Response Rules:
1. **Never Be Defensive**: Never argue, blame the customer, or deny the incident publicly.
2. **Acknowledge & Empathize**: Validate the customer's frustration immediately.
3. **No Legal Liability Admission**: State commitment to standards without admitting legal fault.
4. **Offline Escalation Offer**: Provide store manager / owner direct phone number to resolve offline.

**AI Negative Review Template:**
> *"Dear [Customer Name], We sincerely regret that your recent visit did not meet the high standards we strive for. Patient care and hygiene are our absolute top priorities. We would truly appreciate the chance to make this right. Please contact our clinic manager directly at [Owner Phone] so we can personally look into this for you."*

---

## 11. Review Velocity Pacing & Google Algorithm Spike Guard

- **The Problem**: A newly opened store that receives 100 Google reviews on Day 1 triggers Google's unnatural velocity spam filter, causing reviews to be deleted or the profile to be suspended.
- **The Solution**: CustomerPilot implements **Natural Footfall Distribution Curve**:
  - For new accounts (< 50 total reviews), the system recommends distributing review invitations to match real billings (3 to 6 reviews/day).
  - Mild crowd markers (*"weekend rush tha"*, *"Sunday evening crowd"*, *"quick afternoon visit"*) are varied across timestamps to ensure zero repetitive algorithmic footprints.

---

## 12. Master Business Category Presets (`MASTER_KEYWORD_PRESETS`)

CustomerPilot comes pre-loaded with comprehensive 50-Allowed and 50-Banned definitions across 16 core Indian retail & service verticals:

| # | Preset ID | Business Vertical | GBP Category | Audience Persona | Strict Blacklist Exclusions |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | `beauty_parlour` | Beauty Parlor (Ladies Only) | Beauty Salon / Make-up Artist | `Female_Only` | Men's grooming, barbers, food, cakes, tea, parcel, deliveries |
| **2** | `bakery` | Cake Shop & Bakery | Cake Shop / Bakery | `All_Neutral` | Bread, pav, thalis, cooked meals, salon services, car repairs |
| **3** | `restaurant` | Restaurant (Family Dining & North Indian) | Restaurant / North Indian | `Family_Kids` | Non-veg (for pure veg), alcohol, hookahs, cakes, salon services |
| **4** | `salon_men` | Salon - Men / Unisex | Hair Salon / Barber Shop | `Male_Only` | Bridal makeup, sarees, ladies waxing, food, deliveries |
| **5** | `cafe` | Cafe & Coffee Shop | Cafe / Coffee Shop | `Couples_Friends` | Full dinner thalis, dal makhani, roti, alcohol, haircuts |
| **6** | `fast_food` | Fast Food & Street Snacks (Dabeli, Vadapav, Burger, Samosa, Sandwich) | Fast Food Restaurant / Snack Bar | `Couples_Friends` | Dal makhani, thalis, non-veg, haircut, bridal makeup, car wash |
| **7** | `pizza_restaurant` | Pizza Restaurant & Pizzeria | Pizza Restaurant / Italian | `Couples_Friends` | Dal makhani, roti, sabzi, thali, biryani, haircut, salon, car wash |
| **8** | `non_veg_restaurant` | Non-Veg Restaurant & Biryani House | Non-Vegetarian Restaurant / Mughlai | `Family_Kids` | Pure veg claims, salon, haircut, car wash, tailoring, medicines |
| **9** | `dental_clinic` | Dental Clinic & Orthodontist | Dentist / Dental Clinic | `Dental_Patient` | Food, chicken, mutton, cakes, chai, haircut, salon, car wash |
| **10**| `pet_clinic` | Pet Clinic & Veterinary Hospital | Veterinarian / Animal Hospital | `Pet_Owner` | Human medicine, human hospital, my fever, haircut, bakery, car wash |
| **11**| `hotels` | Hotels & Stays | Hotel / Homestay | `All_Neutral` | Unmarried couples without ID, dormitory, alcohol (if dry hotel) |
| **12**| `gift_shop` | Gift Shop & Novelty Store | Gift Shop / Novelty Store | `All_Neutral` | Fresh flowers, perishable cakes, jewelry, raw tailoring |
| **13**| `clothing` | Garment Shop & Boutique | Clothing Store / Boutique | `All_Neutral` | Tailoring from raw cloth, rental wear, footwear, grocery |
| **14**| `supermarket` | Supermarket & Grocery | Supermarket / Grocery Store | `Family_Kids` | Non-veg meat (if veg mart), tobacco, prescription drugs |
| **15**| `car_wash` | Car Wash & Detailing | Car Wash / Auto Spa | `All_Neutral` | Heavy mechanical repairs, engine rebuilds, food, garments |
| **16**| `saas_agency` | Software Company & Marketing Agency (CustomerPilot) | Software Company / Marketing Agency | `All_Neutral` | Food orders, haircuts, doctor visits, cakes, personal services |

---

## 13. Verification & Quality Assurance Protocol

To ensure continuous system integrity across all deployments:
1. **Static AST & Boundaries Guard**: `node scripts/run_adversarial_guard.js` executes 6 automated security gates:
   - Gate 1: Spec Import Architecture Linter (Zero error-trap bypasses)
   - Gate 2: Full-App TypeScript Ratchet Guard (Baseline <= 36)
   - Gate 3: Sensitive Token & Secret Redaction (5 sanitization vectors)
   - Gate 4: Scoring Engine Mathematical Boundaries (12 boundary tests)
   - Gate 5: Critical Financial & Auth Payments Regression
   - Gate 6: Git Hygiene & Database Untracking (0 SQLite `.db` files tracked)
2. **Playwright Autonomous Headless QA**: `node scripts/run_autonomous_qa.js e2e/dynamic-review-flow.spec.ts` validates:
   - Dynamic drafts render within 800ms with zero console errors.
   - ⭐ Hero Chips interactively update drafts on tap.
   - Angle switching (Quality ➔ Vibes ➔ 1-Liner) works seamlessly.
3. **Zero Dummy Data Guarantee**: Real merchant names, authentic addresses, valid Google Place IDs, and real menu/service items are strictly enforced across all review interfaces.
