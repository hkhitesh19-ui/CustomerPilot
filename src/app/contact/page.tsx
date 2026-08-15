import type { Metadata } from "next"
import Link from "next/link"
import { Mail, ArrowLeft, MessageSquare, MapPin, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact & Merchant Support — CustomerPilot",
  description: "Get in touch with the CustomerPilot merchant success team. 24/7 WhatsApp helpdesk and onboarding assistance.",
  alternates: {
    canonical: "/contact",
  },
}

export default function ContactPage() {
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
            <MessageSquare className="w-3.5 h-3.5" /> Merchant Success & Support
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Get in Touch with CustomerPilot
          </h1>
          <p className="text-slate-400 text-sm">We are here to help your retail store activate automated WhatsApp loyalty and 5-star Google reviews.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 border-t border-slate-800 pt-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Mail className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Email Support</h3>
            <p className="text-xs text-slate-400">For merchant onboarding, billing inquiries, and technical support:</p>
            <p className="text-sm font-semibold text-emerald-400">support@customerpilot.in</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Clock className="w-6 h-6 text-blue-400" />
            <h3 className="font-bold text-white text-base">Support Hours</h3>
            <p className="text-xs text-slate-400">Merchant response team is active:</p>
            <p className="text-sm font-semibold text-white">Monday – Saturday: 9:00 AM – 8:00 PM IST</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <MapPin className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-white text-base">Headquarters</h3>
            <p className="text-xs text-slate-400">CustomerPilot Technologies</p>
            <p className="text-sm font-semibold text-slate-300">Vadodara, Gujarat, India 🇮🇳</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-white text-base">WhatsApp Desk</h3>
            <p className="text-xs text-slate-400">Live cashier support and QR sticker delivery inquiries for active merchants.</p>
            <Link href="/signup" className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold text-xs mt-1">
              Start Free Trial
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS
        </div>
      </div>
    </div>
  )
}
