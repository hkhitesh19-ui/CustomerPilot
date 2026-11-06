"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Calendar, RefreshCw, Loader2, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GbpPostCardItem } from "@/components/gbp-post-card-item";

export function MerchantGbpPostQueue({ merchantId, execEmail }: { merchantId: string; execEmail: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gbp/posts?merchantId=${merchantId}`);
      const data = await res.json();
      const payload = data.data || data;
      if ((data.success || data.ok) && payload.posts) {
        setPosts(payload.posts);
      }
    } catch (e) {
      console.error("Failed to load posts:", e);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/gbp/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId }),
      });
      const data = await res.json();
      if (data.success || data.ok) {
        await fetchPosts();
      } else {
        alert("Failed to generate posts: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      console.error("Generate error:", e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Weekly 3-Post Engine (1-Click Google Maps Queue)
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Auto-generated Tuesday (Product) • Thursday (Review) • Saturday (Weekend Offer). Edit, 🎨 regenerate card, customize schedule &amp; approve.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold h-8 shadow-md"
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            )}
            {posts.length > 0 ? "Regenerate 3 Posts" : "Generate 3 Weekly Posts"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchPosts}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:text-white h-8 w-8 p-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          Loading scheduled GBP posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center space-y-1.5">
          <Calendar className="w-6 h-6 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-300 font-medium">No GBP posts queued for this merchant yet.</p>
          <p className="text-[11px] text-slate-500">
            Click &quot;Generate 3 Weekly Posts&quot; to initialize high-converting Google updates with auto-generated cards &amp; captions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {posts.map((post) => (
            <GbpPostCardItem
              key={post.id}
              post={post}
              onPostUpdated={fetchPosts}
              isAdmin={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
