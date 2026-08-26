"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star, MessageSquare, Copy, ExternalLink, Sparkles, RefreshCw,
  CheckCircle2, Clock, ShieldAlert, AlertTriangle, Send, Filter, Check, Share2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ReviewShareCard } from "@/components/review-share-card"
import { useDashboardState } from "@/hooks/use-dashboard-state"

interface ReviewItem {
  id: string
  reviewerName: string
  rating: number
  comment: string
  reviewReply: string | null
  isReplied: boolean
  repliedAt: string | null
  status: "pending" | "replied" | "quota_blocked"
  createdAt: string
}

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const { data: dashboardData } = useDashboardState()
  const [sharingReview, setSharingReview] = useState<ReviewItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "5star" | "blocked">("all")
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  // Fetch Reviews
  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/reviews/list")
      if (res.ok) {
        const json = await res.json()
        if (json.reviews) {
          setReviews(json.reviews)
          // Initialize draft replies with SEO optimization
          const drafts: Record<string, string> = {}
          json.reviews.forEach((r: ReviewItem) => {
            const isNonSeoFallback = !r.reviewReply || r.reviewReply === "Thank you for the amazing review! It means a lot to us."
            drafts[r.id] = isNonSeoFallback 
              ? generateDefaultAiReply(r.reviewerName, r.rating, r.comment)
              : r.reviewReply
          })
          setDraftReplies(drafts)
        }
      }
    } catch (e) {
      console.error("Failed to fetch reviews:", e)
    } finally {
      setLoading(false)
    }
  }

  const generateDefaultAiReply = (name: string, rating: number, comment?: string) => {
    const firstName = name ? name.split(" ")[0] : "VIP"
    if (rating >= 4) {
      return `Hi ${firstName}! 🌟 Thank you so much for your wonderful 5-star Google review of Cake Connection in Vadodara! We're thrilled you loved our fresh cakes and bakery delicacies. Looking forward to serving you again soon! 🎂❤️`
    } else {
      return `Hi ${firstName}, thank you for your review of Cake Connection Vadodara. We sincerely apologize for not meeting your expectations. Please contact us directly on WhatsApp so we can make this right for you!`
    }
  }

  const handleGenerateAiReply = async (reviewId: string, item: ReviewItem) => {
    setGeneratingId(reviewId)
    try {
      const res = await fetch("/api/reviews/generate-ai-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerName: item.reviewerName,
          rating: item.rating,
          comment: item.comment,
          merchantId: item.merchantId
        }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.reply) {
          setDraftReplies(prev => ({ ...prev, [reviewId]: json.reply }))
        }
      }
    } catch (e) {
      console.error("Failed to generate AI reply:", e)
    } finally {
      setGeneratingId(null)
    }
  }

  const handleSaveModifiedReply = async (reviewId: string) => {
    const replyText = draftReplies[reviewId] || ""
    if (!replyText) return

    setSavingId(reviewId)
    try {
      const res = await fetch("/api/reviews/update-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, reviewReply: replyText }),
      })
      if (res.ok) {
        alert("✅ Modified AI Owner Reply saved to database!")
        setReviews(prev =>
          prev.map(r => (r.id === reviewId ? { ...r, reviewReply: replyText } : r))
        )
      }
    } catch (e) {
      console.error("Failed to save modified reply:", e)
    } finally {
      setSavingId(null)
    }
  }

  const handleOneClickCopyAndPost = async (item: ReviewItem) => {
    const replyText = draftReplies[item.id] || ""
    setCopiedId(item.id)

    // 1. Copy to clipboard
    try {
      await navigator.clipboard.writeText(replyText)
    } catch (e) {
      console.error("Clipboard copy failed:", e)
    }

    // 2. Mark as replied in database
    try {
      await fetch("/api/reviews/record-google-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: item.id,
          reviewText: replyText,
          status: "replied",
        }),
      })

      // Update local state
      setReviews(prev =>
        prev.map(r => (r.id === item.id ? { ...r, isReplied: true, status: "replied", reviewReply: replyText } : r))
      )
    } catch (e) {
      console.error("Failed to update status:", e)
    }

    // 3. Open Google Business Profile Manager link in new tab
    const gbpUrl = "https://business.google.com/reviews"
    setTimeout(() => {
      window.open(gbpUrl, "_blank")
      setCopiedId(null)
    }, 200)
  }

  const handleTestProgrammaticPush = async (item: ReviewItem) => {
    const replyText = draftReplies[item.id] || ""
    try {
      const res = await fetch("/api/reviews/post-reply-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: item.id,
          comment: replyText,
        }),
      })
      const json = await res.json()
      if (json.status === "QUOTA_LOCKED") {
        alert("🔒 Google API Quota is locked (0/min). Reply safely queued in Dead-Letter Queue! Click '1-Click Copy & Post' to update on Google Maps manually right now.")
      } else if (json.success) {
        alert("🎉 Auto-Reply posted live to Google Maps via API!")
      }
      fetchReviews()
    } catch (e) {
      alert("Quota locked. Saved to Dead-Letter Queue.")
    }
  }

  const filteredReviews = reviews.filter(r => {
    if (activeTab === "pending") return !r.isReplied
    if (activeTab === "5star") return r.rating === 5
    if (activeTab === "blocked") return r.status === "quota_blocked"
    return true
  })

  return (
    <div className="space-y-6">
      
      {/* ─── Header & Status Banner ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">1-Click GoogleReview AutoReply Studio</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage 5-star Google reviews & post AI owner replies in 1-Click (Pre-Approval Phase).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>1-Click AI Auto-Reply Active</span>
          </Badge>
        </div>
      </div>

      {/* Quota Mode Explanation Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30 shadow-xl">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Mode: 1-Click AI Reply Assistant (Pre-Approval Phase)</span>
            </div>
            <p className="text-xs text-slate-300">
              AI automatically drafts personalized 5-star replies for every review. Click <strong className="text-emerald-400">"1-Click Copy & Post"</strong> to update on Google Maps in 10 seconds!
            </p>
          </div>
          <Button
            size="sm"
            onClick={fetchReviews}
            variant="outline"
            className="border-indigo-400/40 text-indigo-200 hover:bg-indigo-900/50 text-xs gap-1.5 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Reviews
          </Button>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        {[
          { id: "all", label: `All Reviews (${reviews.length})` },
          { id: "pending", label: `Pending Reply (${reviews.filter(r => !r.isReplied).length})` },
          { id: "5star", label: `5 Stars ⭐ (${reviews.filter(r => r.rating === 5).length})` },
          { id: "blocked", label: `Dead-Letter Queue (${reviews.filter(r => r.status === "quota_blocked").length})` },
        ].map(tab => (
          <Button
            key={tab.id}
            size="sm"
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id as any)}
            className={activeTab === tab.id ? "bg-emerald-500 text-stone-950 font-bold text-xs" : "text-slate-400 text-xs"}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse bg-slate-900/40 h-40 border-slate-800" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="bg-slate-900/40 border-slate-800 p-12 text-center text-slate-500 text-xs">
          No reviews found in this category.
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(item => (
            <Card key={item.id} className="bg-slate-900 border-slate-800 relative overflow-hidden shadow-lg">
              <CardContent className="p-6 space-y-4">
                
                {/* Top Row: Reviewer Name + Star Rating + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                      {item.reviewerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{item.reviewerName}</h4>
                      <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"}`}
                          />
                        ))}
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {item.isReplied ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[11px] gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Replied on Google
                      </Badge>
                    ) : item.status === "quota_blocked" ? (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[11px] gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> In Dead-Letter Queue
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-400 border-slate-700 text-[11px]">
                        Pending Auto-Reply
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Review Text */}
                {item.comment && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 italic">
                    "{item.comment}"
                  </p>
                )}

                {/* AI Reply Draft Box */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> AI Owner Reply Draft (SEO-Optimized & Editable):
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveModifiedReply(item.id)}
                        disabled={savingId === item.id}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 h-6 px-2 font-medium"
                      >
                        💾 {savingId === item.id ? "Saving..." : "Save Edits"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleGenerateAiReply(item.id, item)}
                        disabled={generatingId === item.id}
                        className="text-[11px] text-slate-400 hover:text-emerald-300 h-6 px-2"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${generatingId === item.id ? "animate-spin" : ""}`} />
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  <textarea
                    value={draftReplies[item.id] || ""}
                    onChange={e => setDraftReplies(prev => ({ ...prev, [item.id]: e.target.value }))}
                    className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none font-sans leading-relaxed"
                    placeholder="AI generating response..."
                  />
                  <p className="text-[11px] text-slate-500 italic">
                    ✏️ <strong>Owner Edit Mode:</strong> Type directly in the box to customize this reply. Click <strong>"Save Edits"</strong> to store in DB or <strong>"1-Click Copy & Post"</strong> to update on Google.
                  </p>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSharingReview(item)}
                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40 text-xs gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Card
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestProgrammaticPush(item)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                  >
                    ⚡ Test API Push
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handleOneClickCopyAndPost(item)}
                    className={`text-xs font-bold px-5 gap-2 ${
                      copiedId === item.id
                        ? "bg-emerald-600 text-white"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-stone-950 shadow-md"
                    }`}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-4 h-4" /> Copied! Opening Google...
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> 1-Click Copy & Post on Google <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </>
                    )}
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Share Card Modal */}
      {sharingReview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <ReviewShareCard
            review={{
              rating: sharingReview.rating,
              comment: sharingReview.comment || "",
              authorName: sharingReview.reviewerName,
              createdAt: sharingReview.createdAt,
            }}
            merchantName={dashboardData?.merchant?.name || "Our Store"}
            onClose={() => setSharingReview(null)}
          />
        </div>
      )}
    </div>
  )
}
