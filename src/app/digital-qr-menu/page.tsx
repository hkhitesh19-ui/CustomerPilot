import type { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Free QR Code Digital Menu Maker with WhatsApp Ordering India | CustomerPilot",
  description:
    "Create a free contactless QR code digital menu for your restaurant, cafe, or bakery in India. Customers scan the QR, view your menu, and order directly on WhatsApp in 1 tap. No app download needed.",
  keywords: [
    "qr code menu maker free india",
    "digital menu with whatsapp ordering",
    "contactless restaurant menu qr india",
    "free online menu maker for cafe bakery",
    "digital menu qr code for restaurant",
    "online menu builder india",
    "whatsapp menu ordering system",
    "free digital menu for small restaurant india",
    "qr code food menu india",
    "restaurant digital menu maker free"
  ],
  alternates: {
    canonical: "https://customerpilot.in/digital-qr-menu"
  },
  openGraph: {
    title: "Free QR Code Digital Menu with WhatsApp Ordering | CustomerPilot",
    description:
      "Create a contactless digital menu QR for your restaurant or cafe. Customers scan → view menu → order on WhatsApp in 1 tap. Free setup.",
    url: "https://customerpilot.in/digital-qr-menu",
    type: "website"
  }
}

const DIGITAL_MENU_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot Digital QR Menu Maker",
      "operatingSystem": "All (Web Browser + WhatsApp)",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "549",
        "priceCurrency": "INR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "549",
          "priceCurrency": "INR",
          "unitText": "6 Months"
        }
      },
      "description": "Create a contactless QR code digital menu for restaurants, cafes, and bakeries in India. Customers scan the QR, view the full menu with photos, and place WhatsApp orders in one tap — no app required."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a QR code digital menu for restaurants?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A QR code digital menu is an online menu that customers access by scanning a printed QR code with their smartphone camera — no app needed. The menu opens instantly in their browser, showing all dishes, prices, photos, and descriptions. For Indian restaurants and cafes, CustomerPilot additionally adds a 1-tap WhatsApp ordering button so customers can place orders directly on WhatsApp."
          }
        },
        {
          "@type": "Question",
          "name": "Free mein digital menu QR code kaise banaye apni dukan ke liye?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot par 3-day free trial ke sath signup karein. Dashboard mein apne dishes ke naam, price, aur photo upload karein. System apne aap ek unique QR code generate karega jise aap apne table pe, counter pe, ya social media par share kar sakte hain. Customer scan karte hi aapka poora menu WhatsApp par order option ke sath milta hai."
          }
        },
        {
          "@type": "Question",
          "name": "Can customers order directly on WhatsApp from the digital menu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! CustomerPilot's digital QR menu has a built-in '1-Tap WhatsApp Order' button. When a customer sees an item they like, they tap the WhatsApp button and a pre-filled order message is sent directly to your WhatsApp Business number — with the item name, quantity, and customer's preferred delivery or pickup option."
          }
        },
        {
          "@type": "Question",
          "name": "Is the digital QR menu free or paid?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot offers a 3-day full-featured free trial. After that, the Digital QR Menu module starts at ₹549 for 6 months (₹3/day) or ₹799 for 1 year (₹2.2/day). This includes unlimited menu items, photos, WhatsApp ordering integration, and QR code generation — far more affordable than any third-party menu platform."
          }
        },
        {
          "@type": "Question",
          "name": "Does the digital menu work on all smartphones without an app?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, 100% app-free. The CustomerPilot digital menu opens in any smartphone's native browser (Chrome, Safari) when the customer scans the QR code with their camera. No WhatsApp Business app installation required by the customer. It works on all Android and iPhone models available in India."
          }
        },
        {
          "@type": "Question",
          "name": "Can I update my menu items and prices in real-time?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! You can update your menu items, prices, photos, and availability (mark items as 'Sold Out' or 'Available') in real-time from the CustomerPilot dashboard. Changes go live instantly — customers scanning the same QR code always see your most current menu."
          }
        }
      ]
    }
  ]
}

