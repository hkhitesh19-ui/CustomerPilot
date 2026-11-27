"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";

interface AeHeaderProps {
  onStartPilot: () => void;
}

export function AeHeader({ onStartPilot }: AeHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#0F172A]">CustomerPilot</span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#475569]">
              UAE Pilot Edition
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartPilot}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#C2410C] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-[#9A3412] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <span>Start 14-Day Pilot</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
