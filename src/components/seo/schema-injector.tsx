/**
 * src/components/seo/schema-injector.tsx
 * 
 * CustomerPilot — Next.js SSR Micro-Page & GEO/AEO Schema Generator
 * Reference: RankPilot AI™ Master Playbook Section 4.2 & Engine 1 (Page 11)
 * 
 * Injects a unified @graph with:
 * 1. LocalBusiness Schema (with GeoCoordinates, areaServed landmarks, sameAs citations)
 * 2. FAQPage Schema (with 10 conversational AEO Q&A pairs for voice search)
 * 3. OfferCatalog Schema (with priced services and menu items)
 */

export interface MerchantSchemaInput {
  businessName: string;
  slug: string;
  city: string;
  locality: string;
  streetAddress?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  primaryCategory?: string;
  priceRange?: string;
  aiOptimizedDescription?: string;
  nearbyLandmarks?: string[];
  citationUrls?: string[];
  services?: Array<{
    name: string;
    keywordRichDescription: string;
    price: number;
  }>;
  aeoFaqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export function generateMerchantGeoAeoSchema(merchant: MerchantSchemaInput) {
  const city = merchant.city || "Vadodara";
  const locality = merchant.locality || "Manjalpur";
  const primaryCat = merchant.primaryCategory || "Bakery";
  const landmarks = merchant.nearbyLandmarks || [
    "Eva The Mall",
    "Bird Circle",
    "Old Padra Road",
    "Akota Bridge"
  ];

  const citations = merchant.citationUrls || [
    `https://maps.google.com/?q=${encodeURIComponent(merchant.businessName + " " + city)}`,
    "https://www.justdial.com",
    "https://www.zomato.com"
  ];

  const services = merchant.services || [
    {
      name: "Fresh Belgian Chocolate Truffle Cake",
      keywordRichDescription: `100% Pure Eggless Belgian Chocolate Truffle Cake baked fresh daily in ${locality}, ${city}.`,
      price: 650
    },
    {
      name: "Custom Birthday & Anniversary Cake",
      keywordRichDescription: `Artisanal designer celebration cakes crafted in ${locality} with urgent 1-hour delivery.`,
      price: 850
    },
    {
      name: "Gourmet Walnut Brownies",
      keywordRichDescription: `Rich, fudgy chocolate walnut brownies baked fresh at ${merchant.businessName}.`,
      price: 150
    }
  ];

  const faqs = merchant.aeoFaqs || [
    {
      question: `Where is ${merchant.businessName} located in ${city}?`,
      answer: `${merchant.businessName} is conveniently located in ${locality}, ${city}, just 2 minutes from ${landmarks[0]}.`
    },
    {
      question: `Does ${merchant.businessName} offer 100% pure eggless options in ${locality}?`,
      answer: `Yes, ${merchant.businessName} provides 100% pure vegetarian and eggless specialties prepared with strict hygiene standards.`
    },
    {
      question: `Can I place an urgent order for cake delivery in ${locality}?`,
      answer: `Yes! You can order directly on WhatsApp for same-day urgent pickup or doorstep delivery within 30 to 60 minutes across ${city}.`
    },
    {
      question: `What are the popular best-selling items at ${merchant.businessName}?`,
      answer: `Best-sellers include the Fresh Belgian Chocolate Truffle Cake, Rasmalai Celebration Cake, and Gourmet Chocolate Walnut Brownies.`
    },
    {
      question: `What are the operating hours of ${merchant.businessName}?`,
      answer: `We are open 7 days a week from 10:00 AM to 11:00 PM for dine-in, takeaway, and online WhatsApp orders.`
    }
  ];

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `https://customerpilot.in/${city.toLowerCase()}/${merchant.slug}#business`,
        "name": merchant.businessName,
        "description": merchant.aiOptimizedDescription || `${merchant.businessName} is a top-rated ${primaryCat} in ${locality}, ${city} known for authentic quality, quick service, and verified Google reviews.`,
        "url": `https://customerpilot.in/${city.toLowerCase()}/${merchant.slug}`,
        "telephone": merchant.phone || "+917203824012",
        "priceRange": merchant.priceRange || "₹₹",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": merchant.streetAddress || `${locality}, ${city}`,
          "addressLocality": locality,
          "addressRegion": merchant.state || "Gujarat",
          "postalCode": merchant.pincode || "390011",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": merchant.latitude || 22.2736,
          "longitude": merchant.longitude || 73.1885
        },
        "areaServed": landmarks.map((landmark: string) => ({
          "@type": "Place",
          "name": landmark
        })),
        "sameAs": citations,
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": `${primaryCat} Services & Menu in ${locality}`,
          "itemListElement": services.map((svc) => ({
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": svc.name,
              "description": svc.keywordRichDescription
            },
            "price": svc.price,
            "priceCurrency": "INR"
          }))
        }
      },
      {
        "@type": "FAQPage",
        "@id": `https://customerpilot.in/${city.toLowerCase()}/${merchant.slug}#faq`,
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return schemaGraph;
}
