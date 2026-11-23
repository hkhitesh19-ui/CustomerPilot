"use client";

import React, { useState } from "react";
import { Instagram, CheckCircle2, UploadCloud, ExternalLink, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

interface InstagramTaskCardProps {
  merchantId: string;
  customerId: string;
  phone: string;
  instagramUsername?: string;
  onRewardClaimed?: () => void;
}

export default function InstagramTaskCard({
  merchantId,
  customerId,
  phone,
  instagramUsername = "cakeconnection",
  onRewardClaimed
}: InstagramTaskCardProps) {
  const [loadingToken, setLoadingToken] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [showScreenshotUpload, setShowScreenshotUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cleanUsername = (instagramUsername || "cakeconnection").replace(/^@/, "").replace(/\/.*$/, "").trim();
  const profileUrl = `https://www.instagram.com/${cleanUsername}/`;

  // 1. Generate One-Time DM Token and Open Instagram
  const handleAutoVerify = async () => {
    try {
      setLoadingToken(true);
      setErrorMessage(null);

      const res = await fetch("/api/instagram/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, customerId, phone })
      });

      const data = await res.json();
      if (!res.ok || !data.deepLink) {
        throw new Error(data.error || "Failed to generate Instagram verification link");
      }

      setDeepLink(data.deepLink);
      // Open Instagram direct message deep link
      window.open(data.deepLink, "_blank");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to open Instagram");
    } finally {
      setLoadingToken(false);
    }
  };

  // 2. Upload Story Screenshot for Private Accounts
  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("merchantId", merchantId);
      formData.append("customerId", customerId);
      formData.append("phone", phone);

      const res = await fetch("/api/instagram/upload-proof", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadSuccess(true);
      if (onRewardClaimed) onRewardClaimed();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload screenshot");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-amber-500/10 border border-pink-500/30 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Instagram Social Rewards
              <span className="bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-xs px-2 py-0.5 rounded-full font-semibold border border-pink-300 dark:border-pink-800">
                Up to +3 Stamps
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Follow &amp; tag <span className="font-semibold text-pink-600 dark:text-pink-400">@{instagramUsername}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Task Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span><strong>1. Follow Us:</strong> Get +1 Stamp</span>
        </div>
        <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span><strong>2. Story Tag:</strong> Get +2 Extra Stamps</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Primary Action: Direct Follow Profile Link */}
      <div className="space-y-1.5">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Instagram className="w-4.5 h-4.5" />
          <span>Follow @{cleanUsername} on Instagram</span>
          <ExternalLink className="w-4 h-4 opacity-80" />
        </a>
        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
          Tapping opens Instagram profile. Tap <strong>&ldquo;Follow&rdquo;</strong> to support our store!
        </p>
      </div>

      {/* 2. Secondary Action: Verification & Claim Options */}
      <div className="pt-2 border-t border-pink-500/20 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Claim Your Bonus Stamps:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleAutoVerify}
            disabled={loadingToken}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-pink-400 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{loadingToken ? "Connecting..." : "Verify via DM (+1)"}</span>
          </button>
          <button
            onClick={() => setShowScreenshotUpload(!showScreenshotUpload)}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-purple-400 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-purple-500" />
            <span>{showScreenshotUpload ? "Close Upload" : "Upload Proof (+2)"}</span>
          </button>
        </div>
      </div>

      {/* Deep Link Active Box */}
      {deepLink && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Instagram DM link opened! Send message to claim.</span>
          </div>
          <a
            href={deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline flex items-center gap-1 hover:text-emerald-900"
          >
            Re-open <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Mode B: Screenshot Proof Upload */}
      {showScreenshotUpload && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
          <form onSubmit={handleUploadProof} className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5 text-pink-500" />
                Upload Story Screenshot (Private Account)
              </span>
              <button
                type="button"
                onClick={() => setShowScreenshotUpload(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            {uploadSuccess ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Screenshot uploaded! Staff will approve your +2 stamps shortly.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 dark:file:bg-pink-950 dark:file:text-pink-300"
                  required
                />
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-lg hover:opacity-90 disabled:opacity-40 cursor-pointer shrink-0"
                >
                  {uploading ? "Uploading..." : "Submit Proof"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
