import { describe, it, expect } from 'vitest';
import {
  getKeywordPresetForCategory,
  resolveMerchantKeywordProfile,
  MASTER_KEYWORD_PRESETS
} from '@/lib/keyword-matrix';
import { getDynamicFallbackReview } from '@/lib/dynamic-review-engine';

describe('Pillar 3 — Saree Palace & Pethapur Keyword Protection Guard', () => {
  const shreenathContext = {
    id: 'cmwitzi0y0002kvwsw32v7uqc',
    name: 'Shreenath Rajwadi Silk Palace (Pethapur Vala)',
    category: 'Saree shop',
    businessType: 'RETAIL',
    city: 'Vadodara',
    address: 'Aakar Complex, Kedardham Society, Manjalpur, Vadodara, Gujarat 390011, India'
  };

  it('correctly classifies Shreenath Rajwadi Silk Palace as saree_palace preset', () => {
    const preset = getKeywordPresetForCategory(shreenathContext.category, shreenathContext.name);
    expect(preset.id).toBe('saree_palace');
    expect(preset.label).toContain('Silk Saree');
    expect(preset.id).not.toBe('pet_clinic');
    expect(preset.id).not.toBe('pet_shop');
  });

  it('prevents Pethapur, Petlad and Carpet from triggering pet_clinic or pet_shop', () => {
    const pethapurPreset = getKeywordPresetForCategory('Textile & Sarees', 'Pethapur Vala Silk Collection');
    expect(pethapurPreset.id).toBe('saree_palace');

    const carpetPreset = getKeywordPresetForCategory('Home Decor', 'Royal Carpet & Rug Palace');
    expect(carpetPreset.id).not.toBe('pet_clinic');
    expect(carpetPreset.id).not.toBe('pet_shop');

    const petladPreset = getKeywordPresetForCategory('General Store', 'Petlad Wholesale Traders');
    expect(petladPreset.id).not.toBe('pet_clinic');
    expect(petladPreset.id).not.toBe('pet_shop');
  });

  it('resolves 10 authentic silk saree hero services and 10 silk saree hero products', () => {
    const profile = resolveMerchantKeywordProfile(shreenathContext);
    expect(profile.categoryKey).toBe('saree_palace');
    expect(profile.heroServices).toBeDefined();
    expect(profile.heroServices?.length).toBe(10);
    expect(profile.heroProducts).toBeDefined();
    expect(profile.heroProducts?.length).toBe(10);

    // Assert zero pet clinic contamination
    const allItems = [...(profile.heroServices || []), ...(profile.heroProducts || [])];
    for (const item of allItems) {
      const lower = item.toLowerCase();
      expect(lower).not.toContain('vaccin');
      expect(lower).not.toContain('puppy');
      expect(lower).not.toContain('kitten');
      expect(lower).not.toContain('deworm');
      expect(lower).not.toContain('veterin');
      expect(lower).not.toMatch(/\b(cat|cats|dog|dogs|pet|pets)\b/);
    }

    // Assert authentic saree services & products are present
    expect(profile.heroServices).toContain('Bridal saree draping demo');
    expect(profile.heroServices).toContain('Wedding saree consultation');
    expect(profile.heroProducts).toContain('Pure Pethapur silk sarees');
    expect(profile.heroProducts).toContain('Rajwadi wedding sarees');
    expect(profile.heroProducts).toContain('Pure Kanjivaram silk sarees');
  });

  it('auto-heals a contaminated keywordProfile in database to saree_palace', () => {
    const contaminatedProfile = JSON.stringify({
      categoryKey: 'pet_clinic',
      allowedSeoEntities: ['Puppy 7-in-1 vaccination', 'Pet surgery and spaying'],
      heroServices: ['Puppy 7-in-1 vaccination'],
      heroProducts: ['Pet surgery and spaying']
    });

    const healed = resolveMerchantKeywordProfile({
      ...shreenathContext,
      keywordProfile: contaminatedProfile
    });

    expect(healed.categoryKey).toBe('saree_palace');
    expect(healed.heroServices?.[0]).toContain('saree');
    expect(healed.heroProducts?.[0]).toContain('saree');
  });

  it('generates authentic saree shopping drafts with zero pet/medical contamination', () => {
    const drafts = getDynamicFallbackReview('saree_palace', 'Pure Pethapur silk sarees', 'test_seed_saree');
    expect(drafts.draft1).toBeDefined();
    expect(drafts.draft2).toBeDefined();
    expect(drafts.draft3).toBeDefined();

    const allDraftsText = `${drafts.draft1} ${drafts.draft2} ${drafts.draft3}`.toLowerCase();
    expect(allDraftsText).toContain('saree');
    expect(allDraftsText).not.toContain('billi');
    expect(allDraftsText).not.toContain('kutte');
    expect(allDraftsText).not.toContain('passport');
    expect(allDraftsText).not.toContain('doctor');
    expect(allDraftsText).not.toContain('clinic');
    expect(allDraftsText).not.toContain('vaccin');
  });
});
