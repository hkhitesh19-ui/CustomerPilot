"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  X, 
  Check, 
  Tag, 
  Volume2, 
  MapPin, 
  Ban, 
  RefreshCw,
  Save,
  Users,
  Star,
  ArrowRightLeft,
  Copy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Store,
  Compass,
  ShoppingBag,
  Wrench
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  KeywordProfile, 
  CategoryPreset, 
  MASTER_KEYWORD_PRESETS,
  generateAutoKeywordsForLocation 
} from "@/lib/keyword-matrix";

export function SmartKeywordControlEngine({ merchantId }: { merchantId: string }) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<KeywordProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Inputs for adding custom tags
  const [newSeoTag, setNewSeoTag] = useState("");
  const [newAeoTag, setNewAeoTag] = useState("");
  const [newGeoTag, setNewGeoTag] = useState("");
  const [newBlacklistTag, setNewBlacklistTag] = useState("");
  const [newHeroProduct, setNewHeroProduct] = useState("");
  const [newHeroService, setNewHeroService] = useState("");
  const [showAutoKeywords, setShowAutoKeywords] = useState(false);
  const [copiedKeywords, setCopiedKeywords] = useState(false);

  // Load active profile
  useEffect(() => {
    if (!merchantId) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/merchant/keyword-profile?merchantId=${merchantId}`, {
          headers: { "x-merchant-id": merchantId }
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.data?.profile) {
          setProfile(json.data.profile);
        }
      } catch (err) {
        console.warn("[SmartKeywordControlEngine] Load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [merchantId]);

  // Handle Tag Removals
  const removeTag = (field: keyof KeywordProfile, index: number) => {
    if (!profile) return;
    const currentList = Array.isArray(profile[field]) ? (profile[field] as string[]) : [];
    const removedItem = currentList[index];
    const updated = currentList.filter((_, i) => i !== index);
    
    // Also remove from heroServices and heroProducts if removed from allowedSeoEntities
    let newHeroServices = profile.heroServices;
    let newHeroProducts = profile.heroProducts;
    if (field === "allowedSeoEntities" && removedItem) {
      if (newHeroServices) newHeroServices = newHeroServices.filter(t => t !== removedItem);
      if (newHeroProducts) newHeroProducts = newHeroProducts.filter(t => t !== removedItem);
    }

    setProfile({ ...profile, [field]: updated, heroServices: newHeroServices, heroProducts: newHeroProducts });
  };

  // Handle Adding Custom Tag
  const addTag = (field: keyof KeywordProfile, value: string, clearFn: (s: string) => void) => {
    if (!profile || !value.trim()) return;
    const currentList = Array.isArray(profile[field]) ? (profile[field] as string[]) : [];
    const trimmed = value.trim();
    if (currentList.some(item => item.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Tag already exists", description: `"${trimmed}" is already added.` });
      clearFn("");
      return;
    }
    setProfile({ ...profile, [field]: [...currentList, trimmed] });
    clearFn("");
  };

  // Move Whitelist item to Blacklist (DO NOT Offer)
  const moveToExcluded = (idx: number) => {
    if (!profile) return;
    const item = profile.allowedSeoEntities[idx];
    if (!item) return;
    const newAllowed = profile.allowedSeoEntities.filter((_, i) => i !== idx);
    const newBlocked = profile.strictlyNotAllowed.includes(item)
      ? profile.strictlyNotAllowed
      : [item, ...profile.strictlyNotAllowed];
    const newHeroServices = (profile.heroServices || []).filter(t => t !== item);
    const newHeroProducts = (profile.heroProducts || []).filter(t => t !== item);

    setProfile({
      ...profile,
      allowedSeoEntities: newAllowed,
      strictlyNotAllowed: newBlocked,
      heroServices: newHeroServices,
      heroProducts: newHeroProducts
    });
    toast({ title: "Moved to DO NOT Offer (Banned ❌)", description: `"${item}" will NEVER be mentioned in AI reviews.` });
  };

  // Move Blacklist item to Whitelist (We Offer)
  const moveToOffered = (idx: number) => {
    if (!profile) return;
    const item = profile.strictlyNotAllowed[idx];
    if (!item) return;
    const newBlocked = profile.strictlyNotAllowed.filter((_, i) => i !== idx);
    const newAllowed = profile.allowedSeoEntities.includes(item)
      ? profile.allowedSeoEntities
      : [item, ...profile.allowedSeoEntities];

    setProfile({
      ...profile,
      strictlyNotAllowed: newBlocked,
      allowedSeoEntities: newAllowed
    });
    toast({ title: "Moved to We Offer (Allowed ✅)", description: `"${item}" added to allowed products/services.` });
  };

  // Toggle Hero Product (🛍️) - Max 10
  const toggleHeroProduct = (tag: string) => {
    if (!profile) return;
    const currentProducts = Array.isArray(profile.heroProducts) ? [...profile.heroProducts] : [];

    if (currentProducts.includes(tag)) {
      const updated = currentProducts.filter(t => t !== tag);
      setProfile({ ...profile, heroProducts: updated });
      toast({ title: "Product Unpinned", description: `"${tag}" removed from customer bestseller product chips.` });
    } else {
      if (currentProducts.length >= 10) {
        toast({
          title: "Maximum 10 Bestseller Products Allowed",
          description: "Unpin an existing product first to pin a new one.",
          variant: "destructive"
        });
        return;
      }
      const updated = [...currentProducts, tag];
      setProfile({ ...profile, heroProducts: updated });
      toast({ title: "🛍️ Bestseller Product Pinned!", description: `"${tag}" is now a customer 1-tap product chip (${updated.length}/10).` });
    }
  };

  // Toggle Hero Service (🛠️ / ⭐) - Max 10
  const toggleHeroService = (tag: string) => {
    if (!profile) return;
    const currentServices = Array.isArray(profile.heroServices) ? [...profile.heroServices] : [];

    if (currentServices.includes(tag)) {
      const updated = currentServices.filter(t => t !== tag);
      setProfile({ ...profile, heroServices: updated });
      toast({ title: "Service Unpinned", description: `"${tag}" removed from customer bestseller service chips.` });
    } else {
      if (currentServices.length >= 10) {
        toast({
          title: "Maximum 10 Bestseller Services Allowed",
          description: "Unpin an existing service first to pin a new one.",
          variant: "destructive"
        });
        return;
      }
      const updated = [...currentServices, tag];
      setProfile({ ...profile, heroServices: updated });
      toast({ title: "🛠️ Bestseller Service Pinned!", description: `"${tag}" is now a customer 1-tap service chip (${updated.length}/10).` });
    }
  };

  // Backward compatible toggle
  const toggleHeroItem = (tag: string) => {
    if (profile?.heroServices?.includes(tag)) {
      toggleHeroService(tag);
    } else if (profile?.heroProducts?.includes(tag)) {
      toggleHeroProduct(tag);
    } else {
      if ((profile?.heroServices?.length || 0) < 10) {
        toggleHeroService(tag);
      } else if ((profile?.heroProducts?.length || 0) < 10) {
        toggleHeroProduct(tag);
      } else {
        toast({
          title: "Bestseller Limits Reached",
          description: "Both 10 Services and 10 Products slots are full.",
          variant: "destructive"
        });
      }
    }
  };

  // Add custom Bestseller Product
  const addCustomHeroProduct = () => {
    if (!profile || !newHeroProduct.trim()) return;
    const trimmed = newHeroProduct.trim();
    const currentProducts = Array.isArray(profile.heroProducts) ? [...profile.heroProducts] : [];
    if (currentProducts.length >= 10) {
      toast({ title: "Maximum 10 Bestseller Products", description: "Unpin one product before adding.", variant: "destructive" });
      return;
    }
    if (currentProducts.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Product already pinned", description: `"${trimmed}" is already in your bestseller products.` });
      setNewHeroProduct("");
      return;
    }
    const currentAllowed = Array.isArray(profile.allowedSeoEntities) ? [...profile.allowedSeoEntities] : [];
    if (!currentAllowed.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      currentAllowed.unshift(trimmed);
    }
    setProfile({
      ...profile,
      allowedSeoEntities: currentAllowed,
      heroProducts: [...currentProducts, trimmed]
    });
    setNewHeroProduct("");
    toast({ title: "🛍️ Bestseller Product Added", description: `"${trimmed}" will appear in customer review product chips.` });
  };

  // Add custom Bestseller Service
  const addCustomHeroService = () => {
    if (!profile || !newHeroService.trim()) return;
    const trimmed = newHeroService.trim();
    const currentServices = Array.isArray(profile.heroServices) ? [...profile.heroServices] : [];
    if (currentServices.length >= 10) {
      toast({ title: "Maximum 10 Bestseller Services", description: "Unpin one service before adding.", variant: "destructive" });
      return;
    }
    if (currentServices.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Service already pinned", description: `"${trimmed}" is already in your bestseller services.` });
      setNewHeroService("");
      return;
    }
    const currentAllowed = Array.isArray(profile.allowedSeoEntities) ? [...profile.allowedSeoEntities] : [];
    if (!currentAllowed.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      currentAllowed.unshift(trimmed);
    }
    setProfile({
      ...profile,
      allowedSeoEntities: currentAllowed,
      heroServices: [...currentServices, trimmed]
    });
    setNewHeroService("");
    toast({ title: "🛠️ Bestseller Service Added", description: `"${trimmed}" will appear in customer review service chips.` });
  };

  // Switch to an auto-preset
  const applyPreset = (presetKey: string) => {
    const preset = MASTER_KEYWORD_PRESETS[presetKey];
    if (!preset || !profile) return;

    const locality = (profile.localityLandmarks && profile.localityLandmarks[0]) || "Manjalpur";
    const autoKeywords = generateAutoKeywordsForLocation(preset.id, locality, profile.city, profile.businessName);

    setProfile({
      ...profile,
      categoryKey: preset.id,
      gbpPrimaryCategory: preset.gbpCategory,
      audiencePersona: preset.audiencePersona,
      serviceMode: preset.serviceMode,
      allowedSeoEntities: [...preset.seoEntities],
      allowedAeoAnswers: [...preset.aeoAnswers],
      allowedGeoContext: [...preset.geoContext],
      strictlyNotAllowed: [...preset.blacklist],
      heroServices: [...preset.seoEntities.slice(0, 10)],
      heroProducts: [...(preset.seoEntities.length > 10 ? preset.seoEntities.slice(10, 20) : preset.seoEntities.slice(0, 5))],
      autoExtractedKeywords: autoKeywords
    });

    toast({
      title: `Loaded ${preset.label} Preset`,
      description: "Tags, SEO keywords, up to 10 services + 10 products, and negative guardrails populated automatically."
    });
  };

  // Copy All Keywords
  const copyAllKeywords = () => {
    if (!profile?.autoExtractedKeywords) return;
    const all = [
      "=== TIER 1: CORE LOCAL GEO KEYWORDS ===",
      ...profile.autoExtractedKeywords.coreGeo,
      "",
      "=== TIER 2: HIGH-COMMERCIAL & EMERGENCY KEYWORDS ===",
      ...profile.autoExtractedKeywords.commercial,
      "",
      "=== TIER 3: SERVICE PROCEDURES ===",
      ...profile.autoExtractedKeywords.services,
      "",
      "=== TIER 4: CATCHMENT LANDMARKS ===",
      ...profile.autoExtractedKeywords.catchmentLandmarks
    ].join("\n");

    navigator.clipboard.writeText(all);
    setCopiedKeywords(true);
    toast({ title: "Keywords Copied! 📋", description: "Use them in your Google Business Profile Services or Google Ads." });
    setTimeout(() => setCopiedKeywords(false), 2500);
  };

  // Save changes
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/merchant/keyword-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": merchantId
        },
        body: JSON.stringify({ profile })
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        toast({
          title: "Keyword Profile Saved! ✅",
          description: "Zero-Hallucination, Offered/Excluded rules, and Up to 10 Products + 10 Services Bestseller Studio are now active."
        });
      } else {
        throw new Error(json?.error || "Failed to save profile");
      }
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/60 text-center animate-pulse space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 dark:bg-slate-800" />
        <p className="text-xs text-slate-500 font-semibold">Loading Smart Keyword Control Engine...</p>
      </div>
    );
  }

  if (!profile) return null;

  const heroProducts = Array.isArray(profile.heroProducts) ? profile.heroProducts : [];
  const heroServices = Array.isArray(profile.heroServices) ? profile.heroServices : [];
  const activeHeroes = heroServices.length > 0 ? heroServices : profile.allowedSeoEntities.slice(0, 5);

  const autoKw = profile.autoExtractedKeywords || generateAutoKeywordsForLocation(
    profile.categoryKey,
    profile.localityLandmarks?.[0] || "Manjalpur",
    profile.city || "Vadodara",
    profile.businessName
  );

  return (
    <div className="rounded-3xl border-2 border-emerald-500/30 bg-white dark:bg-slate-900/80 p-5 sm:p-7 shadow-lg space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Smart Keyword & Review Grounding Studio</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  Live Guard Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your Offered vs Excluded items, Up to 10 Products + 10 Services Bestsellers, and High-Search GEO keywords for Google Maps #1 ranking.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Rules...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Keyword Rules</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Category Switcher */}
      <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Auto-Preset Template (Select your business type for instant pre-fill):
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(MASTER_KEYWORD_PRESETS).map(([key, preset]) => {
            const isSelected = profile.categoryKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ⭐ MODULE 3: DUAL BESTSELLER STUDIO (UP TO 10 BESTSELLER PRODUCTS + UP TO 10 BESTSELLER SERVICES) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-amber-100/30 dark:from-amber-950/30 dark:via-slate-900/40 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700/60 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 dark:border-amber-800/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100">
                  Dual Bestseller Review Studio (Up to 10 Products + Up to 10 Services)
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  Optional Studio
                </span>
              </div>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                Merchant yahan apne top 10 best-selling products aur top 10 services select kar sakta hai. Review page par inke 1-tap chips aayenge taaki customer ne jo purchase kiya hai sirf usi ka hyper-focused review bane.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-2xs">
              🛍️ {heroProducts.length}/10 Products
            </span>
            <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-2xs">
              🛠️ {heroServices.length}/10 Services
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Products (Left) vs Services (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* CARD A: Top 10 Bestseller Products */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-100">
                  🛍️ Top 10 Bestseller Products
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {heroProducts.length} / 10 Pinned
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Cakes, Pet Food, Shampoos, Clothes, Packaged Foods etc.
            </p>

            {/* Pinned Products List */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[44px] p-2 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
              {heroProducts.map((prod, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-2xs"
                >
                  <ShoppingBag className="w-3 h-3 text-emerald-100" />
                  <span>{prod}</span>
                  <button
                    type="button"
                    onClick={() => toggleHeroProduct(prod)}
                    className="hover:text-emerald-200 cursor-pointer ml-0.5"
                    title="Unpin product"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {heroProducts.length === 0 && (
                <span className="text-xs text-slate-400 italic">No products pinned. Add below or click 🛍️ on offered items below.</span>
              )}
            </div>

            {/* Add Custom Product Input */}
            {heroProducts.length < 10 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add Product e.g. 'Royal Canin Food'..."
                  value={newHeroProduct}
                  onChange={(e) => setNewHeroProduct(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomHeroProduct())}
                  className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={addCustomHeroProduct}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3 h-3" /> Pin Product
                </button>
              </div>
            )}
          </div>

          {/* CARD B: Top 10 Bestseller Services */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                <span className="text-xs font-black text-blue-950 dark:text-blue-100">
                  🩺 / 🛠️ Top 10 Bestseller Services
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {heroServices.length} / 10 Pinned
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Vaccinations, Dental RCT, Hair Spa, Full Checkups, Consultations etc.
            </p>

            {/* Pinned Services List */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[44px] p-2 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40">
              {heroServices.map((srv, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-600 text-white shadow-2xs"
                >
                  <Star className="w-3 h-3 fill-white text-white" />
                  <span>{srv}</span>
                  <button
                    type="button"
                    onClick={() => toggleHeroService(srv)}
                    className="hover:text-blue-200 cursor-pointer ml-0.5"
                    title="Unpin service"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {heroServices.length === 0 && (
                <span className="text-xs text-slate-400 italic">No services pinned. Add below or click 🛠️ on offered items below.</span>
              )}
            </div>

            {/* Add Custom Service Input */}
            {heroServices.length < 10 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add Service e.g. 'Puppy 7-in-1 Vaccination'..."
                  value={newHeroService}
                  onChange={(e) => setNewHeroService(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomHeroService())}
                  className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-blue-300 dark:border-blue-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addCustomHeroService}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3 h-3" /> Pin Service
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 🔍 MODULE 1: AUTO-EXTRACTED HIGH-SEARCH GEO KEYWORDS */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAutoKeywords(!showAutoKeywords)}
            className="flex items-center gap-2 text-left cursor-pointer"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-blue-950 dark:text-blue-100">
              Auto-Extracted High-Ranking Keywords for {profile.localityLandmarks?.[0] || "Manjalpur"}, {profile.city || "Vadodara"}
            </span>
            {showAutoKeywords ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />}
          </button>
          <button
            type="button"
            onClick={copyAllKeywords}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer"
          >
            {copiedKeywords ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKeywords ? "Copied!" : "Copy Keywords"}</span>
          </button>
        </div>

        {showAutoKeywords && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200/80 dark:border-blue-900/30 space-y-1.5">
              <div className="font-extrabold text-blue-900 dark:text-blue-200 text-[11px]">📍 Core GEO Searches:</div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                {autoKw.coreGeo.slice(0, 5).map((kw, i) => (
                  <li key={i} className="flex items-center gap-1">• {kw}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200/80 dark:border-blue-900/30 space-y-1.5">
              <div className="font-extrabold text-blue-900 dark:text-blue-200 text-[11px]">🚨 Commercial & Urgent:</div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                {autoKw.commercial.slice(0, 5).map((kw, i) => (
                  <li key={i} className="flex items-center gap-1">• {kw}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200/80 dark:border-blue-900/30 space-y-1.5">
              <div className="font-extrabold text-blue-900 dark:text-blue-200 text-[11px]">🏥 Service Procedures:</div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                {autoKw.services.slice(0, 5).map((kw, i) => (
                  <li key={i} className="flex items-center gap-1">• {kw}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ⚖️ MODULE 2: OFFERED (WHITELIST) VS NOT OFFERED (BLACKLIST) 2-COLUMN STUDIO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* COLUMN A: We Offer / Whitelist (Green) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ✅ What We Offer / Sell (Allowed Whitelist)
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
              {profile.allowedSeoEntities.length} Items
            </span>
          </div>
          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
            Click 🛍️ to pin as Bestseller Product, ⭐ to pin as Bestseller Service, or ⇄ to move to Blocked.
          </p>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-1.5 max-h-[260px] overflow-y-auto p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/30">
            {profile.allowedSeoEntities.map((tag, idx) => {
              const isHeroProduct = heroProducts.includes(tag);
              const isHeroService = heroServices.includes(tag);
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs transition-all ${
                    isHeroProduct
                      ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-emerald-500 font-bold"
                      : isHeroService
                      ? "bg-blue-100 dark:bg-blue-950/80 text-blue-950 dark:text-blue-200 border-blue-500 font-bold"
                      : "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                  }`}
                >
                  {/* Pin as Product */}
                  <button
                    type="button"
                    onClick={() => toggleHeroProduct(tag)}
                    className="hover:scale-125 transition-transform cursor-pointer"
                    title={isHeroProduct ? "Unpin Product (🛍️)" : "Pin as Bestseller Product (🛍️)"}
                  >
                    <ShoppingBag className={`w-3.5 h-3.5 ${isHeroProduct ? "text-emerald-600 fill-emerald-600" : "text-slate-400 hover:text-emerald-600"}`} />
                  </button>

                  {/* Pin as Service */}
                  <button
                    type="button"
                    onClick={() => toggleHeroService(tag)}
                    className="hover:scale-125 transition-transform cursor-pointer"
                    title={isHeroService ? "Unpin Service (⭐)" : "Pin as Bestseller Service (⭐)"}
                  >
                    <Star className={`w-3.5 h-3.5 ${isHeroService ? "text-blue-600 fill-blue-600" : "text-slate-400 hover:text-blue-600"}`} />
                  </button>

                  <span>{tag}</span>

                  <button
                    type="button"
                    onClick={() => moveToExcluded(idx)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                    title="Move to DO NOT Offer (Banned ❌)"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTag("allowedSeoEntities", idx)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Delete permanently"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>

          {/* Add Tag */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add product e.g. 'Puppy Vaccination', 'Cheese Vadapav'..."
              value={newSeoTag}
              onChange={(e) => setNewSeoTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("allowedSeoEntities", newSeoTag, setNewSeoTag))}
              className="flex-1 text-xs bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => addTag("allowedSeoEntities", newSeoTag, setNewSeoTag)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* COLUMN B: What We DO NOT Offer / Blacklist (Red ❌) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-rose-600" />
              ❌ What We DO NOT Offer (Strict Blacklist)
            </span>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md">
              {profile.strictlyNotAllowed.length} Blocked
            </span>
          </div>
          <p className="text-[11px] text-rose-900/80 dark:text-rose-300/80 leading-relaxed font-medium">
            AI is strictly forbidden from mentioning these words/items in any customer review under any circumstance.
          </p>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-1.5 max-h-[260px] overflow-y-auto p-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/30">
            {profile.strictlyNotAllowed.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700 shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => moveToOffered(idx)}
                  className="text-slate-400 hover:text-emerald-700 cursor-pointer ml-0.5"
                  title="Move to We Offer (Allowed ✅)"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeTag("strictlyNotAllowed", idx)}
                  className="hover:text-rose-700 cursor-pointer"
                  title="Unblock tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Tag */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Block item e.g. 'Pet hostel', 'Egg cake', 'Burger'..."
              value={newBlacklistTag}
              onChange={(e) => setNewBlacklistTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("strictlyNotAllowed", newBlacklistTag, setNewBlacklistTag))}
              className="flex-1 text-xs bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="button"
              onClick={() => addTag("strictlyNotAllowed", newBlacklistTag, setNewBlacklistTag)}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Block
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
