import type { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "Website for Small Business India — WhatsApp + E-Commerce Builder | CustomerPilot",
  description:
    "Get a professional mini website for your small business in India with WhatsApp ordering and e-commerce in 24 hours. Ideal for bakeries, salons, restaurants, and retail shops. No coding required.",
  keywords: [
    "mini website for small business india",
    "whatsapp store website builder",
    "ecommerce website for bakery salon india",
    "local business website with whatsapp ordering",
    "small business website builder india free",
    "website for shop owner india",
    "business website without coding india",
    "online store for small business india",
    "simple website builder for indian shops",
    "affordable website for small business india"
  ],
  alternates: {
    canonical: "https://customerpilot.in/small-business-website-builder"
  },
  openGraph: {
    title: "Website for Small Business India — WhatsApp + E-Commerce | CustomerPilot",
    description:
      "Get a professional mini website with WhatsApp ordering and e-commerce for your Indian small business in 24 hours. No coding required.",
    url: "https://customerpilot.in/small-business-website-builder",
    type: "website"
  }
}

const WEBSITE_BUILDER_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot Small Business Website Builder",
      "operatingSystem": "All (Web Browser)",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "799",
        "priceCurrency": "INR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "799",
          "priceCurrency": "INR",
          "unitText": "1 Year"
        }
      },
      "description": "Professional mini website builder for Indian small businesses (bakeries, salons, restaurants, retail shops) with integrated WhatsApp ordering, digital menu, Google Reviews, and e-commerce features — ready in 24 hours without any coding."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a mini website for small business in India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A mini website for Indian small businesses is a lightweight, mobile-optimized web page that shows your business name, services/menu, photos, pricing, location, and contact options (WhatsApp, phone, Google Maps). Unlike heavy e-commerce sites, a mini website loads in under 2 seconds on any smartphone, works without an app, and can be shared via WhatsApp or Instagram bio link. CustomerPilot builds and hosts this for you in 24 hours."
          }
        },
        {
          "@type": "Question",
          "name": "Apni dukan ke liye website kaise banaye bina coding ke?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot par signup karein aur apni business details bharen — dukan ka naam, photo, services/menu, aur contact number. Humari team 24 ghante mein aapka professional mini website ready kar deti hai jisme WhatsApp order button, Google Reviews, aur digital menu shamil hote hain. Koi coding ya technical knowledge nahi chahiye."
          }
        },
        {
          "@type": "Question",
          "name": "Can my bakery or salon sell online through the website?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! CustomerPilot's mini website includes integrated WhatsApp ordering — customers browse your products (cakes, services, menu items) and click 'Order on WhatsApp' to place orders directly. For bakeries, you can display cake designs with prices. For salons, customers can book appointments via WhatsApp. Full e-commerce with payment integration is available on higher plans."
          }
        },
        {
          "@type": "Question",
          "name": "How much does a small business website cost in India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot's mini website starts at ₹799 per year (₹2.2/day) — this includes hosting, domain setup, WhatsApp ordering, digital menu, Google Reviews section, and ongoing updates. Traditional web agencies charge ₹10,000–₹50,000 for a basic website without WhatsApp integration. CustomerPilot is specifically designed for Indian small business budgets."
          }
        },
        {
          "@type": "Question",
          "name": "Will the website rank on Google for my local area?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Every CustomerPilot mini website is built with Local SEO best practices — your business name, city (e.g. 'Cake shop in Vadodara'), and service keywords are embedded in the page title, description, and schema markup. We also link your website to your Google Business Profile, which boosts your Google Maps ranking and helps you appear in 'Near Me' searches."
          }
        },
        {
          "@type": "Question",
          "name": "How fast will my mini website be ready?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Your professional mini website is ready within 24 hours of providing your business details and photos. You'll receive a shareable link you can immediately add to your Instagram bio, WhatsApp status, and Google Business Profile."
          }
        }
      ]
    }
  ]
}

export default function SmallBusinessWebsiteBuilderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_BUILDER_SCHEMA) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Services", url: "https://customerpilot.in/services" },
          { name: "Small Business Website Builder", url: "https://customerpilot.in/small-business-website-builder" }
        ]}
      />

      <div className="min-h-screen bg-white text-slate-900 font-sans">
        {/* Hero */}
        <section className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
              🌐 Ready in 24 Hours · WhatsApp Orders · No Coding
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
              Mini Website Builder for Indian Shops —<br />
              <span className="text-purple-600">Sell Online via WhatsApp in 24 Hours</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Get a professional business website for your bakery, salon, restaurant, or retail shop in India —
              with WhatsApp ordering, digital menu, Google Reviews, and local SEO. Ready in 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-purple-700 transition text-center">
                Get My Website in 24 Hours →
              </Link>
              <Link href="/pricing" className="border-2 border-purple-600 text-purple-700 font-bold py-3 px-8 rounded-xl hover:bg-purple-50 transition text-center">
                View Pricing (from ₹2.2/day)
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">No coding needed · Mobile-optimized · Google SEO ready</p>
          </div>
        </section>

        {/* What is Mini Website */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              What is a Mini Website for Small Business?
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              A <strong>mini website for small business</strong> is a professional, mobile-optimized web page that
              showcases your business — products, services, photos, pricing, location, and contact options. Unlike
              complex e-commerce platforms, a mini website loads in under 2 seconds on any Indian smartphone,
              requires no app download, and can be shared instantly via WhatsApp status or Instagram bio.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              CustomerPilot builds and hosts your mini website in 24 hours with <strong>WhatsApp ordering built-in</strong>
              — so customers who discover you online can place orders directly on WhatsApp without calling.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-14 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-10">
              Everything Your Business Website Needs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: "🌐", title: "Professional Business Page", desc: "Your shop name, logo, services/menu, photos, pricing, and business hours displayed beautifully on mobile." },
                { icon: "💬", title: "WhatsApp Order Button", desc: "1-tap WhatsApp ordering on every product/service — customers order directly without calling." },
                { icon: "📋", title: "Digital Menu Integration", desc: "Full digital menu with photos integrated into your website — browse, choose, and WhatsApp order in one flow." },
                { icon: "⭐", title: "Google Reviews Section", desc: "Your best Google reviews showcased on the website — builds instant trust for new visitors." },
                { icon: "📍", title: "Local SEO Optimized", desc: "Built with 'bakery in Vadodara' / 'salon near me' keywords embedded for Google Maps ranking boost." },
                { icon: "📱", title: "Instagram Bio Link Ready", desc: "One shareable link for your Instagram bio, WhatsApp status, and Google Business Profile — drives online traffic." }
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

        {/* Pricing */}
        <section className="py-14 px-4 bg-purple-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              Business Website Price in India — From ₹2.2/Day
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="text-sm font-bold text-slate-500 mb-1">6 MONTHS</div>
                <div className="text-4xl font-black text-slate-900 mb-1">₹549</div>
                <div className="text-sm text-slate-500 mb-4">Business Website Module</div>
                <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
                  <li>✅ Professional mini website</li>
                  <li>✅ WhatsApp order button</li>
                  <li>✅ Digital menu integration</li>
                  <li>✅ Mobile-optimized design</li>
                </ul>
                <Link href="/contact" className="block bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition text-center">
                  Get Started
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-500 shadow-md">
                <div className="text-sm font-bold text-purple-600 mb-1">1 YEAR — BEST VALUE</div>
                <div className="text-4xl font-black text-slate-900 mb-1">₹799</div>
                <div className="text-sm text-slate-500 mb-4">Business Website Module</div>
                <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
                  <li>✅ Everything in 6-month plan</li>
                  <li>✅ Google Reviews showcase</li>
                  <li>✅ Local SEO optimization</li>
                  <li>✅ Instagram bio link</li>
                </ul>
                <Link href="/contact" className="block bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition text-center">
                  Get Started
                </Link>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4">
              Compared to: Web agencies charge ₹10,000–₹50,000 for a basic website without WhatsApp integration.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {[
                { q: "What is a mini website for small business in India?", a: "A mini website is a professional, mobile-optimized web page showing your business info, services, menu, photos, and WhatsApp ordering — loadable in 2 seconds on any smartphone. Perfect for Indian shops that want an online presence without complex e-commerce setups." },
                { q: "Dukan ke liye website bina coding ke kaise banaye?", a: "CustomerPilot se contact karein aur apni dukan ki details dein (naam, photos, services, pricing). Humari team 24 ghante mein aapka professional website ready kar deti hai — koi coding ya technical knowledge nahi chahiye." },
                { q: "Can my bakery sell cakes online through this website?", a: "Yes! Your mini website includes a product gallery with photos and prices, plus a WhatsApp order button on each item. Customers browse your cake designs and order directly on WhatsApp in 1 tap." },
                { q: "How much does a small business website cost in India?", a: "CustomerPilot's business website starts at ₹549 for 6 months (₹3/day) or ₹799 for 1 year (₹2.2/day) — far more affordable than any web agency, and includes WhatsApp ordering, digital menu, and local SEO." },
                { q: "Will my website appear on Google for my city?", a: "Yes! Every website is built with local SEO keywords (your business type + city name) so you appear in 'bakery in Vadodara' or 'salon near me' searches. We also link your website to your Google Business Profile for maximum Google Maps ranking impact." }
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
        <section className="py-14 px-4 bg-purple-600 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              Your Business Deserves an Online Presence
            </h2>
            <p className="text-purple-100 mb-8">
              Join 500+ Indian shop owners with professional mini websites. Ready in 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-white text-purple-700 font-black py-3 px-8 rounded-xl hover:bg-purple-50 transition">
                Get My Website Now →
              </Link>
              <Link href="/pricing" className="border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-purple-700 transition">
                See Pricing
              </Link>
            </div>
            <p className="text-purple-200 text-sm mt-4">Serving shops in Vadodara, Mumbai, Delhi, Pune, Ahmedabad, Surat</p>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-4 text-sm">Explore More CustomerPilot Services</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "AI Google Review Booster", href: "/ai-google-review-qr-generator" },
                { label: "WhatsApp AI ChatBot", href: "/whatsapp-chatbot" },
                { label: "Digital QR Menu", href: "/digital-qr-menu" },
                { label: "WhatsApp Loyalty Program", href: "/whatsapp-digital-loyalty-card" },
                { label: "Google Business Profile Ranking", href: "/google-business-profile-ranking" },
                { label: "Pricing Plans", href: "/pricing" }
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-sm bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 px-3 py-1.5 rounded-lg transition">
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
