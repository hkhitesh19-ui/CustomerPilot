"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Crown, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/merchant/status")
      .then((res) => res.json().catch(() => null))
      .then((data) => {
        if (data?.isExpired) {
          setIsExpired(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Allow unrestricted access to the subscription page itself
  if (pathname === "/dashboard/subscription") {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full">
      {/* Render Dashboard, applying frosted read-only blur if expired */}
      <div className={isExpired ? "opacity-25 pointer-events-none select-none blur-[2px]" : ""}>
        {children}
      </div>

      {/* When expired and on other pages, prompt merchant to go to Subscription Section */}
      {isExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Subscription Expired</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Your free trial or plan period has completed. Please select a 30-Day, 180-Day, or 365-Day plan to unlock your WhatsApp loyalty & counter queue automations.
              </p>
            </div>
            <Link href="/dashboard/subscription" className="block">
              <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30">
                Go to Plans & Pricing <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
