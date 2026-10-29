import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Best Stamp Me Alternative for India | CustomerPilot vs Stamp Me",
  description:
    "Looking for a Stamp Me alternative in India? CustomerPilot offers WhatsApp-native digital loyalty stamps, AI Google reviews, and auto-reply — all at 95% lower cost. Compare features and switch today.",
  keywords: [
    "Stamp Me alternative India",
    "Stamp Me competitor",
    "best loyalty app instead of Stamp Me",
    "digital loyalty card app India",
    "WhatsApp loyalty alternative to Stamp Me",
    "Stamp Me India price comparison",
    "CustomerPilot vs Stamp Me",
    "Stamp Me replacement for Indian retail"
  ],
  alternates: { canonical: "https://customerpilot.in/alternatives/stamp-me" },
  openGraph: {
    title: "Best Stamp Me Alternative for India | CustomerPilot vs Stamp Me",
    description: "CustomerPilot is the best Stamp Me alternative for Indian retail — WhatsApp-native, AI-powered, and 95% more affordable. Compare features.",
    url: "https://customerpilot.in/alternatives/stamp-me"
  }
}

const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is CustomerPilot better than Stamp Me for Indian retail?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. CustomerPilot is built natively for India with WhatsApp integration (no app download needed), AI-powered Google review generation, Gemini AI auto-reply, and digital business cards — all features Stamp Me lacks. CustomerPilot also costs 95% less than Stamp Me's international pricing, making it the clear choice for Indian retail merchants."
          }
        },
        {
          "@type": "Question",
          "name": "Does CustomerPilot work without customers downloading an app (unlike Stamp Me)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. CustomerPilot's loyalty system works entirely through WhatsApp — a platform 95% of Indian smartphone users already have installed. Customers receive digital stamps, rewards and Google review prompts directly in their existing WhatsApp chat without any new app installation. Stamp Me requires customers to download a dedicated app, which creates significant friction and low adoption rates in India."
          }
        },
        {
          "@type": "Question",
          "name": "Stamp Me ka India me koi better alternative kya hai?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Haan, CustomerPilot India ke liye sabse best Stamp Me alternative hai. WhatsApp loyalty stamps, AI Google reviews, Gemini AI auto-reply aur Digital Business Card — sab ek hi platform par sirf ₹2,249/year me. Stamp Me ka international pricing bohot mehnga aur India ke liye suitable nahi hai. CustomerPilot WhatsApp-native hai jisse Indian customers bina app download kiye loyalty program use kar sakte hain."
          }
        }
      ]
    }
  ]
}

const compareRows: [string, string | boolean, string | boolean][] = [
  ["WhatsApp-Native Loyalty (No App Download)", true, false],
  ["AI Google Review Generation", true, false],
  ["Gemini AI Auto-Reply on Google Maps", true, false],
  ["Private Negative Feedback Filter", true, false],
  ["Smart Digital Business Card", true, false],
  ["India WhatsApp Bot Integration", true, false],
  ["Annual Price (India)", "₹2,249/yr", "~₹49,000/yr"],
]

