import type { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "WhatsApp PDF Billing Software India — POS Invoice on WhatsApp | CustomerPilot",
  description:
    "Send instant GST-compliant PDF invoices via WhatsApp after every sale. India's smartest POS billing software for small shops — generate bills in 10 seconds, send automatically on WhatsApp. Free trial.",
  keywords: [
    "pos billing software with whatsapp invoice india",
    "gst billing software for small shop free",
    "whatsapp pdf bill maker",
    "digital invoice sender for retail india",
    "whatsapp billing software small business",
    "pdf invoice on whatsapp india",
    "simple billing software for shop owner india",
    "gst invoice generator whatsapp",
    "mobile billing software india",
    "shop billing app with whatsapp"
  ],
  alternates: {
    canonical: "https://customerpilot.in/whatsapp-pos-billing"
  },
  openGraph: {
    title: "WhatsApp PDF Billing Software India — POS Invoice on WhatsApp | CustomerPilot",
    description:
      "Generate GST-compliant PDF invoices in 10 seconds and send automatically on WhatsApp. India's simplest POS billing for small shops.",
    url: "https://customerpilot.in/whatsapp-pos-billing",
    type: "website"
  }
}

const POS_BILLING_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot WhatsApp POS Billing Software",
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
      "description": "POS billing software for Indian small shops that generates GST-compliant PDF invoices in 10 seconds and sends them automatically on the customer's WhatsApp — no paper printing needed."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is WhatsApp POS billing software for small shops in India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "WhatsApp POS billing software is a digital point-of-sale system that generates a GST-compliant PDF bill in seconds and automatically sends it to the customer's WhatsApp number — eliminating the need for paper receipts. For Indian small shop owners (bakeries, salons, retail stores, restaurants), CustomerPilot's billing module makes the entire billing process faster, digital, and professional."
          }
        },
        {
          "@type": "Question",
          "name": "Is WhatsApp billing legal in India? Can I send GST invoices via WhatsApp?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, sending GST invoices via WhatsApp is completely legal in India. The Income Tax and GST departments recognize digital invoices sent electronically including via WhatsApp, as long as they contain the mandatory fields: GSTIN, invoice number, date, HSN/SAC codes, tax breakup (CGST/SGST/IGST), and business address. CustomerPilot generates fully GST-compliant PDF invoices that meet all these requirements."
          }
        },
        {
          "@type": "Question",
          "name": "WhatsApp par PDF bill kaise bhejein apne shop ke customer ko?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot billing dashboard mein items add karein, quantity aur price enter karein, aur customer ka WhatsApp number type karein. System 10 second mein ek professional GST-ready PDF bill generate karta hai aur automatically customer ke WhatsApp par bhej deta hai — koi printer ya paper nahi chahiye."
          }
        },
        {
          "@type": "Question",
          "name": "How much does billing software for small shops cost in India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot's WhatsApp POS Billing module costs just ₹549 for 6 months (₹3/day) or ₹799 for 1 year (₹2.2/day). This includes unlimited bills, GST-compliant PDF generation, automatic WhatsApp delivery, and customer billing history — far more affordable than Tally, Vyapar, or other billing software costing ₹7,000–₹15,000 per year."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use this billing software on my mobile phone?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! CustomerPilot's billing software is 100% web-based and works on any smartphone browser — Android or iPhone. No separate app installation required. You can generate and send bills directly from your mobile at the billing counter."
          }
        },
        {
          "@type": "Question",
          "name": "Does the billing software track customer purchase history?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, every bill generated is automatically saved in CustomerPilot's CRM with the customer's name, phone number, purchase items, and total amount. You can view each customer's complete purchase history, generate monthly sales reports, and even trigger targeted WhatsApp re-engagement campaigns for high-value customers."
          }
        }
      ]
    }
  ]
}

