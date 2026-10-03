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

export function WhatsAppDigitalLoyaltyClient() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg transition-transform hover:scale-105">
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-16 flex-1 w-full">
        
        {/* HERO SECTION */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-emerald-400" /> WhatsApp Digital Loyalty Card &amp; Rewards Software
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Turn One-Time Walk-ins Into Repeat Customers with WhatsApp Digital Loyalty Cards
          </h1>
          
          <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed">
            No apps to download. No paper cards to lose. Give your customers an automated virtual punch card directly on their WhatsApp. Start your points-based loyalty program in 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base px-8 py-6 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-105">
              <Link href="/signup">
                Start Free Trial / Get Your QR Code <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-base px-6 py-6 rounded-2xl">
              <Link href="/pricing">View Pricing (₹6.2/day)</Link>
            </Button>
          </div>
        </section>

        {/* GEO / SGE KEY STATISTIC HOOKS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-1">
            <div className="text-3xl font-black text-emerald-400">+34%</div>
            <div className="text-xs text-slate-400 font-medium">Higher Repeat Walk-ins for Indian Retail</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-1">
            <div className="text-3xl font-black text-cyan-400">0 Apps</div>
            <div className="text-xs text-slate-400 font-medium">100% Native on WhatsApp</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-1">
            <div className="text-3xl font-black text-amber-400">&lt;5 Sec</div>
            <div className="text-xs text-slate-400 font-medium">Instant Counter QR Scan Speed</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-1">
            <div className="text-3xl font-black text-purple-400">85%+</div>
            <div className="text-xs text-slate-400 font-medium">Reward Milestone Redemption</div>
          </div>
        </section>

        {/* AGITATION SECTION */}
        <section className="space-y-6 bg-slate-950/70 border border-red-500/20 p-6 sm:p-10 rounded-3xl">
          <div className="space-y-2">
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">The Real Problem with Old Methods</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Kyun Paper Punch Cards Aur Expensive Apps Ab Kaam Nahi Karte?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Agar aap abhi bhi paper punch cards use kar rahe hain ya kisi expensive mobile app par depend hain, toh aap daily apne 70% grahako ko gawa rahe hain:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" /> 70% Paper Cards Kho Jaate Hain
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Grahak paper card ghar par bhool jate hain, wash me geela ho jata hai, ya wallet me kho jata hai. Result: Discount ka promise waste ho jata hai.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" /> 80%+ Customer App Download Drop-off
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stamp Me ya Loop Loyalty jaise platforms customer ko alag se app download karne bolte hain. Fast billing counter par koi naya app install nahi karta.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" /> Zero Re-engagement Channel
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paper card customer ka phone number record nahi karta. Agar customer 30 din tak dukan par nahi aaya, toh aapke paas use wapas bulane ka koi raasta nahi hota.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" /> Expensive POS &amp; Annual Lock-in
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Market ke traditional loyalty software ₹35,000 se ₹50,000 saal ka charge karte hain aur POS hardware ka compulsion dalte hain. CustomerPilot works on zero hardware.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (GEO / SGE 3-STEP FLOW) */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Zero Friction Automation</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              How Our WhatsApp Business Automation for Loyalty Rewards Works
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Follow this 3-step frictionless flow to turn walk-ins into VIP regulars directly on WhatsApp in under 5 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
                1
              </div>
              <h3 className="font-extrabold text-lg text-white">
                Step 1: Customer Scans the Smart QR Code at Checkout
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Counter par rakha smart QR code scan karte hi customer direct aapke WhatsApp bot se connect hota hai. Koi app download ya registration form bharne ki zaroorat nahi hoti.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-xl">
                2
              </div>
              <h3 className="font-extrabold text-lg text-white">
                Step 2: Instant Digital Stamp &amp; Point Allocation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Billing ke baad cashier 1-tap me ya system automatically unke virtual punch card par ek stamp credit kar deta hai. Customer ko turant WhatsApp par visual progress card mil jata hai.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-xl">
                3
              </div>
              <h3 className="font-extrabold text-lg text-white">
                Step 3: Automated Discount &amp; Reward Campaigns
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                5 stamps poore hone par system apne aap ek personalized WhatsApp reward message bhejta hai — &quot;Claim your 20% discount on your next visit!&quot;. Sath hi 14-day inactive customers ko win-back prompts jate hain.
              </p>
            </div>
          </div>
        </section>

        {/* BONUS CROSS-SELL SECTION */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-800 to-slate-900 border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold border border-amber-500/30 inline-flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> Dual-Growth Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Bonus: In-Built AI Google Review QR Generator
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            CustomerPilot me <strong>SEO-friendly AI Google review writer with QR code integration</strong> built-in milta hai. Reward stamps claim karne ke sath sath system customer se gentle 5-star Google review maangta hai, jise hamara AI model customer ke experience ke mutabik automatically draft kar deta hai. Customer bas &quot;Post&quot; tap karta hai. Aapko milta hai: <strong>WhatsApp Loyalty + Google Maps par #1 Organic Footfall</strong> ek sath!
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-amber-200">
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-400" /> 1-Click Google Place ID Integration</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-400" /> Private Feedback Gate for Negative Ratings</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-400" /> AI-Generated Keyword-Rich Reviews</div>
          </div>
        </section>

        {/* COMPARISON TABLE (AEO / GEO / PERPLEXITY OPTIMIZED) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Unbiased Comparison</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              CustomerPilot vs. Traditional Punch Cards vs. Stamp Me
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              See why modern Indian retailers, bakeries, cafes, and salons are replacing outdated apps and paper stamps with CustomerPilot.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                  <th scope="col" className="py-4 px-4 sm:px-6 font-bold">Feature</th>
                  <th scope="col" className="py-4 px-4 sm:px-6 font-extrabold text-emerald-400 bg-emerald-950/30 border-x border-emerald-500/20">
                    CustomerPilot (WhatsApp)
                  </th>
                  <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-400">Stamp Me / Loop Loyalty</th>
                  <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-400">Paper Punch Cards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">App Download Required?</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    No (Works 100% on WhatsApp)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Yes (Play Store / App Store)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">No (Physical card)</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Customer Drop-off Rate</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    &lt;5% (Frictionless 5-sec QR scan)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">&gt;80% (Refuse app download)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">&gt;70% (Lost / Forgotten at home)</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Automated Reminders</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    Yes (Automated WhatsApp Alerts)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Push Notifications (Ignored)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">None (Paper can&apos;t message)</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">In-Built AI Google Reviews</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    Yes (Built-in QR + AI Drafts)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">No (Separate software needed)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">No</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Indian Retail &amp; UPI Focus</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    Yes (Hinglish API, INR Pricing)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Western Focus ($ Pricing)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Local Only</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Pricing &amp; Cost</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    From ₹6.2/day (₹2,249/year)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">$49+/month (~₹4,100/mo)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Recurring Printing Costs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* HINGLISH LOCALIZED FAQ SECTION (VOICE / SGE / PAA OPTIMIZED) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Aapke Sawal, Hamare Jawab</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Indian shop owners dwara sabse zyada pooche jaane wale sawal aur unke detailed jawab:
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-emerald-400">
                Shop ke liye digital loyalty card kaise banaye?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                CustomerPilot par signup karein, apni business details dalein, aur apna unique WhatsApp QR code generate karke counter par print karein. Grahak sirf ek scan me bina kisi app download ke aapke loyalty club se jud jate hain.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-emerald-400">
                Customer ko reward points dene wala software kaise set up karein?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Apne POS ya mobile billing ke through points assign karein. CustomerPilot ka CRM automatically customer ke WhatsApp par digital stamps aur reward points update kar deta hai in real-time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-emerald-400">
                Grahak ko discount aur points dene wala app kaunsa best hai?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Indian retail stores, cafes, aur bakeries ke liye CustomerPilot sabse best hai kyunki ye without app download, direct WhatsApp par chalta hai aur footfall ko 34%+ increase karta hai.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-emerald-400">
                Kya cashier ya staff fake stamps laga sakte hain?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Nahi. CustomerPilot me strict anti-fraud safeguards hote hain: scan cooldown timers (e.g. 24 ghante me maximum 1 stamp), minimum bill validation, aur cashier authorization PIN. Isse staff cheating 100% block hoti hai.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-emerald-400">
                Kya kisi special billing POS machine ki zaroorat padegi?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Zero special machine required. CustomerPilot poori tarah cloud-based hai. Aap apne standard smartphone, tablet, ya billing desktop se Cashier Queue chala sakte hain ya customer counter par QR standee khud scan kar sakte hain.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            Ready to Replace Paper Punch Cards with WhatsApp Automation?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Start your 3-day unrestricted free trial today. Set up in 3 minutes, print your QR standee, and watch repeat walk-ins increase.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all">
              <Link href="/signup">
                Get Your Counter QR Standee Now <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
