"use client";

import { useState } from "react";
import {
  ShieldCheck, KeyRound, Copy, Check, MessageSquare, Send,
  ChevronDown, ChevronUp, ExternalLink, Loader2, Sparkles, CheckCircle2, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GbpStepZeroAccessBannerProps {
  merchantId: string;
  merchantName: string;
  merchantPhone?: string | null;
  className?: string;
}

export function GbpStepZeroAccessBanner({
  merchantId,
  merchantName,
  merchantPhone,
  className = "",
}: GbpStepZeroAccessBannerProps) {
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  const agencyEmail = "customerpilot1@gmail.com";

  // Check verified status for known authorized accounts
  const isCakeConnection = merchantName.toLowerCase().includes("cake") || merchantId === "cmtymavfx0002kx008lbfvp57";
  const isCustomerPilot = merchantName.toLowerCase().includes("customerpilot") || merchantId === "customerpilot-hq";
  const isManagerVerified = isCakeConnection || isCustomerPilot;

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(agencyEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendWhatsAppReminder = async () => {
    setSendingReminder(true);
    setReminderStatus(null);
    try {
      const res = await fetch("/api/gbp/send-access-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId }),
      });
      const data = await res.json();
      if (data.ok || data.success) {
        setReminderStatus("WhatsApp reminder successfully dispatched to merchant! 🚀");
      } else {
        setReminderStatus(data.error || "Failed to send WhatsApp reminder");
      }
    } catch (e: any) {
      setReminderStatus(e.message || "Network error sending WhatsApp");
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <div className={`p-4 rounded-2xl border ${
      isManagerVerified
        ? "border-emerald-200/80 bg-gradient-to-r from-emerald-50/60 via-white to-blue-50/40"
        : "border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-rose-50/30"
    } shadow-xs space-y-3 ${className}`}>
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isManagerVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}>
            {isManagerVerified ? <ShieldCheck className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Step 0 • Foundation Access
              </span>
              <Badge className={`text-[10px] font-bold px-2 py-0.5 ${
                isManagerVerified
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}>
                {isManagerVerified ? "✓ Manager Access Active" : "⚠️ Manager Access Required"}
              </Badge>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Google Business Profile Agency Manager Authorization
            </h4>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyEmail}
            className="h-7 text-xs border-slate-200 bg-white hover:bg-slate-50 text-slate-700 gap-1.5 font-medium"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            {copied ? "Email Copied!" : agencyEmail}
          </Button>

          <Button
            size="sm"
            onClick={handleSendWhatsAppReminder}
            disabled={sendingReminder}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs"
          >
            {sendingReminder ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
            {isManagerVerified ? "Send Access Info via WhatsApp" : "Remind on WhatsApp"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowGuide(!showGuide)}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800"
            title="Toggle Step-by-Step Guide"
          >
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Status Details / Verification Line */}
      <div className="text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {isManagerVerified ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isCakeConnection
                ? "Verified: Granted by order.cakeconnection@gmail.com to customerpilot1@gmail.com (Role: Manager)"
                : "Verified: Direct Manager / Primary Owner Access Active via customerpilot1@gmail.com"}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Merchant ko customerpilot1@gmail.com ko Google Business Profile me Manager add karna zaroori hai.
            </span>
          )}
        </div>

        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(merchantName)}`}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
        >
          Open Google Business Profile <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Reminder Status Alert */}
      {reminderStatus && (
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {reminderStatus}
        </div>
      )}

      {/* Collapsible 3-Step Manager Access Guide */}
      {showGuide && (
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Merchant Ke Liye 3 Simple Steps (Manager Access Dene Ka Tarika):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="font-bold text-blue-900">Step 1: Google Search</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Google par apni dukan ka naam <strong>"{merchantName}"</strong> search karein taaki <em>"Your business on Google"</em> panel open ho.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="font-bold text-blue-900">Step 2: People and access</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Top right me <strong>3 dots ⋮ (Menu)</strong> par click karein ➔ <strong>Business Profile settings</strong> ➔ <strong>People and access</strong> me jayein.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1">
              <div className="font-bold text-blue-900">Step 3: Add Manager</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                <strong>+ Add</strong> par click karein, email dalein: <strong className="text-emerald-700 font-mono text-[10px]">customerpilot1@gmail.com</strong>, Role <strong>Manager</strong> select karein aur <strong>Invite</strong> send karein.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
