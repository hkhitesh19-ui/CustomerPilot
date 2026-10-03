import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Star,
  Smartphone,
  MessageSquare,
  MapPin,
  Utensils,
  ExternalLink
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export function SmartDigitalBusinessCardClient() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col justify-between">
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
            <Button asChild size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg transition-transform hover:scale-105">
              <Link href="/signup">Create Your Card →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-16 flex-1 w-full">
        
        {/* HERO SECTION */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Smart NFC &amp; QR Digital Visiting Card
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Smart Digital Business Card with QR Code &amp; Instant Google Reviews
          </h1>
          
          <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed">
            Replace paper visiting cards with modern, interactive digital business cards. Let customers save your contact with 1 tap, write 5-star Google reviews, order food, and view your digital menu — all from a single QR code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-base px-8 py-6 rounded-2xl shadow-xl shadow-cyan-500/20 transition-all hover:scale-105">
              <Link href="/signup">
                Create Your Digital Card Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-base px-6 py-6 rounded-2xl">
              <Link href="/c/tasty-vadapav-atladara" target="_blank" className="inline-flex items-center gap-2">
                View Live Card Demo <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* GEO / SGE KEY STATISTIC HOOKS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-1">
            <div className="text-3xl font-black text-red-400">88%</div>
            <div className="text-xs text-slate-400 font-medium">Paper Cards Thrown Away in 7 Days</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-1">
            <div className="text-3xl font-black text-cyan-400">1-Tap</div>
            <div className="text-xs text-slate-400 font-medium">Native vCard Phonebook Sync</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-1">
            <div className="text-3xl font-black text-amber-400">5X</div>
            <div className="text-xs text-slate-400 font-medium">Higher Google Review Conversion</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-1">
            <div className="text-3xl font-black text-emerald-400">₹0</div>
            <div className="text-xs text-slate-400 font-medium">Re-Printing Cost on Detail Updates</div>
          </div>
        </section>

        {/* 6 KEY CAPABILITIES GRID */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Everything on One Screen</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              6 Powerful Features That Paper Visiting Cards Can Never Do
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Your digital business card is not just a card — it is an active sales, reputation, and ordering hub for your store.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">1-Tap Save Contact (vCard)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customers tap &quot;Save Contact&quot; and your store name, phone, address, and website download straight into their mobile address book without manual typing.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-amber-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Direct Google Review Modal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct integration with Google Place ID (`search.google.com/local/writereview?placeid=...`). Opens 5-star rating popup directly on mobile screens!
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">WhatsApp &amp; Call Quick Connect</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect in 1 second. Customers start a WhatsApp chat or phone call with a pre-filled greeting message without having to save your phone number first.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Digital Menu &amp; Catalog Links</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Embed direct ordering touchpoints: Zomato, Swiggy, your direct website, or high-res PDF product menu catalogs for instant food and item browsing.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-blue-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">GPS Directions &amp; Live Hours</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn-by-turn navigation via Google Maps deep linking, plus real-time business opening hours so customers never visit a closed store.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-pink-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Printable QR &amp; NFC Ready</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download high-res printable vector QR codes for counter acrylic stands, takeout bags, and smart NFC tap cards for effortless offline sharing.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Smart Comparison</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              CustomerPilot Smart Card vs. Traditional Paper Cards vs. Linktree
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Why Indian local stores, cafes, and professional services prefer a purpose-built commerce card over generic bio-link tools:
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-slate-300">
                  <th scope="col" className="py-4 px-4 sm:px-6 font-bold">Feature</th>
                  <th scope="col" className="py-4 px-4 sm:px-6 font-extrabold text-cyan-400 bg-cyan-950/30 border-x border-cyan-500/20">
                    CustomerPilot Smart Card
                  </th>
                  <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-400">Paper Visiting Cards</th>
                  <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-400">Linktree / Bio-Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">1-Tap Save Contact (vCard)</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-400 bg-cyan-950/20 border-x border-cyan-500/20">
                    Yes (Native VCF phonebook sync)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">No (Manual typing required)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Partial / 3rd party tool</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Direct Google Review Modal</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-400 bg-cyan-950/20 border-x border-cyan-500/20">
                    Yes (Auto-opens 5-star dialog)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">No</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Basic external web link</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Digital Menu &amp; Food Ordering</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-400 bg-cyan-950/20 border-x border-cyan-500/20">
                    Yes (Zomato/Swiggy/PDF Catalog)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">No</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Generic text buttons</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Re-Printing Cost on Updates</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-400 bg-cyan-950/20 border-x border-cyan-500/20">
                    ₹0 (Updates in real-time online)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">₹1,500 – ₹5,000 per print batch</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">₹0</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Brand Identity &amp; Times Typography</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-400 bg-cyan-950/20 border-x border-cyan-500/20">
                    Customized store logo &amp; colors
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Static paper print</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Standardized layout</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* HINGLISH LOCALIZED FAQ SECTION */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Aapke Sawal, Hamare Jawab</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Digital visiting cards ke bare me vyaparion ke aam sawal:
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-cyan-400">
                Dukan ya business ke liye digital visiting card kaise banaye?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                CustomerPilot dashboard par jayein, apni dukan ka naam, phone number, Google Place ID, aur digital menu link enter karein. System 2 minute me aapka unique digital card aur printable QR code tayyar kar deta hai.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-cyan-400">
                CustomerPilot digital card me kya kya features hote hain?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                CustomerPilot digital card me 1-Tap Save Contact (VCF vCard), Direct Google Reviews submission modal, WhatsApp quick chat, Phone calling, Google Maps navigation, aur Online Ordering links shamil hain.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-cyan-400">
                Digital visiting card se Google Reviews kaise badhte hain?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Humara card Google ke official direct review modal se judha hota hai. Customer ke tap karte hi seedha 5-star rating dialog khulta hai, jisse review likhne ka conversion 5X ho jata hai.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-cyan-400">
                Agar phone number ya address badal gaya toh kya naya card banana padega?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Bilkul nahi. Dashboard me change karte hi aapka digital card real-time me update ho jata hai. Aapka QR code wahi rehta hai, re-printing ka ek rupaya bhi kharch nahi hota.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            Upgrade Your Business to a Smart Digital Card Today
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Get your interactive digital card link, download your printable QR code, and start sharing professional links on WhatsApp in 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all">
              <Link href="/signup">
                Create My Digital Card <ArrowRight className="w-5 h-5 ml-2" />
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
