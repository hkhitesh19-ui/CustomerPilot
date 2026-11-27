"use client";

import { useState } from "react";
import { X } from "lucide-react";

type LegalDoc = "privacy" | "terms" | null;

export function AeFooter() {
  const [openDoc, setOpenDoc] = useState<LegalDoc>(null);

  return (
    <footer className="border-t border-[#E2E8F0] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 text-sm text-[#475569]">
            <p className="font-semibold text-[#0F172A]">
              CustomerPilot | Operated by Hitesh Parmar | [COMMERCIAL_BUSINESS_ADDRESS_TBD], Vadodara, India
            </p>
            <p>
              Support:{" "}
              <a
                href="mailto:[SUPPORT_EMAIL_TBD]"
                className="font-medium text-[#2563EB] underline-offset-4 hover:underline"
              >
                [SUPPORT_EMAIL_TBD]
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#475569]">
            <button
              type="button"
              onClick={() => setOpenDoc("privacy")}
              className="cursor-pointer transition-colors hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setOpenDoc("terms")}
              className="cursor-pointer transition-colors hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              Terms of Service
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-[#E2E8F0] pt-6 text-xs text-[#64748B]">
          Policy-Safe AI Google Review Workflows &amp; Instant Tailored AI Reply Drafts for UAE Local Businesses.
        </div>
      </div>

      {openDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ae-legal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
        >
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <h3 id="ae-legal-title" className="text-lg font-bold text-[#0F172A]">
                {openDoc === "privacy" ? "Privacy Policy — CustomerPilot UAE Pilot" : "Terms of Service — CustomerPilot UAE Pilot"}
              </h3>
              <button
                type="button"
                aria-label="Close legal dialog"
                onClick={() => setOpenDoc(null)}
                className="cursor-pointer rounded-lg p-1.5 text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#475569]">
              {openDoc === "privacy" ? (
                <>
                  <p>
                    CustomerPilot (operated by Hitesh Parmar, [COMMERCIAL_BUSINESS_ADDRESS_TBD], Vadodara, India) collects
                    pilot application details solely to provision your 14-day UAE trial and respond to your inquiry.
                  </p>
                  <p>
                    We do not sell business contact records or customer feedback data to third parties. To request data
                    deletion or ask privacy questions, contact{" "}
                    <span className="font-medium text-[#0F172A]">[SUPPORT_EMAIL_TBD]</span>.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    The 14-day UAE Pilot provides access to the policy-safe Google review link workflow and instant
                    tailored AI reply drafts with no upfront payment obligation.
                  </p>
                  <p>
                    All participating businesses must present the identical public Google review link to every customer
                    without rating filters, gating, or incentives. Paid continuation after the pilot is optional at{" "}
                    <span className="font-medium text-[#0F172A]">AED [PRICE_TBD]/month</span>.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
