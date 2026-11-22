"use client";

import React, { useState, useEffect } from "react";
import { Instagram, CheckCircle2, XCircle, Clock, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";

interface ProofItem {
  id: string;
  phone: string;
  screenshot: string;
  stamps: number;
  status: string;
  createdAt: string;
  customer?: {
    name: string;
    phone: string;
  };
}

interface InstagramProofQueueProps {
  merchantId: string;
}

export default function InstagramProofQueue({ merchantId }: InstagramProofQueueProps) {
  const [proofs, setProofs] = useState<ProofItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchPendingProofs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/instagram/approve-proof?merchantId=${merchantId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.proofs)) {
        setProofs(data.proofs);
      }
    } catch (err) {
      console.error("Failed to fetch pending proofs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchantId) fetchPendingProofs();
  }, [merchantId]);

  const handleAction = async (proofId: string, action: "APPROVE" | "REJECT") => {
    try {
      setActionLoading(proofId);
      const res = await fetch("/api/instagram/approve-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofId, action, reviewedBy: "Store Cashier" })
      });
      const data = await res.json();
      if (data.success) {
        setProofs((prev) => prev.filter((p) => p.id !== proofId));
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
            <Instagram className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Private Story Proofs Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review and approve screenshots from private Instagram accounts
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-700">
          {proofs.length} Pending
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
          <span>Loading pending proofs...</span>
        </div>
      ) : proofs.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-70" />
          <span>All caught up! Zero pending story proofs.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {proofs.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewImage(item.screenshot)}
                  className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 hover:opacity-80 transition-all cursor-pointer"
                  title="Click to preview screenshot"
                >
                  <img
                    src={item.screenshot}
                    alt="Proof screenshot"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                </button>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{item.customer?.name || "Customer"}</span>
                    <span className="text-[11px] font-normal text-slate-500">({item.phone})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>• Reward: +{item.stamps} Stamps</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleAction(item.id, "REJECT")}
                  disabled={actionLoading === item.id}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleAction(item.id, "APPROVE")}
                  disabled={actionLoading === item.id}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  {actionLoading === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Approve (+{item.stamps})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screenshot Modal Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-3 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200 dark:border-slate-800">
              <span>Instagram Story Screenshot Proof</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-lg">
              <img src={previewImage} alt="Story Proof Full" className="w-full object-contain rounded-lg" />
            </div>
            <div className="text-right">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-pink-600 dark:text-pink-400 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                Open in new tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
