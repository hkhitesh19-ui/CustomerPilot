"use client";

import { useState } from "react";
import {
  Sparkles, Calendar, Clock, Edit3, Check, CheckCircle2, RotateCcw,
  Palette, Loader2, ExternalLink, Tag, Copy, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const POSTING_TIMES = ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM", "08:00 PM"];

export interface GbpPostCardItemProps {
  post: any;
  onPostUpdated: () => Promise<void> | void;
  isAdmin?: boolean;
}

export function GbpPostCardItem({ post, onPostUpdated, isAdmin = false }: GbpPostCardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editCaption, setEditCaption] = useState(post.caption || "");
  const [editCtaUrl, setEditCtaUrl] = useState(post.ctaUrl || "");

  // Schedule Customizer state
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDay, setSelectedDay] = useState(post.scheduledDay || "Tuesday");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isPosted = post.status === "POSTED";
  const isApproved = post.status === "APPROVED";
  const isAwaiting = post.status === "AWAITING_APPROVAL";

  const dateFormatted = new Date(post.scheduledDate).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const badgeText =
    post.postType === "PRODUCT_SPOTLIGHT"
      ? `${post.scheduledDay || "Tuesday"} • Product Spotlight`
      : post.postType === "SOCIAL_PROOF"
      ? `${post.scheduledDay || "Thursday"} • 5-Star Social Proof`
      : `${post.scheduledDay || "Saturday"} • Weekend VIP Offer`;

  // 1. Save Text Edit (Title, Caption, CTA)
  const handleSaveTextEdit = async () => {
    setLoadingAction("save-edit");
    try {
      const res = await fetch(`/api/gbp/posts/${post.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          caption: editCaption,
          ctaUrl: editCtaUrl,
        }),
      });
      const data = await res.json();
      if (data.success || data.ok) {
        setIsEditing(false);
        await onPostUpdated();
      } else {
        alert("Failed to save changes: " + (data.error || "Unknown"));
      }
    } catch (e) {
      console.error("Save edit error:", e);
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. 🎨 Regenerate Card Image
  const handleRegenerateImage = async () => {
    setLoadingAction("regenerate-image");
    try {
      const res = await fetch(`/api/gbp/posts/${post.id}/regenerate-image`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success || data.ok) {
        await onPostUpdated();
      } else {
        alert("Failed to regenerate card image: " + (data.error || "Unknown"));
      }
    } catch (e) {
      console.error("Regenerate image error:", e);
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Save Schedule (Weekday & Posting Time)
  const handleSaveSchedule = async () => {
    setLoadingAction("save-schedule");
    try {
      const d = new Date(post.scheduledDate || Date.now());
      const res = await fetch(`/api/gbp/posts/${post.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDay: selectedDay,
          scheduledDate: d.toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success || data.ok) {
        setIsScheduling(false);
        await onPostUpdated();
      } else {
        alert("Failed to update schedule: " + (data.error || "Unknown"));
      }
    } catch (e) {
      console.error("Save schedule error:", e);
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. Approve for Auto-Posting
  const handleApprove = async () => {
    setLoadingAction("approve");
    try {
      const res = await fetch(`/api/gbp/posts/${post.id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success || data.ok) {
        await onPostUpdated();
      } else {
        alert("Failed to approve post: " + (data.error || "Unknown"));
      }
    } catch (e) {
      console.error("Approve post error:", e);
    } finally {
      setLoadingAction(null);
    }
  };

  const copyCaption = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(post.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between transition-all hover:border-slate-300 shadow-xs hover:shadow-sm text-slate-800">
      <div className="space-y-2.5">
        {/* Header badges */}
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {badgeText}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
              isPosted
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : isApproved
                ? "text-blue-700 bg-blue-50 border-blue-200"
                : "text-amber-700 bg-amber-50 border-amber-200"
            }`}
          >
            {isPosted ? "✓ Live on Maps" : isApproved ? "✓ Approved for Auto-Post" : "⏳ Awaiting Approval"}
          </span>
        </div>

        {/* Card Visual Thumbnail */}
        <div className="overflow-hidden rounded-xl border border-slate-200 relative group bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt={post.title || "GBP Post Card"}
            className="w-full h-36 object-cover transition-transform group-hover:scale-102"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            {post.revisionCount > 0 && (
              <span className="bg-slate-900/80 text-[10px] text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 backdrop-blur-sm">
                Rev #{post.revisionCount}
              </span>
            )}
            <a
              href={post.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-900/80 hover:bg-slate-950 text-[10px] text-white px-2 py-0.5 rounded flex items-center gap-1 border border-slate-700 backdrop-blur-sm"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              View
            </a>
          </div>
        </div>

        {/* Inline Schedule Customizer View */}
        {isScheduling && (
          <div className="p-3 rounded-xl bg-slate-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Customize Posting Schedule
              </span>
              <button onClick={() => setIsScheduling(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Weekday</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-800"
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Posting Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-800"
                >
                  {POSTING_TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-1.5 pt-1">
              <Button
                size="sm"
                onClick={handleSaveSchedule}
                disabled={loadingAction === "save-schedule"}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 flex-1 font-bold"
              >
                {loadingAction === "save-schedule" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                Save Schedule
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsScheduling(false)}
                className="border-slate-200 text-slate-600 text-xs h-7"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Inline Post Content Editor */}
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Post Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Caption</label>
              <textarea
                rows={4}
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-900 leading-relaxed"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">CTA Link / WhatsApp URL</label>
              <input
                type="text"
                value={editCtaUrl}
                onChange={(e) => setEditCtaUrl(e.target.value)}
                placeholder="https://wa.me/..."
                className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-900"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveTextEdit}
                disabled={loadingAction === "save-edit"}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 flex-1 font-bold"
              >
                {loadingAction === "save-edit" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                Save Edits
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-slate-200 text-slate-600 text-xs h-7"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {post.title && <div className="text-xs font-bold text-slate-900 line-clamp-1">{post.title}</div>}
            {post.couponCode && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Tag className="w-3 h-3 text-amber-600" />
                Coupon: <span className="font-bold">{post.couponCode}</span>
              </div>
            )}
            <p className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {post.caption}
            </p>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {!isEditing && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="text-[10px] text-slate-500 flex justify-between items-center">
            <span>
              Scheduled: <strong className="text-slate-800">{dateFormatted} • {selectedTime}</strong>
            </span>
            <span className="font-semibold text-blue-600">CTA: {post.ctaType || "ORDER"}</span>
          </div>

          {!isPosted && (
            <div className="space-y-1.5">
              {/* Approval Button */}
              {isAwaiting && (
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={loadingAction === "approve"}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-7 shadow-xs"
                >
                  {loadingAction === "approve" ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  )}
                  Approve for Scheduled Auto-Posting
                </Button>
              )}

              {/* 3 Action Buttons: Edit Text, Regenerate Image, Modify Schedule */}
              <div className="grid grid-cols-3 gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-[11px] h-7 px-1 font-semibold"
                >
                  <Edit3 className="w-3 h-3 mr-1 text-slate-500" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerateImage}
                  disabled={loadingAction === "regenerate-image"}
                  className="border-slate-200 bg-slate-50 text-blue-600 hover:bg-blue-50 text-[11px] h-7 px-1 font-semibold"
                  title="Generate a fresh designer card style"
                >
                  {loadingAction === "regenerate-image" ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Palette className="w-3 h-3 mr-1" />
                  )}
                  🎨 New Image
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsScheduling(!isScheduling)}
                  className="border-slate-200 bg-slate-50 text-amber-600 hover:bg-amber-50 text-[11px] h-7 px-1 font-semibold"
                  title="Modify posting weekdays and time"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Schedule
                </Button>
              </div>
            </div>
          )}

          {isApproved && (
            <div className="text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 text-center font-medium">
              ✓ Approved • Scheduled to post on {dateFormatted} at {selectedTime}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
