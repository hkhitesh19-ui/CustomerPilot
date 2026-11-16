import re

def main():
    with open("src/lib/master-plans.ts", "r", encoding="utf-8") as f:
        content = f.read()

    # Find the block starting with // ─── GEAR 1 and ending before // ─── Legacy Capacity
    # We will replace all gear definitions with the canonical 5 gears.
    gear_start = content.find("  // ─── GEAR 1 :")
    legacy_start = content.find("  // ─── Legacy Capacity & Standalone References")

    if gear_start == -1 or legacy_start == -1:
        print("ERROR: Could not find markers in src/lib/master-plans.ts")
        return

    new_gears_block = """  // ─── GEAR 1 : Smart Digital Business Card + Smart AI Google Review System ───
  {
    planKey: "gear1_6mo",
    name: "Gear 1 : Smart Digital Business Card + Smart AI Google Review System — 6 Months",
    description: "Instant digital card branding plus autonomous Google review acceleration for local stores (6 Months).",
    days: 180,
    price: 899,
    originalPrice: 899,
    discountPercent: 0,
    badge: "Gear 1",
    popular: false,
    features: [
      "Smart Digital Business Card (vCard Contact Sync)",
      "Smart AI Google Review Collection & 5-Star Filter",
      "AI-Drafted 5-Star Customer Reviews",
      "Direct Google Maps Review Integration",
      "WhatsApp & Direct Call Buttons",
      "High-Resolution Review Counter QR Code",
      "6 Months Cloud Hosting & Analytics"
    ],
    enabledModules: "DIGITAL_CARD,REVIEWS",
    active: true
  },
  {
    planKey: "gear1_yearly",
    name: "Gear 1 : Smart Digital Business Card + Smart AI Google Review System — 1 Year",
    description: "Full year interactive digital business card plus autonomous AI Google review acceleration (1 Year).",
    days: 365,
    price: 1249,
    originalPrice: 1249,
    discountPercent: 0,
    badge: "Gear 1 · 1 Year",
    popular: false,
    features: [
      "Everything in Gear 1 (6 Months)",
      "365 Days Unlimited Review Collection & Card Sync",
      "Gemini AI Dynamic Review Angle Variations",
      "Online Ordering / Catalog Links Integration",
      "Printable Counter Standee Artwork (A4/A5)",
      "Dedicated WhatsApp Support"
    ],
    enabledModules: "DIGITAL_CARD,REVIEWS",
    active: true
  },

  // ─── GEAR 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System ───
  {
    planKey: "gear2_6mo",
    name: "Gear 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System — 6 Months",
    description: "High-retention combo: WhatsApp automated loyalty stamps plus interactive digital business card (6 Months).",
    days: 180,
    price: 1499,
    originalPrice: 1499,
    discountPercent: 0,
    badge: "Gear 2",
    popular: false,
    features: [
      "Smart Digital Business Card (vCard Contact Sync)",
      "WhatsApp Digital Loyalty Stamp Cards & VIP Club",
      "QR Counter Check-in & Stamp Crediting",
      "Automated Milestone Rewards & Customer VIP Tiers",
      "Automated 30/60/90 Day Customer Win-Backs",
      "6 Months Loyalty Cloud Hosting & CRM"
    ],
    enabledModules: "DIGITAL_CARD,LOYALTY",
    active: true
  },
  {
    planKey: "gear2_yearly",
    name: "Gear 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System — 1 Year",
    description: "Full year WhatsApp digital loyalty automation plus branded digital business card (1 Year).",
    days: 365,
    price: 2249,
    originalPrice: 2249,
    discountPercent: 0,
    badge: "Gear 2 · 1 Year",
    popular: false,
    features: [
      "Everything in Gear 2 (6 Months)",
      "365 Days Unlimited WhatsApp Stamp Cards",
      "VIP Customer Database & Spend CRM",
      "Custom Store Branding on Acrylic Standees",
      "Priority WhatsApp Helpdesk"
    ],
    enabledModules: "DIGITAL_CARD,LOYALTY",
    active: true
  },

  // ─── GEAR 3 : WhatsApp Digital Loyalty + Smart AI Google Review System + Smart Digital Business Card ───
  {
    planKey: "gear3_6mo",
    name: "Gear 3 : WhatsApp Digital Loyalty + Smart AI Google Review System + Smart Digital Business Card — 6 Months",
    description: "Trio retention suite: Digital card, WhatsApp loyalty stamps, and smart AI Google reviews (6 Months).",
    days: 180,
    price: 1799,
    originalPrice: 1799,
    discountPercent: 0,
    badge: "Gear 3",
    popular: false,
    features: [
      "Smart Digital Business Card (vCard Sync)",
      "WhatsApp Digital Loyalty Stamp Cards & VIP Rewards",
      "Smart AI Google Review Collection & 5-Star Filter",
      "Direct Google Maps Redirection",
      "Dual-Action Counter Standee Artwork",
      "6 Months Cloud Hosting & Analytics"
    ],
    enabledModules: "DIGITAL_CARD,LOYALTY,REVIEWS",
    active: true
  },
  {
    planKey: "gear3_yearly",
    name: "Gear 3 : WhatsApp Digital Loyalty + Smart AI Google Review System + Smart Digital Business Card — 1 Year",
    description: "Full year trio retention powerhouse: Digital card, WhatsApp loyalty stamps, and smart AI reviews (1 Year).",
    days: 365,
    price: 2499,
    originalPrice: 2499,
    discountPercent: 0,
    badge: "Gear 3 · 1 Year",
    popular: false,
    features: [
      "Everything in Gear 3 (6 Months)",
      "365 Days Unlimited Retention & Review Acceleration",
      "Customer Spend CRM & Milestone Alerts",
      "Automated WhatsApp Win-Back Campaigns",
      "Print-Ready A4/A5 Counter Acrylic Standees"
    ],
    enabledModules: "DIGITAL_CARD,LOYALTY,REVIEWS",
    active: true
  },

  // ─── GEAR 4 : All 4 Core Engines (Card + Loyalty + Reviews + AutoReply) ───
  {
    planKey: "gear4_6mo",
    name: "Gear 4 : All 4 Core Engines — 6 Months",
    description: "All 4 flagship engines: Card, Loyalty Stamps, Smart AI Reviews, and 1-Click AI AutoReply (6 Months).",
    days: 180,
    price: 1899,
    originalPrice: 1899,
    discountPercent: 0,
    badge: "Gear 4",
    popular: false,
    features: [
      "Smart Digital Business Card",
      "WhatsApp Digital Loyalty Stamp Cards & VIP Club",
      "Smart AI Google Reviews with Keyword Extraction",
      "1-Click AI AutoReply to Google Maps Reviews",
      "Automated 30/60/90 Day Customer Win-Backs",
      "Printable High-Res Counter Standees (A4/A5)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "growth_180",
    name: "Gear 4 : CustomerPilot Complete — 6 Months",
    description: "All 4 flagship engines: Card, Loyalty Stamps, Smart AI Reviews, and 1-Click AI AutoReply (6 Months).",
    days: 180,
    price: 1899,
    originalPrice: 1899,
    discountPercent: 0,
    badge: "Gear 4 · 6 Months",
    popular: false,
    features: [
      "Smart Digital Business Card",
      "WhatsApp Digital Loyalty Stamp Cards & VIP Club",
      "Smart AI Google Reviews with Keyword Extraction",
      "1-Click AI AutoReply to Google Maps Reviews",
      "Automated 30/60/90 Day Customer Win-Backs",
      "Printable High-Res Counter Standees (A4/A5)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "gear4_yearly",
    name: "Gear 4 : All 4 Core Engines — 1 Year",
    description: "Full year of all 4 flagship engines: Card, Loyalty, Reviews, and 1-Click AI AutoReply (1 Year).",
    days: 365,
    price: 2499,
    originalPrice: 2499,
    discountPercent: 0,
    badge: "Gear 4 · All 4 Core Engines",
    popular: true,
    features: [
      "Everything in Gear 4 (6 Months)",
      "365 Days Unlimited Automation Across All 4 Engines",
      "AI Review Reply Generator Published via Google OAuth",
      "VIP Tier Progression & Custom Stamp Milestones",
      "Priority WhatsApp Helpdesk (+91 90333 04707)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },
  {
    planKey: "enterprise_365",
    name: "Gear 4 : CustomerPilot Complete — 1 Year",
    description: "Full year of all 4 flagship engines: Card, Loyalty, Reviews, and 1-Click AI AutoReply (1 Year).",
    days: 365,
    price: 2499,
    originalPrice: 2499,
    discountPercent: 0,
    badge: "Gear 4 · 1 Year",
    popular: true,
    features: [
      "Everything in Gear 4 (6 Months)",
      "365 Days Unlimited Automation Across All 4 Engines",
      "AI Review Reply Generator Published via Google OAuth",
      "VIP Tier Progression & Custom Stamp Milestones",
      "Priority WhatsApp Helpdesk (+91 90333 04707)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    active: true
  },

  // ─── GEAR 5 : CustomerPilot All-in-One Enterprise ───
  {
    planKey: "gear5_monthly",
    name: "Gear 5 : CustomerPilot All-in-One Enterprise — Monthly",
    description: "The complete enterprise retail stack: Gear 4 + WhatsApp Group Booster, Smart POS Billing & Invoicing, and 24/7 AI WhatsApp ChatBot (Monthly).",
    days: 30,
    price: 999,
    originalPrice: 999,
    discountPercent: 0,
    badge: "Gear 5 · Monthly",
    popular: false,
    features: [
      "Smart Digital Business Card",
      "WhatsApp Digital Loyalty Stamps & VIP Club",
      "Smart AI Google Reviews",
      "AutoReply to GoogleReviews",
      "Dynamic QR Studio (Permanent QR + Instant Route Updates)",
      "WhatsApp Group Booster & Lead Capture Form",
      "Smart POS Billing & WhatsApp Invoicing Pro",
      "24/7 AI WhatsApp ChatBot (Multilingual AI Assistant)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD,DYNAMIC_QR,LEAD_CAPTURE,SMART_BILLING,CHATBOT",
    active: true
  },
  {
    planKey: "gear5_yearly",
    name: "Gear 5 : CustomerPilot All-in-One Enterprise — 1 Year",
    description: "Full year of the complete enterprise retail stack with all 8 engines included (1 Year).",
    days: 365,
    price: 9999,
    originalPrice: 9999,
    discountPercent: 0,
    badge: "Gear 5 · 1 Year (₹9,999/yr)",
    popular: true,
    features: [
      "Everything in Gear 5 Monthly",
      "365 Days Unlimited Access to All 8 Engines",
      "Dynamic QR Studio + Unlimited Destination Routing",
      "WhatsApp Group Booster & Lead Capture CRM",
      "Smart POS Billing & WhatsApp Invoicing Pro",
      "24/7 AI WhatsApp ChatBot Builder",
      "Priority WhatsApp Concierge Support (+91 90333 04707)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD,DYNAMIC_QR,LEAD_CAPTURE,SMART_BILLING,CHATBOT",
    active: true
  },
  {
    planKey: "gear6_monthly",
    name: "Gear 5 : CustomerPilot All-in-One Enterprise — Monthly (Alias)",
    description: "The complete enterprise retail stack (Monthly alias).",
    days: 30,
    price: 999,
    originalPrice: 999,
    discountPercent: 0,
    badge: "Gear 5 · Monthly",
    popular: false,
    features: [
      "All 8 Enterprise Retention Engines",
      "Monthly Subscription (₹999/month)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD,DYNAMIC_QR,LEAD_CAPTURE,SMART_BILLING,CHATBOT",
    active: true
  },
"""

    content = content[:gear_start] + new_gears_block + content[legacy_start:]

    # Now update Standalone definitions in master-plans.ts:
    # 1. loyalty_yearly price: 1999
    content = re.sub(
        r'(planKey:\s*"loyalty_yearly"[^}]+?price:\s*)\d+',
        r'\g<1>1999',
        content
    )
    content = re.sub(
        r'(planKey:\s*"loyalty_yearly"[^}]+?originalPrice:\s*)\d+',
        r'\g<1>1999',
        content
    )

    # 2. reviews_yearly price: 999
    content = re.sub(
        r'(planKey:\s*"reviews_yearly"[^}]+?price:\s*)\d+',
        r'\g<1>999',
        content
    )
    content = re.sub(
        r'(planKey:\s*"reviews_yearly"[^}]+?originalPrice:\s*)\d+',
        r'\g<1>999',
        content
    )

    # 3. autoreply_yearly price: 999
    content = re.sub(
        r'(planKey:\s*"autoreply_yearly"[^}]+?price:\s*)\d+',
        r'\g<1>999',
        content
    )
    content = re.sub(
        r'(planKey:\s*"autoreply_yearly"[^}]+?originalPrice:\s*)\d+',
        r'\g<1>999',
        content
    )

    # 4. card_yearly price: 549
    content = re.sub(
        r'(planKey:\s*"card_yearly"[^}]+?price:\s*)\d+',
        r'\g<1>549',
        content
    )
    content = re.sub(
        r'(planKey:\s*"card_yearly"[^}]+?originalPrice:\s*)\d+',
        r'\g<1>549',
        content
    )

    with open("src/lib/master-plans.ts", "w", encoding="utf-8") as f:
        f.write(content)

    print("SUCCESS: src/lib/master-plans.ts updated successfully!")

if __name__ == "__main__":
    main()
