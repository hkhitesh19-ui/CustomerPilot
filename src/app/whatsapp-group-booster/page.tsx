"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users, QrCode as QrIcon, ShieldCheck, ArrowRight, CheckCircle2,
  XCircle, Smartphone, Zap, Sparkles, Database, Lock, RefreshCw,
  Gift, HeartHandshake, ChevronDown
} from "lucide-react"

export default function WhatsAppGroupBoosterLanding() {
  const [activeTab, setActiveTab] = useState<"before" | "after">("after")

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition">← Back to Home</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
            <Link href="/dashboard/DynamicQRStudio" className="hover:text-slate-900 transition">Dynamic QR Studio</Link>
            <Link href="/dashboard/billing" className="hover:text-slate-900 transition">Smart POS Billing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2">
              Sign In
            </Link>
            <Link
              href="/signup?plan=group_booster_monthly"
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Start 3-Day Trial</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold shadow-sm">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>CustomerPilot WhatsApp Group Booster Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Stop Losing 90% of Your Walk-in Customers to{" "}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 bg-clip-text text-transparent">
              Anonymous WhatsApp Groups.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Direct WhatsApp group links leave you with zero customer names and zero phone numbers.
            WhatsApp Group Booster automatically captures verified customer contact details &amp; legal transactional consent <strong className="text-slate-900">before</strong> they enter your WhatsApp community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/signup?plan=group_booster_monthly"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Activate Group Booster for Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/wg/cake-connection"
              target="_blank"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-teal-600" />
              <span>Experience Live Customer Form Demo</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> No Hardware Needed</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Zero Paid QR APIs</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Instant CRM Lead Sync</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> 1-Click WhatsApp Invoicing Ready</span>
          </div>
        </div>
      </section>

      {/* 3. The Core Problem vs Solution (Before / After) */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why 99% of Merchants Fail with Standard WhatsApp Group QRs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Comparing a direct WhatsApp group invite link vs CustomerPilot Group Booster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Old Method */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rose-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  ❌ Old Method: Direct Group Link
                </span>
                <XCircle className="w-6 h-6 text-rose-500" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">Anonymous Walk-ins</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customer scans the QR and lands straight into the group without entering any name or details.
              </p>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Zero CRM Data:</strong> You have no record of who scanned your QR or visited your store.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Ghost Members:</strong> Customers mute the group or leave after a week — you can never reach them again.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>No WhatsApp Invoicing:</strong> Cashier still has to manually ask for mobile numbers during billing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Reprint Disaster:</strong> When group hits 1,024 members, your counter QR becomes useless and must be reprinted.</span>
                </li>
              </ul>
            </div>

            {/* Card 2: CustomerPilot Method */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-teal-500 shadow-xl shadow-teal-500/10 space-y-5 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  ✨ CustomerPilot: WhatsApp Group Booster
                </span>
                <CheckCircle2 className="w-6 h-6 text-teal-600" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">100% Verified Customer Leads</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customer fills a lightning-fast 5-second mobile form before redirection. Your CRM builds itself automatically.
              </p>

              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Name &amp; Phone Stored:</strong> Customer profile created in your Customer CRM with join date.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Official Consent Recorded:</strong> Explicit legal consent saved for WhatsApp billing and store updates.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>POS Billing Auto-Suggest:</strong> When customer bills at counter, cashier just types 3 letters to send instant WhatsApp PDF bill.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Permanent Counter QR:</strong> Switch groups from Group A to Group B from your dashboard without reprinting.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (3 Simple Steps) */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How WhatsApp Group Booster Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Zero friction for your customer, maximum lifetime value for your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center border border-teal-100">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">Customer Scans Counter QR</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Place your permanent dynamic standee or acrylic tabletop QR on the counter. Customer scans with any mobile camera.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center border border-teal-100">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">5-Second Name &amp; Phone Input</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customer types their name and WhatsApp number to claim exclusive community perks, special discounts, and instant bill receipts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center border border-teal-100">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">Auto-Redirect to WhatsApp Group</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              System logs lead to your CRM, records legal consent, and instantly launches WhatsApp to join your VIP community group.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pricing & Call To Action */}
      <section className="py-16 bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start Collecting Real Customer Leads Today
            </h2>
            <p className="text-sm text-teal-200/80 max-w-xl mx-auto">
              Get unlimited dynamic QR scans, customer lead capture, CRM database building, and instant WhatsApp community redirection.
            </p>
          </div>

          <div className="max-w-sm mx-auto p-6 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-base font-bold text-white">WhatsApp Group Booster</div>
                <div className="text-xs text-teal-300">Lead Capture + Community Growth</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">₹299<span className="text-xs text-slate-300 font-normal">/mo</span></div>
                <div className="text-[10px] text-teal-300">or ₹2,499/year (Save 30%)</div>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> Permanent Counter Dynamic QR</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> Pre-Redirect Lead Capture Mobile Form</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> Automatic CRM Customer Ledger Sync</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> Legal Transactional Consent Storage</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> Update WhatsApp Group Link Anytime</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" /> Real-time Scan &amp; Visitor Analytics</li>
            </ul>

            <Link
              href="/signup?plan=group_booster_monthly"
              className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 transition-all"
            >
              <span>Start 3-Day Free Trial</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Need Smart POS Billing &amp; Automated WhatsApp Invoicing too? Explore <Link href="/pricing" className="text-teal-300 underline font-semibold">Smart POS Pro Plan (₹599/mo)</Link>.
          </p>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        <p>© 2026 CustomerPilot. All rights reserved. Self-Hosted WhatsApp Growth &amp; Retention Platform.</p>
      </footer>
    </div>
  )
}
