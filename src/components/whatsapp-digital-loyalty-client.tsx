import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Star,
  Check
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

const LOYALTY_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "How to create a digital loyalty card for my retail shop or restaurant?",
    answerEn: "Simply sign up on CustomerPilot, enter your business details, and generate your custom WhatsApp QR code standee. Print and place it on your billing counter — customers join your loyalty club instantly with a single 5-second camera scan without installing any third-party app.",
    questionHi: "Shop ke liye digital loyalty card kaise banaye?",
    answerHi: "CustomerPilot par signup karein, apni business details dalein, aur apna unique WhatsApp QR code generate karke counter par print karein. Grahak sirf ek scan me bina kisi app download ke aapke loyalty club se jud jate hain."
  },
  {
    id: 2,
    questionEn: "How do I set up customer reward points and stamp allocation software?",
    answerEn: "Assign points or stamps seamlessly via your phone, tablet, or existing billing computer. CustomerPilot's CRM automatically updates digital stamps and reward milestone progress directly to the customer's WhatsApp in real time.",
    questionHi: "Customer ko reward points dene wala software kaise set up karein?",
    answerHi: "Apne POS ya mobile billing ke through points assign karein. CustomerPilot ka CRM automatically customer ke WhatsApp par digital stamps aur reward points update kar deta hai in real-time."
  },
  {
    id: 3,
    questionEn: "Which is the best customer rewards and discount app for Indian retail?",
    answerEn: "CustomerPilot is the top-rated retention software for Indian retailers, cafes, salons, and bakeries because it operates 100% inside WhatsApp with zero app download friction, boosting repeat walk-ins by 34%+.",
    questionHi: "Grahak ko discount aur points dene wala app kaunsa best hai?",
    answerHi: "Indian retail stores, cafes, aur bakeries ke liye CustomerPilot sabse best hai kyunki ye without app download, direct WhatsApp par chalta hai aur footfall ko 34%+ increase karta hai."
  },
  {
    id: 4,
    questionEn: "Can cashiers or store staff cheat with duplicate stamps?",
    answerEn: "Not at all. CustomerPilot features strict anti-fraud controls: configurable scan cooldown timers (e.g. maximum 1 stamp every 24 hours), minimum bill validation thresholds, and secure 4-digit cashier authorization PINs to prevent staff tampering.",
    questionHi: "Kya cashier ya staff fake stamps laga sakte hain?",
    answerHi: "Bilkul nahi. CustomerPilot me strict anti-fraud safeguards hote hain: scan cooldown timers (e.g. 24 ghante me maximum 1 stamp), minimum bill validation, aur cashier authorization PIN. Isse staff cheating 100% block hoti hai."
  },
  {
    id: 5,
    questionEn: "Does CustomerPilot require a special POS machine or barcode scanner?",
    answerEn: "Zero special hardware required. CustomerPilot is 100% cloud-based and runs on any standard smartphone, iPad, tablet, or billing PC. Customers can also self-scan the counter QR standee.",
    questionHi: "Kya kisi special billing POS machine ki zaroorat padegi?",
    answerHi: "Zero special machine required. CustomerPilot poori tarah cloud-based hai. Aap apne standard smartphone, tablet, ya billing desktop se Cashier Queue chala sakte hain ya customer counter par QR standee khud scan kar sakte hain."
  }
]

