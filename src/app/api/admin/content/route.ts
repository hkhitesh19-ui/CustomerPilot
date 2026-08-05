import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_CONTENT: Record<string, { section: string; category: string; value: string; label: string }> = {
  // ─── 1. Merchant Onboarding & Setup Forms (Steps 1 - 5) ─────────
  'onboarding_step1_title': { section: 'onboarding', category: 'title', value: 'Step 1: Business Profile', label: 'Step 1 Main Title' },
  'onboarding_step1_subtitle': { section: 'onboarding', category: 'subtitle', value: 'Tell us about your business to customize your loyalty pilot', label: 'Step 1 Subtitle' },
  'onboarding_step1_business_name_label': { section: 'onboarding', category: 'label', value: 'Business Name', label: 'Step 1 Business Name Field Label' },
  'onboarding_step1_business_name_placeholder': { section: 'onboarding', category: 'placeholder', value: 'e.g. Cake Connection, Vadodara', label: 'Step 1 Business Name Placeholder' },
  'onboarding_step1_category_label': { section: 'onboarding', category: 'label', value: 'Business Category', label: 'Step 1 Category Field Label' },
  'onboarding_step1_owner_label': { section: 'onboarding', category: 'label', value: 'Owner / Manager Full Name', label: 'Step 1 Owner Name Field Label' },

  'onboarding_step2_title': { section: 'onboarding', category: 'title', value: 'Step 2: Loyalty Program Rules', label: 'Step 2 Main Title' },
  'onboarding_step2_subtitle': { section: 'onboarding', category: 'subtitle', value: 'Define your stamps & customer rewards structure', label: 'Step 2 Subtitle' },
  'onboarding_step2_stamps_count_label': { section: 'onboarding', category: 'label', value: 'Total Stamps Required for Reward', label: 'Step 2 Stamps Count Label' },
  'onboarding_step2_reward_desc_label': { section: 'onboarding', category: 'label', value: 'Reward Description (What customer gets)', label: 'Step 2 Reward Description Label' },
  'onboarding_step2_validity_label': { section: 'onboarding', category: 'label', value: 'Reward Validity (Days)', label: 'Step 2 Validity Label' },

  'onboarding_step3_title': { section: 'onboarding', category: 'title', value: 'Step 3: Connect WhatsApp', label: 'Onboarding Step 3 Title' },
  'onboarding_step3_subtitle': { section: 'onboarding', category: 'subtitle', value: 'Scan QR code to link your business WhatsApp number', label: 'Onboarding Step 3 Subtitle' },
  'onboarding_step3_qr_instruction': { section: 'onboarding', category: 'notice', value: 'Open WhatsApp on your phone ➔ Linked Devices ➔ Scan this QR Code', label: 'Step 3 QR Code Instructions' },

  'onboarding_step4_title': { section: 'onboarding', category: 'title', value: 'Step 4: Google Reviews & AI AutoReply', label: 'Onboarding Step 4 Title' },
  'onboarding_step4_subtitle': { section: 'onboarding', category: 'subtitle', value: 'Connect Google Business Profile to boost 5-star reviews', label: 'Onboarding Step 4 Subtitle' },
  'onboarding_step4_place_id_label': { section: 'onboarding', category: 'label', value: 'Google Place ID / Maps Link', label: 'Step 4 Google Maps Field Label' },

  'onboarding_step5_title': { section: 'onboarding', category: 'title', value: 'Step 5: Team & Staff Access', label: 'Onboarding Step 5 Title' },
  'onboarding_step5_subtitle': { section: 'onboarding', category: 'subtitle', value: 'Add staff members with custom PIN access', label: 'Onboarding Step 5 Subtitle' },

  // ─── 2. Customer Review & AI Draft Module Pages ──────────────────
  'review_page_title': { section: 'review_page', category: 'title', value: 'Edit & Update Your Google Review', label: 'Review Page Title' },
  'review_policy_notice': { section: 'review_page', category: 'notice', value: '📌 Google Policy Notice: Google allows 1 review per account. Clicking below will open your existing Google review in edit mode.', label: 'Google Policy Notice Banner' },
  'review_btn_previous': { section: 'review_page', category: 'button', value: 'Use My Previous Review', label: 'Previous Review Button Label' },
  'review_btn_fresh': { section: 'review_page', category: 'button', value: 'Use Fresh AI Draft', label: 'Fresh AI Draft Button Label' },
  'review_copy_button': { section: 'review_page', category: 'button', value: 'Copy & Update on Google', label: 'Main CTA Copy & Update Button Text' },
  'review_fallback_link_text': { section: 'review_page', category: 'button', value: 'Or click here to open Google Maps directly', label: 'Fallback Google Maps Direct Link Label' },

  // ─── 3. Public Marketing & Landing Pages ─────────────────────────
  'landing_hero_headline': { section: 'landing_page', category: 'title', value: 'Turn One-Time Buyers Into 10x Repeat Customers', label: 'Landing Page Hero Headline' },
  'landing_hero_subtitle': { section: 'landing_page', category: 'subtitle', value: 'Automated WhatsApp Loyalty, AI Google Review Engine & VIP Pass Cards.', label: 'Landing Page Subtitle' },
  'landing_cta_primary': { section: 'landing_page', category: 'button', value: 'Start 7-Day FREE Trial', label: 'Primary Hero CTA Button Text' },
  'landing_cta_secondary': { section: 'landing_page', category: 'button', value: 'Book a Demo', label: 'Secondary Hero CTA Button Text' },

  // ─── 4. Merchant Dashboard & Settings Sections ────────────────────
  'dashboard_welcome_title': { section: 'dashboard', category: 'title', value: 'Merchant Command Dashboard', label: 'Dashboard Welcome Title' },
  'dashboard_whatsapp_status_label': { section: 'dashboard', category: 'label', value: 'WhatsApp Engine Status', label: 'WhatsApp Status Card Title' },
};

export async function GET() {
  try {
    const customContent = await db.systemContent.findMany();
    const customMap: Record<string, string> = {};
    customContent.forEach((item) => {
      customMap[item.key] = item.value;
    });

    const merged = Object.entries(DEFAULT_CONTENT).map(([key, meta]) => ({
      key,
      section: meta.section,
      category: meta.category,
      label: meta.label,
      defaultValue: meta.value,
      value: customMap[key] !== undefined ? customMap[key] : meta.value,
      isCustomized: customMap[key] !== undefined,
    }));

    return NextResponse.json({ success: true, content: merged });
  } catch (error: any) {
    console.error('[Admin Content GET Error]', error);
    return NextResponse.json({ error: 'Failed to load system content' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { key, value } = await req.json();
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const meta = DEFAULT_CONTENT[key];
    const section = meta?.section || 'general';
    const category = meta?.category || 'text';

    const updated = await db.systemContent.upsert({
      where: { key },
      update: { value, section, category },
      create: { key, value, section, category }
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('[Admin Content POST Error]', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    await db.systemContent.delete({ where: { key } }).catch(() => {});
    return NextResponse.json({ success: true, key });
  } catch (error: any) {
    console.error('[Admin Content DELETE Error]', error);
    return NextResponse.json({ error: 'Failed to reset content' }, { status: 500 });
  }
}