export default function StampMeAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://customerpilot.in" },
        { name: "Alternatives", url: "https://customerpilot.in/alternatives" },
        { name: "Stamp Me Alternative", url: "https://customerpilot.in/alternatives/stamp-me" }
      ]} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-slate-900">CustomerPilot</Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">← Home</Link>
              <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl">
                <Link href="/signup">Start Free Trial →</Link>
              </Button>
            </div>
          </div>
        </header>
        <main>
          {/* Hero */}
          <section className="pt-12 pb-16 bg-gradient-to-b from-indigo-50/40 to-white border-b border-slate-200 text-center px-4">
            <div className="max-w-4xl mx-auto space-y-5">
              <span className="inline-flex items-center gap-2 text-indigo-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5" /> Best Stamp Me Alternative
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                Best <span className="text-indigo-600">Stamp Me Alternative</span> for Indian Retail Businesses
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                CustomerPilot gives you everything Stamp Me does — plus AI Google Review generation, WhatsApp loyalty without app downloads, and Gemini AI auto-replies. At 95% lower cost, built specifically for India&apos;s retail ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg">
                  <Link href="/signup">Try CustomerPilot Free <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-800 font-bold text-sm px-6 py-4 rounded-xl">
                  <Link href="/customerpilot-vs-stamp-me">Full Detailed Comparison →</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Feature Comparison Table */}
          <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-10">
              CustomerPilot vs Stamp Me: Feature-by-Feature Comparison
            </h2>
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                <caption className="sr-only">Feature comparison between CustomerPilot and Stamp Me loyalty app for Indian retail</caption>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th scope="col" className="p-4 font-bold text-slate-900">Feature</th>
                    <th scope="col" className="p-4 font-bold text-emerald-800 bg-emerald-50/50 border-x border-emerald-200">
                      <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-600" /> CustomerPilot</span>
                    </th>
                    <th scope="col" className="p-4 font-semibold text-slate-700">Stamp Me</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compareRows.map(([feature, cp, sm], i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <th scope="row" className="p-4 font-semibold text-slate-900 bg-slate-50/30">{feature}</th>
                      <td className="p-4 bg-emerald-50/20 border-x border-emerald-100">
                        {cp === true ? (
                          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Yes</span>
                        ) : <span className="font-bold text-emerald-800">{cp}</span>}
                      </td>
                      <td className="p-4">
                        {sm === false ? (
                          <span className="flex items-center gap-1.5 text-rose-600 font-medium"><XCircle className="w-4 h-4" /> No</span>
                        ) : <span className="text-slate-600">{sm}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Why Switch Section */}
          <section className="py-12 bg-slate-50 border-t border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Why Indian Businesses Are Switching from Stamp Me to CustomerPilot</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Works on WhatsApp — No App Needed", desc: "Stamp Me requires customers to download a dedicated loyalty app. CustomerPilot's loyalty system works entirely through WhatsApp, which 95% of Indian customers already have. Zero friction, zero drop-off at the app install barrier.", icon: "💬" },
                  { title: "AI Reviews + Loyalty in One Platform", desc: "Stamp Me only handles loyalty stamps. CustomerPilot adds AI-generated Google reviews, Gemini AI auto-replies, and digital business cards — a complete retention ecosystem that Stamp Me cannot match at any price.", icon: "🤖" },
                  { title: "95% Lower Cost — Built for India", desc: "Stamp Me's international pricing translates to ₹40,000+ annually for Indian businesses. CustomerPilot's complete suite starts at ₹2,249/year — making enterprise-grade customer retention affordable for every local merchant.", icon: "💰" },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <span className="text-3xl">{item.icon}</span>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is CustomerPilot better than Stamp Me for Indian retail?", a: "Yes. CustomerPilot is built natively for India with WhatsApp integration (no app download needed), AI-powered Google review generation, Gemini AI auto-reply, and digital business cards — all features Stamp Me lacks. CustomerPilot also costs 95% less than Stamp Me's international pricing." },
                { q: "Does CustomerPilot work without customers downloading an app (unlike Stamp Me)?", a: "Absolutely. CustomerPilot's loyalty system works entirely through WhatsApp — a platform 95% of Indian smartphone users already have installed. Customers receive digital stamps, rewards and Google review prompts directly in their existing WhatsApp chat without any new app installation." },
                { q: "Stamp Me ka India me koi better alternative kya hai?", a: "Haan, CustomerPilot India ke liye sabse best Stamp Me alternative hai. WhatsApp loyalty stamps, AI Google reviews, Gemini AI auto-reply aur Digital Business Card — sab ek hi platform par sirf ₹2,249/year me. Stamp Me ka international pricing bohot mehnga aur India ke liye suitable nahi hai." },
              ].map((faq, i) => (
                <details key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <summary className="font-bold text-slate-900 cursor-pointer">{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="py-16 bg-gradient-to-b from-white to-indigo-50/40 border-t border-slate-200 text-center px-4">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Switch from Stamp Me to CustomerPilot Today</h2>
              <p className="text-slate-600 text-sm">3-day free trial. No credit card required. WhatsApp loyalty live in under 3 minutes.</p>
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl">
                <Link href="/signup">Start Free Trial <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
            </div>
          </section>
        </main>
        <footer className="border-t border-slate-200 bg-slate-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} CustomerPilot. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/customerpilot-vs-stamp-me" className="hover:text-slate-900">Full Comparison</Link>
              <Link href="/whatsapp-digital-loyalty-card" className="hover:text-slate-900">WhatsApp Loyalty</Link>
              <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