export default function WhatsAppPosBillingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(POS_BILLING_SCHEMA) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Services", url: "https://customerpilot.in/services" },
          { name: "WhatsApp POS Billing", url: "https://customerpilot.in/whatsapp-pos-billing" }
        ]}
      />

      <div className="min-h-screen bg-white text-slate-900 font-sans">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
              🧾 GST Compliant · WhatsApp Auto-Send · No Printer Needed
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
              POS Billing Software with Instant<br />
              <span className="text-blue-600">WhatsApp PDF Invoice — For Indian Shops</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Generate GST-compliant PDF bills in 10 seconds and auto-send to customer&apos;s WhatsApp.
              No printer, no paper, no delays. Perfect for bakeries, salons, retail shops, and restaurants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/billing" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition text-center">
                Login to Start Billing →
              </Link>
              <Link href="/register" className="border-2 border-blue-600 text-blue-700 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition text-center">
                Start Free Trial (3 Days)
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">No credit card · Works on mobile · GST ready</p>
          </div>
        </section>

        {/* What is POS Billing */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              What is WhatsApp POS Billing Software?
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              <strong>WhatsApp POS Billing Software</strong> is a digital point-of-sale system that replaces manual
              paper receipts and slow printer bills. For Indian shop owners, CustomerPilot&apos;s billing module lets you
              generate a <strong>professional GST-compliant PDF invoice</strong> in 10 seconds and automatically deliver
              it to the customer&apos;s WhatsApp — no printer required.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              Every bill is stored in your CustomerPilot CRM as a purchase record, automatically linking to the
              customer&apos;s loyalty profile — so each purchase also adds stamps to their digital loyalty card, triggering
              repeat visits.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-14 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-10">
              Why Indian Shop Owners Switch to CustomerPilot Billing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: "⚡", title: "Bill in 10 Seconds", desc: "Add items, enter quantities, and generate a professional PDF bill faster than any traditional billing software." },
                { icon: "📱", title: "Auto WhatsApp Delivery", desc: "Bill automatically delivered to customer's WhatsApp — they never lose paper receipts. Customer gets digital copy instantly." },
                { icon: "🧾", title: "GST-Compliant PDF", desc: "Every bill includes GSTIN, HSN codes, CGST/SGST breakup, and invoice number — fully compliant for Indian GST filing." },
                { icon: "📊", title: "Sales Reports & History", desc: "View daily/monthly sales totals, top-selling items, and customer purchase history from your dashboard." },
                { icon: "🔗", title: "Linked to Loyalty Program", desc: "Every bill automatically adds stamps to customer's digital loyalty card — drives repeat visits without extra effort." },
                { icon: "📱", title: "Works on Mobile", desc: "100% web-based — works on any Android or iPhone browser at your billing counter. No app download needed." }
              ].map((b) => (
                <div key={b.title} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200">
                  <span className="text-3xl">{b.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{b.title}</h3>
                    <p className="text-slate-600 text-sm">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* vs Competitors */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8">
              CustomerPilot Billing vs Other Options
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-3 text-left rounded-tl-lg">Feature</th>
                    <th className="p-3 text-center text-green-400">CustomerPilot</th>
                    <th className="p-3 text-center">Vyapar</th>
                    <th className="p-3 text-center rounded-tr-lg">Tally</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Annual Price", "₹799/year", "₹3,999/year", "₹7,500+/year"],
                    ["WhatsApp Auto-Send", "✅ Built-in", "❌ Manual share", "❌ No WhatsApp"],
                    ["Loyalty + CRM Bundled", "✅ Included", "❌ Not available", "❌ Not available"],
                    ["Works on Mobile Browser", "✅ Yes", "⚠️ App needed", "❌ Desktop only"],
                    ["GST PDF Invoice", "✅ Yes", "✅ Yes", "✅ Yes"],
                    ["Technical Setup", "✅ 5 min self-setup", "⚠️ 30-60 min", "❌ Expert needed"],
                  ].map(([feature, cp, vyapar, tally]) => (
                    <tr key={feature} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-700">{feature}</td>
                      <td className="p-3 text-center font-bold text-green-700">{cp}</td>
                      <td className="p-3 text-center text-slate-600">{vyapar}</td>
                      <td className="p-3 text-center text-slate-600">{tally}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-14 px-4 bg-blue-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              Billing Software Price — From ₹3/Day
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="text-sm font-bold text-slate-500 mb-1">6 MONTHS</div>
                <div className="text-4xl font-black text-slate-900 mb-1">₹549</div>
                <div className="text-sm text-slate-500 mb-4">POS Billing Module</div>
                <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
                  <li>✅ Unlimited bills & invoices</li>
                  <li>✅ WhatsApp auto-delivery</li>
                  <li>✅ GST-compliant PDF</li>
                  <li>✅ Sales reports</li>
                </ul>
                <Link href="/register" className="block bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition text-center">
                  Start Free Trial
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-md">
                <div className="text-sm font-bold text-blue-600 mb-1">1 YEAR — BEST VALUE</div>
                <div className="text-4xl font-black text-slate-900 mb-1">₹799</div>
                <div className="text-sm text-slate-500 mb-4">POS Billing Module</div>
                <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
                  <li>✅ Everything in 6-month plan</li>
                  <li>✅ Customer purchase history</li>
                  <li>✅ Linked loyalty stamps</li>
                  <li>✅ Monthly sales analytics</li>
                </ul>
                <Link href="/register" className="block bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition text-center">
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
                { q: "Is WhatsApp billing legal in India?", a: "Yes, completely legal. GST invoices sent digitally via WhatsApp are recognized by Indian tax authorities as long as they contain all mandatory fields (GSTIN, invoice number, HSN/SAC codes, tax breakup). CustomerPilot generates fully compliant PDF invoices." },
                { q: "Can I send GST invoices via WhatsApp?", a: "Yes! CustomerPilot generates GST-compliant PDF invoices with CGST/SGST/IGST breakup and automatically sends them to the customer's WhatsApp — perfectly legal and professional." },
                { q: "WhatsApp par PDF bill kaise bhejein?", a: "CustomerPilot billing dashboard mein items aur price enter karein, customer ka number add karein, aur 'Generate Bill' press karein. System automatically ek professional PDF bill WhatsApp par bhej deta hai." },
                { q: "How to make PDF bill on WhatsApp for my shop?", a: "Sign up for CustomerPilot, add your products/services with prices, enter customer's WhatsApp number at billing time, and click Generate. The system creates a branded GST-PDF and sends it via WhatsApp in seconds." },
                { q: "Does billing software work on my Android phone?", a: "Yes, 100% mobile-friendly. Works on any Android or iPhone browser — no app download needed. You can run your entire billing counter from a smartphone." }
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
        <section className="py-14 px-4 bg-blue-600 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              Go Paperless — Start Sending WhatsApp Bills Today
            </h2>
            <p className="text-blue-100 mb-8">
              Join 500+ Indian shop owners who send professional GST bills on WhatsApp in 10 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-blue-700 font-black py-3 px-8 rounded-xl hover:bg-blue-50 transition">
                Start Free Trial →
              </Link>
              <Link href="/dashboard/billing" className="border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition">
                Login to Billing →
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
                { label: "WhatsApp Loyalty Program", href: "/whatsapp-digital-loyalty-card" },
                { label: "AI Google Review Booster", href: "/ai-google-review-qr-generator" },
                { label: "Digital QR Menu", href: "/digital-qr-menu" },
                { label: "WhatsApp AI ChatBot", href: "/whatsapp-chatbot" },
                { label: "Pricing Plans", href: "/pricing" }
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-sm bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-lg transition">
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
