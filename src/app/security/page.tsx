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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <img src="/cplogo_horizontal.png" alt="CustomerPilot" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition shadow-xs">
              Start 7 Days Free Trial Today →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10 flex-1 w-full">
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Enterprise Infrastructure &amp; Trust
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            CustomerPilot Security Architecture
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            How we protect merchant data, cashier sessions, and customer loyalty records with zero data sharing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">JWT &amp; Role-Based Access Control</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cryptographically signed sessions separate merchant administrators, store staff, and platform operators with strict permission scopes.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Multi-Tenant Merchant Isolation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every customer queue, reward transaction, and stamp card is strictly scoped by merchant ID across all database queries.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Encryption in Transit &amp; Rest</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All communication runs over TLS 1.3. Google OAuth refresh tokens and API credentials are stored encrypted at rest.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Write-Ahead Logging (WAL) Durability</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              High-concurrency SQLite WAL mode prevents transaction locks during simultaneous peak-hour cashier check-ins.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact Support</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
