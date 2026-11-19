import type { Metadata } from "next"
import Link from "next/link"
import { 
  Mail, 
  ArrowLeft, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  Headphones,
  Building2,
  HelpCircle,
  QrCode
} from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us & Merchant Support — CustomerPilot",
  description: "Get in touch with CustomerPilot merchant support team. Direct WhatsApp desk, retail onboarding assistance, and enterprise B2B inquiries in Vadodara, Gujarat.",
  keywords: [
    "CustomerPilot contact",
    "CustomerPilot support",
    "CustomerPilot WhatsApp support",
    "retail customer retention software support",
    "Vadodara B2B SaaS",
    "Google Maps ranking support",
    "digital loyalty card support"
  ],
  alternates: {
    canonical: "https://customerpilot.in/contact",
  },
  openGraph: {
    title: "Contact CustomerPilot — Merchant Success & Support Desk",
    description: "Official support and contact portal for CustomerPilot retail merchants. 24/7 WhatsApp helpdesk and onboarding assistance.",
    url: "https://customerpilot.in/contact",
    siteName: "CustomerPilot",
    type: "website",
  },
}

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "CustomerPilot",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android",
        "url": "https://customerpilot.in",
        "offers": {
          "@type": "Offer",
          "price": "9000",
          "priceCurrency": "INR"
        }
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://customerpilot.in/#organization",
        "name": "CustomerPilot Technologies",
        "url": "https://customerpilot.in",
        "logo": "https://customerpilot.in/cplogo_horizontal.png",
        "image": "https://customerpilot.in/cplogo_horizontal.png",
        "telephone": "+919033304707",
        "email": "support@customerpilot.in",
        "priceRange": "₹₹",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Kalali Road",
          "addressLocality": "Vadodara",
          "addressRegion": "Gujarat",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "22.2850",
          "longitude": "73.1812"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday"
            ],
            "opens": "10:00",
            "closes": "19:00"
          }
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+919033304707",
          "contactType": "customer support",
          "areaServed": "IN",
          "availableLanguage": ["en", "hi", "gu"]
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I reach CustomerPilot Merchant Support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Merchants can reach CustomerPilot 24/7 via WhatsApp at +91 90333 04707 or email support@customerpilot.in. Our team assists with counter QR standees, WhatsApp automation, and Google review setups."
            }
          },
          {
            "@type": "Question",
            "name": "What are the official customer support hours for CustomerPilot?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our merchant engineering and customer response team is active Monday through Saturday, from 10:00 AM to 7:00 PM IST."
            }
          },
          {
            "@type": "Question",
            "name": "Where is CustomerPilot headquarters located?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "CustomerPilot headquarters is located on Kalali Road, Vadodara, Gujarat, India, powering autonomous customer retention SaaS for retail stores across India."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Inject Structured Data for SEO / GEO / AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center gap-2">
            <img src="/cplogo_horizontal.png" alt="CustomerPilot" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link href="/services" className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
              Explore 10 Services
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition shadow-sm">
              Start Free Trial →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12 flex-1 w-full">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Merchant Success Desk
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Get in Touch with CustomerPilot
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Whether you want to activate automated WhatsApp loyalty, accelerate 5-star Google Reviews, or deploy smart POS billing, our engineering team is here to help.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Card 1: WhatsApp Support */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                Fastest Response
              </span>
              <h2 className="font-extrabold text-slate-900 text-xl mt-1">24/7 WhatsApp Helpdesk</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Live cashier support, onboarding setup, and custom acrylic tabletop QR standee delivery inquiries for retail stores.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919033304707?text=Hi%20CustomerPilot%20Team%2C%20I%20need%20assistance%20with%20CustomerPilot%20software."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-95"
              >
                <MessageSquare className="w-4 h-4" /> Message +91 90333 04707
              </a>
            </div>
          </div>

          {/* Card 2: Operating Hours */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                Active Hours
              </span>
              <h2 className="font-extrabold text-slate-900 text-xl mt-1">Support Hours</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Our merchant onboarding specialists and technical engineers are live to serve your business:
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-sm font-bold text-slate-900">
                Monday – Saturday: 10:00 AM – 7:00 PM IST
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Sunday: Automated WhatsApp emergency routing active
              </div>
            </div>
          </div>

          {/* Card 3: Headquarters & Geo Location */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                Headquarters
              </span>
              <h2 className="font-extrabold text-slate-900 text-xl mt-1">Vadodara Technology Center</h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 font-semibold space-y-1">
              <p className="text-slate-900 font-bold">CustomerPilot Technologies</p>
              <p className="text-slate-600">Kalali Road, Vadodara, Gujarat, India 🇮🇳</p>
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              B2B Retail Automation &amp; AI Engineering: WhatsApp Customer Loyalty Engine, RankPilot™ Local SEO, and Cloud POS Architecture.
            </p>
          </div>

          {/* Card 4: Email & Direct Inquiries */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                Official Inquiries
              </span>
              <h2 className="font-extrabold text-slate-900 text-xl mt-1">Email &amp; Billing Support</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              For enterprise partnerships, custom feature requests, and tax invoicing queries:
            </p>
            <div className="pt-1">
              <a 
                href="mailto:support@customerpilot.in" 
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition inline-flex items-center gap-1.5"
              >
                support@customerpilot.in <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section for AEO (Answer Engine Optimization) */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Everything you need to know about CustomerPilot Support
          </h2>
          <div className="divide-y divide-slate-100 text-sm space-y-4 pt-2">
            <div className="pt-4 first:pt-0">
              <h3 className="font-bold text-slate-900 text-base">
                How fast does the merchant support team respond?
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed text-xs sm:text-sm">
                WhatsApp inquiries to +91 90333 04707 are typically answered within 5 to 15 minutes during business hours (Monday – Saturday: 10:00 AM – 7:00 PM IST). Emergency cashier checkout issues receive immediate priority.
              </p>
            </div>
            <div className="pt-4">
              <h3 className="font-bold text-slate-900 text-base">
                How do I receive my physical acrylic counter standees?
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed text-xs sm:text-sm">
                Once onboarded, your custom acrylic standees and QR counter badges are printed with your brand logo and shipped via express courier directly to your shop address across India.
              </p>
            </div>
            <div className="pt-4">
              <h3 className="font-bold text-slate-900 text-base">
                Can I request a live 1-on-1 walkthrough for my staff?
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed text-xs sm:text-sm">
                Yes. Our merchant onboarding team offers free 15-minute live screen share or video sessions to train your counter staff on WhatsApp stamp approvals, POS billing, and Google Review standee placements.
              </p>
            </div>
          </div>
        </section>

        {/* Quick CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to turn walk-ins into repeat lifetime customers?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Join hundreds of retail merchants using CustomerPilot to automate their loyalty rewards and Google Maps reviews.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link 
              href="/signup" 
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg transition active:scale-95"
            >
              Start 3-Day Free Trial →
            </Link>
            <a 
              href="https://wa.me/919033304707?text=Hi%20CustomerPilot%2C%20I%20would%20like%20a%20quick%20demo."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Technologies · Kalali Road, Vadodara, Gujarat · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-900 transition">Security</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
