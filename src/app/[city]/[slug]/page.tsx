import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { generateMerchantGeoAeoSchema } from "@/components/seo/schema-injector";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Navigation,
  Utensils,
  Award
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

interface PageProps {
  params: Promise<{
    city: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const cleanCity = decodeURIComponent(city).trim();
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  // Find merchant
  const merchant = await db.merchant.findFirst({
    where: {
      OR: [
        { id: cleanSlug },
        { name: { contains: cleanSlug.replace(/-/g, " ") } },
        { city: { contains: cleanCity } }
      ]
    }
  });

  const businessName = merchant?.name || cleanSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const category = merchant?.category || "Bakery & Cake Shop";
  const locality = merchant?.city || cleanCity;

  const title = `${category} in ${locality} — ${businessName} | Official Store & Menu`;
  const description = `Visit ${businessName} in ${locality}, ${cleanCity}. Fresh artisan cakes, verified 4.6★ Google rating, online WhatsApp orders, and 1-hour doorstep delivery.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://customerpilot.in/${cleanCity.toLowerCase()}/${cleanSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://customerpilot.in/${cleanCity.toLowerCase()}/${cleanSlug}`,
      type: "website",
    },
  };
}

export default async function MerchantHyperLocalMicroPage({ params }: PageProps) {
  const { city, slug } = await params;
  const cleanCity = decodeURIComponent(city).trim();
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  // Locate merchant from DB or initialize default Cake Connection demo profile
  let merchant = await db.merchant.findFirst({
    where: {
      OR: [
        { id: cleanSlug },
        { name: { contains: "Cake Connection" } },
        { id: "cmtymavfx0002kx008lbfvp57" },
      ]
    },
    include: {
      merchantGoogleConnections: true,
      menuItems: { where: { isAvailable: true }, take: 6 }
    }
  });

  // Default display fallbacks
  const businessName = merchant?.name || "Cake Connection — Live Cake & Bakery";
  const primaryCategory = merchant?.category || "Cake shop / Bakery";
  const locality = "Manjalpur";
  const displayCity = merchant?.city || cleanCity || "Vadodara";
  const address = merchant?.address || "Shop No. 7, Ground Floor, Eva The Mall, Manjalpur, Vadodara, Gujarat 390011";
  const phone = merchant?.whatsappPhone || "917203824012";
  const rating = merchant?.baselineRating || 4.6;
  const reviewCount = merchant?.baselineReviewCount || 688;

  const landmarks = [
    "Eva The Mall, Manjalpur (0.0 km)",
    "Bird Circle, OP Road (1.8 km)",
    "Makarpura Industrial Hub (2.4 km)",
    "Akota Bridge & Alkapuri (3.1 km)"
  ];

  const services = merchant?.menuItems && merchant.menuItems.length > 0
    ? merchant.menuItems.map(item => ({
        name: item.name,
        keywordRichDescription: item.description || `Freshly prepared ${item.name} in ${locality}, ${displayCity}.`,
        price: item.price
      }))
    : [
        {
          name: "Fresh Belgian Chocolate Truffle Cake (500g)",
          keywordRichDescription: "100% Pure Eggless Belgian Chocolate Truffle with rich dark cocoa ganache drip.",
          price: 650
        },
        {
          name: "Deluxe Rasmalai & Belgian Fusion Birthday Cake (1kg)",
          keywordRichDescription: "Artisanal fusion cake with tender rasmalai dumplings, pistachios, rose petals, and gold foil.",
          price: 1250
        },
        {
          name: "Gourmet Chocolate Walnut Brownies",
          keywordRichDescription: "Fudgy chocolate brownie slice loaded with crunchy toasted walnuts.",
          price: 150
        }
      ];

  const faqs = [
    {
      question: `Where is ${businessName} located in ${displayCity}?`,
      answer: `${businessName} is located at ${address}, right inside ${landmarks[0]}. Easy parking and quick pickup available.`
    },
    {
      question: `Does ${businessName} prepare 100% pure eggless cakes?`,
      answer: `Yes, all our celebration cakes, pastries, and brownies are prepared 100% pure vegetarian and eggless.`
    },
    {
      question: `How fast can I get a custom cake delivered in ${locality}?`,
      answer: `We offer urgent 30 to 60-minute express doorstep delivery across ${locality} and surrounding areas in ${displayCity}.`
    },
    {
      question: `How can I order and claim loyalty stamps?`,
      answer: `Click the WhatsApp Order button on this page. Every order automatically earns you CustomerPilot Digital Loyalty Stamps for free rewards!`
    }
  ];

  const schemaJson = generateMerchantGeoAeoSchema({
    businessName,
    slug: cleanSlug,
    city: displayCity,
    locality,
    streetAddress: address,
    phone,
    primaryCategory,
    nearbyLandmarks: landmarks,
    services,
    aeoFaqs: faqs
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* 1. Injected Schema LD+JSON */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      {/* 2. Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="no-underline">
              <BrandLogo variant="dark" size="sm" />
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Verified Local Shop
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${phone}?text=Hi%20${encodeURIComponent(businessName)},%20I%20am%20ordering%20from%20your%20CustomerPilot%20Store!`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 no-underline"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Order</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-300 capitalize">{displayCity}</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-cyan-400">{locality}</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-white font-semibold truncate">{businessName.split("-")[0]}</span>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full space-y-8">
        
        {/* 4. Hyper-Local SEO H1 Hero Card */}
        <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {primaryCategory}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {rating} ★ ({reviewCount}+ Google Reviews)
                </span>
              </div>

              {/* Exact SEO H1 */}
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                {primaryCategory.split("/")[0].trim()} in {locality}, {displayCity} — {businessName.split("-")[0].trim()}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{address}</span>
              </p>

              {/* 500m Geo-Landmarks Narrative */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 max-w-2xl leading-relaxed">
                <strong className="text-cyan-300">Geo-Entity Location:</strong> Conveniently located 2 minutes from <em>Eva The Mall</em> in Manjalpur, with direct road connectivity to <em>Bird Circle</em>, <em>Makarpura GIDC</em>, and <em>Old Padra Road</em>.
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
              <a
                href={`https://wa.me/${phone}?text=Hi%20${encodeURIComponent(businessName)},%20I%20want%20to%20order%20a%20fresh%20cake!`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 no-underline"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Order on WhatsApp</span>
              </a>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(businessName + " " + address)}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 no-underline transition"
              >
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span>Get Directions (Google Maps)</span>
              </a>
            </div>
          </div>
        </section>

        {/* 5. Menu & Services Catalog */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-black text-white">Popular Menu &amp; Best-Sellers</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">100% Pure Eggless</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      ₹{item.price}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.keywordRichDescription}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> +1 Stamp Reward
                  </span>
                  <a
                    href={`https://wa.me/${phone}?text=Hi,%20I%20want%20to%20order:%20${encodeURIComponent(item.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 no-underline"
                  >
                    <span>Order Now</span>
                    <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. AEO Voice Search FAQs */}
        <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-black text-white">Frequently Asked Questions (AEO)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {faqs.map((faq, fIdx) => (
              <div key={fIdx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-cyan-300">
                  {faq.question}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Nearby Service Areas & Citations */}
        <section className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Service Areas Covered:</strong> Manjalpur, Makarpura, Tarsali, Atladra, Old Padra Road, Alkapuri &amp; Akota.
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Powered by CustomerPilot RankPilot AI™
          </div>
        </section>

      </main>

      {/* 8. Footer */}
      <footer className="mt-12 py-6 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-500">
        <p>© 2026 {businessName}. All rights reserved. Verified by CustomerPilot.</p>
      </footer>
    </div>
  );
}
