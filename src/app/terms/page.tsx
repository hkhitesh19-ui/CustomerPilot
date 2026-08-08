import type { Metadata } from "next"
import Link from "next/link"
import { FileText, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service — CustomerPilot",
  description: "CustomerPilot merchant terms of service, subscription agreements, and loyalty platform guidelines.",
  alternates: {
    canonical: "/terms",
  },
}

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" /> Merchant Agreement
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            CustomerPilot Terms of Service
          </h1>
          <p className="text-slate-400 text-sm">Last updated: August 2026</p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing, registering, or using CustomerPilot&apos;s software, merchant dashboard, WhatsApp automation tools, or QR codes, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Description of Service</h2>
            <p>
              CustomerPilot provides autonomous software-as-a-service (SaaS) tools for retail and hospitality merchants. Features include digital WhatsApp stamp cards, counter QR check-ins, cashier tap-to-claim terminals, Google Review AI draft generation, and merchant business analytics.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Merchant Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Merchants agree to honor all valid reward stamps and free treats earned legitimately by their customers.</li>
              <li>Merchants agree to safeguard cashier PINs and manager credentials from unauthorized access.</li>
              <li>Merchants must ensure customer phone numbers collected at checkout are provided with the customer&apos;s knowledge for loyalty participation.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Subscription Plans & Billing</h2>
            <p>
              CustomerPilot offers a 14-day free trial with no credit card required upfront. Following the trial, subscriptions are billed monthly (standard Pro plan at ₹2,999/month or custom Founding Merchant terms). Subscriptions can be canceled at any time from the merchant dashboard settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Fair Usage & WhatsApp Compliance</h2>
            <p>
              Merchants agree not to use CustomerPilot for spam, unsolicited promotional broadcasts, or deceptive marketing. All WhatsApp messages must adhere to standard WhatsApp Business policies and local telecommunication guidelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">6. Limitation of Liability</h2>
            <p>
              CustomerPilot provides the platform on an &quot;as is&quot; and &quot;as available&quot; basis. In no event shall CustomerPilot be liable for indirect, punitive, or consequential damages resulting from internet disruptions, WhatsApp platform outages, or Google API policy updates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">7. Support & Queries</h2>
            <p>
              For legal inquiries or terms clarification, contact <a href="mailto:legal@customerpilot.ai" className="text-blue-400 underline">legal@customerpilot.ai</a> or <a href="mailto:support@customerpilot.ai" className="text-blue-400 underline">support@customerpilot.ai</a>.
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
