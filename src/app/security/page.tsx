import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, ArrowLeft, Lock, Database, Key, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Security Architecture — CustomerPilot",
  description: "CustomerPilot enterprise security infrastructure, encryption in transit, SQLite WAL durability, and multi-tenant merchant isolation.",
  alternates: {
    canonical: "/security",
  },
}

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/">
            <img src="/cplogo_horizontal.png" alt="CustomerPilot" className="h-10 w-auto object-contain" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Infrastructure & Trust
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            CustomerPilot Security Architecture
          </h1>
          <p className="text-slate-400 text-sm">How we protect merchant data, cashier sessions, and customer loyalty records.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 border-t border-slate-800 pt-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <Lock className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-white text-base">JWT & Role-Based Access Control</h3>
            <p className="text-xs text-slate-400">Cryptographically signed sessions separate merchant administrators, store staff, and platform operators with strict permission scopes.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <Database className="w-6 h-6 text-blue-400" />
            <h3 className="font-bold text-white text-base">Multi-Tenant Merchant Isolation</h3>
            <p className="text-xs text-slate-400">Every customer queue, reward transaction, and stamp card is strictly scoped by merchant ID across all database queries.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <Key className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-white text-base">Encryption in Transit & Rest</h3>
            <p className="text-xs text-slate-400">All communication runs over TLS 1.3. Google OAuth refresh tokens and API credentials are stored encrypted at rest.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-white text-base">Write-Ahead Logging (WAL) Durability</h3>
            <p className="text-xs text-slate-400">High-concurrency SQLite WAL mode prevents transaction locks during simultaneous peak-hour cashier check-ins.</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS
        </div>
      </div>
    </div>
  )
}
