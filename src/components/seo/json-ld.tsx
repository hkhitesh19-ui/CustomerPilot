import React from "react"

export function SoftwareApplicationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://customerpilot.in/#software",
    "name": "CustomerPilot Complete",
    "operatingSystem": "All (Web + WhatsApp)",
    "applicationCategory": "BusinessApplication",
    "description": "CustomerPilot is an all-in-one customer retention platform for Indian retail: WhatsApp Digital Loyalty Stamp Cards, Smart AI Google Reviews, AI Owner Auto-Reply, and Smart Digital Business Cards.",
    "offers": {
      "@type": "Offer",
      "price": "2249",
      "priceCurrency": "INR",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock"
    },
    "hasPart": [
      {
        "@type": "SoftwareApplication",
        "name": "Smart Digital Business Card",
        "url": "https://customerpilot.in/smart-digital-business-card",
        "description": "Smart QR-powered digital business card with 1-tap contact saving, ordering links, and real-time analytics for Indian businesses."
      },
      {
        "@type": "SoftwareApplication",
        "name": "WhatsApp Digital Loyalty Stamp Card",
        "url": "https://customerpilot.in/whatsapp-digital-loyalty-card",
        "description": "Digital loyalty stamp card via WhatsApp for retail repeat customers. Replaces paper punch cards with automated WhatsApp stamps, win-back campaigns and reward redemption."
      },
      {
        "@type": "SoftwareApplication",
        "name": "Smart AI Google Review",
        "url": "https://customerpilot.in/smart-ai-google-review",
        "description": "AI-powered automated Google review generation using smart QR codes. Generative AI drafts personalized 5-star reviews for customers, eliminating typing effort with private negative feedback filtering."
      },
      {
        "@type": "SoftwareApplication",
        "name": "Smart Ai Google Review QR",
        "url": "https://customerpilot.in/ai-google-review-qr-generator",
        "description": "CustomerPilot Smart Ai Google Review System with high-resolution counter QR code for retail billing counters. Triggers automatic WhatsApp-based review generation on scan."
      },
      {
        "@type": "SoftwareApplication",
        "name": "AI Google Review Auto-Reply",
        "url": "https://customerpilot.in/ai-google-review-autoreply",
        "description": "Gemini AI-powered auto-responder for Google Business Profile reviews. Automatically generates professional, empathetic owner replies to all reviews."
      },
      {
        "@type": "WebApplication",
        "name": "Free AI Google Review Generator",
        "url": "https://customerpilot.in/free-ai-google-review-generator",
        "description": "Free tool to generate 3 AI-crafted 5-star Google review variations for any retail store, bakery, dental clinic, cafe or salon in seconds."
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CustomerPilot Inc.",
    "url": "https://customerpilot.in",
    "logo": "https://customerpilot.in/cplogo_horizontal.png",
    "sameAs": [
      "https://twitter.com/customerpilot",
      "https://linkedin.com/company/customerpilot"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@customerpilot.in",
      "contactType": "customer service"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQPageJsonLd({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  )
}
