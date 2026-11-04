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
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  KeywordProfile, 
  CategoryPreset, 
  MASTER_KEYWORD_PRESETS 
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
    const updated = currentList.filter((_, i) => i !== index);
    setProfile({ ...profile, [field]: updated });
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

  // Switch to an auto-preset
  const applyPreset = (presetKey: string) => {
    const preset = MASTER_KEYWORD_PRESETS[presetKey];
    if (!preset || !profile) return;

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
    });

    toast({
      title: `Loaded ${preset.label} Preset`,
      description: "Tags, SEO keywords, and negative guardrails populated automatically."
    });
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
          description: "Zero-Hallucination & SEO grounding rules are now active for all reviews."
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
                <span>Smart Keyword Control & Zero-Hallucination Guard</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  3-Layer Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Control exact SEO, Voice Search (AEO), and AI Overview (GEO) keywords. Block unwanted items (Blacklist) to ensure AI never hallucinates wrong products.
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

      {/* Target Audience / Customer Persona */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          Target Audience & Grammar Persona:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: "All_Neutral", label: "All / Neutral", desc: "Balanced tone" },
            { id: "Female_Only", label: "👩 Strictly Ladies", desc: "gayi thi / karwaya" },
            { id: "Male_Only", label: "👨 Men / Gents", desc: "Barber / Gents style" },
            { id: "Family_Kids", label: "👨‍👩‍👧 Family & Kids", desc: "Family dining / stay" },
            { id: "Couples_Friends", label: "👫 Couples & Friends", desc: "Hangout & vibes" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setProfile({ ...profile, audiencePersona: item.id as any })}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                profile.audiencePersona === item.id
                  ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-950 dark:text-blue-100 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-50"
              }`}
            >
              <div className="font-bold text-xs">{item.label}</div>
              <div className="text-[10px] opacity-75">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4 Buckets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bucket 1: SEO Keywords (Green) */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              Allowed: SEO Keywords (Products / Services)
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
              {profile.allowedSeoEntities.length} Active
            </span>
          </div>
          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
            Exact product and service names that match high-intent Google Maps keyword searches.
          </p>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/30">
            {profile.allowedSeoEntities.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag("allowedSeoEntities", idx)}
                  className="hover:text-red-600 cursor-pointer"
                  title="Remove tag"
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
              placeholder="Add product e.g. 'Hydra Facial', 'Chocolate Cake'..."
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

        {/* Bucket 2: AEO Keywords (Voice / Answers - Sky) */}
        <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-sky-600" />
              Allowed: AEO Keywords (Voice & Question Answers)
            </span>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 rounded-md">
              {profile.allowedAeoAnswers.length} Active
            </span>
          </div>
          <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80 leading-relaxed">
            Direct problem-solving answers for Google Assistant, Siri, and voice search questions.
          </p>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/30">
            {profile.allowedAeoAnswers.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-700 shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag("allowedAeoAnswers", idx)}
                  className="hover:text-red-600 cursor-pointer"
                  title="Remove tag"
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
              placeholder="Add answer e.g. '100% Female staff', 'Fast delivery'..."
              value={newAeoTag}
              onChange={(e) => setNewAeoTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("allowedAeoAnswers", newAeoTag, setNewAeoTag))}
              className="flex-1 text-xs bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={() => addTag("allowedAeoAnswers", newAeoTag, setNewAeoTag)}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Bucket 3: GEO Signals (AI Overview Context - Indigo) */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Allowed: GEO Signals (AI Overviews & Context Vibe)
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md">
              {profile.allowedGeoContext.length} Active
            </span>
          </div>
          <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
            Sentiment, occasions, value-for-money, and local area landmarks for Gemini/ChatGPT recommendation.
          </p>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/30">
            {profile.allowedGeoContext.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag("allowedGeoContext", idx)}
                  className="hover:text-red-600 cursor-pointer"
                  title="Remove tag"
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
              placeholder="Add context e.g. 'Natural wedding look', 'Affordable rates'..."
              value={newGeoTag}
              onChange={(e) => setNewGeoTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("allowedGeoContext", newGeoTag, setNewGeoTag))}
              className="flex-1 text-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => addTag("allowedGeoContext", newGeoTag, setNewGeoTag)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Bucket 4: Strict Blacklist Guardrails (Red - BANNED ❌) */}
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-rose-600" />
              Strict Negative Guardrails (BANNED ❌)
            </span>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md">
              {profile.strictlyNotAllowed.length} Blocked
            </span>
          </div>
          <p className="text-[11px] text-rose-900/80 dark:text-rose-300/80 leading-relaxed font-medium">
            AI is strictly forbidden from mentioning these words/items in any review under any circumstance.
          </p>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/30">
            {profile.strictlyNotAllowed.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700 shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag("strictlyNotAllowed", idx)}
                  className="hover:text-red-700 cursor-pointer"
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
              placeholder="Block item e.g. 'Men haircut', 'Bread', 'Non-veg'..."
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
