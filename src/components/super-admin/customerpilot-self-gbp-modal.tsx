"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MapPin,
  Star,
  MessageSquare,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Send,
  Zap,
  TrendingUp,
  ShieldCheck,
  Building2,
  FileCheck2,
  Compass,
} from "lucide-react";
import { GbpPostCardItem } from "@/components/gbp-post-card-item";
import { GbpAnalyticsPanel } from "@/components/gbp-analytics-panel";

interface SelfGbpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerPilotSelfGbpModal({ open, onOpenChange }: SelfGbpModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"flywheel" | "posts" | "telemetry" | "checklist">("posts");
  const [generatingPosts, setGeneratingPosts] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchSelfData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gbp/self-operations");
      const resJson = await res.json();
      if (resJson.success) {
        setData(resJson.data);
      }
    } catch (e) {
      console.error("Failed to load self GBP data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSelfData();
    }
  }, [open]);

  const handleGenerateWeeklyPosts = async () => {
    setGeneratingPosts(true);
    try {
      const res = await fetch("/api/admin/gbp/self-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE_WEEKLY_POSTS" }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        await fetchSelfData();
        setActiveTab("posts");
      } else {
        alert("Failed to generate posts: " + resJson.error);
      }
    } catch (e) {
      console.error("Error generating posts:", e);
    } finally {
      setGeneratingPosts(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 text-slate-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                  CustomerPilot Self-GBP Command Hub
                  <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] font-extrabold px-2 py-0.5">
                    DOGFOODING SUITE
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autonomous Local SEO, AEO &amp; Review Optimization for CustomerPilot's own Google Business Profile
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchSelfData}
                disabled={loading}
                className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Top Status & Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-400" /> Primary Category
            </span>
            <p className="text-sm font-extrabold text-white mt-1">Software Company</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Secondary: Marketing Agency</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> GBP Track Status
            </span>
            <p className="text-sm font-extrabold text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Track B Locked
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Top 3 Rank Accelerator</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" /> Google Rating
            </span>
            <p className="text-sm font-extrabold text-amber-300 mt-1">5.0 ★ (48 Reviews)</p>
            <p className="text-[10px] text-slate-500 mt-0.5">100% 5-Star B2B Reviews</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Verified Place ID
            </span>
            <p className="text-xs font-mono font-bold text-slate-200 mt-1 truncate">ChIJCustomerPilotVadodaraHQ</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Manjalpur, Vadodara HQ</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-5 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "posts"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            1. Weekly 3-Post Engine ({data?.posts?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "telemetry"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            2. Keywords &amp; 9-Point Geo-Grid
          </button>

          <button
            onClick={() => setActiveTab("flywheel")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "flywheel"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            3. Merchant Review Flywheel ({data?.eligibleReviewers?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("checklist")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "checklist"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            4. SOP Checklist ({data?.merchant?.checklistProgress || 0}%)
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {/* TAB 1: Weekly 3-Post Engine */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Automated Weekly 3-Post Content Studio
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    View posts, edit copy, 🎨 regenerate designer cards, customize weekday/time schedule, and approve for auto-post.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleGenerateWeeklyPosts}
                  disabled={generatingPosts}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-8 shadow-md"
                >
                  <Zap className={`w-3.5 h-3.5 mr-1.5 ${generatingPosts ? "animate-spin" : ""}`} />
                  {generatingPosts ? "Generating..." : "Generate Fresh 3-Posts"}
                </Button>
              </div>

              {(!data?.posts || data.posts.length === 0) ? (
                <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  No weekly posts generated yet. Click &quot;Generate Fresh 3-Posts&quot; to initialize Tuesday, Thursday, and Saturday content.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {data.posts.map((post: any) => (
                    <GbpPostCardItem
                      key={post.id}
                      post={post}
                      onPostUpdated={fetchSelfData}
                      isAdmin={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Telemetry & Radar */}
          {activeTab === "telemetry" && (
            <div className="space-y-4">
              <GbpAnalyticsPanel merchantId="customerpilot-hq" />
            </div>
          )}

          {/* TAB 3: Merchant Review Flywheel */}
          {activeTab === "flywheel" && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 flex items-start justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <p className="font-bold text-sky-400">Merchant-to-CustomerPilot Review Collector</p>
                  <p className="mt-0.5 text-slate-400">
                    Merchants who reached active loyalty &amp; review milestones are listed below. Click WhatsApp to invite them to post their verified 5-star experience on Google Maps.
                  </p>
                </div>
                <a
                  href="/review?m=customerpilot-hq"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-bold whitespace-nowrap bg-sky-900/50 px-3 py-1.5 rounded-lg border border-sky-500/30"
                >
                  <ExternalLink className="w-3 h-3" />
                  Preview Review Page
                </a>
              </div>

              {(!data?.eligibleReviewers || data.eligibleReviewers.length === 0) ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No merchant review candidates found.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.eligibleReviewers.map((cand: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm text-white">{cand.name}</p>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                            {cand.milestoneReason}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          Owner: {cand.ownerName || "Merchant"} • Phone: {cand.whatsappPhone || "Not set"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(cand.suggestedWhatsAppMessage, `msg-${idx}`)}
                          className="border-slate-700 bg-slate-800 text-slate-300 text-xs h-8"
                        >
                          {copiedKey === `msg-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 mr-1" />
                          )}
                          Copy Invite
                        </Button>

                        {cand.whatsappPhone && (
                          <a
                            href={`https://wa.me/${cand.whatsappPhone.replace(/\D/g, '')}?text=${encodeURIComponent(cand.suggestedWhatsAppMessage)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 h-8"
                          >
                            <Send className="w-3 h-3" />
                            Send WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SOP Checklist */}
          {activeTab === "checklist" && (
            <div className="space-y-2">
              {(!data?.checklist || data.checklist.length === 0) ? (
                <div className="text-center py-8 text-slate-500 text-xs">No checklist items found.</div>
              ) : (
                data.checklist.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.isDone ? "bg-emerald-500 text-white" : "border border-slate-600"}`}>
                        {item.isDone && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className={item.isDone ? "text-slate-300 line-through" : "text-white font-medium"}>
                        {item.taskLabel}
                      </span>
                    </div>
                    <Badge variant="outline" className="border-slate-800 text-[10px] text-slate-400">
                      Phase {item.week}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
