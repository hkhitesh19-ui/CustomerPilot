'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  Sparkles, 
  UserCheck, 
  Receipt, 
  Zap, 
  Plus, 
  Minus, 
  Search, 
  Percent, 
  Printer, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  waitingCustomer: any | null;
  onSuccess: () => void;
  merchantId?: string;
  stampValue?: number;
}

interface MenuItemOption {
  id: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  imageUrl?: string | null;
}

interface CartItem {
  menuItemId?: string;
  name: string;
  category?: string;
  unitPrice: number;
  quantity: number;
}

export function RewardModal({ isOpen, onClose, waitingCustomer, onSuccess, merchantId = "", stampValue }: RewardModalProps) {
  // Mode: "quick" vs "itemized"
  const [activeTab, setActiveTab] = useState<'itemized' | 'quick'>('itemized');
  const [billingSettings, setBillingSettings] = useState<{
    itemizedBillingEnabled: boolean;
    defaultGstRate: number;
    gstType: string;
    gstin: string;
    invoicePrefix: string;
  } | null>(null);

  // Quick Amount State
  const [amount, setAmount] = useState('');
  const [productName, setProductName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState('');
  const [upsellInfo, setUpsellInfo] = useState<{
    shortfall: number;
    suggestedAmount: number;
    message: string;
  } | null>(null);
  const [result, setResult] = useState<{ stampsAwarded: number } | null>(null);

  // Itemized POS State
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [discountVal, setDiscountVal] = useState('0');
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [gstRate, setGstRate] = useState<number>(0);
  const [gstType, setGstType] = useState<'CGST_SGST' | 'IGST' | 'EXEMPT'>('CGST_SGST');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [invoiceResult, setInvoiceResult] = useState<{ orderNo: string; invoiceUrl: string; grandTotal: number } | null>(null);

  // Fetch Billing Settings & Menu Items
  useEffect(() => {
    async function initData() {
      if (!isOpen || !merchantId) return;

      try {
        // 1. Fetch Billing Settings
        const settingsRes = await fetch('/api/billing/settings', {
          headers: { 'x-merchant-id': merchantId }
        });
        const settingsData = await settingsRes.json();
        if (settingsData?.data?.settings) {
          const s = settingsData.data.settings;
          setBillingSettings(s);
          if (s.itemizedBillingEnabled) {
            setActiveTab('itemized');
            setGstRate(s.defaultGstRate || 0);
            setGstType(s.gstType || 'CGST_SGST');
          } else {
            setActiveTab('quick');
          }
        }

        // 2. Fetch Merchant Menu Items
        setLoadingMenu(true);
        const menuRes = await fetch('/api/menu/items', {
          headers: { 'x-merchant-id': merchantId }
        });
        const menuData = await menuRes.json();
        if (menuData?.data?.items) {
          setMenuItems(menuData.data.items);
        }
      } catch (err) {
        console.error('Failed to load billing or menu data:', err);
      } finally {
        setLoadingMenu(false);
      }
    }

    initData();
  }, [isOpen, merchantId]);

  if (!waitingCustomer) return null;

  const handleClose = () => {
    setAmount('');
    setProductName('');
    setReferralCode('');
    setError('');
    setUpsellInfo(null);
    setResult(null);
    setCart({});
    setDiscountVal('0');
    setCustomItemName('');
    setCustomItemPrice('');
    setSearchQuery('');
    setInvoiceResult(null);
    onClose();
  };

  // ── Financial Calculations for Itemized Cart ──
  const cartItemsList = useMemo(() => Object.values(cart).filter(i => i.quantity > 0), [cart]);

  const subtotal = useMemo(() => {
    return cartItemsList.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [cartItemsList]);

  const discountAmount = useMemo(() => {
    const rawDisc = parseFloat(discountVal) || 0;
    if (discountType === 'percent') {
      return (subtotal * Math.min(100, Math.max(0, rawDisc))) / 100;
    }
    return Math.min(subtotal, Math.max(0, rawDisc));
  }, [subtotal, discountVal, discountType]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const { cgst, sgst, igst, totalTax } = useMemo(() => {
    if (gstRate <= 0) return { cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
    if (gstType === 'IGST') {
      const tax = (taxableAmount * gstRate) / 100;
      return { cgst: 0, sgst: 0, igst: tax, totalTax: tax };
    }
    const halfTax = (taxableAmount * (gstRate / 2)) / 100;
    return { cgst: halfTax, sgst: halfTax, igst: 0, totalTax: halfTax * 2 };
  }, [taxableAmount, gstRate, gstType]);

  const grandTotal = Math.round(taxableAmount + totalTax);

  // Cart Helpers
  const addToCart = (item: { id?: string; name: string; price: number; category?: string }) => {
    const key = item.id || `custom_${item.name}`;
    setCart(prev => {
      const current = prev[key];
      return {
        ...prev,
        [key]: {
          menuItemId: item.id,
          name: item.name,
          category: item.category,
          unitPrice: item.price,
          quantity: (current?.quantity || 0) + 1,
        }
      };
    });
  };

  const removeFromCart = (key: string) => {
    setCart(prev => {
      const current = prev[key];
      if (!current) return prev;
      if (current.quantity <= 1) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: { ...current, quantity: current.quantity - 1 }
      };
    });
  };

  const deleteFromCart = (key: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) return;
    const p = parseFloat(customItemPrice) || 0;
    if (p <= 0) return;

    addToCart({ name: customItemName.trim(), price: p, category: 'Custom' });
    setCustomItemName('');
    setCustomItemPrice('');
  };

  // ── Quick Mode Calculations ──
  const parsedAmt = parseFloat(amount) || 0;
  const STAMP_THRESHOLD = stampValue && stampValue > 0 ? stampValue : 300;
  const referrer = waitingCustomer.referrer || waitingCustomer.customer?.referredBy || waitingCustomer.customer?.referralsReceived?.[0]?.referrer || null;
  const remainder = parsedAmt % STAMP_THRESHOLD;
  const realTimeShortfall = parsedAmt > 0 && remainder > 0 ? STAMP_THRESHOLD - remainder : (parsedAmt > 0 && parsedAmt < STAMP_THRESHOLD ? STAMP_THRESHOLD - parsedAmt : 0);
  const nextTargetAmount = parsedAmt + realTimeShortfall;
  const currentStampsCount = Math.floor(parsedAmt / STAMP_THRESHOLD);
  const isReturningVIP = (waitingCustomer.customer?.lifetimeStamps || 0) > 0 || (waitingCustomer.customer?.bills?.length || 0) > 0;

  // Execute Quick Stamp Award
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
          referralCode: referralCode.trim() || undefined,
          forceProceed
        }),
      });

      const data = await res.json();
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

  // Execute Itemized Invoice Creation
  const handleGenerateInvoice = async () => {
    if (cartItemsList.length === 0) {
      setError('Please add at least one item to generate an invoice.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/billing/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-merchant-id': merchantId,
        },
        body: JSON.stringify({
          waitingCustomerId: waitingCustomer.id,
          items: cartItemsList.map(item => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
          subtotal,
          discount: discountAmount,
          discountType,
          taxableAmount,
          gstRate,
          gstType,
          cgst,
          sgst,
          igst,
          grandTotal,
          paymentMethod: 'UPI'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate tax invoice');

      setInvoiceResult({
        orderNo: data.data.orderNo,
        invoiceUrl: data.data.invoiceUrl,
        grandTotal: data.data.grandTotal
      });
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
        body: JSON.stringify({ waitingCustomerId: waitingCustomer.id }),
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

  const categories = useMemo(() => {
    return Array.from(new Set(menuItems.map(i => i.category))).filter(Boolean);
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={`max-h-[94vh] overflow-y-auto bg-slate-950 border-slate-800 text-slate-100 ${
        activeTab === 'itemized' && !result && !invoiceResult ? 'sm:max-w-3xl' : 'sm:max-w-md'
      }`}>
        
        {/* ── Invoice Generated Success State ── */}
        {invoiceResult ? (
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl border border-emerald-500/30">
              🧾
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                Tax Invoice Created &amp; Sent
              </span>
              <h2 className="text-2xl font-bold text-slate-100 mt-2">Invoice #{invoiceResult.orderNo}</h2>
              <p className="text-slate-300 mt-1 text-sm">
                Total Bill Paid: <strong className="text-emerald-400 text-lg">₹{invoiceResult.grandTotal.toFixed(2)}</strong>
              </p>
              <div className="text-xs text-slate-400 mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Official PDF bill dispatched to <strong>{waitingCustomer.customer?.phone}</strong> via WhatsApp.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full mt-2 font-sans">
              <a
                href={invoiceResult.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View / Print PDF</span>
              </a>
              <Button
                type="button"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        ) : result ? (
          /* ── Quick Reward Approved Success State ── */
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
                <p className="text-xs text-slate-400">Revenue Optimization</p>
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
          /* ── Main Input Container ── */
          <>
            <DialogHeader className="pb-2 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-black text-slate-100 flex items-center gap-2">
                    {activeTab === 'itemized' ? (
                      <>
                        <Receipt className="w-5 h-5 text-emerald-400" />
                        <span>Itemized Bill &amp; Tax Invoice</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 text-amber-400" />
                        <span>Quick Stamp Reward</span>
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400 mt-0.5">
                    Customer: <strong className="text-slate-200">{waitingCustomer.customer?.name}</strong> ({waitingCustomer.customer?.phone})
                  </DialogDescription>
                </div>

                {isReturningVIP && (
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 shrink-0">
                    <UserCheck className="w-3 h-3" /> Returning VIP
                  </span>
                )}
              </div>

              {/* Mode Switch Tabs (If Itemized Billing is enabled) */}
              {billingSettings?.itemizedBillingEnabled && (
                <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 mt-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('itemized')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      activeTab === 'itemized'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Itemized POS Bill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quick')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      activeTab === 'quick'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Quick Stamp Only</span>
                  </button>
                </div>
              )}
            </DialogHeader>

            {/* TAB 1: ITEMIZED POS BILLING */}
            {activeTab === 'itemized' && (
              <div className="space-y-4 pt-2">
                {/* Search & Category Pills */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <Input
                      placeholder="Search shop products by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 bg-slate-900 border-slate-700 text-xs rounded-xl"
                    />
                  </div>

                  {categories.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('ALL')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                          selectedCategory === 'ALL'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        All Items ({menuItems.length})
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                            selectedCategory === cat
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Catalog Grid & Cart Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Product Picker */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Tap Item to Add
                    </span>

                    {loadingMenu ? (
                      <div className="p-4 text-center text-xs text-slate-500">Loading catalog items...</div>
                    ) : filteredItems.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                        No catalog items found. Use the Custom Item form below!
                      </div>
                    ) : (
                      filteredItems.map(item => {
                        const inCartQty = cart[item.id]?.quantity || 0;
                        return (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                              inCartQty > 0
                                ? 'bg-emerald-950/30 border-emerald-500/50'
                                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-xs text-slate-200 truncate flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="truncate">{item.name}</span>
                              </div>
                              <div className="text-[11px] font-mono font-bold text-emerald-400 mt-0.5">
                                ₹{item.price}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {inCartQty > 0 ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-center font-mono font-bold text-xs text-white">
                                    {inCartQty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addToCart(item)}
                                    className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => addToCart(item)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1 transition"
                                >
                                  <Plus className="w-3 h-3" /> Add
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Ad-hoc Custom Item Row */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 space-y-2 mt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        + Add Custom Item
                      </span>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Item Name"
                          value={customItemName}
                          onChange={(e) => setCustomItemName(e.target.value)}
                          className="h-8 text-xs bg-slate-950 border-slate-700"
                        />
                        <Input
                          type="number"
                          placeholder="₹ Price"
                          value={customItemPrice}
                          onChange={(e) => setCustomItemPrice(e.target.value)}
                          className="h-8 text-xs w-24 bg-slate-950 border-slate-700 font-mono"
                        />
                        <Button
                          type="button"
                          onClick={handleAddCustomItem}
                          disabled={!customItemName.trim() || !customItemPrice}
                          className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Selected Cart Summary & Calculations */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-slate-300">
                          Order Summary ({cartItemsList.length} items)
                        </span>
                        {cartItemsList.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCart({})}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Items in Cart */}
                      <div className="max-h-36 overflow-y-auto divide-y divide-slate-800/60 my-2">
                        {cartItemsList.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-500">
                            Cart is empty. Tap any product on the left to add.
                          </div>
                        ) : (
                          cartItemsList.map(item => {
                            const key = item.menuItemId || `custom_${item.name}`;
                            return (
                              <div key={key} className="py-2 flex items-center justify-between text-xs">
                                <div className="truncate pr-2">
                                  <div className="font-semibold text-slate-200 truncate">{item.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {item.quantity} × ₹{item.unitPrice}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white">
                                    ₹{item.quantity * item.unitPrice}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => deleteFromCart(key)}
                                    className="text-slate-500 hover:text-red-400 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Discount & GST Controls */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {/* Discount Control */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Label className="text-[10px] text-slate-400 font-bold block mb-1">
                            Discount
                          </Label>
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              min="0"
                              value={discountVal}
                              onChange={(e) => setDiscountVal(e.target.value)}
                              className="h-8 text-xs font-mono bg-slate-950 border-slate-700"
                            />
                            <button
                              type="button"
                              onClick={() => setDiscountType(prev => prev === 'flat' ? 'percent' : 'flat')}
                              className="px-2 h-8 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 border border-slate-700 shrink-0"
                            >
                              {discountType === 'flat' ? '₹ Flat' : '% Off'}
                            </button>
                          </div>
                        </div>

                        {/* GST Rate Selector */}
                        <div className="flex-1">
                          <Label className="text-[10px] text-slate-400 font-bold block mb-1">
                            GST Tax Rate
                          </Label>
                          <select
                            value={gstRate}
                            onChange={(e) => setGstRate(Number(e.target.value))}
                            className="w-full h-8 text-xs bg-slate-950 border border-slate-700 text-slate-200 rounded-md px-2 focus:outline-none"
                          >
                            <option value="0">0% (Exempt)</option>
                            <option value="5">5% (CGST 2.5% + SGST 2.5%)</option>
                            <option value="12">12% (CGST 6% + SGST 6%)</option>
                            <option value="18">18% (CGST 9% + SGST 9%)</option>
                            <option value="28">28% (CGST 14% + SGST 14%)</option>
                          </select>
                        </div>
                      </div>

                      {/* Calculation Breakdown */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Subtotal:</span>
                          <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-400 font-semibold">
                            <span>Discount:</span>
                            <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-400">
                          <span>Taxable Value:</span>
                          <span className="font-mono">₹{taxableAmount.toFixed(2)}</span>
                        </div>
                        {totalTax > 0 && (
                          <div className="flex justify-between text-slate-400">
                            <span>GST ({gstRate}%):</span>
                            <span className="font-mono">₹{totalTax.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800">
                          <span>Grand Total:</span>
                          <span className="font-mono text-emerald-400 text-base">₹{grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-red-400 bg-red-950/50 p-2.5 rounded border border-red-900">{error}</p>}

                {/* Footer Actions */}
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-800">
                  <Button type="button" variant="ghost" onClick={handleRemove} disabled={loading} className="text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full sm:w-auto sm:mr-auto text-xs">
                    {isRemoving ? 'Removing...' : 'Dismiss'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGenerateInvoice}
                    disabled={loading || cartItemsList.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs w-full sm:w-auto shadow-md"
                  >
                    {loading ? 'Generating & Sending...' : `Generate Tax Invoice (₹${grandTotal}) & Send WA`}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* TAB 2: ORIGINAL QUICK AMOUNT FORM */}
            {activeTab === 'quick' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const finalAmount = parseFloat(amount);
                if (isNaN(finalAmount) || finalAmount <= 0) {
                  setError('Purchase amount is mandatory and must be greater than zero.');
                  return;
                }
                executeAward(false);
              }} className="space-y-4 pt-2">
                {/* Product Name (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="productName" className="text-slate-300 text-sm font-medium">Product Name <span className="text-xs text-slate-500">(Optional)</span></Label>
                  <Input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Belgian Chocolate Truffle Cake"
                    className="h-11 bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl px-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Bill Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-slate-300 text-sm font-medium">Purchase Amount (₹) <span className="text-emerald-400">*</span></Label>
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
                    className="h-12 bg-slate-900 border border-slate-700 text-slate-100 text-lg font-semibold placeholder:text-slate-500 rounded-xl px-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Friend Referral Status / Input */}
                {referrer ? (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Referral Linked: <strong className="text-amber-200">{referrer.name}</strong></span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      Auto Dual Stamp Ready
                    </span>
                  </div>
                ) : !isReturningVIP ? (
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="referralCode" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Friend Referral Code <span className="text-[11px] text-slate-500 font-normal">(Optional)</span>
                      </Label>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        +1 Stamp to Both
                      </span>
                    </div>
                    <Input
                      id="referralCode"
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. CP-A9X2"
                      className="h-10 bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 text-xs uppercase font-mono tracking-wider focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                ) : null}

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

                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-slate-800">
                  <Button type="button" variant="ghost" onClick={handleRemove} disabled={loading} className="text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full sm:w-auto sm:mr-auto">
                    {isRemoving ? 'Removing...' : 'Dismiss'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !amount} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold w-full sm:w-auto">
                    {loading && !isRemoving ? 'Processing...' : 'Give Reward'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
