import type { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
  title: "WhatsApp AI ChatBot for Small Business India — 24/7 Auto Reply | CustomerPilot",
  description:
    "Deploy a 24/7 WhatsApp AI ChatBot for your shop in minutes. Auto-reply customer inquiries, take orders, send menus, and confirm bookings on WhatsApp — no coding needed. Trusted by 500+ Indian retailers.",
  keywords: [
    "whatsapp chatbot for small business india",
    "whatsapp auto reply bot for shop",
    "whatsapp order taking bot for bakery restaurant",
    "24/7 whatsapp customer reply bot",
    "whatsapp chatbot without coding india",
    "whatsapp business auto reply software",
    "whatsapp bot for cafe bakery salon india",
    "automated whatsapp replies for retail shop",
    "whatsapp inquiry bot india",
    "whatsapp chatbot price india"
  ],
  alternates: {
    canonical: "https://customerpilot.in/whatsapp-chatbot"
  },
  openGraph: {
    title: "WhatsApp AI ChatBot for Small Business India | CustomerPilot",
    description:
      "24/7 WhatsApp AI ChatBot — auto-reply orders, inquiries & menus for Indian retail shops, cafes, and bakeries. No coding. No app. Start free.",
    url: "https://customerpilot.in/whatsapp-chatbot",
    type: "website"
  }
}

const WHATSAPP_CHATBOT_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot WhatsApp AI ChatBot",
      "operatingSystem": "All (WhatsApp Web & Mobile)",
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
      "description": "24/7 WhatsApp AI ChatBot that auto-replies customer inquiries, takes orders, sends digital menus, and confirms bookings for Indian small businesses without any coding.",
      "featureList": [
        "24/7 Auto-reply to customer messages on WhatsApp",
        "Automated order taking and confirmation",
        "Digital menu delivery via WhatsApp",
        "Booking & appointment auto-confirmation",
        "Multi-language support (Hindi + English)",
        "Zero coding setup — live in 10 minutes"
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a WhatsApp ChatBot for small business?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A WhatsApp ChatBot is an AI-powered automated assistant that replies to customer messages on WhatsApp 24/7 without manual intervention. For Indian small businesses like bakeries, restaurants, salons, and retail shops, it auto-answers inquiries, takes orders, sends menus, and confirms bookings — even at midnight when the owner is asleep."
          }
        },
        {
          "@type": "Question",
          "name": "WhatsApp chatbot ki India mein kitni cost hoti hai?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot ka WhatsApp AI ChatBot sirf ₹549 / 6 mahine (₹3/din) mein milta hai, ya ₹799 / 1 saal (₹2.2/din) mein. Ismein unlimited auto-replies, digital menu delivery, aur order confirmation shamil hai. Koi coding nahi chahiye, koi app download nahi."
          }
        },
        {
          "@type": "Question",
          "name": "Can a WhatsApp bot automatically take orders for my bakery or restaurant?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! CustomerPilot's WhatsApp AI ChatBot can automatically receive customer orders, send your digital menu, confirm the order details, and even forward the order summary to you via WhatsApp. It handles common queries like 'What's today's special?', 'What time do you open?', and 'Is home delivery available?' — all without any staff involvement."
          }
        },
        {
          "@type": "Question",
          "name": "Does the WhatsApp chatbot work without coding or technical knowledge?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. CustomerPilot's WhatsApp ChatBot is designed for Indian shop owners with zero technical background. You simply fill in your business hours, menu items, and FAQs in a simple dashboard form — the system automatically configures the bot and links it to your WhatsApp Business number within 10 minutes."
          }
        },
        {
          "@type": "Question",
          "name": "Is WhatsApp business automation legal in India under Meta's policies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, CustomerPilot uses Meta's official WhatsApp Business API (Cloud API) which is 100% compliant with WhatsApp's terms of service. We do not use unofficial or grey-market WhatsApp bulk tools. Your business number is officially registered and protected from bans."
          }
        },
        {
          "@type": "Question",
          "name": "How is CustomerPilot WhatsApp ChatBot different from just using WhatsApp Business App?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "WhatsApp Business App only allows basic away messages and quick replies. CustomerPilot's AI ChatBot uses generative AI to understand natural language customer questions, dynamically send your digital menu, process orders intelligently, and even cross-sell products — operating 24/7 without you being online. It's the difference between a paper notice board and a smart receptionist."
          }
        }
      ]
    }
  ]
}

