import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"
import { CheckCircle2, ArrowRight, Star, Gift, Scissors } from "lucide-react"

export const metadata: Metadata = {
  title: "WhatsApp Loyalty Program for Salons & Beauty Parlours | CustomerPilot",
  description:
    "CustomerPilot's WhatsApp loyalty stamp card for salons and beauty parlours. Send digital stamps after every haircut, facial or service. Automated appointment reminders via WhatsApp. Start free.",
  keywords: [
    "loyalty program for salon",
    "beauty parlour loyalty card India",
    "salon customer retention WhatsApp",
    "digital stamp card for hair salon",
    "salon repeat customer software",
    "beauty salon loyalty app",
    "hair salon loyalty program India",
    "salon WhatsApp appointment reminder"
  ],
  alternates: { canonical: "https://customerpilot.in/industry/salon-loyalty-program" },
  openGraph: {
    title: "WhatsApp Loyalty Program for Salons & Beauty Parlours | CustomerPilot",
    description: "Send digital loyalty stamps after every haircut or beauty service via WhatsApp. No app download. Retain salon clients 3x better.",
    url: "https://customerpilot.in/industry/salon-loyalty-program"
  }
}

const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot Salon Loyalty Program",
      "operatingSystem": "All (WhatsApp-based)",
      "applicationCategory": "BusinessApplication",
      "description": "WhatsApp-native digital loyalty stamp card for salons and beauty parlours. Automatically sends stamps after every service and triggers win-back messages for lapsed clients.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does WhatsApp loyalty work for salons and beauty parlours?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "After every salon service (haircut, facial, waxing, etc.), CustomerPilot automatically sends a WhatsApp stamp to the client. After collecting the required stamps, clients earn a free treatment or discount. No app download needed — everything works inside WhatsApp. Automated win-back messages are also sent to clients who haven't visited in 30+ days."
          }
        },
        {
          "@type": "Question",
          "name": "Salon ke liye WhatsApp loyalty program kaise kaam karta hai?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Jab bhi koi client aapke salon se service leta hai, CustomerPilot unhe automatically WhatsApp par ek digital stamp bhejta hai. Jab client 10 stamps collect kar leta hai, use free treatment ya discount coupon milta hai. Koi naya app download karne ki zaroorat nahi — sab kuch WhatsApp mein hi hota hai."
          }
        }
      ]
    }
  ]
}

export default function SalonLoyaltyProgramPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://customerpilot.in" },
        { name: "Industries", url: "https://customerpilot.in/industry" },
        { name: "Salon Loyalty Program", url: "https://customerpilot.in/industry/salon-loyalty-program" }
      ]} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-slate-900">CustomerPilot</Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">← Home</Link>
              <Button asChild size="sm" className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                <Link href="/signup">Start Free Trial →</Link>
              </Button>
            </div>
          </div>
        </header>
        <main>
          <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-pink-50/60 to-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <span className="inline-flex items-center gap-2 text-pink-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-pink-100 border border-pink-200">
                <Scissors className="w-3.5 h-3.5" /> Salon & Beauty Parlour Loyalty Program
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                Keep Salon Clients Coming Back with <span className="text-pink-600">WhatsApp Digital Loyalty Rewards</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Stop losing salon clients to competitors. CustomerPilot automatically sends digital loyalty stamps after every haircut, facial, or beauty service via WhatsApp. No paper cards, no app downloads — just automatic loyalty that keeps your appointment book full every week.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg">
                  <Link href="/signup">Start Free 3-Day Trial <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-800 font-bold text-sm px-6 py-4 rounded-xl">
                  <Link href="/whatsapp-digital-loyalty-card">See How It Works</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Why Salon Owners Choose CustomerPilot</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Automatic Appointment Reminders</h3>
                <p className="text-xs text-slate-600 leading-relaxed">CustomerPilot sends WhatsApp reminders to clients who haven&apos;t visited in 30 days: &quot;Time for your monthly hair treatment! Book with stylist Ramesh — get 2 bonus stamps this week.&quot; This automated recall brings back 35% of lapsed salon clients.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Star className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-slate-900">Get 5-Star Google Reviews After Every Visit</h3>
                <p className="text-xs text-slate-600 leading-relaxed">After a great salon service, CustomerPilot prompts happy clients to leave a 5-star Google review via WhatsApp. AI auto-drafts the review mentioning your stylists, treatments, and ambience. Your salon rises in Google Maps local search rankings.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Gift className="w-6 h-6 text-indigo-500" />
                <h3 className="font-bold text-slate-900">Free Treatment Rewards Drive Referrals</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Clients who earn a free treatment (e.g., a complimentary head massage after 10 visits) become your strongest word-of-mouth advocates. They tell friends and family about your salon loyalty program, driving organic referrals at zero additional cost.</p>
              </div>
            </div>
          </section>

          <section className="py-12 bg-slate-50/70 border-t border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl font-black text-slate-900 text-center mb-10">How Salon Loyalty Works in 3 Steps</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                {[
                  { step: 1, title: "Client Pays for Service", desc: "After a haircut, facial, or any beauty service, the client scans your salon's QR code or pays via UPI. CustomerPilot instantly detects the interaction and sends a WhatsApp stamp notification." },
                  { step: 2, title: "Stamps Build Toward Reward", desc: "The client sees their stamp progress in WhatsApp — e.g., '7 of 10 stamps collected! 3 more visits for your free Keratin treatment.' This progress gamification increases return visit frequency by 45%." },
                  { step: 3, title: "Reward Redeemed at Salon Counter", desc: "When the client completes their stamp card, they receive a WhatsApp coupon code. They present it at your salon counter for their free treatment or service discount — no paper required." }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="space-y-3 p-6 bg-white rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 font-black text-lg flex items-center justify-center mx-auto">{step}</div>
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
                { q: "How does WhatsApp loyalty work for salons and beauty parlours?", a: "After every salon service (haircut, facial, waxing, etc.), CustomerPilot automatically sends a WhatsApp stamp to the client. After collecting the required stamps, clients earn a free treatment or discount. No app download needed — everything works inside WhatsApp." },
                { q: "Salon ke liye WhatsApp loyalty program kaise kaam karta hai?", a: "Jab bhi koi client aapke salon se service leta hai, CustomerPilot unhe automatically WhatsApp par ek digital stamp bhejta hai. Jab client 10 stamps collect kar leta hai, use free treatment ya discount coupon milta hai. Koi naya app download karne ki zaroorat nahi." },
                { q: "Can I customize the reward structure for my salon?", a: "Yes! You can fully customize how many stamps equal one reward, what the reward is (free haircut, complimentary facial, percentage discount, or free product), and set up different stamp cards for different service categories (e.g., hair care vs. skin care). You can also set stamp expiry windows." },
              ].map((faq, i) => (
                <details key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <summary className="font-bold text-slate-900 cursor-pointer">{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="py-16 bg-gradient-to-b from-white to-pink-50/40 border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Ready to Grow Your Salon Client Loyalty?</h2>
              <p className="text-slate-600 text-sm">Join hundreds of Indian salons and beauty parlours using CustomerPilot for automated WhatsApp loyalty. 3-day free trial, no credit card required.</p>
              <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl">
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
