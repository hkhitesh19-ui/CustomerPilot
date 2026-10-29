"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Sparkles, Calendar, Tag, ExternalLink, Copy, Check, CheckCircle2,
  Loader2, RefreshCw, RotateCcw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type GbpPostItem = {
  id: string
  merchantId: string
  postType: string
  scheduledDay: string
  scheduledDate: string
  title: string | null
  caption: string
  imageUrl: string
  ctaType: string | null
  ctaUrl: string | null
  couponCode: string | null
  offerStartDate: string | null
  offerEndDate: string | null
  status: string
  postedAt: string | null
  postedBy: string | null
  gbpPostId: string | null
  errorMessage: string | null
  merchantFeedback: string | null
  revisionCount: number
}

const POST_TYPE_META: Record<string, { label: string; day: string; color: string; badge: string }> = {
  PRODUCT_SPOTLIGHT: {
    label: "Product Spotlight",
    day: "Tuesday",
    color: "border-sky-500/40 bg-sky-950/20",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  SOCIAL_PROOF: {
    label: "5-Star Social Proof",
    day: "Thursday",
    color: "border-amber-500/40 bg-amber-950/20",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  WEEKEND_OFFER: {
    label: "Weekend 2x Loyalty Offer",
    day: "Saturday",
    color: "border-purple-500/40 bg-purple-950/20",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
}

export function MerchantGbpPostQueue({ merchantId, execEmail }: { merchantId: string; execEmail: string }) {
  const [posts, setPosts] = useState<GbpPostItem[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/gbp/posts?merchantId=${merchantId}`)
      const data = await res.json()
      if (data.success && data.posts) {
        setPosts(data.posts)
      }
    } catch (e) {
      console.error("Failed to load posts:", e)
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch("/api/gbp/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchPosts()
      } else {
        alert("Failed to generate posts: " + (data.error || "Unknown error"))
      }
    } catch (e) {
      console.error("Generate error:", e)
    } finally {
      setGenerating(false)
    }
  }

  const handleMarkPosted = async (postId: string) => {
    setMarkingId(postId)
    try {
      const res = await fetch(`/api/gbp/posts/${postId}/mark-posted`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postedBy: execEmail }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchPosts()
      } else {
        alert("Failed to mark post: " + (data.error || "Unknown error"))
      }
    } catch (e) {
      console.error("Mark error:", e)
    } finally {
      setMarkingId(null)
    }
  }

  const handleRegenerate = async (postId: string) => {
    const feedback = prompt("Enter specific feedback or reason for regeneration (optional):")
    if (feedback === null) return
    setMarkingId(postId)
    try {
      const res = await fetch(`/api/gbp/posts/${postId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback || "Operator requested alternative option" }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchPosts()
      } else {
        alert("Failed to regenerate post: " + (data.error || "Unknown error"))
      }
    } catch (e) {
      console.error("Regenerate error:", e)
    } finally {
      setMarkingId(null)
    }
  }

  const handleCopyCaption = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Weekly 3-Post Engine (1-Click Google Queue)
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Auto-generated Tuesday (Product) • Thursday (Review) • Saturday (Weekend Offer)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold h-8"
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
        <div className="py-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          Loading scheduled GBP posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center space-y-1.5">
          <Calendar className="w-6 h-6 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-300 font-medium">No GBP posts queued for this merchant yet.</p>
          <p className="text-[11px] text-slate-500">
            Click &quot;Generate 3 Weekly Posts&quot; to create high-converting Google updates with auto-generated cards &amp; captions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {posts.map((post) => {
            const meta = POST_TYPE_META[post.postType] || {
              label: post.postType,
              day: post.scheduledDay,
              color: "border-slate-700 bg-slate-900/40",
              badge: "bg-slate-800 text-slate-300 border-slate-700",
            }
            const isPosted = post.status === "POSTED"
            const scheduledDateFormatted = new Date(post.scheduledDate).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })

            return (
              <div
                key={post.id}
                className={`rounded-xl border p-3 flex flex-col justify-between space-y-2.5 transition-all ${meta.color}`}
              >
                {/* Header info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <Badge className={`text-[10px] px-2 py-0.5 border font-semibold ${meta.badge}`}>
                      {meta.day} • {meta.label}
                    </Badge>
                    <Badge
                      className={`text-[10px] px-2 py-0.5 border ${
                        isPosted
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : post.status === "APPROVED"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {isPosted
                        ? "✓ Live on GBP"
                        : post.status === "APPROVED"
                        ? "✓ Merchant Approved"
                        : "⏳ Review Pending"}
                    </Badge>
                  </div>

                  {/* Scheduled date */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{scheduledDateFormatted} • 10:00 AM</span>
                  </div>

                  {/* Card Visual Thumbnail */}
                  <div className="relative group overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt={post.title || meta.label}
                      className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <a
                      href={post.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-1.5 right-1.5 bg-black/70 hover:bg-black text-[10px] text-white px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      View Card
                    </a>
                  </div>

                  {/* Title & Coupon */}
                  {post.title && (
                    <p className="text-xs font-bold text-white line-clamp-1">{post.title}</p>
                  )}
                  {post.couponCode && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                      <Tag className="w-3 h-3 text-amber-400" />
                      Coupon: <span className="font-bold">{post.couponCode}</span>
                    </div>
                  )}

                  {/* Caption box */}
                  <div className="max-h-24 overflow-y-auto text-[11px] text-slate-300 p-2 bg-slate-950/80 rounded-lg border border-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {post.caption}
                  </div>
                </div>

                {/* Operator Actions */}
                <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCaption(post.id, post.caption)}
                      className="flex-1 text-xs h-7 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200"
                    >
                      {copiedId === post.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400 mr-1" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400 mr-1" />
                          Copy Caption
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRegenerate(post.id)}
                      disabled={isPosted || markingId === post.id}
                      className="text-xs h-7 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-amber-300"
                      title="Generate fresh image & caption"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleMarkPosted(post.id)}
                    disabled={isPosted || markingId === post.id}
                    className={`w-full text-xs h-7 font-bold ${
                      isPosted
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {markingId === post.id ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : isPosted ? (
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                    ) : null}
                    {isPosted
                      ? `Posted by ${post.postedBy || "OPERATOR"}`
                      : "Mark as Posted to GBP"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