export default function WhatsAppChatbotPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WHATSAPP_CHATBOT_SCHEMA) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://customerpilot.in" },
          { name: "Services", url: "https://customerpilot.in/services" },
          { name: "WhatsApp AI ChatBot", url: "https://customerpilot.in/whatsapp-chatbot" }
        ]}
      />

      <div className="min-h-screen bg-white text-slate-900 font-sans">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
              🤖 AI-Powered · WhatsApp Official API · No Coding
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
              24/7 WhatsApp AI ChatBot for Local Shops —<br />
              <span className="text-green-600">Auto-Reply Orders &amp; Inquiries</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Deploy a smart WhatsApp bot for your bakery, restaurant, salon, or retail shop in India.
              Auto-answer customer questions, send digital menus, and confirm orders — even when you&apos;re asleep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition text-center"
              >
                Start Free 3-Day Trial →
              </Link>
              <Link
                href="/pricing"
                className="border-2 border-green-600 text-green-700 font-bold py-3 px-8 rounded-xl hover:bg-green-50 transition text-center"
              >
                See Pricing (from ₹3/day)
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">No credit card · No app · Live in 10 minutes</p>
          </div>
        </section>

        {/* What is WhatsApp ChatBot */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              What is a WhatsApp AI ChatBot for Small Business?
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              A <strong>WhatsApp AI ChatBot</strong> is an intelligent automated assistant that connects to your
              WhatsApp Business number and replies to customer messages <strong>24/7</strong> — without you needing
              to be online. For Indian shop owners (bakeries, restaurants, salons, cafes, retail), it handles order
              inquiries, sends your menu, answers common questions like opening hours and pricing, and even
              confirms bookings automatically.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              CustomerPilot&apos;s WhatsApp AI ChatBot uses <strong>Gemini AI</strong> to understand natural language,
              so customers can ask in Hindi, English, or Hinglish and always get a helpful, instant reply.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-14 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-10">
              How It Works — 3 Simple Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Setup in 10 Minutes", desc: "Fill in your business name, hours, menu, and FAQs in CustomerPilot dashboard. Connect your WhatsApp Business number via official Meta API." },
                { step: "2", title: "Bot Replies 24/7", desc: "Every customer message on WhatsApp gets an instant, intelligent reply — orders confirmed, menus sent, inquiries answered — even at midnight." },
                { step: "3", title: "You Stay Informed", desc: "Receive daily summary of all customer conversations, orders taken, and unanswered queries directly on your personal WhatsApp." }
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-black text-lg mb-4">{item.step}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center mb-10">
              Why Indian Shop Owners Choose CustomerPilot WhatsApp Bot
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: "🕐", title: "24/7 Auto-Reply", desc: "Never miss a customer inquiry — bot works nights, weekends, and holidays automatically." },
                { icon: "📋", title: "Auto Digital Menu Delivery", desc: "Customer types 'menu' — bot instantly sends your full digital menu with photos and prices." },
                { icon: "🛒", title: "Order Taking & Confirmation", desc: "Bot collects order details, confirms with the customer, and alerts you on WhatsApp instantly." },
                { icon: "🗣️", title: "Hindi + English Support", desc: "Understands Hinglish naturally — 'Cake ka price kya hai?' gets an instant, accurate reply." },
                { icon: "🔒", title: "Official Meta API — Zero Ban Risk", desc: "Uses WhatsApp's official Business Cloud API — 100% compliant, no grey-market tools." },
                { icon: "📈", title: "Increases Conversions by 3X", desc: "Instant replies mean customers don't go to competitors — convert inquiries to orders immediately." }
              ].map((b) => (
                <div key={b.title} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
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
        <section className="py-14 px-4 bg-green-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              WhatsApp ChatBot Price in India — From ₹3/Day
            </h2>
            <p className="text-slate-600 mb-8">Affordable for every Indian shop owner. No hidden charges.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="text-sm font-bold text-slate-500 mb-1">6 MONTHS</div>
                <div className="text-4xl font-black text-slate-900 mb-1">₹549</div>
                <div className="text-sm text-slate-500 mb-4">≈ ₹3/day · WhatsApp ChatBot Module</div>
                <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
                  <li>✅ Unlimited auto-replies</li>
                  <li>✅ Digital menu delivery</li>
                  <li>✅ Order auto-confirmation</li>
                  <li>✅ Hindi + English support</li>
                </ul>
                <Link href="/register" className="block bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition text-center">
                  Start Free Trial
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 border-2 border-green-500 shadow-md">
                <div className="text-sm font-bold text-green-600 mb-1">1 YEAR — BEST VALUE</div>
                <div className="text-4xl font-black text-slate-900 mb-1">₹799</div>
                <div className="text-sm text-slate-500 mb-4">≈ ₹2.2/day · WhatsApp ChatBot Module</div>
                <ul className="text-sm text-slate-600 space-y-2 text-left mb-6">
                  <li>✅ Everything in 6-month plan</li>
                  <li>✅ AI-powered smart replies</li>
                  <li>✅ Booking auto-confirmation</li>
                  <li>✅ Daily conversation summary</li>
                </ul>
                <Link href="/register" className="block bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition text-center">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8">
              CustomerPilot WhatsApp Bot vs Alternatives
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-3 text-left rounded-tl-lg">Feature</th>
                    <th className="p-3 text-center text-green-400">CustomerPilot</th>
                    <th className="p-3 text-center">Interakt</th>
                    <th className="p-3 text-center rounded-tr-lg">Wati</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Starting Price / Month", "₹92/mo (₹549 /6mo)", "₹999/mo", "₹2,999/mo"],
                    ["AI-Generated Replies", "✅ Gemini AI", "❌ Template only", "❌ Template only"],
                    ["Loyalty + Reviews Bundled", "✅ All-in-one", "❌ Separate cost", "❌ Separate cost"],
                    ["India Hinglish Support", "✅ Native", "⚠️ Partial", "⚠️ Partial"],
                    ["Official Meta API", "✅ Yes", "✅ Yes", "✅ Yes"],
                    ["Setup Without Coding", "✅ 10 min", "⚠️ 2-4 hours", "⚠️ 2-4 hours"],
                  ].map(([feature, cp, interakt, wati]) => (
                    <tr key={feature} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-700">{feature}</td>
                      <td className="p-3 text-center font-bold text-green-700">{cp}</td>
                      <td className="p-3 text-center text-slate-600">{interakt}</td>
                      <td className="p-3 text-center text-slate-600">{wati}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 px-4 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-5">
              {[
                { q: "What is a WhatsApp ChatBot for small business?", a: "A WhatsApp AI ChatBot is an automated assistant that replies to customer messages on WhatsApp 24/7 — taking orders, sending menus, answering inquiries, and confirming bookings without any manual work from the shop owner." },
                { q: "WhatsApp bot ki India mein kitni cost hai?", a: "CustomerPilot ka WhatsApp AI ChatBot sirf ₹549 / 6 mahine (₹3/din) ya ₹799 / 1 saal (₹2.2/din) mein milta hai. Ye India ka sabse affordable official WhatsApp bot solution hai." },
                { q: "Can my bakery's WhatsApp bot take cake orders automatically?", a: "Yes! You set up your menu and order-taking flow in the CustomerPilot dashboard. When a customer says 'I want to order a cake', the bot shows your menu, collects order details (size, flavor, delivery date), confirms the total, and sends you an alert — all automatically." },
                { q: "Is this WhatsApp bot compliant with Meta's policies?", a: "100% yes. CustomerPilot uses Meta's official WhatsApp Business Cloud API. Your number is properly registered — no risk of banning or blocking unlike unofficial bulk WhatsApp tools." },
                { q: "How is this different from WhatsApp Business App's auto-reply?", a: "WhatsApp Business App only supports basic away messages. CustomerPilot's AI bot understands natural customer questions in Hinglish, dynamically sends menus, processes orders intelligently, and operates fully autonomously 24/7." }
              ].map((faq) => (
                <div key={faq.q} className="bg-white rounded-xl p-5 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2">Q: {faq.q}</h3>
                  <p className="text-slate-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 px-4 bg-green-600 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              Stop Losing Customers While You Sleep
            </h2>
            <p className="text-green-100 mb-8">
              Deploy your WhatsApp AI ChatBot today — 3-day free trial, no credit card, no coding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-green-700 font-black py-3 px-8 rounded-xl hover:bg-green-50 transition">
                Start Free Trial →
              </Link>
              <Link href="/contact" className="border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition">
                Talk to Us
              </Link>
            </div>
            <p className="text-green-200 text-sm mt-4">Serving 500+ Indian merchants · Vadodara, Mumbai, Delhi, Pune, Ahmedabad</p>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 px-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-slate-700 mb-4 text-sm">Explore More CustomerPilot Services</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "AI Google Review Booster", href: "/ai-google-review-qr-generator" },
                { label: "WhatsApp Loyalty Program", href: "/whatsapp-digital-loyalty-card" },
                { label: "Digital QR Menu", href: "/digital-qr-menu" },
                { label: "Google Business Profile Ranking", href: "/google-business-profile-ranking" },
                { label: "Free Review Generator", href: "/free-ai-google-review-generator" },
                { label: "Pricing Plans", href: "/pricing" }
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-sm bg-slate-100 hover:bg-green-50 text-slate-700 hover:text-green-700 px-3 py-1.5 rounded-lg transition">
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
