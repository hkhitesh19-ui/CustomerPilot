import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"
import { CheckCircle2, ArrowRight, MessageSquare, Star, Gift, TrendingUp, Coffee } from "lucide-react"

export const metadata: Metadata = {
  title: "WhatsApp Loyalty Program for Cafes & Coffee Shops | CustomerPilot",
  description:
    "CustomerPilot's WhatsApp loyalty stamp card for cafes and coffee shops. Auto-send digital stamps via WhatsApp after every coffee purchase. No app download needed. Retain cafe customers 3x faster than paper punch cards.",
  keywords: [
    "loyalty program for cafe",
    "coffee shop loyalty card WhatsApp",
    "cafe digital stamp card India",
    "retain cafe customers app",
    "WhatsApp loyalty cafe",
    "cafe customer retention software",
    "coffee loyalty stamp card",
    "digital punch card for cafe India"
  ],
  alternates: { canonical: "https://customerpilot.in/industry/cafe-loyalty-program" },
  openGraph: {
    title: "WhatsApp Loyalty Program for Cafes & Coffee Shops | CustomerPilot",
    description: "Auto-send WhatsApp loyalty stamps after every coffee purchase. No app download. Retain cafe customers 3x faster.",
    url: "https://customerpilot.in/industry/cafe-loyalty-program"
  }
}

const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot Cafe Loyalty Program",
      "operatingSystem": "All (WhatsApp-based)",
      "applicationCategory": "BusinessApplication",
      "description": "WhatsApp-native digital loyalty stamp card for cafes and coffee shops. Automatically sends stamps after every purchase without requiring customers to download any app.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does WhatsApp loyalty work for coffee shops and cafes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "When a customer pays at your cafe, CustomerPilot automatically sends them a WhatsApp message with their digital stamp. After collecting 10 stamps (or your custom target), they receive a free drink or discount coupon — all without downloading any app. The entire flow runs inside WhatsApp, which 95% of Indian cafe customers already use daily."
          }
        },
        {
          "@type": "Question",
          "name": "Cafe me WhatsApp loyalty program kaise setup karte hain?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot mein signup karo, apna cafe register karo, reward set karo (jaise '10 coffees ke baad ek free cappuccino'), aur apna WhatsApp bot activate karo. Counter par ek QR code lagao. Jab customer scan karega, unhe automatically WhatsApp par stamp milega. Setup sirf 3 minute mein ho jata hai!"
          }
        }
      ]
    }
  ]
}

export default function CafeLoyaltyProgramPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://customerpilot.in" },
        { name: "Industries", url: "https://customerpilot.in/industry" },
        { name: "Cafe Loyalty Program", url: "https://customerpilot.in/industry/cafe-loyalty-program" }
      ]} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-slate-900">CustomerPilot</Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">← Home</Link>
              <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                <Link href="/signup">Start Free Trial →</Link>
              </Button>
            </div>
          </div>
        </header>
        <main>
          <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-emerald-50/60 to-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <span className="inline-flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
                <Coffee className="w-3.5 h-3.5" /> Cafe & Coffee Shop Loyalty Program
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                Grow Repeat Cafe Customers with <span className="text-emerald-600">WhatsApp Digital Loyalty Stamps</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Replace paper punch cards with automated WhatsApp loyalty stamps that your coffee shop customers actually use. CustomerPilot auto-sends stamps after every purchase — no app download required. Your morning regulars stay loyal, your revenue grows predictably.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg">
                  <Link href="/signup">Start Free 3-Day Trial <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-800 font-bold text-sm px-6 py-4 rounded-xl">
                  <Link href="/whatsapp-digital-loyalty-card">See How It Works</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Why Cafe Owners Choose CustomerPilot</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Morning Regulars Become Loyal Members</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Your daily coffee customers automatically accumulate stamps via WhatsApp every time they order. After 10 stamps, they earn a free cappuccino or discount — creating a powerful habit loop that keeps them choosing your cafe over competitors.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Star className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-slate-900">Auto-Generate 5-Star Google Reviews</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Happy cafe customers scan your counter QR and CustomerPilot AI drafts a personalized 5-star Google review mentioning your coffee, ambience, and service. One tap posts it to Google Maps — boosting your local search ranking.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Gift className="w-6 h-6 text-indigo-500" />
                <h3 className="font-bold text-slate-900">Win Back Lapsed Customers Automatically</h3>
                <p className="text-xs text-slate-600 leading-relaxed">If a regular hasn&apos;t visited in 14 days, CustomerPilot automatically sends a personalized WhatsApp message: &quot;We miss you! Here&apos;s a free pastry on your next visit.&quot; Automated win-back campaigns bring 35% of lost customers back within a week.</p>
              </div>
            </div>
          </section>

          <section className="py-12 bg-slate-50/70 border-t border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl font-black text-slate-900 text-center mb-10">How It Works for Cafes in 3 Steps</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                {[
                  { step: 1, title: "Customer Pays & Scans QR", desc: "Place CustomerPilot's counter QR at your cafe billing. When a customer pays and scans, or simply pays via UPI, they automatically receive a WhatsApp message with their digital coffee stamp." },
                  { step: 2, title: "Stamps Accumulate in WhatsApp", desc: "Customers see their stamp card progress directly in WhatsApp chat. After every coffee, their stamp count grows. A friendly progress update keeps them motivated to return for their free drink reward." },
                  { step: 3, title: "Reward Redeemed, Revenue Grows", desc: "Once the customer hits their stamp goal (e.g., 10 coffees), they receive a WhatsApp coupon for a free drink or discount. Your cafe gets a loyal repeat customer who visits 3x more frequently than non-loyalty members." }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="space-y-3 p-6 bg-white rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mx-auto">{step}</div>
                    <h3 className="font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How does WhatsApp loyalty work for coffee shops and cafes?", a: "When a customer pays at your cafe, CustomerPilot automatically sends them a WhatsApp message with their digital stamp. After collecting 10 stamps (or your custom target), they receive a free drink or discount coupon — all without downloading any app. The entire flow runs inside WhatsApp, which 95% of Indian cafe customers already use daily." },
                { q: "Cafe me WhatsApp loyalty program kaise setup karte hain?", a: "CustomerPilot mein signup karo, apna cafe register karo, reward set karo (jaise '10 coffees ke baad ek free cappuccino'), aur apna WhatsApp bot activate karo. Counter par ek QR code lagao. Jab customer scan karega, unhe automatically WhatsApp par stamp milega. Setup sirf 3 minute mein ho jata hai!" },
                { q: "Does CustomerPilot integrate with my existing cafe billing system?", a: "Yes! CustomerPilot connects with UPI payments (GPay, PhonePe, Paytm), manual QR scan triggers, and popular POS systems. When a customer pays via UPI, CustomerPilot can automatically detect the payment and send their loyalty stamp without any manual action from your billing staff." },
              ].map((faq, i) => (
                <details key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <summary className="font-bold text-slate-900 cursor-pointer">{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="py-16 bg-gradient-to-b from-white to-emerald-50/40 border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Ready to Grow Your Cafe Customer Loyalty?</h2>
              <p className="text-slate-600 text-sm">Join hundreds of Indian cafe and coffee shop owners using CustomerPilot for automated WhatsApp loyalty stamps. 3-day free trial. No credit card required.</p>
              <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl">
                <Link href="/signup">Start Free Trial — No Credit Card <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
            </div>
          </section>
        </main>
        <footer className="border-t border-slate-200 bg-slate-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} CustomerPilot. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/whatsapp-digital-loyalty-card" className="hover:text-slate-900">WhatsApp Loyalty</Link>
              <Link href="/smart-ai-google-review" className="hover:text-slate-900">AI Google Review</Link>
              <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
