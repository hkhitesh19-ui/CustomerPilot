import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"
import { CheckCircle2, ArrowRight, Star, Gift, UtensilsCrossed } from "lucide-react"

export const metadata: Metadata = {
  title: "WhatsApp Loyalty Program for Restaurants | CustomerPilot",
  description:
    "CustomerPilot's WhatsApp loyalty stamp card for restaurants. Auto-stamp after every dine-in or delivery order. Automated win-back campaigns bring lost customers back. Free trial for Indian restaurants.",
  keywords: [
    "restaurant loyalty program India",
    "dine-in stamp card WhatsApp",
    "restaurant customer retention software",
    "loyalty rewards for restaurant",
    "repeat customer WhatsApp restaurant",
    "food delivery loyalty program",
    "restaurant punch card digital",
    "WhatsApp loyalty for dhaba India"
  ],
  alternates: { canonical: "https://customerpilot.in/industry/restaurant-loyalty-program" },
  openGraph: {
    title: "WhatsApp Loyalty Program for Restaurants | CustomerPilot",
    description: "Auto-stamp after every dine-in or delivery order. Win-back campaigns bring lost diners back. Free trial.",
    url: "https://customerpilot.in/industry/restaurant-loyalty-program"
  }
}

const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot Restaurant Loyalty Program",
      "operatingSystem": "All (WhatsApp-based)",
      "applicationCategory": "BusinessApplication",
      "description": "WhatsApp-native digital loyalty stamp card for restaurants. Auto-stamps after every dine-in or delivery order, drives repeat visits, and collects 5-star Google reviews automatically.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does WhatsApp loyalty work for restaurants?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "After every dine-in meal or delivery order, CustomerPilot automatically sends a WhatsApp message to the diner with their digital loyalty stamp. When they collect enough stamps (e.g., 8 meals), they earn a free dish or discount on their next visit. The system works without any app download — completely inside WhatsApp."
          }
        },
        {
          "@type": "Question",
          "name": "Restaurant ke liye WhatsApp loyalty program kaise kaam karta hai?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Jab bhi koi customer aapke restaurant mein khaana khata hai ya delivery order karta hai, CustomerPilot automatically unhe WhatsApp par ek digital stamp bhejta hai. Jab wo 8-10 stamps collect kar leta hai, use ek free dish ya discount milta hai. Koi app download karne ki zaroorat nahi — sab kuch WhatsApp mein hi hota hai."
          }
        }
      ]
    }
  ]
}

export default function RestaurantLoyaltyProgramPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://customerpilot.in" },
        { name: "Industries", url: "https://customerpilot.in/industry" },
        { name: "Restaurant Loyalty Program", url: "https://customerpilot.in/industry/restaurant-loyalty-program" }
      ]} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-slate-900">CustomerPilot</Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">← Home</Link>
              <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                <Link href="/signup">Start Free Trial →</Link>
              </Button>
            </div>
          </div>
        </header>
        <main>
          <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-orange-50/60 to-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <span className="inline-flex items-center gap-2 text-orange-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200">
                <UtensilsCrossed className="w-3.5 h-3.5" /> Restaurant Loyalty Program
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                Bring Diners Back Every Week with <span className="text-orange-600">WhatsApp Restaurant Loyalty Stamps</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Turn one-time diners into weekly regulars with CustomerPilot&apos;s WhatsApp loyalty program. Auto-stamp after every dine-in or delivery order. Send automated win-back campaigns when diners go missing. Build a loyal community around your restaurant without any app.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg">
                  <Link href="/signup">Start Free 3-Day Trial <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-800 font-bold text-sm px-6 py-4 rounded-xl">
                  <Link href="/whatsapp-digital-loyalty-card">See How It Works</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Why Restaurant Owners Choose CustomerPilot</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Works for Dine-In & Delivery Both</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Whether a customer eats at your table or orders via Swiggy/Zomato, CustomerPilot can trigger a WhatsApp stamp. Table QR for dine-in, UPI payment detection for delivery — every order builds toward a free meal reward.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Star className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-slate-900">Weekly Special Alerts Drive Footfall</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Send WhatsApp broadcasts to your loyalty members about weekly specials, new dishes, or limited-time combos. &quot;This Thursday only: Dal Makhani + Naan at 40% off for loyalty members!&quot; These targeted alerts generate 3-4x more orders than generic ads.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Gift className="w-6 h-6 text-indigo-500" />
                <h3 className="font-bold text-slate-900">Auto Win-Back Lost Diners</h3>
                <p className="text-xs text-slate-600 leading-relaxed">If a regular hasn&apos;t visited in 21 days, CustomerPilot automatically sends: &quot;We miss you at [Restaurant Name]! Your favorite Butter Chicken is waiting — plus a free Gulab Jamun on your next visit.&quot; This automated win-back recovers 38% of lapsed customers.</p>
              </div>
            </div>
          </section>

          <section className="py-12 bg-slate-50/70 border-t border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl font-black text-slate-900 text-center mb-10">How Restaurant Loyalty Works in 3 Steps</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                {[
                  { step: 1, title: "Diner Pays or Scans Table QR", desc: "Place CustomerPilot's table QR code at every table. When a diner scans after their meal or pays via UPI, they automatically receive a WhatsApp stamp for that visit — no paper card, no app required." },
                  { step: 2, title: "Stamps Accumulate, Engagement Grows", desc: "The diner sees their stamp progress in WhatsApp: '5 of 8 meals completed! 3 more visits for your free Biryani.' CustomerPilot sends personalized weekly meal suggestions to stamp members to keep them engaged between visits." },
                  { step: 3, title: "Free Dish Redeemed, Loyalty Deepens", desc: "Once the diner completes their stamp card, they receive a WhatsApp coupon for a free dish or meal upgrade. Redeeming at your restaurant further strengthens the relationship and typically generates a new stamp card cycle." }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="space-y-3 p-6 bg-white rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-black text-lg flex items-center justify-center mx-auto">{step}</div>
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
                { q: "How does WhatsApp loyalty work for restaurants?", a: "After every dine-in meal or delivery order, CustomerPilot automatically sends a WhatsApp message to the diner with their digital loyalty stamp. When they collect enough stamps (e.g., 8 meals), they earn a free dish or discount on their next visit. No app download needed — completely inside WhatsApp." },
                { q: "Restaurant ke liye WhatsApp loyalty program kaise kaam karta hai?", a: "Jab bhi koi customer aapke restaurant mein khaana khata hai ya delivery order karta hai, CustomerPilot automatically unhe WhatsApp par ek digital stamp bhejta hai. Jab wo 8-10 stamps collect kar leta hai, use ek free dish ya discount milta hai. Koi app download karne ki zaroorat nahi." },
                { q: "Can the loyalty program work for a dhaba or tiffin service?", a: "Absolutely! CustomerPilot works for any food business — fine dining restaurants, dhabas, tiffin services, food trucks, and cloud kitchens. The setup is identical: customers get stamps via WhatsApp after every order. You can customize stamp targets and rewards to match your average order value." },
              ].map((faq, i) => (
                <details key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <summary className="font-bold text-slate-900 cursor-pointer">{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="py-16 bg-gradient-to-b from-white to-orange-50/40 border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Ready to Fill Your Restaurant Every Week?</h2>
              <p className="text-slate-600 text-sm">Join hundreds of Indian restaurants and dhabas using CustomerPilot for automated WhatsApp loyalty. 3-day free trial, no credit card required.</p>
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl">
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
