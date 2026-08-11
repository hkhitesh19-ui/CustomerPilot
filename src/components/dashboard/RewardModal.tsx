'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, Sparkles, UserCheck } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  waitingCustomer: any | null;
  onSuccess: () => void;
  merchantId?: string;
  stampValue?: number;
}

export function RewardModal({ isOpen, onClose, waitingCustomer, onSuccess, merchantId = "", stampValue }: RewardModalProps) {
  const [amount, setAmount] = useState('');
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState('');
  const [upsellInfo, setUpsellInfo] = useState<{
    shortfall: number;
    suggestedAmount: number;
    message: string;
  } | null>(null);
  const [result, setResult] = useState<{ stampsAwarded: number } | null>(null);

  if (!waitingCustomer) return null;

  const handleClose = () => {
    setAmount('');
    setProductName('');
    setError('');
    setUpsellInfo(null);
    setResult(null);
    onClose();
  };

  const parsedAmt = parseFloat(amount) || 0;
  const STAMP_THRESHOLD = stampValue && stampValue > 0 ? stampValue : 300; // Dynamic from merchant setting
  
  // Compute shortfall to earn next stamp threshold
  const remainder = parsedAmt % STAMP_THRESHOLD;
  const realTimeShortfall = parsedAmt > 0 && remainder > 0 ? STAMP_THRESHOLD - remainder : (parsedAmt > 0 && parsedAmt < STAMP_THRESHOLD ? STAMP_THRESHOLD - parsedAmt : 0);
  const nextTargetAmount = parsedAmt + realTimeShortfall;
  const currentStampsCount = Math.floor(parsedAmt / STAMP_THRESHOLD);

  const isReturningVIP = (waitingCustomer.customer?.lifetimeStamps || 0) > 0 || (waitingCustomer.customer?.bills?.length || 0) > 0;

  const executeAward = async (forceProceed = false, overrideAmount?: number) => {
    setError('');
    setLoading(true);

    const finalAmount = overrideAmount !== undefined ? overrideAmount : parseFloat(amount);

    try {
      const res = await fetch('/api/rewards/award', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-merchant-id': merchantId,
        },
        body: JSON.stringify({
          waitingCustomerId: waitingCustomer.id,
          amount: finalAmount,
          productName: productName.trim() || undefined,
          forceProceed
        }),
      });

      const data = await res.json();
      
      // Smart Upsell Triggered by API
      if (res.status === 422 && data.isUpsellTriggered) {
        setUpsellInfo({
          shortfall: data.shortfall,
          suggestedAmount: data.suggestedAmount,
          message: data.error
        });
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to award reward');

      setUpsellInfo(null);
      setResult({ stampsAwarded: data.stampsAwarded ?? 0 });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this customer from the queue?')) return;
    setError('');
    setIsRemoving(true);
    setLoading(true);

    try {
      const res = await fetch('/api/queue/remove', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-merchant-id': merchantId,
        },
        body: JSON.stringify({
          waitingCustomerId: waitingCustomer.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove from queue');

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRemoving(false);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setError('Purchase amount is mandatory and must be greater than zero.');
      return;
    }
    executeAward(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100">
        {result ? (
          /* ── Success State ── */
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl border border-emerald-500/30">🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Reward Approved!</h2>
              <p className="text-slate-300 mt-2 text-base">
                <strong className="text-emerald-400 text-lg">{result.stampsAwarded} Stamp{result.stampsAwarded !== 1 ? 's' : ''}</strong> awarded to{' '}
                <span className="text-white font-semibold">{waitingCustomer.customer?.name}</span>.
              </p>
              <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                <span>WhatsApp notification sent to customer.</span> ✅
              </p>
            </div>
            <Button className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold" onClick={handleClose}>Done</Button>
          </div>
        ) : upsellInfo ? (
          /* ── Smart Upsell Interstitial Warning ── */
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-amber-300">Smart Upsell Recommendation</h3>
                <p className="text-xs text-slate-400">Requirements.txt Revenue Optimization</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
              <p className="text-sm text-amber-200 font-medium">
                {upsellInfo.message}
              </p>
              <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                💬 <strong>Script for Staff:</strong> <em>"Sir, bas ₹{upsellInfo.shortfall} ki item aur add kar lijiye, aapko 1 Stamp free mil jayega!"</em>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button 
                type="button" 
                className="w-full bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-bold py-5 shadow-lg shadow-amber-500/10"
                onClick={() => {
                  setAmount(upsellInfo.suggestedAmount.toString());
                  executeAward(true, upsellInfo.suggestedAmount);
                }}
                disabled={loading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Add ₹{upsellInfo.shortfall} (Make ₹{upsellInfo.suggestedAmount}) & Award 1 Stamp
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs"
                onClick={() => executeAward(true)}
                disabled={loading}
              >
                Proceed with ₹{amount} (0 Stamps)
              </Button>
            </div>
          </div>
        ) : (
          /* ── Default Input Form ── */
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl text-slate-100">Reward Customer</DialogTitle>
                {isReturningVIP && (
                  <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Returning VIP
                  </span>
                )}
              </div>
              <DialogDescription className="text-slate-400">
                Enter eligible purchase details for <strong className="text-slate-200">{waitingCustomer.customer?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name (Optional per Requirements.txt Rules) */}
              <div className="space-y-1.5">
                <Label htmlFor="productName" className="text-slate-300 text-sm">Product Name <span className="text-xs text-slate-500">(Optional)</span></Label>
                <Input
                  id="productName"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Black Forest Cake"
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm"
                />
              </div>

              {/* Bill Amount (Mandatory per Requirements.txt Rules) */}
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-slate-300 text-sm">Purchase Amount (₹) <span className="text-emerald-400">*</span></Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. 550"
                  required
                  autoFocus
                  className="bg-slate-900 border-slate-800 text-slate-100 text-lg font-semibold placeholder:text-slate-600"
                />
              </div>

              {/* Real-Time Smart Upsell Indicator while typing */}
              {realTimeShortfall > 0 && (
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>
                      {currentStampsCount > 0 ? (
                        <>🎉 <strong>{currentStampsCount} Stamp{currentStampsCount > 1 ? 's' : ''}</strong> earned! Only <strong>₹{realTimeShortfall}</strong> away from Stamp #{currentStampsCount + 1}!</>
                      ) : (
                        <>Only <strong>₹{realTimeShortfall}</strong> away from 1 Stamp!</>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAmount(nextTargetAmount.toString())}
                    className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-2 py-1 rounded transition-colors whitespace-nowrap ml-2"
                  >
                    Make ₹{nextTargetAmount}
                  </button>
                </div>
              )}

              {error && <p className="text-sm text-red-400 bg-red-950/50 p-2.5 rounded border border-red-900">{error}</p>}

              <DialogFooter className="fixed bottom-0 left-0 w-full p-4 bg-slate-950 border-t border-slate-800 md:relative md:border-none md:p-0 md:bg-transparent md:flex md:justify-end gap-2 z-50">
                <Button type="button" variant="ghost" onClick={handleRemove} disabled={loading} className="text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full md:w-auto md:mr-auto">
                  {isRemoving ? 'Removing...' : 'Dismiss'}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="border-slate-800 text-slate-400 w-full md:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !amount} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold w-full md:w-auto">
                  {loading && !isRemoving ? 'Processing...' : 'Give Reward'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
