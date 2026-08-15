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
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Merchant Success &amp; Support Desk
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Get in Touch with CustomerPilot
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            We are here to help your retail store activate automated WhatsApp loyalty and 5-star Google reviews.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Email Support</h3>
            <p className="text-xs text-slate-500">For merchant onboarding, billing inquiries, and technical support:</p>
            <p className="text-sm font-bold text-emerald-700">support@customerpilot.in</p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Support Hours</h3>
            <p className="text-xs text-slate-500">Merchant response team is active:</p>
            <p className="text-sm font-bold text-slate-800">Monday – Saturday: 9:00 AM – 8:00 PM IST</p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Headquarters</h3>
            <p className="text-xs text-slate-500">CustomerPilot Technologies</p>
            <p className="text-sm font-bold text-slate-800">Vadodara, Gujarat, India 🇮🇳</p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">24/7 WhatsApp Desk</h3>
            <p className="text-xs text-slate-500">Live cashier support and QR sticker delivery inquiries for active merchants.</p>
            <a
              href="https://wa.me/919033304707?text=Hi%20CustomerPilot%20Team%2C%20I%20need%20assistance%20with%20CustomerPilot."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              <MessageSquare className="w-4 h-4" /> Message +91 90333 04707
            </a>
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
            <Link href="/security" className="hover:text-slate-900 transition">Security</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
