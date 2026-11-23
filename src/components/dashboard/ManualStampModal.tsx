"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle2, AlertCircle, Phone, User, Award, ShieldCheck, Zap } from "lucide-react";

interface ManualStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: {
    id?: string;
    name?: string;
    phone?: string;
    currentStamps?: number;
    stampsRequired?: number;
  } | null;
  onSuccess?: () => void;
}

const PRESET_REASONS = [
  "Google Review Bonus Credit",
  "Instagram Follow / Story Reward",
  "System / Network Scan Resolution",
  "Merchant Goodwill / VIP Surprise",
  "Offline Register Bill Compensation"
];

export function ManualStampModal({ isOpen, onClose, customer, onSuccess }: ManualStampModalProps) {
  const [phone, setPhone] = useState("");
  const [stamps, setStamps] = useState<number>(1);
  const [reason, setReason] = useState<string>("System / Network Scan Resolution");
  const [customNote, setCustomNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  useEffect(() => {
    if (customer?.phone) {
      setPhone(customer.phone);
    } else {
      setPhone("");
    }
    setStamps(1);
    setReason("System / Network Scan Resolution");
    setCustomNote("");
    setErrorMessage(null);
    setSuccessResult(null);
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessResult(null);

      const finalReason = customNote.trim() ? `${reason}: ${customNote.trim()}` : reason;

      const payload: any = {
        stamps,
        reason: finalReason
      };

      if (customer?.id) {
        payload.customerId = customer.id;
      } else if (phone.trim()) {
        payload.phone = phone.trim();
      } else {
        throw new Error("Please enter a customer phone number");
      }

      const res = await fetch("/api/customers/manual-stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to award stamps");
      }

      setSuccessResult(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to grant stamps");
    } finally {
      setLoading(false);
    }
  };

  const currentStamps = customer?.currentStamps ?? 0;
  const stampsRequired = customer?.stampsRequired ?? 10;
  const projectedStamps = Math.min(stampsRequired, currentStamps + stamps);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 text-white flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Manual Stamp Override &amp; Goodwill
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Instantly credit bonus stamps to customer wallet with WhatsApp alert.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {successResult ? (
          <div className="py-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                +{successResult.stampsAwarded} Stamp(s) Credited Successfully!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Customer: <strong>{successResult.customer.name}</strong> ({successResult.customer.phone})
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                New Wallet Balance: {successResult.newBalance} / {successResult.stampsRequired} Stamps
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Automated WhatsApp confirmation with live wallet pass has been dispatched.
              </p>
            </div>
            <DialogFooter className="pt-2">
              <Button onClick={onClose} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl">
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Customer Identifier */}
            {customer?.name ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Selected Customer</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    {customer.name}
                  </span>
                  <span className="text-slate-500 text-xs">{customer.phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Current</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {currentStamps} / {stampsRequired} ⭐
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  Customer WhatsApp Phone Number <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 919033304707 or 9033304707"
                  className="mt-1 text-xs rounded-xl"
                  required
                />
              </div>
            )}

            {/* Stamp Count Selector */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Stamps to Award
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Wallet: {currentStamps} ➔ {projectedStamps} / {stampsRequired}
                </span>
              </Label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {[1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStamps(num)}
                    className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      stamps === num
                        ? "bg-amber-500 text-white border-amber-600 shadow-sm scale-102"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    +{num} {num === 1 ? "Stamp" : "Stamps"}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Presets */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reason for Manual Credit
              </Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {PRESET_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      reason === r
                        ? "bg-indigo-600 text-white border-indigo-700 font-bold shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Input
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Optional custom note (e.g. Paid cash at counter)"
                className="mt-2 text-xs rounded-xl"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:opacity-95 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? "Crediting Stamps..." : `Confirm +${stamps} Stamp(s) & Notify WhatsApp`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
