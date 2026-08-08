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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Data Protection & Privacy
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            CustomerPilot Privacy Policy
          </h1>
          <p className="text-slate-400 text-sm">Last updated: August 2026</p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Overview</h2>
            <p>
              CustomerPilot (&quot;CustomerPilot&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides an autonomous customer retention and loyalty platform for retail and hospitality merchants. This Privacy Policy explains how we collect, use, and protect information when merchants use our software and when retail customers interact with our WhatsApp digital stamp cards and Google Review tools.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Information We Collect</h2>
            <p><strong>Merchant Account Data:</strong> Business name, owner name, business email, business phone number, store address, Google Business Profile location identifier, and billing details.</p>
            <p><strong>Customer Loyalty Data:</strong> Customer phone number (used solely for WhatsApp stamp card delivery and opt-in notifications), customer name, visit timestamps, purchase amount notes, and loyalty stamp progress.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. How Information Is Used</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>To deliver digital loyalty stamps, reward notifications, and Google review bonus alerts to retail customers via WhatsApp.</li>
              <li>To provide merchants with store analytics, repeat customer metrics, and daily morning intelligence reports.</li>
              <li>To facilitate authorized cashier check-ins and prevent stamp duplication.</li>
              <li>We <strong>never</strong> sell customer or merchant data to third-party advertisers or data brokers.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. WhatsApp & Third-Party Service Providers</h2>
            <p>
              CustomerPilot communicates with customers through official WhatsApp Business APIs and verified communication adapters. Messages are strictly transactional and opt-in based. Customers may opt out of automated loyalty updates at any time by texting &quot;STOP&quot; or requesting removal directly from the merchant.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Google Business Profile & OAuth Data</h2>
            <p>
              When a merchant connects Google Business Profile, CustomerPilot accesses store location details and verified public reviews solely to draft personalized reply recommendations for the merchant to approve. We do not modify or post reviews on behalf of customers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">6. Data Security & Retention</h2>
            <p>
              All customer and merchant data is transmitted over encrypted TLS 1.3 channels and stored in secure database clusters with Write-Ahead Logging (WAL) and automated backups. Authentication sessions use signed JWT tokens with strict HTTP-only cookies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">7. Contact Us</h2>
            <p>
              For privacy inquiries, data deletion requests, or merchant support, please contact our Data Protection Team at <a href="mailto:privacy@customerpilot.ai" className="text-emerald-400 underline">privacy@customerpilot.ai</a> or <a href="mailto:support@customerpilot.ai" className="text-emerald-400 underline">support@customerpilot.ai</a>.
            </p>
          </section>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS
        </div>
      </div>
    </div>
  )
}
