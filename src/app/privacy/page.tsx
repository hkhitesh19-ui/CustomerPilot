import type { Metadata } from "next"
import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy — CustomerPilot",
  description: "CustomerPilot merchant privacy policy and customer loyalty data protection disclosures.",
  alternates: {
    canonical: "/privacy",
  },
}

export default function PrivacyPage() {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8 flex-1 w-full">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-600" /> Data Protection &amp; Privacy Disclosures
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            CustomerPilot Privacy Policy
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Last updated: August 2026</p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-6">
          <section className="space-y-2 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">1. Overview</h2>
            <p>
              CustomerPilot (&quot;CustomerPilot&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides an autonomous customer retention and loyalty platform for retail and hospitality merchants. This Privacy Policy explains how we collect, use, and protect information when merchants use our software and when retail customers interact with our WhatsApp digital stamp cards and Google Review tools.
            </p>
          </section>

          <section className="space-y-2 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">2. Information We Collect</h2>
            <p><strong>Merchant Account Data:</strong> Business name, owner name, business email, business phone number, store address, Google Business Profile location identifier, and billing details.</p>
            <p className="mt-2"><strong>Customer Loyalty Data:</strong> Customer phone number (used solely for WhatsApp stamp card delivery and opt-in notifications), customer name, visit timestamps, purchase amount notes, and loyalty stamp progress.</p>
          </section>

          <section className="space-y-2 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">3. How Information Is Used</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>To deliver digital loyalty stamps, reward notifications, and Google review bonus alerts to retail customers via WhatsApp.</li>
              <li>To provide merchants with store analytics, repeat customer metrics, and daily morning intelligence reports.</li>
              <li>To facilitate authorized cashier check-ins and prevent stamp duplication.</li>
              <li>We <strong>never</strong> sell customer or merchant data to third-party advertisers or data brokers.</li>
            </ul>
          </section>

          <section className="space-y-2 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">4. WhatsApp &amp; Third-Party Service Providers</h2>
            <p>
              CustomerPilot communicates with customers through official WhatsApp Business APIs and verified communication adapters. Messages are strictly transactional and opt-in based. Customers may opt out of automated loyalty updates at any time by texting &quot;STOP&quot; or requesting removal directly from the merchant.
            </p>
          </section>

          <section className="space-y-2 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">5. Google Business Profile &amp; OAuth Data</h2>
            <p>
              When a merchant connects Google Business Profile, CustomerPilot accesses store location details and verified public reviews solely to draft personalized reply recommendations for the merchant to approve. We do not modify or post reviews on behalf of customers.
            </p>
          </section>

          <section className="space-y-2 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">6. Data Security &amp; Retention</h2>
            <p>
              All customer and merchant data is transmitted over encrypted TLS 1.3 channels and stored in secure database clusters with Write-Ahead Logging (WAL) and automated backups. Authentication sessions use signed JWT tokens with strict HTTP-only cookies.
            </p>
          </section>

          <section className="space-y-2 p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">7. Contact Us</h2>
            <p>
              For privacy inquiries, data deletion requests, or merchant support, please contact our Data Protection Team at <a href="mailto:support@customerpilot.in" className="text-emerald-700 underline font-bold">support@customerpilot.in</a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-900 transition">Security</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact Support</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