export function WhatsAppDigitalLoyaltyClient() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-transform hover:scale-105">
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-16 flex-1 w-full">
        
        {/* HERO SECTION */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" /> WhatsApp Digital Loyalty Card &amp; Rewards Software
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Turn One-Time Walk-ins Into Repeat Customers with WhatsApp Digital Loyalty Cards
          </h1>
          
          <p className="text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed">
            No apps to download. No paper cards to lose. Give your customers an automated virtual punch card directly on their WhatsApp. Start your points-based loyalty program in 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base px-8 py-6 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all hover:scale-105">
              <Link href="/signup">
                Start Free Trial / Get Your QR Code <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base px-6 py-6 rounded-2xl shadow-xs">
              <Link href="/pricing">View Pricing (₹6.2/day)</Link>
            </Button>
          </div>
        </section>

        {/* GEO / SGE KEY STATISTIC HOOKS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1 shadow-xs">
            <div className="text-3xl font-black text-emerald-600">+34%</div>
            <div className="text-xs text-slate-600 font-medium">Higher Repeat Walk-ins for Indian Retail</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1 shadow-xs">
            <div className="text-3xl font-black text-cyan-600">0 Apps</div>
            <div className="text-xs text-slate-600 font-medium">100% Native on WhatsApp</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1 shadow-xs">
            <div className="text-3xl font-black text-amber-600">&lt;5 Sec</div>
            <div className="text-xs text-slate-600 font-medium">Instant Counter QR Scan Speed</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1 shadow-xs">
            <div className="text-3xl font-black text-purple-600">85%+</div>
            <div className="text-xs text-slate-600 font-medium">Reward Milestone Redemption</div>
          </div>
        </section>

        {/* AGITATION SECTION */}
        <section className="space-y-6 bg-rose-50/50 border border-rose-200/80 p-6 sm:p-10 rounded-3xl shadow-xs">
          <div className="space-y-2">
            <span className="text-rose-700 text-xs font-bold uppercase tracking-wider">The Real Problem with Old Methods</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Kyun Paper Punch Cards Aur Expensive Apps Ab Kaam Nahi Karte?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Agar aap abhi bhi paper punch cards use kar rahe hain ya kisi expensive mobile app par depend hain, toh aap daily apne 70% grahako ko gawa rahe hain:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" /> 70% Paper Cards Kho Jaate Hain
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Grahak paper card ghar par bhool jate hain, wash me geela ho jata hai, ya wallet me kho jata hai. Result: Discount ka promise waste ho jata hai.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" /> 80%+ Customer App Download Drop-off
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stamp Me ya Loop Loyalty jaise platforms customer ko alag se app download karne bolte hain. Fast billing counter par koi naya app install nahi karta.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" /> Zero Re-engagement Channel
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paper card customer ka phone number record nahi karta. Agar customer 30 din tak dukan par nahi aaya, toh aapke paas use wapas bulane ka koi raasta nahi hota.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" /> Expensive POS &amp; Annual Lock-in
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Market ke traditional loyalty software ₹35,000 se ₹50,000 saal ka charge karte hain aur POS hardware ka compulsion dalte hain. CustomerPilot works on zero hardware.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (GEO / SGE 3-STEP FLOW) */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Zero Friction Automation</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              How Our WhatsApp Business Automation for Loyalty Rewards Works
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Follow this 3-step frictionless flow to turn walk-ins into VIP regulars directly on WhatsApp in under 5 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 relative overflow-hidden shadow-xs hover:border-slate-300 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-xl">
                1
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Step 1: Customer Scans the Smart QR Code at Checkout
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Counter par rakha smart QR code scan karte hi customer direct aapke WhatsApp bot se connect hota hai. Koi app download ya registration form bharne ki zaroorat nahi hoti.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 relative overflow-hidden shadow-xs hover:border-slate-300 transition">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 font-black text-xl">
                2
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Step 2: Instant Digital Stamp &amp; Point Allocation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Billing ke baad cashier 1-tap me ya system automatically unke virtual punch card par ek stamp credit kar deta hai. Customer ko turant WhatsApp par visual progress card mil jata hai.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 relative overflow-hidden shadow-xs hover:border-slate-300 transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-black text-xl">
                3
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Step 3: Automated Discount &amp; Reward Campaigns
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                5 stamps poore hone par system apne aap ek personalized WhatsApp reward message bhejta hai — &quot;Claim your 20% discount on your next visit!&quot;. Sath hi 14-day inactive customers ko win-back prompts jate hain.
              </p>
            </div>
          </div>
        </section>

        {/* BONUS CROSS-SELL SECTION */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-300 inline-flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Dual-Growth Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Bonus: In-Built AI Google Review QR Generator
          </h2>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-3xl">
            CustomerPilot me <strong>SEO-friendly AI Google review writer with QR code integration</strong> built-in milta hai. Reward stamps claim karne ke sath sath system customer se gentle 5-star Google review maangta hai, jise hamara AI model customer ke experience ke mutabik automatically draft kar deta hai. Customer bas &quot;Post&quot; tap karta hai. Aapko milta hai: <strong>WhatsApp Loyalty + Google Maps par #1 Organic Footfall</strong> ek sath!
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-amber-900 font-medium">
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-600 font-bold" /> 1-Click Google Place ID Integration</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-600 font-bold" /> Private Feedback Gate for Negative Ratings</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-600 font-bold" /> AI-Generated Keyword-Rich Reviews</div>
          </div>
        </section>

        {/* COMPARISON TABLE (AEO / GEO / PERPLEXITY OPTIMIZED) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-cyan-700 text-xs font-bold uppercase tracking-wider">Unbiased Comparison</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              CustomerPilot vs. Traditional Punch Cards vs. Stamp Me
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              See why modern Indian retailers, bakeries, cafes, and salons are replacing outdated apps and paper stamps with CustomerPilot.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th scope="col" className="py-4 px-4 sm:px-6 font-bold">Feature</th>
                  <th scope="col" className="py-4 px-4 sm:px-6 font-extrabold text-emerald-800 bg-emerald-50/80 border-x border-emerald-200">
                    CustomerPilot (WhatsApp)
                  </th>
                  <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-600">Stamp Me / Loop Loyalty</th>
                  <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-600">Paper Punch Cards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">App Download Required?</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                    No (Works 100% on WhatsApp)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">Yes (Play Store / App Store)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">No (Physical card)</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Customer Drop-off Rate</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                    &lt;5% (Frictionless 5-sec QR scan)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">&gt;80% (Refuse app download)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">&gt;70% (Lost / Forgotten at home)</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Automated Reminders</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                    Yes (Automated WhatsApp Alerts)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">Push Notifications (Ignored)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">None (Paper can&apos;t message)</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">In-Built AI Google Reviews</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                    Yes (Built-in QR + AI Drafts)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">No (Separate software needed)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">No</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Indian Retail &amp; UPI Focus</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                    Yes (Hinglish API, INR Pricing)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">Western Focus ($ Pricing)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">Local Only</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Pricing &amp; Cost</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                    From ₹6.2/day (₹2,249/year)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">$49+/month (~₹4,100/mo)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">Recurring Printing Costs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* DUAL-LANGUAGE FAQ SECTION (ENGLISH DEFAULT + HINGLISH) */}
        <DualLangFaq items={LOYALTY_FAQS} accentColor="emerald" theme="light" />

        {/* BOTTOM CALL TO ACTION */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 shadow-sm space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            Ready to Replace Paper Punch Cards with WhatsApp Automation?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Start your 3-day unrestricted free trial today. Set up in 3 minutes, print your QR standee, and watch repeat walk-ins increase.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all">
              <Link href="/signup">
                Get Your Counter QR Standee Now <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
