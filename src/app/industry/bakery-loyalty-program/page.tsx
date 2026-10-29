import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"
import { CheckCircle2, ArrowRight, Star, Gift } from "lucide-react"

export const metadata: Metadata = {
  title: "WhatsApp Loyalty Program for Bakeries & Cake Shops | CustomerPilot",
  description:
    "CustomerPilot's WhatsApp loyalty stamps for bakeries and cake shops. Auto-send digital stamps after every cake, bread or dessert purchase. Build loyal bakery customers who return weekly. No paper punch cards.",
  keywords: [
    "bakery loyalty program India",
    "cake shop loyalty card WhatsApp",
    "bakery customer retention app",
    "digital stamp card for bakery",
    "WhatsApp loyalty bakery",
    "repeat customers for cake shop",
    "bakery punch card digital India",
    "cake shop repeat customer software"
  ],
  alternates: { canonical: "https://customerpilot.in/industry/bakery-loyalty-program" },
  openGraph: {
    title: "WhatsApp Loyalty Program for Bakeries & Cake Shops | CustomerPilot",
    description: "Auto-send WhatsApp loyalty stamps after every bakery purchase. No app download. Build weekly regulars for your cake shop.",
    url: "https://customerpilot.in/industry/bakery-loyalty-program"
  }
}

const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot Bakery Loyalty Program",
      "operatingSystem": "All (WhatsApp-based)",
      "applicationCategory": "BusinessApplication",
      "description": "WhatsApp-native digital loyalty stamp card for bakeries and cake shops. Automatically stamps after every purchase and sends birthday cake reminders, seasonal offers, and win-back messages.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does a WhatsApp loyalty program work for a bakery or cake shop?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot sends an automatic WhatsApp stamp to customers after every bakery purchase — whether they buy bread, pastries, or custom cakes. After collecting 10 stamps, they earn a free pastry or discount on their next cake order. The system also sends birthday cake reminders to loyalty members, generating repeat custom cake orders every month."
          }
        },
        {
          "@type": "Question",
          "name": "Bakery ke liye WhatsApp loyalty card kaise kaam karta hai?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Jab bhi koi customer aapki bakery se kuch kharidta hai, CustomerPilot automatically unhe WhatsApp par ek digital stamp bhejta hai. 10 stamps poore hone par unhe ek free pastry ya next cake order par discount milta hai. Iska sabse bada faayda ye hai ki system automatically unhe birthday cake ke liye yaad dilata hai — isliye monthly custom cake orders badhte hain."
          }
        }
      ]
    }
  ]
}

export default function BakeryLoyaltyProgramPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://customerpilot.in" },
        { name: "Industries", url: "https://customerpilot.in/industry" },
        { name: "Bakery Loyalty Program", url: "https://customerpilot.in/industry/bakery-loyalty-program" }
      ]} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-slate-900">CustomerPilot</Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">← Home</Link>
              <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl">
                <Link href="/signup">Start Free Trial →</Link>
              </Button>
            </div>
          </div>
        </header>
        <main>
          <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-amber-50/60 to-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <span className="inline-flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200">
                🎂 Bakery & Cake Shop Loyalty Program
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                Grow Repeat Bakery Customers with <span className="text-amber-600">WhatsApp Digital Stamp Cards</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Turn occasional cake buyers into weekly regulars with CustomerPilot&apos;s WhatsApp loyalty program. Auto-stamp after every bread, pastry, or custom cake purchase. Send birthday cake reminders that generate repeat orders every month — all inside WhatsApp, no new app needed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm px-8 py-4 rounded-xl shadow-lg">
                  <Link href="/signup">Start Free 3-Day Trial <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-800 font-bold text-sm px-6 py-4 rounded-xl">
                  <Link href="/whatsapp-digital-loyalty-card">See How It Works</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Why Bakery Owners Choose CustomerPilot</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Birthday Cake Reminders Drive Monthly Orders</h3>
                <p className="text-xs text-slate-600 leading-relaxed">CustomerPilot captures loyalty members&apos; birthdays and sends WhatsApp reminders 7 days before: &quot;It&apos;s [Name]&apos;s birthday soon! Order your custom cake from us and get 15% off as a loyalty member.&quot; This single feature generates 20-30% of a bakery&apos;s monthly custom cake revenue.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Star className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-slate-900">Turn Walk-In Buyers into Weekly Regulars</h3>
                <p className="text-xs text-slate-600 leading-relaxed">A customer who buys once and gets a loyalty stamp is 3x more likely to return that same week for their next stamp. CustomerPilot sends gentle WhatsApp nudges: &quot;You&apos;re 3 stamps away from your free chocolate croissant!&quot; — creating consistent weekly foot traffic.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Gift className="w-6 h-6 text-indigo-500" />
                <h3 className="font-bold text-slate-900">Festival & Seasonal Campaigns on WhatsApp</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Send festival-specific WhatsApp broadcasts to your loyalty base: Diwali gift boxes, Christmas plum cakes, Eid special hampers. These targeted seasonal campaigns reach only existing customers who already love your bakery — converting at 5x higher rates than random ads.</p>
              </div>
            </div>
          </section>

          <section className="py-12 bg-slate-50/70 border-t border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl font-black text-slate-900 text-center mb-10">How Bakery Loyalty Works in 3 Steps</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                {[
                  { step: 1, title: "Customer Buys & Gets Stamped", desc: "When a customer buys bread, pastries, or a cake, they scan your bakery's QR code at the counter or pay via UPI. CustomerPilot instantly sends a WhatsApp stamp with their updated stamp count and progress toward their free reward." },
                  { step: 2, title: "Stamps Build, Engagement Grows", desc: "The customer sees their stamp card in WhatsApp: '7 of 10 Cake Connection stamps collected! 3 more to earn your free pastry.' CustomerPilot also sends seasonal alerts and birthday reminders to keep them engaged between purchases." },
                  { step: 3, title: "Free Reward Drives the Next Visit", desc: "When the customer completes their stamp card, they receive a free pastry coupon or discount on a custom cake via WhatsApp. Redeeming at your bakery starts a new stamp cycle, deepening their loyalty with every visit." }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="space-y-3 p-6 bg-white rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-black text-lg flex items-center justify-center mx-auto">{step}</div>
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
                { q: "How does a WhatsApp loyalty program work for a bakery or cake shop?", a: "CustomerPilot sends an automatic WhatsApp stamp to customers after every bakery purchase. After collecting 10 stamps, they earn a free pastry or discount on their next cake order. The system also sends birthday cake reminders to loyalty members, generating repeat custom cake orders every month." },
                { q: "Bakery ke liye WhatsApp loyalty card kaise kaam karta hai?", a: "Jab bhi koi customer aapki bakery se kuch kharidta hai, CustomerPilot automatically unhe WhatsApp par ek digital stamp bhejta hai. 10 stamps poore hone par unhe ek free pastry ya next cake order par discount milta hai. Iska sabse bada faayda ye hai ki system automatically unhe birthday cake ke liye yaad dilata hai." },
                { q: "Can CustomerPilot help my bakery get more Google reviews?", a: "Yes! CustomerPilot integrates AI Google Review generation with the loyalty program. After a happy customer makes a purchase, they receive a WhatsApp prompt with a pre-drafted 5-star Google review mentioning your bakery's fresh products and service. One tap publishes it to Google Maps, boosting your local search visibility." },
              ].map((faq, i) => (
                <details key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <summary className="font-bold text-slate-900 cursor-pointer">{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="py-16 bg-gradient-to-b from-white to-amber-50/40 border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Ready to Grow Your Bakery Customer Loyalty?</h2>
              <p className="text-slate-600 text-sm">Join hundreds of Indian bakeries and cake shops using CustomerPilot for automated WhatsApp loyalty. 3-day free trial, no credit card required.</p>
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl">
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