export default function DigitalQrMenuPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DIGITAL_MENU_SCHEMA) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Services", url: "https://customerpilot.in/services" },
          { name: "Digital QR Menu", url: "https://customerpilot.in/digital-qr-menu" }
        ]}
      />

      <div className="min-h-screen bg-white text-slate-900 font-sans">
        {/* Hero */}
        <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
              📱 Contactless · QR Code · WhatsApp Ordering
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
              QR Code Digital Menu Maker —<br />
              <span className="text-orange-600">Contactless Menu with 1-Tap WhatsApp Order</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Create a free digital menu QR code for your restaurant, cafe, bakery, or dhaba in India.
              Customers scan → view menu with photos → order directly on WhatsApp in 1 tap. No app needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-orange-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-700 transition text-center">
                Create Free Digital Menu →
              </Link>
              <Link href="/pricing" className="border-2 border-orange-600 text-orange-700 font-bold py-3 px-8 rounded-xl hover:bg-orange-50 transition text-center">
                View Pricing (from ₹3/day)
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">Free 3-day trial · No credit card · Live in 5 minutes</p>
          </div>
        </section>

        {/* What is Digital QR Menu */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              What is a QR Code Digital Menu?
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              A <strong>QR Code Digital Menu</strong> replaces traditional paper menus with a smart online menu that
              customers access by scanning a QR code with their phone camera — zero app download required. For Indian
              restaurants, cafes, and bakeries, CustomerPilot&apos;s digital menu goes further: it includes a
              built-in <strong>1-tap WhatsApp ordering button</strong> so customers can place orders directly on
              WhatsApp without calling.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                { icon: "📋", title: "Full Menu with Photos", desc: "Upload dish photos, descriptions, prices, and categories. Looks professional on any smartphone." },
                { icon: "💬", title: "WhatsApp Order in 1 Tap", desc: "Customers tap 'Order on WhatsApp' — pre-filled order message sent to your business number instantly." },
                { icon: "🔄", title: "Update in Real-Time", desc: "Change prices, mark items sold-out, add daily specials — changes reflect instantly for all customers." }
              ].map((item) => (
                <div key={item.title} className="bg-orange-50 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-14 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-10">
              Set Up Your Digital Menu in 3 Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Upload Your Menu", desc: "Add dishes with photos, descriptions, and prices in your CustomerPilot dashboard. Organize by categories (Starters, Mains, Desserts, Beverages)." },
                { step: "2", title: "Print & Place QR Code", desc: "Download your unique printable QR code. Place it on tables, counters, entry gates, or share it on Instagram/WhatsApp status." },
                { step: "3", title: "Receive WhatsApp Orders", desc: "Every customer order comes directly to your WhatsApp Business number — with item, quantity, and customer contact details auto-filled." }
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-lg mb-4">{item.step}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-14 px-4 bg-orange-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              Digital Menu QR Code Price — From ₹3/Day
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="text-sm font-bold text-slate-500 mb-1">6 MONTHS</div>
                <div className="text-4xl font-black text-slate-900 mb-1">₹549</div>
                <div className="text-sm text-slate-500 mb-4">Digital QR Menu Module</div>
                <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
                  <li>✅ Unlimited menu items + photos</li>
                  <li>✅ WhatsApp ordering integration</li>
                  <li>✅ Printable QR code</li>
                  <li>✅ Real-time menu updates</li>
                </ul>
                <Link href="/register" className="block bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition text-center">
                  Start Free Trial
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-orange-500 shadow-md">
                <div className="text-sm font-bold text-orange-600 mb-1">1 YEAR — BEST VALUE</div>
                <div className="text-4xl font-black text-slate-900 mb-1">₹799</div>
                <div className="text-sm text-slate-500 mb-4">Digital QR Menu Module</div>
                <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
                  <li>✅ Everything in 6-month plan</li>
                  <li>✅ Category-wise menu sections</li>
                  <li>✅ WhatsApp order notifications</li>
                  <li>✅ Daily order summary report</li>
                </ul>
                <Link href="/register" className="block bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition text-center">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: "What is a QR code digital menu for restaurants?", a: "A QR code digital menu is an online menu accessible by scanning a QR code — no app required. CustomerPilot adds 1-tap WhatsApp ordering so customers can directly order from their phone." },
                { q: "Free mein restaurant ka digital menu kaise banaye?", a: "CustomerPilot par signup karein (3-day free trial), dashboard mein dishes aur photos upload karein, aur apna QR code download karein. Pure process mein sirf 5 minute lagte hain." },
                { q: "Can customers order on WhatsApp from the digital menu?", a: "Yes! Every menu item has a 'Order on WhatsApp' button. When tapped, a pre-filled WhatsApp message with the order details is sent directly to your business number." },
                { q: "Does it work without any app download for customers?", a: "100% app-free. Customers just scan the QR with their phone camera — the menu opens in Chrome or Safari browser instantly. No app installation required." },
                { q: "Can I add photos to my digital menu?", a: "Yes, upload dish photos for every item. High-quality food photos increase customer orders by 2-3X according to restaurant studies." }
              ].map((faq) => (
                <div key={faq.q} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2">Q: {faq.q}</h3>
                  <p className="text-slate-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 px-4 bg-orange-600 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              Modernize Your Menu Today — Free QR Code
            </h2>
            <p className="text-orange-100 mb-8">Join 500+ Indian restaurants and cafes with smart digital menus.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-orange-700 font-black py-3 px-8 rounded-xl hover:bg-orange-50 transition">
                Create Free Digital Menu →
              </Link>
              <Link href="/contact" className="border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-700 transition">
                Talk to Us
              </Link>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-4 text-sm">Explore More CustomerPilot Services</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "WhatsApp AI ChatBot", href: "/whatsapp-chatbot" },
                { label: "AI Google Review Booster", href: "/ai-google-review-qr-generator" },
                { label: "WhatsApp Loyalty Program", href: "/whatsapp-digital-loyalty-card" },
                { label: "POS WhatsApp Billing", href: "/whatsapp-pos-billing" },
                { label: "Pricing Plans", href: "/pricing" }
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-sm bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 px-3 py-1.5 rounded-lg transition">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
